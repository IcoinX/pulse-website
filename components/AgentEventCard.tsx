'use client';

import { motion } from 'framer-motion';
import { AgentEvent, AgentEventType, AgentEventSourceKind, VerificationStatus } from '@/types';
import { 
  formatTimeAgo 
} from '@/lib/data';
import { 
  ExternalLink, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle,
  Bot,
  RefreshCw,
  Zap,
  Trophy,
  Signal,
  GitBranch,
  Link2,
  Twitter,
  TrendingUp,
  TrendingDown,
  Activity,
  Lock,
  Newspaper
} from 'lucide-react';

interface AgentEventCardProps {
  event: AgentEvent;
  index?: number;
}

// ============================================
// TYPE CONFIGURATION
// ============================================

const TYPE_CONFIG: Record<AgentEventType, { icon: string; label: string; color: string; bgColor: string }> = {
  'AGENT_CREATED': { 
    icon: '🆕', 
    label: 'CREATED', 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/10 border-green-500/30' 
  },
  'AGENT_UPDATED': { 
    icon: '🔁', 
    label: 'UPDATED', 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-500/10 border-blue-500/30' 
  },
  'AGENT_SIGNAL': { 
    icon: '📡', 
    label: 'SIGNAL', 
    color: 'text-cyan-400', 
    bgColor: 'bg-cyan-500/10 border-cyan-500/30' 
  },
  'AGENT_STAKED': { 
    icon: '✅', 
    label: 'VALIDATING', 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-500/10 border-purple-500/30' 
  },
  'AGENT_SLASHED': { 
    icon: '❌', 
    label: 'SLASHED', 
    color: 'text-red-400', 
    bgColor: 'bg-red-500/10 border-red-500/30' 
  },
  'AGENT_BOOSTED': { 
    icon: '🚀', 
    label: 'BOOSTED', 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-500/10 border-orange-500/30' 
  },
  'AGENT_PROMOTED': { 
    icon: '🏆', 
    label: 'TOP RANKED', 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-500/10 border-yellow-500/30' 
  },
};

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  'PENDING': { 
    icon: <HelpCircle className="w-3.5 h-3.5" />, 
    color: 'text-yellow-400 bg-yellow-500/10', 
    label: 'Pending' 
  },
  'CHALLENGED': { 
    icon: <AlertTriangle className="w-3.5 h-3.5" />, 
    color: 'text-orange-400 bg-orange-500/10', 
    label: 'Challenged' 
  },
  'VERIFIED': { 
    icon: <CheckCircle className="w-3.5 h-3.5" />, 
    color: 'text-green-400 bg-green-500/10', 
    label: 'Verified' 
  },
  'REJECTED': { 
    icon: <AlertTriangle className="w-3.5 h-3.5" />, 
    color: 'text-red-400 bg-red-500/10', 
    label: 'Rejected' 
  },
};

// Sprint 1.5: Verification Status Badge for Agent Events
const VerificationStatusBadge = ({ event }: { event: AgentEvent }) => {
  // Determine verification status based on event properties
  let status: VerificationStatus = 'UNVERIFIED';
  let reason = 'Awaiting cross-source confirmation';
  
  if (event.status === 'CHALLENGED') {
    status = 'CHALLENGED';
    reason = 'Under dispute - validator review pending';
  } else if (event.verification.badge === 'VERIFIED' || 
             (event.verification.sources.length >= 2 && event.verification.score >= 80)) {
    status = 'VERIFIED';
    reason = `${event.verification.sources.length} sources + consensus validated`;
  }

  const config = {
    VERIFIED: { 
      icon: '✅', 
      color: 'text-green-400', 
      bgColor: 'bg-green-500/10 border-green-500/30',
      label: 'Verified by protocol'
    },
    CHALLENGED: { 
      icon: '⚠️', 
      color: 'text-orange-400', 
      bgColor: 'bg-orange-500/10 border-orange-500/30',
      label: 'Under dispute'
    },
    UNVERIFIED: { 
      icon: '⏳', 
      color: 'text-gray-400', 
      bgColor: 'bg-gray-500/10 border-gray-500/30',
      label: 'Awaiting verification'
    },
  };

  const { icon, bgColor, color, label } = config[status];

  return (
    <div className="relative group">
      <span className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium rounded-full border ${bgColor} ${color}`}>
        <span>{icon}</span>
        <span>{label}</span>
      </span>
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg">
        {reason}
      </div>
    </div>
  );
};

// Sprint 1.5: Ghost Action Button
const GhostActionButton = ({ 
  icon: Icon,
  label,
  tooltip,
  colorClass = 'text-gray-400'
}: { 
  icon: React.ElementType;
  label: string;
  tooltip: string;
  colorClass?: string;
}) => (
  <div className="relative group">
    <button 
      disabled
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium opacity-50 cursor-not-allowed ${colorClass} hover:bg-white/5 rounded-lg transition-colors`}
    >
      <Lock className="w-3 h-3" />
      {label}
    </button>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg">
      {tooltip}
    </div>
  </div>
);

