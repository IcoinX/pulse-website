/**
 * GitHub Watcher
 * 
 * Monitors GitHub for agent-related activity:
 * - New repos with agent keywords
 * - New releases/tags
 * - Major commits
 * 
 * Keywords: agent, autonomous-agent, ai-agent, llm-agent, multi-agent,
 *           agent-framework, agent-protocol, onchain-agent, openclaw,
 *           virtuals, genesis, base
 */

import { GitHubSignal, GitHubSignalType } from '@/types';

// ============================================
// CONFIGURATION
// ============================================

export const GITHUB_KEYWORDS = [
  'agent',
  'autonomous-agent',
  'ai-agent',
  'llm-agent',
  'multi-agent',
  'agent-framework',
  'agent-protocol',
  'onchain-agent',
  'openclaw',
  'virtuals',
  'genesis',
  'base',
] as const;

const GITHUB_API_BASE = 'https://api.github.com';
const REQUEST_DELAY_MS = 1000; // Rate limit protection

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// ============================================
// CACHE
// ============================================

class GitHubCache {
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

export const githubCache = new GitHubCache();

// ============================================
// API HELPERS
// ============================================

/**
 * Sleep for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make authenticated GitHub API request
 */
async function githubFetch<T>(
  endpoint: string,
  token?: string
): Promise<T> {
  const cacheKey = endpoint;
  const cached = githubCache.get<T>(cacheKey);
  if (cached) return cached;
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'PULSE-Agent-Watcher',
  };
  
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers });
  
  if (response.status === 403) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    if (resetTime) {
      const waitMs = (parseInt(resetTime) * 1000) - Date.now();
      if (waitMs > 0) {
        await sleep(Math.min(waitMs, 60000)); // Max 60s wait
        return githubFetch(endpoint, token);
      }
    }
  }
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  githubCache.set(cacheKey, data);
  
  // Rate limit protection
  await sleep(REQUEST_DELAY_MS);
  
  return data;
}

// ============================================
// REPOSITORY SEARCH
// ============================================

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string | null;
  html_url: string;
  published_at: string;
  prerelease: boolean;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    committer: {
      date: string;
    };
  };
  html_url: string;
}

/**
 * Search for repos with agent keywords
 */
export async function searchAgentRepos(
  options: {
    keyword?: string;
    sort?: 'stars' | 'updated' | 'created';
    order?: 'asc' | 'desc';
    perPage?: number;
    page?: number;
    createdAfter?: Date;
    token?: string;
  } = {}
): Promise<GitHubRepo[]> {
  const {
    keyword = GITHUB_KEYWORDS[0],
    sort = 'updated',
    order = 'desc',
    perPage = 30,
    page = 1,
    createdAfter,
    token,
  } = options;
  
  let query = keyword;
  if (createdAfter) {
    query += ` created:>${createdAfter.toISOString().split('T')[0]}`;
  }
  
  const endpoint = `/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}&per_page=${perPage}&page=${page}`;
  
  const response = await githubFetch<{ items: GitHubRepo[] }>(endpoint, token);
  return response.items || [];
}

/**
 * Search across all keywords
 */
export async function searchAllKeywords(
  options: {
    createdAfter?: Date;
    perPage?: number;
    token?: string;
  } = {}
): Promise<Map<string, GitHubRepo[]>> {
  const results = new Map<string, GitHubRepo[]>();
  
  for (const keyword of GITHUB_KEYWORDS) {
    try {
      const repos = await searchAgentRepos({
        keyword,
        ...options,
      });
      results.set(keyword, repos);
    } catch (error) {
      console.error(`Error searching keyword "${keyword}":`, error);
      results.set(keyword, []);
    }
  }
  
  return results;
}

// ============================================
// RELEASE MONITORING
// ============================================

/**
 * Get releases for a repo
 */
export async function getRepoReleases(
  owner: string,
  repo: string,
  options: {
    perPage?: number;
    page?: number;
    token?: string;
  } = {}
): Promise<GitHubRelease[]> {
  const { perPage = 10, page = 1, token } = options;
  
  const endpoint = `/repos/${owner}/${repo}/releases?per_page=${perPage}&page=${page}`;
  return githubFetch<GitHubRelease[]>(endpoint, token);
}

