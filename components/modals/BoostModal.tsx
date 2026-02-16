'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, CheckCircle, ExternalLink } from 'lucide-react';
import { useBoost, BOOST_TIERS } from '@/hooks/useBoost';
import type { BoostParams } from '@/lib/contracts';

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  eventTitle: string;
}

export default function BoostModal({ isOpen, onClose, eventId, eventTitle }: BoostModalProps) {
  const [selectedTier, setSelectedTier] = useState<0 | 1 | 2>(0);
  const { boost, reset, state, isBoosting } = useBoost();

  if (!isOpen) return null;

  const tier = BOOST_TIERS[selectedTier];

  const handleBoost = async () => {
    await boost({ eventId, tier: selectedTier, value: tier.price });
  };

  const handleClose = () => {
    reset();
    setSelectedTier(0);
    onClose();
  };

  // Success state
  if (state.status === 'confirmed') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-green-500/30"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Boost Confirmed!</h3>
              <p className="text-gray-400 mb-4">Event #{eventId} is now boosted for {tier.name}</p>
              <a 
                href={`https://sepolia.basescan.org/tx/${state.txHash}`}
                target="_blank"
                rel="noopener"
                className="text-blue-400 hover:underline text-sm block mb-4"
              >
                View on BaseScan →
              </a>
              <button 
                onClick={handleClose}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Error state
  if (state.status === 'error') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-red-500/30"
          >
            <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
            <p className="text-red-400 mb-4">{state.error}</p>
            <div className="flex gap-3">
              <button 
                onClick={reset}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Retry
              </button>
              <button 
                onClick={handleClose}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Main modal
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Boost Event #{eventId}</h3>
                <p className="text-xs text-gray-400">Increase visibility for this event</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Event Info */}
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-6">
            <p className="text-xs text-gray-500 mb-1">Event #{eventId}</p>
            <p className="text-sm text-white line-clamp-2">{eventTitle}</p>
          </div>

          {/* Tier selector */}
          <div className="space-y-3 mb-6">
            {(Object.entries(BOOST_TIERS) as [string, typeof BOOST_TIERS[0]][]).map(([key, t]) => (
              <label 
                key={key}
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedTier === parseInt(key) 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="tier"
                    checked={selectedTier === parseInt(key)}
                    onChange={() => setSelectedTier(parseInt(key) as 0 | 1 | 2)}
                    className="w-4 h-4 text-orange-500"
                  />
                  <div>
                    <div className="font-medium text-white">{t.name}</div>
                    <div className="text-sm text-gray-400">{t.duration / 3600} hours visibility</div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-white">{t.price} ETH</div>
              </label>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Duration</span>
              <span className="text-white">{tier.name}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Amount</span>
              <span className="text-white">{tier.price} ETH</span>
            </div>
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total</span>
                <span className="text-xl font-semibold text-white">{tier.price} ETH</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {state.status === 'pending' ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Confirming transaction...</p>
              <a 
                href={`https://sepolia.basescan.org/tx/${state.txHash}`}
                target="_blank"
                rel="noopener"
                className="text-blue-400 hover:underline text-sm mt-2 inline-block"
              >
                View on BaseScan →
              </a>
            </div>
          ) : state.status === 'awaiting_signature' ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Waiting for signature...</p>
            </div>
          ) : (
            <button 
              onClick={handleBoost}
              disabled={isBoosting}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {isBoosting ? 'Processing...' : `Boost for ${tier.price} ETH`}
            </button>
          )}

          <p className="text-xs text-center text-gray-500 mt-4">
            Boosts are non-refundable and subject to protocol fees.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