const BADGE_CONFIG: Record<string, { color: string; bgColor: string }> = {
  'VERIFIED': { 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/20 border-green-500/30' 
  },
  'CHECKED': { 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-500/20 border-blue-500/30' 
  },
  'RAW': { 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-500/20 border-gray-500/30' 
  },
};

const SOURCE_ICONS: Record<AgentEventSourceKind, React.ReactNode> = {
  'ONCHAIN': <Link2 className="w-3.5 h-3.5" />,
  'GITHUB': <GitBranch className="w-3.5 h-3.5" />,
  'X': <Twitter className="w-3.5 h-3.5" />,
  'MEDIA': <Newspaper className="w-3.5 h-3.5" />,
};

const SOURCE_COLORS: Record<AgentEventSourceKind, string> = {
  'ONCHAIN': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'GITHUB': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  'X': 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  'MEDIA': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
};

// ============================================
// SPARKLINE COMPONENT
// ============================================

const MiniSparkline = ({ 
  market, 
  narrative, 
  tech 
}: { 
  market: number; 
  narrative: number; 
  tech: number;
}) => {
  const data = [market, narrative, tech];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const width = 50;
  const height = 20;
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height * 0.8 - height * 0.1;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-purple-400"
      />
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height * 0.8 - height * 0.1}
        r="2.5"
        className="fill-purple-400"
      />
    </svg>
  );
};

// ============================================
// CHAIN BADGE
// ============================================

