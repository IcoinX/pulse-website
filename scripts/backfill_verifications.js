// Backfill verification status for existing events
// Run after adding verification columns

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function getVerificationStatus(sourceType) {
  const upperSource = sourceType?.toUpperCase() || '';
  
  // VERIFIED: on-chain sources
  if (['ONCHAIN', 'GENESIS', 'CONTRACT'].includes(upperSource)) {
    return {
      verification_status: 'VERIFIED',
      verification_reason: 'On-chain event indexed from Base Sepolia',
      verified_by: 'onchain'
    };
  }
  
  // PENDING: social/news sources
  return {
    verification_status: 'PENDING',
    verification_reason: 'Social/news feed - awaiting community verification',
    verified_by: null
  };
}

async function backfillVerifications() {
  console.log('🔍 Backfilling verification status...\n');
  
  // Get events without verification status
  const { data: events, error } = await supabase
    .from('events')
    .select('event_id, source_type, verification_status')
    .is('verification_status', null)
    .limit(100);
  
  if (error) {
    console.error('❌ Error fetching events:', error.message);
    return;
  }
  
  console.log(`📊 Found ${events?.length || 0} events to update\n`);
  
  if (!events || events.length === 0) {
    console.log('✅ All events have verification status');
    return;
  }
  
  let updated = 0;
  let verified = 0;
  let pending = 0;
  
  for (const event of events) {
    const status = getVerificationStatus(event.source_type);
    
    const { error: updateError } = await supabase
      .from('events')
      .update({
        verification_status: status.verification_status,
        verification_reason: status.verification_reason,
        verified_by: status.verified_by,
        verified_at: status.verified_by ? new Date().toISOString() : null
      })
      .eq('event_id', event.event_id);
    
    if (updateError) {
      console.error(`❌ Error updating event ${event.event_id}:`, updateError.message);
    } else {
      updated++;
      if (status.verification_status === 'VERIFIED') verified++;
      else pending++;
      
      console.log(`✅ Event #${event.event_id}: ${status.verification_status} (${event.source_type})`);
    }
  }
  
  console.log(`\n📈 Updated: ${updated} events`);
  console.log(`   ✅ VERIFIED: ${verified}`);
  console.log(`   ⏳ PENDING: ${pending}`);
  
  // Show stats
  const { data: stats } = await supabase
    .from('events')
    .select('verification_status, count(*)')
    .not('verification_status', 'is', null)
    .group('verification_status');
  
  console.log(`\n📊 Current distribution:`);
  if (stats) {
    stats.forEach(row => {
      console.log(`   ${row.verification_status}: ${row.count}`);
    });
  }
}

backfillVerifications().catch(console.error);
