'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  provider?: any;
  detected: boolean;
}

// Detect all available wallets - EIP-5749 compatible
function detectWallets(): WalletOption[] {
  if (typeof window === 'undefined') return [];
  
  const w = window as any;
  const wallets: WalletOption[] = [];
  const seen = new Set<string>();
  
  // Check for EIP-5749 providers array first
  const providers = w.ethereum?.providers || [];
  
  if (providers.length > 0) {
    // Multiple wallets installed
    providers.forEach((provider: any) => {
      if (provider.isPhantom && !seen.has('phantom')) {
        wallets.push({ id: 'phantom', name: 'Phantom', icon: '👻', provider, detected: true });
        seen.add('phantom');
      } else if (provider.isMetaMask && !provider.isPhantom && !seen.has('metamask')) {
        wallets.push({ id: 'metamask', name: 'MetaMask', icon: '🦊', provider, detected: true });
        seen.add('metamask');
      } else if (provider.isCoinbaseWallet && !seen.has('coinbase')) {
        wallets.push({ id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', provider, detected: true });
        seen.add('coinbase');
      }
    });
  }
  
  // Also check window.phantom.ethereum (separate injection)
  if (w.phantom?.ethereum && !seen.has('phantom')) {
    wallets.push({ id: 'phantom', name: 'Phantom', icon: '👻', provider: w.phantom.ethereum, detected: true });
    seen.add('phantom');
  }
  
  // Check main window.ethereum (might be hijacked by Phantom)
  if (w.ethereum && !seen.has('metamask') && w.ethereum.isMetaMask && !w.ethereum.isPhantom) {
    wallets.push({ id: 'metamask', name: 'MetaMask', icon: '🦊', provider: w.ethereum, detected: true });
    seen.add('metamask');
  }
  if (w.ethereum && !seen.has('phantom') && w.ethereum.isPhantom) {
    wallets.push({ id: 'phantom', name: 'Phantom', icon: '👻', provider: w.ethereum, detected: true });
    seen.add('phantom');
  }
  
  return wallets;
}

export default function ConnectButton() {
  const { user, isLoading, isConnected, connectWithProvider, disconnect } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [isPhantomOnly, setIsPhantomOnly] = useState(false);

  useEffect(() => {
    const detected = detectWallets();
    setWallets(detected);
    
    // Check if only Phantom is detected (blocking others)
    if (detected.length === 1 && detected[0].id === 'phantom') {
      setIsPhantomOnly(true);
    }
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleWalletClick = async (wallet: WalletOption) => {
    if (wallet.detected && wallet.provider) {
      setShowModal(false);
      await connectWithProvider(wallet.provider);
    }
  };

  const openMetaMaskExtension = () => {
    // Try to trigger MetaMask extension
    const w = window as any;
    if (w.ethereum) {
      w.ethereum.request({ method: 'eth_requestAccounts' });
    }
  };

  if (isLoading) {
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
          <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '24px', width: '380px', border: '1px solid #333' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Connect Wallet</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            {wallets.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {wallets.map((wallet) => (
                  <button key={wallet.id} onClick={() => handleWalletClick(wallet)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#222', border: '1px solid #444', borderRadius: '10px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '24px' }}>{wallet.icon}</span>
                    <span style={{ color: '#fff', fontSize: '16px' }}>{wallet.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#22C55E', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>Connect</span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#888', marginBottom: '16px' }}>No wallet detected</p>
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 20px', background: '#2563EB', color: '#fff', borderRadius: '8px', textDecoration: 'none' }}>
                  Install MetaMask
                </a>
              </div>
            )}

            {isPhantomOnly && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <p style={{ color: '#F59E0B', fontSize: '12px', margin: '0 0 8px 0' }}>
                  ⚠️ Phantom may be blocking other wallets
                </p>
                <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>
                  If you have MetaMask installed but don't see it, try:
                  <br/>• Disabling Phantom temporarily
                  <br/>• Using a different browser
                </p>
              </div>
            )}

            <p style={{ marginTop: '16px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
              {wallets.length > 0 ? `${wallets.length} wallet${wallets.length > 1 ? 's' : ''} detected` : 'Install a wallet to continue'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
