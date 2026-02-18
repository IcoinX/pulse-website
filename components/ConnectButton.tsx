'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  provider?: any;
  detected: boolean;
  isWalletConnect?: boolean;
}

// Detect all available wallets
function detectWallets(): { detected: WalletOption[]; all: WalletOption[] } {
  if (typeof window === 'undefined') return { detected: [], all: [] };
  
  const w = window as any;
  const detectedWallets: WalletOption[] = [];
  const seen = new Set<string>();
  
  // Check for EIP-5749 providers array
  const providers = w.ethereum?.providers || [];
  
  providers.forEach((provider: any) => {
    if (provider.isPhantom && !seen.has('phantom')) {
      detectedWallets.push({ id: 'phantom', name: 'Phantom', icon: '👻', provider, detected: true });
      seen.add('phantom');
    } else if (provider.isMetaMask && !provider.isPhantom && !seen.has('metamask')) {
      detectedWallets.push({ id: 'metamask', name: 'MetaMask', icon: '🦊', provider, detected: true });
      seen.add('metamask');
    } else if (provider.isCoinbaseWallet && !seen.has('coinbase')) {
      detectedWallets.push({ id: 'coinbase', name: 'Coinbase', icon: '🔵', provider, detected: true });
      seen.add('coinbase');
    }
  });
  
  // Check window.phantom.ethereum
  if (w.phantom?.ethereum && !seen.has('phantom')) {
    detectedWallets.push({ id: 'phantom', name: 'Phantom', icon: '👻', provider: w.phantom.ethereum, detected: true });
    seen.add('phantom');
  }
  
  // Check main window.ethereum
  if (w.ethereum && !seen.has('metamask') && w.ethereum.isMetaMask && !w.ethereum.isPhantom) {
    detectedWallets.push({ id: 'metamask', name: 'MetaMask', icon: '🦊', provider: w.ethereum, detected: true });
    seen.add('metamask');
  }
  if (w.ethereum && !seen.has('phantom') && w.ethereum.isPhantom) {
    detectedWallets.push({ id: 'phantom', name: 'Phantom', icon: '👻', provider: w.ethereum, detected: true });
    seen.add('phantom');
  }
  
  // Build complete list
  const allWallets: WalletOption[] = [
    detectedWallets.find(w => w.id === 'phantom') || 
      { id: 'phantom', name: 'Phantom', icon: '👻', detected: false },
    detectedWallets.find(w => w.id === 'metamask') || 
      { id: 'metamask', name: 'MetaMask', icon: '🦊', detected: false },
    detectedWallets.find(w => w.id === 'coinbase') || 
      { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', detected: false },
    // WalletConnect - always available
    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', detected: true, isWalletConnect: true },
  ];
  
  return { detected: detectedWallets, all: allWallets };
}

export default function ConnectButton() {
  const { user, isLoading, isConnected, connectWithProvider, connectViaWalletConnect, disconnect } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [detectedCount, setDetectedCount] = useState(0);
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [ready, setReady] = useState(false);
  const [isConnectingWC, setIsConnectingWC] = useState(false);

  useEffect(() => {
    const { detected, all } = detectWallets();
    setDetectedCount(detected.length);
    setWallets(all);
    setReady(true);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleWalletClick = useCallback(async (wallet: WalletOption) => {
    if (wallet.isWalletConnect) {
      setIsConnectingWC(true);
      try {
        await connectViaWalletConnect();
        setShowModal(false);
      } catch (err) {
        console.error('WalletConnect error:', err);
      } finally {
        setIsConnectingWC(false);
      }
    } else if (wallet.detected && wallet.provider) {
      setShowModal(false);
      await connectWithProvider(wallet.provider);
    }
  }, [connectWithProvider, connectViaWalletConnect]);

  if (isLoading && !ready) {
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
          onClick={() => !isConnectingWC && setShowModal(false)}
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
              <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>
                {isConnectingWC ? 'Connecting...' : 'Connect Wallet'}
              </h3>
              {!isConnectingWC && (
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
              )}
            </div>

            {isConnectingWC ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  border: '3px solid #333',
                  borderTop: '3px solid #3B82F6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px'
                }} />
                <p style={{ color: '#888', fontSize: '14px' }}>
                  Check your wallet app for the connection request...
                </p>
                <style jsx>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleWalletClick(wallet)}
                      disabled={!wallet.detected && !wallet.isWalletConnect}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        background: wallet.detected || wallet.isWalletConnect ? '#222' : '#1a1a1a',
                        border: `1px solid ${wallet.detected || wallet.isWalletConnect ? '#444' : '#333'}`,
                        borderRadius: '10px',
                        cursor: wallet.detected || wallet.isWalletConnect ? 'pointer' : 'not-allowed',
                        opacity: wallet.detected || wallet.isWalletConnect ? 1 : 0.5,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (wallet.detected || wallet.isWalletConnect) {
                          e.currentTarget.style.background = '#333';
                          e.currentTarget.style.borderColor = '#555';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = wallet.detected || wallet.isWalletConnect ? '#222' : '#1a1a1a';
                        e.currentTarget.style.borderColor = wallet.detected || wallet.isWalletConnect ? '#444' : '#333';
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{wallet.icon}</span>
                      <span style={{ color: '#fff', fontSize: '16px', fontWeight: 500 }}>
                        {wallet.name}
                      </span>
                      {wallet.isWalletConnect ? (
                        <span style={{ 
                          marginLeft: 'auto', 
                          fontSize: '11px', 
                          color: '#fff',
                          background: '#3B82F6',
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}>
                          Universal
                        </span>
                      ) : wallet.detected ? (
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
                      ) : (
                        <span style={{ 
                          marginLeft: 'auto', 
                          fontSize: '12px', 
                          color: '#666',
                        }}>
                          Not available
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {detectedCount === 1 && detectedCount < 3 && (
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}>
                    <p style={{ color: '#93C5FD', fontSize: '12px', margin: 0 }}>
                      💡 <strong>Phantom bloque les autres wallets?</strong><br/>
                      Utilise <strong>WalletConnect</strong> - ça marche avec tous les wallets, même quand Phantom est installé.
                    </p>
                  </div>
                )}

                <p style={{ 
                  marginTop: '16px', 
                  fontSize: '12px', 
                  color: '#666', 
                  textAlign: 'center' 
                }}>
                  {detectedCount > 0 
                    ? `${detectedCount} browser wallet${detectedCount > 1 ? 's' : ''} detected` 
                    : 'Use WalletConnect to connect any wallet'}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
