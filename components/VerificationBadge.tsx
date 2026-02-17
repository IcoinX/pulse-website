// Verification Badge Component for PULSE Protocol
// Strict rules: no marketing, only verifiable facts

import { Shield, Clock, AlertTriangle, XCircle, CheckCircle, ExternalLink } from 'lucide-react';

export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'DISPUTED' | 'REJECTED';

interface VerificationBadgeProps {
  status: VerificationStatus;
  reason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  txHash?: string;
  challengeCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG = {
  VERIFIED: {
    label: 'Verified',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: Shield,
    description: 'Proven by on-chain data or resolved challenge'
  },
  PENDING: {
    label: 'Pending',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: Clock,
    description: 'Awaiting verification - social/news source'
  },
  DISPUTED: {
    label: 'Disputed',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    icon: AlertTriangle,
    description: 'Active challenge - under review'
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: XCircle,
    description: 'False or unverifiable - rejected by challenge'
  }
};

export function VerificationBadge({ 
  status, 
  reason, 
  verifiedAt, 
  verifiedBy, 
  txHash,
  challengeCount = 0,
  size = 'md' 
}: VerificationBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div 
      className={`inline-flex items-center rounded-lg border ${config.bg} ${config.border} ${config.color} ${sizeClasses[size]} cursor-help`}
      title={`${config.description}${reason ? `\nReason: ${reason}` : ''}${verifiedBy ? `\nBy: ${verifiedBy}` : ''}`}
    >
      <Icon className={iconSizes[size]} />
      <span className="font-medium">{config.label}</span>
      {challengeCount > 0 && status === 'DISPUTED' && (
        <span className="ml-1 text-xs opacity-70">({challengeCount})</span>
      )}
    </div>
  );
}

export function VerificationBlock({ 
  status, 
  reason, 
  verifiedAt, 
  verifiedBy, 
  txHash,
  boostCount = 0,
  challengeCount = 0
}: {
  status: VerificationStatus;
  reason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  txHash?: string;
  boostCount?: number;
  challengeCount?: number;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  
  const getBaseScanLink = (hash: string) => {
    const cleanHash = hash.startsWith('0x') ? hash : `0x${hash}`;
    return `https://sepolia.basescan.org/tx/${cleanHash}`;
  };

  return (
    <div className={`rounded-xl border ${config.bg} ${config.border} p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-black/20 ${config.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
            <p className="text-sm text-gray-400">{config.description}</p>
          </div>
        </div>
        <VerificationBadge status={status} size="sm" />
      </div>
      
      {/* Reason */}
      {reason && (
        <div className="mb-4">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Reason</span>
          <p className="text-sm text-gray-300 mt-1">{reason}</p>
        </div>
      )}
      
      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {verifiedBy && (
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Verified By</span>
            <p className="text-sm text-gray-300 font-mono mt-1">{verifiedBy}</p>
          </div>
        )}
        {verifiedAt && (
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Timestamp</span>
            <p className="text-sm text-gray-300 mt-1">
              {new Date(verifiedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
      
      {/* On-chain proof */}
      {txHash && status === 'VERIFIED' && (
        <div className="mb-4 p-3 bg-black/30 rounded-lg">
          <span className="text-xs text-gray-500 uppercase tracking-wide">On-Chain Proof</span>
          <a 
            href={getBaseScanLink(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mt-1 text-sm text-blue-400 hover:text-blue-300"
          >
            <span className="font-mono">{txHash.slice(0, 20)}...{txHash.slice(-8)}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
      
      {/* Stats */}
      <div className="flex items-center gap-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-400">{boostCount} boosts</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${challengeCount > 0 ? 'text-orange-400' : 'text-gray-600'}`} />
          <span className="text-sm text-gray-400">{challengeCount} challenges</span>
        </div>
      </div>
    </div>
  );
}

// Pipeline helper: determine status from source
export function getVerificationStatusFromSource(sourceType: string): {
  status: VerificationStatus;
  reason: string;
  verifiedBy?: string;
} {
  const upperSource = sourceType.toUpperCase();
  
  // VERIFIED: on-chain sources
  if (['ONCHAIN', 'GENESIS', 'CONTRACT'].includes(upperSource)) {
    return {
      status: 'VERIFIED',
      reason: 'On-chain event indexed from Base Sepolia',
      verifiedBy: 'onchain'
    };
  }
  
  // PENDING: social/news sources
  if (['AGENT', 'AI', 'CRYPTO', 'X', 'TWITTER', 'GITHUB', 'RSS'].includes(upperSource)) {
    return {
      status: 'PENDING',
      reason: 'Social/news feed - awaiting community verification'
    };
  }
  
  // Default
  return {
    status: 'PENDING',
    reason: 'Awaiting verification'
  };
}

export default VerificationBadge;
