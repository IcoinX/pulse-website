import Link from 'next/link';
import { VerificationBadge, type VerificationStatus } from './VerificationBadge';

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
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
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

  // Use verification_status if available, fallback to old status
  const verifStatus = event.verification_status || 'PENDING';

  return (
    <Link 
      href={`/events/${event.event_id}`}
      style={{ textDecoration: 'none' }}
    >
      <div style={{
        padding: 20,
        background: '#111',
        borderRadius: 12,
        border: '1px solid #222',
        cursor: 'pointer',
        transition: 'all 0.2s',
        ':hover': {
          borderColor: '#333'
        }
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
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
          
          {/* Verification Badge */}
          <div style={{ display: 'inline-flex' }}>
            <VerificationBadge 
              status={verifStatus}
              reason={event.verification_reason}
              verifiedBy={event.verified_by}
              size="sm"
            />
          </div>
          
          {/* Legacy status badge (if different from verification) */}
          {event.status !== 'PENDING' && event.status !== verifStatus && (
            <span style={{
              padding: '4px 10px',
              background: `${statusColors[event.status]}22`,
              borderRadius: 6,
              fontSize: 12,
              color: statusColors[event.status] || '#888',
              fontWeight: 500
            }}>
              {event.status}
            </span>
          )}
          
          <span style={{ fontSize: 12, color: '#666', marginLeft: 'auto' }}>
            {new Date(event.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
