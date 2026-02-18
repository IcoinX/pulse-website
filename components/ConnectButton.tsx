'use client';

import { useState, useEffect, useCallback } from 'react';

interface Wallet {
  id: string;
  name: string;
  icon: string;
  provider: any;
}

export default function ConnectButton() {
  const [showModal, setShowModal] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Detect wallets on mount and when modal opens
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const w = window as any;
    const detected: Wallet[] = [];
    const seen = new Set<string>();
    
    // Check EIP-5749 providers array
    const providers = w.ethereum?.providers || [];
    providers.forEach((p: any) => {
      if (p.isMetaMask && !p.isPhantom && !seen.has('metamask')) {
        detected.push({ id: 'metamask', name: 'MetaMask', icon: '🦊', provider: p });
        seen.add('metamask');
      } else if (p.isPhantom && !seen.has('phantom')) {
        detected.push({ id: 'phantom', name: 'Phantom', icon: '👻', provider: p });
        seen.add('phantom');
      } else if (p.isCoinbaseWallet && !seen.has('coinbase')) {
        detected.push({ id: 'coinbase', name: 'Coinbase', icon: '🔵', provider: p });
        seen.add('coinbase');
      }
    });
    
    // Check window.phantom.ethereum
    if (w.phantom?.ethereum && !seen.has('phantom')) {
      detected.push({ id: 'phantom', name: 'Phantom', icon: '👻', provider: w.phantom.ethereum });
      seen.add('phantom');
    }
    
    // Check main window.ethereum
    if (w.ethereum && !seen.has('metamask') && w.ethereum.isMetaMask && !w.ethereum.isPhantom) {
      detected.push({ id: 'metamask', name: 'MetaMask', icon: '🦊', provider: w.ethereum });
      seen.add('metamask');
    }
    if (w.ethereum && !seen.has('phantom') && w.ethereum.isPhantom) {
      detected.push({ id: 'phantom', name: 'Phantom', icon: '👻', provider: w.ethereum });
      seen.add('phantom');
    }
    if (w.ethereum && !seen.has('coinbase') && w.ethereum.isCoinbaseWallet) {
      detected.push({ id: 'coinbase', name: 'Coinbase', icon: '🔵', provider: w.ethereum });
      seen.add('coinbase');
    }
    
    setWallets(detected);
    
    // Check if already connected
    if (w.ethereum?.selectedAddress) {
      setAddress(w.ethereum.selectedAddress);
      setConnected(true);
    }
  }, [showModal]);

  const connect = async (wallet: Wallet) => {
    setLoading(true);
    try {
      const accounts = await wallet.provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts[0]) {
        setAddress(accounts[0]);
        setConnected(true);
        setShowModal(false);
        
        // Authenticate with backend
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
      // Get nonce
      const nonceRes = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      
      if (!nonceRes.ok) throw new Error('Failed to get nonce');
      const { nonce } = await nonceRes.json();
      
      // Sign message
      const message = `Sign in to PULSE Protocol\n\nWallet: ${walletAddress}\nNonce: ${nonce}\n\nThis signature proves ownership of your wallet.`;
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, walletAddress]
      });
      
      // Verify
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
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#888', marginBottom: '16px' }}>No wallet detected</p>
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 20px', background: '#2563EB', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>
                  Install MetaMask
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
