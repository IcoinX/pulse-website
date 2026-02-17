-- Migration: Add verification system to events table
-- Execute in Supabase Dashboard SQL Editor

-- Add verification status enum (using text with check constraint for flexibility)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS verification_reason TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- Add constraint for valid statuses
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS valid_verification_status;

ALTER TABLE events 
ADD CONSTRAINT valid_verification_status 
CHECK (verification_status IN ('VERIFIED', 'PENDING', 'DISPUTED', 'REJECTED'));

-- Create index for fast filtering
CREATE INDEX IF NOT EXISTS idx_events_verification_status ON events(verification_status);
CREATE INDEX IF NOT EXISTS idx_events_verified_at ON events(verified_at);

-- Backfill existing events based on source_type
UPDATE events 
SET verification_status = 'VERIFIED',
    verification_reason = 'On-chain event indexed from Base Sepolia',
    verified_at = created_at,
    verified_by = 'onchain'
WHERE source_type IN ('ONCHAIN', 'GENESIS') 
   OR canonical_hash LIKE '0x%';

UPDATE events 
SET verification_status = 'PENDING',
    verification_reason = 'Social/news feed - awaiting verification'
WHERE verification_status IS NULL 
   OR verification_status = 'PENDING';

-- Verification
SELECT verification_status, COUNT(*) 
FROM events 
GROUP BY verification_status;
