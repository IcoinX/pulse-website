/**
 * X (Twitter) Whitelist Watcher
 * 
 * Monitors 25 whitelisted accounts for agent-related signals.
 * NO global search - only timeline monitoring of approved accounts.
 * 
 * Whitelisted accounts:
 * - Official agents: @Clara_AGI2026, @OpenClawAI, @OpenClawAgents, @AIXBT_agent, @NeurobroAI, @YapeClub
 * - Builders: @0xVirtuals, @virtuals_io, @OpenClawHQ, @airocket_agent, @CrAIpto_ZIX
 * - Orgs: @OpenAI, @AnthropicAI, @GoogleDeepMind, @xai, @MetaAI
 * - Infra: @Base, @base_ecosystem, @ethereum, @GitHub, @Gitcoin
 * - Signal: @ai_agents_xyz, @agentprotocol, @autonomous_ai, @onchain_ai
 */

import { XSignal, XSignalType } from '@/types';

// ============================================
// WHITELIST CONFIGURATION
// ============================================

export const WHITELISTED_ACCOUNTS = {
  // Agents officiels
  OFFICIAL_AGENTS: [
    { handle: 'Clara_AGI2026', name: 'Clara AGI', category: 'agent' as const },
    { handle: 'OpenClawAI', name: 'OpenClaw AI', category: 'agent' as const },
    { handle: 'OpenClawAgents', name: 'OpenClaw Agents', category: 'agent' as const },
    { handle: 'AIXBT_agent', name: 'AIXBT Agent', category: 'agent' as const },
    { handle: 'NeurobroAI', name: 'Neurobro AI', category: 'agent' as const },
    { handle: 'YapeClub', name: 'Yape Club', category: 'agent' as const },
  ],
  
  // Builders & figures
  BUILDERS: [
    { handle: '0xVirtuals', name: 'Virtuals Protocol', category: 'builder' as const },
    { handle: 'virtuals_io', name: 'Virtuals.io', category: 'builder' as const },
    { handle: 'OpenClawHQ', name: 'OpenClaw HQ', category: 'builder' as const },
    { handle: 'airocket_agent', name: 'AI Rocket', category: 'builder' as const },
    { handle: 'CrAIpto_ZIX', name: 'CrAIpto', category: 'builder' as const },
  ],
  
  // Organizations & labs
  ORGS: [
    { handle: 'OpenAI', name: 'OpenAI', category: 'org' as const },
    { handle: 'AnthropicAI', name: 'Anthropic', category: 'org' as const },
    { handle: 'GoogleDeepMind', name: 'DeepMind', category: 'org' as const },
    { handle: 'xai', name: 'xAI', category: 'org' as const },
    { handle: 'MetaAI', name: 'Meta AI', category: 'org' as const },
  ],
  
  // Infrastructure / Launchpads
  INFRA: [
    { handle: 'Base', name: 'Base', category: 'infra' as const },
    { handle: 'base_ecosystem', name: 'Base Ecosystem', category: 'infra' as const },
    { handle: 'ethereum', name: 'Ethereum', category: 'infra' as const },
    { handle: 'GitHub', name: 'GitHub', category: 'infra' as const },
    { handle: 'Gitcoin', name: 'Gitcoin', category: 'infra' as const },
  ],
  
  // Signal émergent
  EMERGENT: [
    { handle: 'ai_agents_xyz', name: 'AI Agents XYZ', category: 'signal' as const },
    { handle: 'agentprotocol', name: 'Agent Protocol', category: 'signal' as const },
    { handle: 'autonomous_ai', name: 'Autonomous AI', category: 'signal' as const },
    { handle: 'onchain_ai', name: 'Onchain AI', category: 'signal' as const },
  ],
};

// Flatten all accounts
export const ALL_WHITELISTED_HANDLES = Object.values(WHITELISTED_ACCOUNTS).flat();

// ============================================
// KEYWORD DETECTION
// ============================================

// Keywords that indicate agent-related content
const AGENT_KEYWORDS = [
  'agent',
  'agents',
  'ai agent',
  'autonomous',
  'validator',
  'staked',
  'deployed',
  'live',
  'launch',
  'released',
  'update',
  'validating',
  'onchain',
  'protocol',
  'framework',
  'multi-agent',
];

