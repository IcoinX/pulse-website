'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtocolEvent, Category, EventStatus, ImpactType, SortOption, Timeframe } from '@/types';
import FeedCard from './FeedCard';
import FilterBar from './FilterBar';
import { protocolEvents, getEventsByCategory, formatTimeAgo } from '@/lib/data';
import { Loader2, RefreshCw, Newspaper } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedSectionProps {
  items: ProtocolEvent[];
  category: Category;
  isLoading?: boolean;
  onRefresh?: () => void;
}

// Filter function
function filterEvents(
  events: ProtocolEvent[],
  filters: {
    category?: Category;
    timeframe: Timeframe;
    status: EventStatus | 'all';
    impact: ImpactType | 'all';
    sort: SortOption;
    searchQuery: string;
  }
): ProtocolEvent[] {
  let filtered = [...events];

  // Category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(e => e.category === filters.category);
  }

  // Timeframe filter
  const now = Date.now();
  const timeframeMs = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  filtered = filtered.filter(e => {
    const eventTime = new Date(e.timestamp).getTime();
    return now - eventTime <= timeframeMs[filters.timeframe];
  });

  // Status filter
  if (filters.status !== 'all') {
    filtered = filtered.filter(e => e.status === filters.status);
  }

  // Impact filter
  if (filters.impact !== 'all') {
    filtered = filtered.filter(e => e.impact[filters.impact as ImpactType] >= 50);
  }

  // Search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(e => 
      e.title.toLowerCase().includes(query) ||
      e.content.toLowerCase().includes(query) ||
      e.tags.some(t => t.toLowerCase().includes(query)) ||
      e.source.toLowerCase().includes(query)
    );
  }

  // Sort
  filtered.sort((a, b) => {
    switch (filters.sort) {
      case 'latest':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'trending':
        return (b.metrics.boost + b.validation.validator_count * 100) - 
               (a.metrics.boost + a.validation.validator_count * 100);
      case 'highest_impact':
        const impactA = (a.impact.market + a.impact.narrative + a.impact.tech) / 3;
        const impactB = (b.impact.market + b.impact.narrative + b.impact.tech) / 3;
        return impactB - impactA;
      case 'most_contested':
        return (b.metrics.burn + b.validation.challenge_count * 1000) - 
               (a.metrics.burn + a.validation.challenge_count * 1000);
      default:
        return 0;
    }
  });

  return filtered;
}

export default function FeedSection({ 
  items, 
  category, 
  isLoading = false,
  onRefresh 
}: FeedSectionProps) {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState<Timeframe>('24h');
  const [status, setStatus] = useState<EventStatus | 'all'>('all');
  const [impact, setImpact] = useState<ImpactType | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('latest');

  // Reset filters when category changes
  useEffect(() => {
    setSearchQuery('');
    setTimeframe('24h');
    setStatus('all');
    setImpact('all');
    setSort('latest');
  }, [category]);

  // Use mock data if no items provided
  const displayItems = items.length > 0 ? items : protocolEvents;

  // Apply filters
  const filteredItems = useMemo(() => 
    filterEvents(displayItems, {
      category,
      timeframe,
      status,
      impact,
      sort,
      searchQuery,
    }),
    [displayItems, category, timeframe, status, impact, sort, searchQuery]
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setTimeframe('24h');
    setStatus('all');
    setImpact('all');
    setSort('latest');
    toast.success('Filters cleared');
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      toast.success('Feed refreshed');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white capitalize">
            {category === 'all' ? 'Protocol Events' : 'Protocol Events'}
          </h2>
        </div>
        
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          status={status}
          onStatusChange={setStatus}
          impact={impact}
          onImpactChange={setImpact}
          sort={sort}
          onSortChange={setSort}
          onClearFilters={handleClearFilters}
        />

        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading protocol events...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredItems.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white capitalize">
            Protocol Events
          </h2>
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
        
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          status={status}
          onStatusChange={setStatus}
          impact={impact}
          onImpactChange={setImpact}
          sort={sort}
          onSortChange={setSort}
          onClearFilters={handleClearFilters}
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
        >
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {displayItems.length === 0 
              ? "Check back later for protocol events."
              : "Try adjusting your filters to see more results."
            }
          </p>
          {displayItems.length > 0 && (
            <button
              onClick={handleClearFilters}
              className="mt-6 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">
            Protocol Events
          </h2>
          <span className="px-3 py-1 text-sm bg-white/5 text-gray-400 rounded-full">
            {filteredItems.length} events
          </span>
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
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        status={status}
        onStatusChange={setStatus}
        impact={impact}
        onImpactChange={setImpact}
        sort={sort}
        onSortChange={setSort}
        onClearFilters={handleClearFilters}
      />

      {/* Feed Grid */}
      <div className="grid gap-4 mt-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <FeedCard key={item.id} item={item} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {filteredItems.length >= 10 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 mx-auto">
            <Newspaper className="w-4 h-4" />
            Load More Events
          </button>
        </motion.div>
      )}
    </div>
  );
}
