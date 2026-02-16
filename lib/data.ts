import { ProtocolEvent, TrendingTopic, TopAgent, ProtocolStats, EventStatus, ProofTag, TimelineEvent, Evidence, SourceType, VerificationStatus } from '@/types';

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
  return tags;
};

// Generate timeline
const generateTimeline = (status: EventStatus, createdAt: string): TimelineEvent[] => {
  const timeline: TimelineEvent[] = [
    { status: 'pending', timestamp: createdAt, actor: 'PulseIndexer', note: 'Event indexed' }
  ];
  if (status === 'verified') {
    timeline.push({ status: 'verified', timestamp: hoursAgo(1), actor: 'ConsensusValidator', note: 'Verified by validators' });
  }
  return timeline;
};

// Combined protocol events with realistic evidence
export const protocolEvents: ProtocolEvent[] = [
  // 4 ONCHAIN Events
  {
    id: 'evt-onchain-001',
    title: 'Agent Deployed: NexusValidator v2.1 on Base Sepolia',
    summary: 'New autonomous validator agent deployed to Base Sepolia testnet with 5000 GENESIS stake.',
    content: 'NexusValidator v2.1 has been successfully deployed to Base Sepolia testnet. The agent is now validating transactions with an initial stake of 5000 GENESIS tokens. Contract verified on BaseScan.',
    source: 'Base Sepolia',
    sourceUrl: 'https://sepolia.basescan.org/tx/0x591e8a9b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    category: 'crypto_agents',
    timestamp: hoursAgo(2),
    status: 'verified',
    verification_score: 96,
    impact: { market: 75, narrative: 60, tech: 85 },
    validation: {
      status: 'verified',
      score: 96,
      sources: ['https://sepolia.basescan.org'],
      source_count: 1,
      timestamp: hoursAgo(1.5),
      validator_count: 15,
      challenge_count: 0
    },
    metrics: { boost: 5200, burn: 0, emission: 850, resolution_time: 1.2 },
    proof_tags: generateProofTags('verified', 1),
    timeline: generateTimeline('verified', hoursAgo(2)),
    tags: ['Base', 'Agent', 'Validator', 'Genesis', 'Staking'],
    author: 'Nexus Team',
    source_type: 'ONCHAIN',
    evidence: [
      createEvidence('ONCHAIN', {
        chain: 'Base Sepolia',
        block_number: 37722000,
        tx_hash: '0x591e8a9b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
        contract: '0x1234567890abcdef1234567890abcdef12345678',
        url: 'https://sepolia.basescan.org/tx/0x591e8a9b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
        timestamp: hoursAgo(2)
      })
    ],
    verificationStatus: 'UNVERIFIED',
    verificationReason: 'On-chain event - awaiting cross-source confirmation'
  },
  {
    id: 'evt-onchain-002',
    title: 'Validator Staked: 5000 GENESIS locked for 90 days',
    summary: 'Major validator commits 5000 GENESIS tokens with 90-day lock period.',
    content: 'A major validator has committed 5000 GENESIS tokens with a 90-day lock period, signaling long-term protocol confidence.',
    source: 'PULSE Protocol',
    sourceUrl: 'https://sepolia.basescan.org/tx/0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
    category: 'crypto_agents',
    timestamp: hoursAgo(5),
    status: 'verified',
    verification_score: 98,
    impact: { market: 82, narrative: 70, tech: 60 },
    validation: {
      status: 'verified',
      score: 98,
      sources: ['https://sepolia.basescan.org'],
      source_count: 1,
      timestamp: hoursAgo(4.5),
      validator_count: 18,
      challenge_count: 0
    },
    metrics: { boost: 8900, burn: 0, emission: 1200, resolution_time: 0.8 },
    proof_tags: generateProofTags('verified', 1),
    timeline: generateTimeline('verified', hoursAgo(5)),
    tags: ['Staking', 'GENESIS', 'Validator', 'Lock'],
    author: 'Validator Network',
    source_type: 'ONCHAIN',
    evidence: [
      createEvidence('ONCHAIN', {
        chain: 'Base Sepolia',
        block_number: 37721500,
        tx_hash: '0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
        contract: '0xabcdef1234567890abcdef1234567890abcdef12',
        url: 'https://sepolia.basescan.org/tx/0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
        timestamp: hoursAgo(5)
      })
    ],
    verificationStatus: 'UNVERIFIED',
    verificationReason: 'On-chain event - awaiting cross-source confirmation'
  },
  {
    id: 'evt-onchain-003',
    title: 'Boost Event: 120 GENESIS burned to boost agent reputation',
    summary: 'Agent operator burns 120 GENESIS tokens to boost their agent\'s reputation score.',
    content: 'An agent operator has burned 120 GENESIS tokens to increase their agent\'s reputation score in the protocol.',
    source: 'PULSE Protocol',
    sourceUrl: 'https://sepolia.basescan.org/tx/0xcafebabe9876543210fedcba9876543210fedcba9876543210fedcba98765432',
    category: 'crypto_agents',
    timestamp: hoursAgo(8),
    status: 'challenged',
    verification_score: 94,
    impact: { market: 65, narrative: 55, tech: 45 },
    validation: {
      status: 'challenged',
      score: 94,
      sources: ['https://sepolia.basescan.org'],
      source_count: 1,
      timestamp: hoursAgo(7.5),
      validator_count: 12,
      challenge_count: 2
    },
    metrics: { boost: 12400, burn: 120, emission: 0, resolution_time: 0.5 },
    proof_tags: generateProofTags('challenged', 1),
    timeline: generateTimeline('challenged', hoursAgo(8)),
    tags: ['Boost', 'Burn', 'GENESIS', 'Reputation'],
    author: 'Agent Operator',
    source_type: 'ONCHAIN',
    evidence: [
      createEvidence('ONCHAIN', {
        chain: 'Base Sepolia',
        block_number: 37721000,
        tx_hash: '0xcafebabe9876543210fedcba9876543210fedcba9876543210fedcba98765432',
        contract: '0xfedcba9876543210fedcba9876543210fedcba98',
        url: 'https://sepolia.basescan.org/tx/0xcafebabe9876543210fedcba9876543210fedcba9876543210fedcba98765432',
        timestamp: hoursAgo(8)
      })
    ],
    verificationStatus: 'CHALLENGED',
    verificationReason: 'Unusual burn pattern flagged for review'
  },
  {
    id: 'evt-onchain-004',
    title: 'Collusion Detected: Validator slashed for malicious activity',
    summary: 'Validator slashed after consensus detected collusion. 2000 GENESIS seized and burned.',
    content: 'A validator has been slashed after collusion was detected. 2000 GENESIS tokens seized and burned.',
    source: 'PULSE Governance',
    sourceUrl: 'https://sepolia.basescan.org/tx/0xbaddc0de112233445566778899aabbccddeeff00112233445566778899aabbccdd',
    category: 'crypto_agents',
    timestamp: hoursAgo(12),
    status: 'challenged',
    verification_score: 89,
    impact: { market: 90, narrative: 95, tech: 70 },
    validation: {
      status: 'challenged',
      score: 89,
      sources: ['https://sepolia.basescan.org'],
      source_count: 1,
      timestamp: hoursAgo(10),
      validator_count: 8,
      challenge_count: 3
    },
    metrics: { boost: 3200, burn: 2000, emission: 0, resolution_time: 4.5 },
    proof_tags: generateProofTags('challenged', 1),
    timeline: generateTimeline('challenged', hoursAgo(12)),
    tags: ['Slashing', 'Security', 'Governance', 'Collusion'],
    author: 'Governance Council',
    source_type: 'ONCHAIN',
    evidence: [
      createEvidence('ONCHAIN', {
        chain: 'Base Sepolia',
        block_number: 37720500,
        tx_hash: '0xbaddc0de112233445566778899aabbccddeeff00112233445566778899aabbccdd',
        contract: '0x112233445566778899aabbccddeeff0011223344',
        url: 'https://sepolia.basescan.org/tx/0xbaddc0de112233445566778899aabbccddeeff00112233445566778899aabbccdd',
        timestamp: hoursAgo(12)
      })
    ],
    verificationStatus: 'CHALLENGED',
    verificationReason: 'Governance dispute - evidence under review'
  },
  // 4 GITHUB Events
  {
    id: 'evt-github-001',
    title: 'New Release: clara-ai/agent-pulse v0.2.1',
    summary: 'Clara AI releases agent-pulse v0.2.1 with improved event normalization.',
    content: 'clara-ai/agent-pulse v0.2.1 released with improved event normalization and X API integration.',
    source: 'GitHub',
    sourceUrl: 'https://github.com/clara-ai/agent-pulse/releases/tag/v0.2.1',
    category: 'openclaw_tech',
    timestamp: hoursAgo(3),
    status: 'verified',
    verification_score: 88,
    impact: { market: 40, narrative: 70, tech: 90 },
    validation: {
      status: 'verified',
      score: 88,
      sources: ['https://github.com/clara-ai/agent-pulse'],
      source_count: 1,
      timestamp: hoursAgo(2.5),
      validator_count: 6,
      challenge_count: 0
    },
    metrics: { boost: 4500, burn: 0, emission: 680, resolution_time: 1.0 },
    proof_tags: generateProofTags('verified', 1),
    timeline: generateTimeline('verified', hoursAgo(3)),
    tags: ['GitHub', 'Release', 'Clara', 'OpenClaw'],
    author: 'Clara AI Team',
    source_type: 'GITHUB',
    evidence: [
      createEvidence('GITHUB', {
        repo: 'clara-ai/agent-pulse',
        release_tag: 'v0.2.1',
        url: 'https://github.com/clara-ai/agent-pulse/releases/tag/v0.2.1',
        timestamp: hoursAgo(3)
      })
    ],
    verificationStatus: 'UNVERIFIED',
    verificationReason: 'Single source - awaiting additional confirmation'
  },
  {
    id: 'evt-github-002',
    title: 'New Repository: virtuals-protocol/agent-marketplace',
    summary: 'Virtuals Protocol open-sources their agent marketplace contracts.',
    content: 'Virtuals Protocol has open-sourced their agent marketplace implementation with smart contracts and frontend.',
    source: 'GitHub',
    sourceUrl: 'https://github.com/virtuals-protocol/agent-marketplace',
    category: 'crypto_agents',
    timestamp: hoursAgo(6),
    status: 'verified',
    verification_score: 85,
    impact: { market: 70, narrative: 75, tech: 80 },
    validation: {
      status: 'verified',
      score: 85,
      sources: ['https://github.com/virtuals-protocol/agent-marketplace'],
      source_count: 1,
      timestamp: hoursAgo(5.5),
      validator_count: 5,
      challenge_count: 0
    },
    metrics: { boost: 6200, burn: 0, emission: 920, resolution_time: 1.2 },
    proof_tags: generateProofTags('verified', 1),
    timeline: generateTimeline('verified', hoursAgo(6)),
    tags: ['GitHub', 'Virtuals', 'Open Source', 'Marketplace'],
    author: 'Virtuals Dev Team',
    source_type: 'GITHUB',
    evidence: [
      createEvidence('GITHUB', {
        repo: 'virtuals-protocol/agent-marketplace',
        url: 'https://github.com/virtuals-protocol/agent-marketplace',
        timestamp: hoursAgo(6)
      })
    ],
    verificationStatus: 'UNVERIFIED',
    verificationReason: 'Single source - awaiting additional confirmation'
  },
  {
    id: 'evt-github-003',
    title: 'Major Update: elizaOS/eliza README and documentation',
    summary: 'ElizaOS updates README with comprehensive multi-agent coordination examples.',
    content: 'ElizaOS team pushed major documentation update with multi-agent coordination examples.',
    source: 'GitHub',
    sourceUrl: 'https://github.com/elizaOS/eliza/commit/a1b2c3d',
    category: 'openclaw_tech',
    timestamp: hoursAgo(9),
    status: 'verified',
    verification_score: 82,
    impact: { market: 35, narrative: 60, tech: 85 },
    validation: {
      status: 'verified',
      score: 82,
      sources: ['https://github.com/elizaOS/eliza'],
      source_count: 1,
      timestamp: hoursAgo(8.5),
      validator_count: 4,
      challenge_count: 0
    },
    metrics: { boost: 3100, burn: 0, emission: 450, resolution_time: 1.5 },
    proof_tags: generateProofTags('verified', 1),
    timeline: generateTimeline('verified', hoursAgo(9)),
    tags: ['GitHub', 'ElizaOS', 'Documentation', 'Multi-Agent'],
    author: 'ElizaOS Contributors',
    source_type: 'GITHUB',
    evidence: [
      createEvidence('GITHUB', {
        repo: 'elizaOS/eliza',
        commit_sha: 'a1b2c3d',
        url: 'https://github.com/elizaOS/eliza/commit/a1b2c3d',
        timestamp: hoursAgo(9)
      })
    ],
    verificationStatus: 'UNVERIFIED',
    verificationReason: 'Single source - awaiting additional confirmation'
  },
  {
    id: 'evt-github-004',
    title: 'New Release: openclaw/pulse-protocol v1.0.0-beta',
    summary: 'PULSE Protocol reaches v1.0.0-beta milestone with Base Sepolia support.',
    content: 'PULSE Protocol v1.0.0-beta released with full Base Sepolia testnet support.',
    source: 'GitHub',
    sourceUrl: 'https://github.com/openclaw/pulse-protocol/releases/tag/v1.0.0-beta',
    category: 'openclaw_tech',
    timestamp: hoursAgo(15),
    status: 'verified',
    verification_score: 91,
    impact: { market: 55, narrative: 85, tech: 95 },
    validation: {
      status: 'verified',
      score: 91,
      sources: ['https://github.com/openclaw/pulse-protocol'],
      source_count: 1,
      timestamp: hoursAgo(13),
      validator_count: 8,
      challenge_count: 0
    },
    metrics: { boost: 12800, burn: 0, emission: 1850, resolution_time: 0.8 },
    proof_tags: generateProofTags('verified', 1),
    timeline: generateTimeline('verified', hoursAgo(15)),
    tags: ['GitHub', 'PULSE', 'Release', 'Beta', 'Milestone'],
    author: 'OpenClaw Core Team',
    source_type: 'GITHUB',
    evidence: [
      createEvidence('GITHUB', {
        repo: 'openclaw/pulse-protocol',
        release_tag: 'v1.0.0-beta',
        url: 'https://github.com/openclaw/pulse-protocol/releases/tag/v1.0.0-beta',
        timestamp: hoursAgo(15)
      })
    ],
    verificationStatus: 'UNVERIFIED',
    verificationReason: 'Single source - awaiting additional confirmation'
  },
  // 4 X Events
  {
    id: 'evt-x-001',
    title: '@Clara_AGI2026: "Just deployed our new autonomous agent framework on Base"',
    summary: 'Clara AGI announces deployment of their autonomous agent framework on Base.',
    content: 'Just deployed our new autonomous agent framework on Base. Validators are now live and staking is open! #AIAgents',
    source: 'X/Twitter',
    sourceUrl: 'https://x.com/Clara_AGI2026/status/1888888888888888881',
    category: 'ai_models',
    timestamp: hoursAgo(2),
    status: 'verified',
    verification_score: 87,
    impact: { market: 65, narrative: 85, tech: 80 },
    validation: {
      status: 'verified',
      score: 87,
      sources: ['https://x.com/Clara_AGI2026/status/1888888888888888881'],
      source_count: 1,
      timestamp: hoursAgo(1.5),
      validator_count: 7,
      challenge_count: 0
    },
    metrics: { boost: 7200, burn: 0, emission: 980, resolution_time: 1.0 },
    proof_tags: generateProofTags('verified', 1),
    timeline: generateTimeline('verified', hoursAgo(2)),
    tags: ['Clara', 'Agent', 'Base', 'Deployment'],
    author: '@Clara_AGI2026',
    source_type: 'X',
    evidence: [
      createEvidence('X', {
        author_handle: '@Clara_AGI2026',
        tweet_id: '1888888888888888881',
        url: 'https://x.com/Clara_AGI2026/status/1888888888888888881',
        timestamp: hoursAgo(2)
      })
    ],
    verificationStatus: 'UNVERIFIED',
    verificationReason: 'Social media only - awaiting cross-source confirmation'
  },
  {
    id: 'evt-x-002',
    title: '@virtuals_io: "New validator set just went live! 50K+ PULSE staked"',
    summary: 'Virtuals Protocol announces new validator set with 50K+ PULSE staked.',
    content: 'New validator set just went live! 50K+ PULSE staked. The agent economy is growing faster than ever.',
    source: 'X/Twitter',
    sourceUrl: 'https://x.com/virtuals_io/status/1888888888888888883',
    category: 'crypto_agents',
    timestamp: hoursAgo(5),
    status: 'verified',
    verification_score: 89,
    impact: { market: 85, narrative: 80, tech: 65 },
    validation: {
      status: 'verified',
      score: 89,
      sources: ['https://x.com/virtuals_io/status/1888888888888888883'],
      source_count: 1,
      timestamp: hoursAgo(4.5),
      validator_count: 9,
      challenge_count: 0
    },
    metrics: { boost: 9400, burn: 0, emission: 1250, resolution_time: 0.9 },
    proof_tags: generateProofTags('verified', 1),
    timeline: generateTimeline('verified', hoursAgo(5)),
    tags: ['Virtuals', 'Validator', 'Staking', 'PULSE'],
    author: '@virtuals_io',
    source_type: 'X',
    evidence: [
      createEvidence('X', {
        author_handle: '@virtuals_io',
        tweet_id: '1888888888888888883',
        url: 'https://x.com/virtuals_io/status/1888888888888888883',
        timestamp: hoursAgo(5)
      })
    ],
    verificationStatus: 'UNVERIFIED',
    verificationReason: 'Social media only - awaiting cross-source confirmation'
  },
  {
    id: 'evt-x-003',
    title: '@OpenAI: "GPT-5 agent capabilities announcement"',
    summary: 'OpenAI announces GPT-5 with breakthrough autonomous agent capabilities.',
    content: 'GPT-5 features breakthrough autonomous agent capabilities. Complex multi-step tasks with minimal oversight.',
    source: 'X/Twitter',
    sourceUrl: 'https://x.com/OpenAI/status/1888888888888888888',
    category: 'ai_models',
    timestamp: hoursAgo(7),
    status: 'verified',
    verification_score: 95,
    impact: { market: 95, narrative: 98, tech: 92 },
    validation: {
      status: 'verified',
      score: 95,
      sources: ['https://x.com/OpenAI/status/1888888888888888888'],
      source_count: 1,
      timestamp: hoursAgo(6),
      validator_count: 22,
      challenge_count: 0
    },
    metrics: { boost: 28500, burn: 0, emission: 4200, resolution_time: 0.5 },
    proof_tags: generateProofTags('verified', 1),
    timeline: generateTimeline('verified', hoursAgo(7)),
    tags: ['OpenAI', 'GPT-5', 'LLM', 'Agents'],
    author: '@OpenAI',
    source_type: 'X',
    evidence: [
      createEvidence('X', {
        author_handle: '@OpenAI',
        tweet_id: '1888888888888888888',
        url: 'https://x.com/OpenAI/status/1888888888888888888',
        timestamp: hoursAgo(7)
      })
    ],
    verificationStatus: 'UNVERIFIED',
    verificationReason: 'Social media only - awaiting cross-source confirmation'
  },
  {
    id: 'evt-x-004',
    title: '@Base: "Agent ecosystem update: 1,000+ agents deployed on Base"',
    summary: 'Base celebrates milestone of 1,000+ autonomous agents deployed.',
    content: 'Agent ecosystem update: Over 1,000 autonomous agents now deployed on Base. The future of AI x Crypto is here.',
    source: 'X/Twitter',
    sourceUrl: 'https://x.com/Base/status/1888888888888888885',
    category: 'crypto_agents',
    timestamp: hoursAgo(11),
    status: 'verified',
    verification_score: 92,
    impact: { market: 88, narrative: 90, tech: 75 },
    validation: {
      status: 'verified',
      score: 92,
      sources: ['https://x.com/Base/status/1888888888888888885'],
      source_count: 1,
      timestamp: hoursAgo(10),
      validator_count: 14,
      challenge_count: 0
    },
    metrics: { boost: 11200, burn: 0, emission: 1680, resolution_time: 0.8 },
    proof_tags: generateProofTags('verified', 1),
    timeline: generateTimeline('verified', hoursAgo(11)),
    tags: ['Base', 'Milestone', 'Ecosystem', 'L2'],
    author: '@Base',
    source_type: 'X',
    evidence: [
      createEvidence('X', {
        author_handle: '@Base',
        tweet_id: '1888888888888888885',
        url: 'https://x.com/Base/status/1888888888888888885',
        timestamp: hoursAgo(11)
      })
    ],
    verificationStatus: 'UNVERIFIED',
    verificationReason: 'Social media only - awaiting cross-source confirmation'
  },
  // 3 DEDUP Events (multi-source) - VERIFIED status
  {
    id: 'evt-dedup-001',
    title: 'GPT-5 Released: Major leap in autonomous agent capabilities',
    summary: 'OpenAI releases GPT-5. Confirmed across X, official blog, and tech media.',
    content: 'OpenAI officially released GPT-5 with groundbreaking autonomous agent capabilities. Major milestone in AI agent development.',
    source: 'Multiple Sources',
    sourceUrl: 'https://openai.com/blog/gpt-5',
    category: 'ai_models',
    timestamp: hoursAgo(4),
    status: 'verified',
    verification_score: 98,
    impact: { market: 95, narrative: 98, tech: 96 },
    validation: {
      status: 'verified',
      score: 98,
      sources: ['https://x.com/OpenAI', 'https://openai.com/blog/gpt-5', 'https://techcrunch.com'],
      source_count: 3,
      timestamp: hoursAgo(3),
      validator_count: 25,
      challenge_count: 0
    },
    metrics: { boost: 45200, burn: 0, emission: 6800, resolution_time: 0.5 },
    proof_tags: generateProofTags('verified', 3),
    timeline: generateTimeline('verified', hoursAgo(4)),
    tags: ['OpenAI', 'GPT-5', 'LLM', 'Agents', 'Multi-Source'],
    author: 'OpenAI + Tech Media',
    source_type: 'MEDIA',
    signals_attached: 3,
    evidence: [
      createEvidence('X', {
        author_handle: '@OpenAI',
        tweet_id: '1888888888888888888',
        url: 'https://x.com/OpenAI/status/1888888888888888888',
        timestamp: hoursAgo(4)
      }),
      createEvidence('MEDIA', {
        media_source: 'TechCrunch',
        url: 'https://techcrunch.com/openai-gpt5-release',
        timestamp: hoursAgo(4)
      }),
      createEvidence('MEDIA', {
        media_source: 'OpenAI Blog',
        url: 'https://openai.com/blog/gpt-5',
        timestamp: hoursAgo(4)
      })
    ],
    verificationStatus: 'VERIFIED',
    verificationReason: '3 independent sources + 25 validators confirmed'
  },
  {
    id: 'evt-dedup-002',
    title: 'Clara AI Agent Framework: On-chain + GitHub + X confirmed',
    summary: 'Clara AGI deploys framework with evidence across Base Sepolia, GitHub, and X.',
    content: 'Clara AGI successfully deployed their autonomous agent framework with verifiable deployment across multiple platforms.',
    source: 'Multi-Source Verified',
    sourceUrl: 'https://sepolia.basescan.org/address/0xclaraai',
    category: 'crypto_agents',
    timestamp: hoursAgo(6),
    status: 'verified',
    verification_score: 97,
    impact: { market: 75, narrative: 88, tech: 92 },
    validation: {
      status: 'verified',
      score: 97,
      sources: ['https://sepolia.basescan.org', 'https://github.com/clara-ai', 'https://x.com/Clara_AGI2026'],
      source_count: 3,
      timestamp: hoursAgo(5),
      validator_count: 18,
      challenge_count: 0
    },
    metrics: { boost: 18500, burn: 0, emission: 2450, resolution_time: 0.7 },
    proof_tags: generateProofTags('verified', 3),
    timeline: generateTimeline('verified', hoursAgo(6)),
    tags: ['Clara', 'Deployment', 'Multi-Source', 'Verified'],
    author: 'Clara AGI',
    source_type: 'ONCHAIN',
    signals_attached: 3,
    evidence: [
      createEvidence('ONCHAIN', {
        chain: 'Base Sepolia',
        block_number: 37721800,
        tx_hash: '0xclaraai1234567890abcdef1234567890abcdef',
        contract: '0xclaraai1234567890abcdef',
        url: 'https://sepolia.basescan.org/tx/0xclaraai1234567890abcdef',
        timestamp: hoursAgo(6)
      }),
      createEvidence('GITHUB', {
        repo: 'clara-ai/agent-pulse',
        release_tag: 'v0.2.1',
        url: 'https://github.com/clara-ai/agent-pulse/releases/tag/v0.2.1',
        timestamp: hoursAgo(6)
      }),
      createEvidence('X', {
        author_handle: '@Clara_AGI2026',
        tweet_id: '1888888888888888881',
        url: 'https://x.com/Clara_AGI2026/status/1888888888888888881',
        timestamp: hoursAgo(6)
      })
    ],
    verificationStatus: 'VERIFIED',
    verificationReason: '3 sources confirmed: On-chain + GitHub + X'
  },
  {
    id: 'evt-dedup-003',
    title: 'Virtuals Protocol v2: X announcement + GitHub release + On-chain upgrade',
    summary: 'Virtuals Protocol major upgrade confirmed across X, GitHub, and Base Sepolia.',
    content: 'Virtuals Protocol v2 launched with major improvements. Confirmed by official X account, GitHub release, and on-chain contract upgrade.',
    source: 'Multi-Source Verified',
    sourceUrl: 'https://virtuals.io/upgrade-v2',
    category: 'crypto_agents',
    timestamp: hoursAgo(8),
    status: 'verified',
    verification_score: 96,
    impact: { market: 88, narrative: 85, tech: 90 },
    validation: {
      status: 'verified',
      score: 96,
      sources: ['https://x.com/virtuals_io', 'https://github.com/virtuals-protocol', 'https://sepolia.basescan.org'],
      source_count: 3,
      timestamp: hoursAgo(7),
      validator_count: 20,
      challenge_count: 0
    },
    metrics: { boost: 22400, burn: 0, emission: 3100, resolution_time: 0.6 },
    proof_tags: generateProofTags('verified', 3),
    timeline: generateTimeline('verified', hoursAgo(8)),
    tags: ['Virtuals', 'Upgrade', 'V2', 'Multi-Source'],
    author: 'Virtuals Team',
    source_type: 'ONCHAIN',
    signals_attached: 3,
    evidence: [
      createEvidence('X', {
        author_handle: '@virtuals_io',
        tweet_id: '1888888888888888890',
        url: 'https://x.com/virtuals_io/status/1888888888888888890',
        timestamp: hoursAgo(8)
      }),
      createEvidence('GITHUB', {
        repo: 'virtuals-protocol/agent-marketplace',
        release_tag: 'v2.0.0',
        url: 'https://github.com/virtuals-protocol/agent-marketplace/releases/tag/v2.0.0',
        timestamp: hoursAgo(8)
      }),
      createEvidence('ONCHAIN', {
        chain: 'Base Sepolia',
        block_number: 37721200,
        tx_hash: '0xvirtuals1234567890abcdef1234567890abcdef',
        contract: '0xvirtuals1234567890abcdef',
        url: 'https://sepolia.basescan.org/tx/0xvirtuals1234567890abcdef',
        timestamp: hoursAgo(8)
      })
    ],
    verificationStatus: 'VERIFIED',
    verificationReason: '3 independent sources + 20 validators confirmed'
  }
];

