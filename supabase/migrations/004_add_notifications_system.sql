-- F1: Notifications System - Database Schema
-- Choices: Telegram Bot | notifications table | UUID v5 | Cron 30s+worker

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. NOTIFICATION PREFERENCES (Opt-in strict)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  
  -- Opt-in flags (all FALSE by default)
  event_status_change BOOLEAN DEFAULT FALSE,
  challenge_created BOOLEAN DEFAULT FALSE,
  challenge_resolved BOOLEAN DEFAULT FALSE,
  
  -- Channel config
  channel TEXT DEFAULT 'telegram' CHECK (channel IN ('telegram', 'discord', 'email')),
  
  -- Telegram: chat_id | Discord: webhook_url | Email: address
  channel_config JSONB DEFAULT '{}',
  
  -- Rate limiting
  max_per_day INTEGER DEFAULT 10,
  notifs_sent_today INTEGER DEFAULT 0,
  day_reset_at TIMESTAMPTZ DEFAULT now(),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_notif_prefs_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_prefs_enabled ON notification_preferences(user_id) 
WHERE event_status_change = TRUE OR challenge_created = TRUE OR challenge_resolved = TRUE;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_notif_prefs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notif_prefs_timestamp ON notification_preferences;
CREATE TRIGGER notif_prefs_timestamp
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_notif_prefs_timestamp();

-- ============================================
-- 2. NOTIFICATIONS (Queue + Audit log)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Target
  user_id TEXT NOT NULL,
  
  -- Trigger type (whitelist strict)
  type TEXT NOT NULL CHECK (type IN (
    'EVENT_STATUS_CHANGE',
    'CHALLENGE_CREATED',
    'CHALLENGE_RESOLVED'
  )),
  
  -- Entity reference
  entity_type TEXT NOT NULL CHECK (entity_type IN ('event', 'challenge')),
  entity_id BIGINT NOT NULL,
  
  -- Content (immutable snapshot)
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  
  -- Channel & delivery
  channel TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'bounced')),
  
  -- Delivery tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  telegram_message_id TEXT,
  
  -- Retry tracking
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  
  -- Idempotence: UUID v5 of (namespace, type:entity_type:entity_id:user_id)
  idempotency_key UUID NOT NULL UNIQUE,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_pending ON notifications(status, next_retry_at) 
WHERE status IN ('pending', 'failed');
CREATE INDEX IF NOT EXISTS idx_notifications_idempotent ON notifications(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);

-- ============================================
-- 3. TRIGGER FUNCTIONS (3 strict triggers)
-- ============================================

-- Trigger 1: EVENT_STATUS_CHANGE
CREATE OR REPLACE FUNCTION notify_event_status_change()
RETURNS TRIGGER AS $$
DECLARE
  pref RECORD;
  idem_key UUID;
  status_verb TEXT;
BEGIN
  -- Only notify on meaningful transitions
  IF OLD.verification_status = NEW.verification_status THEN
    RETURN NEW;
  END IF;
  
  IF NEW.verification_status NOT IN ('VERIFIED', 'REJECTED') THEN
    RETURN NEW;
  END IF;
  
  status_verb := CASE NEW.verification_status
    WHEN 'VERIFIED' THEN 'validated'
    WHEN 'REJECTED' THEN 'rejected'
  END;
  
  -- Find opted-in users
  FOR pref IN 
    SELECT * FROM notification_preferences 
    WHERE event_status_change = TRUE
      AND (
        day_reset_at < now() - interval '1 day' 
        OR notifs_sent_today < max_per_day
      )
  LOOP
    -- Generate UUID v5 idempotency key
    idem_key := uuid_generate_v5(
      uuid_nil(),
      'EVENT_STATUS_CHANGE:event:' || NEW.event_id || ':' || pref.user_id
    );
    
    -- Skip if already sent
    IF EXISTS (SELECT 1 FROM notifications WHERE idempotency_key = idem_key) THEN
      CONTINUE;
    END IF;
    
    INSERT INTO notifications (
      user_id, type, entity_type, entity_id,
      title, body, url, channel, idempotency_key
    ) VALUES (
      pref.user_id,
      'EVENT_STATUS_CHANGE',
      'event',
      NEW.event_id,
      '🔄 Event #' || NEW.event_id || ' is now ' || NEW.verification_status,
      '"' || substring(NEW.title from 1 for 60) || 
      CASE WHEN length(NEW.title) > 60 THEN '..." ' ELSE '" ' END ||
      'has been ' || status_verb || ' by the community.',
      'https://pulseprotocol.co/event/' || NEW.event_id,
      pref.channel,
      idem_key
    );
    
    -- Update daily counter
    UPDATE notification_preferences 
    SET notifs_sent_today = CASE 
          WHEN day_reset_at < now() - interval '1 day' THEN 1 
          ELSE notifs_sent_today + 1 
        END,
        day_reset_at = CASE 
          WHEN day_reset_at < now() - interval '1 day' THEN now() 
          ELSE day_reset_at 
        END
    WHERE user_id = pref.user_id;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_event_status_notification ON events;
CREATE TRIGGER trg_event_status_notification
  AFTER UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION notify_event_status_change();

