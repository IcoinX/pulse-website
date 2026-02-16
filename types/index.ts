export type EventStatus = 'pending' | 'challenged' | 'verified' | 'rejected';
export type ImpactType = 'market' | 'narrative' | 'tech';
export type Timeframe = '1h' | '6h' | '24h' | '7d' | '30d';
export type SortOption = 'latest' | 'trending' | 'highest_impact' | 'most_contested';
export type Category = 'all' | 'crypto_agents' | 'ai_models' | 'openclaw_tech' | 'tech_world';

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

export interface ProtocolStats {
  verified_24h: number;
  pending: number;
  challenged: number;
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
