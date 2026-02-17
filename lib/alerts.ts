// Alert system for PULSE Protocol Watchlist
// Client-side only, zero noise, useful signals

export type AlertType = 'PRICE_SPIKE' | 'VOLUME_SPIKE' | 'NEW_EVENT';

export interface Alert {
  id: string;
  type: AlertType;
  agentSlug: string;
  agentSymbol: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp: number;
  data?: {
    priceChange?: number;
    volumeRatio?: number;
    eventId?: number;
    eventTitle?: string;
  };
  read: boolean;
}

export interface AlertConfig {
  priceSpikeThreshold: number;  // % change (default: 10)
  volumeSpikeMultiplier: number; // × median (default: 2)
  cooldownMs: number;           // ms between same alerts (default: 6h = 21600000)
}

const DEFAULT_CONFIG: AlertConfig = {
  priceSpikeThreshold: 10,
  volumeSpikeMultiplier: 2,
  cooldownMs: 6 * 60 * 60 * 1000 // 6 hours
};

// Storage keys
const STORAGE_KEYS = {
  WATCHLIST: 'pulse_watchlist',
  LAST_SEEN_EVENTS: 'pulse_last_seen_events',
  LAST_ALERT_SENT: 'pulse_last_alert_sent',
  ALERTS: 'pulse_alerts'
};

// ==================== STORAGE HELPERS ====================

function getWatchlist(): string[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
}

function getLastSeenEvents(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_SEEN_EVENTS) || '{}');
}

function setLastSeenEvent(slug: string, timestamp: number) {
  const current = getLastSeenEvents();
  current[slug] = timestamp;
  localStorage.setItem(STORAGE_KEYS.LAST_SEEN_EVENTS, JSON.stringify(current));
}

function getLastAlertSent(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_ALERT_SENT) || '{}');
}

function setLastAlertSent(alertKey: string, timestamp: number) {
  const current = getLastAlertSent();
  current[alertKey] = timestamp;
  localStorage.setItem(STORAGE_KEYS.LAST_ALERT_SENT, JSON.stringify(current));
}

export function getAlerts(): Alert[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALERTS) || '[]');
}

