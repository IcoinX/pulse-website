'use client';

import { useState, useEffect } from 'react';

interface Event {
  event_id: number;
  title: string;
  summary?: string;
  source_type: string;
  status: string;
  created_at: string;
  verification_status?: 'VERIFIED' | 'CHALLENGED' | 'UNVERIFIED';
  verification_reason?: string;
  impact_market?: number;
  impact_narrative?: number;
  impact_tech?: number;
  validation_score?: number;
  source_count?: number;
}

interface EventCardProps {
  event: Event;
}

// Time display with "ago" format
function TimeDisplay({ timestamp }: { timestamp: string }) {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [fullDate, setFullDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const date = new Date(timestamp);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      let ago = '';
      if (seconds < 60) ago = 'just now';
      else if (seconds < 3600) ago = `${Math.floor(seconds / 60)}m ago`;
      else if (seconds < 86400) ago = `${Math.floor(seconds / 3600)}h ago`;
      else if (seconds < 604800) ago = `${Math.floor(seconds / 86400)}d ago`;
      else ago = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      setTimeAgo(ago);
      setFullDate(date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888' }}>
      <span style={{ color: '#22C55E', fontWeight: 500 }}>{timeAgo}</span>
      <span style={{ color: '#555' }}>•</span>
      <span>{fullDate}</span>
    </div>
  );
}

// Verification badge
function VerificationBadge({ status, reason }: { status: 'VERIFIED' | 'CHALLENGED' | 'UNVERIFIED'; reason?: string }) {
  const colors = {
    VERIFIED: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
    CHALLENGED: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
    UNVERIFIED: { bg: 'rgba(100, 100, 100, 0.1)', text: '#888', border: 'rgba(100, 100, 100, 0.3)' }
  };

  const labels = {
    VERIFIED: '✓ Verified',
    CHALLENGED: '⚠ Challenged',
    UNVERIFIED: '○ Unverified'
  };

  const style = colors[status];

  return (
    <div 
      title={reason}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 500,
        cursor: reason ? 'help' : 'default'
      }}
    >
      {labels[status]}
    </div>
  );
}

// Source type badge
function SourceBadge({ sourceType }: { sourceType: string }) {
  const icons: Record<string, string> = {
    'ONCHAIN': '⛓️',
    'GITHUB': '⚡',
    'X': '𝕏',
    'MEDIA': '📰',
    'AGENT': '🤖'
  };

  const labels: Record<string, string> = {
    'ONCHAIN': 'On-chain',
    'GITHUB': 'GitHub',
    'X': 'X/Twitter',
    'MEDIA': 'Media',
    'AGENT': 'Agent'
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 8px',
      background: 'rgba(100, 100, 100, 0.1)',
      borderRadius: '4px',
      fontSize: '11px',
      color: '#888'
    }}>
      {icons[sourceType] || '📄'} {labels[sourceType] || sourceType}
    </span>
  );
}

// Impact score display
function ImpactScore({ market = 0, narrative = 0, tech = 0 }: { market?: number; narrative?: number; tech?: number }) {
  const getColor = (score: number) => {
    if (score >= 80) return '#EF4444';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#EAB308';
    return '#3B82F6';
  };

  return (
    <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
      {market > 0 && (
        <span style={{ color: getColor(market) }}>M:{market}</span>
      )}
      {narrative > 0 && (
        <span style={{ color: getColor(narrative) }}>N:{narrative}</span>
      )}
      {tech > 0 && (
        <span style={{ color: getColor(tech) }}>T:{tech}</span>
      )}
    </div>
  );
}

export default function EventCard({ event }: EventCardProps) {
  // Determine verification status from event data
  const getVerificationStatus = (): { status: 'VERIFIED' | 'CHALLENGED' | 'UNVERIFIED'; reason: string } => {
    if (event.status === 'challenged') {
      return { status: 'CHALLENGED', reason: 'Under dispute - validator review pending' };
    }
    if (event.source_count && event.source_count >= 2 && (event.validation_score || 0) >= 75) {
      return { status: 'VERIFIED', reason: `${event.source_count} sources + high score` };
    }
    if ((event.validation_score || 0) >= 85) {
      return { status: 'VERIFIED', reason: 'High confidence - protocol verified' };
    }
    return { status: 'UNVERIFIED', reason: 'Awaiting additional validation' };
  };

  const verification = getVerificationStatus();

  // Get status color
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'verified':
        return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' };
      case 'challenged':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' };
      case 'pending':
        return { bg: 'rgba(100, 100, 100, 0.1)', text: '#888', border: 'rgba(100, 100, 100, 0.3)' };
      default:
        return { bg: 'rgba(100, 100, 100, 0.1)', text: '#888', border: 'rgba(100, 100, 100, 0.3)' };
    }
  };

  const statusStyle = getStatusStyle(event.status);

  return (
    <div style={{
      background: '#111',
      borderRadius: '12px',
      border: '1px solid #222',
      padding: '16px',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#333';
      e.currentTarget.style.background = '#1a1a1a';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#222';
      e.currentTarget.style.background = '#111';
    }}
    >
      {/* Header: Time + Badges */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <TimeDisplay timestamp={event.created_at} />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <VerificationBadge status={verification.status} reason={verification.reason} />
          <SourceBadge sourceType={event.source_type} />
          <span style={{
            padding: '3px 10px',
            background: statusStyle.bg,
            color: statusStyle.text,
            border: `1px solid ${statusStyle.border}`,
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'capitalize'
          }}>
            {event.status}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 style={{
        margin: '0 0 8px 0',
        fontSize: '15px',
        fontWeight: 600,
        color: '#fff',
        lineHeight: 1.4
      }}>
        {event.title}
      </h3>

      {/* Summary if exists */}
      {event.summary && (
        <p style={{
          margin: '0 0 12px 0',
          fontSize: '13px',
          color: '#888',
          lineHeight: 1.5
        }}>
          {event.summary}
        </p>
      )}

      {/* Footer: Impact + Meta */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid #222'
      }}>
        <ImpactScore 
          market={event.impact_market} 
          narrative={event.impact_narrative} 
          tech={event.impact_tech} 
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#666' }}>
          {event.validation_score ? (
            <span>Score: {event.validation_score}</span>
          ) : null}
          {event.source_count ? (
            <span>Sources: {event.source_count}</span>
          ) : null}
          <span>#{event.event_id}</span>
        </div>
      </div>
    </div>
  );
}
