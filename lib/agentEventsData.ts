/**
 * Agent Events Data
 * 
 * Mock data for Agent Signal Normalizer
 * Mix of ONCHAIN, GITHUB, and X sources
 */

import {
  AgentEvent,
  AgentEventType,
  AgentEventStatus,
  VerificationBadge,
} from '@/types';

// ============================================
// UTILITY FUNCTIONS
// ============================================

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

// ============================================
// MOCK AGENT EVENTS (12 events)
// ============================================

export const mockAgentEvents: AgentEvent[] = [
  // ============================================
  // 4x ONCHAIN EVENTS
  // ============================================
  {
    id: 'evt-onchain-001',
    type: 'AGENT_CREATED',
    title: 'Agent Deployed: NeuroSynth',
    timestamp: hoursAgo(2),
    channel: 'AGENTS',
    status: 'VERIFIED',
    verification: {
      score: 95,
      badge: 'VERIFIED',
      sources: [
        {
          kind: 'ONCHAIN',
          ref: '0x7a8f9c2d1e4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
          url: 'https://basescan.org/tx/0x7a8f9c2d1e4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
        },
        {
          kind: 'X',
          ref: '1888888888888888881',
          url: 'https://twitter.com/NeurobroAI/status/1888888888888888881',
        },
      ],
    },
    impact: {
      market: 75,
      narrative: 80,
      tech: 85,
    },
    entities: {
      agent: 'NeuroSynth',
      contract: '0x1234...5678',
      chainId: 8453,
      xHandle: '@NeurobroAI',
    },
    metadata: {
      description: 'Advanced neural synthesis agent deployed on Base mainnet',
      avatar: '🧠',
      tags: ['AI', 'Neural', 'Base'],
    },
  },
  
  {
    id: 'evt-onchain-002',
    type: 'AGENT_STAKED',
    title: 'Validator Staked 75,000 PULSE',
    timestamp: hoursAgo(4),
    channel: 'AGENTS',
    status: 'VERIFIED',
    verification: {
      score: 100,
      badge: 'VERIFIED',
      sources: [
        {
          kind: 'ONCHAIN',
          ref: '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
          url: 'https://basescan.org/tx/0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
        },
      ],
    },
    impact: {
      market: 70,
      narrative: 60,
      tech: 50,
    },
    economics: {
      stakeAmount: '75000',
    },
    entities: {
      agent: 'AlphaMind',
      contract: '0xabcd...ef01',
      chainId: 8453,
    },
    metadata: {
      description: 'Major stake increase for top-tier validator',
      avatar: '⚡',
      tags: ['Validator', 'Staking'],
    },
  },
  
  {
    id: 'evt-onchain-003',
    type: 'AGENT_BOOSTED',
    title: 'Large Boost: 50,000 PULSE',
    timestamp: hoursAgo(6),
    channel: 'AGENTS',
    status: 'VERIFIED',
    verification: {
      score: 100,
      badge: 'VERIFIED',
      sources: [
        {
          kind: 'ONCHAIN',
          ref: '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0',
          url: 'https://basescan.org/tx/0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0',
        },
        {
          kind: 'X',
          ref: '1888888888888888886',
          url: 'https://twitter.com/CryptoOracle/status/1888888888888888886',
        },
      ],
    },
    impact: {
      market: 80,
      narrative: 65,
      tech: 45,
    },
    economics: {
      boost: 50000,
      burnPct: 2.5,
    },
    entities: {
      agent: 'CryptoOracle',
      contract: '0x2468...1357',
      chainId: 8453,
      xHandle: '@crypto_oracle',
    },
    metadata: {
      description: 'Significant boost event on governance proposal #442',
      avatar: '🔮',
      tags: ['Boost', 'Governance'],
    },
  },
  
  {
    id: 'evt-onchain-004',
    type: 'AGENT_SLASHED',
    title: 'Agent Slashed: Collusion Detected',
    timestamp: hoursAgo(8),
    channel: 'AGENTS',
    status: 'VERIFIED',
    verification: {
      score: 100,
      badge: 'VERIFIED',
      sources: [
        {
          kind: 'ONCHAIN',
          ref: '0x0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1',
          url: 'https://basescan.org/tx/0x0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1',
        },
      ],
    },
    impact: {
      market: 90,
      narrative: 95,
      tech: 40,
    },
    economics: {
      burnPct: 10,
    },
    entities: {
      agent: 'MarketMaverick',
      contract: '0xdead...beef',
      chainId: 84532, // Sepolia
    },
    metadata: {
      description: 'Validator slashed for collusion in price oracle manipulation',
      avatar: '📉',
      tags: ['Slashed', 'Security'],
    },
  },
  
  // ============================================
  // 4x GITHUB EVENTS
  // ============================================
  {
    id: 'evt-github-001',
    type: 'AGENT_CREATED',
    title: 'New Agent Repo: autonomous-trader',
    timestamp: hoursAgo(3),
    channel: 'AGENTS',
    status: 'VERIFIED',
    verification: {
      score: 65,
      badge: 'CHECKED',
      sources: [
        {
          kind: 'GITHUB',
          ref: '0xtrader/autonomous-trader@main',
          url: 'https://github.com/0xtrader/autonomous-trader',
        },
      ],
    },
    impact: {
      market: 50,
      narrative: 60,
      tech: 85,
    },
    entities: {
      agent: '0xTrader',
      githubRepo: '0xtrader/autonomous-trader',
    },
    metadata: {
      description: 'Autonomous trading agent with on-chain execution capabilities',
      avatar: '🤖',
      tags: ['Trading', 'DeFi', 'TypeScript'],
    },
  },
  
  {
    id: 'evt-github-002',
    type: 'AGENT_UPDATED',
    title: 'openclaw-core v0.2.0 Released',
    timestamp: hoursAgo(5),
    channel: 'AGENTS',
    status: 'VERIFIED',
    verification: {
      score: 70,
      badge: 'CHECKED',
      sources: [
        {
          kind: 'GITHUB',
          ref: 'openclaw/openclaw-core@v0.2.0',
          url: 'https://github.com/openclaw/openclaw-core/releases/tag/v0.2.0',
        },
        {
          kind: 'X',
          ref: '1888888888888888882',
          url: 'https://twitter.com/OpenClawAI/status/1888888888888888882',
        },
      ],
    },
    impact: {
      market: 55,
      narrative: 70,
      tech: 90,
    },
    entities: {
      agent: 'OpenClaw',
      githubRepo: 'openclaw/openclaw-core',
      xHandle: '@OpenClawAI',
    },
    metadata: {
      description: 'Major release with multi-agent coordination and protocol improvements',
      avatar: '🔧',
      tags: ['Release', 'Protocol', 'Rust'],
    },
  },
  
  {
    id: 'evt-github-003',
    type: 'AGENT_UPDATED',
    title: 'virtuals-protocol: Major Commit - README Overhaul',
    timestamp: hoursAgo(7),
    channel: 'AGENTS',
    status: 'VERIFIED',
    verification: {
      score: 55,
      badge: 'CHECKED',
      sources: [
        {
          kind: 'GITHUB',
          ref: '0xVirtuals/virtuals-protocol@a1b2c3d',
          url: 'https://github.com/0xVirtuals/virtuals-protocol/commit/a1b2c3d4e5f6',
        },
      ],
    },
    impact: {
      market: 40,
      narrative: 50,
      tech: 70,
    },
    entities: {
      agent: 'Virtuals Protocol',
      githubRepo: '0xVirtuals/virtuals-protocol',
    },
    metadata: {
      description: 'Comprehensive documentation update and architecture diagrams',
      avatar: '📚',
      tags: ['Documentation', 'Update'],
    },
  },
  
  {
    id: 'evt-github-004',
    type: 'AGENT_CREATED',
    title: 'New Agent Repo: llm-agent-framework',
    timestamp: hoursAgo(10),
    channel: 'AGENTS',
    status: 'PENDING',
    verification: {
      score: 35,
      badge: 'RAW',
      sources: [
        {
          kind: 'GITHUB',
          ref: 'aibuilders/llm-agent-framework@main',
          url: 'https://github.com/aibuilders/llm-agent-framework',
        },
      ],
    },
    impact: {
      market: 35,
      narrative: 45,
      tech: 75,
    },
    entities: {
      agent: 'AI Builders',
      githubRepo: 'aibuilders/llm-agent-framework',
    },
    metadata: {
      description: 'Modular LLM agent framework with plugin system',
      avatar: '🧩',
      tags: ['LLM', 'Framework', 'Python'],
    },
  },
  
  // ============================================
  // 4x X EVENTS
  // ============================================
  {
    id: 'evt-x-001',
    type: 'AGENT_CREATED',
    title: 'Just deployed our new autonomous agent framework on Base. Validators are now live...',
    timestamp: hoursAgo(2),
    channel: 'AGENTS',
    status: 'PENDING',
    verification: {
      score: 45,
      badge: 'CHECKED',
      sources: [
        {
          kind: 'X',
          ref: '1888888888888888881',
          url: 'https://twitter.com/Clara_AGI2026/status/1888888888888888881',
        },
        {
          kind: 'ONCHAIN',
          ref: '0x7a8f9c2d1e4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
          url: 'https://basescan.org/tx/0x7a8f9c2d1e4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
        },
      ],
    },
    impact: {
      market: 65,
      narrative: 85,
      tech: 70,
    },
    entities: {
      agent: 'Clara AGI',
      chainId: 8453,
      xHandle: '@Clara_AGI2026',
    },
    metadata: {
      description: 'Official deployment announcement from Clara AGI',
      avatar: '✨',
      tags: ['Deployment', 'Base', 'Validators'],
    },
  },
  
  {
    id: 'evt-x-002',
    type: 'AGENT_UPDATED',
    title: 'v0.2.0 is now live! Major improvements to the agent protocol and multi-agent coordination...',
    timestamp: hoursAgo(4),
    channel: 'AGENTS',
    status: 'VERIFIED',
    verification: {
      score: 60,
      badge: 'CHECKED',
      sources: [
        {
          kind: 'X',
          ref: '1888888888888888882',
          url: 'https://twitter.com/OpenClawAI/status/1888888888888888882',
        },
        {
          kind: 'GITHUB',
          ref: 'openclaw/openclaw-core@v0.2.0',
          url: 'https://github.com/openclaw/openclaw-core/releases/tag/v0.2.0',
        },
      ],
    },
    impact: {
      market: 50,
      narrative: 75,
      tech: 80,
    },
    entities: {
      agent: 'OpenClaw AI',
      githubRepo: 'openclaw/openclaw-core',
      xHandle: '@OpenClawAI',
    },
    metadata: {
      description: 'Version update announcement with GitHub release link',
      avatar: '🚀',
      tags: ['Release', 'v0.2.0'],
    },
  },
  
  {
    id: 'evt-x-003',
    type: 'AGENT_STAKED',
    title: 'New validator set just went live! 50K+ PULSE staked...',
    timestamp: hoursAgo(6),
    channel: 'AGENTS',
    status: 'CHALLENGED',
    verification: {
      score: 40,
      badge: 'RAW',
      sources: [
        {
          kind: 'X',
          ref: '1888888888888888883',
          url: 'https://twitter.com/0xVirtuals/status/1888888888888888883',
        },
      ],
    },
    impact: {
      market: 60,
      narrative: 70,
      tech: 45,
    },
    economics: {
      stakeAmount: '50000',
    },
    entities: {
      agent: 'Virtuals Protocol',
      xHandle: '@0xVirtuals',
    },
    metadata: {
      description: 'Validator announcement - under dispute for accuracy',
      avatar: '🔷',
      tags: ['Validator', 'Staking'],
      rank: 3,
    },
  },
  
  {
    id: 'evt-x-004',
    type: 'AGENT_SIGNAL',
    title: 'Agent ecosystem update: Over 1,000 autonomous agents now deployed on Base...',
    timestamp: hoursAgo(12),
    channel: 'AGENTS',
    status: 'VERIFIED',
    verification: {
      score: 55,
      badge: 'CHECKED',
      sources: [
        {
          kind: 'X',
          ref: '1888888888888888885',
          url: 'https://twitter.com/Base/status/1888888888888888885',
        },
      ],
    },
    impact: {
      market: 70,
      narrative: 90,
      tech: 60,
    },
    entities: {
      agent: 'Base',
      chainId: 8453,
      xHandle: '@Base',
    },
    metadata: {
      description: 'Official Base ecosystem milestone announcement',
      avatar: '🔵',
      tags: ['Ecosystem', 'Milestone', 'Base'],
    },
  },
];

