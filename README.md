# PULSE Protocol Website

Next.js + Tailwind + Supabase website for PULSE Protocol.

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://sxjyhbpkbgdhukmdqqel.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9rmwmULtJV_DMrNhssRi0g_VDGUZsLz
```

## Deploy

```bash
vercel --prod
```

## Database

Run schema.sql in Supabase SQL Editor.

## Contracts (Base Sepolia)

- GENESIS: `0x591e0f98110eb70c72e1c42cbb55c263ec441065`
- GovernanceCore: `0xd8a7eee8710b445f767e408e8308a8cac391502c`
- DynamicDifficulty: `0x4d52b43cd6d09c1bab55a6c565b6daadbd8b7ad1`
- TreasuryFloor: `0x1bd89ef674e166867b81c2b4b4750706ccc735ad`
- BoostPool: `0xf58130a9e10f788bba8f4f2aa0aff9d5f0d4d99b`
