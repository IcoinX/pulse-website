'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

export default function BadgeDemo() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-3 flex-1 cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-200">
                  Demo Mode — Seed Data / Testnet
                </span>
              </div>
              
              <span className="hidden sm:inline text-xs text-amber-400/70">
                •
              </span>
              
              <span className="hidden sm:inline text-xs text-amber-400/80">
                Real sources (GitHub, X, On-chain) integration in progress
              </span>
              
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg 
                  className="w-4 h-4 text-amber-400/60" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/IcoinX/pulse-website"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400/80 hover:text-amber-300 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View on GitHub
              </a>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 pt-2 border-t border-amber-500/10"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-amber-200/70">
                  <div>
                    <span className="font-medium text-amber-300">⛓️ On-chain:</span>
                    <p className="mt-0.5">Base Sepolia testnet events (real contract format)</p>
                  </div>
                  <div>
                    <span className="font-medium text-amber-300">🐙 GitHub:</span>
                    <p className="mt-0.5">Simulated repo monitoring (12 keywords tracked)</p>
                  </div>
                  <div>
                    <span className="font-medium text-amber-300">🐦 X/Twitter:</span>
                    <p className="mt-0.5">25 whitelisted accounts (mock data)</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-amber-400/60">
                  Production API integrations coming soon. All evidence links are verifiable testnet format.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
