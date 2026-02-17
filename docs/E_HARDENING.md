# E-HARDENING: Test & Validate Challenges System

## Phase E-T1: Controlled Real Tests

### Setup
```bash
# 1. Execute SQL migration in Supabase Dashboard
# File: supabase/migrations/003_add_challenges_system.sql

# 2. Create test challenges
# File: supabase/migrations/E-T1_create_test_challenges.sql

# 3. Run automated test suite
node scripts/E_test_suite.js
```

### Test Matrix

| Test ID | Scenario | Event Status | Challenge Status | Expected Result | Verification |
|---------|----------|--------------|------------------|-----------------|--------------|
| E-T1-01 | Challenger wins (VALID) | PENDING → REJECTED | OPEN → RESOLVED | Event marked false | ✅/❌ |
| E-T1-02 | Challenger loses (INVALID) | PENDING → VERIFIED | OPEN → RESOLVED | Event marked true | ✅/❌ |
| E-T1-03 | No quorum (INCONCLUSIVE) | PENDING → PENDING | OPEN → RESOLVED | Stake returned | ✅/❌ |
| E-T1-04 | Tie vote | PENDING → PENDING | OPEN → RESOLVED | Stake returned | ✅/❌ |
| E-T1-05 | Fresh challenge | PENDING → DISPUTED | OPEN | Voting enabled | ✅/❌ |

### Manual Verification Checklist

- [ ] Challenge appears on /events/[id]
- [ ] Event status updates to DISPUTED
- [ ] Feed shows DISPUTED badge
- [ ] Agent page shows DISPUTED status
- [ ] Resolution updates event status
- [ ] History shows past challenges

---

## Phase E-T2: Anti-Abuse & Edge Cases

### Attack Vectors

| Attack | Prevention | Test |
|--------|------------|------|
| Spam challenges | Min stake 50 GENESIS | Try create with 10 GENESIS |
| Double challenge | One active per event | Try challenge already disputed |
| No-vote challenge | 24h timeout | Check auto-resolution |
| Sybil voting | Quorum 1000 | Verify vote aggregation |
| Late voting | Hard deadline | Try vote after expiration |

### Edge Cases

```javascript
// Test: Quorum boundaries
{ for: 500, against: 500, total: 1000 }    // Exactly quorum
{ for: 499, against: 500, total: 999 }     // Just under
{ for: 501, against: 500, total: 1001 }    // Just over

// Test: Stake boundaries  
{ stake: 49 }   // Should fail (< min)
{ stake: 50 }   // Should pass (exact min)
{ stake: 5000 } // Should pass (high stake)

// Test: Resolution timing
{ created: 'now', ends: 'now + 23h' }      // Still voting
{ created: 'now - 25h', ends: 'now - 1h' } // Expired
```

### Automated Tests

```bash
# Run full anti-abuse test suite
node scripts/E_test_suite.js

# Expected output:
# ✅ Double challenge prevention
# ✅ Minimum stake enforcement
# ✅ Expiration handling
# ✅ Quorum edge cases
```

---

## Phase E-T3: UX & Comprehension

### 10-Second Test

Can you explain this to a friend in 10 seconds?

> "Events start as pending. Anyone can challenge by staking $25. 
> Community votes for 24h. If challenger wins, event is marked false 
> and they get rewarded. If they lose, they lose their stake."

### Visual Hierarchy Test

Open /events/[id] with an active challenge. Close your eyes for 5 seconds, open them:

- [ ] Can you immediately see the challenge?
- [ ] Do you understand what's being disputed?
- [ ] Can you see the voting progress?
- [ ] Do you understand the economic risk/reward?

### Color Semantics

| Status | Color | Intuitive? | Notes |
|--------|-------|------------|-------|
| PENDING | Yellow ⏳ | ✅ | Waiting, caution |
| DISPUTED | Orange ⚠️ | ✅ | Attention needed |
| VERIFIED | Green ✅ | ✅ | Validated, safe |
| REJECTED | Red ❌ | ✅ | False, dangerous |

### Economic Perception

At $0.50/GENESIS:
- Min stake: $25 (accessible but not trivial)
- Win reward: $2.50 (10%)
- Loss penalty: $12.50 (50% slash)
- **Verdict**: ✅ Asymmetric risk/reward

---

## Browser Console Testing

```javascript
// Load UX test helper
copy(JSON.stringify(localStorage.getItem('pulse_test_challenges')))

// Or paste E_UX_test_helper.js in console

// Run tests
PULSE_UX_TEST.runAll()
PULSE_UX_TEST.quickTest()

// Create test challenge
PULSE_UX_TEST.createTestChallenge(12345, {
  title: 'Test: Suspicious claim',
  stake: 50
})
```

---

## Success Criteria

### E is "Hardened" when:

- [ ] All 5 resolution paths tested ✅
- [ ] No double-challenge possible ✅
- [ ] Quorum respected in all cases ✅
- [ ] Stakes enforced ✅
- [ ] Expiration handled ✅
- [ ] Status propagates everywhere ✅
- [ ] 10-second explanation works ✅
- [ ] Visual hierarchy clear ✅
- [ ] Economic incentives aligned ✅

### Then we can do F (Notifications)

---

## Cleanup

```bash
# Remove test data
node scripts/E_test_suite.js --cleanup
```

## Documentation

- `/docs/CHALLENGES_SYSTEM.md` - Technical spec
- `/docs/E_HARDENING.md` - This file
- `/scripts/E_test_suite.js` - Automated tests
- `/scripts/E_UX_test_helper.js` - Browser console helper
