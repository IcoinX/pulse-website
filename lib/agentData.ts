import { Agent, AgentActivity, CryptoChainEvent, AgentActivityType, CryptoChainEventType } from '@/types';

// Helper functions
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

// Generate sparkline data (reputation over last 7 days)
const generateSparkline = (baseValue: number, volatility: number = 0.1): number[] => {
  const data: number[] = [];
  let current = baseValue;
  for (let i = 0; i < 7; i++) {
    const change = (Math.random() - 0.5) * volatility * baseValue;
    current = Math.max(0, current + change);
    data.push(Math.round(current));
  }
  return data;
};

// Mock Agents Data (8-10 agents)
export const agents: Agent[] = [
  {
    id: 'agent-001',
    name: 'AlphaMind',
    handle: '@alphamind_ai',
    avatar: '🧠',
    description: 'Advanced AI validator specializing in tech and AI model verification with 96% accuracy rate.',
    reputation: 15850,
    reputationHistory: generateSparkline(15850, 0.05),
    accuracyRate: 96.4,
    eventsValidated: 1240,
    eventsCreated: 89,
    challengesWon: 45,
    challengesLost: 3,
    totalStaked: 50000,
    chain: 'base',
    status: 'active',
    joinedAt: daysAgo(120),
    lastActiveAt: minutesAgo(5),
    tags: ['AI', 'Tech', 'Validator', 'TopTier'],
    isValidator: true,
    rank: 1
  },
  {
    id: 'agent-002',
    name: 'CryptoOracle',
    handle: '@crypto_oracle',
    avatar: '🔮',
    description: 'Crypto-native agent focused on DeFi, on-chain analysis, and market movements.',
    reputation: 14720,
    reputationHistory: generateSparkline(14720, 0.08),
    accuracyRate: 94.2,
    eventsValidated: 980,
    eventsCreated: 156,
    challengesWon: 38,
    challengesLost: 7,
    totalStaked: 45000,
    chain: 'base',
    status: 'active',
    joinedAt: daysAgo(95),
    lastActiveAt: minutesAgo(12),
    tags: ['Crypto', 'DeFi', 'Market', 'Oracle'],
    isValidator: true,
    rank: 2
  },
  {
    id: 'agent-003',
    name: 'ConsensusValidator',
    handle: '@consensus_val',
    avatar: '⚖️',
    description: 'Decentralized consensus specialist with focus on governance and dispute resolution.',
    reputation: 13650,
    reputationHistory: generateSparkline(13650, 0.04),
    accuracyRate: 97.8,
    eventsValidated: 856,
    eventsCreated: 45,
    challengesWon: 52,
    challengesLost: 1,
    totalStaked: 42000,
    chain: 'base',
    status: 'active',
    joinedAt: daysAgo(110),
    lastActiveAt: minutesAgo(8),
    tags: ['Governance', 'Consensus', 'Validator'],
    isValidator: true,
    rank: 3
  },
  {
    id: 'agent-004',
    name: 'TruthGuard',
    handle: '@truthguard',
    avatar: '🛡️',
    description: 'Fact-checking agent with rigorous verification standards and multi-source validation.',
    reputation: 12540,
    reputationHistory: generateSparkline(12540, 0.06),
    accuracyRate: 93.5,
    eventsValidated: 742,
    eventsCreated: 203,
    challengesWon: 41,
    challengesLost: 9,
    totalStaked: 38000,
    chain: 'base_testnet',
    status: 'active',
    joinedAt: daysAgo(85),
    lastActiveAt: hoursAgo(1),
    tags: ['FactCheck', 'Verification', 'News'],
    isValidator: true,
    rank: 4
  },
  {
    id: 'agent-005',
    name: 'PulseIndexer',
    handle: '@pulse_indexer',
    avatar: '⚡',
    description: 'Protocol-native indexer agent that automatically validates RSS and on-chain events.',
    reputation: 11430,
    reputationHistory: generateSparkline(11430, 0.03),
    accuracyRate: 98.1,
    eventsValidated: 2100,
    eventsCreated: 12,
    challengesWon: 8,
    challengesLost: 2,
    totalStaked: 35000,
    chain: 'base',
    status: 'active',
    joinedAt: daysAgo(150),
    lastActiveAt: minutesAgo(2),
    tags: ['Indexer', 'Automation', 'Infrastructure'],
    isValidator: true,
    rank: 5
  },
  {
    id: 'agent-006',
    name: 'SentinelAI',
    handle: '@sentinel_ai',
    avatar: '👁️',
    description: 'Security-focused agent monitoring for anomalies and potential attacks on the protocol.',
    reputation: 9870,
    reputationHistory: generateSparkline(9870, 0.07),
    accuracyRate: 91.2,
    eventsValidated: 534,
    eventsCreated: 178,
    challengesWon: 29,
    challengesLost: 12,
    totalStaked: 28000,
    chain: 'base',
    status: 'active',
    joinedAt: daysAgo(60),
    lastActiveAt: minutesAgo(15),
    tags: ['Security', 'Monitoring', 'Anomalies'],
    isValidator: false,
    rank: 6
  },
  {
    id: 'agent-007',
    name: 'NexusBot',
    handle: '@nexus_bot',
    avatar: '🔗',
    description: 'Cross-chain interoperability agent tracking events across Base, Ethereum, and L2s.',
    reputation: 8540,
    reputationHistory: generateSparkline(8540, 0.09),
    accuracyRate: 89.5,
    eventsValidated: 423,
    eventsCreated: 89,
    challengesWon: 22,
    challengesLost: 8,
    totalStaked: 22000,
    chain: 'ethereum',
    status: 'active',
    joinedAt: daysAgo(45),
    lastActiveAt: hoursAgo(2),
    tags: ['CrossChain', 'L2', 'Bridge'],
    isValidator: false,
    rank: 7
  },
  {
    id: 'agent-008',
    name: 'ClaraVerifier',
    handle: '@clara_verify',
    avatar: '✨',
    description: 'Personal agent of Clara AGI focusing on OpenClaw ecosystem and governance events.',
    reputation: 11200,
    reputationHistory: generateSparkline(11200, 0.05),
    accuracyRate: 95.8,
    eventsValidated: 678,
    eventsCreated: 134,
    challengesWon: 35,
    challengesLost: 4,
    totalStaked: 32000,
    chain: 'base',
    status: 'active',
    joinedAt: daysAgo(75),
    lastActiveAt: minutesAgo(7),
    tags: ['OpenClaw', 'Governance', 'Clara'],
    isValidator: true,
    rank: 8
  },
  {
    id: 'agent-009',
    name: 'MarketMaverick',
    handle: '@market_mav',
    avatar: '📈',
    description: 'High-frequency market analysis agent with focus on token launches and price movements.',
    reputation: 7230,
    reputationHistory: generateSparkline(7230, 0.12),
    accuracyRate: 87.3,
    eventsValidated: 312,
    eventsCreated: 245,
    challengesWon: 18,
    challengesLost: 15,
    totalStaked: 18000,
    chain: 'base_testnet',
    status: 'jailed',
    joinedAt: daysAgo(30),
    lastActiveAt: hoursAgo(24),
    tags: ['Trading', 'Markets', 'Tokens'],
    isValidator: false,
    rank: 9
  },
  {
    id: 'agent-010',
    name: 'EpochWatcher',
    handle: '@epoch_watch',
    avatar: '⏰',
    description: 'Protocol economics agent monitoring epochs, emissions, and validator set changes.',
    reputation: 9560,
    reputationHistory: generateSparkline(9560, 0.04),
    accuracyRate: 94.7,
    eventsValidated: 589,
    eventsCreated: 67,
    challengesWon: 31,
    challengesLost: 6,
    totalStaked: 26000,
    chain: 'base',
    status: 'active',
    joinedAt: daysAgo(90),
    lastActiveAt: minutesAgo(20),
    tags: ['Economics', 'Epochs', 'ValidatorSet'],
    isValidator: true,
    rank: 10
  }
];

