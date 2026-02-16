'use client';

import { motion } from 'framer-motion';
import { trendingTopics, protocolStats, formatTimeAgo } from '@/lib/data';
import { 
  getTopAgentsByReputation, 
  agentActivityStats, 
  cryptoChainStats
} from '@/lib/agentData';
import { Agent } from '@/types';
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
  Percent,
  Gavel,
  Bot,
  Plus,
  XCircle,
  TrendingDown,
  Cpu,
  Box,
  BarChart3,
  Database
} from 'lucide-react';

interface SidebarProps {
  lastUpdated?: Date;
}

// Mini sparkline for agents
const MiniSparkline = ({ data }: { data: number[] }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 50;
  const height = 20;
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const trend = data[data.length - 1] - data[0];
  const color = trend >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <svg width={width} height={height} className={`overflow-visible ${color}`}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
};

// Chain badge
const ChainBadge = ({ chain }: { chain: string }) => {
  const isTestnet = chain.includes('testnet') || chain === 'sepolia';
  return (
    <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded ${
      isTestnet 
        ? 'bg-gray-500/20 text-gray-400' 
        : 'bg-blue-500/20 text-blue-400'
    }`}>
      {isTestnet ? 'TEST' : 'BASE'}
    </span>
  );
};

export default function Sidebar({ lastUpdated }: SidebarProps) {
  const topAgents = getTopAgentsByReputation(5);

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

      {/* Sprint 1.5: Verification Status Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-500/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-400" />
          Verification Status
        </h3>
        
        <div className="space-y-3">
          {/* Events Verified */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Verified</span>
            </div>
            <span className="text-lg font-bold text-green-400">
              3
            </span>
          </div>

          {/* Events Challenged */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-300">Challenged</span>
            </div>
            <span className="text-lg font-bold text-orange-400">
              2
            </span>
          </div>

          {/* Events Pending */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Pending</span>
            </div>
            <span className="text-lg font-bold text-gray-400">
              10
            </span>
          </div>
        </div>
      </motion.div>

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

          {/* Active Challenges 24h */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-300">Active Challenges (24h)</span>
            </div>
            <span className="text-lg font-bold text-orange-400">
              {protocolStats.active_challenges_24h?.toLocaleString() || '12'}
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

      {/* Agent Activity Stats - NEW */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl p-5 border border-pink-500/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-pink-400" />
          Agent Activity (24h)
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Created */}
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-gray-400">Created</span>
            </div>
            <span className="text-xl font-bold text-white">
              {agentActivityStats.created_24h}
            </span>
          </div>

          {/* Validated */}
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-gray-400">Validated</span>
            </div>
            <span className="text-xl font-bold text-white">
              {agentActivityStats.validated_24h.toLocaleString()}
            </span>
          </div>

          {/* Challenged */}
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs text-gray-400">Challenged</span>
            </div>
            <span className="text-xl font-bold text-white">
              {agentActivityStats.challenged_24h}
            </span>
          </div>

          {/* Slashed */}
          <div className="p-3 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-gray-400">Slashed</span>
            </div>
            <span className="text-xl font-bold text-red-400">
              {agentActivityStats.slashed_24h}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Active Agents</span>
            <span className="text-lg font-bold text-white">{agentActivityStats.activeAgents}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-400">New This Week</span>
            <span className="text-sm font-bold text-green-400">+{agentActivityStats.newAgentsThisWeek}</span>
          </div>
        </div>
      </motion.div>

      {/* Top Agents - with Sparklines */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-400" />
          Top Agents
        </h3>
        <div className="space-y-3">
          {topAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
            >
              {/* Rank */}
              <span className={`text-xs font-bold w-4 ${
                index === 0 ? 'text-yellow-400' :
                index === 1 ? 'text-gray-300' :
                index === 2 ? 'text-orange-400' :
                'text-gray-500'
              }`}>
                {index + 1}
              </span>
              
              {/* Avatar */}
              <span className="text-2xl">{agent.avatar}</span>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                    {agent.name}
                  </p>
                  {agent.isValidator && (
                    <span className="px-1 py-0.5 text-[8px] bg-purple-500/20 text-purple-400 rounded">
                      V
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">{agent.handle}</p>
                  <ChainBadge chain={agent.chain} />
                </div>
              </div>
              
              {/* Sparkline */}
              <div className="hidden sm:block">
                <MiniSparkline data={agent.reputationHistory} />
              </div>
              
              {/* Reputation */}
              <div className="text-right">
                <p className="text-xs font-medium text-purple-400">{agent.reputation.toLocaleString()}</p>
                <p className="text-[10px] text-gray-600">rep</p>
              </div>
            </motion.div>
          ))}
        </div>
        <button className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View All Agents →
        </button>
      </motion.div>

      {/* Crypto Chain Stats - NEW */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-500/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Cpu className="w-5 h-5 mr-2 text-green-400" />
          Chain Stats (24h)
        </h3>
        
        <div className="space-y-3">
          {/* Burn Anomalies */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-300">Burn Anomalies</span>
            </div>
            <span className="text-lg font-bold text-orange-400">
              {cryptoChainStats.burnAnomalies_24h}
            </span>
          </div>

          {/* New Validators */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">New Validators</span>
            </div>
            <span className="text-lg font-bold text-blue-400">
              {cryptoChainStats.newValidators_24h}
            </span>
          </div>

          {/* Challenge Spikes */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Challenge Spikes</span>
            </div>
            <span className="text-lg font-bold text-yellow-400">
              {cryptoChainStats.challengeSpikes_24h}
            </span>
          </div>

          {/* Epoch Adjustments */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Epoch Adjustments</span>
            </div>
            <span className="text-lg font-bold text-purple-400">
              {cryptoChainStats.epochAdjustments_24h}
            </span>
          </div>

          {/* Total Burned */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-300">Total Burned</span>
            </div>
            <span className="text-lg font-bold text-orange-400">
              {(cryptoChainStats.totalBurned_24h / 1000).toFixed(1)}K
            </span>
          </div>

          {/* Total Staked */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Total Staked</span>
            </div>
            <span className="text-lg font-bold text-green-400">
              {(cryptoChainStats.totalStaked / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>
      </motion.div>

      {/* High-Signal Topics */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-orange-400" />
          High-Signal Topics
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

      {/* About - Sprint 1.5: Updated tagline */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white/5 rounded-xl p-5 border border-white/10"
      >
        <h3 className="text-sm font-semibold text-white mb-2">About PULSE</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          A public registry of verified events. 
          Truth through proof, not narrative. 
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
