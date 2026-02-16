export type EventStatus = 'pending' | 'challenged' | 'verified' | 'rejected';
export type ImpactType = 'market' | 'narrative' | 'tech';
export type Timeframe = '1h' | '6h' | '24h' | '7d' | '30d';
export type SortOption = 'latest' | 'trending' | 'highest_impact' | 'most_contested';
export type Category = 'all' | 'events' | 'agents' | 'crypto' | 'crypto_agents' | 'ai_models' | 'tech_world' | 'openclaw_tech';

// Sprint 1.5: Verification Status for truth rules
export type VerificationStatus = 'VERIFIED' | 'CHALLENGED' | 'UNVERIFIED';

// Feed tab types for new navigation
export type FeedTab = 'all' | 'events' | 'agents' | 'crypto' | 'ai' | 'tech';

// Agent Activity Types
export type AgentActivityType = 
  | 'CREATED' 
  | 'UPDATED' 
  | 'VALIDATING' 
  | 'CHALLENGED' 
  | 'SLASHED' 
  | 'TOP_RANKED' 
  | 'COLLABORATING';

// Crypto Chain Event Types
export type CryptoChainEventType =
  | 'BURN_ANOMALY'
  | 'EMISSION_ANOMALY'
  | 'NEW_VALIDATOR_STAKING'
  | 'CHALLENGE_SPIKE'
  | 'EPOCH_ADJUSTMENT'
  | 'LARGE_BOOST'
  | 'SLASHING_EVENT'
  | 'REPUTATION_MILESTONE';

export interface ImpactScores {
  market: number;      // 0-100
  narrative: number;   // 0-100
  tech: number;        // 0-100
}

export interface Validation {
  status: EventStatus;
  score: number;       // 0-100 verification score
  sources: string[];   // List of source URLs/IDs
  source_count: number;
  timestamp: string;
  validator_count: number;
  challenge_count: number;
}

export interface ProtocolMetrics {
  boost: number;       // PULSE tokens staked for
  burn: number;        // PULSE tokens burned against
  emission: number;    // Rewards distributed
  resolution_time?: number; // Hours to resolution
}

export interface ProofTag {
  type: 'onchain' | 'multi_source' | 'ai_verified' | 'human_verified' | 'oracle';
  value: string;       // e.g., tx hash, source count
  verified: boolean;
}

export interface TimelineEvent {
  status: EventStatus;
  timestamp: string;
  actor?: string;      // Agent/validator that triggered
  note?: string;
}

export interface Annotation {
  id: string;
  type: 'human' | 'agent';
  author: string;
  author_reputation: number;
  content: string;
  timestamp: string;
  votes: number;
}

// Evidence interface for verifiable proof
export interface Evidence {
  source_type: SourceType;
  chain?: string;
  block_number?: number;
  tx_hash?: string;
  contract?: string;
  repo?: string;
  commit_sha?: string;
  release_tag?: string;
  tweet_id?: string;
  author_handle?: string;
  media_source?: string;
  url: string;
  timestamp: string;
}

// Legacy compatibility - FeedItem is now ProtocolEvent
export interface ProtocolEvent {
  id: string;
  title: string;
  content: string;
  summary?: string;
  source: string;
  sourceUrl: string;
  category: Category;
  timestamp: string;
  
  // Protocol-native fields
  status: EventStatus;
  verification_score: number;  // 0-100
  impact: ImpactScores;
  validation: Validation;
  metrics: ProtocolMetrics;
  proof_tags: ProofTag[];
  timeline: TimelineEvent[];
  
  tags: string[];
  author?: string;
  imageUrl?: string;
  
  // Sprint 1: Truthful Feed additions
  source_type: SourceType;
  evidence: Evidence[];
  signals_attached?: number; // for dedup
  
  // Sprint 1.5: Truth rules - Verification Status
  verificationStatus: VerificationStatus;
  verificationReason?: string; // ex: "3 sources + 2 validators"
  
