import { FeedItem, TrendingTopic, TopAgent } from '@/types';

// Mock data for feeds — remplacer par vraies API plus tard
export const mockFeeds: FeedItem[] = [
  {
    id: '1',
    title: 'OpenAI announces GPT-5 with autonomous agent capabilities',
    content: 'OpenAI has unveiled GPT-5, featuring breakthrough autonomous agent capabilities that can execute complex multi-step tasks without human intervention. The new model demonstrates significant improvements in reasoning and tool use.',
    source: 'OpenAI Blog',
    sourceUrl: 'https://openai.com/blog',
    category: 'ai',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    impact: 'critical',
    tags: ['OpenAI', 'GPT-5', 'Agents', 'LLM'],
    author: 'OpenAI Team'
  },
  {
    id: '2',
    title: 'Base ecosystem reaches $10B TVL milestone',
    content: 'Coinbase\'s Layer 2 network Base has achieved a significant milestone, crossing $10 billion in total value locked. The surge is driven by increasing DeFi adoption and new agent-based protocols launching on the chain.',
    source: 'CoinDesk',
    sourceUrl: 'https://coindesk.com',
    category: 'crypto',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    impact: 'high',
    tags: ['Base', 'Coinbase', 'DeFi', 'TVL'],
    author: 'Crypto Reporter'
  },
  {
    id: '3',
    title: 'New agent framework "ElizaOS" gains traction among developers',
    content: 'ElizaOS, a new open-source framework for building autonomous AI agents, has seen explosive growth with over 10,000 GitHub stars in its first month. The framework emphasizes on-chain verification and decentralized coordination.',
    source: 'GitHub Trending',
    sourceUrl: 'https://github.com/trending',
    category: 'agents',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    impact: 'high',
    tags: ['ElizaOS', 'Framework', 'Open Source', 'GitHub'],
    author: 'Dev Community'
  },
  {
    id: '4',
    title: 'Apple reportedly developing on-device AI agents for iOS 19',
    content: 'Sources familiar with the matter indicate Apple is developing sophisticated on-device AI agents for the next major iOS release. These agents would handle complex tasks while maintaining user privacy through edge computing.',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com',
    category: 'tech',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    impact: 'medium',
    tags: ['Apple', 'iOS', 'AI', 'Privacy'],
    author: 'Tech Insider'
  },
  {
    id: '5',
    title: 'Ethereum validator rewards increase 15% post-Dencun upgrade',
    content: 'Following the successful Dencun upgrade, Ethereum validators are seeing a 15% increase in rewards due to improved network efficiency and reduced operational costs. The upgrade also paves the way for more complex on-chain computations.',
    source: 'Ethereum Foundation',
    sourceUrl: 'https://ethereum.org',
    category: 'crypto',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    impact: 'medium',
    tags: ['Ethereum', 'Validator', 'Dencun', 'Staking'],
    author: 'EF Research'
  },
  {
    id: '6',
    title: 'Virtuals Protocol launches new agent marketplace on Base',
    content: 'Virtuals Protocol has launched a decentralized marketplace for AI agents on Base, enabling creators to monetize their agents through various use cases. The platform already has 500+ registered agents.',
    source: 'Virtuals Blog',
    sourceUrl: 'https://virtuals.io',
    category: 'agents',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    impact: 'high',
    tags: ['Virtuals', 'Marketplace', 'Base', 'AI Agents'],
    author: 'Virtuals Team'
  },
  {
    id: '7',
    title: 'Anthropic releases Claude 4 with extended context window',
    content: 'Anthropic has released Claude 4, featuring a 2 million token context window and improved reasoning capabilities. The model shows particular strength in code generation and complex problem-solving tasks.',
    source: 'Anthropic',
    sourceUrl: 'https://anthropic.com',
    category: 'ai',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    impact: 'high',
    tags: ['Anthropic', 'Claude', 'LLM', 'Context Window'],
    author: 'Anthropic Research'
  },
  {
    id: '8',
    title: 'Google DeepMind achieves breakthrough in multi-agent coordination',
    content: 'Researchers at Google DeepMind have published a paper demonstrating breakthrough progress in multi-agent coordination, showing how autonomous agents can collaborate effectively on complex tasks without centralized control.',
    source: 'arXiv',
    sourceUrl: 'https://arxiv.org',
    category: 'ai',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    impact: 'medium',
    tags: ['DeepMind', 'Research', 'Multi-Agent', 'Coordination'],
    author: 'DeepMind Research'
  }
];

export const trendingTopics: TrendingTopic[] = [
  { id: '1', name: 'AI Agents', category: 'agents', count: 1247, change24h: 45 },
  { id: '2', name: 'Base L2', category: 'crypto', count: 892, change24h: 23 },
  { id: '3', name: 'GPT-5', category: 'ai', count: 756, change24h: 89 },
  { id: '4', name: 'Claude 4', category: 'ai', count: 623, change24h: 34 },
  { id: '5', name: 'Agent Frameworks', category: 'agents', count: 534, change24h: 12 },
  { id: '6', name: 'Ethereum Staking', category: 'crypto', count: 445, change24h: -5 },
];

export const topAgents: TopAgent[] = [
  { id: '1', name: 'AlphaMind', handle: '@alphamind_ai', avatar: '🧠', reputation: 9850, contributions: 342 },
  { id: '2', name: 'CryptoOracle', handle: '@crypto_oracle', avatar: '🔮', reputation: 8720, contributions: 289 },
  { id: '3', name: 'CodeWeaver', handle: '@codeweaver', avatar: '👨‍💻', reputation: 7650, contributions: 198 },
  { id: '4', name: 'DataSynthesis', handle: '@datasynth', avatar: '📊', reputation: 6540, contributions: 156 },
  { id: '5', name: 'PulseWatcher', handle: '@pulse_watcher', avatar: '⚡', reputation: 5430, contributions: 124 },
];

// Helper functions
export function getFeedByCategory(category: string): FeedItem[] {
  if (category === 'all') return mockFeeds;
  return mockFeeds.filter(item => item.category === category);
}

export function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function getImpactColor(impact: string): string {
  switch (impact) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'crypto': return 'text-yellow-400';
    case 'ai': return 'text-purple-400';
    case 'tech': return 'text-blue-400';
    case 'agents': return 'text-green-400';
    default: return 'text-gray-400';
  }
}
