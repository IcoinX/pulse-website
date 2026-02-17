-- Seeds Challenges (read-only demo)
INSERT INTO challenges (chain_id, event_id, challenger, reason, status, created_at)
VALUES 
  (84532, 1, '0xChallenger00000000000000000000000000000001', 'Source link verification needed - no primary source provided', 'OPEN', NOW()),
  (84532, 3, '0xChallenger00000000000000000000000000000002', 'Agent claim requires on-chain proof', 'OPEN', NOW())
ON CONFLICT DO NOTHING;

-- Seeds Boosts (read-only demo)
INSERT INTO boosts (chain_id, event_id, booster, amount, created_at)
VALUES 
  (84532, 2, '0xBooster0000000000000000000000000000000001', 25, NOW()),
  (84532, 2, '0xBooster0000000000000000000000000000000002', 10, NOW()),
  (84532, 1, '0xBooster0000000000000000000000000000000003', 5, NOW())
ON CONFLICT DO NOTHING;

-- Verify inserts
SELECT 'Challenges' as table_name, COUNT(*) as count FROM challenges
UNION ALL
SELECT 'Boosts' as table_name, COUNT(*) as count FROM boosts;
