-- Migration: Add agent_origin to events table
-- Tracks which platform launched the agent (VIRTUALS, BANKR, CLANKER, NATIVE)

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS agent_origin VARCHAR(20) DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_events_agent_origin ON events(agent_origin);

-- Update existing AGENT events to have NULL origin (to be backfilled)
-- Future events will be tagged at ingestion time

COMMENT ON COLUMN events.agent_origin IS 'Platform that launched the agent: VIRTUALS, BANKR, CLANKER, NATIVE, or NULL';
