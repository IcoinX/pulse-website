// Test script for verification system
// C5: Quick tests for verification badges

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runTests() {
  console.log('🧪 Testing Verification System\n');
  console.log('==============================\n');
  
  // Test 1: Check existing events have correct status
  console.log('Test 1: ONCHAIN events should be VERIFIED');
  const { data: onchainEvents } = await supabase
    .from('events')
    .select('event_id, title, source_type, verification_status, verification_reason')
    .eq('source_type', 'ONCHAIN')
    .limit(3);
  
  let passCount = 0;
  onchainEvents?.forEach(evt => {
    const pass = evt.verification_status === 'VERIFIED';
    console.log(`  ${pass ? '✅' : '❌'} Event #${evt.event_id}: ${evt.verification_status} (${evt.source_type})`);
    if (pass) passCount++;
  });
  console.log(`  Result: ${passCount}/${onchainEvents?.length || 0} passed\n`);
  
  // Test 2: AGENT events should be PENDING
  console.log('Test 2: AGENT events should be PENDING');
  const { data: agentEvents } = await supabase
    .from('events')
    .select('event_id, title, source_type, verification_status')
    .eq('source_type', 'AGENT')
    .limit(3);
  
  passCount = 0;
  agentEvents?.forEach(evt => {
    const pass = evt.verification_status === 'PENDING';
    console.log(`  ${pass ? '✅' : '❌'} Event #${evt.event_id}: ${evt.verification_status} (${evt.source_type})`);
    if (pass) passCount++;
  });
  console.log(`  Result: ${passCount}/${agentEvents?.length || 0} passed\n`);
  
  // Test 3: Simulate DISPUTED status
  console.log('Test 3: Simulating DISPUTED status (updating one event)');
  const { data: pendingEvents } = await supabase
    .from('events')
    .select('event_id')
    .eq('verification_status', 'PENDING')
    .limit(1);
  
  if (pendingEvents?.length > 0) {
    const testEventId = pendingEvents[0].event_id;
    
    // Save original status
    const { data: original } = await supabase
      .from('events')
      .select('verification_status, verification_reason')
      .eq('event_id', testEventId)
      .single();
    
    // Update to DISPUTED
    const { error: updateError } = await supabase
      .from('events')
      .update({
        verification_status: 'DISPUTED',
        verification_reason: 'Active challenge: contradicting evidence submitted'
      })
      .eq('event_id', testEventId);
    
    if (!updateError) {
      console.log(`  ✅ Event #${testEventId} marked as DISPUTED`);
      
      // Restore original
      await supabase
        .from('events')
        .update({
          verification_status: original.verification_status,
          verification_reason: original.verification_reason
        })
        .eq('event_id', testEventId);
      
      console.log(`  ✅ Restored to ${original.verification_status}`);
    } else {
      console.log(`  ❌ Error: ${updateError.message}`);
    }
  }
  console.log('');
  
  // Test 4: Stats summary
  console.log('Test 4: Verification distribution');
  const { data: stats } = await supabase
    .from('events')
    .select('verification_status, count(*)')
    .not('verification_status', 'is', null)
    .group('verification_status');
  
  if (stats) {
    const total = stats.reduce((a, b) => a + parseInt(b.count), 0);
    stats.forEach(row => {
      const pct = Math.round((parseInt(row.count) / total) * 100);
      const icon = row.verification_status === 'VERIFIED' ? '✅' :
                   row.verification_status === 'PENDING' ? '⏳' :
                   row.verification_status === 'DISPUTED' ? '⚠️' : '❌';
      console.log(`  ${icon} ${row.verification_status}: ${row.count} (${pct}%)`);
    });
    console.log(`  📊 Total: ${total} events`);
  }
  
  console.log('\n✅ All tests completed!');
  console.log('\n🌐 Check the UI:');
  console.log('   - /events/[id] should show VerificationBlock');
  console.log('   - Event cards should show verification badges');
}

runTests().catch(console.error);