/**
 * Get recent tags (as releases)
 */
export async function getRepoTags(
  owner: string,
  repo: string,
  options: {
    perPage?: number;
    token?: string;
  } = {}
): Promise<Array<{ name: string; commit: { sha: string } }>> {
  const { perPage = 10, token } = options;
  
  const endpoint = `/repos/${owner}/${repo}/tags?per_page=${perPage}`;
  return githubFetch<Array<{ name: string; commit: { sha: string } }>>(endpoint, token);
}

// ============================================
// COMMIT MONITORING
// ============================================

/**
 * Get recent commits
 */
export async function getRepoCommits(
  owner: string,
  repo: string,
  options: {
    perPage?: number;
    since?: Date;
    token?: string;
  } = {}
): Promise<GitHubCommit[]> {
  const { perPage = 30, since, token } = options;
  
  let endpoint = `/repos/${owner}/${repo}/commits?per_page=${perPage}`;
  if (since) {
    endpoint += `&since=${since.toISOString()}`;
  }
  
  return githubFetch<GitHubCommit[]>(endpoint, token);
}

/**
 * Check for major commits (README changes, version bumps)
 */
export async function checkMajorCommits(
  owner: string,
  repo: string,
  options: {
    since?: Date;
    token?: string;
  } = {}
): Promise<GitHubCommit[]> {
  const commits = await getRepoCommits(owner, repo, options);
  
  const majorPatterns = [
    /readme/i,
    /version.*bump/i,
    /bump.*version/i,
    /release/i,
    /changelog/i,
    /v\d+\.\d+/i,
    /major/i,
    /breaking/i,
  ];
  
  return commits.filter(commit => {
    const message = commit.commit.message.toLowerCase();
    return majorPatterns.some(pattern => pattern.test(message));
  });
}

// ============================================
// SIGNAL GENERATION
// ============================================

/**
 * Convert a GitHub repo to a signal
 */
export function repoToSignal(repo: GitHubRepo): GitHubSignal {
  return {
    id: `gh-repo-${repo.id}`,
    type: 'RepoCreated',
    repo: repo.name,
    owner: repo.owner.login,
    description: repo.description || undefined,
    url: repo.html_url,
    timestamp: repo.created_at,
    metadata: {
      stars: repo.stargazers_count,
      language: repo.language || undefined,
    },
  };
}

/**
 * Convert a release to a signal
 */
export function releaseToSignal(
  release: GitHubRelease,
  owner: string,
  repo: string
): GitHubSignal {
  return {
    id: `gh-release-${release.id}`,
    type: 'ReleasePublished',
    repo,
    owner,
    description: release.body || release.name,
    url: release.html_url,
    timestamp: release.published_at,
    metadata: {
      version: release.tag_name.replace(/^v/, ''),
    },
  };
}

/**
 * Convert a commit to a signal
 */
export function commitToSignal(
  commit: GitHubCommit,
  owner: string,
  repo: string
): GitHubSignal {
  return {
    id: `gh-commit-${commit.sha}`,
    type: 'MajorCommit',
    repo,
    owner,
    description: commit.commit.message.split('\n')[0],
    url: commit.html_url,
    timestamp: commit.commit.committer.date,
    metadata: {
      commitMessage: commit.commit.message.slice(0, 100),
    },
  };
}

// ============================================
// WATCHER CLASS
// ============================================

export interface GitHubWatcherOptions {
  token?: string;
  pollIntervalMs?: number;
  onSignal?: (signal: GitHubSignal) => void;
  onError?: (error: Error) => void;
}

export class GitHubWatcher {
  private token?: string;
  private pollIntervalMs: number;
  private onSignal?: (signal: GitHubSignal) => void;
  private onError?: (error: Error) => void;
  private intervalId?: NodeJS.Timeout;
  private lastCheck = new Map<string, Date>();
  
  constructor(options: GitHubWatcherOptions = {}) {
    this.token = options.token;
    this.pollIntervalMs = options.pollIntervalMs || 5 * 60 * 1000; // 5 min default
    this.onSignal = options.onSignal;
    this.onError = options.onError;
  }
  
