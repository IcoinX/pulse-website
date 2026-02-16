'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CryptoChainEvent, CryptoChainEventType } from '@/types';
import CryptoEventCard from './CryptoEventCard';
import { cryptoChainEvents, getRecentCryptoEvents } from '@/lib/agentData';
import { 
  Loader2, 
  RefreshCw,
  Terminal,
  Cpu,
  Flame,
  Shield,
  AlertTriangle,
  Box,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CryptoChainFeedProps {
  events?: CryptoChainEvent[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const eventTypeFilters: { type: CryptoChainEventType | 'all'; label: string; icon: string }[] = [
  { type: 'all', label: 'All Events', icon: '⚡' },
  { type: 'BURN_ANOMALY', label: 'Burn', icon: '🔥' },
  { type: 'NEW_VALIDATOR_STAKING', label: 'Staking', icon: '🧱' },
  { type: 'CHALLENGE_SPIKE', label: 'Challenges', icon: '⚠️' },
  { type: 'EPOCH_ADJUSTMENT', label: 'Epoch', icon: '🧮' },
  { type: 'LARGE_BOOST', label: 'Boosts', icon: '🟣' },
];

export default function CryptoChainFeed({ 
  events, 
  isLoading = false,
  onRefresh 
}: CryptoChainFeedProps) {
  const [filter, setFilter] = useState<CryptoChainEventType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

  // Use provided events or fallback to mock data
  const displayEvents = events || cryptoChainEvents;

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = [...displayEvents];
    
    if (filter !== 'all') {
      filtered = filtered.filter(e => e.type === filter);
    }
    
    // Always sort by latest
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return filtered;
  }, [displayEvents, filter]);

  // Stats for header
  const stats = useMemo(() => {
    const critical = displayEvents.filter(e => e.severity === 'critical').length;
    const warning = displayEvents.filter(e => e.severity === 'warning').length;
    const totalBurn = displayEvents
      .filter(e => e.type === 'BURN_ANOMALY')
      .reduce((sum, e) => sum + (e.metrics.value || 0), 0);
    
    return { critical, warning, totalBurn };
  }, [displayEvents]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      toast.success('Chain events refreshed');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white font-mono">Crypto Chain Feed</h2>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-20 bg-black/20 rounded-xl border border-white/10">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-400 font-mono">Syncing with chain...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredEvents.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white font-mono">Crypto Chain Feed</h2>
          </div>
          {onRefresh && (
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors font-mono"
            >
              <RefreshCw className="w-4 h-4" />
              <span>SYNC</span>
            </button>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {eventTypeFilters.map((f) => (
            <button
              key={f.type}
              onClick={() => setFilter(f.type)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                filter === f.type
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-black/30 text-gray-500 hover:bg-black/50 hover:text-gray-300 border border-transparent'
              }`}
            >
              <span>{f.icon}</span>
              {f.label.toUpperCase()}
            </button>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-black/20 rounded-xl border border-white/10"
        >
          <div className="text-5xl mb-4 font-mono">∅</div>
          <h3 className="text-lg font-semibold text-white mb-2 font-mono">NO_EVENTS_FOUND</h3>
          <p className="text-gray-500 max-w-md mx-auto font-mono text-sm">
            No chain events match current filter criteria.
          </p>
          <button
            onClick={() => setFilter('all')}
            className="mt-6 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors font-mono text-sm"
          >
            RESET_FILTER
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white font-mono">Crypto Chain Feed</h2>
          <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded font-mono">
            {filteredEvents.length} events
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Quick stats */}
          <div className="hidden sm:flex items-center gap-3 mr-4">
            {stats.critical > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 font-mono">{stats.critical} CRIT</span>
              </div>
            )}
            {stats.warning > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Activity className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-orange-400 font-mono">{stats.warning} WARN</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-orange-400 font-mono">
                {(stats.totalBurn / 1000).toFixed(1)}K BURN
              </span>
            </div>
          </div>
          
          {/* View mode toggle */}
          <div className="flex items-center bg-black/30 rounded-lg p-1">
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                viewMode === 'compact' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              COMPACT
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                viewMode === 'detailed' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              DETAIL
            </button>
          </div>
          
          {onRefresh && (
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/50 rounded-lg text-sm text-gray-400 hover:text-white transition-colors font-mono border border-white/5"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">SYNC</span>
            </button>
          )}
        </div>
      </div>

      {/* Event Type Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {eventTypeFilters.map((f) => (
          <button
            key={f.type}
            onClick={() => setFilter(f.type)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              filter === f.type
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-black/30 text-gray-500 hover:bg-black/50 hover:text-gray-300 border border-transparent'
            }`}
          >
            <span>{f.icon}</span>
            {f.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Console Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-t-lg border border-white/10 border-b-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
        <span className="ml-3 text-xs text-gray-500 font-mono">pulse_chain_events.log</span>
        <span className="ml-auto text-xs text-gray-600 font-mono">tail -f</span>
      </div>

      {/* Events List - Console Style */}
      <div className="bg-black/20 rounded-b-lg border border-white/10 p-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredEvents.map((event, index) => (
            <CryptoEventCard key={event.id} event={event} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Console Footer */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/40 rounded-lg border border-white/10">
        <span className="text-xs text-gray-600 font-mono">
          {filteredEvents.length} events displayed
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-500 font-mono">CONNECTED</span>
          </span>
          <span className="text-xs text-gray-600 font-mono">
            Block: {Math.max(...filteredEvents.map(e => e.blockNumber || 0)).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Load More */}
      {filteredEvents.length >= 5 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4"
        >
          <button className="px-6 py-3 bg-black/30 hover:bg-black/50 text-gray-400 rounded-lg transition-colors text-xs font-mono font-bold flex items-center gap-2 mx-auto border border-white/10">
            <Cpu className="w-4 h-4" />
            LOAD_MORE_BLOCKS
          </button>
        </motion.div>
      )}
    </div>
  );
}
