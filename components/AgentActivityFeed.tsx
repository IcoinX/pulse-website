'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentActivity, AgentActivityType } from '@/types';
import AgentActivityCard from './AgentActivityCard';
import { agentActivities, getRecentAgentActivities } from '@/lib/agentData';
import { 
  Loader2, 
  RefreshCw, 
  Filter,
  Users,
  Activity,
  AlertTriangle,
  XCircle,
  Trophy,
  Handshake,
  Plus,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AgentActivityFeedProps {
  activities?: AgentActivity[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const activityTypeFilters: { type: AgentActivityType | 'all'; label: string; icon: string }[] = [
  { type: 'all', label: 'All Activities', icon: '⚡' },
  { type: 'CREATED', label: 'Created', icon: '🆕' },
  { type: 'VALIDATING', label: 'Validating', icon: '✅' },
  { type: 'TOP_RANKED', label: 'Top Ranked', icon: '🏆' },
  { type: 'COLLABORATING', label: 'Collaborating', icon: '🤝' },
  { type: 'CHALLENGED', label: 'Challenged', icon: '⚠️' },
  { type: 'SLASHED', label: 'Slashed', icon: '❌' },
];

export default function AgentActivityFeed({ 
  activities, 
  isLoading = false,
  onRefresh 
}: AgentActivityFeedProps) {
  const [filter, setFilter] = useState<AgentActivityType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'reputation'>('latest');

  // Use provided activities or fallback to mock data
  const displayActivities = activities || agentActivities;

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = [...displayActivities];
    
    if (filter !== 'all') {
      filtered = filtered.filter(a => a.type === filter);
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return b.agent.reputation - a.agent.reputation;
      }
    });
    
    return filtered;
  }, [displayActivities, filter, sortBy]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      toast.success('Agent activities refreshed');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Agent Activity Feed</h2>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading agent activities...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredActivities.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Agent Activity Feed</h2>
          </div>
          {onRefresh && (
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {activityTypeFilters.map((f) => (
            <button
              key={f.type}
              onClick={() => setFilter(f.type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                filter === f.type
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
        >
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-white mb-2">No activities found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            No agent activities match your current filter.
          </p>
          <button
            onClick={() => setFilter('all')}
            className="mt-6 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
          >
            Clear Filter
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
          <Users className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Agent Activity Feed</h2>
          <span className="px-3 py-1 text-sm bg-white/5 text-gray-400 rounded-full">
            {filteredActivities.length} activities
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'latest' | 'reputation')}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50"
          >
            <option value="latest">Latest First</option>
            <option value="reputation">Highest Reputation</option>
          </select>
          
          {onRefresh && (
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Activity Type Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {activityTypeFilters.map((f) => (
          <button
            key={f.type}
            onClick={() => setFilter(f.type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filter === f.type
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Activity Grid */}
      <div className="grid gap-4 mt-6">
        <AnimatePresence mode="popLayout">
          {filteredActivities.map((activity, index) => (
            <AgentActivityCard key={activity.id} activity={activity} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {filteredActivities.length >= 5 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 mx-auto">
            <Activity className="w-4 h-4" />
            Load More Activities
          </button>
        </motion.div>
      )}
    </div>
  );
}
