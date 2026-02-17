const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function showMappingStats() {
  console.log('📊 Agent-Event Mapping Observability\n');
  console.log('=====================================\n');
  
  // Check if columns exist
  const { error: colError } = await supabase
    .from('events')
    .select('agent_slug')
    .limit(1);
  
  if (colError && colError.message.includes('column')) {
    console.log('❌ Database columns not created yet');
    console.log('\n⚠️  Run this SQL in Supabase Dashboard:');
    console.log('ALTER TABLE events ADD COLUMN agent_slug TEXT;');
    console.log('ALTER TABLE events ADD COLUMN agent_symbol TEXT;');
    return;
  }
  
  console.log('✅ Database columns exist\n');
  
  // Get total AGENT events
  const { count: totalEvents, error: countError } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .or('source_type.eq.AGENT,title.ilike.%agent%');
  
  if (countError) {
    console.error('Error counting events:', countError.message);
    return;
  }
  
  // Get mapped events
  const { count: mappedEvents, error: mappedError } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .not('agent_slug', 'is', null);
  
  if (mappedError) {
    console.error('Error counting mapped events:', mappedError.message);
    return;
  }
  
  // Stats
  const percentage = totalEvents > 0 ? Math.round((mappedEvents / totalEvents) * 100) : 0;
  const unmapped = totalEvents - mappedEvents;
  
  console.log(`📈 Coverage: ${mappedEvents}/${totalEvents} (${percentage}%)`);
  console.log(`   ✅ Mapped: ${mappedEvents}`);
  console.log(`   ⏭️  Unmapped: ${unmapped}\n`);
  
  // Get breakdown by agent
  const { data: agentBreakdown, error: breakdownError } = await supabase
    .from('events')
    .select('agent_slug, agent_symbol, count(*)')
    .not('agent_slug', 'is', null)
    .group('agent_slug, agent_symbol');
  
  if (!breakdownError && agentBreakdown) {
    console.log('📋 Mapped by Agent:');
    agentBreakdown.forEach(row => {
      console.log(`   ${row.agent_symbol || row.agent_slug}: ${row.count} events`);
    });
    console.log('');
  }
  
  // Get unmapped events sample
  if (unmapped > 0) {
    const { data: unmappedEvents, error: unmappedError } = await supabase
      .from('events')
      .select('event_id, title, source_type')
      .or('source_type.eq.AGENT,title.ilike.%agent%')
      .is('agent_slug', null)
      .limit(5);
    
    if (!unmappedError && unmappedEvents && unmappedEvents.length > 0) {
      console.log('🔍 Sample Unmapped Events:');
      unmappedEvents.forEach(evt => {
        const reason = !evt.title.match(/(VIRTUAL|AIXBT|LUNA|BASEAI|TKB|BID|Virtuals|Aixbt|Luna|Tokenbot)/i) 
          ? 'no_symbol' 
          : 'ambiguous';
        console.log(`   [${reason}] "${evt.title.substring(0, 50)}..."`);
      });
      console.log('');
    }
  }
  
  // Recommendations
  console.log('💡 Recommendations:');
  if (percentage < 50) {
    console.log('   • Run: node scripts/map_agent_events.js');
    console.log('   • Check ingestion script for symbol extraction');
  }
  if (percentage >= 80) {
    console.log('   ✅ Good coverage! Monitor for new agents.');
  }
  console.log('   • Add new agent symbols to AGENT_REGISTRY');
  console.log('   • Review ambiguous titles for manual mapping');
}

showMappingStats().catch(console.error);
