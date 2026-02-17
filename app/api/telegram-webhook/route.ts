import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not set');
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }

    // Handle /start command
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id;
      const username = update.message.chat.username || 'Builder';
      
      const registerUrl = `https://pulseprotocol.co/settings/notifications?telegram=${chatId}`;
      
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `👋 Welcome to PULSE Protocol, ${username}!

Get notified when:
• Events are verified or rejected
• New challenges are created
• Challenges are resolved

🔔 <a href="${registerUrl}">Enable Notifications</a>

Commands:
/stop - Disable all notifications
/status - Check your settings
/help - Show this message`,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });
      
      console.log(`User ${username} (${chatId}) started bot`);
    }
    
    // Handle /stop command
    if (update.message?.text === '/stop') {
      const chatId = update.message.chat.id;
      
      // Find user by telegram chat_id and disable all notifications
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('user_id')
        .eq('channel_config->>telegram_chat_id', chatId.toString())
        .single();
      
      if (prefs) {
        await supabase
          .from('notification_preferences')
          .update({
            event_status_change: false,
            challenge_created: false,
            challenge_resolved: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', prefs.user_id);
      }
      
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `✅ All notifications disabled.

To re-enable:
https://pulseprotocol.co/settings/notifications`,
          disable_web_page_preview: true
        })
      });
      
      console.log(`User ${chatId} disabled notifications`);
    }
    
    // Handle /status command
    if (update.message?.text === '/status') {
      const chatId = update.message.chat.id;
      
      const { data: pref } = await supabase
        .from('notification_preferences')
        .select('event_status_change, challenge_created, challenge_resolved, notifs_sent_today, max_per_day')
        .eq('channel_config->>telegram_chat_id', chatId.toString())
        .single();
      
      const statusText = pref 
        ? `📊 Your Notification Settings:

${pref.event_status_change ? '✅' : '❌'} Event status changes
${pref.challenge_created ? '✅' : '❌'} New challenges
${pref.challenge_resolved ? '✅' : '❌'} Challenge resolutions

📨 Sent today: ${pref.notifs_sent_today}/${pref.max_per_day}

Manage: https://pulseprotocol.co/settings/notifications`
        : `❌ Not registered yet.

Enable notifications:
https://pulseprotocol.co/settings/notifications`;
      
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: statusText,
          disable_web_page_preview: true
        })
      });
    }
    
    // Handle /help command
    if (update.message?.text === '/help') {
      const chatId = update.message.chat.id;
      
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🤖 PULSE Protocol Bot Commands:

/start - Register for notifications
/stop - Disable all notifications
/status - Check your settings
/help - Show this message

🌐 https://pulseprotocol.co

Built by @the_boss_crypto 👑`,
          disable_web_page_preview: false
        })
      });
    }
    
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
