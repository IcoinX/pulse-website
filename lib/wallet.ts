import { ethers } from 'ethers';

export const SUPPORTED_CHAINS = {
  84532: { name: 'Base Sepolia', rpc: 'https://sepolia.base.org' },
  8453: { name: 'Base Mainnet', rpc: 'https://mainnet.base.org' }
};

export const CONTRACTS = {
  84532: {
    registry: '0xF3c4AE463d1f74E24F459fdd42F4982421C324ed',
    boosts: '0x076A3083Cc9D31CB104cF99fFc8a03c2442ecaFf',
    assertions: '0xBfF6715cDdB6FE12b10db5E7A856b1DBB6633B59'
  },
  8453: {
    registry: '0x0000000000000000000000000000000000000000', // TODO: Add mainnet addresses
    boosts: '0x0000000000000000000000000000000000000000',
    assertions: '0x0000000000000000000000000000000000000000'
  }
};

export const TIER_PRICES = {
  0: '0.001', // 24h
  1: '0.002', // 72h
  2: '0.005'  // 7d
};

export const TIER_LABELS: Record<number, string> = {
  0: '24h',
  1: '72h',
  2: '7d'
};

export const MIN_STAKE = '0.01';

// Get provider for a specific chain
export function getProvider(chainId: number = 84532): ethers.JsonRpcProvider {
  const chain = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
  if (!chain) {
    throw new Error(`Chain ${chainId} not supported`);
  }
  return new ethers.JsonRpcProvider(chain.rpc);
}

// Format address for display
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Get ETH balance for an address
export async function getEthBalance(address: string, chainId: number = 84532): Promise<string> {
  try {
    const provider = getProvider(chainId);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    return '0';
  }
}

// Get USDC balance for an address (Base Sepolia USDC)
export async function getUsdcBalance(address: string, chainId: number = 84532): Promise<string> {
  try {
    const USDC_ADDRESSES: Record<number, string> = {
      84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
      8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'   // Base Mainnet USDC
    };
    
    const usdcAddress = USDC_ADDRESSES[chainId];
    if (!usdcAddress) return '0';
    
    const provider = getProvider(chainId);
    const usdcAbi = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'];
    const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);
    
    const [balance, decimals] = await Promise.all([
      usdcContract.balanceOf(address),
      usdcContract.decimals()
    ]);
    
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error fetching USDC balance:', error);
    return '0';
  }
}

// Switch to the correct chain
export async function switchToChain(chainId: number): Promise<void> {
  if (!window.ethereum) {
    throw new Error('No wallet detected');
  }
  
  const chain = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
  if (!chain) {
    throw new Error(`Chain ${chainId} not supported`);
  }
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (switchError: any) {
    // Chain not added to wallet
    if (switchError.code === 4902) {
      const chainParams: Record<number, any> = {
        84532: {
          chainId: '0x14a34',
          chainName: 'Base Sepolia',
          nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://sepolia.base.org'],
          blockExplorerUrls: ['https://sepolia.basescan.org'],
        },
        8453: {
          chainId: '0x2105',
          chainName: 'Base',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://mainnet.base.org'],
          blockExplorerUrls: ['https://basescan.org'],
        },
      };
      
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [chainParams[chainId]],
      });
    } else {
      throw switchError;
    }
  }
}

// Get transaction explorer URL
export function getExplorerUrl(txHash: string, chainId: number = 84532): string {
  const explorers: Record<number, string> = {
    84532: 'https://sepolia.basescan.org',
    8453: 'https://basescan.org'
  };
  
  const base = explorers[chainId] || explorers[84532];
  return `${base}/tx/${txHash}`;
}

// Get address explorer URL
export function getAddressExplorerUrl(address: string, chainId: number = 84532): string {
  const explorers: Record<number, string> = {
    84532: 'https://sepolia.basescan.org',
    8453: 'https://basescan.org'
  };
  
  const base = explorers[chainId] || explorers[84532];
  return `${base}/address/${address}`;
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
