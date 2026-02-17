'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ProtocolEvent, SourceType, Evidence, VerificationStatus } from '@/types';
import { 
  formatTimeAgo, 
  getStatusBgColor,
  getStatusIcon,
  getCategoryColor,
  getCategoryLabel,
  getVerificationStatusColor,
  getVerificationStatusIcon,
  getVerificationStatusLabel,
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
  Clock,
  ChevronDown,
  Link2,
  Github,
  Twitter,
  Newspaper,
  Database,
  FileCode,
  GitCommit,
  Tag,
  Blocks,
  Lock
} from 'lucide-react';
import BoostModal from './modals/BoostModal';
import AssertionModal from './modals/AssertionModal';
import { CreateAssertionModal } from './modals/CreateAssertionModal';
import { isWhitelisted } from '@/lib/whitelist';
import { ASSERTION_TYPES } from '@/lib/contracts';

interface FeedCardProps {
  item: ProtocolEvent;
  index?: number;
}

// Action Button Component (for connected users)
const ActionButton = ({ 
  icon: Icon,
  label,
  onClick,
  colorClass = 'text-gray-400',
  bgClass = 'hover:bg-white/5'
}: { 
  icon: React.ElementType;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  colorClass?: string;
  bgClass?: string;
}) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${colorClass} ${bgClass} rounded-lg transition-colors`}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);

// Source type configuration
const sourceConfig: Record<SourceType, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
  ONCHAIN: {
    icon: <Blocks className="w-3 h-3" />,
    label: 'On-chain',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30'
  },
  GITHUB: {
    icon: <Github className="w-3 h-3" />,
    label: 'GitHub',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10 border-gray-500/30'
  },
  X: {
    icon: <Twitter className="w-3 h-3" />,
    label: 'X',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30'
  },
  MEDIA: {
    icon: <Newspaper className="w-3 h-3" />,
    label: 'Media',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/30'
  }
};

// Source Type Badge component
const SourceTypeBadge = ({ type, signalsAttached }: { type: SourceType; signalsAttached?: number }) => {
  const config = sourceConfig[type];
  
  return (
    <div className="flex items-center gap-2">
      <span className={`flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${config.bgColor} ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
      {signalsAttached && signalsAttached > 1 && (
        <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/30 rounded-full">
          <Link2 className="w-3 h-3" />
          {signalsAttached} signals
        </span>
      )}
    </div>
  );
};

// Sprint 1.5: Verification Status Badge component
const VerificationStatusBadge = ({ status, reason }: { status: VerificationStatus; reason?: string }) => {
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
      <span className={`flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${bgColor} ${color}`}>
        <span>{icon}</span>
        <span>{label}</span>
      </span>
      {reason && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg max-w-xs">
          {reason}
        </div>
      )}
    </div>
  );
};

