-- Fix: Add auto-generating defaults for challenge_id and boost_id

-- For challenges: set default to auto-increment
CREATE SEQUENCE IF NOT EXISTS challenges_challenge_id_seq;
ALTER TABLE challenges 
  ALTER COLUMN challenge_id SET DEFAULT nextval('challenges_challenge_id_seq'),
  ALTER COLUMN challenge_id SET NOT NULL;
ALTER SEQUENCE challenges_challenge_id_seq OWNED BY challenges.challenge_id;

-- For boosts: set default to auto-increment  
CREATE SEQUENCE IF NOT EXISTS boosts_boost_id_seq;
ALTER TABLE boosts
  ALTER COLUMN boost_id SET DEFAULT nextval('boosts_boost_id_seq'),
  ALTER COLUMN boost_id SET NOT NULL;
ALTER SEQUENCE boosts_boost_id_seq OWNED BY boosts.boost_id;

-- Ensure other required columns exist
ALTER TABLE challenges 
  ADD COLUMN IF NOT EXISTS event_id INTEGER,
  ADD COLUMN IF NOT EXISTS challenger TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'OPEN';

ALTER TABLE boosts
  ADD COLUMN IF NOT EXISTS event_id INTEGER,
  ADD COLUMN IF NOT EXISTS booster TEXT,
  ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 0;

-- Now insert test data (challenge_id/boost_id will auto-generate)
INSERT INTO challenges (chain_id, event_id, challenger, reason, status, created_at)
VALUES 
  (84532, 1, '0xChallengerA1B2C3D4E5F6789012345678901234567890AB', 'Source verification needed - awaiting primary source link', 'OPEN', NOW()),
  (84532, 3, '0xChallengerB2C3D4E5F6789012345678901234567890ABC', 'Agent performance claim requires on-chain proof', 'OPEN', NOW());

INSERT INTO boosts (chain_id, event_id, booster, amount, created_at)
VALUES 
  (84532, 2, '0xBoosterA1B2C3D4E5F6789012345678901234567890AB', 25, NOW()),
  (84532, 2, '0xBoosterC3D4E5F6789012345678901234567890ABCD', 10, NOW()),
  (84532, 1, '0xBoosterD4E5F6789012345678901234567890ABCDE', 5, NOW());

-- Verify
SELECT 'Challenges' as type, COUNT(*) as count FROM challenges
UNION ALL
SELECT 'Boosts' as type, COUNT(*) as count FROM boosts;
