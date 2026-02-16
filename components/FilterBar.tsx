'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Clock, Shield, Zap, TrendingUp, ChevronDown } from 'lucide-react';
import { Timeframe, EventStatus, ImpactType, SortOption } from '@/types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  status: EventStatus | 'all';
  onStatusChange: (status: EventStatus | 'all') => void;
  impact: ImpactType | 'all';
  onImpactChange: (impact: ImpactType | 'all') => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
}

const timeframes: { value: Timeframe; label: string }[] = [
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
];

const statuses: { value: EventStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: 'bg-gray-500' },
  { value: 'pending', label: 'Pending', color: 'bg-gray-400' },
  { value: 'challenged', label: 'Challenged', color: 'bg-orange-500' },
  { value: 'verified', label: 'Verified', color: 'bg-green-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
];

const impacts: { value: ImpactType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '◎' },
  { value: 'market', label: 'Market', icon: '📈' },
  { value: 'narrative', label: 'Narrative', icon: '💬' },
  { value: 'tech', label: 'Tech', icon: '⚙️' },
];

const sorts: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'latest', label: 'Latest Verified', icon: <Clock className="w-3 h-3" /> },
  { value: 'trending', label: 'Signal Momentum', icon: <TrendingUp className="w-3 h-3" /> },
  { value: 'highest_impact', label: 'Highest Impact', icon: <Zap className="w-3 h-3" /> },
  { value: 'most_contested', label: 'Most Contested', icon: <Shield className="w-3 h-3" /> },
];

export default function FilterBar({
  searchQuery,
  onSearchChange,
  timeframe,
  onTimeframeChange,
  status,
  onStatusChange,
  impact,
  onImpactChange,
  sort,
  onSortChange,
  onClearFilters,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = 
    searchQuery || 
    timeframe !== '24h' || 
    status !== 'all' || 
    impact !== 'all' || 
    sort !== 'latest';

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events, sources, tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
              hasActiveFilters 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            )}
          </button>
        </div>

        {/* Quick Filters Row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Timeframe Pills */}
          <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => onTimeframeChange(tf.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  timeframe === tf.value
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">
              {sorts.find(s => s.value === sort)?.icon}
              <span>{sorts.find(s => s.value === sort)?.label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-40 bg-gray-900 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              {sorts.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onSortChange(s.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    sort === s.value ? 'text-purple-400' : 'text-gray-400'
                  }`}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* Status Filter */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Status</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => onStatusChange(s.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                        status === s.value
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'bg-black/20 text-gray-400 border border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${s.color}`} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Impact Filter */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Impact</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {impacts.map((imp) => (
                    <button
                      key={imp.value}
                      onClick={() => onImpactChange(imp.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                        impact === imp.value
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'bg-black/20 text-gray-400 border border-white/5 hover:border-white/10'
                      }`}
                    >
                      <span>{imp.icon}</span>
                      {imp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={onClearFilters}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