-- Trigger 2: CHALLENGE_CREATED (stake >= 50)
CREATE OR REPLACE FUNCTION notify_challenge_created()
RETURNS TRIGGER AS $$
DECLARE
  pref RECORD;
  idem_key UUID;
  evt RECORD;
BEGIN
  -- Minimum stake check
  IF NEW.challenger_stake < 50 THEN
    RETURN NEW;
  END IF;
  
  -- Get event info
  SELECT * INTO evt FROM events WHERE event_id = NEW.event_id;
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  FOR pref IN 
    SELECT * FROM notification_preferences 
    WHERE challenge_created = TRUE
      AND (
        day_reset_at < now() - interval '1 day' 
        OR notifs_sent_today < max_per_day
      )
  LOOP
    idem_key := uuid_generate_v5(
      uuid_nil(),
      'CHALLENGE_CREATED:challenge:' || NEW.challenge_id || ':' || pref.user_id
    );
    
    IF EXISTS (SELECT 1 FROM notifications WHERE idempotency_key = idem_key) THEN
      CONTINUE;
    END IF;
    
    INSERT INTO notifications (
      user_id, type, entity_type, entity_id,
      title, body, url, channel, idempotency_key
    ) VALUES (
      pref.user_id,
      'CHALLENGE_CREATED',
      'challenge',
      NEW.challenge_id,
      '⚔️ New Challenge on Event #' || NEW.event_id,
      'A challenger staked ' || NEW.challenger_stake || ' GENESIS to dispute: "' || 
      substring(NEW.title from 1 for 50) || '"',
      'https://pulseprotocol.co/event/' || NEW.event_id,
      pref.channel,
      idem_key
    );
    
    UPDATE notification_preferences 
    SET notifs_sent_today = CASE WHEN day_reset_at < now() - interval '1 day' THEN 1 ELSE notifs_sent_today + 1 END,
        day_reset_at = CASE WHEN day_reset_at < now() - interval '1 day' THEN now() ELSE day_reset_at END
    WHERE user_id = pref.user_id;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_challenge_created_notification ON challenges;
CREATE TRIGGER trg_challenge_created_notification
  AFTER INSERT ON challenges
  FOR EACH ROW EXECUTE FUNCTION notify_challenge_created();

-- Trigger 3: CHALLENGE_RESOLVED
CREATE OR REPLACE FUNCTION notify_challenge_resolved()
RETURNS TRIGGER AS $$
DECLARE
  pref RECORD;
  idem_key UUID;
  outcome TEXT;
BEGIN
  IF NEW.status != 'RESOLVED' OR OLD.status = 'RESOLVED' THEN
    RETURN NEW;
  END IF;
  
  outcome := CASE NEW.resolution
    WHEN 'VALID' THEN 'Challenger wins — event rejected'
    WHEN 'INVALID' THEN 'Challenger loses — event verified'
    ELSE 'Inconclusive — stakes returned'
  END;
  
  FOR pref IN 
    SELECT * FROM notification_preferences 
    WHERE challenge_resolved = TRUE
      AND (
        day_reset_at < now() - interval '1 day' 
        OR notifs_sent_today < max_per_day
      )
  LOOP
    idem_key := uuid_generate_v5(
      uuid_nil(),
      'CHALLENGE_RESOLVED:challenge:' || NEW.challenge_id || ':' || pref.user_id
    );
    
    IF EXISTS (SELECT 1 FROM notifications WHERE idempotency_key = idem_key) THEN
      CONTINUE;
    END IF;
    
    INSERT INTO notifications (
      user_id, type, entity_type, entity_id,
      title, body, url, channel, idempotency_key
    ) VALUES (
      pref.user_id,
      'CHALLENGE_RESOLVED',
      'challenge',
      NEW.challenge_id,
      '✅ Challenge #' || NEW.challenge_id || ' resolved: ' || NEW.resolution,
      outcome || ' (Votes: ' || NEW.votes_for || ' for / ' || NEW.votes_against || ' against)',
      'https://pulseprotocol.co/event/' || NEW.event_id,
      pref.channel,
      idem_key
    );
    
    UPDATE notification_preferences 
    SET notifs_sent_today = CASE WHEN day_reset_at < now() - interval '1 day' THEN 1 ELSE notifs_sent_today + 1 END,
        day_reset_at = CASE WHEN day_reset_at < now() - interval '1 day' THEN now() ELSE day_reset_at END
    WHERE user_id = pref.user_id;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_challenge_resolved_notification ON challenges;
CREATE TRIGGER trg_challenge_resolved_notification
  AFTER UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION notify_challenge_resolved();

-- ============================================
-- 4. DAILY RATE LIMIT RESET (cron support)
-- ============================================
CREATE OR REPLACE FUNCTION reset_daily_notification_limits()
RETURNS void AS $$
BEGIN
  UPDATE notification_preferences 
  SET notifs_sent_today = 0,
      day_reset_at = now()
  WHERE day_reset_at < now() - interval '1 day';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. VERIFICATION
-- ============================================
SELECT 'F1 Notifications schema created successfully' as status;
