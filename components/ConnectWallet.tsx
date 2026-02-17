'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { formatAddress } from '@/lib/wallet';
import { Wallet, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium rounded-lg opacity-50">
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted: rainbowMounted,
      }) => {
        const ready = rainbowMounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-purple-500/20"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          );
        }

        return (
          <div className="relative">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white text-sm font-medium rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Wallet className="w-4 h-4 text-purple-400" />
                <span>{formatAddress(account.address)}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-xs text-gray-500 mb-1">Balance</p>
                  <BalanceDisplay address={account.address} />
                </div>

                <div className="p-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      openAccountModal();
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    Account
                  </button>

                  <button
                    onClick={() => {
                      openConnectModal();
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              </div>
            )}

            {isDropdownOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

function BalanceDisplay({ address }: { address: string }) {
  const { data: balance } = useBalance({
    address: address as `0x${string}`,
  });

  if (!balance) {
    return <div className="text-sm text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-white">
        {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
      </span>
    </div>
  );
}