const ChainBadge = ({ chainId }: { chainId?: number }) => {
  if (!chainId) return null;
  
  const chains: Record<number, { name: string; color: string }> = {
    1: { name: 'Ethereum', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    8453: { name: 'Base', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    84532: { name: 'Sepolia', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    11155111: { name: 'Sepolia', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  };
  
  const chain = chains[chainId];
  if (!chain) return null;
  
  return (
    <span className={`px-2 py-0.5 text-[10px] font-medium border rounded ${chain.color}`}>
      {chain.name}
    </span>
  );
};

// ============================================
// MAIN CARD COMPONENT
// ============================================

export default function AgentEventCard({ event, index = 0 }: AgentEventCardProps) {
  const typeConfig = TYPE_CONFIG[event.type];
  const statusConfig = STATUS_CONFIG[event.status];
  const badgeConfig = BADGE_CONFIG[event.verification.badge];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.005, y: -2 }}
      className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Agent Avatar */}
            <div className="relative">
              <span className="text-3xl">{event.metadata?.avatar || '🤖'}</span>
              {event.type === 'AGENT_STAKED' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            {/* Agent Info */}
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                {event.entities.agent}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {event.entities.xHandle && <span>{event.entities.xHandle}</span>}
                {event.entities.githubRepo && <span>{event.entities.githubRepo}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sprint 1.5: Verification Status Badge */}
            <VerificationStatusBadge event={event} />
            
            {/* Type Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${typeConfig.bgColor}`}>
              <span className="text-sm">{typeConfig.icon}</span>
              <span className={`text-xs font-medium ${typeConfig.color}`}>{typeConfig.label}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-medium text-white mb-2 line-clamp-2">
          {event.title}
        </h3>
        
        {event.metadata?.description && (
          <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2">
            {event.metadata.description}
          </p>
        )}
        
        {/* Impact & Stats Row */}
        <div className="flex flex-wrap items-center gap-4 py-3 px-4 bg-black/20 rounded-lg border border-white/5">
          {/* Verification Score */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Trust Score</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{event.verification.score}%</span>
                {/* Mini impact sparkline */}
                <MiniSparkline 
                  market={event.impact.market} 
                  narrative={event.impact.narrative} 
                  tech={event.impact.tech} 
                />
              </div>
            </div>
          </div>
          
          <span className="text-gray-700">|</span>
          
          {/* Verification Badge */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${badgeConfig.bgColor}`}>
            {event.verification.badge === 'VERIFIED' && <CheckCircle className={`w-3 h-3 ${badgeConfig.color}`} />}
            {event.verification.badge === 'CHECKED' && <Shield className={`w-3 h-3 ${badgeConfig.color}`} />}
            {event.verification.badge === 'RAW' && <HelpCircle className={`w-3 h-3 ${badgeConfig.color}`} />}
            <span className={`text-[10px] font-medium uppercase ${badgeConfig.color}`}>
              {event.verification.badge}
            </span>
          </div>
          
          <span className="text-gray-700">|</span>
          
          {/* Status */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${statusConfig.color}`}>
            {statusConfig.icon}
            <span className="text-[10px] font-medium">{statusConfig.label}</span>
          </div>
          
          <span className="text-gray-700">|</span>
          
          {/* Chain */}
          <ChainBadge chainId={event.entities.chainId} />
          
          <span className="text-gray-700">|</span>
          
          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-gray-400">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-xs">{formatTimeAgo(event.timestamp)}</span>
          </div>
        </div>
        
        {/* Sources */}
        <div className="mt-3 flex flex-wrap gap-2">
          {event.verification.sources.map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition-colors hover:opacity-80 ${SOURCE_COLORS[source.kind]}`}
            >
              {SOURCE_ICONS[source.kind]}
              <span className="font-medium">{source.kind}</span>
              <span className="opacity-60">•</span>
              <span className="font-mono opacity-60">{source.ref.slice(0, 8)}...</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          ))}
        </div>
        
        {/* Economics */}
        {event.economics && (
          <div className="mt-3 flex flex-wrap gap-2">
            {event.economics.stakeAmount && (
              <span className="px-2 py-1 text-xs bg-purple-500/10 text-purple-400 rounded flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {parseInt(event.economics.stakeAmount).toLocaleString()} PULSE staked
              </span>
            )}
            {event.economics.boost && (
              <span className="px-2 py-1 text-xs bg-orange-500/10 text-orange-400 rounded flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {event.economics.boost.toLocaleString()} PULSE boosted
              </span>
            )}
            {event.economics.burnPct && (
              <span className="px-2 py-1 text-xs bg-red-500/10 text-red-400 rounded flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                {event.economics.burnPct}% burn
              </span>
            )}
          </div>
        )}
        
        {/* Tags */}
        {event.metadata?.tags && event.metadata.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {event.metadata.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-2 py-0.5 text-[10px] bg-white/5 text-gray-400 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Actions Bar - Sprint 1.5: Ghost Actions with Lock */}
      <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors">
            <Bot className="w-3.5 h-3.5" />
            View Agent
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Activity className="w-3.5 h-3.5" />
            View Activity
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sprint 1.5: Challenge Ghost Action */}
          {event.status !== 'REJECTED' && (
            <GhostActionButton 
              icon={AlertTriangle}
              label="Challenge"
              tooltip="Requires wallet connection"
              colorClass="text-orange-400"
            />
          )}
          
          {/* Sprint 1.5: Boost Ghost Action */}
          <GhostActionButton 
            icon={Zap}
            label="Boost"
            tooltip="Requires wallet + GENESIS"
            colorClass="text-green-400"
          />
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            Verify Source
          </button>
        </div>
      </div>
    </motion.article>
  );
}
