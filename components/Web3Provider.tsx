'use client';

import { ReactNode } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  darkTheme,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
  metaMaskWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, WagmiConfig } from 'wagmi';
import {
  base,
  baseSepolia,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { configureChains } from 'wagmi';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

const { chains, publicClient } = configureChains(
  [baseSepolia, base],
  [publicProvider()]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ projectId, chains }),
      coinbaseWallet({ appName: 'PULSE Protocol', chains }),
      walletConnectWallet({ projectId, chains }),
      rainbowWallet({ projectId, chains }),
    ],
  },
]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const customTheme = darkTheme({
  accentColor: '#8b5cf6',
  accentColorForeground: 'white',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains} theme={customTheme}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
