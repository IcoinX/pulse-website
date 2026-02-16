import { ProtocolEvent, TrendingTopic, TopAgent } from '@/types';
import { protocolEvents, trendingTopics, topAgents, formatTimeAgo, getEventById, getEventsByCategory } from './data';

// Re-export for backward compatibility
export {
  protocolEvents as mockFeeds,
  protocolEvents,
  trendingTopics,
  topAgents,
  formatTimeAgo,
  getEventById,
  getEventsByCategory,
  getEventsByCategory as getFeedByCategory,
};

// Legacy type alias
export type FeedItem = ProtocolEvent;

// Legacy compatibility functions
export function getFeedById(id: string): ProtocolEvent | undefined {
  return getEventById(id);
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
