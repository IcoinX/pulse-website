'use client';

import { useAuth } from '@/hooks/useAuth';

export default function ConnectButton() {
  const { user, isLoading, isConnected, connect, disconnect } = useAuth();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <button
        disabled
        style={{
          padding: '10px 16px',
          background: '#374151',
          color: '#9CA3AF',
          borderRadius: '8px',
          border: 'none',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'not-allowed'
        }}
      >
        Loading...
      </button>
    );
  }

  if (isConnected && user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '8px'
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              background: '#22C55E',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}
          />
          <span style={{ color: '#4ADE80', fontSize: '14px', fontFamily: 'monospace' }}>
            {formatAddress(user.wallet_address)}
          </span>
        </div>
        <button
          onClick={disconnect}
          style={{
            padding: '8px 12px',
            color: '#9CA3AF',
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      style={{
        padding: '12px 24px',
        background: '#2563EB',
        color: '#FFFFFF',
        borderRadius: '8px',
        border: 'none',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#3B82F6';
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#2563EB';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      🔌 Connect Wallet
    </button>
  );
}
