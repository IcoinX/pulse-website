export interface FeedItem {
  id: string;
  title: string;
  content: string;
  source: string;
  sourceUrl: string;
  category: 'crypto' | 'ai' | 'tech' | 'agents';
  timestamp: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  author?: string;
  imageUrl?: string;
}

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
}

export type Category = 'all' | 'crypto' | 'ai' | 'tech' | 'agents';
