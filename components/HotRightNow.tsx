'use client';

// Simplified version - no dynamic fetch to avoid hydration issues
export default function HotRightNow() {
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
        Need 5+ verified events
      </div>
    </div>
  );
}
