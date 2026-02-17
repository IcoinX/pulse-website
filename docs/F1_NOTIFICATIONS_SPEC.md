# F1 — Notifications Server-Side: Specification Review

## 1. Schéma DB Proposé

### Table: `notification_preferences` (Opt-in explicite)
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,           -- wallet address or user identifier
  
  -- Preferences by type (all FALSE by default = opt-in required)
  event_status_change BOOLEAN DEFAULT FALSE,
  challenge_created BOOLEAN DEFAULT FALSE,
  challenge_resolved BOOLEAN DEFAULT FALSE,
  
  -- Channel preference
  channel TEXT DEFAULT 'webhook' CHECK (channel IN ('webhook', 'email')),
  
  -- Channel config (encrypted at rest in production)
  webhook_url TEXT,                -- for Discord/Slack/Telegram bot
  email_address TEXT,              -- for transactional email
  
  -- Rate limiting per user
  max_per_day INTEGER DEFAULT 10,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_notif_prefs_user ON notification_preferences(user_id);
```

### Table: `notifications` (Delivery log + queue)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Target
  user_id TEXT NOT NULL,
  
  -- What triggered it
  type TEXT NOT NULL CHECK (type IN (
    'EVENT_STATUS_CHANGE',
    'CHALLENGE_CREATED',
    'CHALLENGE_RESOLVED'
  )),
  
  -- Entity reference
  entity_type TEXT NOT NULL,       -- 'event' | 'challenge'
  entity_id BIGINT NOT NULL,       -- event_id or challenge_id
  
  -- Content (immutable snapshot)
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,                        -- deep link to pulseprotocol.co
  
  -- Delivery tracking
  channel TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Retry tracking
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  
  -- Idempotence key
  idempotency_key TEXT NOT NULL UNIQUE,  -- hash(type + entity_id + user_id)
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_status ON notifications(status, next_retry_at);
CREATE INDEX idx_notifications_idempotent ON notifications(idempotency_key);
```

### Table: `notification_queue` (Optional if using Supabase triggers)
```sql
-- Alternative: Use notifications.status='pending' as queue
-- If we need a separate queue table for performance:

CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id),
  priority INTEGER DEFAULT 5,      -- lower = higher priority
  locked_by TEXT,                  -- worker ID
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_queue_pending ON notification_queue(locked_by, priority, created_at)
WHERE locked_by IS NULL;
```

---

## 2. Choix du Premier Canal

### Proposition: **Telegram Bot** (via webhook)

**Pourquoi Telegram ?**
| Critère | Telegram | Discord | Email | Slack |
|---------|----------|---------|-------|-------|
| Setup complexity | ⭐ Low | ⭐⭐ Medium | ⭐⭐⭐ High (SMTP) | ⭐⭐ Medium |
| User adoption (crypto) | ⭐⭐⭐ High | ⭐⭐⭐ High | ⭐⭐ Medium | ⭐⭐ Medium |
| Delivery reliability | ⭐⭐⭐ High | ⭐⭐⭐ High | ⭐⭐ Medium (spam) | ⭐⭐⭐ High |
| Rate limits | Generous | Generous | N/A | Generous |
| UX richness | ⭐⭐⭐ Rich | ⭐⭐⭐ Rich | ⭐⭐ Plain | ⭐⭐⭐ Rich |

**Technical approach:**
- User links Telegram via bot (@PulseProtocolBot)
- Store `chat_id` in `webhook_url` field
- POST to `https://api.telegram.org/bot<TOKEN>/sendMessage`

**Alternative if veto:** Discord webhook URL (user provides webhook URL, we POST to it)

---

## 3. Triggers Stricts (Whitelist)

### Trigger 1: EVENT_STATUS_CHANGE
**When:** `events.verification_status` changes
**Condition:** 
- Old: PENDING → New: VERIFIED or REJECTED
- OR Old: DISPUTED → New: VERIFIED or REJECTED

