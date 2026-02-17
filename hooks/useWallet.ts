'use client';

import { useState, useCallback, useEffect } from 'react';
import { connectMetaMask, disconnectWallet, WalletState, isSupportedChain, switchToBaseSepolia } from '@/lib/wallet';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    provider: null,
    signer: null
  });
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const state = await connectMetaMask();
      
      if (!isSupportedChain(state.chainId!)) {
        await switchToBaseSepolia();
        // Reconnect after switch
        const newState = await connectMetaMask();
        setWallet(newState);
      } else {
        setWallet(state);
      }
      
      localStorage.setItem('pulse_wallet_connected', 'true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const state = await disconnectWallet();
    setWallet(state);
    localStorage.removeItem('pulse_wallet_connected');
  }, []);

  // Auto-reconnect on mount
  useEffect(() => {
    const shouldReconnect = localStorage.getItem('pulse_wallet_connected');
    if (shouldReconnect) {
      connect();
    }
  }, [connect]);

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        connect();
      }
    };
    
    const handleChainChanged = () => {
      window.location.reload();
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [connect, disconnect]);

  return {
    ...wallet,
    isConnecting,
    error,
    connect,
    disconnect
  };
}
