'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { useChallengeAssertion } from '@/hooks/useChallengeAssertion';
import { useWallet } from '@/hooks/useWallet';
import { formatAddress, getExplorerUrl } from '@/lib/wallet';

interface ChallengeModalProps {
  assertion: {
    id?: number;
    assertionId?: number;
    eventId: number;
    asserter: string;
    type: 0 | 1;
    claimHash?: string;
    stakeAmount: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChallengeModal({ assertion, isOpen, onClose, onSuccess }: ChallengeModalProps) {
  const [evidenceSummary, setEvidenceSummary] = useState('');
  const [evidenceRefs, setEvidenceRefs] = useState('');
  const { address, chainId } = useWallet();
  
  const { challenge, reset, state, isChallenging, requiredStake } = useChallengeAssertion(
    assertion.stakeAmount
  );

  if (!isOpen) return null;

  const assertionId = assertion.id ?? assertion.assertionId ?? 0;
  
  const handleChallenge = async () => {
    const refs = evidenceRefs.split('\n').filter(r => r.trim());
    await challenge(assertionId, assertion.asserter, {
      evidenceSummary,
      evidenceRefs: refs
    });
  };

  const handleClose = () => {
    reset();
    setEvidenceSummary('');
    setEvidenceRefs('');
    onClose();
  };

  const isSelfChallenge = address?.toLowerCase() === assertion.asserter.toLowerCase();
  const isWrongChain = chainId !== 84532;

  // Success state
  if (state.status === 'confirmed') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-orange-500/30"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Challenge Submitted!</h3>
              <p className="text-gray-400 mb-2">Assertion #{assertionId} is now CHALLENGED</p>
              <p className="text-sm text-orange-400 mb-4">The assertion will be reviewed by the guardian</p>
              <a 
                href={getExplorerUrl(state.txHash, chainId || 84532)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline text-sm block mb-4"
              >
                View on BaseScan →
              </a>
              <button 
                onClick={() => { handleClose(); onSuccess(); }}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors"
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-red-500/30"
          >
            <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
            <p className="text-red-400 mb-4">{state.error}</p>
            <div className="flex gap-3">
              <button 
                onClick={reset} 
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
              <button 
                onClick={handleClose} 
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 border border-orange-500/30 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Challenge Assertion</h3>
              <p className="text-sm text-gray-400">Assertion #{assertionId} by {formatAddress(assertion.asserter)}</p>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Warning box */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-orange-400 font-medium">Risk Warning</p>
                <p className="text-sm text-gray-400">
                  If the guardian upholds the original assertion, you will lose your stake 
                  ({requiredStake} ETH) and receive -30 reputation.
                </p>
              </div>
            </div>
          </div>

          {/* Wrong chain warning */}
          {isWrongChain && address && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">Please switch to Base Sepolia to challenge</p>
            </div>
          )}

          {/* Original assertion summary */}
          {assertion.claimHash && (
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Original Assertion</p>
              <p className="text-sm font-mono text-gray-300 break-all">{assertion.claimHash}</p>
            </div>
          )}

          {/* Challenge evidence */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Your Counter-Evidence Summary
            </label>
            <textarea
              value={evidenceSummary}
              onChange={(e) => setEvidenceSummary(e.target.value)}
              placeholder="Explain why this assertion is incorrect..."
              className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              rows={3}
              disabled={isChallenging}
            />
          </div>

          {/* Evidence refs */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Supporting Evidence Links (one per line)
            </label>
            <textarea
              value={evidenceRefs}
              onChange={(e) => setEvidenceRefs(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              rows={3}
              disabled={isChallenging}
            />
          </div>

          {/* Stake info */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Required Stake</span>
              <span className="text-xl font-semibold text-white">{requiredStake} ETH</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Must match the original assertion stake
            </p>
          </div>

          {/* Self-challenge warning */}
          {isSelfChallenge && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">You cannot challenge your own assertion</p>
            </div>
          )}

          {/* Action */}
          {state.status === 'pending' ? (
            <div className="text-center py-4">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Confirming challenge...</p>
              <a 
                href={getExplorerUrl(state.txHash, chainId || 84532)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:underline text-sm mt-2 inline-block"
              >
                View on BaseScan →
              </a>
            </div>
          ) : state.status === 'awaiting_signature' ? (
            <div className="text-center py-4">
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Waiting for signature...</p>
            </div>
          ) : (
            <button
              onClick={handleChallenge}
              disabled={!evidenceSummary.trim() || isChallenging || isSelfChallenge || isWrongChain}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {!evidenceSummary.trim() ? (
                'Enter counter-evidence'
              ) : isSelfChallenge ? (
                'Cannot challenge own assertion'
              ) : isWrongChain ? (
                'Switch to Base Sepolia'
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  Challenge for {requiredStake} ETH
                </>
              )}
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
