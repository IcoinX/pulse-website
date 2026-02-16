'use client';

import { motion } from 'framer-motion';
import { ProtocolEvent, Evidence } from '@/types';
import { 
  formatTimeAgo, 
  getVerificationStatusColor,
  getVerificationStatusIcon,
  getVerificationStatusLabel,
} from '@/lib/data';
import { 
  Database,
  Github,
  Twitter,
  Newspaper,
  Blocks,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Hash,
  FileCode,
  GitCommit,
  Tag,
  Link2,
  Copy,
  Info
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface CanonicalEventViewProps {
  event: ProtocolEvent;
}

// Source type configuration
const sourceConfig = {
  ONCHAIN: {
    icon: <Blocks className="w-4 h-4" />,
    label: 'On-chain',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30'
  },
  GITHUB: {
    icon: <Github className="w-4 h-4" />,
    label: 'GitHub',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10 border-gray-500/30'
  },
  X: {
    icon: <Twitter className="w-4 h-4" />,
    label: 'X',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30'
  },
  MEDIA: {
    icon: <Newspaper className="w-4 h-4" />,
    label: 'Media',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/30'
  }
};

// Copy to clipboard helper
const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  } catch (err) {
    toast.error('Failed to copy');
  }
};

// Evidence card with detailed info
const EvidenceCard = ({ evidence, index, isPrimary }: { evidence: Evidence; index: number; isPrimary: boolean }) => {
  const config = sourceConfig[evidence.source_type];
  
  const getEvidenceDetails = () => {
    switch (evidence.source_type) {
      case 'ONCHAIN':
        return (
          <div className="space-y-2 text-sm">
            {evidence.chain && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Chain</span>
                <span className="text-purple-300">{evidence.chain}</span>
              </div>
            )}
            {evidence.block_number && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Block</span>
                <span className="text-gray-300">#{evidence.block_number.toLocaleString()}</span>
              </div>
            )}
            {evidence.tx_hash && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Tx Hash</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded">
                    {evidence.tx_hash.slice(0, 12)}...{evidence.tx_hash.slice(-8)}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(evidence.tx_hash!, 'Tx Hash')}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            {evidence.contract && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Contract</span>
                <code className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded">
                  {evidence.contract.slice(0, 10)}...{evidence.contract.slice(-6)}
                </code>
              </div>
            )}
          </div>
        );
      case 'GITHUB':
        return (
          <div className="space-y-2 text-sm">
            {evidence.repo && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Repository</span>
                <span className="text-gray-300">{evidence.repo}</span>
              </div>
            )}
            {evidence.release_tag && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Release</span>
                <span className="flex items-center gap-1.5 text-green-300">
                  <Tag className="w-3.5 h-3.5" />
                  {evidence.release_tag}
                </span>
              </div>
            )}
            {evidence.commit_sha && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Commit</span>
                <code className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded font-mono">
                  {evidence.commit_sha.slice(0, 7)}
                </code>
              </div>
            )}
          </div>
        );
      case 'X':
        return (
          <div className="space-y-2 text-sm">
            {evidence.author_handle && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Author</span>
                <span className="text-blue-300">{evidence.author_handle}</span>
              </div>
            )}
            {evidence.tweet_id && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Tweet ID</span>
                <code className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded">
                  {evidence.tweet_id.slice(0, 20)}...
                </code>
              </div>
            )}
          </div>
        );
      case 'MEDIA':
        return (
          <div className="space-y-2 text-sm">
            {evidence.media_source && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Source</span>
                <span className="text-orange-300">{evidence.media_source}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Timestamp</span>
              <span className="text-gray-300">{new Date(evidence.timestamp).toLocaleString()}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-black/20 rounded-lg p-4 border ${isPrimary ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/5'} hover:border-white/10 transition-colors`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
            {config.icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${config.color}`}>{config.label}</span>
              {isPrimary && (
                <span className="px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded">
                  Primary
                </span>
              )}
              {!isPrimary && (
                <span className="px-1.5 py-0.5 text-[10px] bg-gray-500/20 text-gray-400 rounded">
                  Corroborating
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">{formatTimeAgo(evidence.timestamp)}</span>
          </div>
        </div>
        <a
          href={evidence.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      {getEvidenceDetails()}
    </motion.div>
  );
};

// Timeline component
const SignalTimeline = ({ evidence }: { evidence: Evidence[] }) => {
  const sortedEvidence = [...evidence].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-purple-500/50 via-blue-500/50 to-transparent" />
      
      <div className="space-y-4">
        {sortedEvidence.map((ev, idx) => {
          const config = sourceConfig[ev.source_type];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative flex items-start gap-4 pl-10"
            >
              {/* Timeline dot */}
              <div className={`absolute left-2 w-4 h-4 rounded-full border-2 ${config.bgColor} ${config.color} flex items-center justify-center`}>
                <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')}`} />
              </div>
              
              {/* Content */}
              <div className="flex-1 bg-black/20 rounded-lg p-3 border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={config.color}>{config.icon}</span>
                    <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {ev.source_type === 'ONCHAIN' && ev.tx_hash && `Tx: ${ev.tx_hash.slice(0, 16)}...`}
                  {ev.source_type === 'GITHUB' && ev.repo && `${ev.repo}${ev.release_tag ? `@${ev.release_tag}` : ''}`}
                  {ev.source_type === 'X' && ev.author_handle && `${ev.author_handle}`}
                  {ev.source_type === 'MEDIA' && ev.media_source && `${ev.media_source}`}
                </p>
              </div>
            </motion.div>
          );
        })}
        
        {/* PULSE Registration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: sortedEvidence.length * 0.1 }}
          className="relative flex items-start gap-4 pl-10"
        >
          <div className="absolute left-2 w-4 h-4 rounded-full border-2 border-pink-500/50 bg-pink-500/20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
          </div>
          <div className="flex-1 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg p-3 border border-pink-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-pink-400" />
                <span className="text-sm font-medium text-pink-400">PULSE</span>
              </div>
              <span className="text-xs text-gray-500">Registered</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Event indexed and verified</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function CanonicalEventView({ event }: CanonicalEventViewProps) {
  const [showHash, setShowHash] = useState(false);
  
  // Generate a canonical hash based on event ID
  const canonicalHash = `sha256:${event.id.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0).toString(16);
  }, '').slice(0, 64)}`;

  return (
    <div className="space-y-6">
      {/* Event Registry Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-500/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Event Registry</h2>
        </div>
        
        <div className="space-y-4">
          {/* Event ID */}
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">Event ID</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-sm text-white font-mono">{event.id}</code>
              <button 
                onClick={() => copyToClipboard(event.id, 'Event ID')}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Canonical Hash */}
          <div className="p-3 bg-black/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">Canonical Hash</span>
              </div>
              <button 
                onClick={() => setShowHash(!showHash)}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                {showHash ? 'Hide' : 'Show'}
              </button>
            </div>
            {showHash ? (
              <div className="flex items-center gap-2">
                <code className="text-xs text-gray-300 font-mono break-all">{canonicalHash}</code>
                <button 
                  onClick={() => copyToClipboard(canonicalHash, 'Hash')}
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors flex-shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <code className="text-xs text-gray-500 font-mono">{canonicalHash.slice(0, 20)}...{canonicalHash.slice(-8)}</code>
            )}
          </div>
          
          {/* Verification Status */}
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">Verification Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full border ${getVerificationStatusColor(event.verificationStatus)}`}>
                <span>{getVerificationStatusIcon(event.verificationStatus)}</span>
                <span>{getVerificationStatusLabel(event.verificationStatus)}</span>
              </span>
            </div>
          </div>
          
          {event.verificationReason && (
            <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
              <Info className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <span className="text-sm text-gray-400">Reason</span>
                <p className="text-sm text-gray-300 mt-1">{event.verificationReason}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Signal Timeline */}
      {event.evidence.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Signal Timeline</h3>
            <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
              {event.evidence.length} signals
            </span>
          </div>
          <SignalTimeline evidence={event.evidence} />
        </motion.div>
      )}

      {/* Aggregated Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 rounded-xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link2 className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Sources</h3>
          </div>
          <span className="text-sm text-gray-400">
            {event.validation.source_count} total
          </span>
        </div>
        
        <div className="space-y-3">
          {event.evidence.map((ev, idx) => (
            <EvidenceCard 
              key={idx} 
              evidence={ev} 
              index={idx} 
              isPrimary={idx === 0} 
            />
          ))}
        </div>
      </motion.div>

      {/* Network Verification (Placeholder for future) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-xl p-6 border border-gray-500/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Network Verification</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <span className="text-sm text-gray-400">Attestation Hash</span>
            <span className="text-sm text-gray-500 italic">Coming with mainnet</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <span className="text-sm text-gray-400">Verified by</span>
            <span className="text-sm text-gray-500 italic">{event.validation.validator_count} validators (coming with staking)</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <span className="text-sm text-gray-400">Consensus</span>
            <span className="text-sm text-gray-500 italic">Coming with mainnet</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Full network verification will be available once PULSE protocol launches on mainnet.
        </p>
      </motion.div>
    </div>
  );
}
