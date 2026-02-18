'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  walletConnectWallet,
  metaMaskWallet,
  phantomWallet,
  coinbaseWallet,
  braveWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Define chains inline to avoid type issues
const base = {
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
    public: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://basescan.org' },
  },
} as const;

const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://sepolia.basescan.org' },
  },
} as const;

const chains = [base, baseSepolia] as const;

const projectId = 'PULSE_PROTOCOL_WALLET_CONNECT';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        phantomWallet,
        coinbaseWallet,
        rainbowWallet,
      ],
    },
    {
      groupName: 'More',
      wallets: [
        walletConnectWallet,
        braveWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName: 'PULSE Protocol',
    projectId,
  }
);

import { http } from 'wagmi';

const config = createConfig({
  connectors,
  chains,
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#8b5cf6',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
