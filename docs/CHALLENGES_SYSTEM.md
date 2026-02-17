# Challenges & Resolution System (E)

## Overview
Le cœur de PULSE : un layer de vérité **disputable**. N'importe qui peut défier une assertion, la communauté vote, la vérité émerge.

## Workflow

```
┌─────────────┐     Challenge      ┌─────────────┐
│   PENDING   │ ─────────────────▶ │    OPEN     │
│  or         │   Stake 50 GENESIS │             │
│  VERIFIED   │                    │  24h voting │
└─────────────┘                    └──────┬──────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
            ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
            │    VALID    │       │   INVALID   │       │INCONCLUSIVE │
            │ (challenger │       │(challenger  │       │ (stake      │
            │   wins)     │       │  loses)     │       │  returned)  │
            └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
                   │                     │                     │
                   ▼                     ▼                     ▼
            ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
            │  REJECTED   │       │  VERIFIED   │       │   PENDING   │
            │             │       │             │       │             │
            └─────────────┘       └─────────────┘       └─────────────┘
```

## Règles de Résolution

### Quorum
- Minimum **1000 votes** pour résoudre
- Si quorum non atteint → `INCONCLUSIVE` (stake retourné)

### Majorité
- `> 50%` votes FOR → `VALID` (challenger gagne)
- `> 50%` votes AGAINST → `INVALID` (challenger perd)
- Égalité → `INCONCLUSIVE`

### Slash/Reward
| Résolution | Challenger | Voters gagnants |
|------------|------------|-----------------|
| VALID | Stake retourné + 10% reward | Partagent 5% du stake |
| INVALID | Stake slashé (50% burn, 50% aux winners) | Partagent le slash |
| INCONCLUSIVE | Stake retourné | Pas de reward |

## Tables

### challenges
```sql
challenge_id BIGINT UNIQUE -- ID public
event_id BIGINT -- Event challenged
challenger_address TEXT
challenger_stake NUMERIC
title TEXT
description TEXT
evidence_urls TEXT[]
status: OPEN | VOTING | RESOLVED
resolution: VALID | INVALID | INCONCLUSIVE
votes_for / votes_against NUMERIC
quorum_reached BOOLEAN
created_at / voting_ends_at TIMESTAMPTZ
```

### challenge_votes (audit trail)
```sql
challenge_id BIGINT
voter_address TEXT
vote BOOLEAN -- TRUE = for (valid)
stake NUMERIC
voted_at TIMESTAMPTZ
```

## UI

### /events/[id] — ChallengePanel
- **No Challenge** : CTA "Challenge Event" (si PENDING/VERIFIED)
- **Active Challenge** : 
  - Titre + description
  - Preuves (liens)
  - Barre de vote FOR/AGAINST
  - Temps restant
  - Stake du challenger
- **History** : Challenges résolus avec résultat

### Formulaire Create Challenge
- Titre (pourquoi c'est faux)
- Description (détails)
- Evidence URLs
- Stake (min 50 GENESIS)

## Automatisation (Triggers)

```sql
-- On INSERT challenge:
UPDATE events SET verification_status = 'DISPUTED'

-- On UPDATE challenge.status = 'RESOLVED':
IF resolution = 'VALID' THEN
  UPDATE events SET verification_status = 'REJECTED'
ELSIF resolution = 'INVALID' THEN
  UPDATE events SET verification_status = 'VERIFIED'
END IF
```

## Impact sur Crédibilité

| Statut Event | Confiance |
|--------------|-----------|
| VERIFIED | ✅ Haute (on-chain ou challenge gagné) |
| PENDING | ⏳ Moyenne (pas encore prouvé) |
| DISPUTED | ⚠️ Faible (en cours de révision) |
| REJECTED | ❌ Nulle (prouvé faux) |

## Paramètres (Configurables)

```typescript
const CHALLENGE_CONFIG = {
  minStake: 50,           // GENESIS
  votingPeriodHours: 24,
  quorumThreshold: 1000,  // votes
  rewardPercent: 10,      // for winning challenger
  slashBurnPercent: 50,   // of losing stake
  slashRewardPercent: 50  // to winning voters
};
```

## Philosophie

> "La vérité n'est pas décrétée, elle est **disputée et résolue**."

- Pas d'oracle centralisé
- Pas de modérateur
- Juste : stake + vote + math

## Prochaines Étapes (après E)

- [ ] Intégration wallet (signature tx)
- [ ] Smart contract on-chain
- [ ] Slash/reward automatique
- [ ] Reputation des voters
