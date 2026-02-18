'use client';

import { useState, useEffect } from 'react';

interface TimeDisplayProps {
  timestamp: string;
}

export function TimeDisplay({ timestamp }: TimeDisplayProps) {
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
    const interval = setInterval(updateTime, 60000); // Update every minute
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

interface VerificationBadgeProps {
  status: 'VERIFIED' | 'CHALLENGED' | 'UNVERIFIED';
  reason?: string;
}

export function VerificationBadge({ status, reason }: VerificationBadgeProps) {
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

interface SourceBadgeProps {
  sourceType: string;
}

export function SourceBadge({ sourceType }: SourceBadgeProps) {
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

interface ImpactScoreProps {
  market?: number;
  narrative?: number;
  tech?: number;
}

export function ImpactScore({ market = 0, narrative = 0, tech = 0 }: ImpactScoreProps) {
  const maxScore = Math.max(market, narrative, tech);
  const getColor = (score: number) => {
    if (score >= 80) return '#EF4444';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#EAB308';
    return '#3B82F6';
  };

  return (
    <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
      {market > 0 && (
        <span style={{ color: getColor(market) }}>
          M:{market}
        </span>
      )}
      {narrative > 0 && (
        <span style={{ color: getColor(narrative) }}>
          N:{narrative}
        </span>
      )}
      {tech > 0 && (
        <span style={{ color: getColor(tech) }}>
          T:{tech}
        </span>
      )}
    </div>
  );
}

interface HotItemProps {
  rank: number;
  title: string;
  score: number;
  change24h: number;
}

export function HotItem({ rank, title, score, change24h }: HotItemProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 0',
      borderBottom: '1px solid #222'
    }}>
      <span style={{
        width: '20px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 700,
        color: rank <= 3 ? '#A855F7' : '#666'
      }}>
        {rank}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: '#fff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>Score: {score}</span>
          <span style={{
            fontSize: '11px',
            color: change24h >= 0 ? '#22C55E' : '#EF4444'
          }}>
            {change24h >= 0 ? '↑' : '↓'} {Math.abs(change24h)}%
          </span>
        </div>
      </div>
    </div>
  );
}
