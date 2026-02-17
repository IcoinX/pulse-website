# Verification System (C)

## Overview
Strict, verifiable status system for PULSE events. No marketing fluff — only objective rules.

## Statuses

| Status | Badge | Rule | Source |
|--------|-------|------|--------|
| **VERIFIED** | 🛡️ Green | On-chain proof or resolved challenge | `ONCHAIN`, `GENESIS` sources |
| **PENDING** | ⏳ Yellow | Social/news ingested, awaiting proof | `AGENT`, `AI`, `CRYPTO`, `X`, `GITHUB` |
| **DISPUTED** | ⚠️ Orange | Active challenge open | Challenge created for event |
| **REJECTED** | ❌ Red | Final rejection after challenge resolution | Challenge resolved as false |

## Database Schema

```sql
ALTER TABLE events ADD COLUMN verification_status TEXT DEFAULT 'PENDING';
ALTER TABLE events ADD COLUMN verification_reason TEXT;
ALTER TABLE events ADD COLUMN verified_at TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN verified_by TEXT; -- onchain, oracle, admin, agent:<id>

-- Constraint
CHECK (verification_status IN ('VERIFIED', 'PENDING', 'DISPUTED', 'REJECTED'))
```

## Rules (Objective Only)

### VERIFIED
- Event from on-chain source (tx hash present)
- Challenge resolved in favor of truth
- Oracle attestation submitted

### PENDING
- Social media post ingested
- News article indexed
- No contradictory evidence yet

### DISPUTED
- At least 1 challenge with status `OPEN`
- Contradicting evidence submitted
- Under community review

### REJECTED
- Challenge resolved as `false` or `invalid`
- Evidence proven fabricated
- Never based on "feeling" or text analysis

## Pipeline Automation

### Ingestion (auto-set)
```javascript
if (['ONCHAIN', 'GENESIS'].includes(sourceType)) {
  status = 'VERIFIED';
  verified_by = 'onchain';
  verified_at = NOW();
} else {
  status = 'PENDING';
}
```

### Challenge Created
```javascript
// When challenge is created for event:
UPDATE events 
SET verification_status = 'DISPUTED',
    verification_reason = 'Active challenge: ' + challenge_title
WHERE event_id = challenged_event_id;
```

### Challenge Resolved
```javascript
// When challenge is resolved:
if (resolution === 'valid') {
  UPDATE events SET verification_status = 'VERIFIED';
} else {
  UPDATE events SET verification_status = 'REJECTED';
}
```

## UI Components

### EventCard
- Badge with icon + status label
- Tooltip: "Why" explanation
- Color-coded by status

### Event Detail (/events/[id])
- Full VerificationBlock
- Status badge large
- Reason text
- Verified by / timestamp
- On-chain proof link (if VERIFIED)
- Boost/challenge counts

## Testing

```bash
# Backfill existing events
node scripts/backfill_verifications.js

# Run tests
node scripts/test_verification.js
```

## Migration

Execute in Supabase Dashboard:

```sql
-- File: supabase/migrations/002_add_verification_system.sql
ALTER TABLE events 
ADD COLUMN verification_status TEXT DEFAULT 'PENDING',
ADD COLUMN verification_reason TEXT,
ADD COLUMN verified_at TIMESTAMPTZ,
ADD COLUMN verified_by TEXT;

ALTER TABLE events 
ADD CONSTRAINT valid_verification_status 
CHECK (verification_status IN ('VERIFIED', 'PENDING', 'DISPUTED', 'REJECTED'));

CREATE INDEX idx_events_verification_status ON events(verification_status);
```

## Philosophy

> "Verified is the heart of PULSE. Without strict rules, credibility dies."

- No AI "confidence scores"
- No sentiment analysis
- No "probably true"
- Only: **proven** / **pending** / **disputed** / **rejected**
