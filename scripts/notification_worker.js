#!/usr/bin/env node
/**
 * F1: Notification Worker
 * Processes pending notifications and sends via Telegram
 * Runs every 30s via cron
 * 
 * Choices: Telegram Bot | notifications table | UUID v5 | Cron 30s+worker
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Lock file to prevent parallel executions
const LOCK_FILE = path.join(__dirname, '.worker.lock');

// ============================================
// LOCK MANAGEMENT
// ============================================
function acquireLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const lockTime = fs.statSync(LOCK_FILE).mtime;
      const ageMs = Date.now() - lockTime.getTime();
      // If lock is older than 5 minutes, it's stale
      if (ageMs < 5 * 60 * 1000) {
        console.log(`[${new Date().toISOString()}] Worker already running (lock age: ${Math.floor(ageMs/1000)}s), exiting`);
        process.exit(0);
      }
      console.log(`[${new Date().toISOString()}] Stale lock detected (${Math.floor(ageMs/1000)}s), removing`);
      fs.unlinkSync(LOCK_FILE);
    }
    fs.writeFileSync(LOCK_FILE, process.pid.toString());
    return true;
  } catch (err) {
    console.error('Lock error:', err.message);
    return false;
  }
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (err) {
    // Ignore release errors
  }
}

// Config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const BATCH_SIZE = 50;  // Process max 50 notifications per run
const MAX_RETRIES = 5;
const RETRY_DELAYS = [0, 30000, 120000, 300000, 600000]; // 0s, 30s, 2min, 5min, 10min

// Init Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================
// MAIN WORKER LOOP
// ============================================
async function runWorker() {
  // Acquire lock to prevent parallel runs
  if (!acquireLock()) {
    process.exit(1);
  }
  
  console.log(`[${new Date().toISOString()}] F1 Worker starting...`);
  
  try {
    // Fetch pending notifications
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .in('status', ['pending', 'failed'])
      .or('next_retry_at.is.null,next_retry_at.lte.now()')
      .order('created_at', { ascending: true })
      .limit(BATCH_SIZE);
    
    if (error) {
      console.error('Failed to fetch notifications:', error.message);
      process.exit(1);
    }
    
    if (!notifications || notifications.length === 0) {
      console.log('No pending notifications');
      process.exit(0);
    }
    
    console.log(`Processing ${notifications.length} notifications...`);
    
    // Process each notification with lock
    for (const notif of notifications) {
      // Skip if already being processed (double-check)
      const { data: current } = await supabase
        .from('notifications')
        .select('status')
        .eq('id', notif.id)
        .single();
      
      if (current && current.status === 'sending') {
        console.log(`  Skipping #${notif.id} (already being processed)`);
        continue;
      }
      
      await processNotification(notif);
    }
    
    console.log(`[${new Date().toISOString()}] Worker completed`);
    
  } catch (err) {
    console.error('Worker error:', err.message);
    releaseLock();
    process.exit(1);
  }
  
  releaseLock();
}

// ============================================
// PROCESS SINGLE NOTIFICATION
// ============================================
async function processNotification(notif) {
  console.log(`  Processing #${notif.id} (${notif.type}) → ${notif.channel}`);
  
  // Mark as sending
  await supabase
    .from('notifications')
    .update({ 
      status: 'sending',
      attempts: notif.attempts + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', notif.id);
  
  try {
    // Route by channel
    let messageId = null;
    if (notif.channel === 'telegram') {
      messageId = await sendTelegram(notif);
    } else if (notif.channel === 'discord') {
      await sendDiscord(notif);
    } else if (notif.channel === 'email') {
      await sendEmail(notif);
    } else {
      throw new Error(`Unknown channel: ${notif.channel}`);
    }
    
    // Mark as sent (include message_id if available)
    const updateData = {
      status: 'sent',
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (messageId) {
      updateData.telegram_message_id = messageId;
    }
    
    await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', notif.id);
    
    console.log(`    ✅ Sent successfully`);
    
  } catch (err) {
    console.error(`    ❌ Failed: ${err.message}`);
    await handleFailure(notif, err.message);
  }
}

// ============================================
// TELEGRAM DELIVERY
// Returns: message_id (string) or null
// ============================================
async function sendTelegram(notif) {
  // Skip if already sent (idempotence check)
  if (notif.telegram_message_id) {
    console.log(`    ⚠️  Already sent (msg_id: ${notif.telegram_message_id}), skipping`);
    return notif.telegram_message_id;
  }
  
  // Get user's channel config
  const { data: pref } = await supabase
    .from('notification_preferences')
    .select('channel_config')
    .eq('user_id', notif.user_id)
    .single();
  
  if (!pref || !pref.channel_config?.telegram_chat_id) {
    throw new Error('No Telegram chat_id configured for user');
  }
  
  const chatId = pref.channel_config.telegram_chat_id;
  
  // Build message with "Why did I get this?" footer
  const whyLink = 'https://pulseprotocol.co/settings/notifications';
  const message = `${notif.title}

${notif.body}

${notif.url ? `📎 ${notif.url}` : ''}

─────────────────
💡 Why did I get this? ${whyLink}
🔕 Disable: Reply /stop`;

  // Send via Telegram API
  const response = await axios.post(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: false
    }
  );
  
  if (!response.data.ok) {
    throw new Error(`Telegram API error: ${response.data.description}`);
  }
  
  return response.data.result.message_id.toString();
}

// ============================================
// DISCORD DELIVERY (webhook)
// ============================================
async function sendDiscord(notif) {
  const { data: pref } = await supabase
    .from('notification_preferences')
    .select('channel_config')
    .eq('user_id', notif.user_id)
    .single();
  
  if (!pref || !pref.channel_config?.discord_webhook) {
    throw new Error('No Discord webhook configured for user');
  }
  
  const webhookUrl = pref.channel_config.discord_webhook;
  
  const embed = {
    title: notif.title,
    description: notif.body,
    url: notif.url,
    color: getColorForType(notif.type),
    timestamp: new Date().toISOString(),
    footer: {
      text: 'PULSE Protocol • pulseprotocol.co/settings'
    }
  };
  
  await axios.post(webhookUrl, { embeds: [embed] });
}

function getColorForType(type) {
  const colors = {
    'EVENT_STATUS_CHANGE': 0x3498db,  // Blue
    'CHALLENGE_CREATED': 0xf39c12,    // Orange
    'CHALLENGE_RESOLVED': 0x2ecc71    // Green
  };
  return colors[type] || 0x95a5a6;
}

// ============================================
// EMAIL DELIVERY (placeholder)
// ============================================
async function sendEmail(notif) {
  // TODO: Integrate with email provider (SendGrid, Resend, etc.)
  // For now, mark as failed with specific error
  throw new Error('Email channel not yet implemented');
}

// ============================================
// FAILURE HANDLING & RETRY
// ============================================
async function handleFailure(notif, errorMessage) {
  const attempts = notif.attempts + 1;
  
  if (attempts >= MAX_RETRIES) {
    // Mark as permanently failed
    await supabase
      .from('notifications')
      .update({
        status: 'failed',
        last_error: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', notif.id);
    
    console.log(`    ⚠️  Max retries reached, marked as failed`);
    
  } else {
    // Schedule retry
    const delay = RETRY_DELAYS[attempts] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    const nextRetry = new Date(Date.now() + delay);
    
    await supabase
      .from('notifications')
      .update({
        status: 'failed',  // Will be picked up again based on next_retry_at
        last_error: errorMessage,
        next_retry_at: nextRetry.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', notif.id);
    
    console.log(`    🔄 Retry ${attempts}/${MAX_RETRIES} scheduled at ${nextRetry.toISOString()}`);
  }
}

// ============================================
// HEALTH CHECK
// ============================================
async function healthCheck() {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('attempts', MAX_RETRIES);
  
  if (error) {
    console.error('Health check failed:', error.message);
    return;
  }
  
  if (count > 100) {
    console.warn(`⚠️  Alert: ${count} permanently failed notifications`);
  }
}

// ============================================
// RUN
// ============================================
if (require.main === module) {
  // Cleanup on exit
  process.on('SIGINT', () => { releaseLock(); process.exit(0); });
  process.on('SIGTERM', () => { releaseLock(); process.exit(0); });
  
  runWorker().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Fatal error:', err);
    releaseLock();
    process.exit(1);
  });
}

module.exports = { runWorker };
