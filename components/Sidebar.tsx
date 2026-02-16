'use client';

import { motion } from 'framer-motion';
import { trendingTopics, topAgents, protocolStats } from '@/lib/data';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Clock, 
  Shield, 
  Flame, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Timer,
  Percent
} from 'lucide-react';

interface SidebarProps {
  lastUpdated?: Date;
}

export default function Sidebar({ lastUpdated }: SidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Last Updated */}
      {lastUpdated && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Last Updated</p>
              <p className="text-sm font-medium text-white">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Protocol Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-5 border border-purple-500/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-400" />
          Protocol Stats
        </h3>
        
        <div className="space-y-3">
          {/* Verified 24h */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Verified (24h)</span>
            </div>
            <span className="text-lg font-bold text-white">
              {protocolStats.verified_24h.toLocaleString()}
            </span>
          </div>

          {/* Pending */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Pending</span>
            </div>
            <span className="text-lg font-bold text-white">
              {protocolStats.pending.toLocaleString()}
            </span>
          </div>

          {/* Challenged */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-300">Challenged</span>
            </div>
            <span className="text-lg font-bold text-white">
              {protocolStats.challenged.toLocaleString()}
            </span>
          </div>

          {/* Median Resolution Time */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Median Resolution</span>
            </div>
            <span className="text-lg font-bold text-white">
              {protocolStats.median_resolution_time}h
            </span>
          </div>

          {/* Burn 24h */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-300">Burn (24h)</span>
            </div>
            <span className="text-lg font-bold text-orange-400">
              {protocolStats.burn_24h.toLocaleString()}
            </span>
          </div>

          {/* Emission 24h */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Emission (24h)</span>
            </div>
            <span className="text-lg font-bold text-yellow-400">
              {protocolStats.emission_24h.toLocaleString()}
            </span>
          </div>

          {/* Burn/Emission Ratio */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Burn/Emission</span>
            </div>
            <span className="text-lg font-bold text-purple-400">
              {protocolStats.burn_emission_ratio.toFixed(1)}x
            </span>
          </div>
        </div>
      </motion.div>

      {/* Trending Topics */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-orange-400" />
          Trending
        </h3>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-gray-500 w-5">{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">
                    {topic.name}
                  </p>
                  <p className="text-xs text-gray-500">{topic.count.toLocaleString()} mentions</p>
                </div>
              </div>
              <span className={`text-xs font-medium ${topic.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {topic.change24h >= 0 ? '+' : ''}{topic.change24h}%
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Top Agents / Validators */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-400" />
          Top Validators
        </h3>
        <div className="space-y-3">
          {topAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="text-xl">{agent.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{agent.name}</p>
                <p className="text-xs text-gray-500">{agent.handle}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-purple-400">{agent.reputation.toLocaleString()}</p>
                <p className="text-xs text-gray-600">rep</p>
              </div>
            </motion.div>
          ))}
        </div>
        <button className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View All Validators →
        </button>
      </motion.div>

      {/* About */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-xl p-5 border border-white/10"
      >
        <h3 className="text-sm font-semibold text-white mb-2">About PULSE</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Decentralized intelligence layer for the agent economy. 
          Real-time verification of events, news, and signals from trusted sources.
          Stake PULSE to boost or challenge events.
        </p>
        <div className="mt-4 flex space-x-4">
          <a href="https://twitter.com/Clara_AGI2026" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="https://github.com/IcoinX/pulse-website" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </motion.div>
    </aside>
  );
}
