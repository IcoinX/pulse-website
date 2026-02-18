'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Wallet {
  id: string;
  name: string;
  icon: string;
  provider: any;
}

// EIP-1193 Provider type
interface Eip1193Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  isPhantom?: boolean;
  isCoinbaseWallet?: boolean;
  rdns?: string;
  providers?: Eip1193Provider[];
}

// Get ALL injected providers (handles multi-wallet scenario)
function getInjectedProviders(): Eip1193Provider[] {
  if (typeof window === 'undefined') return [];
  
  const eth = (window as any).ethereum as Eip1193Provider | undefined;
  if (!eth) return [];
  
  // EIP-5749: If providers array exists, use it (multiple wallets)
  // Otherwise, wrap single provider in array
  const providers = Array.isArray(eth.providers) && eth.providers.length > 0
    ? eth.providers
    : [eth];
  
  // Deduplicate by checking object identity
  const seen = new Set<Eip1193Provider>();
  const unique: Eip1193Provider[] = [];
  
  for (const p of providers) {
    // Also check window.phantom.ethereum separately
    if ((window as any).phantom?.ethereum && p === (window as any).phantom.ethereum) {
      if (!seen.has(p)) {
        seen.add(p);
        unique.push(p);
      }
      continue;
    }
    
    if (!seen.has(p)) {
      seen.add(p);
      unique.push(p);
    }
  }
  
  // Add window.phantom.ethereum if not already included
  const phantomProvider = (window as any).phantom?.ethereum;
  if (phantomProvider && !seen.has(phantomProvider)) {
    unique.push(phantomProvider);
  }
  
  return unique;
}

// Detect all wallets from providers
function detectAllWallets(): Wallet[] {
  const providers = getInjectedProviders();
  const wallets: Wallet[] = [];
  const seenIds = new Set<string>();
  
  for (const provider of providers) {
    // MetaMask: isMetaMask = true, isPhantom = false/undefined
    if (provider.isMetaMask && !provider.isPhantom && !seenIds.has('metamask')) {
      wallets.push({ id: 'metamask', name: 'MetaMask', icon: '🦊', provider });
      seenIds.add('metamask');
    }
    // Phantom: isPhantom = true
    else if (provider.isPhantom && !seenIds.has('phantom')) {
      wallets.push({ id: 'phantom', name: 'Phantom', icon: '👻', provider });
      seenIds.add('phantom');
    }
    // Coinbase: isCoinbaseWallet = true
    else if (provider.isCoinbaseWallet && !seenIds.has('coinbase')) {
      wallets.push({ id: 'coinbase', name: 'Coinbase', icon: '🔵', provider });
      seenIds.add('coinbase');
    }
    // Generic provider (only if no known wallet)
    else if (!provider.isMetaMask && !provider.isPhantom && !provider.isCoinbaseWallet) {
      const genericId = `injected-${wallets.length}`;
      wallets.push({ id: genericId, name: 'Injected Wallet', icon: '💼', provider });
    }
  }
  
  return wallets;
}

export default function ConnectButton() {
  const [showModal, setShowModal] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const detectionRef = useRef<{ attempted: boolean; interval?: NodeJS.Timeout }>({ attempted: false });

  const detectWallets = useCallback(() => {
    const detected = detectAllWallets();
    setWallets(detected);
    
    if (detected.length > 0 || detectionRef.current.attempted) {
      setChecked(true);
      if (detectionRef.current.interval) {
        clearInterval(detectionRef.current.interval);
        detectionRef.current.interval = undefined;
      }
    }
    detectionRef.current.attempted = true;
  }, []);

  // Event-based detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    detectWallets();
    
    const handleEthereumInitialized = () => {
      console.log('[Wallet] ethereum#initialized event received');
      detectWallets();
    };
    
    window.addEventListener('ethereum#initialized', handleEthereumInitialized, { once: true });
    
    return () => {
      window.removeEventListener('ethereum#initialized', handleEthereumInitialized);
    };
  }, [detectWallets]);

  // Fallback polling
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (detectionRef.current.interval) return;
    
    if (wallets.length === 0 && !checked) {
      const startTime = Date.now();
      const maxDuration = 3000;
      
      detectionRef.current.interval = setInterval(() => {
        detectWallets();
        
        if (Date.now() - startTime > maxDuration) {
          if (detectionRef.current.interval) {
            clearInterval(detectionRef.current.interval);
            detectionRef.current.interval = undefined;
          }
          setChecked(true);
        }
      }, 100);
      
      return () => {
        if (detectionRef.current.interval) {
          clearInterval(detectionRef.current.interval);
          detectionRef.current.interval = undefined;
        }
      };
    }
  }, [wallets.length, checked, detectWallets]);

  // Check if already connected
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    if (w.ethereum?.selectedAddress) {
      setAddress(w.ethereum.selectedAddress);
      setConnected(true);
    }
  }, []);

  const connect = async (wallet: Wallet) => {
    setLoading(true);
    try {
      // Use the SPECIFIC provider that was clicked, not window.ethereum
      const accounts = await wallet.provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts[0]) {
        setAddress(accounts[0]);
        setConnected(true);
        setShowModal(false);
        await authenticate(accounts[0], wallet.provider);
      }
    } catch (err) {
      console.error('Connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async (walletAddress: string, provider: any) => {
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
                    onClick={() => connect(wallet)}
                    disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#222', border: '1px solid #444', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
                  >
                    <span style={{ fontSize: '24px' }}>{wallet.icon}</span>
                    <span style={{ color: '#fff', fontSize: '16px' }}>{wallet.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#22C55E', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                      {loading ? '...' : 'Connect'}
                    </span>
                  </button>
                ))}
              </div>
            ) : checked ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#888', marginBottom: '16px' }}>No wallet detected</p>
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 20px', background: '#2563EB', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>
                  Install MetaMask
                </a>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#666' }}>Checking for wallets...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
