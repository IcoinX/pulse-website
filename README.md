# PULSE Protocol - Enhanced Website

Real-Time Agent Intelligence Feed with advanced features.

## 🚀 Features

### 1. Real RSS Feed Integration
- **Crypto**: CoinDesk, CoinTelegraph, CryptoPotato
- **AI**: OpenAI Blog, Anthropic, arXiv AI, DeepMind
- **Tech**: TechCrunch, The Verge, Wired
- **Agents**: Hugging Face, LangChain Blog

### 2. Dynamic Event Detail Pages
- Route: `/event/[id]`
- Full article display
- Source, date, tags, impact level
- Share and bookmark functionality
- Related events suggestions

### 3. Advanced Filters
- **Search**: Full-text search across titles, content, and tags
- **Impact Filter**: Critical, High, Medium, Low
- **Date Range**: From/To date selection
- **Category Filter**: All, Crypto, AI, Tech, Agents

### 4. UI/UX Improvements
- **Animations**: Framer Motion scroll and hover effects
- **Loading States**: Skeleton loaders and spinners
- **Toast Notifications**: Success/error feedback with react-hot-toast
- **Dark/Light Mode**: Theme toggle with next-themes
- **Responsive Design**: Mobile-first approach

### 5. Performance
- **ISR**: Incremental Static Regeneration (5 min)
- **Caching**: 5-minute server-side cache
- **Edge Runtime**: API routes run on the edge
- **Optimized Images**: Next.js Image component

## 📁 Project Structure

```
pulse-website/
├── app/
│   ├── api/feeds/          # API routes for feed fetching
│   ├── event/[id]/         # Dynamic event detail pages
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout with ThemeProvider
│   ├── page.tsx            # Home page (Server Component)
│   └── HomeClient.tsx      # Home page client logic
├── components/
│   ├── FeedCard.tsx        # Individual feed card
│   ├── FeedSection.tsx     # Feed list with filters
│   ├── FilterBar.tsx       # Advanced filters UI
│   ├── Header.tsx          # Navigation header
│   ├── Sidebar.tsx         # Trending & stats sidebar
│   ├── ThemeProvider.tsx   # Theme context provider
│   └── ThemeToggle.tsx     # Dark/light mode toggle
├── lib/
│   ├── rss.ts              # RSS fetching logic
│   ├── data.ts             # Mock data fallback
│   └── cache.ts            # Caching utilities
├── types/
│   └── index.ts            # TypeScript types
└── vercel.json             # Vercel configuration
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Theming**: Next Themes

## 📦 Installation

```bash
npm install
```

## 🏃 Development

```bash
npm run dev
```

## 🔨 Build

```bash
npm run build
```

## 🚀 Deployment

The site is automatically deployed to Vercel on push to main.

### Environment Variables

No environment variables required for basic RSS feed functionality.

### API Endpoints

- `GET /api/feeds` - Fetch all feeds (cached 5 min)
- `GET /api/feeds/[id]` - Fetch specific feed by ID

## 📝 RSS Feed Sources

### Crypto
- CoinDesk: `https://www.coindesk.com/arc/outboundfeeds/rss/`
- CoinTelegraph: `https://cointelegraph.com/rss`
- CryptoPotato: `https://cryptopotato.com/feed/`

### AI
- OpenAI Blog: `https://openai.com/blog/rss.xml`
- Anthropic: `https://www.anthropic.com/blog/rss.xml`
- arXiv AI: `http://export.arxiv.org/rss/cs.AI`
- DeepMind: `https://deepmind.google/blog/rss/`

### Tech
- TechCrunch: `https://techcrunch.com/feed/`
- The Verge: `https://www.theverge.com/rss/index.xml`
- Wired: `https://www.wired.com/feed/rss`

### Agents
- Hugging Face: `https://huggingface.co/blog/feed.xml`
- LangChain: `https://blog.langchain.dev/rss/`

## 🔧 Configuration

### ISR Revalidation
- Default: 300 seconds (5 minutes)
- Configured in `page.tsx` and `route.ts` files

### Cache Headers
- `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`
- Configured in `vercel.json`

## 📊 Performance Metrics

- **Build Time**: ~30s
- **Page Load**: < 1s (cached)
- **API Response**: < 500ms (with cache)
- **Revalidation**: Every 5 minutes

## 🐛 Troubleshooting

### RSS Feed Not Loading
1. Check feed URL accessibility
2. Verify XML format
3. Check browser console for errors

### Build Errors
1. Ensure all dependencies installed: `npm install`
2. Check TypeScript errors: `npx tsc --noEmit`
3. Clear Next.js cache: `rm -rf .next`

## 📄 License

MIT License - Built for the agent economy.

## 🔗 Links

- Website: https://pulseprotocol.co
- GitHub: https://github.com/IcoinX/pulse-website
- Twitter: https://twitter.com/Clara_AGI2026
