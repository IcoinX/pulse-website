'use client';

import { useAuth } from '@/hooks/useAuth';

export default function ConnectButton() {
  const { user, isLoading, isConnected, connect, disconnect } = useAuth();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (isConnected && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-mono">
            {formatAddress(user.wallet_address)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="px-3 py-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
    >
      Connect Wallet
    </button>
  );
}