  // Sprint 2.4.1: Assertion data
  assertion?: {
    type: 0 | 1; // 0 = Agent, 1 = Human
    assertionId: number;
    asserter: string;
    stakeAmount: string;
    status: number;
  };
}

// Alias for backward compatibility
export type FeedItem = ProtocolEvent;

export interface TrendingTopic {
  id: string;
  name: string;
  category: string;
  count: number;
  change24h: number;
}

export interface TopAgent {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  reputation: number;
  contributions: number;
  accuracy_rate?: number;
  events_validated?: number;
}

// Enriched Agent interface with activity history
export interface Agent {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  description: string;
  reputation: number;
  reputationHistory: number[]; // Sparkline data (last 7 days)
  accuracyRate: number;
  eventsValidated: number;
  eventsCreated: number;
  challengesWon: number;
  challengesLost: number;
  totalStaked: number;
  chain: 'base' | 'base_testnet' | 'ethereum' | 'sepolia';
  status: 'active' | 'inactive' | 'jailed' | 'pending';
  joinedAt: string;
  lastActiveAt: string;
  tags: string[];
  isValidator: boolean;
  rank?: number;
}

// Agent Activity Event
export interface AgentActivity {
  id: string;
  agentId: string;
  agent: Agent;
  type: AgentActivityType;
  title: string;
  description: string;
  timestamp: string;
  chain: 'base' | 'base_testnet' | 'ethereum' | 'sepolia';
  txHash?: string;
  metadata?: {
    oldValue?: string;
    newValue?: string;
    targetAgentId?: string;
    targetAgentName?: string;
    reputationChange?: number;
    stakeAmount?: number;
    reason?: string;
  };
}

// Crypto On-Chain Event
export interface CryptoChainEvent {
  id: string;
  type: CryptoChainEventType;
  title: string;
  description: string;
  timestamp: string;
  chain: 'base' | 'base_testnet' | 'ethereum' | 'sepolia';
  txHash?: string;
  blockNumber?: number;
  severity: 'info' | 'warning' | 'critical' | 'success';
  metrics: {
    value?: number;
    change?: number;
    percentage?: number;
    previousValue?: number;
  };
  relatedAgents?: string[];
  epoch?: number;
}

export interface ProtocolStats {
  verified_24h: number;
  pending: number;
  challenged: number;
  active_challenges_24h: number;
  median_resolution_time: number; // hours
  burn_24h: number;
  emission_24h: number;
  burn_emission_ratio: number;
}

// Filter state interface
export interface FilterState {
  timeframe: Timeframe;
  status: EventStatus | 'all';
  impact: ImpactType | 'all';
  sort: SortOption;
  searchQuery: string;
}

// ============================================
// AGENT SIGNAL NORMALIZER TYPES
// ============================================

// Standardized Agent Event Types from 3 sources
export type AgentEventType = 
  | 'AGENT_CREATED'      // on-chain: deploy, GitHub: new repo
  | 'AGENT_UPDATED'      // GitHub: release, X: announcement
  | 'AGENT_SIGNAL'       // X: official announcement
  | 'AGENT_STAKED'       // on-chain: validator staked
  | 'AGENT_SLASHED'      // on-chain: slashed/collusion
  | 'AGENT_BOOSTED'      // on-chain: large boost
  | 'AGENT_PROMOTED';    // on-chain: top validator

// Source kinds for Agent Events
export type AgentEventSourceKind = 'ONCHAIN' | 'GITHUB' | 'X' | 'MEDIA';

// Source type for feed cards
export type SourceType = 'ONCHAIN' | 'GITHUB' | 'X' | 'MEDIA';

// Verification badge levels
export type VerificationBadge = 'RAW' | 'CHECKED' | 'VERIFIED';

// Agent Event Status
export type AgentEventStatus = 'PENDING' | 'CHALLENGED' | 'VERIFIED' | 'REJECTED';

// Source reference for Agent Events
export interface AgentEventSource {
  kind: AgentEventSourceKind;
  ref: string;  // txHash, repo@tag, tweetId
  url?: string;
}