// Action keywords for classification
const ACTION_KEYWORDS = {
  DEPLOY: ['deploy', 'deployed', 'live', 'launched', 'shipping', 'shipped'],
  UPDATE: ['update', 'updated', 'release', 'released', 'v0.', 'v1.', 'version'],
  STAKE: ['stake', 'staked', 'validating', 'validator'],
  BOOST: ['boost', 'boosted'],
  COLLAB: ['partner', 'partnership', 'collab', 'collaborating', 'integrating'],
};

/**
 * Check if content contains agent-related keywords
 */
export function containsAgentKeywords(content: string): boolean {
  const lower = content.toLowerCase();
  return AGENT_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

/**
 * Classify content by action type
 */
export function classifyContent(content: string): {
  isAgentRelated: boolean;
  actions: string[];
  confidence: number;
} {
  const lower = content.toLowerCase();
  const actions: string[] = [];
  let confidence = 0;
  
  // Check for action keywords
  for (const [action, keywords] of Object.entries(ACTION_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      actions.push(action);
      confidence += 0.2;
    }
  }
  
  // Check for agent keywords
  const hasAgentKeywords = containsAgentKeywords(content);
  if (hasAgentKeywords) {
    confidence += 0.4;
  }
  
  return {
    isAgentRelated: hasAgentKeywords || actions.length > 0,
    actions,
    confidence: Math.min(1, confidence),
  };
}

// ============================================
// X API INTERFACE
// ============================================

// Note: In production, this would use the X API v2
// For now, we define the interface and mock implementation

export interface XTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  entities?: {
    hashtags?: Array<{ tag: string }>;
    mentions?: Array<{ username: string }>;
    urls?: Array<{ expanded_url: string }>;
  };
}

export interface XUser {
  id: string;
  username: string;
  name: string;
  description?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

// ============================================
// CACHE
// ============================================

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class XWatcherCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const xWatcherCache = new XWatcherCache();

// ============================================
// API FUNCTIONS (Interface)
// ============================================

/**
 * Fetch recent tweets from a user
 * Note: Requires X API v2 bearer token
 */
export async function fetchUserTweets(
  userId: string,
  options: {
    maxResults?: number;
    sinceId?: string;
    bearerToken?: string;
  } = {}
): Promise<XTweet[]> {
  const { maxResults = 10, sinceId, bearerToken } = options;
  
  if (!bearerToken) {
    // Return mock data if no token
    return [];
  }
  
  const params = new URLSearchParams({
    max_results: maxResults.toString(),
    'tweet.fields': 'created_at,public_metrics,entities',
  });
  
  if (sinceId) {
    params.set('since_id', sinceId);
  }
  
  const response = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`X API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data || [];
}

/**
 * Lookup user by username
 */
export async function lookupUser(
  username: string,
  bearerToken?: string
): Promise<XUser | null> {
  if (!bearerToken) return null;
  
  const response = await fetch(
    `https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics,description`,
    {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
      },
    }
  );
  
  if (!response.ok) return null;
  
  const data = await response.json();
  return data.data || null;
}

// ============================================
// SIGNAL GENERATION
// ============================================

/**
 * Convert a tweet to an XSignal
 */
export function tweetToSignal(
  tweet: XTweet,
  author: XUser
): XSignal | null {
  const classification = classifyContent(tweet.text);
  
  // Only convert if it's agent-related
  if (!classification.isAgentRelated || classification.confidence < 0.5) {
    return null;
  }
  
  return {
    id: `x-${tweet.id}`,
    type: 'OfficialAnnouncement',
    tweetId: tweet.id,
    authorHandle: `@${author.username}`,
    authorName: author.name,
    content: tweet.text,
    url: `https://twitter.com/${author.username}/status/${tweet.id}`,
    timestamp: tweet.created_at,
    metadata: {
      retweets: tweet.public_metrics?.retweet_count,
      likes: tweet.public_metrics?.like_count,
      replies: tweet.public_metrics?.reply_count,
      hashtags: tweet.entities?.hashtags?.map(h => h.tag),
      mentions: tweet.entities?.mentions?.map(m => m.username),
    },
  };
}

// ============================================
// WATCHER CLASS
// ============================================

export interface XWatcherOptions {
  bearerToken?: string;
  pollIntervalMs?: number;
  onSignal?: (signal: XSignal) => void;
  onError?: (error: Error) => void;
  minConfidence?: number;
}

export class XWhitelistWatcher {
  private bearerToken?: string;
  private pollIntervalMs: number;
  private onSignal?: (signal: XSignal) => void;
  private onError?: (error: Error) => void;
  private minConfidence: number;
  private intervalId?: NodeJS.Timeout;
  private userIds = new Map<string, string>(); // handle -> userId
  private lastTweetIds = new Map<string, string>(); // userId -> last tweet ID
  
