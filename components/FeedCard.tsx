'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProtocolEvent } from '@/types';
import { 
  formatTimeAgo, 
  getStatusBgColor,
  getStatusIcon,
  getCategoryColor,
  getCategoryLabel,
} from '@/lib/data';
import { 
  ExternalLink, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Zap,
  Flame,
  ChevronUp,
  MessageSquare,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface FeedCardProps {
  item: ProtocolEvent;
  index?: number;
}

// Tooltip component for disabled buttons
const TooltipButton = ({ 
  children, 
  tooltip,
  onClick 
}: { 
  children: React.ReactNode; 
  tooltip: string;
  onClick?: () => void;
}) => (
  <div className="relative group">
    <button 
      onClick={onClick}
      className="opacity-50 cursor-not-allowed"
      disabled
    >
      {children}
    </button>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
      {tooltip}
    </div>
  </div>
);

// Status badge component
const StatusBadge = ({ status }: { status: ProtocolEvent['status'] }) => {
  const icons = {
    pending: <Clock className="w-3 h-3" />,
    challenged: <AlertTriangle className="w-3 h-3" />,
    verified: <CheckCircle className="w-3 h-3" />,
    rejected: <XCircle className="w-3 h-3" />,
  };

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBgColor(status)}`}>
      {icons[status]}
      <span className="uppercase tracking-wider">{status}</span>
    </span>
  );
};

// Verification score indicator
const VerificationScore = ({ score }: { score: number }) => {
  let color = 'text-red-400';
  if (score >= 80) color = 'text-green-400';
  else if (score >= 60) color = 'text-yellow-400';
  else if (score >= 40) color = 'text-orange-400';

  return (
    <div className="flex items-center gap-1.5" title="Verification Score">
      <Shield className={`w-3.5 h-3.5 ${color}`} />
      <span className={`text-xs font-medium ${color}`}>{score}%</span>
    </div>
  );
};

// Impact score bars
const ImpactBars = ({ impact }: { impact: ProtocolEvent['impact'] }) => {
  const maxImpact = Math.max(impact.market, impact.narrative, impact.tech);
  
  return (
    <div className="flex items-center gap-2" title="Impact Scores">
      <div className="flex gap-0.5">
        <div 
          className="w-1 h-3 rounded-full bg-red-500/60"
          style={{ opacity: impact.market / 100 }}
        />
        <div 
          className="w-1 h-3 rounded-full bg-blue-500/60"
          style={{ opacity: impact.narrative / 100 }}
        />
        <div 
          className="w-1 h-3 rounded-full bg-purple-500/60"
          style={{ opacity: impact.tech / 100 }}
        />
      </div>
      <span className="text-xs text-gray-500">{maxImpact}</span>
    </div>
  );
};

export default function FeedCard({ item, index = 0 }: FeedCardProps) {
  const totalImpact = Math.round((item.impact.market + item.impact.narrative + item.impact.tech) / 3);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.005, y: -1 }}
      className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
    >
      <Link href={`/event/${item.id}`} className="block">
        {/* Header Row */}
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Channel/Category Label */}
            <span className={`text-xs font-bold uppercase tracking-wider ${getCategoryColor(item.category)}`}>
              {getCategoryLabel(item.category)}
            </span>
            
            <span className="text-gray-600">•</span>
            
            {/* Source */}
            <span className="text-xs text-gray-400">{item.source}</span>
            
            <span className="text-gray-600">•</span>
            
            {/* Time */}
            <span className="text-xs text-gray-500">{formatTimeAgo(item.timestamp)}</span>
          </div>

          {/* Status Badge */}
          <StatusBadge status={item.status} />
        </div>

        {/* Main Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
            {item.title}
          </h3>

          {/* Summary */}
          <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
            {item.summary || item.content}
          </p>

          {/* Protocol Strip */}
          <div className="flex flex-wrap items-center gap-4 py-3 px-4 bg-black/20 rounded-lg border border-white/5 mb-4">
            {/* Verification Score */}
            <VerificationScore score={item.verification_score} />
            
            <span className="text-gray-700">|</span>
            
            {/* Sources Count */}
            <div className="flex items-center gap-1.5" title="Sources">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-400">{item.validation.source_count} sources</span>
            </div>
            
            <span className="text-gray-700">|</span>
            
            {/* Impact */}
            <ImpactBars impact={item.impact} />
            
            <span className="text-gray-700">|</span>
            
            {/* Boost */}
            <div className="flex items-center gap-1" title={`Boost: ${item.metrics.boost.toLocaleString()} PULSE`}>
              <ChevronUp className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-green-400 font-medium">
                {item.metrics.boost >= 1000 
                  ? `${(item.metrics.boost / 1000).toFixed(1)}k` 
                  : item.metrics.boost
                }
              </span>
            </div>
            
            {/* Burn - Always Visible */}
            <div className="flex items-center gap-1" title={`Burn: ${item.metrics.burn.toLocaleString()} PULSE`}>
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs text-orange-400 font-medium">
                {item.metrics.burn >= 1000 
                  ? `${(item.metrics.burn / 1000).toFixed(1)}k` 
                  : item.metrics.burn || 0
                }
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded-md hover:bg-white/10 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 4 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{item.tags.length - 4}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Actions Bar */}
      <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Open Button */}
          <Link
            href={`/event/${item.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Open
          </Link>

          {/* Boost Button (Disabled with Tooltip) */}
          <TooltipButton tooltip="coming online">
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors">
              <ChevronUp className="w-3.5 h-3.5" />
              Boost
            </span>
          </TooltipButton>

          {/* Challenge Button (Disabled with Tooltip) */}
          <TooltipButton tooltip="coming online">
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" />
              Challenge
            </span>
          </TooltipButton>

          {/* Discuss Button (Disabled with Tooltip) */}
          <TooltipButton tooltip="coming online">
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
              Discuss
            </span>
          </TooltipButton>
        </div>

        {/* External Link */}
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          <span className="hidden sm:inline">Source</span>
        </a>
      </div>
    </motion.article>
  );
}
