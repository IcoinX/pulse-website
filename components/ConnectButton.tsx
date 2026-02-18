'use client';

import { useState, useEffect, useCallback } from 'react';

// EIP-1193 Provider
interface EIP1193Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

// EIP-6963 Provider Detail
interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string; // e.g., "io.metamask", "app.phantom"
  };
  provider: EIP1193Provider;
}

interface Wallet {
  id: string;
  name: string;
  icon: string;
  rdns: string;
  provider: EIP1193Provider;
}

// Hook for EIP-6963 provider discovery
function useEip6963Providers() {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const seen = new Map<string, EIP6963ProviderDetail>();

    function onAnnounce(event: any) {
      const detail = event.detail as EIP6963ProviderDetail;
      if (!detail?.info?.rdns || !detail?.provider) return;
      
      console.log('[EIP-6963] Provider announced:', detail.info.rdns, detail.info.name);
      
      if (!seen.has(detail.info.rdns)) {
        seen.set(detail.info.rdns, detail);
        setProviders(Array.from(seen.values()));
      }
    }

    // Listen for provider announcements
    window.addEventListener('eip6963:announceProvider', onAnnounce);

    // Request providers to announce themselves
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    // Fallback: if no EIP-6963 providers, try legacy injection
    const fallbackTimer = setTimeout(() => {
      if (seen.size === 0) {
        console.log('[EIP-6963] No providers announced, trying legacy...');
        
        const eth = (window as any).ethereum;
        if (eth?.request) {
          // Try to detect by specific properties
          let name = 'Injected Wallet';
          let rdns = 'injected';
          let icon = '💼';
          
          if (eth.isMetaMask && !eth.isPhantom) {
            name = 'MetaMask';
            rdns = 'io.metamask';
            icon = '🦊';
          } else if (eth.isPhantom) {
            name = 'Phantom';
            rdns = 'app.phantom';
            icon = '👻';
          } else if (eth.isCoinbaseWallet) {
            name = 'Coinbase';
            rdns = 'com.coinbase.wallet';
            icon = '🔵';
          }
          
          const legacyProvider: EIP6963ProviderDetail = {
            info: { uuid: 'legacy', name, icon, rdns },
            provider: eth
          };
          
          seen.set(rdns, legacyProvider);
          setProviders([legacyProvider]);
        }
      }
      setIsReady(true);
    }, 500);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('eip6963:announceProvider', onAnnounce);
    };
  }, []);

  return { providers, isReady };
}

export default function ConnectButton() {
  const [showModal, setShowModal] = useState(false);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { providers, isReady } = useEip6963Providers();

  // Convert providers to wallet list
  const wallets: Wallet[] = providers.map(p => ({
    id: p.info.rdns,
    name: p.info.name,
    icon: p.info.icon,
    rdns: p.info.rdns,
    provider: p.provider
  }));

  // Check if already connected
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    if (w.ethereum?.selectedAddress) {
      setAddress(w.ethereum.selectedAddress);
      setConnected(true);
    }
  }, []);

  const handleConnect = async (wallet: Wallet) => {
    console.log('[Connect] Attempting to connect with:', wallet.rdns, wallet.name);
    setLoading(true);
    
    try {
      // CRITICAL: Use the SPECIFIC provider from EIP-6963
      const accounts = await wallet.provider.request({ 
        method: 'eth_requestAccounts' 
      });
      
      console.log('[Connect] Got accounts:', accounts);
      
      if (accounts && accounts[0]) {
        setAddress(accounts[0]);
        setConnected(true);
        setShowModal(false);
        await authenticate(accounts[0], wallet.provider);
      }
    } catch (err) {
      console.error('[Connect] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async (walletAddress: string, provider: EIP1193Provider) => {
    try {
      const nonceRes = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      
      if (!nonceRes.ok) throw new Error('Failed to get nonce');
      const { nonce } = await nonceRes.json();
      
      const message = `Sign in to PULSE Protocol\n\nWallet: ${walletAddress}\nNonce: ${nonce}\n\nThis signature proves ownership of your wallet.`;
      
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, walletAddress]
      });
      
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress, signature, nonce })
      });
      
      if (!verifyRes.ok) throw new Error('Verification failed');
      const { token, user } = await verifyRes.json();
      
      localStorage.setItem('pulse_token', token);
      localStorage.setItem('pulse_user', JSON.stringify(user));
      
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('pulse_token');
    localStorage.removeItem('pulse_user');
    setConnected(false);
    setAddress(null);
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (connected && address) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px' }}>
          <div style={{ width: '8px', height: '8px', background: '#22C55E', borderRadius: '50%' }} />
          <span style={{ color: '#4ADE80', fontSize: '14px', fontFamily: 'monospace' }}>{formatAddress(address)}</span>
        </div>
        <button onClick={disconnect} style={{ padding: '8px 12px', color: '#9CA3AF', background: 'transparent', border: 'none', fontSize: '14px', cursor: 'pointer' }}>Disconnect</button>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)} 
        disabled={loading}
        style={{ padding: '12px 24px', background: '#2563EB', color: '#FFFFFF', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Connecting...' : '🔌 Connect Wallet'}
      </button>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '24px', width: '360px', border: '1px solid #333' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Connect Wallet</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            {wallets.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {wallets.map((wallet) => (
                  <button 
                    key={wallet.id} 
                    onClick={() => handleConnect(wallet)}
                    disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#222', border: '1px solid #444', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
                  >
                    <span style={{ fontSize: '24px' }}>{wallet.icon}</span>
                    <span style={{ color: '#fff', fontSize: '16px' }}>{wallet.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#666' }}>
                      {wallet.rdns}
                    </span>
                  </button>
                ))}
              </div>
            ) : isReady ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#888', marginBottom: '16px' }}>No wallet detected</p>
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 20px', background: '#2563EB', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>
                  Install MetaMask
                </a>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#666' }}>Discovering wallets...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