  constructor(options: XWatcherOptions = {}) {
    this.bearerToken = options.bearerToken;
    this.pollIntervalMs = options.pollIntervalMs || 2 * 60 * 1000; // 2 min default
    this.onSignal = options.onSignal;
    this.onError = options.onError;
    this.minConfidence = options.minConfidence || 0.5;
  }
  
  /**
   * Initialize by looking up user IDs
   */
  async initialize(): Promise<void> {
    if (!this.bearerToken) {
      console.warn('X Watcher: No bearer token provided, using mock mode');
      return;
    }
    
    for (const account of ALL_WHITELISTED_HANDLES) {
      try {
        const user = await lookupUser(account.handle, this.bearerToken);
        if (user) {
          this.userIds.set(account.handle, user.id);
        }
      } catch (error) {
        console.error(`Error looking up user ${account.handle}:`, error);
      }
    }
    
    console.log(`X Watcher: Resolved ${this.userIds.size} user IDs`);
  }
  
  /**
   * Start watching
   */
  async start(): Promise<void> {
    if (this.intervalId) return;
    
    await this.initialize();
    
    // Initial check
    await this.checkAll();
    
    // Schedule recurring checks
    this.intervalId = setInterval(() => {
      this.checkAll();
    }, this.pollIntervalMs);
  }
  
  /**
   * Stop watching
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
  
  /**
   * Check all whitelisted accounts
   */
  async checkAll(): Promise<XSignal[]> {
    const signals: XSignal[] = [];
    
    if (!this.bearerToken) {
      // Return mock signals in dev mode
      return this.getMockSignals();
    }
    
    const entries = Array.from(this.userIds.entries());
    for (const [handle, userId] of entries) {
      try {
        const account = ALL_WHITELISTED_HANDLES.find(a => a.handle === handle);
        if (!account) continue;
        
        const tweets = await fetchUserTweets(userId, {
          maxResults: 5,
          sinceId: this.lastTweetIds.get(userId),
          bearerToken: this.bearerToken,
        });
        
        const user: XUser = {
          id: userId,
          username: handle,
          name: account.name,
        };
        
        for (const tweet of tweets) {
          const signal = tweetToSignal(tweet, user);
          
          if (signal) {
            const classification = classifyContent(tweet.text);
            if (classification.confidence >= this.minConfidence) {
              signals.push(signal);
              this.onSignal?.(signal);
            }
          }
          
          // Track latest tweet ID
          if (!this.lastTweetIds.get(userId) || tweet.id > this.lastTweetIds.get(userId)!) {
            this.lastTweetIds.set(userId, tweet.id);
          }
        }
      } catch (error) {
        this.onError?.(error as Error);
      }
    }
    
    return signals;
  }
  
  /**
   * Get mock signals for development
   */
  private getMockSignals(): XSignal[] {
    return MOCK_X_SIGNALS;
  }
  
  /**
   * Check a specific account manually
   */
  async checkAccount(handle: string): Promise<XSignal[]> {
    // Would implement manual check
    return [];
  }
  
  /**
   * Get watcher status
   */
  getStatus(): {
    isRunning: boolean;
    trackedAccounts: number;
    resolvedUserIds: number;
  } {
    return {
      isRunning: !!this.intervalId,
      trackedAccounts: ALL_WHITELISTED_HANDLES.length,
      resolvedUserIds: this.userIds.size,
    };
  }
}

// ============================================
// MOCK DATA
// ============================================

