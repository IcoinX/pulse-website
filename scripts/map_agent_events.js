const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ==================== CREATE COLUMNS VIA WORKAROUND ====================
// Since we can't execute DDL directly, we'll create a separate mapping table

async function createMappingTable() {
  // Check if table exists by trying to select
  const { error } = await supabase
    .from('event_agent_mappings')
    .select('id')
    .limit(1);
  
  if (error && error.message.includes('does not exist')) {
    console.log('⚠️  Mapping table does not exist');
    console.log('Please run this SQL in Supabase Dashboard:');
    console.log(`
CREATE TABLE IF NOT EXISTS event_agent_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id BIGINT REFERENCES events(event_id),
  agent_slug TEXT NOT NULL,
  agent_symbol TEXT,
  mapping_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_event_agent_mappings_event_id ON event_agent_mappings(event_id);
CREATE INDEX idx_event_agent_mappings_slug ON event_agent_mappings(agent_slug);
    `);
    return false;
  }
  
  console.log('✅ Mapping table exists');
  return true;
}

// ==================== AGENT REGISTRY ====================
const AGENT_REGISTRY = [
  { slug: 'virtuals-protocol', symbol: 'VIRTUAL', name: 'Virtuals Protocol', aliases: ['virtual', 'virtuals'] },
  { slug: 'luna-agent', symbol: 'LUNA', name: 'Luna Agent', aliases: ['luna'] },
  { slug: 'base-agent', symbol: 'BASEAI', name: 'Base Agent', aliases: ['baseai', 'base agent'] },
  { slug: 'aixbt', symbol: 'AIXBT', name: 'Aixbt by Virtuals', aliases: ['aixbt', 'aixbt by virtuals'] },
  { slug: 'tokenbot', symbol: 'TKB', name: 'Tokenbot', aliases: ['tokenbot', 'tkb'] },
  { slug: 'creator-bid', symbol: 'BID', name: 'Creator.bid', aliases: ['creator.bid', 'creator bid', 'bid'] }
];

// ==================== MAPPING LOGIC ====================

function normalize(text) {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/[.,!?;:'"()[\]]/g, '').replace(/\s+/g, ' ');
}

function extractSymbols(title) {
  const symbols = [];
  const dollarMatches = title.match(/\$([A-Z]{2,10})/g);
  if (dollarMatches) symbols.push(...dollarMatches.map(s => s.replace('$', '')));
  
  const capsMatches = title.match(/\b[A-Z]{2,10}\b/g);
  if (capsMatches) symbols.push(...capsMatches);
  
  AGENT_REGISTRY.forEach(agent => {
    if (new RegExp(`\\b${agent.symbol}\\b`, 'i').test(title)) {
      symbols.push(agent.symbol);
    }
  });
  
  return [...new Set(symbols)];
}

function findBySymbol(symbol) {
  if (!symbol) return null;
  const matches = AGENT_REGISTRY.filter(a => a.symbol.toUpperCase() === symbol.toUpperCase().trim());
  return matches.length === 1 ? matches[0] : null;
}

function findByName(title) {
  if (!title) return null;
  const normalizedTitle = normalize(title);
  
  let matches = AGENT_REGISTRY.filter(a => normalizedTitle.includes(normalize(a.name)));
  if (matches.length === 1) return matches[0];
  
  matches = AGENT_REGISTRY.filter(a => a.aliases.some(alias => normalizedTitle.includes(alias)));
  return matches.length === 1 ? matches[0] : null;
}

function mapEventToAgent(event) {
  if (event.source_type !== 'AGENT' && !event.title?.toLowerCase().includes('agent')) {
    return { slug: null, symbol: null, reason: 'not_agent_event' };
  }
  
  const symbols = extractSymbols(event.title);
  for (const symbol of symbols) {
    const agent = findBySymbol(symbol);
    if (agent) return { slug: agent.slug, symbol: agent.symbol, reason: 'symbol_match', matched_symbol: symbol };
  }
  
  const agent = findByName(event.title);
  if (agent) return { slug: agent.slug, symbol: agent.symbol, reason: 'name_match' };
  
  if (symbols.length > 1) return { slug: null, symbol: null, reason: 'ambiguous_symbols', symbols };
  
  return { slug: null, symbol: null, reason: 'no_match' };
}

// ==================== STORAGE ====================

let columnsExist = null;

async function checkColumnsExist() {
  if (columnsExist !== null) return columnsExist;
  
  const { error } = await supabase
    .from('events')
    .select('agent_slug')
    .limit(1);
  
  columnsExist = !error || !error.message.includes('column');
  return columnsExist;
}

async function storeMapping(eventId, mapping) {
  const hasColumns = await checkColumnsExist();
  
  if (hasColumns) {
    // Try events table
    const { error } = await supabase
      .from('events')
      .update({ agent_slug: mapping.slug, agent_symbol: mapping.symbol })
      .eq('event_id', eventId);
    
    if (!error) {
      return { table: 'events', success: true };
    }
  }
  
  // Fallback to mapping table
  console.log(`   Storing to mapping table: event_id=${eventId}, slug=${mapping.slug}`);
  
  const { error: mapError, data: mapData } = await supabase
    .from('event_agent_mappings')
    .upsert({
      event_id: eventId,
      agent_slug: mapping.slug,
      agent_symbol: mapping.symbol,
      mapping_reason: mapping.reason
    }, { onConflict: 'event_id' });
  
  if (!mapError) {
    return { table: 'event_agent_mappings', success: true };
  }
  
  console.log(`   ❌ Mapping table error:`, mapError.message);
  return { table: null, success: false, error: mapError };
}

// ==================== MAIN ====================

async function main() {
  console.log('🗺️  Agent Event Mapping Pipeline\n');
  
  // Check table
  const tableExists = await createMappingTable();
  
  // Get unmapped AGENT events (don't select agent_slug if column doesn't exist)
  const { data: events, error } = await supabase
    .from('events')
    .select('id, event_id, title, source_type')
    .or('source_type.eq.AGENT,title.ilike.%agent%')
    .limit(50);
  
  if (error) {
    console.error('❌ Error fetching events:', error.message);
    return;
  }
  
  console.log(`📊 Found ${events?.length || 0} unmapped events\n`);
  
  if (!events || events.length === 0) {
    console.log('✅ All events mapped');
    return;
  }
  
  // Process
  let updated = 0;
  let failed = 0;
  const reasons = {};
  
  for (const event of events) {
    const mapping = mapEventToAgent(event);
    
    if (mapping.slug) {
      const result = await storeMapping(event.event_id, mapping);
      
      if (result.success) {
        updated++;
        console.log(`✅ [${mapping.reason}] "${event.title.substring(0, 45)}..." → ${mapping.slug} (${result.table})`);
      } else {
        failed++;
        console.log(`❌ Failed: "${event.title.substring(0, 45)}..."`);
        console.log(`   Error: ${result.error?.message || 'Unknown'}`);
      }
    } else {
      reasons[mapping.reason] = (reasons[mapping.reason] || 0) + 1;
    }
  }
  
  console.log(`\n📈 Results:`);
  console.log(`   ✅ Mapped: ${updated}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${events.length - updated - failed}`);
  
  console.log(`\n📋 Skipped reasons:`);
  Object.entries(reasons).forEach(([r, c]) => console.log(`   ${r}: ${c}`));
  
  console.log(`\n⚠️  To add columns to events table, run in Supabase Dashboard:`);
  console.log(`   ALTER TABLE events ADD COLUMN agent_slug TEXT;`);
  console.log(`   ALTER TABLE events ADD COLUMN agent_symbol TEXT;`);
}

main().catch(console.error);
