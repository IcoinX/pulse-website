'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';

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
  
  const { address, isConnected: wagmiConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // Check for existing session on mount
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

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (wagmiConnected && address && !user) {
      authenticateWallet(address);
    }
  }, [wagmiConnected, address]);

  const authenticateWallet = async (wallet_address: string) => {
    setIsLoading(true);
    try {
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
      
      const signature = await signMessageAsync({ message });

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
      // Don't show alert here - let RainbowKit handle the UI
    } finally {
      setIsLoading(false);
    }
  };

  const connect = async () => {
    // RainbowKit handles the connect button UI
    // This function is called when user clicks "Connect Wallet"
    // The actual wallet connection is handled by RainbowKit
  };

  const disconnect = () => {
    localStorage.removeItem('pulse_token');
    localStorage.removeItem('pulse_user');
    setUser(null);
    wagmiDisconnect();
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
