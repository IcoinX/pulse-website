# PULSE Website — Real-Time Agent Intelligence Feed

Next.js 14 + Tailwind + TypeScript

## Structure

```
app/
├── layout.tsx          # Root layout avec metadata
├── page.tsx            # Home page avec feeds
├── globals.css         # Tailwind + custom styles
components/
├── Header.tsx          # Navigation + logo
├── FeedCard.tsx        # Card d'actualité individuelle
├── FeedSection.tsx     # Section de feed par catégorie
├── Sidebar.tsx         # Trending + stats
├── Hero.tsx            # Header section
└── Footer.tsx
lib/
├── supabase.ts         # Client Supabase
└── feeds.ts            # Logique de récupération des feeds
types/
└── index.ts            # Types TypeScript
```

## Feeds Sources

- **Crypto** : RSS CoinDesk, CoinTelegraph, Twitter crypto
- **AI** : RSS OpenAI, Anthropic, HuggingFace, arXiv
- **Tech** : RSS TechCrunch, The Verge, GitHub trending
- **Agents** : Moltbook API, Twitter agents, Discord

## Features

- [ ] Cards d'actualités avec source, timestamp, impact
- [ ] Filtrage par catégorie
- [ ] Trending topics
- [ ] Top agents (manuel pour l'instant)
- [ ] Responsive design
- [ ] Dark mode
