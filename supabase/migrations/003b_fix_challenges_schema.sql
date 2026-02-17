-- Option 1: Modify existing challenges table (add missing columns, migrate data)
-- Execute this in Supabase Dashboard SQL Editor

-- Step 1: Add all missing columns
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS event_id BIGINT,
ADD COLUMN IF NOT EXISTS challenger_address TEXT,
ADD COLUMN IF NOT EXISTS challenger_stake NUMERIC DEFAULT 50,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS evidence_urls TEXT[],
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'OPEN',
ADD COLUMN IF NOT EXISTS resolution TEXT,
ADD COLUMN IF NOT EXISTS resolution_reason TEXT,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resolved_by TEXT,
ADD COLUMN IF NOT EXISTS votes_for NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS votes_against NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS quorum_reached BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS voting_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stake_returned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reward_paid BOOLEAN DEFAULT FALSE;

-- Step 2: Migrate existing data
UPDATE challenges 
SET event_id = assertion_id 
WHERE event_id IS NULL AND assertion_id IS NOT NULL;

UPDATE challenges 
SET challenger_address = challenger 
WHERE challenger_address IS NULL AND challenger IS NOT NULL;

UPDATE challenges 
SET title = COALESCE(title, 'Legacy Challenge #' || challenge_id::text);

UPDATE challenges 
SET status = COALESCE(status, 'OPEN');

-- Step 3: Add constraints (after data migration)
ALTER TABLE challenges 
DROP CONSTRAINT IF EXISTS valid_challenge_status;

ALTER TABLE challenges 
ADD CONSTRAINT valid_challenge_status 
CHECK (status IN ('OPEN', 'VOTING', 'RESOLVED'));

ALTER TABLE challenges 
DROP CONSTRAINT IF EXISTS valid_challenge_resolution;

ALTER TABLE challenges 
ADD CONSTRAINT valid_challenge_resolution 
CHECK (resolution IS NULL OR resolution IN ('VALID', 'INVALID', 'INCONCLUSIVE'));

-- Step 4: Create challenge_votes table if not exists
CREATE TABLE IF NOT EXISTS challenge_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id BIGINT REFERENCES challenges(challenge_id),
  voter_address TEXT NOT NULL,
  vote BOOLEAN NOT NULL,
  stake NUMERIC NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, voter_address)
);

CREATE INDEX IF NOT EXISTS idx_challenge_votes_challenge ON challenge_votes(challenge_id);

-- Step 5: Create trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_event_on_challenge()
RETURNS TRIGGER AS $$
BEGIN
  -- When challenge is created, mark event as DISPUTED
  IF NEW.status = 'OPEN' THEN
    UPDATE events 
    SET verification_status = 'DISPUTED',
        verification_reason = 'Active challenge #' || NEW.challenge_id || ': ' || NEW.title
    WHERE event_id = NEW.event_id;
  END IF;
  
  -- When challenge is resolved
  IF NEW.status = 'RESOLVED' THEN
    IF NEW.resolution = 'VALID' THEN
      UPDATE events 
      SET verification_status = 'REJECTED',
          verification_reason = 'Challenge #' || NEW.challenge_id || ' resolved: ' || NEW.resolution_reason
      WHERE event_id = NEW.event_id;
    ELSIF NEW.resolution = 'INVALID' THEN
      UPDATE events 
      SET verification_status = 'VERIFIED',
          verification_reason = 'Challenge #' || NEW.challenge_id || ' resolved: Validated by community'
      WHERE event_id = NEW.event_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger
DROP TRIGGER IF EXISTS challenge_status_change ON challenges;
CREATE TRIGGER challenge_status_change
  AFTER INSERT OR UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_event_on_challenge();

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_challenges_event_id ON challenges(event_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'challenges'
ORDER BY ordinal_position;
