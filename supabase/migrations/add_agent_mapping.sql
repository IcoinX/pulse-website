-- SQL to add agent mapping support to PULSE Protocol
-- Execute this in Supabase Dashboard SQL Editor

-- Method 1: Add columns to events table (preferred)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS agent_slug TEXT,
ADD COLUMN IF NOT EXISTS agent_symbol TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_agent_slug ON events(agent_slug);
CREATE INDEX IF NOT EXISTS idx_events_agent_symbol ON events(agent_symbol);

-- Method 2: Create separate mapping table (fallback)
-- Only use this if you can't modify events table
CREATE TABLE IF NOT EXISTS event_agent_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id BIGINT NOT NULL,
  agent_slug TEXT NOT NULL,
  agent_symbol TEXT,
  mapping_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_agent_mappings_event_id ON event_agent_mappings(event_id);
CREATE INDEX IF NOT EXISTS idx_event_agent_mappings_slug ON event_agent_mappings(agent_slug);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name IN ('agent_slug', 'agent_symbol');
