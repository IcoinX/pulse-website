import { FeedItem } from '@/types';

// In-memory cache for ISR
class FeedCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }
}

export const feedCache = new FeedCache();

// Helper to generate unique IDs
export function generateId(title: string): string {
  return `pulse-${Buffer.from(title).toString('base64').substring(0, 16).replace(/[^a-zA-Z0-9]/g, '')}`;
}

// Helper to sanitize HTML content
export function sanitizeContent(content: string): string {
  return content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper to extract image URL from content
export function extractImageUrl(content: string): string | undefined {
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
  return imgMatch ? imgMatch[1] : undefined;
}

// Helper to validate FeedItem
export function validateFeedItem(item: Partial<FeedItem>): item is FeedItem {
  return !!(
    item.id &&
    item.title &&
    item.content &&
    item.source &&
    item.sourceUrl &&
    item.category &&
    item.timestamp &&
    item.impact &&
    Array.isArray(item.tags)
  );
}
