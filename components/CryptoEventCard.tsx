'use client';

import { motion } from 'framer-motion';
import { CryptoChainEvent } from '@/types';
import { formatTimeAgo } from '@/lib/data';
import { 
  getCryptoEventTypeIcon, 
  getCryptoEventSeverityColor
} from '@/lib/agentData';
import { 
  ExternalLink,
  Box,
  TrendingUp,
  TrendingDown,
  Minus,
  Hash,
  Clock
} from 'lucide-react';

interface CryptoEventCardProps {
  event: CryptoChainEvent;
  index?: number;
}

// Severity indicator
const SeverityIndicator = ({ severity }: { severity: CryptoChainEvent['severity'] }) => {
  const colors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    critical: 'bg-red-500'
  };
  
  const labels = {
    info: 'INFO',
    success: 'OK',
    warning: 'WARN',
    critical: 'CRIT'
  };
  
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${colors[severity]} ${severity === 'critical' ? 'animate-pulse' : ''}`} />
      <span className={`text-[10px] font-mono font-bold ${
        severity === 'info' ? 'text-blue-400' :
        severity === 'success' ? 'text-green-400' :
        severity === 'warning' ? 'text-orange-400' :
        'text-red-400'
      }`}>
        {labels[severity]}
      </span>
    </div>
  );
};

// Metric change indicator
const MetricChange = ({ value, percentage }: { value?: number; percentage?: number }) => {
  if (percentage === undefined && value === undefined) return null;
  
  const isPositive = (percentage || value || 0) > 0;
  const isNeutral = (percentage || value || 0) === 0;
  
  if (isNeutral) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-gray-500 font-mono">
        <Minus className="w-3 h-3" />
        0%
      </span>
    );
  }
  
  return (
    <span className={`flex items-center gap-0.5 text-xs font-mono ${
      isPositive ? 'text-green-400' : 'text-red-400'
    }`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {percentage !== undefined ? `${isPositive ? '+' : ''}${percentage}%` : `${isPositive ? '+' : ''}${value}`}
    </span>
  );
};

// Chain badge - compact version
const ChainBadgeCompact = ({ chain }: { chain: string }) => {
  const chainLabels: Record<string, string> = {
    'base': 'BASE',
    'base_testnet': 'BASE-SEP',
    'ethereum': 'ETH',
    'sepolia': 'SEP'
  };
  
  return (
    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-gray-800 text-gray-400 rounded">
      {chainLabels[chain] || chain.toUpperCase()}
    </span>
  );
};

export default function CryptoEventCard({ event, index = 0 }: CryptoEventCardProps) {
  const icon = getCryptoEventTypeIcon(event.type);
  const severityStyle = getCryptoEventSeverityColor(event.severity);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      whileHover={{ scale: 1.01, x: 4 }}
      className={`group relative overflow-hidden rounded-lg border ${severityStyle} hover:brightness-110 transition-all duration-200`}
    >
      {/* Console-like compact design */}
      <div className="p-3">
        {/* Top row: Icon + Type + Severity + Chain */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="text-xs font-mono font-bold text-gray-300 uppercase">
              {event.type.replace(/_/g, '_')}
            </span>
            <SeverityIndicator severity={event.severity} />
          </div>
          <ChainBadgeCompact chain={event.chain} />
        </div>
        
        {/* Title */}
        <h4 className="text-sm font-medium text-white mb-1.5 font-mono">
          {event.title.replace(/[🔥🧱⚠️🧮🟣❌🏆📊]/g, '').trim()}
        </h4>
        
        {/* Description */}
        <p className="text-xs text-gray-400 mb-3 line-clamp-1 font-mono leading-relaxed">
          {event.description}
        </p>
        
        {/* Metrics row */}
        <div className="flex items-center gap-4 text-xs">
          {/* Value display */}
          {event.metrics.value !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 font-mono">VAL:</span>
              <span className="text-white font-mono font-bold">
                {event.metrics.value >= 1000 
                  ? `${(event.metrics.value / 1000).toFixed(1)}K` 
                  : event.metrics.value
                }
              </span>
              <MetricChange 
                value={event.metrics.change} 
                percentage={event.metrics.percentage} 
              />
            </div>
          )}
          
          {/* Block number */}
          {event.blockNumber && (
            <div className="flex items-center gap-1.5">
              <Hash className="w-3 h-3 text-gray-600" />
              <span className="text-gray-500 font-mono">{event.blockNumber.toLocaleString()}</span>
            </div>
          )}
          
          {/* Epoch */}
          {event.epoch && (
            <div className="flex items-center gap-1.5">
              <Box className="w-3 h-3 text-purple-500" />
              <span className="text-purple-400 font-mono">EP-{event.epoch}</span>
            </div>
          )}
          
          {/* Timestamp */}
          <div className="flex items-center gap-1.5 ml-auto">
            <Clock className="w-3 h-3 text-gray-600" />
            <span className="text-gray-500 font-mono">{formatTimeAgo(event.timestamp)}</span>
          </div>
        </div>
        
        {/* Tx Hash if available */}
        {event.txHash && (
          <div className="mt-2 pt-2 border-t border-white/5">
            <a
              href={`https://basescan.org/tx/${event.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-purple-400 transition-colors font-mono"
            >
              <ExternalLink className="w-3 h-3" />
              TX:{event.txHash.slice(0, 8)}...{event.txHash.slice(-4)}
            </a>
          </div>
        )}
      </div>
      
      {/* Side accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        event.severity === 'critical' ? 'bg-red-500' :
        event.severity === 'warning' ? 'bg-orange-500' :
        event.severity === 'success' ? 'bg-green-500' :
        'bg-blue-500'
      }`} />
    </motion.div>
  );
}