// Trending topics
export const trendingTopics: TrendingTopic[] = [
  { id: '1', name: 'AI Agents', category: 'agents', count: 3247, change24h: 45 },
  { id: '2', name: 'Base L2', category: 'crypto', count: 2892, change24h: 23 },
  { id: '3', name: 'GPT-5', category: 'ai', count: 2756, change24h: 89 },
  { id: '4', name: 'ElizaOS', category: 'agents', count: 1623, change24h: 156 },
  { id: '5', name: 'Multi-Source', category: 'agents', count: 1245, change24h: 78 },
  { id: '6', name: 'PULSE Protocol', category: 'crypto', count: 1245, change24h: 78 }
];

// Top agents/validators
export const topAgents: TopAgent[] = [
  { id: '1', name: 'AlphaMind', handle: '@alphamind_ai', avatar: '🧠', reputation: 15850, contributions: 542, accuracy_rate: 96.4, events_validated: 1240 },
  { id: '2', name: 'CryptoOracle', handle: '@crypto_oracle', avatar: '🔮', reputation: 14720, contributions: 489, accuracy_rate: 94.2, events_validated: 980 },
  { id: '3', name: 'ConsensusValidator', handle: '@consensus_val', avatar: '⚖️', reputation: 13650, contributions: 412, accuracy_rate: 97.8, events_validated: 856 },
  { id: '4', name: 'TruthGuard', handle: '@truthguard', avatar: '🛡️', reputation: 12540, contributions: 378, accuracy_rate: 93.5, events_validated: 742 },
  { id: '5', name: 'PulseIndexer', handle: '@pulse_indexer', avatar: '⚡', reputation: 11430, contributions: 345, accuracy_rate: 98.1, events_validated: 2100 }
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

// Sprint 1.5: Get verification status based on event characteristics
export function getVerificationStatus(event: ProtocolEvent): { status: VerificationStatus; reason: string } {
  // CHALLENGED: Events with challenges or unusual patterns
  if (event.status === 'challenged' || event.validation.challenge_count > 0) {
    return { status: 'CHALLENGED', reason: 'Under dispute - validator review pending' };
  }
  
  // VERIFIED: Events with multiple sources or high verification score
  if (event.validation.source_count >= 3 || event.verification_score >= 90) {
    return { status: 'VERIFIED', reason: `${event.validation.source_count} independent sources + consensus validated` };
  }
  
  if (event.validation.source_count >= 2 && event.verification_score >= 75) {
    return { status: 'VERIFIED', reason: 'Multiple sources + high verification score' };
  }
  
  // UNVERIFIED: Single source or low verification score
  if (event.validation.source_count === 1 && event.verification_score < 75) {
    return { status: 'UNVERIFIED', reason: 'Awaiting cross-source confirmation' };
  }
  
  // Default to VERIFIED for high-scoring events
  if (event.verification_score >= 85) {
    return { status: 'VERIFIED', reason: 'High confidence - protocol verified' };
  }
  
  return { status: 'UNVERIFIED', reason: 'Pending additional validation' };
}

// Sprint 1.5: Get verification status color
export function getVerificationStatusColor(status: VerificationStatus): string {
  switch (status) {
    case 'VERIFIED': return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'CHALLENGED': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    case 'UNVERIFIED': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }
}

// Sprint 1.5: Get verification status icon
export function getVerificationStatusIcon(status: VerificationStatus): string {
  switch (status) {
    case 'VERIFIED': return '✅';
    case 'CHALLENGED': return '⚠️';
    case 'UNVERIFIED': return '⏳';
    default: return '⏳';
  }
}

// Sprint 1.5: Get verification status label
export function getVerificationStatusLabel(status: VerificationStatus): string {
  switch (status) {
    case 'VERIFIED': return 'Verified by protocol';
    case 'CHALLENGED': return 'Under dispute';
    case 'UNVERIFIED': return 'Awaiting verification';
    default: return 'Pending';
  }
}
