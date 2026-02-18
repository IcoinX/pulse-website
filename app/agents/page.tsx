'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import AlertsPanel from '@/components/AlertsPanel';
import { getUnreadCount } from '@/lib/alerts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Zap,
  ArrowUpRight,
  Bot,
  Flame,
  Target,
  Globe,
  Sparkles,
  Star,
  Filter,
  ChevronDown,
  Database,
  Bell
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== TYPES ====================

interface Agent {
  id: string;
  slug: string;
  name: string;
  symbol: string;
  description: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  launchedAt: string;
  category: string;
  status: 'trending' | 'new' | 'established';
  score: number;
  sparkline24h: number[];
  tokenAddress?: string;
}

interface AgentEvent {
  id: string;
  title: string;
  created_at: string;
  source_type: string;
  status: string;
}

type SortBy = 'score' | 'volume' | 'mcap' | 'holders' | 'change';
type FilterBy = 'all' | 'trending' | 'new' | 'infrastructure' | 'trading' | 'defi';

// ==================== DATA ====================

const AGENTS_DATA: Agent[] = [
  {
    id: '1',
    slug: 'virtuals-protocol',
    name: 'Virtuals Protocol',
    symbol: 'VIRTUAL',
    description: 'Decentralized agent creation and monetization platform on Base',
    price: 0.145,
    priceChange24h: +12.5,
    volume24h: 2450000,
    marketCap: 145000000,
    holders: 15420,
    launchedAt: '2024-01-15',
    category: 'Infrastructure',
    status: 'trending',
    score: 87.4,
    sparkline24h: [0.128, 0.131, 0.129, 0.133, 0.135, 0.134, 0.138, 0.142, 0.140, 0.143, 0.141, 0.145]
  },
  {
    id: '2',
    slug: 'luna-agent',
    name: 'Luna Agent',
    symbol: 'LUNA',
    description: 'AI-powered social agent with autonomous trading capabilities',
    price: 0.082,
    priceChange24h: +28.3,
    volume24h: 1890000,
    marketCap: 82000000,
    holders: 8900,
    launchedAt: '2024-02-01',
    category: 'AI Trading',
    status: 'trending',
    score: 92.1,
    sparkline24h: [0.064, 0.065, 0.068, 0.072, 0.071, 0.075, 0.078, 0.076, 0.080, 0.079, 0.081, 0.082]
  },
  {
    id: '3',
    slug: 'base-agent',
    name: 'Base Agent',
    symbol: 'BASEAI',
    description: 'Official Base ecosystem agent for on-chain operations',
    price: 0.034,
    priceChange24h: +8.7,
    volume24h: 920000,
    marketCap: 34000000,
    holders: 5600,
    launchedAt: '2024-01-28',
    category: 'Ecosystem',
    status: 'established',
    score: 71.3,
    sparkline24h: [0.031, 0.032, 0.031, 0.033, 0.032, 0.034, 0.033, 0.035, 0.034, 0.033, 0.034, 0.034]
  },
  {
    id: '4',
    slug: 'aixbt',
    name: 'Aixbt by Virtuals',
    symbol: 'AIXBT',
    description: 'Crypto market intelligence agent analyzing X and on-chain data',
    price: 0.156,
    priceChange24h: +45.2,
    volume24h: 4100000,
    marketCap: 156000000,
    holders: 22100,
    launchedAt: '2024-02-10',
    category: 'Analytics',
    status: 'trending',
    score: 95.8,
    sparkline24h: [0.108, 0.112, 0.115, 0.118, 0.125, 0.132, 0.138, 0.145, 0.142, 0.148, 0.152, 0.156]
  },
  {
    id: '5',
    slug: 'tokenbot',
    name: 'Tokenbot',
    symbol: 'TKB',
    description: 'Automated token deployment and management agent',
    price: 0.023,
    priceChange24h: -5.2,
    volume24h: 450000,
    marketCap: 23000000,
    holders: 3200,
    launchedAt: '2024-02-14',
    category: 'DeFi',
    status: 'new',
    score: 58.9,
    sparkline24h: [0.024, 0.025, 0.024, 0.023, 0.024, 0.022, 0.023, 0.021, 0.022, 0.023, 0.022, 0.023]
  },
  {
    id: '6',
    slug: 'creator-bid',
    name: 'Creator.bid',
    symbol: 'BID',
    description: 'Platform for creating and bidding on AI agent services',
    price: 0.067,
    priceChange24h: +15.8,
    volume24h: 780000,
    marketCap: 67000000,
    holders: 7800,
    launchedAt: '2024-01-20',
    category: 'Marketplace',
    status: 'trending',
    score: 79.5,
    sparkline24h: [0.058, 0.059, 0.060, 0.061, 0.060, 0.062, 0.063, 0.064, 0.065, 0.066, 0.065, 0.067]
  }
];

// ==================== UTILS ====================