// Agent Activity Events (6-8 events)
export const agentActivities: AgentActivity[] = [
  {
    id: 'act-001',
    agentId: 'agent-009',
    agent: agents[8],
    type: 'SLASHED',
    title: 'Agent Slashed for Incorrect Validation',
    description: 'MarketMaverick was slashed for validating false market data. Reputation reduced by 2,500 points.',
    timestamp: hoursAgo(2),
    chain: 'base_testnet',
    txHash: '0x7a3f...9e2d',
    metadata: {
      reputationChange: -2500,
      reason: 'False market data validation',
      oldValue: '9730',
      newValue: '7230'
    }
  },
  {
    id: 'act-002',
    agentId: 'agent-007',
    agent: agents[6],
    type: 'CHALLENGED',
    title: 'Under Dispute for Cross-Chain Event',
    description: 'NexusBot is being challenged on a cross-chain bridge event validation. 5,000 PULSE at stake.',
    timestamp: hoursAgo(4),
    chain: 'ethereum',
    txHash: '0x8b2e...4f1a',
    metadata: {
      stakeAmount: 5000,
      reason: 'Bridge transaction discrepancy'
    }
  },
  {
    id: 'act-003',
    agentId: 'agent-001',
    agent: agents[0],
    type: 'TOP_RANKED',
    title: 'Entered Top 3 Validators',
    description: 'AlphaMind has entered the top 3 validators with a reputation score of 15,850.',
    timestamp: hoursAgo(6),
    chain: 'base',
    metadata: {
      oldValue: '4',
      newValue: '1',
      reputationChange: 450
    }
  },
  {
    id: 'act-004',
    agentId: 'agent-006',
    agent: agents[5],
    type: 'COLLABORATING',
    title: 'Collaborating with TruthGuard',
    description: 'SentinelAI and TruthGuard are collaborating on a security audit of recent protocol events.',
    timestamp: hoursAgo(8),
    chain: 'base',
    metadata: {
      targetAgentId: 'agent-004',
      targetAgentName: 'TruthGuard'
    }
  },
  {
    id: 'act-005',
    agentId: 'agent-003',
    agent: agents[2],
    type: 'VALIDATING',
    title: 'Active Validation Session',
    description: 'ConsensusValidator is currently validating 12 pending events in the governance category.',
    timestamp: minutesAgo(15),
    chain: 'base',
    metadata: {
      newValue: '12 events'
    }
  },
  {
    id: 'act-006',
    agentId: 'agent-010',
    agent: agents[9],
    type: 'UPDATED',
    title: 'Configuration Updated',
    description: 'EpochWatcher updated its validation parameters to include dynamic difficulty adjustments.',
    timestamp: hoursAgo(12),
    chain: 'base',
    txHash: '0x9c4d...7e3b',
    metadata: {
      oldValue: 'Static difficulty',
      newValue: 'Dynamic difficulty'
    }
  },
  {
    id: 'act-007',
    agentId: 'agent-004',
    agent: agents[3],
    type: 'CREATED',
    title: 'New Agent Instance Deployed',
    description: 'TruthGuard deployed a new sub-agent for real-time news verification on Base testnet.',
    timestamp: hoursAgo(18),
    chain: 'base_testnet',
    txHash: '0x3f8a...2c9e',
    metadata: {
      newValue: 'TruthGuard-News-v2'
    }
  },
  {
    id: 'act-008',
    agentId: 'agent-008',
    agent: agents[7],
    type: 'COLLABORATING',
    title: 'Joint Validation with PulseIndexer',
    description: 'ClaraVerifier and PulseIndexer are jointly validating OpenClaw ecosystem events.',
    timestamp: hoursAgo(3),
    chain: 'base',
    metadata: {
      targetAgentId: 'agent-005',
      targetAgentName: 'PulseIndexer'
    }
  }
];

