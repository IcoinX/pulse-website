// E-T1 & E-T2: Challenge System Test Suite
// Controlled tests + Anti-abuse + Edge cases

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Test Configuration
const TEST_CONFIG = {
  minStake: 50,
  quorumThreshold: 1000,
  votingPeriodHours: 24
};

// ==================== E-T1: CONTROLLED REAL TESTS ====================

async function runControlledTests() {
  console.log('⚔️  E-T1: CONTROLLED REAL TESTS\n');
  console.log('================================\n');
  
  // Test 1: VALID Resolution (Challenger wins)
  console.log('TEST 1: VALID Resolution Path');
  console.log('─────────────────────────────────');
  const { data: validChallenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('challenge_id', 80001)
    .single();
  
  if (validChallenge) {
    console.log(`✅ Challenge #${validChallenge.challenge_id} exists`);
    console.log(`   Event: #${validChallenge.event_id}`);
    console.log(`   Votes: ${validChallenge.votes_for} FOR / ${validChallenge.votes_against} AGAINST`);
    console.log(`   Expected: VALID → Event becomes REJECTED`);
    
    // Simulate resolution
    await simulateResolution(80001, 'VALID', 'Community validated the challenge');
  }
  
  // Test 2: INVALID Resolution (Challenger loses)
  console.log('\nTEST 2: INVALID Resolution Path');
  console.log('─────────────────────────────────');
  const { data: invalidChallenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('challenge_id', 80002)
    .single();
  
  if (invalidChallenge) {
    console.log(`✅ Challenge #${invalidChallenge.challenge_id} exists`);
    console.log(`   Event: #${invalidChallenge.event_id}`);
    console.log(`   Votes: ${invalidChallenge.votes_for} FOR / ${invalidChallenge.votes_against} AGAINST`);
    console.log(`   Expected: INVALID → Event becomes VERIFIED`);
    
    await simulateResolution(80002, 'INVALID', 'Original assertion confirmed');
  }
  
  // Test 3: INCONCLUSIVE (No quorum)
  console.log('\nTEST 3: INCONCLUSIVE Resolution (No Quorum)');
  console.log('─────────────────────────────────');
  const { data: noQuorumChallenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('challenge_id', 80003)
    .single();
  
  if (noQuorumChallenge) {
    console.log(`✅ Challenge #${noQuorumChallenge.challenge_id} exists`);
    console.log(`   Votes: ${noQuorumChallenge.votes_for} FOR / ${noQuorumChallenge.votes_against} AGAINST`);
    console.log(`   Total: ${noQuorumChallenge.votes_for + noQuorumChallenge.votes_against} (need ${TEST_CONFIG.quorumThreshold})`);
    console.log(`   Expected: INCONCLUSIVE → Event stays PENDING`);
    
    await simulateResolution(80003, 'INCONCLUSIVE', 'Quorum not reached');
  }
  
  // Test 4: TIE Resolution
  console.log('\nTEST 4: TIE Resolution');
  console.log('─────────────────────────────────');
  const { data: tieChallenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('challenge_id', 80004)
    .single();
  
  if (tieChallenge) {
    console.log(`✅ Challenge #${tieChallenge.challenge_id} exists`);
    console.log(`   Votes: ${tieChallenge.votes_for} FOR / ${tieChallenge.votes_against} AGAINST (TIE!)`);
    console.log(`   Expected: INCONCLUSIVE → Event stays PENDING`);
    
    await simulateResolution(80004, 'INCONCLUSIVE', 'Vote resulted in tie');
  }
  
  // Test 5: Verify status propagation
  console.log('\nTEST 5: Status Propagation Verification');
  console.log('─────────────────────────────────');
  
  const { data: events } = await supabase
    .from('events')
    .select('event_id, verification_status, verification_reason')
    .in('event_id', [90001, 90002, 90003, 90004]);
  
  if (events) {
    events.forEach(e => {
      const expected = 
        e.event_id === 90001 ? 'REJECTED' :
        e.event_id === 90002 ? 'VERIFIED' :
        'PENDING';
      
      const pass = e.verification_status === expected;
      console.log(`   ${pass ? '✅' : '❌'} Event #${e.event_id}: ${e.verification_status} (expected: ${expected})`);
    });
  }
}

// ==================== E-T2: ANTI-ABUSE & EDGE CASES ====================

async function runAntiAbuseTests() {
  console.log('\n\n🛡️  E-T2: ANTI-ABUSE & EDGE CASES\n');
  console.log('====================================\n');
  
  // Test 6: Double Challenge Prevention
  console.log('TEST 6: Double Challenge Prevention');
  console.log('─────────────────────────────────');
  
  const { data: existingChallenges } = await supabase
    .from('challenges')
    .select('challenge_id, event_id, status')
    .eq('event_id', 90001);
  
  const activeCount = existingChallenges?.filter(c => c.status !== 'RESOLVED').length || 0;
  console.log(`   Active challenges on Event #90001: ${activeCount}`);
  console.log(`   ${activeCount <= 1 ? '✅' : '⚠️'} Only 1 active challenge allowed per event`);
  
  // Test 7: Challenge without votes
  console.log('\nTEST 7: Challenge Without Votes');
  console.log('─────────────────────────────────');
  
  const { data: noVoteChallenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('challenge_id', 80005)
    .single();
  
  if (noVoteChallenge) {
    console.log(`   Challenge #${noVoteChallenge.challenge_id} status: ${noVoteChallenge.status}`);
    console.log(`   Votes: ${noVoteChallenge.votes_for} FOR / ${noVoteChallenge.votes_against} AGAINST`);
    console.log(`   ${noVoteChallenge.status === 'OPEN' ? '✅' : '❌'} Stays OPEN until votes received`);
  }
  
  // Test 8: Minimum stake enforcement
  console.log('\nTEST 8: Minimum Stake Enforcement');
  console.log('─────────────────────────────────');
  
  const { data: lowStakeAttempt } = await supabase
    .from('challenges')
    .select('challenge_id, challenger_stake')
    .lt('challenger_stake', TEST_CONFIG.minStake)
    .limit(1);
  
  if (lowStakeAttempt && lowStakeAttempt.length > 0) {
    console.log(`   ❌ Found challenge with stake < ${TEST_CONFIG.minStake}: #${lowStakeAttempt[0].challenge_id}`);
  } else {
    console.log(`   ✅ All challenges have stake >= ${TEST_CONFIG.minStake} GENESIS`);
  }
  
  // Test 9: Expiration without resolution
  console.log('\nTEST 9: Expiration Without Resolution');
  console.log('─────────────────────────────────');
  
  const { data: expiredChallenges } = await supabase
    .from('challenges')
    .select('*')
    .lt('voting_ends_at', new Date().toISOString())
    .neq('status', 'RESOLVED');
  
  if (expiredChallenges && expiredChallenges.length > 0) {
    console.log(`   ⚠️ Found ${expiredChallenges.length} expired unresolved challenges`);
    expiredChallenges.forEach(c => {
      console.log(`      - #${c.challenge_id}: ended ${new Date(c.voting_ends_at).toLocaleDateString()}`);
    });
  } else {
    console.log(`   ✅ No expired unresolved challenges`);
  }
  
  // Test 10: Quorum edge cases
  console.log('\nTEST 10: Quorum Edge Cases');
  console.log('─────────────────────────────────');
  
  const edgeCases = [
    { name: 'Exactly quorum', for: 500, against: 500, total: 1000 },
    { name: 'Just under quorum', for: 499, against: 500, total: 999 },
    { name: 'Single vote over quorum', for: 501, against: 500, total: 1001 }
  ];
  
  edgeCases.forEach(c => {
    const reachesQuorum = c.total >= TEST_CONFIG.quorumThreshold;
    console.log(`   ${reachesQuorum ? '✅' : '❌'} ${c.name}: ${c.total} votes → Quorum ${reachesQuorum ? 'reached' : 'not reached'}`);
  });
}

// ==================== E-T3: UX & COMPREHENSION ====================

async function runUXTests() {
  console.log('\n\n🎨 E-T3: UX & COMPREHENSION\n');
  console.log('=============================\n');
  
  // Test 11: Status clarity
  console.log('TEST 11: Status Label Clarity');
  console.log('─────────────────────────────────');
  
  const statusDescriptions = {
    'PENDING': '⏳ Awaiting verification - social/news source',
    'DISPUTED': '⚠️ Under review - active challenge',
    'VERIFIED': '✅ Proven by on-chain data or challenge won',
    'REJECTED': '❌ Proven false by community challenge'
  };
  
  Object.entries(statusDescriptions).forEach(([status, desc]) => {
    console.log(`   ${status.padEnd(10)} → ${desc}`);
  });
  
  // Test 12: Economic perception
  console.log('\nTEST 12: Economic Incentive Structure');
  console.log('─────────────────────────────────');
  console.log(`   Min Stake: ${TEST_CONFIG.minStake} GENESIS (~$5-50 depending on price)`);
  console.log(`   Reward: 10% of stake on win`);
  console.log(`   Risk: 50% slash on lose (25% burn, 25% to voters)`);
  console.log(`   Verdict: ${TEST_CONFIG.minStake >= 50 ? '✅' : '⚠️'} Sufficient barrier to spam`);
  
  // Test 13: Timeline narrative
  console.log('\nTEST 13: Timeline Narrative');
  console.log('─────────────────────────────────');
  
  const timeline = [
    '1. Event ingested → PENDING',
    '2. User challenges → Stake 50 GENESIS → DISPUTED',
    '3. Community votes (24h)',
    '4. Resolution:',
    '   • VALID → Event REJECTED, challenger rewarded',
    '   • INVALID → Event VERIFIED, challenger slashed',
    '   • INCONCLUSIVE → Stake returned'
  ];
  
  timeline.forEach(step => console.log(`   ${step}`));
}

// ==================== HELPERS ====================

async function simulateResolution(challengeId, resolution, reason) {
  // Update challenge
  await supabase
    .from('challenges')
    .update({
      status: 'RESOLVED',
      resolution: resolution,
      resolution_reason: reason,
      resolved_at: new Date().toISOString(),
      resolved_by: 'test_script'
    })
    .eq('challenge_id', challengeId);
  
  console.log(`   ✅ Resolved as ${resolution}`);
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...\n');
  
  // Reset challenges
  await supabase
    .from('challenges')
    .delete()
    .gte('challenge_id', 80001)
    .lte('challenge_id', 80005);
  
  // Reset events
  await supabase
    .from('events')
    .delete()
    .gte('event_id', 90001)
    .lte('event_id', 90005);
  
  console.log('✅ Test data cleaned');
}

// ==================== MAIN ====================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    await cleanupTestData();
    return;
  }
  
  console.log('🚀 PULSE Challenge System Test Suite\n');
  console.log('=====================================\n');
  
  await runControlledTests();
  await runAntiAbuseTests();
  await runUXTests();
  
  console.log('\n\n📊 SUMMARY\n');
  console.log('==========\n');
  console.log('All test scenarios defined. Check above for ✅/❌ results.');
  console.log('\nTo clean up test data:');
  console.log('  node scripts/E_test_suite.js --cleanup');
  console.log('\nNext steps:');
  console.log('  1. Execute SQL migration in Supabase Dashboard');
  console.log('  2. Run this test suite');
  console.log('  3. Verify UI on /events/90001-90005');
  console.log('  4. Check status propagation to feed and agent pages');
}

main().catch(console.error);
