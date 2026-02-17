-- Add missing columns to challenges table
ALTER TABLE challenges 
  ADD COLUMN IF NOT EXISTS event_id INTEGER,
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'OPEN',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Add sequence for challenge_id if not exists
CREATE SEQUENCE IF NOT EXISTS challenges_challenge_id_seq;
SELECT setval('challenges_challenge_id_seq', COALESCE((SELECT MAX(challenge_id) FROM challenges), 0) + 1, false);
ALTER TABLE challenges ALTER COLUMN challenge_id SET DEFAULT nextval('challenges_challenge_id_seq');

-- Fix boosts: rename amount_wei to amount if needed, or use amount_wei
-- (Using amount_wei as is - just ensure event_id exists which it does)

-- Insert test challenges
INSERT INTO challenges (chain_id, challenge_id, event_id, challenger, reason, status, created_at)
VALUES 
  (84532, nextval('challenges_challenge_id_seq'), 1, '0xChallengerA1B2C3D4E5F6789012345678901234567890AB', 'Source verification needed - awaiting primary source link', 'OPEN', NOW()),
  (84532, nextval('challenges_challenge_id_seq'), 3, '0xChallengerB2C3D4E5F6789012345678901234567890ABC', 'Agent performance claim requires on-chain proof', 'OPEN', NOW());

-- Insert test boosts (using amount_wei)
INSERT INTO boosts (chain_id, event_id, booster, amount_wei, tier)
VALUES 
  (84532, 2, '0xBoosterA1B2C3D4E5F6789012345678901234567890AB', 25000000000000000000, 1),
  (84532, 2, '0xBoosterC3D4E5F6789012345678901234567890ABCD', 10000000000000000000, 1),
  (84532, 1, '0xBoosterD4E5F6789012345678901234567890ABCDE', 5000000000000000000, 1);

-- Verify
SELECT 'Challenges' as type, COUNT(*) as count FROM challenges
UNION ALL
SELECT 'Boosts' as type, COUNT(*) as count FROM boosts;
