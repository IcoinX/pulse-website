-- Migration: Add agent mapping columns to events table
-- Execute in Supabase Dashboard SQL Editor

-- Add agent_slug column for deterministic mapping
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS agent_slug TEXT;

-- Add agent_symbol column for symbol-based matching
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS agent_symbol TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_agent_slug ON events(agent_slug);
CREATE INDEX IF NOT EXISTS idx_events_agent_symbol ON events(agent_symbol);
CREATE INDEX IF NOT EXISTS idx_events_source_type ON events(source_type);

-- Add constraint: unique match enforcement
-- Comment: Only set agent_slug if match is unambiguous

-- Verification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name IN ('agent_slug', 'agent_symbol');
