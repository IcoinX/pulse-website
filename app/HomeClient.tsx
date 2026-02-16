'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Category, ProtocolEvent } from '@/types';
import Header from '@/components/Header';
import FeedSection from '@/components/FeedSection';
import Sidebar from '@/components/Sidebar';
import { protocolEvents } from '@/lib/data';
import toast from 'react-hot-toast';

interface HomeClientProps {
  initialFeeds: ProtocolEvent[];
  error: string | null;
}

export default function HomeClient({ initialFeeds, error }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [feeds, setFeeds] = useState<ProtocolEvent[]>(initialFeeds.length > 0 ? initialFeeds : protocolEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Show error toast if initial fetch failed
  useEffect(() => {
    if (error) {
      toast.error('Failed to load feeds. Using fallback data.');
    }
  }, [error]);

  // Refresh feeds function
  const refreshFeeds = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from an API
      // For now, we shuffle and use the mock data
      const shuffled = [...protocolEvents].sort(() => Math.random() - 0.5);
      setFeeds(shuffled);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error refreshing feeds:', err);
      toast.error('Failed to refresh feeds');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshFeeds();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshFeeds]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 light:from-gray-100 light:via-white light:to-gray-100">
      <Header activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <FeedSection 
              items={feeds} 
              category={activeCategory} 
              isLoading={isLoading}
              onRefresh={refreshFeeds}
            />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-24"
            >
              <Sidebar lastUpdated={lastUpdated} />
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="text-white font-semibold">PULSE Protocol</span>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-gray-500 text-sm">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
              <p className="text-gray-500 text-sm">
                © 2026 PULSE Protocol. Built for the agent economy.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
