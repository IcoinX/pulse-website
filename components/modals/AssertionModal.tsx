'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Bot, User, Loader2, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { useAccount, useBalance, useNetwork, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { getExplorerUrl, MIN_STAKE } from '@/lib/wallet';
import { createAssertion, AssertionType } from '@/lib/contracts';
import toast from 'react-hot-toast';

interface AssertionModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  eventTitle: string;
}

const ASSERTION_TYPES = [
  { 
    id: AssertionType.AGENT, 
    label: 'Agent Generated', 
    description: 'Content was created by an AI agent',
    icon: Bot,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30'
  },
  { 
    id: AssertionType.HUMAN, 
    label: 'Human Created', 
    description: 'Content was created by a human',
    icon: User,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30'
  },
];

export default function AssertionModal({ isOpen, onClose, eventId, eventTitle }: AssertionModalProps) {
  const [selectedType, setSelectedType] = useState<AssertionType>(AssertionType.AGENT);
  const [claimHash, setClaimHash] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [stakeAmount, setStakeAmount] = useState(MIN_STAKE);
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

    if (parseFloat(stakeAmount) < parseFloat(MIN_STAKE)) {
      toast.error(`Minimum stake is ${MIN_STAKE} ETH`);
      return;
    }

    if (!claimHash) {
      toast.error('Please provide a claim hash');
      return;
    }

    // Validate claimHash is bytes32 format
    if (!claimHash.startsWith('0x') || claimHash.length !== 66) {
      toast.error('Claim hash must be a valid bytes32 (0x + 64 hex characters)');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create ethers signer from wallet client
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();

      const receipt = await createAssertion(
        eventId, 
        selectedType, 
        claimHash as `0x${string}`, 
        stakeAmount, 
        signer, 
        chain?.id
      );
      
      if (receipt && receipt.transactionHash) {
        setTxHash(receipt.transactionHash);
        toast.success('Assertion created successfully!');
      }
    } catch (error: any) {
      console.error('Assertion error:', error);
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for transaction');
      } else {
        toast.error(error.message || 'Failed to create assertion');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTxHash(null);
    setSelectedType(AssertionType.AGENT);
    setClaimHash('');
    setEvidenceUrl('');
    setStakeAmount(MIN_STAKE);
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Add Assertion</h3>
                  <p className="text-xs text-gray-400">Verify the origin of this event</p>
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
                  <h4 className="text-lg font-semibold text-white mb-2">Assertion Created!</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Your assertion has been submitted to the protocol.
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

                  {/* Type Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">Assertion Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {ASSERTION_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            disabled={isLoading}
                            className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                              selectedType === type.id
                                ? type.bgColor
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <Icon className={`w-6 h-6 mb-2 ${
                              selectedType === type.id ? type.color : 'text-gray-400'
                            }`} />
                            <p className={`font-medium ${
                              selectedType === type.id ? 'text-white' : 'text-gray-300'
                            }`}>
                              {type.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Claim Hash Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Claim Hash</label>
                    <input
                      type="text"
                      value={claimHash}
                      onChange={(e) => setClaimHash(e.target.value)}
                      placeholder="0x... (bytes32 hash)"
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                    />
                    <p className="text-xs text-gray-500">
                      A unique hash representing your claim. Used for verification.
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
                      placeholder="https://..."
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>

                  {/* Stake Amount */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">Stake Amount (ETH)</label>
                      <span className="text-xs text-gray-500">
                        Min: {MIN_STAKE} ETH
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.001"
                      min={MIN_STAKE}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                    {!hasEnoughBalance && balance && (
                      <div className="flex items-center gap-1.5 text-xs text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Insufficient balance. You have {parseFloat(balance.formatted).toFixed(4)} ETH
                      </div>
                    )}
                  </div>

                  {/* Warning */}
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-400 mb-1">Risk Warning</p>
                        <p className="text-xs text-gray-400">
                          Assertions can be challenged. If your assertion is proven false, 
                          your stake will be slashed and transferred to the challenger.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !hasEnoughBalance}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Assertion...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Submit Assertion
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
