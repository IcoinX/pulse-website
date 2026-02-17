import { ProtocolEvent, FeedItem, ImpactScores } from '@/types';
import { XMLParser } from 'fast-xml-parser';
import { cache } from 'react';

// RSS Feed URLs
export const RSS_FEEDS = {
  crypto: [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
    { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss' },
    { name: 'CryptoPotato', url: 'https://cryptopotato.com/feed/' },
  ],
  ai: [
    { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml' },
    { name: 'Anthropic', url: 'https://www.anthropic.com/blog/rss.xml' },
    { name: 'arXiv AI', url: 'http://export.arxiv.org/rss/cs.AI' },
    { name: 'DeepMind Blog', url: 'https://deepmind.google/blog/rss/' },
  ],
  tech: [
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  ],
  agents: [
    { name: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml' },
    { name: 'LangChain Blog', url: 'https://blog.langchain.dev/rss/' },
  ],
};

// Cache duration in seconds
const CACHE_DURATION = 300; // 5 minutes

let feedCache: {
  data: ProtocolEvent[];
  timestamp: number;
} | null = null;

async function fetchRSSFeed(url: string, sourceName: string, category: string): Promise<ProtocolEvent[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PULSE Protocol Feed Reader/1.0',
      },
    });
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const xml = await response.text();
    
    // Simple regex parsing for RSS - using [\s\S] instead of 's' flag
    const items: ProtocolEvent[] = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/i;
    const titleRegex = /<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i;
    const linkRegex = /<link[^>]*>([\s\S]*?)<\/link>/i;
    const descriptionRegex = /<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i;
    const pubDateRegex = /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i;
    const authorRegex = /<(?:author|dc:creator)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:author|dc:creator)>/i;
    
    let xmlRemainder = xml;
    let counter = 0;
    
    while (counter < 10) {
      const itemMatch = xmlRemainder.match(itemRegex);
      if (!itemMatch) break;
      
      const itemContent = itemMatch[1];
      
      const titleMatch = itemContent.match(titleRegex);
      const linkMatch = itemContent.match(linkRegex);
      const descMatch = itemContent.match(descriptionRegex);
      const dateMatch = itemContent.match(pubDateRegex);
      const authorMatch = itemContent.match(authorRegex);
      
      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        const link = linkMatch[1].trim();
        const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').substring(0, 300) + '...' : '';
        const pubDate = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString();
        const author = authorMatch ? authorMatch[1].replace(/<[^>]+>/g, '').trim() : sourceName;
        
        // Generate ID from title hash
        const id = `rss-${Buffer.from(title).toString('base64').substring(0, 16)}`;
        
        // Determine impact based on keywords
        const impactLevel = determineImpact(title + ' ' + description);
        const impact = calculateImpactScores(impactLevel, title + ' ' + description);
        
        // Extract tags
        const tags = extractTags(title + ' ' + description, category);
        
        // Create a protocol-native event from RSS data
        items.push({
          id,
          title: title.substring(0, 150),
          summary: description || title,
          content: description || title,
          source: sourceName,
          sourceUrl: link,
          category: category as any,
          timestamp: pubDate,
          status: 'pending',
          verification_score: 30,
          impact,
          validation: {
            status: 'pending',
            score: 30,
            sources: [link],
            source_count: 1,
            timestamp: pubDate,
            validator_count: 0,
            challenge_count: 0,
          },
          metrics: {
            boost: 0,
            burn: 0,
            emission: 0,
          },
          proof_tags: [],
          timeline: [
            { status: 'pending', timestamp: pubDate, actor: 'RSSIndexer', note: 'Event imported from RSS' }
          ],
          tags,
          author,
          source_type: 'MEDIA',
          evidence: [{
            source_type: 'MEDIA',
            url: link,
            timestamp: pubDate,
            media_source: sourceName,
          }],
          verificationStatus: 'UNVERIFIED',
          verificationReason: 'Media source - awaiting cross-source confirmation',
        });
        
        counter++;
      }
      
      // Move past this item
      const itemEndIndex = xmlRemainder.indexOf(itemMatch[0]) + itemMatch[0].length;
      xmlRemainder = xmlRemainder.slice(itemEndIndex);
    }
    
    return items;
  } catch (error) {
    console.error(`Error fetching ${sourceName}:`, error);
    return [];
  }
}

function determineImpact(text: string): 'low' | 'medium' | 'high' | 'critical' {
  const critical = ['announce', 'breakthrough', 'revolutionary', 'launches', 'partnership', 'acquisition', 'funding', 'billion', 'major', 'significant'];
  const high = ['update', 'release', 'new', 'feature', 'improvement', 'growth', 'expansion'];
  const medium = ['tutorial', 'guide', 'analysis', 'review', 'comparison'];
  
  const lowerText = text.toLowerCase();
  
  if (critical.some(word => lowerText.includes(word))) return 'critical';
  if (high.some(word => lowerText.includes(word))) return 'high';
  if (medium.some(word => lowerText.includes(word))) return 'medium';
  return 'low';
}

