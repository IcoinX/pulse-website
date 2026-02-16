'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { useAccount, useBalance, useNetwork, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { getExplorerUrl } from '@/lib/wallet';
import { challengeAssertion } from '@/lib/contracts';
import toast from 'react-hot-toast';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  assertionId: number;
  eventId: number;
  eventTitle: string;
  originalStake: string;
  asserterAddress: string;
}

export default function ChallengeModal({ 
  isOpen, 
  onClose, 
  assertionId, 
  eventId, 
  eventTitle, 
  originalStake,
  asserterAddress 
}: ChallengeModalProps) {
  const [counterHash, setCounterHash] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [stakeAmount, setStakeAmount] = useState(originalStake);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: balance } = useBalance({ address: address as `0x${string}` });
  const { data: walletClient } = useWalletClient();

  const hasEnoughBalance = balance && parseFloat(balance.formatted) >= parseFloat(stakeAmount);

  const handleSubmit = async () => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (address.toLowerCase() === asserterAddress.toLowerCase()) {
      toast.error('You cannot challenge your own assertion');
      return;
    }

    if (parseFloat(stakeAmount) < parseFloat(originalStake)) {
      toast.error(`Must stake at least ${originalStake} ETH (same as asserter)`);
      return;
    }

    if (!counterHash) {
      toast.error('Please provide a counter-evidence hash');
      return;
    }

    // Validate counterHash is bytes32 format
    if (!counterHash.startsWith('0x') || counterHash.length !== 66) {
      toast.error('Counter hash must be a valid bytes32 (0x + 64 hex characters)');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create ethers signer from wallet client
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();

      const receipt = await challengeAssertion(
        assertionId, 
        counterHash as `0x${string}`, 
        stakeAmount, 
        signer, 
        chain?.id
      );
      
      if (receipt && receipt.transactionHash) {
        setTxHash(receipt.transactionHash);
        toast.success('Challenge submitted successfully!');
      }
    } catch (error: any) {
      console.error('Challenge error:', error);
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for transaction');
      } else if (error.message?.includes('Assertion already resolved')) {
        toast.error('This assertion has already been resolved');
      } else if (error.message?.includes('Challenge deadline passed')) {
        toast.error('Challenge deadline has passed');
      } else {
        toast.error(error.message || 'Failed to submit challenge');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTxHash(null);
    setCounterHash('');
    setEvidenceUrl('');
    setStakeAmount(originalStake);
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-red-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Challenge Assertion</h3>
                  <p className="text-xs text-gray-400">Dispute this assertion with evidence</p>
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
                  <h4 className="text-lg font-semibold text-white mb-2">Challenge Submitted!</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Your challenge has been recorded on-chain.
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
                  {/* Assertion Info */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Assertion #{assertionId}</span>
                      <span className="text-xs text-gray-500">Event #{eventId}</span>
                    </div>
                    <p className="text-sm text-white line-clamp-2 mb-3">{eventTitle}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-400">
                        Asserter: <span className="text-gray-300 font-mono">{asserterAddress.slice(0, 8)}...{asserterAddress.slice(-6)}</span>
                      </span>
                      <span className="text-gray-400">
                        Staked: <span className="text-orange-400">{originalStake} ETH</span>
                      </span>
                    </div>
                  </div>

                  {/* Counter Hash Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Counter-Evidence Hash <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={counterHash}
                      onChange={(e) => setCounterHash(e.target.value)}
                      placeholder="0x... (bytes32 hash of your evidence)"
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors font-mono"
                    />
                    <p className="text-xs text-gray-500">
                      A hash representing your counter-evidence. Must match the format of the original claim.
                    </p>
                  </div>

                  {/* Evidence URL */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Evidence URL <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      placeholder="https://... (link to supporting evidence)"
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                    />
                  </div>

                  {/* Stake Amount */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">Your Stake (ETH)</label>
                      <span className="text-xs text-orange-400">
                        Must match or exceed: {originalStake} ETH
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.001"
                      min={originalStake}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                    />
                    {!hasEnoughBalance && balance && (
                      <div className="flex items-center gap-1.5 text-xs text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Insufficient balance. You have {parseFloat(balance.formatted).toFixed(4)} ETH
                      </div>
                    )}
                  </div>

                  {/* How it Works */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <p className="text-sm font-medium text-white">How Challenges Work</p>
                    <ol className="space-y-2 text-xs text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                        <span>You stake equal or greater amount than the asserter</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                        <span>Validators review both claims and evidence</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                        <span>If you win, you receive the loser's stake minus protocol fee</span>
                      </li>
                    </ol>
                  </div>

                  {/* Warning */}
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-400 mb-1">Risk Warning</p>
                        <p className="text-xs text-gray-400">
                          If your challenge is unsuccessful, your stake will be slashed and 
                          transferred to the asserter. Only challenge if you have strong evidence.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !hasEnoughBalance}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting Challenge...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5" />
                        Submit Challenge
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
