'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FeedTab, ProtocolEvent } from '@/types';
import Header from '@/components/Header';
import FeedCard from '@/components/FeedCard';
import Sidebar from '@/components/Sidebar';
import ConnectWallet from '@/components/ConnectWallet';

interface HomeClientProps {
  initialFeeds: ProtocolEvent[];
}

export default function HomeClient({ initialFeeds }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>('all');

  const filteredEvents = useMemo(() => {
    if (activeTab === 'all') return initialFeeds;
    return initialFeeds.filter(e => {
      const tags = e.tags || [];
      if (activeTab === 'agents') return tags.some(t => t.includes('agent'));
      if (activeTab === 'crypto') return tags.some(t => t.includes('crypto') || t.includes('base'));
      if (activeTab === 'ai') return tags.some(t => t.includes('ai') || t.includes('gpt'));
      return true;
    });
  }, [initialFeeds, activeTab]);

  const tabs = [
    { id: 'all', label: 'All', icon: '⚡' },
    { id: 'events', label: 'Events', icon: '📰' },
    { id: 'agents', label: 'Agents', icon: '🤖' },
    { id: 'crypto', label: 'Crypto', icon: '⛓️' },
    { id: 'ai', label: 'AI', icon: '🧠' },
    { id: 'tech', label: 'Tech', icon: '🔧' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Feed */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Latest Intelligence</h2>
              <ConnectWallet />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FeedTab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Events */}
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No events found. Check Supabase connection.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl">
                        {event.source === 'AGENT' ? '🤖' : event.source === 'ONCHAIN' ? '⛓️' : '📰'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {event.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          {event.summary}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-white/5 rounded">
                            {event.source}
                          </span>
                          <span className={`px-2 py-1 rounded ${
                            event.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                            event.status === 'challenged' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {event.status?.toUpperCase() || 'PENDING'}
                          </span>
                          <span>
                            {new Date(event.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
