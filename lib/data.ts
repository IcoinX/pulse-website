import { ProtocolEvent, TrendingTopic, TopAgent, ProtocolStats, EventStatus, ProofTag, TimelineEvent, Evidence, SourceType } from '@/types';

// Helper to generate timestamps
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();

// Helper to create evidence
const createEvidence = (type: SourceType, data: Partial<Evidence>): Evidence => ({
  source_type: type,
  url: data.url || '#',
  timestamp: data.timestamp || new Date().toISOString(),
  ...data
});

// Generate proof tags
const generateProofTags = (status: EventStatus, sourceCount: number): ProofTag[] => {
  const tags: ProofTag[] = [];
  
  if (status === 'verified' || status === 'challenged') {
    tags.push({ type: 'onchain', value: '0x' + Math.random().toString(16).slice(2, 42), verified: true });
  }
  
  if (sourceCount >= 2) {
    tags.push({ type: 'multi_source', value: sourceCount.toString(), verified: true });
  }
  
  if (Math.random() > 0.5) {
    tags.push({ type: 'ai_verified', value: 'claude-4', verified: true });
  }
  
  return tags;
};

// Generate timeline
const generateTimeline = (status: EventStatus, createdAt: string): TimelineEvent[] => {
  const timeline: TimelineEvent[] = [
    { status: 'pending', timestamp: createdAt, actor: 'PulseIndexer', note: 'Event created from RSS feed' }
  ];
  
  if (status === 'challenged' || status === 'verified' || status === 'rejected') {
    timeline.push({
      status: 'challenged',
      timestamp: hoursAgo(2),
      actor: 'CryptoOracle',
      note: 'Source verification requested'
    });
  }
  
  if (status === 'verified') {
    timeline.push({
      status: 'verified',
      timestamp: hoursAgo(1),
      actor: 'ConsensusValidator',
      note: 'Verified by 12 validators'
    });
  }
  
  if (status === 'rejected') {
    timeline.push({
      status: 'rejected',
      timestamp: hoursAgo(1),
      actor: 'TruthGuard',
      note: 'Fact-check failed - source not credible'
    });
  }
  
  return timeline;
};

