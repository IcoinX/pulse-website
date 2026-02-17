'use client';

import { motion } from 'framer-motion';
import { AgentActivity } from '@/types';
import { formatTimeAgo } from '@/lib/data';
import { 
  getAgentActivityTypeIcon, 
  getAgentActivityTypeColor
} from '@/lib/agentData';
import { 
  ArrowRight, 
  User, 
  Activity,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import Link from 'next/link';

interface AgentActivityCardProps {
  activity: AgentActivity;
  index?: number;
}

// Mini sparkline component
const MiniSparkline = ({ data, color = 'text-purple-400' }: { data: number[], color?: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={color}
      />
      {/* Last point dot */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        className={`fill-current ${color}`}
      />
    </svg>
  );
};

// Chain badge component
const ChainBadge = ({ chain }: { chain: string }) => {
  const chainConfig: Record<string, { label: string; color: string }> = {
    'base': { label: 'Base', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    'base_testnet': { label: 'Base Sepolia', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    'ethereum': { label: 'Ethereum', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    'sepolia': { label: 'Sepolia', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
  };
  
  const config = chainConfig[chain] || chainConfig.base;
  
  return (
    <span className={`px-2 py-0.5 text-[10px] font-medium border rounded ${config.color}`}>
      {config.label}
    </span>
  );
};

// Reputation change indicator
const ReputationChange = ({ change }: { change?: number }) => {
  if (change === undefined) return null;
  
  if (change > 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-green-400">
        <TrendingUp className="w-3 h-3" />
        +{change.toLocaleString()}
      </span>
    );
  } else if (change < 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-red-400">
        <TrendingDown className="w-3 h-3" />
        {change.toLocaleString()}
      </span>
    );
  }
  
  return (
    <span className="flex items-center gap-0.5 text-xs text-gray-400">
      <Minus className="w-3 h-3" />
      0
    </span>
  );
};

export default function AgentActivityCard({ activity, index = 0 }: AgentActivityCardProps) {
  const icon = getAgentActivityTypeIcon(activity.type);
  const typeStyle = getAgentActivityTypeColor(activity.type);
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.005, y: -2 }}
      className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
    >
      {/* Header with Agent Info */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Agent Avatar */}
            <div className="relative">
              <span className="text-3xl">{activity.agent.avatar}</span>
              {activity.agent.isValidator && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                  <span className="text-[8px] font-bold text-white">V</span>
                </div>
              )}
            </div>
            
            {/* Agent Name & Handle */}
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                {activity.agent.name}
              </h4>
              <p className="text-xs text-gray-500">{activity.agent.handle}</p>
            </div>
          </div>
          
          {/* Activity Type Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${typeStyle}`}>
            <span className="text-sm">{icon}</span>
            <span className="text-xs font-medium">{activity.type}</span>
          </div>
        </div>
      </div>
      
      {/* Activity Content */}
      <div className="p-5">
        <h3 className="text-base font-medium text-white mb-2">
          {activity.title}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">
          {activity.description}
        </p>
        
        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-4 py-3 px-4 bg-black/20 rounded-lg border border-white/5">
          {/* Reputation Score with Sparkline */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Reputation</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {activity.agent.reputation.toLocaleString()}
                </span>
                {activity.metadata?.reputationChange && (
                  <ReputationChange change={activity.metadata.reputationChange} />
                )}
              </div>
            </div>
            <MiniSparkline data={activity.agent.reputationHistory} />
          </div>
          
          <span className="text-gray-700">|</span>
          
          {/* Chain Badge */}
          <ChainBadge chain={activity.chain} />
          
          <span className="text-gray-700">|</span>
          
          {/* Timestamp */}
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
          </div>
          
          {/* Tx Hash if available */}
          {activity.txHash && (
            <>
              <span className="text-gray-700">|</span>
              <a
                href={`https://basescan.org/tx/${activity.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {activity.txHash.slice(0, 6)}...{activity.txHash.slice(-4)}
              </a>
            </>
          )}
        </div>
        
        {/* Metadata Details */}
        {activity.metadata && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activity.metadata.oldValue && activity.metadata.newValue && (
              <span className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded">
                {activity.metadata.oldValue} → {activity.metadata.newValue}
              </span>
            )}
            {activity.metadata.targetAgentName && (
              <span className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded flex items-center gap-1">
                <span>🤝</span> {activity.metadata.targetAgentName}
              </span>
            )}
            {activity.metadata.stakeAmount && (
              <span className="px-2 py-1 text-xs bg-orange-500/10 text-orange-400 rounded">
                {activity.metadata.stakeAmount.toLocaleString()} PULSE at stake
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Actions Bar */}
      <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors">
            <User className="w-3.5 h-3.5" />
            View Agent
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Activity className="w-3.5 h-3.5" />
            View Activity
          </button>
          {activity.type !== 'SLASHED' && activity.type !== 'CHALLENGED' && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
              Challenge
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
