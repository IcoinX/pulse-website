'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  TrendingUp, 
  BarChart3, 
  Newspaper, 
  X, 
  Check, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import type { Alert, AlertType } from '@/lib/alerts';
import { 
  getAlerts, 
  getUnreadCount, 
  markAlertAsRead, 
  markAllAlertsAsRead,
  clearOldAlerts,
  createTestAlerts
} from '@/lib/alerts';

interface AlertsPanelProps {
  onClose?: () => void;
  agentSlug?: string; // If provided, show only alerts for this agent
}

const ALERT_ICONS: Record<AlertType, typeof TrendingUp> = {
  PRICE_SPIKE: TrendingUp,
  VOLUME_SPIKE: BarChart3,
  NEW_EVENT: Newspaper
};

const ALERT_COLORS: Record<AlertType, { bg: string; text: string; border: string }> = {
  PRICE_SPIKE: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  VOLUME_SPIKE: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  NEW_EVENT: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' }
};

const SEVERITY_DOTS: Record<string, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢'
};

export default function AlertsPanel({ onClose, agentSlug }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTestButton, setShowTestButton] = useState(false);
  
  useEffect(() => {
    // Clean old alerts on mount
    clearOldAlerts();
    loadAlerts();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, [agentSlug]);
  
  function loadAlerts() {
    let allAlerts = getAlerts();
    
    // Filter by agent if specified
    if (agentSlug) {
      allAlerts = allAlerts.filter(a => a.agentSlug === agentSlug);
    }
    
    // Sort by timestamp (newest first)
    allAlerts.sort((a, b) => b.timestamp - a.timestamp);
    
    setAlerts(allAlerts);
    setUnreadCount(getUnreadCount());
  }
  
  function handleMarkRead(alertId: string, e: React.MouseEvent) {
    e.stopPropagation();
    markAlertAsRead(alertId);
    loadAlerts();
  }
  
  function handleMarkAllRead() {
    markAllAlertsAsRead();
    loadAlerts();
  }
  
  function handleCreateTestAlerts() {
    createTestAlerts();
    loadAlerts();
    setShowTestButton(false);
  }
  
  const unreadAlerts = alerts.filter(a => !a.read);
  const readAlerts = alerts.filter(a => a.read);
  
  if (alerts.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold">Alerts</h3>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No alerts yet</p>
          <p className="text-gray-600 text-xs mt-1">
            Watch agents to get price, volume & news alerts
          </p>
          
          {/* Hidden test button (triple-click to show) */}
          <div 
            className="mt-4 h-4" 
            onClick={() => setShowTestButton(!showTestButton)}
          />
          
          {showTestButton && (
            <button
              onClick={handleCreateTestAlerts}
              className="mt-2 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              🧪 Create test alerts
            </button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold">Alerts</h3>
          {unreadAlerts.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full">
              {unreadAlerts.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {unreadAlerts.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Check className="w-3 h-3" />
              Mark all read
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {/* Unread alerts */}
        {unreadAlerts.length > 0 && (
          <div className="p-2">
            {unreadAlerts.map(alert => (
              <AlertItem 
                key={alert.id} 
                alert={alert} 
                onMarkRead={(e) => handleMarkRead(alert.id, e)}
              />
            ))}
          </div>
        )}
        
        {/* Read alerts (collapsed) */}
        {readAlerts.length > 0 && (
          <div className="border-t border-white/10">
            <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide">
              Earlier ({readAlerts.length})
            </div>
            <div className="p-2 opacity-60">
              {readAlerts.slice(0, 5).map(alert => (
                <AlertItem 
                  key={alert.id} 
                  alert={alert}
                  compact
                />
              ))}
              {readAlerts.length > 5 && (
                <p className="text-center text-xs text-gray-600 py-2">
                  +{readAlerts.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertItem({ 
  alert, 
  onMarkRead, 
  compact = false 
}: { 
  alert: Alert; 
  onMarkRead?: (e: React.MouseEvent) => void;
  compact?: boolean;
}) {
  const Icon = ALERT_ICONS[alert.type];
  const colors = ALERT_COLORS[alert.type];
  const timeAgo = formatTimeAgo(alert.timestamp);
  
  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
        <Icon className={`w-3 h-3 ${colors.text}`} />
        <span className="text-xs text-gray-300 flex-1 truncate">{alert.message}</span>
        <span className="text-xs text-gray-500">{timeAgo}</span>
      </div>
    );
  }
  
  return (
    <Link href={`/agents/${alert.agentSlug}`}>
      <div className={`group flex items-start gap-3 p-3 mb-2 rounded-lg ${colors.bg} border ${colors.border} hover:opacity-80 transition-opacity`}>
        <div className={`p-2 rounded-lg bg-black/20 ${colors.text}`}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-400">{alert.agentSymbol}</span>
            <span className="text-xs">{SEVERITY_DOTS[alert.severity]}</span>
          </div>
          <p className="text-sm text-gray-200">{alert.message}</p>
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div>
        
        {onMarkRead && (
          <button
            onClick={onMarkRead}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Mark as read"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </Link>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// Compact alert badge for header
export function AlertBadge({ count }: { count: number }) {
  if (count === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-purple-500 text-white rounded-full">
      {count > 9 ? '9+' : count}
    </span>
  );
}