function formatNumber(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function formatTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function calculateScore(agent: Agent): number {
  // Formula: log(volume) * 0.4 + price_change * 0.3 + log(holders) * 0.3
  const volumeScore = Math.log10(agent.volume24h) * 10;
  const changeScore = Math.abs(agent.priceChange24h) * 0.5;
  const holdersScore = Math.log10(agent.holders) * 10;
  return Math.min(100, Math.round((volumeScore * 0.4 + changeScore * 0.3 + holdersScore * 0.3) * 10) / 10);
}

// ==================== COMPONENTS ====================

function Sparkline({ data, width = 80, height = 30 }: { data: number[]; width?: number; height?: number }) {
  if (!data || data.length < 2) return <div className={`w-[${width}px] h-[${height}px]`} />;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  const isPositive = data[data.length - 1] >= data[0];
  const color = isPositive ? '#22c55e' : '#ef4444';
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScoreBadge({ score }: { score: number }) {
  let color = 'text-gray-400';
  let bg = 'bg-gray-500/10';
  
  if (score >= 80) {
    color = 'text-green-400';
    bg = 'bg-green-500/10';
  } else if (score >= 60) {
    color = 'text-yellow-400';
    bg = 'bg-yellow-500/10';
  }
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${bg} ${color} text-xs font-medium`} 
         title={`Score: log(volume)×0.4 + price_change×0.3 + log(holders)×0.3 = ${score}`}>
      <Zap className="w-3 h-3" />
      {score.toFixed(1)}
    </div>
  );
}

function WatchButton({ slug }: { slug: string }) {
  const [isWatched, setIsWatched] = useState(false);
  
  useEffect(() => {
    const watchlist = JSON.parse(localStorage.getItem('pulse_watchlist') || '[]');
    setIsWatched(watchlist.includes(slug));
  }, [slug]);
  
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    const watchlist = JSON.parse(localStorage.getItem('pulse_watchlist') || '[]');
    const newWatchlist = isWatched 
      ? watchlist.filter((s: string) => s !== slug)
      : [...watchlist, slug];
    localStorage.setItem('pulse_watchlist', JSON.stringify(newWatchlist));
    setIsWatched(!isWatched);
  };
  
  return (
    <button 
      onClick={toggle}
      className={`p-1.5 rounded transition-colors ${isWatched ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}
      title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <Star className={`w-4 h-4 ${isWatched ? 'fill-yellow-400' : ''}`} />
    </button>
  );
}

function AgentCard({ agent, rank }: { agent: Agent; rank: number }) {
  return (
    <Link href={`/agents/${agent.slug}`} className="block">
      <div className="bg-white/5 rounded-xl border border-white/10 p-5 hover:border-white/20 transition-all group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
              {agent.symbol[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">{agent.name}</span>
                {agent.status === 'trending' && <Flame className="w-4 h-4 text-orange-400" />}
                {agent.status === 'new' && <Sparkles className="w-4 h-4 text-yellow-400" />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-500">{agent.symbol}</span>
                <ScoreBadge score={agent.score} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WatchButton slug={agent.slug} />
            <span className="text-2xl font-bold text-gray-600">#{rank}</span>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{agent.description}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Price</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">${agent.price.toFixed(4)}</span>
              <span className={`text-xs ${agent.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {agent.priceChange24h >= 0 ? '+' : ''}{agent.priceChange24h.toFixed(1)}%
              </span>
            </div>
            <div className="mt-2">
              <Sparkline data={agent.sparkline24h} />
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Volume 24h</div>
            <span className="text-lg font-semibold">{formatNumber(agent.volume24h)}</span>
            <div className="mt-4 text-xs text-gray-500">
              MC: {formatNumber(agent.marketCap)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{agent.holders.toLocaleString()} holders</span>
          </div>
          <span className="text-xs text-gray-500">{agent.category}</span>
        </div>
      </div>
    </Link>
  );
}

function EventItem({ event }: { event: AgentEvent }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-2 h-2 rounded-full bg-purple-400 mt-2" />
      <div className="flex-1">
        <p className="text-sm text-gray-300">{event.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{event.source_type}</span>
          <span className="text-gray-600">•</span>
          <span className="text-xs text-gray-500">{formatTimeAgo(event.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

function DataProvenance() {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-white">On-Chain Data</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-gray-500">Last Sync</span>
          <p className="text-gray-300">Just now</p>
        </div>
        <div>
          <span className="text-gray-500">Block</span>
          <p className="text-gray-300">#38,452,891</p>
        </div>
        <div>
          <span className="text-gray-500">Network</span>
          <p className="text-blue-400">Base Mainnet</p>
        </div>
        <div>
          <span className="text-gray-500">Contracts</span>
          <p className="text-green-400">Verified</p>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function AgentsPage() {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  
  // Load watchlist and alerts
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('pulse_watchlist') || '[]');
    setWatchlist(saved);
    setUnreadAlerts(getUnreadCount());
    
    // Refresh alerts count every 30s
    const interval = setInterval(() => {
      setUnreadAlerts(getUnreadCount());
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Load events
  useEffect(() => {
    supabase
      .from('events')
      .select('id, title, created_at, source_type, status')
      .or('source_type.eq.AGENT,source_type.eq.AI')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setEvents(data);
        setLoading(false);
      });
  }, []);
  
  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    let agents = [...AGENTS_DATA];
    
    // Apply filter
    if (filterBy === 'trending') agents = agents.filter(a => a.status === 'trending');
    else if (filterBy === 'new') agents = agents.filter(a => a.status === 'new');
    else if (filterBy === 'infrastructure') agents = agents.filter(a => a.category === 'Infrastructure');
    else if (filterBy === 'trading') agents = agents.filter(a => a.category === 'AI Trading');
    else if (filterBy === 'defi') agents = agents.filter(a => a.category === 'DeFi');
    
    // Apply sort
    agents.sort((a, b) => {
      switch (sortBy) {
        case 'score': return b.score - a.score;
        case 'volume': return b.volume24h - a.volume24h;
        case 'mcap': return b.marketCap - a.marketCap;
        case 'holders': return b.holders - a.holders;
        case 'change': return b.priceChange24h - a.priceChange24h;
        default: return b.score - a.score;
      }
    });
    
    return agents;
  }, [sortBy, filterBy]);
  
  const trendingAgents = AGENTS_DATA.filter(a => a.status === 'trending').slice(0, 4);
  const watchedAgents = AGENTS_DATA.filter(a => watchlist.includes(a.slug));
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-purple-400 hover:text-purple-300">
              PULSE
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-400">Agents</span>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Back to Feed
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Bot className="w-8 h-8 text-purple-400" />
            AI Agents on Base
          </h1>
          <p className="text-gray-400">
            Track, verify, and trade the hottest AI agents. All data on-chain, scores transparent.
          </p>
        </div>

        {/* Data Provenance */}
        <DataProvenance />

        {/* Alerts Panel */}
        {unreadAlerts > 0 && (
          <div className="mb-6">
            <AlertsPanel onClose={() => setShowAlertsPanel(false)} />
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-500">Agents Tracked</span>
            </div>
            <span className="text-2xl font-bold">{AGENTS_DATA.length}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-500">Volume 24h</span>
            </div>
            <span className="text-2xl font-bold">{formatNumber(AGENTS_DATA.reduce((a, b) => a + b.volume24h, 0))}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-500">Total Holders</span>
            </div>
            <span className="text-2xl font-bold">{(AGENTS_DATA.reduce((a, b) => a + b.holders, 0) / 1000).toFixed(1)}K</span>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setShowAlertsPanel(!showAlertsPanel)}>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <Star className="w-4 h-4 text-yellow-400" />
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[10px] flex items-center justify-center text-white">
                    {unreadAlerts}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">Watchlist</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{watchlist.length}</span>
              {unreadAlerts > 0 && (
                <span className="text-xs text-purple-400">{unreadAlerts} alert{unreadAlerts > 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filter:</span>
            {(['all', 'trending', 'new', 'infrastructure', 'trading'] as FilterBy[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterBy(f)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filterBy === f 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                    : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
            >
              <option value="score">Score</option>
              <option value="volume">Volume</option>
              <option value="mcap">Market Cap</option>
              <option value="holders">Holders</option>
              <option value="change">24h Change</option>
            </select>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Agent Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Watchlist Section (if any) */}
            {watchedAgents.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  ⭐ Your Watchlist
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {watchedAgents.map((agent, idx) => (
                    <AgentCard key={agent.id} agent={agent} rank={idx + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* All Agents */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {filterBy === 'all' ? 'All Agents' : `${filterBy.charAt(0).toUpperCase() + filterBy.slice(1)} Agents`}
                <span className="text-sm text-gray-500 ml-2">({filteredAgents.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAgents.map((agent, idx) => (
                  <AgentCard key={agent.id} agent={agent} rank={idx + 1} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Alerts Panel (always visible in sidebar) */}
            {(showAlertsPanel || unreadAlerts > 0) && (
              <AlertsPanel onClose={() => setShowAlertsPanel(false)} />
            )}

            {/* Trending Mini */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                🔥 Hot Right Now
              </h2>
              <div className="space-y-3">
                {trendingAgents.slice(0, 3).map((agent, idx) => (
                  <Link key={agent.id} href={`/agents/${agent.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-gray-500 font-bold">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                      {agent.symbol[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{agent.name}</div>
                      <div className="text-xs text-gray-500">{formatNumber(agent.volume24h)} vol</div>
                    </div>
                    <span className={`text-xs ${agent.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {agent.priceChange24h >= 0 ? '+' : ''}{agent.priceChange24h.toFixed(1)}%
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Agent News */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Latest News
              </h2>
              
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-white/10 rounded" />
                  ))}
                </div>
              ) : events.length > 0 ? (
                <div>
                  {events.slice(0, 5).map((event) => (
                    <EventItem key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent news</p>
              )}
            </div>

            {/* Resources */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4">Resources</h2>
              <div className="space-y-2">
                <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                  <Globe className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                  <span className="text-sm text-gray-300">Base Network</span>
                </a>
                <a href="https://app.virtuals.io" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                  <Bot className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
                  <span className="text-sm text-gray-300">Virtuals Protocol</span>
                </a>
                <a href="https://basescan.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                  <Activity className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
                  <span className="text-sm text-gray-300">Base Explorer</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
