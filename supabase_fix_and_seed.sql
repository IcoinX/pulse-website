-- First, check current table structure and fix it

-- 1) Ensure challenges table has correct columns
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS event_id INTEGER,
ADD COLUMN IF NOT EXISTS challenger TEXT,
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'OPEN',
ADD COLUMN IF NOT EXISTS chain_id INTEGER,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 2) Ensure boosts table has correct columns  
ALTER TABLE boosts
ADD COLUMN IF NOT EXISTS event_id INTEGER,
ADD COLUMN IF NOT EXISTS booster TEXT,
ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS chain_id INTEGER,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 3) Now insert test data
INSERT INTO challenges (chain_id, event_id, challenger, reason, status, created_at)
VALUES 
  (84532, 1, '0xChallengerA1B2C3D4E5F6789012345678901234567890AB', 'Source verification needed - awaiting primary source link', 'OPEN', NOW()),
  (84532, 3, '0xChallengerB2C3D4E5F6789012345678901234567890ABC', 'Agent performance claim requires on-chain proof', 'OPEN', NOW())
ON CONFLICT DO NOTHING;

INSERT INTO boosts (chain_id, event_id, booster, amount, created_at)
VALUES 
  (84532, 2, '0xBoosterA1B2C3D4E5F6789012345678901234567890AB', 25, NOW()),
  (84532, 2, '0xBoosterC3D4E5F6789012345678901234567890ABCD', 10, NOW()),
  (84532, 1, '0xBoosterD4E5F6789012345678901234567890ABCDE', 5, NOW())
ON CONFLICT DO NOTHING;

-- Verify
SELECT 'Challenges' as type, COUNT(*) as count FROM challenges
UNION ALL
SELECT 'Boosts' as type, COUNT(*) as count FROM boosts;
