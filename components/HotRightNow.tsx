'use client';

export default function HotRightNow() {
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
      </div>
      
      <div style={{
        padding: 24,
        textAlign: 'center',
        color: '#666'
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: 14 }}>
          Warming up...
        </p>
        <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
          Not enough data yet
        </p>
      </div>
      
      <div style={{
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid #222',
        fontSize: 11,
        color: '#555',
        textAlign: 'center'
      }}>
        Need 5+ verified events
      </div>
    </div>
  );
}
