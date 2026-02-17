-- Insert test challenges (linked to existing events)
INSERT INTO challenges (chain_id, event_id, challenger, reason, status, created_at)
VALUES 
  (84532, 1, '0xChallengerA1B2C3D4E5F6789012345678901234567890AB', 'Source verification needed - awaiting primary source link', 'OPEN', NOW()),
  (84532, 3, '0xChallengerB2C3D4E5F6789012345678901234567890ABC', 'Agent performance claim requires on-chain proof', 'OPEN', NOW())
ON CONFLICT DO NOTHING;

-- Insert test boosts (linked to existing events)
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
