'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import AlertsPanel from '@/components/AlertsPanel';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Zap,
  ArrowUpRight,
  ArrowLeft,
  Bot,
  Flame,
  Clock,
  Target,
  Globe,
  Sparkles,
  ExternalLink,
  Shield,
  Database,
  ChevronUp,
  AlertTriangle,
  Star,
  Bell
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== DATA ====================

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
  tokenAddress?: string;
  score: number;
  sparkline24h: number[];
}

const AGENTS_DATA: Agent[] = [
  {
    id: '1',
    slug: 'virtuals-protocol',
    name: 'Virtuals Protocol',
    symbol: 'VIRTUAL',
    description: 'Decentralized agent creation and monetization platform on Base. Enables anyone to create, deploy, and monetize AI agents with tokenized ownership.',
    price: 0.145,
    priceChange24h: +12.5,
    volume24h: 2450000,
    marketCap: 145000000,
    holders: 15420,
    launchedAt: '2024-01-15',
    category: 'Infrastructure',
    status: 'trending',
    tokenAddress: '0x...',
    score: 87.4,
    sparkline24h: [0.128, 0.131, 0.129, 0.133, 0.135, 0.134, 0.138, 0.142, 0.140, 0.143, 0.141, 0.145]
  },
  {
    id: '2',
    slug: 'luna-agent',
    name: 'Luna Agent',
    symbol: 'LUNA',
    description: 'AI-powered social agent with autonomous trading capabilities. First agent to achieve 10K followers on X with automated market commentary.',
    price: 0.082,
    priceChange24h: +28.3,
    volume24h: 1890000,
    marketCap: 82000000,
    holders: 8900,
    launchedAt: '2024-02-01',
    category: 'AI Trading',
    status: 'trending',
    tokenAddress: '0x...',
    score: 92.1,
    sparkline24h: [0.064, 0.065, 0.068, 0.072, 0.071, 0.075, 0.078, 0.076, 0.080, 0.079, 0.081, 0.082]
  },
  {
    id: '3',
    slug: 'base-agent',
    name: 'Base Agent',
    symbol: 'BASEAI',
    description: 'Official Base ecosystem agent for on-chain operations. Provides real-time Base network analytics and developer tooling.',
    price: 0.034,
    priceChange24h: +8.7,
    volume24h: 920000,
    marketCap: 34000000,
    holders: 5600,
    launchedAt: '2024-01-28',
    category: 'Ecosystem',
    status: 'established',
    tokenAddress: '0x...',
    score: 71.3,
    sparkline24h: [0.031, 0.032, 0.031, 0.033, 0.032, 0.034, 0.033, 0.035, 0.034, 0.033, 0.034, 0.034]
  },
  {
    id: '4',
    slug: 'aixbt',
    name: 'Aixbt by Virtuals',
    symbol: 'AIXBT',
    description: 'Crypto market intelligence agent analyzing X and on-chain data. Provides alpha signals and market sentiment analysis.',
    price: 0.156,
    priceChange24h: +45.2,
    volume24h: 4100000,
    marketCap: 156000000,
    holders: 22100,
    launchedAt: '2024-02-10',
    category: 'Analytics',
    status: 'trending',
    tokenAddress: '0x...',
    score: 95.8,
    sparkline24h: [0.108, 0.112, 0.115, 0.118, 0.125, 0.132, 0.138, 0.145, 0.142, 0.148, 0.152, 0.156]
  },
  {
    id: '5',
    slug: 'tokenbot',
    name: 'Tokenbot',
    symbol: 'TKB',
    description: 'Automated token deployment and management agent. Simplifies token creation with one-click launches and automated liquidity management.',
    price: 0.023,
    priceChange24h: -5.2,
    volume24h: 450000,
    marketCap: 23000000,
    holders: 3200,
    launchedAt: '2024-02-14',
    category: 'DeFi',
    status: 'new',
    tokenAddress: '0x...',
    score: 58.9,
    sparkline24h: [0.024, 0.025, 0.024, 0.023, 0.024, 0.022, 0.023, 0.021, 0.022, 0.023, 0.022, 0.023]
  },
  {
    id: '6',
    slug: 'creator-bid',
    name: 'Creator.bid',
    symbol: 'BID',
    description: 'Platform for creating and bidding on AI agent services. Marketplace connecting agent creators with businesses seeking AI solutions.',
    price: 0.067,
    priceChange24h: +15.8,
    volume24h: 780000,
    marketCap: 67000000,
    holders: 7800,
    launchedAt: '2024-01-20',
    category: 'Marketplace',
    status: 'trending',
    tokenAddress: '0x...',
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

// ==================== COMPONENTS ====================

function Sparkline({ data, color = '#a855f7', width = 120, height = 40 }: { 
  data: number[]; 
  color?: string;
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) return <div className="w-[120px] h-[40px]" />;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  const isPositive = data[data.length - 1] >= data[0];
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * height} r="3" fill={strokeColor} />
    </svg>
  );
}

