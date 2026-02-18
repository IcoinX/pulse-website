import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// WalletConnect Project ID (public)
const projectId = '2f0b5f5e7e8b4e6c9e8f7d6c5b4a3928';

// Metadata
const metadata = {
  name: 'PULSE Protocol',
  description: 'Decentralized Event Verification Protocol',
  url: 'https://pulseprotocol.co',
  icons: ['https://pulseprotocol.co/logo.png']
};

// Chains
const chains = [baseSepolia, base] as const;

// Create Wagmi config
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata
});

// Create Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#2563EB',
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#3B82F6',
    '--w3m-font-family': 'Inter, system-ui, sans-serif',
    '--w3m-border-radius-master': '12px',
    '--w3m-z-index': 9999
  }
});

// Query client
const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { config };
