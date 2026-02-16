'use client';

import { useWallet } from '@/hooks/useWallet';
import { formatAddress } from '@/lib/wallet';

interface DashboardHeaderProps {
  address: string;
}

export function DashboardHeader({ address }: DashboardHeaderProps) {
  const { chainId, disconnect } = useWallet();
  
  const chainName = chainId === 84532 ? 'Base Sepolia' : chainId === 8453 ? 'Base' : 'Unknown';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">My Assertions</h1>
        <p className="text-sm text-gray-400">
          Track your assertions, challenges, and reputation on PULSE
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Chain Badge */}
        <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm rounded-lg">
          {chainName}
        </span>
        
        {/* Wallet Address */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="text-sm text-gray-300 font-mono">
            {formatAddress(address)}
          </span>
        </div>
        
        {/* Disconnect Button */}
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