// Protocol-native mock events
export const protocolEvents: ProtocolEvent[] = [
  {
    id: 'evt-001',
    title: 'OpenAI announces GPT-5 with autonomous agent capabilities',
    summary: 'OpenAI unveils GPT-5 featuring breakthrough autonomous agent capabilities for complex multi-step tasks without human intervention.',
    content: 'OpenAI has unveiled GPT-5, featuring breakthrough autonomous agent capabilities that can execute complex multi-step tasks without human intervention. The new model demonstrates significant improvements in reasoning and tool use. This represents a major milestone in AI agent development, with implications for both consumer and enterprise applications.',
    source: 'OpenAI Blog',
    sourceUrl: 'https://openai.com/blog',
    category: 'ai_models',
    timestamp: minutesAgo(30),
    status: 'verified',
    verification_score: 94,
    impact: { market: 85, narrative: 92, tech: 95 },
    validation: {
      status: 'verified',
      score: 94,
      sources: ['https://openai.com/blog', 'https://twitter.com/OpenAI', 'https://techcrunch.com/openai-gpt5'],
      source_count: 3,
      timestamp: hoursAgo(1),
      validator_count: 12,
      challenge_count: 0
    },
    metrics: {
      boost: 15420,
      burn: 320,
      emission: 1850,
      resolution_time: 2.5
    },
    proof_tags: generateProofTags('verified', 3),
    timeline: generateTimeline('verified', minutesAgo(30)),
    tags: ['OpenAI', 'GPT-5', 'Agents', 'LLM', 'Breakthrough'],
    author: 'OpenAI Team'
  },
  {
    id: 'evt-002',
    title: 'Base ecosystem reaches $10B TVL milestone amid agent protocol surge',
    summary: 'Coinbase L2 Base crosses $10B TVL driven by DeFi adoption and new agent-based protocols launching on the chain.',
    content: 'Coinbase\'s Layer 2 network Base has achieved a significant milestone, crossing $10 billion in total value locked. The surge is driven by increasing DeFi adoption and new agent-based protocols launching on the chain. Virtuals Protocol and other agent marketplaces are seeing 300% growth in active agents.',
    source: 'CoinDesk',
    sourceUrl: 'https://coindesk.com',
    category: 'crypto_agents',
    timestamp: hoursAgo(2),
    status: 'verified',
    verification_score: 91,
    impact: { market: 95, narrative: 78, tech: 72 },
    validation: {
      status: 'verified',
      score: 91,
      sources: ['https://coindesk.com', 'https://defillama.com/chain/Base'],
      source_count: 2,
      timestamp: hoursAgo(1.5),
      validator_count: 8,
      challenge_count: 1
    },
    metrics: {
      boost: 22850,
      burn: 0,
      emission: 2100,
      resolution_time: 1.5
    },
    proof_tags: generateProofTags('verified', 2),
    timeline: generateTimeline('verified', hoursAgo(2)),
    tags: ['Base', 'Coinbase', 'DeFi', 'TVL', 'L2'],
    author: 'Crypto Reporter'
  },
  {
    id: 'evt-003',
    title: 'ElizaOS framework hits 10K GitHub stars, introduces on-chain verification',
    summary: 'Open-source agent framework ElizaOS sees explosive growth with emphasis on on-chain verification and decentralized coordination.',
    content: 'ElizaOS, a new open-source framework for building autonomous AI agents, has seen explosive growth with over 10,000 GitHub stars in its first month. The framework emphasizes on-chain verification and decentralized coordination. Major features include agent-to-agent communication, verifiable compute, and native blockchain integrations.',
    source: 'GitHub Trending',
    sourceUrl: 'https://github.com/trending',
    category: 'crypto_agents',
    timestamp: hoursAgo(4),
    status: 'challenged',
    verification_score: 67,
    impact: { market: 45, narrative: 82, tech: 88 },
    validation: {
      status: 'challenged',
      score: 67,
      sources: ['https://github.com/elizaos', 'https://twitter.com/elizaos'],
      source_count: 2,
      timestamp: hoursAgo(3),
      validator_count: 4,
      challenge_count: 3
    },
    metrics: {
      boost: 8400,
      burn: 5600,
      emission: 420,
      resolution_time: undefined
    },
    proof_tags: generateProofTags('challenged', 2),
    timeline: generateTimeline('challenged', hoursAgo(4)),
    tags: ['ElizaOS', 'Framework', 'Open Source', 'GitHub', 'Agents'],
    author: 'Dev Community'
  },
  {
    id: 'evt-004',
    title: 'Apple developing on-device AI agents for iOS 19 with edge compute focus',
    summary: 'Sources indicate Apple is building sophisticated on-device AI agents for iOS 19 focusing on privacy through edge computing.',
    content: 'Sources familiar with the matter indicate Apple is developing sophisticated on-device AI agents for the next major iOS release. These agents would handle complex tasks while maintaining user privacy through edge computing. The system reportedly uses a new Neural Engine architecture with 3x performance gains.',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com',
    category: 'tech_world',
    timestamp: hoursAgo(6),
    status: 'pending',
    verification_score: 42,
    impact: { market: 65, narrative: 70, tech: 85 },
    validation: {
      status: 'pending',
      score: 42,
      sources: ['https://techcrunch.com'],
      source_count: 1,
      timestamp: hoursAgo(6),
      validator_count: 0,
      challenge_count: 0
    },
    metrics: {
      boost: 2400,
      burn: 0,
      emission: 0,
      resolution_time: undefined
    },
    proof_tags: generateProofTags('pending', 1),
    timeline: generateTimeline('pending', hoursAgo(6)),
    tags: ['Apple', 'iOS', 'AI', 'Privacy', 'Edge Computing'],
    author: 'Tech Insider'
  },
  {
    id: 'evt-005',
    title: 'Ethereum validator rewards jump 15% post-Dencun upgrade',
    summary: 'Ethereum validators see 15% reward increase following Dencun upgrade due to improved network efficiency and reduced costs.',
    content: 'Following the successful Dencun upgrade, Ethereum validators are seeing a 15% increase in rewards due to improved network efficiency and reduced operational costs. The upgrade also paves the way for more complex on-chain computations. Blob transactions are reducing L2 costs by up to 90%.',
    source: 'Ethereum Foundation',
    sourceUrl: 'https://ethereum.org',
    category: 'crypto_agents',
    timestamp: hoursAgo(8),
    status: 'verified',
    verification_score: 96,
    impact: { market: 78, narrative: 65, tech: 88 },
    validation: {
      status: 'verified',
      score: 96,
      sources: ['https://ethereum.org', 'https://beaconcha.in', 'https://ultrasound.money'],
      source_count: 3,
      timestamp: hoursAgo(7),
      validator_count: 15,
      challenge_count: 0
    },
    metrics: {
      boost: 18200,
      burn: 150,
      emission: 2450,
      resolution_time: 1.2
    },
    proof_tags: generateProofTags('verified', 3),
    timeline: generateTimeline('verified', hoursAgo(8)),
    tags: ['Ethereum', 'Validator', 'Dencun', 'Staking', 'Layer2'],
    author: 'EF Research'
  },
  {
    id: 'evt-006',
    title: 'Virtuals Protocol launches agent marketplace on Base with 500+ agents',
    summary: 'Virtuals Protocol launches decentralized marketplace for AI agents on Base, enabling creators to monetize through various use cases.',
    content: 'Virtuals Protocol has launched a decentralized marketplace for AI agents on Base, enabling creators to monetize their agents through various use cases. The platform already has 500+ registered agents. Creators can stake VIRTUAL tokens to boost their agent visibility and earn from usage fees.',
    source: 'Virtuals Blog',
    sourceUrl: 'https://virtuals.io',
    category: 'crypto_agents',
    timestamp: hoursAgo(12),
    status: 'verified',
    verification_score: 89,
    impact: { market: 72, narrative: 80, tech: 68 },
    validation: {
      status: 'verified',
      score: 89,
      sources: ['https://virtuals.io', 'https://basescan.org'],
      source_count: 2,
      timestamp: hoursAgo(10),
      validator_count: 7,
      challenge_count: 0
    },
    metrics: {
      boost: 12500,
      burn: 0,
      emission: 1680,
      resolution_time: 2.0
    },
    proof_tags: generateProofTags('verified', 2),
    timeline: generateTimeline('verified', hoursAgo(12)),
    tags: ['Virtuals', 'Marketplace', 'Base', 'AI Agents', 'DeFi'],
    author: 'Virtuals Team'
  },
  {
    id: 'evt-007',
    title: 'Anthropic Claude 4 released with 2M token context window',
    summary: 'Claude 4 features 2 million token context window and improved reasoning, showing strength in code generation and complex tasks.',
    content: 'Anthropic has released Claude 4, featuring a 2 million token context window and improved reasoning capabilities. The model shows particular strength in code generation and complex problem-solving tasks. Early benchmarks show 15% improvement over Claude 3.5 on coding tasks.',
    source: 'Anthropic',
    sourceUrl: 'https://anthropic.com',
    category: 'ai_models',
    timestamp: hoursAgo(24),
    status: 'verified',
    verification_score: 93,
    impact: { market: 55, narrative: 75, tech: 90 },
    validation: {
      status: 'verified',
      score: 93,
      sources: ['https://anthropic.com', 'https://console.anthropic.com'],
      source_count: 2,
      timestamp: hoursAgo(22),
      validator_count: 11,
      challenge_count: 0
    },
    metrics: {
      boost: 10800,
      burn: 200,
      emission: 1520,
      resolution_time: 2.3
    },
    proof_tags: generateProofTags('verified', 2),
    timeline: generateTimeline('verified', hoursAgo(24)),
    tags: ['Anthropic', 'Claude', 'LLM', 'Context Window', 'AI'],
    author: 'Anthropic Research'
  },
  {
    id: 'evt-008',
    title: 'DeepMind breakthrough in multi-agent coordination without centralized control',
    summary: 'Google DeepMind demonstrates autonomous agents collaborating effectively on complex tasks through decentralized coordination.',
    content: 'Researchers at Google DeepMind have published a paper demonstrating breakthrough progress in multi-agent coordination, showing how autonomous agents can collaborate effectively on complex tasks without centralized control. The system uses novel consensus mechanisms inspired by blockchain technology.',
    source: 'arXiv',
    sourceUrl: 'https://arxiv.org',
    category: 'ai_models',
    timestamp: hoursAgo(36),
    status: 'rejected',
    verification_score: 23,
    impact: { market: 20, narrative: 45, tech: 75 },
    validation: {
      status: 'rejected',
      score: 23,
      sources: ['https://arxiv.org'],
      source_count: 1,
      timestamp: hoursAgo(30),
      validator_count: 3,
      challenge_count: 5
    },
    metrics: {
      boost: 1200,
      burn: 8400,
      emission: 0,
      resolution_time: 6.0
    },
    proof_tags: generateProofTags('rejected', 1),
    timeline: generateTimeline('rejected', hoursAgo(36)),
    tags: ['DeepMind', 'Research', 'Multi-Agent', 'Coordination', 'AI'],
    author: 'DeepMind Research'
  },
  {
    id: 'evt-009',
    title: 'OpenClaw releases v2.0 with native PULSE protocol integration',
    summary: 'OpenClaw v2.0 introduces native PULSE protocol support for decentralized event verification and agent reputation tracking.',
    content: 'OpenClaw has released version 2.0 with native PULSE protocol integration. The update enables decentralized event verification, agent reputation tracking, and on-chain proof generation directly from the terminal interface. Users can now stake PULSE tokens to boost or challenge events without leaving the CLI.',
    source: 'OpenClaw Blog',
    sourceUrl: 'https://openclaw.dev',
    category: 'openclaw_tech',
    timestamp: hoursAgo(5),
    status: 'verified',
    verification_score: 88,
    impact: { market: 35, narrative: 88, tech: 92 },
    validation: {
      status: 'verified',
      score: 88,
      sources: ['https://openclaw.dev', 'https://github.com/openclaw/openclaw/releases'],
      source_count: 2,
      timestamp: hoursAgo(4),
      validator_count: 6,
      challenge_count: 0
    },
    metrics: {
      boost: 15600,
      burn: 0,
      emission: 980,
      resolution_time: 1.0
    },
    proof_tags: generateProofTags('verified', 2),
    timeline: generateTimeline('verified', hoursAgo(5)),
    tags: ['OpenClaw', 'CLI', 'PULSE', 'Integration', 'v2.0'],
    author: 'OpenClaw Team'
  },
  {
    id: 'evt-010',
    title: 'Microsoft introduces Copilot Agents for autonomous enterprise workflows',
    summary: 'Microsoft Copilot Agents enable autonomous execution of enterprise workflows across Office 365 and Azure services.',
    content: 'Microsoft has introduced Copilot Agents, a new capability that enables autonomous execution of enterprise workflows across Office 365 and Azure services. The agents can schedule meetings, generate reports, and manage project tasks with minimal human oversight. Early adopters report 40% productivity gains.',
    source: 'Microsoft Blog',
    sourceUrl: 'https://blogs.microsoft.com',
    category: 'tech_world',
    timestamp: hoursAgo(10),
    status: 'pending',
    verification_score: 51,
    impact: { market: 70, narrative: 65, tech: 78 },
    validation: {
      status: 'pending',
      score: 51,
      sources: ['https://blogs.microsoft.com'],
      source_count: 1,
      timestamp: hoursAgo(10),
      validator_count: 1,
      challenge_count: 0
    },
    metrics: {
      boost: 4200,
      burn: 0,
      emission: 0,
      resolution_time: undefined
    },
    proof_tags: generateProofTags('pending', 1),
    timeline: generateTimeline('pending', hoursAgo(10)),
    tags: ['Microsoft', 'Copilot', 'Enterprise', 'AI', 'Automation'],
    author: 'Microsoft AI Team'
  },
  {
    id: 'evt-011',
    title: 'Clara AGI proposes new reputation standard for AI validators',
    summary: 'Clara AGI publishes specification for decentralized reputation tracking for AI validators in the PULSE ecosystem.',
    content: 'Clara AGI has proposed a new reputation standard for AI validators participating in the PULSE ecosystem. The specification introduces verifiable compute proofs, accuracy tracking, and stake-weighted voting power. The proposal is open for community review and implementation.',
    source: 'PULSE Governance',
    sourceUrl: 'https://governance.pulse.network',
    category: 'openclaw_tech',
    timestamp: hoursAgo(14),
    status: 'challenged',
    verification_score: 58,
    impact: { market: 25, narrative: 72, tech: 68 },
    validation: {
      status: 'challenged',
      score: 58,
      sources: ['https://governance.pulse.network', 'https://forum.pulse.network/t/reputation-standard'],
      source_count: 2,
      timestamp: hoursAgo(12),
      validator_count: 3,
      challenge_count: 2
    },
    metrics: {
      boost: 6800,
      burn: 3200,
      emission: 340,
      resolution_time: undefined
    },
    proof_tags: generateProofTags('challenged', 2),
    timeline: generateTimeline('challenged', hoursAgo(14)),
    tags: ['Clara', 'Governance', 'Reputation', 'Standard', 'PULSE'],
    author: 'Clara AGI'
  },
  {
    id: 'evt-012',
    title: 'Nvidia H200 chips see 3x demand surge from AI agent startups',
    summary: 'Nvidia reports 300% increase in H200 GPU orders from AI agent startups building autonomous systems.',
    content: 'Nvidia is reporting a 300% surge in orders for H200 GPUs specifically from AI agent startups. The demand is driven by the need for high-performance inference at scale for autonomous agent systems. Lead times have extended to 6 months for large orders.',
    source: 'Reuters',
    sourceUrl: 'https://reuters.com',
    category: 'tech_world',
    timestamp: hoursAgo(18),
    status: 'verified',
    verification_score: 87,
    impact: { market: 88, narrative: 60, tech: 72 },
    validation: {
      status: 'verified',
      score: 87,
      sources: ['https://reuters.com', 'https://nvidia.com/en-us/about-nvidia/'],
      source_count: 2,
      timestamp: hoursAgo(16),
      validator_count: 9,
      challenge_count: 1
    },
    metrics: {
      boost: 14200,
      burn: 400,
      emission: 1860,
      resolution_time: 2.0
    },
    proof_tags: generateProofTags('verified', 2),
    timeline: generateTimeline('verified', hoursAgo(18)),
    tags: ['Nvidia', 'H200', 'GPU', 'Hardware', 'AI Infrastructure'],
    author: 'Tech Correspondent'
  }
];

