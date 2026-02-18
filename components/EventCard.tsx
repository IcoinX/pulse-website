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
  agent_slug?: string;
  agent_symbol?: string;
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

// Verification badge - uses DB field directly
function VerificationBadge({ status, reason }: { status?: 'VERIFIED' | 'CHALLENGED' | 'UNVERIFIED'; reason?: string }) {
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

  const finalStatus = status || 'UNVERIFIED';
  const style = colors[finalStatus];
  const label = labels[finalStatus];

  return (
    <div 
      title={reason || 'Awaiting verification'}
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
        cursor: 'help'
      }}
    >
      {label}
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

export default function EventCard({ event }: EventCardProps) {
  // Use verification_status directly from DB
  const verificationStatus = event.verification_status || 'UNVERIFIED';

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
          <VerificationBadge 
            status={verificationStatus} 
            reason={event.verification_reason} 
          />
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

      {/* Agent info if available */}
      {(event.agent_slug || event.agent_symbol) && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px'
        }}>
          {event.agent_symbol && (
            <span style={{
              padding: '2px 8px',
              background: 'rgba(168, 85, 247, 0.1)',
              color: '#A855F7',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500
            }}>
              ${event.agent_symbol}
            </span>
          )}
          {event.agent_slug && (
            <span style={{
              fontSize: '12px',
              color: '#666'
            }}>
              {event.agent_slug}
            </span>
          )}
        </div>
      )}

      {/* Footer: ID only (no fake scores) */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid #222'
      }}>
        <span style={{ fontSize: '11px', color: '#666' }}>
          #{event.event_id}
        </span>
      </div>
    </div>
  );
}
