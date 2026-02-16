'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedTab, ProtocolEvent, Category } from '@/types';
import Header from '@/components/Header';
import FeedSection from '@/components/FeedSection';
import AgentActivityFeed from '@/components/AgentActivityFeed';
import CryptoChainFeed from '@/components/CryptoChainFeed';
import Sidebar from '@/components/Sidebar';
import BadgeDemo from '@/components/BadgeDemo';
import { protocolEvents } from '@/lib/data';
import { agentActivities, cryptoChainEvents } from '@/lib/agentData';
import toast from 'react-hot-toast';

interface HomeClientProps {
  initialFeeds: ProtocolEvent[];
  error: string | null;
}

// Filter events based on tab
function getEventsForTab(events: ProtocolEvent[], tab: FeedTab): ProtocolEvent[] {
  switch (tab) {
    case 'all':
      return events;
    case 'events':
      // Return all events (news/signals/governance)
      return events;
    case 'agents':
      // Return agent-related events
      return events.filter(e => 
        e.category === 'crypto_agents' || 
        e.tags.some(t => ['agent', 'agents', 'validator'].includes(t.toLowerCase()))
      );
    case 'crypto':
      // Return crypto-related events
      return events.filter(e => 
        e.category === 'crypto_agents' ||
        e.tags.some(t => ['crypto', 'defi', 'ethereum', 'base', 'staking'].includes(t.toLowerCase()))
      );
    case 'ai':
      // Return AI-related events
      return events.filter(e => 
        e.category === 'ai_models' ||
        e.tags.some(t => ['ai', 'llm', 'gpt', 'claude', 'model', 'ml'].includes(t.toLowerCase()))
      );
    case 'tech':
      // Return tech/world events
      return events.filter(e => 
        e.category === 'tech_world' || e.category === 'openclaw_tech'
      );
    default:
      return events;
  }
}

// Map FeedTab to Category for backward compatibility
function tabToCategory(tab: FeedTab): Category {
  switch (tab) {
    case 'agents':
      return 'agents';
    case 'crypto':
      return 'crypto';
    case 'ai':
      return 'ai_models';
    case 'tech':
      return 'tech_world';
    default:
      return 'all';
  }
}

export default function HomeClient({ initialFeeds, error }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [feeds, setFeeds] = useState<ProtocolEvent[]>(initialFeeds.length > 0 ? initialFeeds : protocolEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Show error toast if initial fetch failed
  useEffect(() => {
    if (error) {
      toast.error('Failed to load feeds. Using fallback data.');
    }
  }, [error]);

  // Filtered events based on active tab
  const filteredEvents = useMemo(() => {
    return getEventsForTab(feeds, activeTab);
  }, [feeds, activeTab]);

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

  // Render the appropriate feed based on active tab
  const renderFeed = () => {
    switch (activeTab) {
      case 'agents':
        return (
          <AgentActivityFeed 
            activities={agentActivities}
            isLoading={isLoading}
            onRefresh={refreshFeeds}
          />
        );
      case 'crypto':
        return (
          <CryptoChainFeed 
            events={cryptoChainEvents}
            isLoading={isLoading}
            onRefresh={refreshFeeds}
          />
        );
      case 'all':
      case 'events':
      case 'ai':
      case 'tech':
      default:
        return (
          <FeedSection 
            items={filteredEvents} 
            category={tabToCategory(activeTab)} 
            isLoading={isLoading}
            onRefresh={refreshFeeds}
          />
        );
    }
  };

  // Get tab-specific title
  const getTabTitle = () => {
    switch (activeTab) {
      case 'all': return 'All Feeds';
      case 'events': return 'Protocol Events';
      case 'agents': return 'Agent Activity';
      case 'crypto': return 'Chain Events';
      case 'ai': return 'AI & Models';
      case 'tech': return 'Tech & World';
      default: return 'PULSE Feed';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 light:from-gray-100 light:via-white light:to-gray-100">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <BadgeDemo />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Title Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          key={activeTab}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white">
            {getTabTitle()}
          </h1>
          <p className="text-gray-400 mt-1">
            {activeTab === 'agents' && 'Real-time activity from PULSE protocol agents'}
            {activeTab === 'crypto' && 'On-chain events and protocol metrics'}
            {activeTab === 'events' && 'Verified news, signals, and governance events'}
            {activeTab === 'ai' && 'AI model updates, releases, and research'}
            {activeTab === 'tech' && 'Technology and world news'}
            {activeTab === 'all' && 'Mixed feed of all protocol activity'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderFeed()}
              </motion.div>
            </AnimatePresence>
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
