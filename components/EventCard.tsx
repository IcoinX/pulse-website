import Link from 'next/link';
import VerificationBadge, { type VerificationStatus } from './VerificationBadge';
import SignalBadge, { parseSignalsFromReason } from './SignalBadge';

interface Event {
  event_id: number;
  title: string;
  source_type: string;
  status: string;
  chain_id?: number;
  created_at: string;
  verification_status?: VerificationStatus;
  verification_reason?: string;
  verified_at?: string;
  verified_by?: string;
  agent_origin?: 'VIRTUALS' | 'BANKR' | 'CLANKER' | 'NATIVE' | 'NARRATIVE' | 'CONVERGENCE' | null;
}

interface EventCardProps {
  event: Event;
  showScore?: boolean;
  score?: number;
}

// Format relative time (e.g., "19h ago")
function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1d ago';
  return `${diffDays}d ago`;
}

// Format absolute time (e.g., "Feb 17, 01:09 PM UTC")
function getAbsoluteTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: true
  }) + ' UTC';
}

// Get age badge (NEW or Established)
function getAgeBadge(dateStr: string): { text: string; color: string } | null {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  
  if (diffDays < 7) {
    return { text: 'NEW', color: '#22c55e' }; // Green
  }
  return null;
}

export default function EventCard({ event, showScore, score }: EventCardProps) {
  const icons: Record<string, string> = {
    'AGENT': '🤖',
    'AI': '🧠',
    'ONCHAIN': '⛓️',
    'CRYPTO': '₿',
    'MEDIA': '📰',
    'GITHUB': '💻',
    'X': '🐦',
    'GENESIS': '🔷'
  };

  const statusColors: Record<string, string> = {
    'PENDING': '#fbbf24',
    'CHALLENGED': '#f87171',
    'VERIFIED': '#34d399',
    'REJECTED': '#9ca3af'
  };

  const verifStatus = event.verification_status || 'PENDING';
  const relativeTime = getRelativeTime(event.created_at);
  const absoluteTime = getAbsoluteTime(event.created_at);
  const ageBadge = getAgeBadge(event.created_at);
  
  // Parse signals from verification_reason
  const signals = parseSignalsFromReason(event.verification_reason);

  return (
    <Link 
      href={`/events/${event.event_id}`}
      style={{ textDecoration: 'none' }}
    >
      <div className="event-card" style={{
        padding: 20,
        background: '#111',
        borderRadius: 12,
        border: '1px solid #222',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>{icons[event.source_type] || '📋'}</span>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: 16, 
              fontWeight: 600,
              color: '#fff',
              lineHeight: 1.4
            }}>
              {event.title}
            </h3>
          </div>
          
          {/* Convergence Score Badge (if available) */}
          {signals.convergence && (
            <SignalBadge
              type="convergence"
              value={signals.convergence.score}
              tooltip={`V/M/S/N → ${signals.convergence.score.toFixed(1)} (${signals.convergence.class})`}
            />
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            padding: '4px 10px',
            background: '#1a1a1a',
            borderRadius: 6,
            fontSize: 12,
            color: '#888',
            fontFamily: 'monospace'
          }}>
            #{event.event_id}
          </span>
          
          <span style={{
            padding: '4px 10px',
            background: '#1a1a1a',
            borderRadius: 6,
            fontSize: 12,
            color: '#888'
          }}>
            {event.source_type}
          </span>
          
          {/* Origin Badge */}
          {event.agent_origin && (
            <span style={{
              padding: '4px 10px',
              background: event.agent_origin === 'VIRTUALS' ? '#8b5cf622' : 
                         event.agent_origin === 'BANKR' ? '#22c55e22' : 
                         event.agent_origin === 'CLANKER' ? '#f59e0b22' : 
                         event.agent_origin === 'CONVERGENCE' ? '#ec489922' :
                         event.agent_origin === 'NARRATIVE' ? '#a855f722' : '#1a1a1a',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              color: event.agent_origin === 'VIRTUALS' ? '#8b5cf6' : 
                     event.agent_origin === 'BANKR' ? '#22c55e' : 
                     event.agent_origin === 'CLANKER' ? '#f59e0b' : 
                     event.agent_origin === 'CONVERGENCE' ? '#ec4899' :
                     event.agent_origin === 'NARRATIVE' ? '#a855f7' : '#888',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {event.agent_origin}
            </span>
          )}
          
          {/* Verification Badge */}
          <div style={{ display: 'inline-flex' }}>
            <VerificationBadge 
              status={verifStatus}
              reason={event.verification_reason}
              verifiedBy={event.verified_by}
              size="sm"
            />
          </div>
          
          {/* Age Badge */}
          {ageBadge && (
            <span style={{
              padding: '4px 10px',
              background: `${ageBadge.color}22`,
              borderRadius: 6,
              fontSize: 12,
              color: ageBadge.color,
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {ageBadge.text}
            </span>
          )}
          
          {/* Timestamp */}
          <span 
            style={{ 
              fontSize: 12, 
              color: '#666', 
              marginLeft: 'auto',
              cursor: 'help'
            }}
            title={absoluteTime}
          >
            {relativeTime}
          </span>
        </div>
        
        {/* Signal Badges Row (Market/Smart/Narrative) */}
        {(signals.market || signals.smart || signals.narrative) && (
          <div style={{ 
            display: 'flex', 
            gap: 6, 
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid #222'
          }}>
            {signals.market && (
              <SignalBadge 
                type="market" 
                strength={signals.market.strength}
                tooltip={`Market: ${signals.market.strength} strength`}
              />
            )}
            {signals.smart && (
              <SignalBadge 
                type="smart" 
                strength={signals.smart.strength}
                tooltip={`Smart money: ${signals.smart.strength}`}
              />
            )}
            {signals.narrative && (
              <SignalBadge 
                type="narrative" 
                strength={signals.narrative.strength}
                tooltip={`Narrative: ${signals.narrative.strength} (${signals.narrative.velocity || 0}% velocity)`}
              />
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