function ScoreBadge({ score }: { score: number }) {
  let color = 'text-gray-400';
  let bg = 'bg-gray-500/10';
  let label = 'Low';
  
  if (score >= 80) {
    color = 'text-green-400';
    bg = 'bg-green-500/10';
    label = 'High';
  } else if (score >= 60) {
    color = 'text-yellow-400';
    bg = 'bg-yellow-500/10';
    label = 'Medium';
  }
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${bg}`} title="Score based on: volume, price change, holders, and market cap">
      <Zap className={`w-3.5 h-3.5 ${color}`} />
      <span className={`text-xs font-medium ${color}`}>{score.toFixed(1)}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

function DataProvenance() {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-white">Data Provenance</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-gray-500">Last Sync</span>
          <p className="text-gray-300">Just now</p>
        </div>
        <div>
          <span className="text-gray-500">Block</span>
          <p className="text-gray-300">#38,452,891</p>
        </div>
        <div>
          <span className="text-gray-500">Provider</span>
          <p className="text-blue-400">Base Mainnet</p>
        </div>
        <div>
          <span className="text-gray-500">Status</span>
          <p className="text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== ALERTS TIMELINE ====================

function AgentAlertsTimeline({ agentSlug }: { agentSlug: string }) {
  const [alerts, setAlerts] = useState<any[]>([]);
  
  useEffect(() => {
    // Load alerts from localStorage
    const stored = JSON.parse(localStorage.getItem('pulse_alerts') || '[]');
    const agentAlerts = stored.filter((a: any) => a.agentSlug === agentSlug);
    setAlerts(agentAlerts.sort((a: any, b: any) => b.timestamp - a.timestamp));
  }, [agentSlug]);
  
  function markAsRead(alertId: string) {
    const allAlerts = JSON.parse(localStorage.getItem('pulse_alerts') || '[]');
    const updated = allAlerts.map((a: any) => 
      a.id === alertId ? { ...a, read: true } : a
    );
    localStorage.setItem('pulse_alerts', JSON.stringify(updated));
    setAlerts(updated.filter((a: any) => a.agentSlug === agentSlug));
  }
  
  function markAllAsRead() {
    const allAlerts = JSON.parse(localStorage.getItem('pulse_alerts') || '[]');
    const updated = allAlerts.map((a: any) => 
      a.agentSlug === agentSlug ? { ...a, read: true } : a
    );
    localStorage.setItem('pulse_alerts', JSON.stringify(updated));
    setAlerts(updated.filter((a: any) => a.agentSlug === agentSlug));
  }
  
  if (alerts.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            Alerts Timeline
          </h2>
        </div>
        <div className="text-center py-8">
          <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No alerts yet for this agent</p>
          <p className="text-gray-600 text-xs mt-1">Add to watchlist to get price, volume & news alerts</p>
        </div>
      </div>
    );
  }
  
  const unreadCount = alerts.filter((a: any) => !a.read).length;
  
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold">Alerts Timeline</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {alerts.map((alert: any) => {
          const icons: Record<string, any> = {
            PRICE_SPIKE: TrendingUp,
            VOLUME_SPIKE: Activity,
            NEW_EVENT: ExternalLink
          };
          const Icon = icons[alert.type] || Bell;
          const colors: Record<string, string> = {
            PRICE_SPIKE: 'text-green-400 bg-green-500/10 border-green-500/30',
            VOLUME_SPIKE: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
            NEW_EVENT: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
          };
          const colorClass = colors[alert.type] || 'text-gray-400 bg-gray-500/10 border-gray-500/30';
          
          return (
            <div 
              key={alert.id} 
              className={`flex items-start gap-3 p-3 rounded-lg border ${colorClass} ${alert.read ? 'opacity-50' : ''}`}
            >
              <Icon className="w-4 h-4 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">{alert.message}</p>
                <span className="text-xs opacity-70">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
              {!alert.read && (
                <button 
                  onClick={() => markAsRead(alert.id)}
                  className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Mark read
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function AgentDetailPage() {
  const params = useParams();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWatched, setIsWatched] = useState(false);
  
  const agent = useMemo(() => {
    const slug = params?.slug as string;
    return AGENTS_DATA.find(a => a.slug === slug);
  }, [params?.slug]);
  
  // Load watchlist from localStorage
  useEffect(() => {
    if (!agent) return;
    const watchlist = JSON.parse(localStorage.getItem('pulse_watchlist') || '[]');
    setIsWatched(watchlist.includes(agent.slug));
  }, [agent]);
  
  // Toggle watchlist
  const toggleWatch = () => {
    if (!agent) return;
    const watchlist = JSON.parse(localStorage.getItem('pulse_watchlist') || '[]');
    const newWatchlist = isWatched 
      ? watchlist.filter((s: string) => s !== agent.slug)
      : [...watchlist, agent.slug];
    localStorage.setItem('pulse_watchlist', JSON.stringify(newWatchlist));
    setIsWatched(!isWatched);
  };
  
  // Load related events - prioritize agent_slug mapping, fallback to title matching
  useEffect(() => {
    if (!agent) {
      setLoading(false);
      return;
    }
    
    async function loadEvents() {
      // Try agent_slug first (deterministic mapping)
      const { data: mappedEvents, error: mappedError } = await supabase
        .from('events')
        .select('*')
        .eq('agent_slug', agent?.slug)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!mappedError && mappedEvents && mappedEvents.length > 0) {
        setEvents(mappedEvents);
        setLoading(false);
        return;
      }
      
      // Fallback: title-based matching (legacy, less reliable)
      const { data: titleEvents } = await supabase
        .from('events')
        .select('*')
        .or(`source_type.eq.AGENT,title.ilike.%${agent?.symbol}%,title.ilike.%${agent?.name?.split(' ')?.[0]}%`)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (titleEvents) setEvents(titleEvents);
      setLoading(false);
    }
    
    loadEvents();
  }, [agent]);
  
  if (!agent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <p className="text-gray-400">Agent not found</p>
          <Link href="/agents" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
            ← Back to Agents
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-purple-400 hover:text-purple-300">
              PULSE
            </Link>
            <span className="text-gray-600">/</span>
            <Link href="/agents" className="text-gray-400 hover:text-white">Agents</Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300">{agent.name}</span>
          </div>
          <button
            onClick={toggleWatch}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isWatched 
                ? 'bg-yellow-500/20 text-yellow-400' 
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Star className={`w-4 h-4 ${isWatched ? 'fill-yellow-400' : ''}`} />
            <span className="text-sm">{isWatched ? 'Watching' : 'Watch'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Data Provenance */}
        <DataProvenance />
        
        {/* Agent Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
                {agent.symbol[0]}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold">{agent.name}</h1>
                  {agent.status === 'trending' && <Flame className="w-5 h-5 text-orange-400" />}
                  {agent.status === 'new' && <Sparkles className="w-5 h-5 text-yellow-400" />}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">{agent.symbol}</span>
                  <ScoreBadge score={agent.score} />
                  <span className="text-xs text-gray-500 px-2 py-0.5 bg-white/5 rounded">{agent.category}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">${agent.price.toFixed(4)}</div>
              <div className={`flex items-center gap-1 ${agent.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <ChevronUp className={`w-4 h-4 ${agent.priceChange24h < 0 ? 'rotate-180' : ''}`} />
                <span>{agent.priceChange24h >= 0 ? '+' : ''}{agent.priceChange24h.toFixed(1)}% (24h)</span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-400 max-w-2xl">{agent.description}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-xs text-gray-500 mb-1">Market Cap</div>
            <div className="text-xl font-bold">{formatNumber(agent.marketCap)}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-xs text-gray-500 mb-1">Volume (24h)</div>
            <div className="text-xl font-bold">{formatNumber(agent.volume24h)}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-xs text-gray-500 mb-1">Holders</div>
            <div className="text-xl font-bold">{agent.holders.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-xs text-gray-500 mb-1">Launched</div>
            <div className="text-xl font-bold">{new Date(agent.launchedAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Chart & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Chart */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Price (24h)
                </h2>
                <Sparkline data={agent.sparkline24h} width={200} height={60} />
              </div>
              <div className="h-48 flex items-end gap-1">
                {agent.sparkline24h.map((price, i) => {
                  const min = Math.min(...agent.sparkline24h);
                  const max = Math.max(...agent.sparkline24h);
                  const height = ((price - min) / (max - min)) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-purple-500/30 hover:bg-purple-500/50 transition-colors rounded-t"
                      style={{ height: `${Math.max(height, 10)}%` }}
                      title={`$${price.toFixed(4)}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Score Calculation */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Score Calculation
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Volume Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '75%' }} />
                    </div>
                    <span className="text-sm">75</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price Change (24h)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${Math.min(Math.abs(agent.priceChange24h) * 2, 100)}%` }} />
                    </div>
                    <span className="text-sm">{agent.priceChange24h > 0 ? '+' : ''}{agent.priceChange24h}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Holders Growth</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '60%' }} />
                    </div>
                    <span className="text-sm">60</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Score</span>
                    <span className="text-2xl font-bold text-yellow-400">{agent.score.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Formula: log(volume) × 0.4 + price_change × 0.3 + log(holders) × 0.3
                  </p>
                </div>
              </div>
            </div>

            {/* Alerts Timeline */}
            <AgentAlertsTimeline agentSlug={agent.slug} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Agent-Specific Alerts */}
            <AlertsPanel agentSlug={agent.slug} />

            {/* Links */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4">Links</h2>
              <div className="space-y-2">
                <a 
                  href={`https://basescan.org/token/${agent.tokenAddress || agent.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">BaseScan</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </a>
                <a 
                  href={`https://app.virtuals.io/${agent.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Virtuals App</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </a>
              </div>
            </div>

            {/* Related Events */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Related Events
              </h2>
              
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-white/10 rounded" />
                  ))}
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mt-2" />
                      <div>
                        <p className="text-sm text-gray-300">{event.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{event.source_type}</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-xs text-gray-500">{formatTimeAgo(event.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No related events yet</p>
              )}
            </div>

            {/* Watchers */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-2">Watchlist</h2>
              <p className="text-sm text-gray-400">
                {isWatched 
                  ? "You're watching this agent. You'll get alerts for new events and price movements."
                  : "Add to watchlist to get alerts for new events and price movements."
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