  /**
   * Start watching
   */
  start(): void {
    if (this.intervalId) return;
    
    // Initial check
    this.checkAll();
    
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
   * Check all sources
   */
  async checkAll(): Promise<GitHubSignal[]> {
    const signals: GitHubSignal[] = [];
    
    try {
      // Check for new repos
      const repoSignals = await this.checkNewRepos();
      signals.push(...repoSignals);
      
      // Check tracked repos for releases and commits
      const trackedSignals = await this.checkTrackedRepos();
      signals.push(...trackedSignals);
      
      // Emit signals
      for (const signal of signals) {
        this.onSignal?.(signal);
      }
    } catch (error) {
      this.onError?.(error as Error);
    }
    
    return signals;
  }
  
  /**
   * Check for new repos with keywords
   */
  private async checkNewRepos(): Promise<GitHubSignal[]> {
    const signals: GitHubSignal[] = [];
    const lastCheck = this.lastCheck.get('repos') || new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const keyword of GITHUB_KEYWORDS) {
      try {
        const repos = await searchAgentRepos({
          keyword,
          createdAfter: lastCheck,
          perPage: 10,
          token: this.token,
        });
        
        for (const repo of repos) {
          signals.push(repoToSignal(repo));
        }
      } catch (error) {
        console.error(`Error checking repos for keyword "${keyword}":`, error);
      }
    }
    
    this.lastCheck.set('repos', new Date());
    return signals;
  }
  
  /**
   * Check tracked repos for updates
   */
  private async checkTrackedRepos(): Promise<GitHubSignal[]> {
    // This would check a list of tracked repos
    // For now, return empty - would be populated from a database
    return [];
  }
  
  /**
   * Add a repo to track
   */
  trackRepo(owner: string, repo: string): void {
    // Would add to tracked repos in database
    console.log(`Tracking ${owner}/${repo}`);
  }
  
  /**
   * Get rate limit status
   */
  async getRateLimit(): Promise<{
    limit: number;
    remaining: number;
    reset: Date;
  }> {
    const response = await githubFetch<{
      resources: {
        core: {
          limit: number;
          remaining: number;
          reset: number;
        };
      };
    }>('/rate_limit', this.token);
    
    return {
      limit: response.resources.core.limit,
      remaining: response.resources.core.remaining,
      reset: new Date(response.resources.core.reset * 1000),
    };
  }
}

// ============================================
// STATIC FUNCTIONS
// ============================================

/**
 * Fetch signals from GitHub (one-time)
 */
export async function fetchGitHubSignals(
  options: {
    keywords?: string[];
    since?: Date;
    token?: string;
    maxRepos?: number;
  } = {}
): Promise<GitHubSignal[]> {
  const {
    keywords = Array.from(GITHUB_KEYWORDS),
    since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    token,
    maxRepos = 50,
  } = options;
  
  const signals: GitHubSignal[] = [];
  
  // Search for repos
  for (const keyword of keywords.slice(0, 3)) { // Limit to avoid rate limits
    try {
      const repos = await searchAgentRepos({
        keyword,
        createdAfter: since,
        perPage: Math.min(maxRepos, 30),
        token,
      });
      
      for (const repo of repos.slice(0, maxRepos / keywords.length)) {
        signals.push(repoToSignal(repo));
        
        // Check for releases
        try {
          const releases = await getRepoReleases(repo.owner.login, repo.name, {
            perPage: 3,
            token,
          });
          
          for (const release of releases) {
            if (new Date(release.published_at) >= since) {
              signals.push(releaseToSignal(release, repo.owner.login, repo.name));
            }
          }
        } catch {
          // Repo might not have releases
        }
      }
    } catch (error) {
      console.error(`Error fetching signals for keyword "${keyword}":`, error);
    }
  }
  
  // Sort by timestamp (newest first)
  return signals.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ============================================
// EXPORTS
// ============================================

export const GitHubWatcherModule = {
  GITHUB_KEYWORDS,
  searchAgentRepos,
  searchAllKeywords,
  getRepoReleases,
  getRepoTags,
  getRepoCommits,
  checkMajorCommits,
  repoToSignal,
  releaseToSignal,
  commitToSignal,
  fetchGitHubSignals,
  GitHubWatcher,
  githubCache,
};

export default GitHubWatcherModule;
