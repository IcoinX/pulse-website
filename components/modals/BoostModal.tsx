'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Clock, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { useAccount, useNetwork, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { TIER_PRICES, TIER_LABELS, getExplorerUrl } from '@/lib/wallet';
import { boostEvent } from '@/lib/contracts';
import toast from 'react-hot-toast';

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  eventTitle: string;
}

const TIERS = [
  { id: 0, duration: '24h', description: 'Short-term visibility', multiplier: '1x' },
  { id: 1, duration: '72h', description: 'Extended promotion', multiplier: '2x' },
  { id: 2, duration: '7d', description: 'Maximum exposure', multiplier: '5x' },
];

export default function BoostModal({ isOpen, onClose, eventId, eventTitle }: BoostModalProps) {
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: walletClient } = useWalletClient();

  const handleBoost = async () => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    const price = TIER_PRICES[selectedTier as keyof typeof TIER_PRICES];
    if (!price) {
      toast.error('Invalid tier selected');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create ethers signer from wallet client
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();

      const receipt = await boostEvent(eventId, selectedTier, price, signer, chain?.id);
      
      if (receipt && receipt.transactionHash) {
        setTxHash(receipt.transactionHash);
        toast.success('Event boosted successfully!');
      }
    } catch (error: any) {
      console.error('Boost error:', error);
      
      // Handle specific errors
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for transaction');
      } else {
        toast.error(error.message || 'Failed to boost event');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTxHash(null);
    setSelectedTier(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Boost Event</h3>
                  <p className="text-xs text-gray-400">Increase visibility on the feed</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {txHash ? (
                // Success State
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Boost Successful!</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Your boost has been confirmed on-chain.
                  </p>
                  <a
                    href={chain?.id ? getExplorerUrl(txHash, chain.id) : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-purple-400 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on BaseScan
                  </a>
                </div>
              ) : (
                <>
                  {/* Event Info */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Event #{eventId}</p>
                    <p className="text-sm text-white line-clamp-2">{eventTitle}</p>
                  </div>

                  {/* Tier Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">Select Duration</label>
                    {TIERS.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id)}
                        disabled={isLoading}
                        className={`w-full p-4 rounded-xl border transition-all duration-200 ${
                          selectedTier === tier.id
                            ? 'bg-orange-500/10 border-orange-500/50'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className={`w-5 h-5 ${
                              selectedTier === tier.id ? 'text-orange-400' : 'text-gray-400'
                            }`} />
                            <div className="text-left">
                              <p className={`font-medium ${
                                selectedTier === tier.id ? 'text-white' : 'text-gray-300'
                              }`}>
                                {tier.duration}
                              </p>
                              <p className="text-xs text-gray-500">{tier.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              selectedTier === tier.id ? 'text-orange-400' : 'text-gray-300'
                            }`}>
                              {TIER_PRICES[tier.id as keyof typeof TIER_PRICES]} ETH
                            </p>
                            <p className="text-xs text-gray-500">{tier.multiplier}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Selected Tier</span>
                      <span className="text-white font-medium">
                        {TIER_LABELS[selectedTier]} ({TIER_PRICES[selectedTier as keyof typeof TIER_PRICES]} ETH)
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleBoost}
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Confirm Boost
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center text-gray-500">
                    Boosts are non-refundable and subject to protocol fees.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
