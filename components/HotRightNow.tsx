'use client';

import { useState, useEffect } from 'react';

interface HotItem {
  rank: number;
  title: string;
  score: number;
  change24h: number;
  id: string;
}

interface HotRightNowProps {
  minEvents?: number;
}

export default function HotRightNow({ minEvents = 5 }: HotRightNowProps) {
  const [items, setItems] = useState<HotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasEnoughData, setHasEnoughData] = useState(false);

  useEffect(() => {
    // Fetch trending items from API
    async function fetchTrending() {
      try {
        const response = await fetch('/api/trending');
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length >= minEvents) {
            setItems(data.items.slice(0, 5));
            setHasEnoughData(true);
          } else {
            setHasEnoughData(false);
          }
        } else {
          setHasEnoughData(false);
        }
      } catch (err) {
        setHasEnoughData(false);
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
  }, [minEvents]);

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        background: '#111',
        borderRadius: '12px',
        border: '1px solid #222'
      }}>
        <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!hasEnoughData) {
    return (
      <div style={{
        padding: '20px',
        background: '#111',
        borderRadius: '12px',
        border: '1px solid #222'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '16px' }}>🔥</span>
          <h3 style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: '#fff'
          }}>
            Hot Right Now
          </h3>
        </div>
        
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: '#666'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
            Warming up...
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>
            Not enough data yet
          </p>
        </div>
        
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #222',
          fontSize: '11px',
          color: '#555',
          textAlign: 'center'
        }}>
          Need {minEvents}+ verified events
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      background: '#111',
      borderRadius: '12px',
      border: '1px solid #222'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '16px' }}>🔥</span>
        <h3 style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: 600,
          color: '#fff'
        }}>
          Hot Right Now
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, index) => (
          <HotItem key={item.id} item={item} isLast={index === items.length - 1} />
        ))}
      </div>

      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #222',
        fontSize: '11px',
        color: '#666',
        textAlign: 'center'
      }}>
        Updated every 15 min
      </div>
    </div>
  );
}

function HotItem({ item, isLast }: { item: HotItem; isLast: boolean }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = item.score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= item.score) {
        setAnimatedScore(item.score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [item.score]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      borderBottom: isLast ? 'none' : '1px solid #222',
      cursor: 'pointer',
      transition: 'opacity 0.2s'
    }}
    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
    >
      <span style={{
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 700,
        color: item.rank <= 3 ? '#A855F7' : '#666',
        background: item.rank <= 3 ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
        borderRadius: '6px'
      }}>
        {item.rank}
      </span>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: '0 0 4px 0',
          fontSize: '13px',
          color: '#fff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {item.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '60px',
            height: '4px',
            background: '#222',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${animatedScore}%`,
              height: '100%',
              background: item.rank <= 3 ? '#A855F7' : '#666',
              borderRadius: '2px',
              transition: 'width 1s ease-out'
            }} />
          </div>
          <span style={{
            fontSize: '11px',
            color: item.change24h >= 0 ? '#22C55E' : '#EF4444',
            fontWeight: 500
          }}>
            {item.change24h >= 0 ? '↑' : '↓'} {Math.abs(item.change24h)}%
          </span>
        </div>
      </div>
    </div>
  );
}