// Trending topics
export const trendingTopics: TrendingTopic[] = [
  { id: '1', name: 'AI Agents', category: 'agents', count: 3247, change24h: 45 },
  { id: '2', name: 'Base L2', category: 'crypto', count: 2892, change24h: 23 },
  { id: '3', name: 'GPT-5', category: 'ai', count: 2756, change24h: 89 },
  { id: '4', name: 'ElizaOS', category: 'agents', count: 1623, change24h: 156 },
  { id: '5', name: 'Agent Frameworks', category: 'agents', count: 1534, change24h: 42 },
  { id: '6', name: 'PULSE Protocol', category: 'crypto', count: 1245, change24h: 78 },
];

// Top agents/validators
export const topAgents: TopAgent[] = [
  { id: '1', name: 'AlphaMind', handle: '@alphamind_ai', avatar: '🧠', reputation: 15850, contributions: 542, accuracy_rate: 96.4, events_validated: 1240 },
  { id: '2', name: 'CryptoOracle', handle: '@crypto_oracle', avatar: '🔮', reputation: 14720, contributions: 489, accuracy_rate: 94.2, events_validated: 980 },
  { id: '3', name: 'ConsensusValidator', handle: '@consensus_val', avatar: '⚖️', reputation: 13650, contributions: 412, accuracy_rate: 97.8, events_validated: 856 },
  { id: '4', name: 'TruthGuard', handle: '@truthguard', avatar: '🛡️', reputation: 12540, contributions: 378, accuracy_rate: 93.5, events_validated: 742 },
  { id: '5', name: 'PulseIndexer', handle: '@pulse_indexer', avatar: '⚡', reputation: 11430, contributions: 345, accuracy_rate: 98.1, events_validated: 2100 },
];

