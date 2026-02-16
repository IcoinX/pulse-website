/**
 * Agent Signal Normalizer
 * 
 * Central module that aggregates and normalizes signals from 3 primary sources:
 * 1. On-chain indexer (existing)
 * 2. GitHub Watcher (new repos, releases, commits)
 * 3. X Whitelist Watcher (official announcements from 25 accounts)
 * 
 * Outputs standardized AgentEvent objects for the PULSE protocol.
 */

import {
  AgentEvent,
  AgentEventType,
  AgentEventStatus,
  AgentEventSource,
  AgentEventSourceKind,
  VerificationBadge,
  GitHubSignal,
  XSignal,
  OnChainSignal,
  OnChainSignalType,
} from '@/types';

// ============================================
// CONFIGURATION
// ============================================

const VERIFICATION_THRESHOLDS = {
  RAW: { min: 0, max: 30 },
  CHECKED: { min: 31, max: 70 },
  VERIFIED: { min: 71, max: 100 },
};

const IMPACT_WEIGHTS = {
  ONCHAIN: { market: 0.4, narrative: 0.3, tech: 0.3 },
  GITHUB: { market: 0.2, narrative: 0.3, tech: 0.5 },
  X: { market: 0.3, narrative: 0.5, tech: 0.2 },
  MEDIA: { market: 0.2, narrative: 0.6, tech: 0.2 },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate unique event ID
 */
export function generateEventId(
  source: AgentEventSourceKind,
  ref: string,
  timestamp: string
): string {
  const hash = Buffer.from(`${source}:${ref}:${timestamp}`).toString('base64').slice(0, 12);
  return `evt-${source.toLowerCase()}-${hash}`;
}

/**
 * Calculate verification score based on sources
 */
function calculateVerificationScore(sources: AgentEventSource[]): number {
  let score = 0;
  
  for (const source of sources) {
    switch (source.kind) {
      case 'ONCHAIN':
        score += 50; // On-chain is highest trust
        break;
      case 'GITHUB':
        score += 30; // GitHub is medium trust
        break;
      case 'X':
        score += 20; // X is lower trust (can be spoofed)
        break;
    }
  }
  
  // Bonus for multiple source types
  const uniqueKinds = new Set(sources.map(s => s.kind)).size;
  if (uniqueKinds >= 3) score += 20;
  else if (uniqueKinds === 2) score += 10;
  
  return Math.min(100, score);
}

/**
 * Determine verification badge from score
 */
function getVerificationBadge(score: number): VerificationBadge {
  if (score >= VERIFICATION_THRESHOLDS.VERIFIED.min) return 'VERIFIED';
  if (score >= VERIFICATION_THRESHOLDS.CHECKED.min) return 'CHECKED';
  return 'RAW';
}

/**
 * Calculate impact scores based on event type and sources
 */
function calculateImpact(
  type: AgentEventType,
  sources: AgentEventSource[]
): { market: number; narrative: number; tech: number } {
  // Base scores by event type
  const baseScores: Record<AgentEventType, { market: number; narrative: number; tech: number }> = {
    'AGENT_CREATED': { market: 60, narrative: 70, tech: 80 },
    'AGENT_UPDATED': { market: 40, narrative: 50, tech: 60 },
    'AGENT_SIGNAL': { market: 50, narrative: 75, tech: 40 },
    'AGENT_STAKED': { market: 70, narrative: 60, tech: 50 },
    'AGENT_SLASHED': { market: 80, narrative: 85, tech: 40 },
    'AGENT_BOOSTED': { market: 65, narrative: 55, tech: 45 },
    'AGENT_PROMOTED': { market: 75, narrative: 80, tech: 50 },
  };
  
  const base = baseScores[type] || { market: 50, narrative: 50, tech: 50 };
  
  // Adjust based on primary source
  const primarySource = sources[0]?.kind || 'X';
  const weights = IMPACT_WEIGHTS[primarySource];
  
  return {
    market: Math.round(base.market * (0.7 + weights.market * 0.3)),
    narrative: Math.round(base.narrative * (0.7 + weights.narrative * 0.3)),
    tech: Math.round(base.tech * (0.7 + weights.tech * 0.3)),
  };
}

/**
 * Map on-chain signal type to AgentEventType
 */
function mapOnChainType(type: OnChainSignalType): AgentEventType {
  const mapping: Record<OnChainSignalType, AgentEventType> = {
    'AgentDeployed': 'AGENT_CREATED',
    'ValidatorStaked': 'AGENT_STAKED',
    'ValidatorUnstaked': 'AGENT_STAKED',
    'Slashed': 'AGENT_SLASHED',
    'CollusionDetected': 'AGENT_SLASHED',
    'BoostEvent': 'AGENT_BOOSTED',
    'GovernanceChange': 'AGENT_PROMOTED',
  };
  return mapping[type] || 'AGENT_SIGNAL';
}

// ============================================
// NORMALIZER FUNCTIONS
// ============================================

/**
 * Normalize a GitHub signal to AgentEvent
 */
export function normalizeGitHubSignal(signal: GitHubSignal): AgentEvent {
  const sources: AgentEventSource[] = [{
    kind: 'GITHUB',
    ref: `${signal.repo}@${signal.metadata?.version || 'main'}`,
    url: signal.url,
  }];
  
  const verificationScore = calculateVerificationScore(sources);
  
  let eventType: AgentEventType;
  let title: string;
  
  switch (signal.type) {
    case 'RepoCreated':
      eventType = 'AGENT_CREATED';
      title = `New Agent Repo: ${signal.repo}`;
      break;
    case 'ReleasePublished':
      eventType = 'AGENT_UPDATED';
      title = `${signal.repo} v${signal.metadata?.version} Released`;
      break;
    case 'MajorCommit':
      eventType = 'AGENT_UPDATED';
      title = `${signal.repo}: Major Update`;
      break;
    default:
      eventType = 'AGENT_UPDATED';
      title = `${signal.repo} Update`;
  }
  
  const event: AgentEvent = {
    id: generateEventId('GITHUB', signal.id, signal.timestamp),
    type: eventType,
    title,
    timestamp: signal.timestamp,
    channel: 'AGENTS',
    status: 'VERIFIED',
    verification: {
      score: verificationScore,
      badge: getVerificationBadge(verificationScore),
      sources,
    },
    impact: calculateImpact(eventType, sources),
    entities: {
      agent: signal.owner,
      githubRepo: `${signal.owner}/${signal.repo}`,
    },
    metadata: {
      description: signal.description,
      tags: signal.metadata?.language ? [signal.metadata.language] : undefined,
    },
  };
  
  return event;
}

/**
 * Normalize an X/Twitter signal to AgentEvent
 */
export function normalizeXSignal(signal: XSignal): AgentEvent {
  const sources: AgentEventSource[] = [{
    kind: 'X',
    ref: signal.tweetId,
    url: signal.url,
  }];
  
  const verificationScore = calculateVerificationScore(sources);
  
  // Detect event type from content
  const content = signal.content.toLowerCase();
  let eventType: AgentEventType = 'AGENT_SIGNAL';
  
  if (content.includes('deploy') || content.includes('live') || content.includes('launched')) {
    eventType = 'AGENT_CREATED';
  } else if (content.includes('update') || content.includes('release') || content.includes('v0.') || content.includes('v1.')) {
    eventType = 'AGENT_UPDATED';
  } else if (content.includes('stake') || content.includes('validating')) {
    eventType = 'AGENT_STAKED';
  } else if (content.includes('boost')) {
    eventType = 'AGENT_BOOSTED';
  }
  
  // Truncate title if too long
  const maxTitleLength = 80;
  const title = signal.content.length > maxTitleLength 
    ? signal.content.slice(0, maxTitleLength) + '...'
    : signal.content;
  
  const event: AgentEvent = {
    id: generateEventId('X', signal.tweetId, signal.timestamp),
    type: eventType,
    title,
    timestamp: signal.timestamp,
    channel: 'AGENTS',
    status: 'PENDING', // X signals start as pending
    verification: {
      score: verificationScore,
      badge: getVerificationBadge(verificationScore),
      sources,
    },
    impact: calculateImpact(eventType, sources),
    entities: {
      agent: signal.authorName,
      xHandle: signal.authorHandle,
    },
    metadata: {
      description: signal.content,
      tags: signal.metadata?.hashtags,
    },
  };
  
  return event;
}

/**
 * Normalize an on-chain signal to AgentEvent
 */
export function normalizeOnChainSignal(signal: OnChainSignal): AgentEvent {
  const sources: AgentEventSource[] = [{
    kind: 'ONCHAIN',
    ref: signal.txHash,
    url: `https://basescan.org/tx/${signal.txHash}`,
  }];
  
  const verificationScore = calculateVerificationScore(sources);
  const eventType = mapOnChainType(signal.type);
  
  // Generate title based on type
  const titles: Record<OnChainSignalType, string> = {
    'AgentDeployed': `Agent Deployed: ${signal.agentName || 'Unknown'}`,
    'ValidatorStaked': `Validator Staked ${signal.metadata?.stakeAmount || ''} PULSE`,
    'ValidatorUnstaked': `Validator Unstaked`,
    'Slashed': `Agent Slashed: ${signal.metadata?.reason || 'Violation'}`,
    'CollusionDetected': `Collusion Detected & Slashed`,
    'BoostEvent': `Large Boost: ${signal.metadata?.boostAmount || ''} PULSE`,
    'GovernanceChange': `Governance Parameter Updated`,
  };
  
  const event: AgentEvent = {
    id: generateEventId('ONCHAIN', signal.txHash, signal.timestamp),
    type: eventType,
    title: titles[signal.type],
    timestamp: signal.timestamp,
    channel: 'AGENTS',
    status: 'VERIFIED', // On-chain is automatically verified
    verification: {
      score: verificationScore,
      badge: getVerificationBadge(verificationScore),
      sources,
    },
    impact: calculateImpact(eventType, sources),
    entities: {
      agent: signal.agentName || 'Unknown Agent',
      contract: signal.contractAddress,
      chainId: signal.chainId,
    },
    economics: signal.metadata?.stakeAmount ? {
      stakeAmount: signal.metadata.stakeAmount,
    } : signal.metadata?.boostAmount ? {
      boost: parseFloat(signal.metadata.boostAmount),
    } : undefined,
  };
  
  return event;
}

// ============================================
// BATCH NORMALIZATION
// ============================================

export interface NormalizationBatch {
  github: AgentEvent[];
  x: AgentEvent[];
  onchain: AgentEvent[];
  all: AgentEvent[];
}

/**
 * Normalize a batch of signals from all sources
 */
export function normalizeBatch(params: {
  githubSignals?: GitHubSignal[];
  xSignals?: XSignal[];
  onchainSignals?: OnChainSignal[];
}): NormalizationBatch {
  const github = (params.githubSignals || []).map(normalizeGitHubSignal);
  const x = (params.xSignals || []).map(normalizeXSignal);
  const onchain = (params.onchainSignals || []).map(normalizeOnChainSignal);
  
  // Combine and sort by timestamp (newest first)
  const all = [...github, ...x, ...onchain].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return { github, x, onchain, all };
}

// ============================================
// EVENT ENRICHMENT
// ============================================

/**
 * Merge multiple events about the same agent/topic
 */
export function mergeRelatedEvents(events: AgentEvent[]): AgentEvent[] {
  const merged = new Map<string, AgentEvent>();
  
  for (const event of events) {
    const key = `${event.entities.agent}-${event.type}`;
    const existing = merged.get(key);
    
    if (existing) {
      // Merge sources
      const allSources = [...existing.verification.sources, ...event.verification.sources];
      const uniqueSources = allSources.filter(
        (source, index, self) => 
          index === self.findIndex(s => s.kind === source.kind && s.ref === source.ref)
      );
      
      // Recalculate verification
      const newScore = calculateVerificationScore(uniqueSources);
      
      merged.set(key, {
        ...existing,
        verification: {
          score: newScore,
          badge: getVerificationBadge(newScore),
          sources: uniqueSources,
        },
        // Use most recent timestamp
        timestamp: new Date(event.timestamp) > new Date(existing.timestamp) 
          ? event.timestamp 
          : existing.timestamp,
      });
    } else {
      merged.set(key, event);
    }
  }
  
  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Update event status based on challenges/verifications
 */
export function updateEventStatus(
  event: AgentEvent,
  challenges: number,
  verifications: number
): AgentEvent {
  let status: AgentEventStatus = event.status;
  
  if (challenges >= 3) {
    status = 'CHALLENGED';
  } else if (verifications >= 5 && challenges === 0) {
    status = 'VERIFIED';
  } else if (challenges > verifications) {
    status = 'REJECTED';
  }
  
  return {
    ...event,
    status,
  };
}

// ============================================
// FILTERS & QUERIES
// ============================================

export function filterBySource(events: AgentEvent[], source: AgentEventSourceKind): AgentEvent[] {
  return events.filter(e => e.verification.sources.some(s => s.kind === source));
}

export function filterByType(events: AgentEvent[], type: AgentEventType): AgentEvent[] {
  return events.filter(e => e.type === type);
}

export function filterByStatus(events: AgentEvent[], status: AgentEventStatus): AgentEvent[] {
  return events.filter(e => e.status === status);
}

export function filterByBadge(events: AgentEvent[], badge: VerificationBadge): AgentEvent[] {
  return events.filter(e => e.verification.badge === badge);
}

export function getTopByImpact(events: AgentEvent[], limit: number = 10): AgentEvent[] {
  return [...events]
    .sort((a, b) => {
      const impactA = a.impact.market + a.impact.narrative + a.impact.tech;
      const impactB = b.impact.market + b.impact.narrative + b.impact.tech;
      return impactB - impactA;
    })
    .slice(0, limit);
}

export function getRecentlyCreated(events: AgentEvent[], hours: number = 24): AgentEvent[] {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return events.filter(e => new Date(e.timestamp) >= cutoff);
}

export function getUnderDispute(events: AgentEvent[]): AgentEvent[] {
  return events.filter(e => e.status === 'CHALLENGED' || e.status === 'REJECTED');
}

export function getTopValidators(events: AgentEvent[]): AgentEvent[] {
  return events.filter(e => 
    e.type === 'AGENT_PROMOTED' || 
    (e.type === 'AGENT_STAKED' && parseInt(e.economics?.stakeAmount || '0') > 50000)
  );
}

// ============================================
// EXPORTS
// ============================================

export const Normalizer = {
  normalizeGitHubSignal,
  normalizeXSignal,
  normalizeOnChainSignal,
  normalizeBatch,
  mergeRelatedEvents,
  updateEventStatus,
  generateEventId,
  calculateVerificationScore,
  getVerificationBadge,
  filterBySource,
  filterByType,
  filterByStatus,
  filterByBadge,
  getTopByImpact,
  getRecentlyCreated,
  getUnderDispute,
  getTopValidators,
};

export default Normalizer;
