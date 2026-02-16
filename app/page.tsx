'use client';

import { useState, useMemo } from 'react';
import { Category } from '@/types';
import Header from '@/components/Header';
import FeedSection from '@/components/FeedSection';
import Sidebar from '@/components/Sidebar';
import { getFeedByCategory } from '@/lib/feeds';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredFeeds = useMemo(() => {
    return getFeedByCategory(activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <FeedSection items={filteredFeeds} category={activeCategory} />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </div>
        </div>
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
            <p className="text-gray-500 text-sm">
              © 2026 PULSE Protocol. Built for the agent economy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