// Evidence accordion component
const EvidenceAccordion = ({ evidence, isOpen, onToggle }: { evidence: Evidence[]; isOpen: boolean; onToggle: () => void }) => {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="border-t border-white/5">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className="w-full px-5 py-2.5 flex items-center justify-between text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5" />
          Show Evidence ({evidence.length} {evidence.length === 1 ? 'source' : 'sources'})
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3">
              {evidence.map((ev, idx) => (
                <EvidenceCard key={idx} evidence={ev} index={idx} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Individual evidence card
const EvidenceCard = ({ evidence, index }: { evidence: Evidence; index: number }) => {
  const getEvidenceIcon = () => {
    switch (evidence.source_type) {
      case 'ONCHAIN': return <Blocks className="w-4 h-4 text-purple-400" />;
      case 'GITHUB': return <Github className="w-4 h-4 text-gray-400" />;
      case 'X': return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'MEDIA': return <Newspaper className="w-4 h-4 text-orange-400" />;
      default: return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEvidenceContent = () => {
    switch (evidence.source_type) {
      case 'ONCHAIN':
        return (
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Chain:</span>
              <span className="text-purple-300 font-medium">{evidence.chain || 'Base Sepolia'}</span>
            </div>
            {evidence.block_number && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Block:</span>
                <span className="text-gray-300">#{evidence.block_number.toLocaleString()}</span>
              </div>
            )}
            {evidence.tx_hash && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Tx Hash:</span>
                <span className="text-gray-300 font-mono">{evidence.tx_hash.slice(0, 10)}...{evidence.tx_hash.slice(-6)}</span>
              </div>
            )}
            {evidence.contract && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Contract:</span>
                <span className="text-gray-300 font-mono">{evidence.contract.slice(0, 10)}...{evidence.contract.slice(-6)}</span>
              </div>
            )}
          </div>
        );
      case 'GITHUB':
        return (
          <div className="space-y-1 text-xs">
            {evidence.repo && (
              <div className="flex items-center gap-2">
                <FileCode className="w-3 h-3 text-gray-500" />
                <span className="text-gray-300">{evidence.repo}</span>
              </div>
            )}
            {evidence.commit_sha && (
              <div className="flex items-center gap-2">
                <GitCommit className="w-3 h-3 text-gray-500" />
                <span className="text-gray-300 font-mono">{evidence.commit_sha.slice(0, 7)}</span>
              </div>
            )}
            {evidence.release_tag && (
              <div className="flex items-center gap-2">
                <Tag className="w-3 h-3 text-gray-500" />
                <span className="text-green-300">{evidence.release_tag}</span>
              </div>
            )}
          </div>
        );
      case 'X':
        return (
          <div className="space-y-1 text-xs">
            {evidence.author_handle && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Author:</span>
                <span className="text-blue-300">{evidence.author_handle}</span>
              </div>
            )}
            {evidence.tweet_id && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Tweet ID:</span>
                <span className="text-gray-300 font-mono">{evidence.tweet_id.slice(0, 15)}...</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Whitelisted:</span>
              <span className="text-green-400">✓ Verified</span>
            </div>
          </div>
        );
      case 'MEDIA':
        return (
          <div className="space-y-1 text-xs">
            {evidence.media_source && (
              <div className="flex items-center gap-2">
                <Newspaper className="w-3 h-3 text-gray-500" />
                <span className="text-orange-300">{evidence.media_source}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Published:</span>
              <span className="text-gray-300">{new Date(evidence.timestamp).toLocaleString()}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-black/30 rounded-lg p-3 border border-white/5">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white/5 rounded-lg">
          {getEvidenceIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-medium ${sourceConfig[evidence.source_type].color}`}>
              {sourceConfig[evidence.source_type].label}
            </span>
            <a
              href={evidence.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View {evidence.source_type === 'ONCHAIN' ? 'on Explorer' : 
                     evidence.source_type === 'GITHUB' ? 'on GitHub' : 
                     evidence.source_type === 'X' ? 'on X' : 'Article'}
            </a>
          </div>
          {getEvidenceContent()}
        </div>
      </div>
    </div>
  );
};

// Sprint 1.5: Ghost Action Button with Lock and Tooltip
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
      <Icon className="w-3.5 h-3.5" />
      <Lock className="w-3 h-3 opacity-70" />
      {label}
    </button>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg">
      {tooltip}
    </div>
  </div>
);

// Legacy TooltipButton (kept for compatibility)
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

  const tooltips = {
    pending: 'Awaiting validator verification',
    challenged: '⚠️ This event is under dispute. Outcome pending validator resolution.',
    verified: 'Verified by consensus validators',
    rejected: 'Failed verification - source not credible',
  };

  const challengedStyles = status === 'challenged' 
    ? 'bg-orange-500/30 border-orange-500/50 text-orange-300 animate-pulse' 
    : '';

  return (
    <div className="relative group">
      <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBgColor(status)} ${challengedStyles}`}>
        {status === 'challenged' && <span className="text-orange-400">⚠️</span>}
        {icons[status]}
        <span className="uppercase tracking-wider">{status}</span>
      </span>
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg max-w-xs">
        {tooltips[status]}
      </div>
    </div>
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

// Get dominant impact
const getDominantImpact = (impact: ProtocolEvent['impact']) => {
  const impacts = [
    { type: 'market', value: impact.market, label: 'Market', icon: TrendingUp, color: 'text-red-400', bgColor: 'bg-red-500/20' },
    { type: 'narrative', value: impact.narrative, label: 'Narrative', icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    { type: 'tech', value: impact.tech, label: 'Tech', icon: Zap, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  ];
  return impacts.reduce((max, current) => current.value > max.value ? current : max);
};

// Impact score bars with dominant impact highlighted
const ImpactBars = ({ impact }: { impact: ProtocolEvent['impact'] }) => {
  const maxImpact = Math.max(impact.market, impact.narrative, impact.tech);
  const dominant = getDominantImpact(impact);
  
  return (
    <div className="flex items-center gap-2" title={`Impact: ${dominant.label} (${maxImpact})`}>
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
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [isAssertionModalOpen, setIsAssertionModalOpen] = useState(false);
  const { isConnected, user } = useAuth();
  const address = user?.wallet_address;
  const whitelisted = isWhitelisted(address);
  const totalImpact = Math.round((item.impact.market + item.impact.narrative + item.impact.tech) / 3);

  const handleBoost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBoostModalOpen(true);
  };

  const handleAssertion = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAssertionModalOpen(true);
  };

  return (
    <motion.div
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

          <div className="flex items-center gap-2">
            {/* Source Type Badge */}
            <SourceTypeBadge type={item.source_type} signalsAttached={item.signals_attached} />
            
            {/* Sprint 1.5: Verification Status Badge */}
            <VerificationStatusBadge 
              status={item.verificationStatus} 
              reason={item.verificationReason} 
            />
            
            {/* Sprint 2.4.1: Assertion Badge */}
            {item.assertion !== undefined && (
              <span className={`flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border bg-${ASSERTION_TYPES[item.assertion.type].color}-500/10 border-${ASSERTION_TYPES[item.assertion.type].color}-500/30 text-${ASSERTION_TYPES[item.assertion.type].color}-400`}>
                <Shield className="w-3 h-3" />
                {ASSERTION_TYPES[item.assertion.type].label}
              </span>
            )}
            
            {/* Status Badge */}
            <StatusBadge status={item.status} />
          </div>
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
            {/* Dominant Impact - Highlighted */}
            {(() => {
              const dominant = getDominantImpact(item.impact);
              const Icon = dominant.icon;
              return (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${dominant.bgColor}`} title={`Dominant Impact: ${dominant.label}`}>
                  <Icon className={`w-3.5 h-3.5 ${dominant.color}`} />
                  <span className={`text-xs font-bold ${dominant.color}`}>
                    {dominant.label} ▲
                  </span>
                </div>
              );
            })()}
            
            <span className="text-gray-700">|</span>
            
            {/* Verification Score */}
            <VerificationScore score={item.verification_score} />
            
            <span className="text-gray-700">|</span>
            
            {/* Sources Count */}
            <div className="flex items-center gap-1.5" title="Sources">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-400">{item.validation.source_count} sources</span>
            </div>
            
            <span className="text-gray-700">|</span>
            
            {/* All Impact Bars */}
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

      {/* Evidence Accordion */}
      <EvidenceAccordion 
        evidence={item.evidence} 
        isOpen={isEvidenceOpen} 
        onToggle={() => setIsEvidenceOpen(!isEvidenceOpen)} 
      />

      {/* Actions Bar - Sprint 2: Wallet-gated CTAs */}
      <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Open Button - Always Active */}
          <Link
            href={`/event/${item.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Open
          </Link>

          {isConnected ? (
            <>
              {/* Challenge Button - Active when connected */}
              <ActionButton 
                icon={AlertTriangle}
                label="Challenge"
                onClick={() => {}} // TODO: Open challenge modal with assertion ID
                colorClass="text-orange-400"
                bgClass="hover:bg-orange-500/10"
              />

              {/* Boost Button - Whitelist gated */}
              {whitelisted ? (
                <ActionButton 
                  icon={ChevronUp}
                  label="Boost"
                  onClick={handleBoost}
                  colorClass="text-green-400"
                  bgClass="hover:bg-green-500/10"
                />
              ) : (
                <GhostActionButton 
                  icon={ChevronUp}
                  label="Boost (Limited)"
                  tooltip="Boost in limited test — access expanding soon"
                  colorClass="text-green-400"
                />
              )}

              {/* Sprint 2.4.1: Add Certified Assertion Button */}
              {whitelisted ? (
                <ActionButton 
                  icon={Shield}
                  label="Add Assertion"
                  onClick={handleAssertion}
                  colorClass="text-purple-400"
                  bgClass="hover:bg-purple-500/10"
                />
              ) : (
                <GhostActionButton 
                  icon={Shield}
                  label="Add Assertion"
                  tooltip="Certified assertions in limited test"
                  colorClass="text-purple-400"
                />
              )}
            </>
          ) : (
            <>
              {/* Ghost Actions when not connected */}
              <GhostActionButton 
                icon={AlertTriangle}
                label="Challenge"
                tooltip="Connect wallet to challenge"
                colorClass="text-orange-400"
              />

              <GhostActionButton 
                icon={ChevronUp}
                label="Boost"
                tooltip="Connect wallet to boost"
                colorClass="text-green-400"
              />

              <GhostActionButton 
                icon={Shield}
                label="Add Assertion"
                tooltip="Connect wallet to add assertion"
                colorClass="text-blue-400"
              />
            </>
          )}

          {/* Share Button - Always Active */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/event/${item.id}`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Share
          </button>
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

      {/* Modals */}
      <BoostModal
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        eventId={parseInt(item.id) || 0}
        eventTitle={item.title}
      />

      <CreateAssertionModal
        eventId={parseInt(item.id) || 0}
        eventTitle={item.title}
        isOpen={isAssertionModalOpen}
        onClose={() => setIsAssertionModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </motion.div>
  );
}
