'use client';

import { useEffect, useState } from 'react';
import EventCard from './EventCard';

interface TrendingItem {
  id: string;
  title: string;
  source_type: string;
  score: number;
  rank: number;
  ageBadge: string;
  created_at: string;
  verification_status: string;
  verification_reason?: string;
}

interface TrendingMeta {
  reason?: string;
  message?: string;
  count: number;
  window: string;
}

export default function HotRightNow() {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [meta, setMeta] = useState<TrendingMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/trending')
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setMeta(data.meta || null);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const notEnoughSignals = meta?.reason === 'NOT_ENOUGH_SIGNALS';

  return (
    <div style={{
      padding: 20,
      background: '#111',
      borderRadius: 12,
      border: '1px solid #222'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16
      }}>
        <span style={{ fontSize: 16 }}>🔥</span>
        <h3 style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: '#fff'
        }}>
          Hot Right Now
        </h3>
        {!loading && items.length > 0 && (
          <span style={{
            marginLeft: 'auto',
            padding: '2px 8px',
            background: '#333',
            borderRadius: 4,
            fontSize: 11,
            color: '#888'
          }}>
            {items.length} items
          </span>
        )}
      </div>
      
      {loading && (
        <div style={{
          padding: 24,
          textAlign: 'center',
          color: '#666'
        }}>
          <p style={{ margin: 0, fontSize: 14 }}>Loading...</p>
        </div>
      )}
      
      {error && (
        <div style={{
          padding: 16,
          background: '#450a0a',
          borderRadius: 8,
          color: '#fca5a5',
          fontSize: 13
        }}>
          Error: {error}
        </div>
      )}
      
      {notEnoughSignals && (
        <div style={{
          padding: 24,
          textAlign: 'center',
          color: '#666'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#888' }}>
            Not enough verified signals yet
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
            Need at least 3 verified events in the last 7 days.
          </p>
          {meta && (
            <p style={{ margin: '8px 0 0 0', fontSize: 11, color: '#444' }}>
              Currently: {meta.count} / {meta.minRequired} required
            </p>
          )}
        </div>
      )}
      
      {!loading && !error && !notEnoughSignals && items.length === 0 && (
        <div style={{
          padding: 24,
          textAlign: 'center',
          color: '#666'
        }}>
          <p style={{ margin: 0, fontSize: 14 }}>No trending events</p>
        </div>
      )}
      
      {!loading && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => (
            <div key={item.id} style={{
              padding: 12,
              background: '#1a1a1a',
              borderRadius: 8,
              border: '1px solid #333'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8
              }}>
                <span style={{
                  width: 20,
                  height: 20,
                  background: '#2563eb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fff'
                }}>
                  {item.rank}
                </span>
                <span style={{
                  padding: '2px 6px',
                  background: '#2563eb33',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#60a5fa'
                }}>
                  {item.score}
                </span>
                {item.ageBadge === 'NEW' && (
                  <span style={{
                    padding: '2px 6px',
                    background: '#22c55e22',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#22c55e',
                    textTransform: 'uppercase'
                  }}>
                    NEW
                  </span>
                )}
              </div>
              <p style={{
                margin: 0,
                fontSize: 13,
                color: '#fff',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {item.title}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 8
              }}>
                <span style={{
                  fontSize: 11,
                  color: '#666'
                }}>
                  {item.source_type}
                </span>
                <span style={{
                  fontSize: 11,
                  color: '#444'
                }}>
                  •
                </span>
                <span style={{
                  fontSize: 11,
                  color: '#666'
                }}>
                  {Math.round(item.ageHours)}h ago
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid #222',
        fontSize: 10,
        color: '#444',
        textAlign: 'center'
      }}>
        {meta?.window ? `Last ${meta.window}` : 'Real-time signal'}
      </div>
    </div>
  );
}
