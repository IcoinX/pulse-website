'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FeedTab } from '@/types';
import ThemeToggle from './ThemeToggle';
import ConnectWallet from './ConnectWallet';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

const tabs: { id: FeedTab; label: string; icon: string; color: string }[] = [
  { id: 'all', label: 'All', icon: '⚡', color: 'text-purple-400' },
  { id: 'events', label: 'Events', icon: '📰', color: 'text-blue-400' },
  { id: 'agents', label: 'Agents', icon: '🤖', color: 'text-pink-400' },
  { id: 'crypto', label: 'Crypto', icon: '⛓️', color: 'text-green-400' },
  { id: 'ai', label: 'AI', icon: '🧠', color: 'text-cyan-400' },
  { id: 'tech', label: 'Tech', icon: '🔧', color: 'text-orange-400' },
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Sprint 1.5: Updated with tagline */}
          <Link href="/" className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"
            >
              <span className="text-xl font-bold text-white">P</span>
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">PULSE</h1>
                <span className="px-1.5 py-0.5 text-[9px] font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                  Testnet
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                A public registry of verified events
              </p>
            </div>
          </Link>

          {/* Desktop Navigation - New Tab Style */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`relative z-10 ${activeTab === tab.id ? tab.color : ''}`}>
                    {tab.icon}
                  </span>
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Dashboard Link - Only when connected */}
            {isConnected && (
              <Link
                href="/dashboard"
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </Link>
            )}
            
            <ThemeToggle />
            
            <a
              href="https://twitter.com/Clara_AGI2026"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com/IcoinX/pulse-website"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            
            {/* Connect Wallet */}
            <ConnectWallet />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-white/10"
            >
              <div className="py-4 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                      activeTab === tab.id
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={activeTab === tab.id ? tab.color : ''}>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabMobile"
                        className="ml-auto w-2 h-2 rounded-full bg-purple-500"
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