export function saveAlerts(alerts: Alert[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
}

export function markAlertAsRead(alertId: string) {
  const alerts = getAlerts();
  const updated = alerts.map(a => a.id === alertId ? { ...a, read: true } : a);
  saveAlerts(updated);
}

export function markAllAlertsAsRead() {
  const alerts = getAlerts();
  const updated = alerts.map(a => ({ ...a, read: true }));
  saveAlerts(updated);
}

export function getUnreadCount(): number {
  return getAlerts().filter(a => !a.read).length;
}

export function getUnreadCountForAgent(slug: string): number {
  return getAlerts().filter(a => !a.read && a.agentSlug === slug).length;
}

export function clearOldAlerts(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000) {
  const alerts = getAlerts();
  const cutoff = Date.now() - maxAgeMs;
  const filtered = alerts.filter(a => a.timestamp > cutoff);
  saveAlerts(filtered);
}

// ==================== ALERT DETECTION ====================

interface AgentData {
  slug: string;
  symbol: string;
  priceChange24h: number;
  volume24h: number;
  volumeHistory?: number[]; // Last 7 days or 24 points
}

interface AgentEvent {
  event_id: number;
  title: string;
  created_at: string;
  agent_slug: string;
}

function isOnCooldown(alertKey: string, cooldownMs: number): boolean {
  const lastSent = getLastAlertSent();
  const lastTime = lastSent[alertKey] || 0;
  return (Date.now() - lastTime) < cooldownMs;
}

function generateAlertId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Detect price spike alerts
function detectPriceSpikeAlerts(
  watchedAgents: AgentData[],
  config: AlertConfig
): Alert[] {
  const alerts: Alert[] = [];
  
  for (const agent of watchedAgents) {
    const change = Math.abs(agent.priceChange24h);
    if (change >= config.priceSpikeThreshold) {
      const alertKey = `price-${agent.slug}`;
      
      // Anti-spam: check cooldown
      if (isOnCooldown(alertKey, config.cooldownMs)) {
        continue;
      }
      
      const isPositive = agent.priceChange24h > 0;
      const alert: Alert = {
        id: generateAlertId(),
        type: 'PRICE_SPIKE',
        agentSlug: agent.slug,
        agentSymbol: agent.symbol,
        severity: change >= 20 ? 'high' : change >= 15 ? 'medium' : 'low',
        message: `${agent.symbol} ${isPositive ? '↗️' : '↘️'} ${agent.priceChange24h > 0 ? '+' : ''}${agent.priceChange24h.toFixed(1)}% in 24h`,
        timestamp: Date.now(),
        data: { priceChange: agent.priceChange24h },
        read: false
      };
      
      alerts.push(alert);
      setLastAlertSent(alertKey, Date.now());
    }
  }
  
  return alerts;
}

// Detect volume spike alerts
function detectVolumeSpikeAlerts(
  watchedAgents: AgentData[],
  config: AlertConfig
): Alert[] {
  const alerts: Alert[] = [];
  
  for (const agent of watchedAgents) {
    const history = agent.volumeHistory || [];
    if (history.length === 0) continue;
    
    // Calculate median or average
    let baseline: number;
    if (history.length >= 7) {
      // Use median of last 7 days
      const sorted = [...history].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      baseline = sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    } else {
      // Fallback: average of available points
      baseline = history.reduce((a, b) => a + b, 0) / history.length;
    }
    
    if (baseline === 0) continue;
    
    const ratio = agent.volume24h / baseline;
    if (ratio >= config.volumeSpikeMultiplier) {
      const alertKey = `volume-${agent.slug}`;
      
      // Anti-spam: check cooldown
      if (isOnCooldown(alertKey, config.cooldownMs)) {
        continue;
      }
      
      const alert: Alert = {
        id: generateAlertId(),
        type: 'VOLUME_SPIKE',
        agentSlug: agent.slug,
        agentSymbol: agent.symbol,
        severity: ratio >= 5 ? 'high' : ratio >= 3 ? 'medium' : 'low',
        message: `${agent.symbol} 📊 Volume ${ratio.toFixed(1)}× normal (24h)`,
        timestamp: Date.now(),
        data: { volumeRatio: ratio },
        read: false
      };
      
      alerts.push(alert);
      setLastAlertSent(alertKey, Date.now());
    }
  }
  
  return alerts;
}

// Detect new event alerts
function detectNewEventAlerts(
  watchedSlugs: string[],
  latestEvents: AgentEvent[]
): Alert[] {
  const alerts: Alert[] = [];
  const lastSeen = getLastSeenEvents();
  
  for (const event of latestEvents) {
    if (!watchedSlugs.includes(event.agent_slug)) continue;
    
    const eventTime = new Date(event.created_at).getTime();
    const lastSeenTime = lastSeen[event.agent_slug] || 0;
    
    // Only alert for events newer than last seen
    if (eventTime > lastSeenTime) {
      const alertKey = `event-${event.agent_slug}-${event.event_id}`;
      
      // Anti-spam: already alerted for this event?
      if (isOnCooldown(alertKey, 0)) {
        continue;
      }
      
      const alert: Alert = {
        id: generateAlertId(),
        type: 'NEW_EVENT',
        agentSlug: event.agent_slug,
        agentSymbol: event.agent_slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
        severity: 'medium',
        message: `📰 New event: "${event.title.substring(0, 60)}${event.title.length > 60 ? '...' : ''}"`,
        timestamp: Date.now(),
        data: { eventId: event.event_id, eventTitle: event.title },
        read: false
      };
      
      alerts.push(alert);
      setLastAlertSent(alertKey, Date.now());
      
      // Update last seen for this agent
      setLastSeenEvent(event.agent_slug, eventTime);
    }
  }
  
  return alerts;
}

// ==================== MAIN COMPUTE FUNCTION ====================

export function computeAlerts(
  watchedAgents: AgentData[],
  latestEvents: AgentEvent[],
  config: Partial<AlertConfig> = {}
): Alert[] {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const watchlist = getWatchlist();
  
  // Filter to only watched agents
  const watchedData = watchedAgents.filter(a => watchlist.includes(a.slug));
  
  // Detect all alert types
  const priceAlerts = detectPriceSpikeAlerts(watchedData, fullConfig);
  const volumeAlerts = detectVolumeSpikeAlerts(watchedData, fullConfig);
  const eventAlerts = detectNewEventAlerts(watchlist, latestEvents);
  
  // Combine and save
  const newAlerts = [...priceAlerts, ...volumeAlerts, ...eventAlerts];
  
  if (newAlerts.length > 0) {
    const existing = getAlerts();
    const combined = [...newAlerts, ...existing].slice(0, 100); // Keep last 100
    saveAlerts(combined);
  }
  
  return newAlerts;
}

// ==================== TEST HELPERS ====================

export function createTestAlerts(): Alert[] {
  const testAlerts: Alert[] = [
    {
      id: generateAlertId(),
      type: 'PRICE_SPIKE',
      agentSlug: 'aixbt',
      agentSymbol: 'AIXBT',
      severity: 'high',
      message: 'AIXBT ↗️ +15.2% in 24h',
      timestamp: Date.now() - 1000 * 60 * 30, // 30 min ago
      data: { priceChange: 15.2 },
      read: false
    },
    {
      id: generateAlertId(),
      type: 'VOLUME_SPIKE',
      agentSlug: 'virtuals-protocol',
      agentSymbol: 'VIRTUAL',
      severity: 'medium',
      message: 'VIRTUAL 📊 Volume 3.2× normal (24h)',
      timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2h ago
      data: { volumeRatio: 3.2 },
      read: false
    },
    {
      id: generateAlertId(),
      type: 'NEW_EVENT',
      agentSlug: 'luna-agent',
      agentSymbol: 'LUNA',
      severity: 'low',
      message: '📰 New event: "Luna Agent partners with top DeFi protocol..."',
      timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4h ago
      data: { eventId: 12345, eventTitle: 'Luna Agent partners with top DeFi protocol' },
      read: true
    }
  ];
  
  saveAlerts(testAlerts);
  return testAlerts;
}

export default {
  computeAlerts,
  getAlerts,
  saveAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  getUnreadCount,
  getUnreadCountForAgent,
  clearOldAlerts,
  createTestAlerts,
  STORAGE_KEYS
};
