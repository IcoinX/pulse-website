'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedItem, Category } from '@/types';
import FeedCard from './FeedCard';
import FilterBar from './FilterBar';
import { filterFeeds } from '@/lib/rss';
import { Loader2, RefreshCw, Newspaper } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedSectionProps {
  items: FeedItem[];
  category: Category;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function FeedSection({ 
  items, 
  category, 
  isLoading = false,
  onRefresh 
}: FeedSectionProps) {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Reset filters when category changes
  useEffect(() => {
    setSearchQuery('');
    setSelectedImpacts([]);
    setDateFrom('');
    setDateTo('');
  }, [category]);

  // Apply filters
  const filteredItems = filterFeeds(items, {
    category,
    impact: selectedImpacts,
    searchQuery,
    dateFrom,
    dateTo,
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedImpacts([]);
    setDateFrom('');
    setDateTo('');
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
            {category === 'all' ? 'Latest Intelligence' : `${category} Intelligence`}
          </h2>
        </div>
        
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedImpacts={selectedImpacts}
          onImpactChange={setSelectedImpacts}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          onClearFilters={handleClearFilters}
        />

        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading intelligence feed...</p>
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
            {category === 'all' ? 'Latest Intelligence' : `${category} Intelligence`}
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
          selectedImpacts={selectedImpacts}
          onImpactChange={setSelectedImpacts}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          onClearFilters={handleClearFilters}
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
        >
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-white mb-2">No feeds found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {items.length === 0 
              ? "Check back later for updates in this category."
              : "Try adjusting your filters to see more results."
            }
          </p>
          {items.length > 0 && (
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
          <h2 className="text-2xl font-bold text-white capitalize">
            {category === 'all' ? 'Latest Intelligence' : `${category} Intelligence`}
          </h2>
          <span className="px-3 py-1 text-sm bg-white/5 text-gray-400 rounded-full">
            {filteredItems.length} updates
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
        selectedImpacts={selectedImpacts}
        onImpactChange={setSelectedImpacts}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
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
            Load More
          </button>
        </motion.div>
      )}
    </div>
  );
}
