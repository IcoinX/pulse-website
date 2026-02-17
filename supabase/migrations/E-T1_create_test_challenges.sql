-- E-T1: Controlled Real Test - Create Test Challenges
-- Run this to seed challenges for testing all resolution paths

-- First, ensure we have test events
INSERT INTO events (chain_id, event_id, title, source_type, status, canonical_hash, verification_status, created_at)
VALUES 
  (84532, 90001, 'Test Event Alpha - Low Confidence Claim', 'AGENT', 'PENDING', 'test-alpha-001', 'PENDING', NOW()),
  (84532, 90002, 'Test Event Beta - Medium Confidence', 'AGENT', 'PENDING', 'test-beta-002', 'PENDING', NOW()),
  (84532, 90003, 'Test Event Gamma - High Confidence', 'AGENT', 'PENDING', 'test-gamma-003', 'PENDING', NOW()),
  (84532, 90004, 'Test Event Delta - Edge Case', 'AGENT', 'PENDING', 'test-delta-004', 'PENDING', NOW()),
  (84532, 90005, 'Test Event Epsilon - Stress Test', 'AGENT', 'PENDING', 'test-epsilon-005', 'PENDING', NOW())
ON CONFLICT (event_id) DO NOTHING;

-- Create challenges for different test scenarios

-- Challenge 1: Will be VALID (challenger wins) - Event becomes REJECTED
INSERT INTO challenges (
  challenge_id, event_id, challenger_address, challenger_stake,
  title, description, evidence_urls, status,
  votes_for, votes_against, quorum_reached, created_at, voting_ends_at
)
VALUES (
  80001, 90001, '0xChallengerAlpha', 50,
  'False claim: No on-chain evidence', 
  'This event claims a partnership that does not exist. I checked the contract and found no evidence.',
  ARRAY['https://basescan.org/tx/0xabc123', 'https://twitter.com/realuser/status/123'],
  'VOTING',
  750, 250, true, NOW(), NOW() + INTERVAL '24 hours'
)
ON CONFLICT (challenge_id) DO NOTHING;

-- Challenge 2: Will be INVALID (challenger loses) - Event becomes VERIFIED
INSERT INTO challenges (
  challenge_id, event_id, challenger_address, challenger_stake,
  title, description, evidence_urls, status,
  votes_for, votes_against, quorum_reached, created_at, voting_ends_at
)
VALUES (
  80002, 90002, '0xChallengerBeta', 75,
  'Disputing token metrics',
  'The claimed metrics are incorrect according to my analysis.',
  ARRAY['https://example.com/analysis'],
  'VOTING',
  200, 800, true, NOW(), NOW() + INTERVAL '24 hours'
)
ON CONFLICT (challenge_id) DO NOTHING;

-- Challenge 3: Will be INCONCLUSIVE (no quorum) - Event stays PENDING
INSERT INTO challenges (
  challenge_id, event_id, challenger_address, challenger_stake,
  title, description, evidence_urls, status,
  votes_for, votes_against, quorum_reached, created_at, voting_ends_at
)
VALUES (
  80003, 90003, '0xChallengerGamma', 100,
  'Unclear partnership details',
  'The partnership mentioned lacks specific details.',
  ARRAY[],
  'VOTING',
  50, 30, false, NOW(), NOW() + INTERVAL '24 hours'
)
ON CONFLICT (challenge_id) DO NOTHING;

-- Challenge 4: Edge case - TIE vote
INSERT INTO challenges (
  challenge_id, event_id, challenger_address, challenger_stake,
  title, description, evidence_urls, status,
  votes_for, votes_against, quorum_reached, created_at, voting_ends_at
)
VALUES (
  80004, 90004, '0xChallengerDelta', 60,
  'Contradictory information',
  'Multiple sources give different versions.',
  ARRAY['https://source1.com', 'https://source2.com'],
  'VOTING',
  500, 500, true, NOW(), NOW() + INTERVAL '24 hours'
)
ON CONFLICT (challenge_id) DO NOTHING;

-- Challenge 5: OPEN status (fresh, no votes yet)
INSERT INTO challenges (
  challenge_id, event_id, challenger_address, challenger_stake,
  title, description, evidence_urls, status,
  votes_for, votes_against, quorum_reached, created_at, voting_ends_at
)
VALUES (
  80005, 90005, '0xChallengerEpsilon', 50,
  'Recent announcement seems premature',
  'The announcement was made before the actual deployment.',
  ARRAY['https://basescan.org/address/0xnotdeployed'],
  'OPEN',
  0, 0, false, NOW(), NOW() + INTERVAL '48 hours'
)
ON CONFLICT (challenge_id) DO NOTHING;

-- Verify test data
SELECT 
  e.event_id,
  e.title,
  e.verification_status as event_status,
  c.challenge_id,
  c.status as challenge_status,
  c.votes_for,
  c.votes_against,
  c.quorum_reached
FROM events e
LEFT JOIN challenges c ON e.event_id = c.event_id
WHERE e.event_id BETWEEN 90001 AND 90005
ORDER BY e.event_id;