**Logic:**
```sql
-- Trigger function
CREATE OR REPLACE FUNCTION notify_event_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.verification_status != NEW.verification_status 
     AND NEW.verification_status IN ('VERIFIED', 'REJECTED') THEN
    
    -- Find users who opted in
    FOR pref IN SELECT * FROM notification_preferences 
                WHERE event_status_change = TRUE LOOP
      
      -- Check if notification already sent (idempotence)
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE idempotency_key = md5('EVENT_STATUS_CHANGE:event:' || NEW.event_id || ':' || pref.user_id)
      ) THEN
        
        INSERT INTO notifications (
          user_id, type, entity_type, entity_id,
          title, body, url, channel, idempotency_key
        ) VALUES (
          pref.user_id,
          'EVENT_STATUS_CHANGE',
          'event',
          NEW.event_id,
          'Event #' || NEW.event_id || ' is now ' || NEW.verification_status,
          NEW.title || ' has been ' || 
            CASE NEW.verification_status 
              WHEN 'VERIFIED' THEN 'validated by the community'
              WHEN 'REJECTED' THEN 'rejected after challenge'
            END,
          'https://pulseprotocol.co/event/' || NEW.event_id,
          pref.channel,
          md5('EVENT_STATUS_CHANGE:event:' || NEW.event_id || ':' || pref.user_id)
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_status_notification
  AFTER UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION notify_event_status_change();
```

### Trigger 2: CHALLENGE_CREATED
**When:** `challenges` inserted with status = 'OPEN'
**Condition:** `challenger_stake >= 50`

**Logic:**
- Notify users who opted into `challenge_created`
- Include stake amount in notification
- Filter: only challenges on events related to watched agents

### Trigger 3: CHALLENGE_RESOLVED
**When:** `challenges.status` changes to 'RESOLVED'
**Condition:** None (always notify if opted in)

**Logic:**
- Notify challenger + voters + watchers
- Include resolution (VALID/INVALID/INCONCLUSIVE)
- Include stake outcome (reward/slash/return)

---

## 4. Worker / Delivery Logic

### Approach A: Cron + Worker (Recommended)
```javascript
// Cron every 30s
// Worker picks up 'pending' notifications
// Sends via appropriate channel
// Updates status + retry logic
```

### Approach B: Supabase Edge Function (Real-time)
```javascript
// Trigger calls Edge Function
// Edge Function calls Telegram API directly
// No queue, but risk of timeout/rate limit
```

**Recommendation:** Approach A (cron + worker) for reliability

---

## 5. Idempotence & Retry Strategy

### Idempotence Key Generation
```javascript
const idempotencyKey = crypto
  .createHash('md5')
  .update(`${type}:${entityType}:${entityId}:${userId}`)
  .digest('hex');
```

### Retry Strategy
| Attempt | Delay | Action |
|---------|-------|--------|
| 1 | Immediate | Try send |
| 2 | +30s | Retry |
| 3 | +2min | Retry |
| 4 | +5min | Retry |
| 5+ | Mark failed | Manual review |

Max 5 attempts, then status = 'failed' with `last_error` logged.

---

## 6. UX Specifications

### Notification Content Template
```
🔄 Event #12345 is now VERIFIED

"Partnership announcement confirmed"
has been validated by the community.

[View Event] [Disable These Notifications]
```

### "Why did I get this?" Link
Every notification includes:
- Footer: "You're receiving this because you opted into event notifications. [Manage preferences]"
- Deep link to `/settings/notifications`

---

## 7. Validation Criteria (Before Deploy)

- [ ] Schema created (preferences + notifications)
- [ ] Triggers implemented (3 types)
- [ ] Worker cron running (30s interval)
- [ ] Idempotence tested (no duplicates)
- [ ] Opt-in enforced (no notifications without consent)
- [ ] Delivery < 30s (end-to-end)
- [ ] Disable works immediately
- [ ] "Why" explanation present

---

**Decision required:**
1. ✅ Schema OK ?
2. Channel: Telegram Bot (preferred) or Discord webhook ?
3. Approach: Cron+Worker (preferred) or Edge Function ?

**After your 👍:** Implementation code.