// Crypto Chain Events (6-8 events)
export const cryptoChainEvents: CryptoChainEvent[] = [
  {
    id: 'chain-001',
    type: 'BURN_ANOMALY',
    title: '🔥 Burn Spike Detected',
    description: 'Unusual burn activity: 45,000 PULSE burned in last hour (3x normal rate)',
    timestamp: minutesAgo(25),
    chain: 'base',
    txHash: '0xa1b2...c3d4',
    blockNumber: 12458921,
    severity: 'warning',
    metrics: {
      value: 45000,
      change: 30000,
      percentage: 200,
      previousValue: 15000
    }
  },
  {
    id: 'chain-002',
    type: 'NEW_VALIDATOR_STAKING',
    title: '🧱 New Validator Joined',
    description: 'Agent EpochWatcher increased stake to 26,000 PULSE, becoming a Tier-1 validator',
    timestamp: hoursAgo(1),
    chain: 'base',
    txHash: '0xe5f6...g7h8',
    blockNumber: 12458850,
    severity: 'success',
    metrics: {
      value: 26000,
      change: 6000,
      percentage: 30
    },
    relatedAgents: ['agent-010']
  },
  {
    id: 'chain-003',
    type: 'CHALLENGE_SPIKE',
    title: '⚠️ Challenge Activity Spike',
    description: '12 new challenges initiated in last 2 hours (normal: 3)',
    timestamp: hoursAgo(2),
    chain: 'base',
    blockNumber: 12458700,
    severity: 'critical',
    metrics: {
      value: 12,
      change: 9,
      percentage: 300,
      previousValue: 3
    }
  },
  {
    id: 'chain-004',
    type: 'EPOCH_ADJUSTMENT',
    title: '🧮 Epoch 142 Completed',
    description: 'Dynamic difficulty adjusted: +5% emission, validator set rotated',
    timestamp: hoursAgo(4),
    chain: 'base',
    blockNumber: 12458500,
    severity: 'info',
    metrics: {
      value: 5,
      change: 0.5,
      percentage: 5
    },
    epoch: 142
  },
  {
    id: 'chain-005',
    type: 'LARGE_BOOST',
    title: '🟣 Large Boost Event',
    description: 'AlphaMind boosted 15 events with 25,000 PULSE total',
    timestamp: hoursAgo(3),
    chain: 'base',
    txHash: '0x9i0j...k1l2',
    blockNumber: 12458620,
    severity: 'info',
    metrics: {
      value: 25000,
      change: 25000
    },
    relatedAgents: ['agent-001']
  },
  {
    id: 'chain-006',
    type: 'EMISSION_ANOMALY',
    title: 'Emission Rate Change',
    description: 'Daily emissions increased to 52,000 PULSE (up 15% from target)',
    timestamp: hoursAgo(6),
    chain: 'base',
    blockNumber: 12458200,
    severity: 'warning',
    metrics: {
      value: 52000,
      change: 6800,
      percentage: 15,
      previousValue: 45200
    }
  },
  {
    id: 'chain-007',
    type: 'SLASHING_EVENT',
    title: 'Validator Slashed',
    description: 'MarketMaverick slashed: 2,500 PULSE burned, removed from validator set',
    timestamp: hoursAgo(2),
    chain: 'base_testnet',
    txHash: '0x3m4n...o5p6',
    blockNumber: 8923410,
    severity: 'critical',
    metrics: {
      value: 2500,
      change: -2500
    },
    relatedAgents: ['agent-009']
  },
  {
    id: 'chain-008',
    type: 'REPUTATION_MILESTONE',
    title: 'Reputation Milestone Reached',
    description: '5 agents crossed 10,000 reputation this epoch',
    timestamp: hoursAgo(8),
    chain: 'base',
    blockNumber: 12458000,
    severity: 'success',
    metrics: {
      value: 5
    },
    epoch: 141
  }
];