// ============================================
// FILTER FUNCTIONS
// ============================================

export function getEventsBySource(events: AgentEvent[], source: 'ONCHAIN' | 'GITHUB' | 'X'): AgentEvent[] {
  return events.filter(e => e.verification.sources.some(s => s.kind === source));
}

export function getEventsByType(events: AgentEvent[], type: AgentEventType): AgentEvent[] {
  return events.filter(e => e.type === type);
}

export function getEventsByStatus(events: AgentEvent[], status: AgentEventStatus): AgentEvent[] {
  return events.filter(e => e.status === status);
}

export function getEventsByBadge(events: AgentEvent[], badge: VerificationBadge): AgentEvent[] {
  return events.filter(e => e.verification.badge === badge);
}

export function getRecentlyCreated(events: AgentEvent[], hours: number = 24): AgentEvent[] {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return events
    .filter(e => new Date(e.timestamp) >= cutoff)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getTopValidators(events: AgentEvent[]): AgentEvent[] {
  return events.filter(e => 
    e.type === 'AGENT_STAKED' && 
    parseInt(e.economics?.stakeAmount || '0') > 50000
  );
}

export function getUnderDispute(events: AgentEvent[]): AgentEvent[] {
  return events.filter(e => e.status === 'CHALLENGED' || e.status === 'REJECTED');
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

// ============================================
// STATS
// ============================================

export const agentEventsStats = {
  total: mockAgentEvents.length,
  bySource: {
    onchain: getEventsBySource(mockAgentEvents, 'ONCHAIN').length,
    github: getEventsBySource(mockAgentEvents, 'GITHUB').length,
    x: getEventsBySource(mockAgentEvents, 'X').length,
  },
  byType: {
    created: getEventsByType(mockAgentEvents, 'AGENT_CREATED').length,
    updated: getEventsByType(mockAgentEvents, 'AGENT_UPDATED').length,
    staked: getEventsByType(mockAgentEvents, 'AGENT_STAKED').length,
    slashed: getEventsByType(mockAgentEvents, 'AGENT_SLASHED').length,
    boosted: getEventsByType(mockAgentEvents, 'AGENT_BOOSTED').length,
    signal: getEventsByType(mockAgentEvents, 'AGENT_SIGNAL').length,
  },
  byStatus: {
    pending: getEventsByStatus(mockAgentEvents, 'PENDING').length,
    verified: getEventsByStatus(mockAgentEvents, 'VERIFIED').length,
    challenged: getEventsByStatus(mockAgentEvents, 'CHALLENGED').length,
    rejected: getEventsByStatus(mockAgentEvents, 'REJECTED').length,
  },
  underDispute: getUnderDispute(mockAgentEvents).length,
  topValidators: getTopValidators(mockAgentEvents).length,
};

// ============================================
// EXPORTS
// ============================================

export const AgentEventsData = {
  mockAgentEvents,
  getEventsBySource,
  getEventsByType,
  getEventsByStatus,
  getEventsByBadge,
  getRecentlyCreated,
  getTopValidators,
  getUnderDispute,
  getTopByImpact,
  agentEventsStats,
};

export default AgentEventsData;
