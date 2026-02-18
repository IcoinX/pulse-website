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
  connect: () => Promise<void>;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
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

  const connect = async () => {
    setIsLoading(true);
    try {
      // Check if MetaMask is installed
      if (typeof window === 'undefined' || !window.ethereum) {
        alert('Please install MetaMask or use a Web3 browser');
        return;
      }

      // Request accounts
      const accounts = await window.ethereum.request({
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
      
      const signature = await window.ethereum.request({
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

      // Save session
      localStorage.setItem('pulse_token', token);
      localStorage.setItem('pulse_user', JSON.stringify(user));
      setUser(user);

      // Dispatch event for toast
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

// Window interface for MetaMask is declared in types/window.d.ts
