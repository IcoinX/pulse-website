import { useState, useEffect } from 'react';

interface AlertStatus {
  lastCheck: string;
  alertsSent: number;
  blockedCount: number;
  lastAlert: {
    token: string;
    score: number;
    class: string;
    sentAt: string;
  } | null;
}

interface BlockedSignal {
  tokenKey: string;
  reason: string;
  details: string;
}

export default function AlertsPanel() {
  const [status, setStatus] = useState<AlertStatus | null>(null);
  const [recentBlocked, setRecentBlocked] = useState<BlockedSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from state file (in real app, this would be an API endpoint)
    fetch('/api/alerts-status')
      .then(r => r.json())
      .then(data => {
        setStatus(data.status);
        setRecentBlocked(data.blocked || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      'score_too_low': { text: 'LOW SCORE', color: '#6b7280' },
      'no_market_confirm': { text: 'NO MARKET', color: '#f59e0b' },
      'low_liquidity': { text: 'LOW LIQ', color: '#ef4444' },
      'cooldown': { text: 'COOLDOWN', color: '#3b82f6' }
    };
    return labels[reason] || { text: reason.toUpperCase(), color: '#6b7280' };
  };

  if (loading) {
    return (
      <div style={{ padding: 20, background: '#111', borderRadius: 12, border: '1px solid #222' }}>
        <div style={{ color: '#666', fontSize: 14 }}>Loading alerts status...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 20, 
      background: '#111', 
      borderRadius: 12, 
      border: '1px solid #222',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>🚨</span>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>
          Telegram Alerts
        </h3>
        <span style={{ 
          padding: '2px 8px', 
          background: '#22c55e22', 
          borderRadius: 4, 
          fontSize: 11, 
          color: '#22c55e',
          marginLeft: 'auto'
        }}>
          ACTIVE
        </span>
      </div>

      {status && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          <div style={{ textAlign: 'center', padding: 12, background: '#1a1a1a', borderRadius: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{status.alertsSent}</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Alerts Sent</div>
          </div>
          <div style={{ textAlign: 'center', padding: 12, background: '#1a1a1a', borderRadius: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{status.blockedCount || 0}</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Blocked</div>
          </div>
          <div style={{ textAlign: 'center', padding: 12, background: '#1a1a1a', borderRadius: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>
              {status.lastCheck ? formatTime(status.lastCheck) : '—'}
            </div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Last Check</div>
          </div>
        </div>
      )}

      {status?.lastAlert && (
        <div style={{ 
          padding: 12, 
          background: '#22c55e11', 
          borderRadius: 8, 
          border: '1px solid #22c55e33',
          marginBottom: 16
        }}>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>LAST ALERT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
              {status.lastAlert.token.toUpperCase()}
            </span>
            <span style={{ 
              padding: '2px 8px', 
              background: '#22c55e33', 
              borderRadius: 4, 
              fontSize: 12, 
              color: '#22c55e',
              fontWeight: 600
            }}>
              {status.lastAlert.score.toFixed(1)} {status.lastAlert.class}
            </span>
            <span style={{ fontSize: 12, color: '#666', marginLeft: 'auto' }}>
              {formatTime(status.lastAlert.sentAt)}
            </span>
          </div>
        </div>
      )}

      {recentBlocked.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>RECENT BLOCKED</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentBlocked.slice(0, 5).map((blocked, i) => {
              const reason = getReasonLabel(blocked.reason);
              return (
                <div 
                  key={i}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    padding: '8px 12px',
                    background: '#1a1a1a',
                    borderRadius: 6
                  }}
                >
                  <span style={{ fontSize: 12, color: '#888', fontFamily: 'monospace' }}>
                    {blocked.tokenKey}
                  </span>
                  <span style={{ 
                    padding: '2px 6px', 
                    background: `${reason.color}22`, 
                    borderRadius: 4, 
                    fontSize: 10, 
                    color: reason.color,
                    fontWeight: 600
                  }}>
                    {reason.text}
                  </span>
                  <span style={{ fontSize: 11, color: '#666', marginLeft: 'auto' }}>
                    {blocked.details.substring(0, 25)}...
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #222' }}>
        <div style={{ fontSize: 11, color: '#666' }}>
          Gating: ≥7.0 STRONG + market + $50k liq • Cooldown: 60min • Escalation: +2.0
        </div>
      </div>
    </div>
  );
}
