-- Migration: Create agent_claims table for tracking claim requests
-- Created: 2026-02-18

CREATE TABLE IF NOT EXISTS agent_claims (
  id SERIAL PRIMARY KEY,
  agent_address TEXT NOT NULL,
  owner_address TEXT NOT NULL,
  nonce INTEGER NOT NULL DEFAULT 0,
  expiry TIMESTAMPTZ NOT NULL,
  signature TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, VERIFIED, EXPIRED, REVOKED
  tx_hash TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_claims_agent ON agent_claims(agent_address);
CREATE INDEX IF NOT EXISTS idx_agent_claims_owner ON agent_claims(owner_address);
CREATE INDEX IF NOT EXISTS idx_agent_claims_status ON agent_claims(status);
CREATE INDEX IF NOT EXISTS idx_agent_claims_expiry ON agent_claims(expiry);

-- Enable RLS
ALTER TABLE agent_claims ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read on agent_claims" 
  ON agent_claims FOR SELECT USING (true);

-- Add nonce column to agents table if not exists
ALTER TABLE agents ADD COLUMN IF NOT EXISTS nonce INTEGER DEFAULT 0;

-- Add comment
COMMENT ON TABLE agent_claims IS 'Tracks agent ownership claim requests and signatures';
