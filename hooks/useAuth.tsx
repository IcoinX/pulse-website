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
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get the right ethereum provider
function getProvider(walletId?: string) {
  if (typeof window === 'undefined') return null;
  
  const w = window as any;
  
  // If Phantom is requested, try to get Phantom's provider
  if (walletId === 'phantom') {
    // Phantom injects at window.phantom.ethereum
    if (w.phantom?.ethereum) {
      return w.phantom.ethereum;
    }
    // Or it might be the main ethereum provider with isPhantom flag
    if (w.ethereum?.isPhantom) {
      return w.ethereum;
    }
  }
  
  // If MetaMask is requested, we need to be careful
  if (walletId === 'metamask') {
    // Check if Phantom is overriding - if so, we can't easily get MetaMask
    if (w.phantom?.ethereum || w.ethereum?.isPhantom) {
      // Phantom is active, can't get MetaMask directly
      // Return the provider but user needs to disable Phantom
      return null;
    }
    // Pure MetaMask
    if (w.ethereum?.isMetaMask && !w.ethereum?.isPhantom) {
      return w.ethereum;
    }
  }
  
  if (walletId === 'coinbase' && w.ethereum?.isCoinbaseWallet) {
    return w.ethereum;
  }
  
  if (walletId === 'brave' && w.ethereum?.isBraveWallet) {
    return w.ethereum;
  }
  
  // Fallback to any available provider
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

  const connect = async (walletId?: string) => {
    setIsLoading(true);
    try {
      const provider = getProvider(walletId);
      
      if (!provider) {
        alert('No wallet detected. Please install MetaMask or another wallet.');
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
