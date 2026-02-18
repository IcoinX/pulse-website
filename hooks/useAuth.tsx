'use client';

import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  wallet_address: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isConnected: boolean;
  connect: (walletId?: string) => Promise<void>;
  connectWithProvider: (provider: any) => Promise<void>;
  connectViaWalletConnect: () => Promise<void>;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get the right ethereum provider
function getProvider(walletId?: string) {
  if (typeof window === 'undefined') return null;
  
  const w = window as any;
  
  // EIP-5749: Check for multiple providers in window.ethereum.providers
  const providers = w.ethereum?.providers || [];
  
  // If Phantom is requested
  if (walletId === 'phantom') {
    // Check in providers array first
    const phantomProvider = providers.find((p: any) => p.isPhantom);
    if (phantomProvider) return phantomProvider;
    // Check window.phantom.ethereum
    if (w.phantom?.ethereum) return w.phantom.ethereum;
    // Check main ethereum
    if (w.ethereum?.isPhantom) return w.ethereum;
  }
  
  // For MetaMask
  if (walletId === 'metamask') {
    // Check in providers array first (EIP-5749)
    const mmProvider = providers.find((p: any) => p.isMetaMask && !p.isPhantom);
    if (mmProvider) return mmProvider;
    // Check main ethereum
    if (w.ethereum?.isMetaMask && !w.ethereum?.isPhantom) {
      return w.ethereum;
    }
  }
  
  // For Coinbase
  if (walletId === 'coinbase') {
    const cbProvider = providers.find((p: any) => p.isCoinbaseWallet);
    if (cbProvider) return cbProvider;
    if (w.ethereum?.isCoinbaseWallet) return w.ethereum;
  }
  
  // For Brave
  if (walletId === 'brave') {
    const braveProvider = providers.find((p: any) => p.isBraveWallet);
    if (braveProvider) return braveProvider;
    if (w.ethereum?.isBraveWallet) return w.ethereum;
  }
  
  // Fallback to main provider
  if (w.ethereum) {
    return w.ethereum;
  }
  
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pulse_token');
    const savedUser = localStorage.getItem('pulse_user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('pulse_token');
        localStorage.removeItem('pulse_user');
      }
    }
    setIsLoading(false);
  }, []);

  const connectWithProvider = async (provider: any) => {
    setIsLoading(true);
    try {
      if (!provider) {
        alert('No wallet provider available.');
        return;
      }

      // Request accounts
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const wallet_address = accounts[0];

      // Get nonce from server
      const nonceRes = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address })
      });

      if (!nonceRes.ok) {
        throw new Error('Failed to get nonce');
      }

      const { nonce } = await nonceRes.json();

      // Sign message
      const message = `Sign in to PULSE Protocol\n\nWallet: ${wallet_address}\nNonce: ${nonce}\n\nThis signature proves ownership of your wallet.`;
      
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, wallet_address]
      });

      // Verify signature
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address, signature, nonce })
      });

      if (!verifyRes.ok) {
        const error = await verifyRes.json();
        throw new Error(error.error || 'Verification failed');
      }

      const { token, user } = await verifyRes.json();

      localStorage.setItem('pulse_token', token);
      localStorage.setItem('pulse_user', JSON.stringify(user));
      setUser(user);

      window.dispatchEvent(new CustomEvent('pulse:connected', { detail: user }));

    } catch (err: any) {
      console.error('Connection error:', err);
      alert(err.message || 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  const connect = async (walletId?: string) => {
    const provider = getProvider(walletId);
    await connectWithProvider(provider);
  };

  const connectViaWalletConnect = async () => {
    setIsLoading(true);
    try {
      // Dynamic import to avoid SSR issues
      const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
      
      const provider = await EthereumProvider.init({
        projectId: '2f0b5f5e7e8b4e6c9e8f7d6c5b4a3928', // Public WalletConnect project ID
        chains: [84532], // Base Sepolia
        showQrModal: true,
        methods: ['eth_requestAccounts', 'personal_sign'],
        events: ['chainChanged', 'accountsChanged'],
      });

      // Enable session (shows QR modal)
      await provider.enable();

      // Get accounts
      const accounts = provider.accounts;
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const wallet_address = accounts[0];

      // Get nonce from server
      const nonceRes = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address })
      });

      if (!nonceRes.ok) {
        throw new Error('Failed to get nonce');
      }

      const { nonce } = await nonceRes.json();

      // Sign message via WalletConnect
      const message = `Sign in to PULSE Protocol\n\nWallet: ${wallet_address}\nNonce: ${nonce}\n\nThis signature proves ownership of your wallet.`;
      
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, wallet_address]
      });

      // Verify signature
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address, signature, nonce })
      });

      if (!verifyRes.ok) {
        const error = await verifyRes.json();
        throw new Error(error.error || 'Verification failed');
      }

      const { token, user } = await verifyRes.json();

      localStorage.setItem('pulse_token', token);
      localStorage.setItem('pulse_user', JSON.stringify(user));
      setUser(user);

      window.dispatchEvent(new CustomEvent('pulse:connected', { detail: user }));

    } catch (err: any) {
      console.error('WalletConnect error:', err);
      if (err.message !== 'User closed modal') {
        alert(err.message || 'Failed to connect via WalletConnect');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('pulse_token');
    localStorage.removeItem('pulse_user');
    setUser(null);
    window.dispatchEvent(new CustomEvent('pulse:disconnected'));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isConnected: !!user,
      connect,
      connectWithProvider,
      connectViaWalletConnect,
      disconnect
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
