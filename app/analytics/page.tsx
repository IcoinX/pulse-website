'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Users, 
  Blocks, 
  Flame,
  ChevronUp,
  Clock,
  Database,
  Shield
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalEvents: number;
  verifiedEvents: number;
  totalBoosts: number;
  totalBurn: number;
  activeAssertions: number;
  uniqueSources: number;
  avgVerificationScore: number;
  events24h: number;
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function MetricBar({ 
  label, 
  value, 
  max, 
  color 
}: { 
  label: string; 
  value: number; 
  max: number; 
  color: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats({
            totalEvents: data.stats.totalEvents,
            verifiedEvents: data.stats.verifiedEvents,
            totalBoosts: 0,
            totalBurn: 0,
            activeAssertions: 0,
            uniqueSources: Object.keys(data.stats.categories || {}).length,
            avgVerificationScore: data.stats.verificationRate || 0,
            events24h: data.stats.events24h,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Failed to load analytics</p>
      </div>
    );
  }

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
            <span className="text-gray-400">Analytics</span>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Back to Feed
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Protocol Analytics</h1>
          <p className="text-gray-400">Real-time insights from the PULSE network</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Events"
            value={stats.totalEvents.toLocaleString()}
            icon={Database}
            color="bg-purple-500/20"
            subtitle={`+${stats.events24h} in 24h`}
          />
          <StatCard
            title="Verified Events"
            value={stats.verifiedEvents.toLocaleString()}
            icon={Shield}
            color="bg-green-500/20"
            subtitle={`${stats.avgVerificationScore}% verification rate`}
          />
          <StatCard
            title="Data Sources"
            value={stats.uniqueSources}
            icon={Users}
            color="bg-blue-500/20"
            subtitle="Active feeds"
          />
          <StatCard
            title="Network"
            value="Live"
            icon={Activity}
            color="bg-orange-500/20"
            subtitle="Base Sepolia"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Overview */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Activity Overview
              </h2>
              
              <div className="space-y-6">
                <MetricBar
                  label="Events Indexed"
                  value={stats.totalEvents}
                  max={10000}
                  color="bg-purple-500"
                />
                <MetricBar
                  label="Verified by Protocol"
                  value={stats.verifiedEvents}
                  max={stats.totalEvents || 1}
                  color="bg-green-500"
                />
              </div>
            </div>

            {/* Network Health */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Network Health
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {stats.avgVerificationScore}%
                  </div>
                  <div className="text-xs text-gray-400">Avg Verification</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {stats.events24h}
                  </div>
                  <div className="text-xs text-gray-400">Events (24h)</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {stats.uniqueSources}
                  </div>
                  <div className="text-xs text-gray-400">Data Sources</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status */}
          <div className="space-y-6">
            {/* Protocol Status */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Blocks className="w-5 h-5 text-blue-400" />
                Protocol Status
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Indexer Status</span>
                  <span className="flex items-center gap-1.5 text-sm text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Network</span>
                  <span className="text-sm text-purple-400">Base Sepolia</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Block Time</span>
                  <span className="text-sm text-gray-300">~2s</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-400">Last Sync</span>
                  <span className="text-sm text-gray-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Just now
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
              
              <div className="space-y-2">
                <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                  <Database className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
                  <span className="text-sm text-gray-300">View Event Feed</span>
                </Link>
                <a href="https://sepolia.basescan.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                  <Blocks className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
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
