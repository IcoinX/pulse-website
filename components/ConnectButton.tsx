'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  provider?: any;
  detected: boolean;
  universalLink?: string;
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
  
  // Universal links for mobile/deeplink
  const currentUrl = encodeURIComponent('https://pulseprotocol.co');
  
  // Build complete list
  const allWallets: WalletOption[] = [
    detectedWallets.find(w => w.id === 'phantom') || 
      { id: 'phantom', name: 'Phantom', icon: '👻', detected: false, universalLink: `https://phantom.app/ul/browse/pulseprotocol.co` },
    detectedWallets.find(w => w.id === 'metamask') || 
      { id: 'metamask', name: 'MetaMask', icon: '🦊', detected: false, universalLink: `https://metamask.app.link/dapp/pulseprotocol.co` },
    detectedWallets.find(w => w.id === 'coinbase') || 
      { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', detected: false, universalLink: `https://go.cb-w.com/dapp?cb_url=https%3A%2F%2Fpulseprotocol.co` },
  ];
  
  return { detected: detectedWallets, all: allWallets };
}

export default function ConnectButton() {
  const { user, isLoading, isConnected, connectWithProvider, disconnect } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [detectedCount, setDetectedCount] = useState(0);
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { detected, all } = detectWallets();
    setDetectedCount(detected.length);
    setWallets(all);
    setReady(true);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleWalletClick = async (wallet: WalletOption) => {
    if (wallet.detected && wallet.provider) {
      setShowModal(false);
      await connectWithProvider(wallet.provider);
    } else if (wallet.universalLink) {
      // Open wallet app via universal link
      window.open(wallet.universalLink, '_blank');
    }
  };

  if (isLoading && !ready) {
    return (
      <button disabled style={{ padding: '10px 16px', background: '#374151', color: '#9CA3AF', borderRadius: '8px', border: 'none', fontSize: '14px', cursor: 'not-allowed' }}>
        Loading...
      </button>
    );
  }

  if (isConnected && user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px' }}>
          <div style={{ width: '8px', height: '8px', background: '#22C55E', borderRadius: '50%' }} />
          <span style={{ color: '#4ADE80', fontSize: '14px', fontFamily: 'monospace' }}>{formatAddress(user.wallet_address)}</span>
        </div>
        <button onClick={disconnect} style={{ padding: '8px 12px', color: '#9CA3AF', background: 'transparent', border: 'none', fontSize: '14px', cursor: 'pointer' }}>Disconnect</button>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} style={{ padding: '12px 24px', background: '#2563EB', color: '#FFFFFF', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
        🔌 Connect Wallet
      </button>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '24px', width: '360px', border: '1px solid #333' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Connect Wallet</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {wallets.map((wallet) => (
                <button key={wallet.id} onClick={() => handleWalletClick(wallet)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: wallet.detected ? '#222' : '#1a1a1a', border: `1px solid ${wallet.detected ? '#444' : '#333'}`, borderRadius: '10px', cursor: 'pointer', opacity: 1 }}>
                  <span style={{ fontSize: '24px' }}>{wallet.icon}</span>
                  <span style={{ color: '#fff', fontSize: '16px' }}>{wallet.name}</span>
                  {wallet.detected ? (
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#22C55E', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>Connect</span>
                  ) : (
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#888' }}>Open App →</span>
                  )}
                </button>
              ))}
            </div>

            {detectedCount === 1 && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                <p style={{ color: '#93C5FD', fontSize: '12px', margin: 0 }}>
                  💡 <strong>Phantom bloque MetaMask?</strong><br/>
                  Clique sur MetaMask → "Open App" pour l'ouvrir dans l'app mobile
                </p>
              </div>
            )}

            <p style={{ marginTop: '16px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
              {detectedCount > 0 ? `${detectedCount} wallet detected` : 'Click to open wallet app'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
