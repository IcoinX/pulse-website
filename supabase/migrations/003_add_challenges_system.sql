-- Migration: Add challenges system to PULSE Protocol
-- The core dispute & resolution mechanism

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id BIGINT UNIQUE NOT NULL,
  event_id BIGINT REFERENCES events(event_id),
  
  -- Challenger info
  challenger_address TEXT NOT NULL,
  challenger_stake NUMERIC NOT NULL, -- In GENESIS tokens
  
  -- Challenge details
  title TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT[], -- Array of proof URLs
  
  -- Status workflow: OPEN → VOTING → RESOLVED
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'VOTING', 'RESOLVED')),
  
  -- Resolution
  resolution TEXT CHECK (resolution IN (NULL, 'VALID', 'INVALID', 'INCONCLUSIVE')),
  resolution_reason TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT, -- 'community', 'oracle', 'timeout'
  
  -- Voting
  votes_for NUMERIC DEFAULT 0,    -- Valid (challenger wins)
  votes_against NUMERIC DEFAULT 0, -- Invalid (challenger loses)
  quorum_reached BOOLEAN DEFAULT FALSE,
  
  -- Timeouts
  created_at TIMESTAMPTZ DEFAULT now(),
  voting_ends_at TIMESTAMPTZ, -- 24h after OPEN → VOTING
  
  -- Slash/reward tracking
  stake_returned BOOLEAN DEFAULT FALSE,
  reward_paid BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_event_id ON challenges(event_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_challenger ON challenges(challenger_address);
CREATE INDEX IF NOT EXISTS idx_challenges_created ON challenges(created_at DESC);

-- Challenge votes table (for audit trail)
CREATE TABLE IF NOT EXISTS challenge_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id BIGINT REFERENCES challenges(challenge_id),
  voter_address TEXT NOT NULL,
  vote BOOLEAN NOT NULL, -- TRUE = for (valid), FALSE = against (invalid)
  stake NUMERIC NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, voter_address)
);

CREATE INDEX IF NOT EXISTS idx_challenge_votes_challenge ON challenge_votes(challenge_id);

-- Function to auto-update event status when challenge is created
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
      -- Challenger wins: event is REJECTED (false)
      UPDATE events 
      SET verification_status = 'REJECTED',
          verification_reason = 'Challenge #' || NEW.challenge_id || ' resolved: ' || NEW.resolution_reason
      WHERE event_id = NEW.event_id;
    ELSIF NEW.resolution = 'INVALID' THEN
      -- Challenger loses: event is VERIFIED (true)
      UPDATE events 
      SET verification_status = 'VERIFIED',
          verification_reason = 'Challenge #' || NEW.challenge_id || ' resolved: Validated by community'
      WHERE event_id = NEW.event_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS challenge_status_change ON challenges;
CREATE TRIGGER challenge_status_change
  AFTER INSERT OR UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_event_on_challenge();

-- Verify
SELECT 'Challenges table created' as status;
