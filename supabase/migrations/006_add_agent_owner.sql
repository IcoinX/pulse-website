-- Migration: Add owner column to agents table for Claim Agent feature
-- Created: 2026-02-18

-- Add owner column
ALTER TABLE agents ADD COLUMN IF NOT EXISTS owner_address TEXT;

-- Add index for owner lookups
CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner_address);

-- Add claimed_at timestamp
ALTER TABLE agents ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Add claim_tx_hash for on-chain reference
ALTER TABLE agents ADD COLUMN IF NOT EXISTS claim_tx_hash TEXT;

-- Add is_verified flag (true if on-chain claim verified)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Update comment
COMMENT ON COLUMN agents.owner_address IS 'Human owner wallet address (via AgentRegistry claim)';
COMMENT ON COLUMN agents.claimed_at IS 'Timestamp when agent was claimed';
COMMENT ON COLUMN agents.claim_tx_hash IS 'Transaction hash of on-chain claim';
COMMENT ON COLUMN agents.is_verified IS 'True if claim verified on-chain';
