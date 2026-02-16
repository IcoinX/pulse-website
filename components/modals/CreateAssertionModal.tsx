'use client';

import { useState } from 'react';
import { useCreateAssertion, ASSERTION_TYPES } from '@/hooks/useCreateAssertion';

interface CreateAssertionModalProps {
  eventId: number;
  eventTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAssertionModal({ eventId, eventTitle, isOpen, onClose, onSuccess }: CreateAssertionModalProps) {
  const [assertionType, setAssertionType] = useState<0 | 1>(0);
  const [summary, setSummary] = useState('');
  const [evidenceRefs, setEvidenceRefs] = useState('');
  const { create, reset, state, isCreating, minStake } = useCreateAssertion();

  if (!isOpen) return null;

  const handleCreate = async () => {
    const refs = evidenceRefs.split('\n').filter(r => r.trim());
    await create({
      eventId,
      assertionType,
      stake: minStake,
      summary,
      evidenceRefs: refs
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Success state
  if (state.status === 'confirmed') {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-green-500/30">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Assertion Created!</h3>
            <p className="text-gray-400 mb-2">{ASSERTION_TYPES[assertionType as 0 | 1].label} on Event #{eventId}</p>
            <p className="text-sm text-gray-500 mb-4">Status: PENDING (open to challenge for 48h)</p>
            <a 
              href={`https://sepolia.basescan.org/tx/${state.txHash}`}
              target="_blank"
              rel="noopener"
              className="text-blue-400 hover:underline text-sm block mb-4"
            >
              View on BaseScan →
            </a>
            <button 
              onClick={() => { handleClose(); onSuccess(); }}
              className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.status === 'error') {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-red-500/30">
          <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
          <p className="text-red-400 mb-4">{state.error}</p>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
              Retry
            </button>
            <button onClick={handleClose} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Create Certified Assertion</h3>
            <p className="text-sm text-gray-400">Event #{eventId} {eventTitle && `• ${eventTitle}`}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Type selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Assertion Type</label>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(ASSERTION_TYPES) as [string, typeof ASSERTION_TYPES[0]][]).map(([key, type]) => (
              <button
                key={key}
                onClick={() => setAssertionType(parseInt(key) as 0 | 1)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  assertionType === parseInt(key)
                    ? `border-${type.color}-500 bg-${type.color}-500/10`
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className={`font-medium text-${type.color}-400`}>{type.label}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {type.name === 'Agent' ? 'AI/Autonomous system' : 'Human verified claim'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Describe the assertion..."
            className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 resize-none"
            rows={3}
          />
        </div>

        {/* Evidence refs */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Evidence Links (one per line)
          </label>
          <textarea
            value={evidenceRefs}
            onChange={(e) => setEvidenceRefs(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 resize-none font-mono text-sm"
            rows={3}
          />
        </div>

        {/* Stake info */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Required Stake</span>
            <span className="text-xl font-semibold text-white">{minStake} ETH</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Minimum stake to create a certified assertion. If challenged and slashed, you lose this amount.
          </p>
        </div>

        {/* Action */}
        {state.status === 'pending' ? (
          <div className="text-center py-4">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Confirming transaction...</p>
            <a href={`https://sepolia.basescan.org/tx/${state.txHash}`} target="_blank" rel="noopener" className="text-blue-400 hover:underline text-sm mt-2 inline-block">
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
            onClick={handleCreate}
            disabled={!summary.trim() || isCreating}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800/50 text-white rounded-lg font-medium transition-colors"
          >
            {!summary.trim() ? 'Enter a summary' : `Create for ${minStake} ETH`}
          </button>
        )}
      </div>
    </div>
  );
}

export default CreateAssertionModal;