// Standardized Agent Event (PULSE format)
export interface AgentEvent {
  id: string;
  type: AgentEventType;
  title: string;
  timestamp: string;
  channel: 'AGENTS';
  status: AgentEventStatus;
  verification: {
    score: number;           // 0-100
    badge: VerificationBadge;
    sources: AgentEventSource[];
  };
  impact: {
    market: number;          // 0-100
    narrative: number;       // 0-100
    tech: number;            // 0-100
  };
  economics?: {
    boost?: number;
    burnPct?: number;
    stakeAmount?: string;
  };
  entities: {
    agent: string;           // Agent name/handle
    contract?: string;       // Contract address
    chainId?: number;        // Chain ID (8453 for Base)
    githubRepo?: string;     // GitHub repo full name
    xHandle?: string;        // X/Twitter handle
  };
  // Additional metadata
  metadata?: {
    description?: string;
    avatar?: string;         // Emoji or image URL
    tags?: string[];
    rank?: number;
    previousRank?: number;
  };
}

// GitHub Event Types
export type GitHubSignalType = 'RepoCreated' | 'ReleasePublished' | 'MajorCommit';

export interface GitHubSignal {
  id: string;
  type: GitHubSignalType;
  repo: string;
  owner: string;
  description?: string;
  url: string;
  timestamp: string;
  metadata?: {
    stars?: number;
    language?: string;
    version?: string;        // For releases
    commitMessage?: string;  // For commits
  };
}

// X/Twitter Event Types
export type XSignalType = 'OfficialAnnouncement';

export interface XSignal {
  id: string;
  type: XSignalType;
  tweetId: string;
  authorHandle: string;
  authorName: string;
  content: string;
  url: string;
  timestamp: string;
  metadata?: {
    retweets?: number;
    likes?: number;
    replies?: number;
    hashtags?: string[];
    mentions?: string[];
  };
}

// On-Chain Event Types (from existing indexer)
export type OnChainSignalType = 
  | 'AgentDeployed'
  | 'ValidatorStaked'
  | 'ValidatorUnstaked'
  | 'Slashed'
  | 'CollusionDetected'
  | 'BoostEvent'
  | 'GovernanceChange';

export interface OnChainSignal {
  id: string;
  type: OnChainSignalType;
  txHash: string;
  blockNumber: number;
  chainId: number;
  timestamp: string;
  contractAddress?: string;
  agentName?: string;
  metadata?: {
    stakeAmount?: string;
    boostAmount?: string;
    reason?: string;
    params?: Record<string, unknown>;
  };
}

// ============================================
// SPRINT 2: WALLET + DASHBOARD TYPES
// ============================================

// Assertion status for user dashboard
export type AssertionStatus = 'pending' | 'challenged' | 'verified' | 'slashed';
export type ActivityOutcome = 'win' | 'loss' | 'pending';
export type ActivityType = 'boost' | 'assertion' | 'challenge' | 'resolution';

// User stats for dashboard
export interface UserStats {
  wallet: string;
  reputation: number;
  eventsSubmitted: number;
  assertionsCount: number;
  challengesCount: number;
  winRate: number;
  totalStaked: string;
  totalRewards: string;
}

// User activity for timeline
export interface UserActivity {
  id: string;
  type: ActivityType;
  eventId: number;
  timestamp: string;
  amount?: string;
  outcome?: ActivityOutcome;
  txHash: string;
}

// User assertion details
export interface UserAssertion {
  id: string;
  eventId: number;
  eventTitle: string;
  eventHash: string;
  type: 'Agent' | 'Human';
  stake: string;
  status: AssertionStatus;
  outcome: ActivityOutcome;
  createdAt: string;
  resolvedAt?: string;
}

// User challenge details
export interface UserChallenge {
  id: string;
  assertionId: number;
  eventId?: number;
  eventTitle: string;
  stake: string;
  counterHash: string;
  resolved: boolean;
  createdAt: string;
}