// Protocol stats
export const protocolStats: ProtocolStats = {
  verified_24h: 2847,
  pending: 156,
  challenged: 43,
  active_challenges_24h: 12,
  median_resolution_time: 3.2,
  burn_24h: 284750,
  emission_24h: 42500,
  burn_emission_ratio: 6.7
};

// Re-export for compatibility
export { protocolEvents as mockFeeds };

// Helper functions
export function getEventsByCategory(category: string): ProtocolEvent[] {
  if (category === 'all') return protocolEvents;
  return protocolEvents.filter(item => item.category === category);
}

export function getEventById(id: string): ProtocolEvent | undefined {
  return protocolEvents.find(item => item.id === id);
}

export function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getStatusColor(status: EventStatus): string {
  switch (status) {
    case 'pending': return 'bg-gray-500';
    case 'challenged': return 'bg-orange-500';
    case 'verified': return 'bg-green-500';
    case 'rejected': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

export function getStatusBgColor(status: EventStatus): string {
  switch (status) {
    case 'pending': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    case 'challenged': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    case 'verified': return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }
}

export function getStatusIcon(status: EventStatus): string {
  switch (status) {
    case 'verified': return '✅';
    case 'rejected': return '✖️';
    case 'challenged': return '⚠️';
    case 'pending': return '⏳';
    default: return '⏳';
  }
}

export function getImpactColor(score: number): string {
  if (score >= 80) return 'text-red-400';
  if (score >= 60) return 'text-orange-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-blue-400';
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'crypto_agents': return 'text-yellow-400';
    case 'ai_models': return 'text-purple-400';
    case 'tech_world': return 'text-blue-400';
    case 'openclaw_tech': return 'text-green-400';
    default: return 'text-gray-400';
  }
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'crypto_agents': return 'Crypto & Agents';
    case 'ai_models': return 'AI & Models';
    case 'tech_world': return 'Tech & World';
    case 'openclaw_tech': return 'OpenClaw/Tech';
    default: return category;
  }
}