function calculateImpactScores(level: 'low' | 'medium' | 'high' | 'critical', text: string): ImpactScores {
  const baseScores = {
    critical: { market: 80, narrative: 85, tech: 80 },
    high: { market: 65, narrative: 70, tech: 65 },
    medium: { market: 45, narrative: 50, tech: 45 },
    low: { market: 25, narrative: 30, tech: 25 },
  };
  
  const base = baseScores[level];
  
  // Add some variation based on content
  const lowerText = text.toLowerCase();
  let marketMod = 0;
  let narrativeMod = 0;
  let techMod = 0;
  
  if (lowerText.includes('price') || lowerText.includes('market') || lowerText.includes('trading')) {
    marketMod += 10;
  }
  if (lowerText.includes('community') || lowerText.includes('adoption') || lowerText.includes('sentiment')) {
    narrativeMod += 10;
  }
  if (lowerText.includes('code') || lowerText.includes('github') || lowerText.includes('protocol')) {
    techMod += 10;
  }
  
  return {
    market: Math.min(100, base.market + marketMod),
    narrative: Math.min(100, base.narrative + narrativeMod),
    tech: Math.min(100, base.tech + techMod),
  };
}

function extractTags(text: string, category: string): string[] {
  const tags: string[] = [category];
  
  const keywords: Record<string, string[]> = {
    crypto: ['Bitcoin', 'Ethereum', 'DeFi', 'NFT', 'Blockchain', 'Trading', 'Mining', 'Wallet', 'Exchange'],
    ai: ['OpenAI', 'GPT', 'Claude', 'LLM', 'Machine Learning', 'Neural Network', 'Chatbot', 'API'],
    tech: ['Apple', 'Google', 'Microsoft', 'Amazon', 'Meta', 'iOS', 'Android', 'Cloud', 'Security'],
    agents: ['Autonomous', 'Agent', 'Framework', 'LLM', 'Tool', 'Integration', 'SDK'],
  };
  
  const categoryKeywords = keywords[category] || [];
  
  categoryKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      tags.push(keyword);
    }
  });
  
  return tags.slice(0, 5);
}

export async function fetchAllFeeds(): Promise<ProtocolEvent[]> {
  // Check cache
  if (feedCache && Date.now() - feedCache.timestamp < CACHE_DURATION * 1000) {
    return feedCache.data;
  }
  
  const allFeeds: ProtocolEvent[] = [];
  
  // Fetch all feeds in parallel
  const feedPromises: Promise<ProtocolEvent[]>[] = [];
  
  Object.entries(RSS_FEEDS).forEach(([category, sources]) => {
    sources.forEach(source => {
      feedPromises.push(fetchRSSFeed(source.url, source.name, category));
    });
  });
  
  const results = await Promise.allSettled(feedPromises);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allFeeds.push(...result.value);
    }
  });
  
  // Sort by timestamp (newest first)
  allFeeds.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Update cache
  feedCache = {
    data: allFeeds,
    timestamp: Date.now(),
  };
  
  return allFeeds;
}

export function getFeedByCategory(feeds: ProtocolEvent[], category: string): ProtocolEvent[] {
  if (category === 'all') return feeds;
  return feeds.filter(item => item.category === category);
}

export function filterFeeds(
  feeds: ProtocolEvent[],
  filters: {
    category?: string;
    impact?: string[];
    searchQuery?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): ProtocolEvent[] {
  return feeds.filter(item => {
    // Category filter
    if (filters.category && filters.category !== 'all' && item.category !== filters.category) {
      return false;
    }
    
    // Impact filter (legacy compatibility)
    if (filters.impact && filters.impact.length > 0) {
      // Skip for now - protocol-native events don't use legacy impact strings
    }
    
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(query);
      const matchesContent = item.content.toLowerCase().includes(query);
      const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchesTitle && !matchesContent && !matchesTags) {
        return false;
      }
    }
    
    // Date range
    if (filters.dateFrom) {
      const itemDate = new Date(item.timestamp);
      const fromDate = new Date(filters.dateFrom);
      if (itemDate < fromDate) return false;
    }
    
    if (filters.dateTo) {
      const itemDate = new Date(item.timestamp);
      const toDate = new Date(filters.dateTo);
      if (itemDate > toDate) return false;
    }
    
    return true;
  });
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

export function getImpactColor(impact: string | number): string {
  // Handle legacy string impact
  if (typeof impact === 'string') {
    switch (impact) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  }
  // Handle numeric impact score
  if (impact >= 80) return 'bg-red-500';
  if (impact >= 60) return 'bg-orange-500';
  if (impact >= 40) return 'bg-yellow-500';
  return 'bg-blue-500';
}

export function getImpactBorderColor(impact: string): string {
  switch (impact) {
    case 'critical': return 'border-red-500/30';
    case 'high': return 'border-orange-500/30';
    case 'medium': return 'border-yellow-500/30';
    case 'low': return 'border-blue-500/30';
    default: return 'border-gray-500/30';
  }
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

export function getCategoryBgColor(category: string): string {
  switch (category) {
    case 'crypto_agents': return 'bg-yellow-400/10';
    case 'ai_models': return 'bg-purple-400/10';
    case 'tech_world': return 'bg-blue-400/10';
    case 'openclaw_tech': return 'bg-green-400/10';
    default: return 'bg-gray-400/10';
  }
}

export async function getFeedById(id: string): Promise<ProtocolEvent | null> {
  const feeds = await fetchAllFeeds();
  return feeds.find(feed => feed.id === id) || null;
}
