'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Activity, Database, Shield } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalEvents: number;
  verifiedEvents: number;
  events24h: number;
  verificationRate: number;
  timestamp: string;
}

export default function LiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
            <div className="h-6 bg-white/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    { 
      icon: Database, 
      label: 'Total Events', 
      value: stats.totalEvents.toLocaleString(),
      color: 'text-purple-400'
    },
    { 
      icon: Shield, 
      label: 'Verified', 
      value: `${stats.verificationRate}%`,
      color: 'text-green-400'
    },
    { 
      icon: Activity, 
      label: 'Last 24h', 
      value: `+${stats.events24h}`,
      color: 'text-blue-400'
    },
    { 
      icon: TrendingUp, 
      label: 'Status', 
      value: 'Live',
      color: 'text-orange-400'
    },
  ];

  return (
    <Link href="/analytics" className="block">
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, idx) => (
          <div 
            key={idx} 
            className="bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
            <div className="text-lg font-semibold text-white">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-center">
        <span className="text-xs text-gray-500 hover:text-gray-400 transition-colors">
          View detailed analytics →
        </span>
      </div>
    </Link>
  );
}
