-- SQL SIMPLIFIÉ pour F1 Notifications
-- Copie-colle tout ce fichier dans Supabase Dashboard SQL Editor
-- Puis clique "Run"

-- 1. TABLE DES PRÉFÉRENCES (opt-in)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  event_status_change BOOLEAN DEFAULT FALSE,
  challenge_created BOOLEAN DEFAULT FALSE,
  challenge_resolved BOOLEAN DEFAULT FALSE,
  channel TEXT DEFAULT 'telegram',
  channel_config JSONB DEFAULT '{}',
  max_per_day INTEGER DEFAULT 10,
  notifs_sent_today INTEGER DEFAULT 0,
  day_reset_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLE DES NOTIFICATIONS (queue + log)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  channel TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  telegram_message_id TEXT,
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  idempotency_key UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INDEX POUR PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_notif_prefs_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_pending ON notifications(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_notifications_idempotent ON notifications(idempotency_key);

-- 4. FONCTION POUR ENVOYER UNE NOTIF (optionnel, pour test)
CREATE OR REPLACE FUNCTION send_test_notification(p_user_id TEXT, p_title TEXT, p_body TEXT)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, entity_type, entity_id, title, body, channel, idempotency_key)
  VALUES (p_user_id, 'TEST', 'test', 0, p_title, p_body, 'telegram', gen_random_uuid())
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- VÉRIFICATION
SELECT '✅ Tables créées avec succès' as status;
SELECT COUNT(*) as prefs_count FROM notification_preferences;
SELECT COUNT(*) as notifs_count FROM notifications;
