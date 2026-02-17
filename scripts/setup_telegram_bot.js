#!/usr/bin/env node
/**
 * Telegram Bot Setup Script for PULSE Protocol Notifications
 * Creates bot, sets webhook, and provides registration instructions
 * 
 * Usage: node scripts/setup_telegram_bot.js
 */

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const TELEGRAM_API = 'https://api.telegram.org/bot';

async function main() {
  console.log('🤖 PULSE Protocol Telegram Bot Setup\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  // Get bot token
  const token = await question('Enter your Telegram Bot Token (from @BotFather): ');
  
  if (!token || token.length < 20) {
    console.error('❌ Invalid token');
    process.exit(1);
  }
  
  // Verify bot
  console.log('\n🔍 Verifying bot...');
  try {
    const { data } = await axios.get(`${TELEGRAM_API}${token}/getMe`);
    if (!data.ok) {
      throw new Error(data.description);
    }
    console.log(`✅ Bot verified: @${data.result.username}`);
    console.log(`   Name: ${data.result.first_name}`);
  } catch (err) {
    console.error('❌ Failed to verify bot:', err.message);
    process.exit(1);
  }
  
  // Get webhook URL
  const webhookUrl = await question('\nEnter webhook URL (e.g., https://pulseprotocol.co/api/telegram-webhook): ');
  
  if (webhookUrl) {
    console.log('\n🔗 Setting webhook...');
    try {
      const { data } = await axios.post(`${TELEGRAM_API}${token}/setWebhook`, {
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query']
      });
      if (data.ok) {
        console.log('✅ Webhook set successfully');
      } else {
        console.error('❌ Failed:', data.description);
      }
    } catch (err) {
      console.error('❌ Error:', err.message);
    }
  }
  
  // Set commands
  console.log('\n📋 Setting bot commands...');
  try {
    const { data } = await axios.post(`${TELEGRAM_API}${token}/setMyCommands`, {
      commands: [
        { command: 'start', description: 'Register for PULSE notifications' },
        { command: 'stop', description: 'Disable all notifications' },
        { command: 'status', description: 'Check your notification settings' },
        { command: 'prefs', description: 'Manage notification preferences' },
        { command: 'help', description: 'Show help and information' }
      ]
    });
    if (data.ok) {
      console.log('✅ Commands set');
    }
  } catch (err) {
    console.error('⚠️  Could not set commands:', err.message);
  }
  
  // Generate .env snippet
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📄 Add this to your .env file:');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`TELEGRAM_BOT_TOKEN=${token}`);
  console.log(`TELEGRAM_WEBHOOK_URL=${webhookUrl || 'https://your-domain.com/api/telegram-webhook'}`);
  
  // Generate webhook handler snippet
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📄 Webhook Handler (Next.js API route):');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`// app/api/telegram-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  const update = await req.json();
  
  // Handle /start command
  if (update.message?.text === '/start') {
    const chatId = update.message.chat.id;
    const username = update.message.chat.username || 'User';
    
    // Return registration link with chat_id
    const registerUrl = \`https://pulseprotocol.co/settings/notifications?telegram=\${chatId}\`;
    
    await fetch(\`https://api.telegram.org/bot\${process.env.TELEGRAM_BOT_TOKEN}/sendMessage\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: \`Welcome to PULSE Protocol, \${username}! 👋\\n\\nClick to enable notifications:\\n\${registerUrl}\`,
        parse_mode: 'HTML'
      })
    });
  }
  
  // Handle /stop command
  if (update.message?.text === '/stop') {
    const chatId = update.message.chat.id;
    
    // Disable all notifications for this user
    const { error } = await supabase
      .from('notification_preferences')
      .update({
        event_status_change: false,
        challenge_created: false,
        challenge_resolved: false
      })
      .eq('channel_config->>telegram_chat_id', chatId.toString());
    
    await fetch(\`https://api.telegram.org/bot\${process.env.TELEGRAM_BOT_TOKEN}/sendMessage\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '✅ All notifications disabled.\\n\\nTo re-enable, visit: https://pulseprotocol.co/settings/notifications'
      })
    });
  }
  
  return NextResponse.json({ ok: true });
}`);
  
  console.log('\n✅ Setup complete!');
  console.log('\nNext steps:');
  console.log('1. Add TELEGRAM_BOT_TOKEN to your .env');
  console.log('2. Create the webhook API route');
  console.log('3. Deploy and set the webhook URL');
  console.log('4. Users can register by messaging your bot /start');
  
  rl.close();
}

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

main().catch(console.error);