export const MOCK_X_SIGNALS: XSignal[] = [
  {
    id: 'x-001',
    type: 'OfficialAnnouncement',
    tweetId: '1888888888888888881',
    authorHandle: '@Clara_AGI2026',
    authorName: 'Clara AGI',
    content: 'Just deployed our new autonomous agent framework on Base. Validators are now live and staking is open! 🚀 #AIAgents #OnChain',
    url: 'https://twitter.com/Clara_AGI2026/status/1888888888888888881',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: {
      retweets: 245,
      likes: 1892,
      replies: 67,
      hashtags: ['AIAgents', 'OnChain'],
    },
  },
  {
    id: 'x-002',
    type: 'OfficialAnnouncement',
    tweetId: '1888888888888888882',
    authorHandle: '@OpenClawAI',
    authorName: 'OpenClaw AI',
    content: 'v0.2.0 is now live! Major improvements to the agent protocol and multi-agent coordination. Check the release notes 🧵',
    url: 'https://twitter.com/OpenClawAI/status/1888888888888888882',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    metadata: {
      retweets: 128,
      likes: 945,
      replies: 34,
      hashtags: ['OpenClaw'],
    },
  },
  {
    id: 'x-003',
    type: 'OfficialAnnouncement',
    tweetId: '1888888888888888883',
    authorHandle: '@0xVirtuals',
    authorName: 'Virtuals Protocol',
    content: 'New validator set just went live! 50K+ PULSE staked. The agent economy is growing faster than ever 📈',
    url: 'https://twitter.com/0xVirtuals/status/1888888888888888883',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    metadata: {
      retweets: 312,
      likes: 2105,
      replies: 89,
    },
  },
  {
    id: 'x-004',
    type: 'OfficialAnnouncement',
    tweetId: '1888888888888888884',
    authorHandle: '@AIXBT_agent',
    authorName: 'AIXBT Agent',
    content: 'We\'re now validating on the PULSE protocol. Stake with us for optimal returns and accurate market predictions 🤖',
    url: 'https://twitter.com/AIXBT_agent/status/1888888888888888884',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    metadata: {
      retweets: 89,
      likes: 567,
      replies: 23,
    },
  },
  {
    id: 'x-005',
    type: 'OfficialAnnouncement',
    tweetId: '1888888888888888885',
    authorHandle: '@Base',
    authorName: 'Base',
    content: 'Agent ecosystem update: Over 1,000 autonomous agents now deployed on Base. The future of AI x Crypto is being built here 🛡️',
    url: 'https://twitter.com/Base/status/1888888888888888885',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    metadata: {
      retweets: 1567,
      likes: 8902,
      replies: 234,
      hashtags: ['Base'],
    },
  },
];

// ============================================
// STATIC FUNCTIONS
// ============================================

/**
 * Fetch signals from X (one-time, requires bearer token)
 */
export async function fetchXSignals(
  options: {
    bearerToken?: string;
    handles?: string[];
    maxResults?: number;
  } = {}
): Promise<XSignal[]> {
  const { bearerToken, handles = ALL_WHITELISTED_HANDLES.map(a => a.handle), maxResults = 5 } = options;
  
  if (!bearerToken) {
    // Return filtered mock data
    return MOCK_X_SIGNALS.filter(s => handles.some(h => s.authorHandle.toLowerCase() === `@${h}`.toLowerCase()));
  }
  
  const signals: XSignal[] = [];
  
  for (const handle of handles) {
    try {
      const user = await lookupUser(handle, bearerToken);
      if (!user) continue;
      
      const tweets = await fetchUserTweets(user.id, { maxResults, bearerToken });
      
      for (const tweet of tweets) {
        const signal = tweetToSignal(tweet, user);
        if (signal) {
          signals.push(signal);
        }
      }
    } catch (error) {
      console.error(`Error fetching tweets for ${handle}:`, error);
    }
  }
  
  return signals.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Filter signals by category
 */
export function filterByCategory(
  signals: XSignal[],
  category: 'agent' | 'builder' | 'org' | 'infra' | 'signal'
): XSignal[] {
  const handlesInCategory = ALL_WHITELISTED_HANDLES
    .filter(a => a.category === category)
    .map(a => `@${a.handle}`.toLowerCase());
  
  return signals.filter(s => handlesInCategory.includes(s.authorHandle.toLowerCase()));
}

/**
 * Get high-engagement signals
 */
export function getTrendingSignals(signals: XSignal[], minLikes: number = 100): XSignal[] {
  return signals
    .filter(s => (s.metadata?.likes || 0) >= minLikes)
    .sort((a, b) => (b.metadata?.likes || 0) - (a.metadata?.likes || 0));
}

// ============================================
// EXPORTS
// ============================================

export const XWatcherModule = {
  WHITELISTED_ACCOUNTS,
  ALL_WHITELISTED_HANDLES,
  AGENT_KEYWORDS,
  ACTION_KEYWORDS,
  containsAgentKeywords,
  classifyContent,
  fetchUserTweets,
  lookupUser,
  tweetToSignal,
  fetchXSignals,
  filterByCategory,
  getTrendingSignals,
  XWhitelistWatcher,
  xWatcherCache,
  MOCK_X_SIGNALS,
};

export default XWatcherModule;
