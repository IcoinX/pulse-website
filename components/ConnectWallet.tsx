'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { formatAddress, SUPPORTED_CHAINS, switchToChain } from '@/lib/wallet';
import { Wallet, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWrongChain, setIsWrongChain] = useState(false);

  // Check if on correct chain (Base Sepolia for testnet)
  const isSupportedChain = chain?.id && (chain.id === 84532 || chain.id === 8453);

  // Handle chain switch
  const handleSwitchChain = async () => {
    try {
      // Default to Base Sepolia (84532)
      const targetChainId = 84532;
      await switchToChain(targetChainId);
    } catch (error) {
      console.error('Error switching chain:', error);
    }
  };

  // Custom ConnectButton rendering
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain: rainbowChain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected = ready && account && rainbowChain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
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

              if (rainbowChain.unsupported || !isSupportedChain) {
                return (
                  <button
                    onClick={handleSwitchChain}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 text-sm font-medium rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all duration-200"
                  >
                    <span>Wrong Network</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                );
              }

              return (
                <div className="relative">
                  {/* Main Button with Dropdown */}
                  <div className="flex items-center gap-2">
                    {/* Chain Badge */}
                    <button
                      onClick={openChainModal}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/5 text-gray-300 text-xs font-medium rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      {rainbowChain.hasIcon && (
                        <div
                          style={{
                            background: rainbowChain.iconBackground,
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {rainbowChain.iconUrl && (
                            <img
                              alt={rainbowChain.name ?? 'Chain icon'}
                              src={rainbowChain.iconUrl}
                              style={{ width: 16, height: 16 }}
                            />
                          )}
                        </div>
                      )}
                      <span>{rainbowChain.name?.split(' ')[0] || 'Base'}</span>
                    </button>

                    {/* Account Button */}
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white text-sm font-medium rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-purple-400" />
                      <span>{formatAddress(account.address)}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                      {/* Balance Info */}
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-xs text-gray-500 mb-1">Balance</p>
                        <BalanceDisplay address={account.address} />
                      </div>

                      {/* Menu Items */}
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

                  {/* Click outside to close */}
                  {isDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                  )}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

// Balance display component
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