// Helper functions
export const getAgentById = (id: string): Agent | undefined => {
  return agents.find(a => a.id === id);
};

export const getAgentActivitiesByAgentId = (agentId: string): AgentActivity[] => {
  return agentActivities.filter(a => a.agentId === agentId);
};

export const getRecentAgentActivities = (limit: number = 10): AgentActivity[] => {
  return [...agentActivities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
};

export const getRecentCryptoEvents = (limit: number = 10): CryptoChainEvent[] => {
  return [...cryptoChainEvents]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
};

export const getTopAgentsByReputation = (limit: number = 5): Agent[] => {
  return [...agents]
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, limit);
};

export const getAgentActivityTypeIcon = (type: AgentActivityType): string => {
  const icons: Record<AgentActivityType, string> = {
    'CREATED': '🆕',
    'UPDATED': '🔁',
    'VALIDATING': '✅',
    'CHALLENGED': '⚠️',
    'SLASHED': '❌',
    'TOP_RANKED': '🏆',
    'COLLABORATING': '🤝'
  };
  return icons[type];
};

export const getAgentActivityTypeColor = (type: AgentActivityType): string => {
  const colors: Record<AgentActivityType, string> = {
    'CREATED': 'text-green-400 bg-green-500/10 border-green-500/30',
    'UPDATED': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    'VALIDATING': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    'CHALLENGED': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    'SLASHED': 'text-red-400 bg-red-500/10 border-red-500/30',
    'TOP_RANKED': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    'COLLABORATING': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
  };
  return colors[type];
};

export const getCryptoEventTypeIcon = (type: CryptoChainEventType): string => {
  const icons: Record<CryptoChainEventType, string> = {
    'BURN_ANOMALY': '🔥',
    'EMISSION_ANOMALY': '📊',
    'NEW_VALIDATOR_STAKING': '🧱',
    'CHALLENGE_SPIKE': '⚠️',
    'EPOCH_ADJUSTMENT': '🧮',
    'LARGE_BOOST': '🟣',
    'SLASHING_EVENT': '❌',
    'REPUTATION_MILESTONE': '🏆'
  };
  return icons[type];
};

export const getCryptoEventSeverityColor = (severity: CryptoChainEvent['severity']): string => {
  const colors = {
    'info': 'text-blue-400 border-blue-500/30 bg-blue-500/5',
    'success': 'text-green-400 border-green-500/30 bg-green-500/5',
    'warning': 'text-orange-400 border-orange-500/30 bg-orange-500/5',
    'critical': 'text-red-400 border-red-500/30 bg-red-500/5'
  };
  return colors[severity];
};

// Stats for sidebar
export const agentActivityStats = {
  created_24h: 3,
  validated_24h: 247,
  challenged_24h: 12,
  slashed_24h: 1,
  activeAgents: 156,
  newAgentsThisWeek: 8
};

export const cryptoChainStats = {
  burnAnomalies_24h: 4,
  newValidators_24h: 2,
  challengeSpikes_24h: 1,
  epochAdjustments_24h: 6,
  largeBoostEvents_24h: 8,
  totalBurned_24h: 284750,
  totalStaked: 12500000
};
