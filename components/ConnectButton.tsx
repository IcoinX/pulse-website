'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Wallet {
  id: string;
  name: string;
  icon: string;
  installed: boolean;
  detect: () => boolean;
}

const WALLETS: Wallet[] = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    installed: false,
    detect: () => {
      if (typeof window === 'undefined') return false;
      const eth = (window as any).ethereum;
      const phantom = (window as any).phantom;
      // Phantom has isPhantom flag OR phantom.ethereum exists
      return !!(eth?.isPhantom || phantom?.ethereum);
    },
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    installed: false,
    detect: () => {
      if (typeof window === 'undefined') return false;
      const eth = (window as any).ethereum;
      // MetaMask ONLY if isMetaMask is true AND isPhantom is false/undefined
      // AND no phantom object exists
      const isPhantom = !!(eth?.isPhantom || (window as any).phantom?.ethereum);
      return !!(eth?.isMetaMask && !isPhantom);
    },
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    installed: false,
    detect: () => {
      if (typeof window === 'undefined') return false;
      const eth = (window as any).ethereum;
      return !!(eth?.isCoinbaseWallet);
    },
  },
  {
    id: 'brave',
    name: 'Brave Wallet',
    icon: '🦁',
    installed: false,
    detect: () => {
      if (typeof window === 'undefined') return false;
      const eth = (window as any).ethereum;
      return !!(eth?.isBraveWallet);
    },
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    installed: false,
    detect: () => {
      if (typeof window === 'undefined') return false;
      const eth = (window as any).ethereum;
      return !!(eth?.isRainbow);
    },
  },
  {
    id: 'injected',
    name: 'Browser Wallet',
    icon: '🔐',
    installed: false,
    detect: () => {
      if (typeof window === 'undefined') return false;
      const eth = (window as any).ethereum;
      return !!eth && !eth?.isMetaMask && !eth?.isPhantom;
    },
  },
];

export default function ConnectButton() {
  const { user, isLoading, isConnected, connect, disconnect } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>(WALLETS);
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    // Detect installed wallets
    const detectedWallets = WALLETS.map(w => ({
      ...w,
      installed: w.detect(),
    }));
    setWallets(detectedWallets);
    setDetected(true);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleWalletClick = async (walletId: string) => {
    setShowModal(false);
    await connect(walletId);
  };

  if (isLoading && !detected) {
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
    <>
      <button
        onClick={() => setShowModal(true)}
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

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#1a1a1a',
              borderRadius: '16px',
              padding: '24px',
              width: '360px',
              maxWidth: '90vw',
              border: '1px solid #333',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Connect Wallet</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {wallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletClick(wallet.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    background: wallet.installed ? '#222' : '#1a1a1a',
                    border: `1px solid ${wallet.installed ? '#444' : '#333'}`,
                    borderRadius: '10px',
                    cursor: wallet.installed ? 'pointer' : 'not-allowed',
                    opacity: wallet.installed ? 1 : 0.5,
                    transition: 'all 0.2s',
                  }}
                  disabled={!wallet.installed}
                >
                  <span style={{ fontSize: '24px' }}>{wallet.icon}</span>
                  <span style={{ color: '#fff', fontSize: '16px', fontWeight: 500 }}>
                    {wallet.name}
                  </span>
                  {wallet.installed && (
                    <span style={{ 
                      marginLeft: 'auto', 
                      fontSize: '12px', 
                      color: '#22C55E',
                      background: 'rgba(34, 197, 94, 0.1)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}>
                      Detected
                    </span>
                  )}
                  {!wallet.installed && wallet.id !== 'injected' && (
                    <span style={{ 
                      marginLeft: 'auto', 
                      fontSize: '12px', 
                      color: '#666',
                    }}>
                      Not installed
                    </span>
                  )}
                </button>
              ))}
            </div>

            <p style={{ 
              marginTop: '16px', 
              fontSize: '12px', 
              color: '#666', 
              textAlign: 'center' 
            }}>
              Install a wallet browser extension to connect
            </p>
          </div>
        </div>
      )}
    </>
  );
}
