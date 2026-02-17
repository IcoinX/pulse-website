# Agent-Event Mapping Setup

## Current Status
✅ Mapping logic implemented in ingestion script
✅ Events now include `agent_slug` and `agent_symbol` when created
⚠️ Database columns need to be added for full functionality

## Required Database Migration

Execute this SQL in Supabase Dashboard:

```sql
-- Add agent mapping columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS agent_slug TEXT,
ADD COLUMN IF NOT EXISTS agent_symbol TEXT;

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_events_agent_slug ON events(agent_slug);
CREATE INDEX IF NOT EXISTS idx_events_agent_symbol ON events(agent_symbol);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name IN ('agent_slug', 'agent_symbol');
```

## Mapping Strategy

Events are mapped to agents using this priority:

1. **Symbol exact match** (highest confidence)
   - `$VIRTUAL`, `$AIXBT`, `$LUNA`, `$BASEAI`, `$TKB`, `$BID`
   - Maps directly to agent slug

2. **Name normalized match**
   - "virtuals", "aixbt", "luna agent", "base agent", "tokenbot", "creator.bid"
   - Case-insensitive, punctuation removed

3. **No mapping** if ambiguous or unknown
   - Events with multiple possible agents stay unmapped
   - Prevents false positives

## UI Updates After Migration

Once columns are added:

1. `/agents/[slug]` will show "Agent News" filtered by `agent_slug`
2. `/events/[id]` will show "View Agent" link if `agent_slug` is set
3. Dashboard will show mapping coverage %

## Manual Migration (New Events)

```bash
cd /data/.openclaw/workspace/pulse-website
node scripts/ingest_feeds.js  # New events will have agent_slug
```

## Backfill Existing Events

After adding columns:

```bash
node scripts/map_agent_events.js  # Maps unmapped AGENT events
```

## Monitoring

Check mapping coverage:
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://plojsqsjykzqwdaolfpi.supabase.co', '...');

async function stats() {
  const { count: total } = await supabase.from('events').select('*', { count: 'exact' }).or('source_type.eq.AGENT,title.ilike.%agent%');
  const { count: mapped } = await supabase.from('events').select('*', { count: 'exact' }).not('agent_slug', 'is', null);
  console.log(\`Mapped: \${mapped}/\${total} (\${Math.round(mapped/total*100)}%)\`);
}
stats();
"
```
