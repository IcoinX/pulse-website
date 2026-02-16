'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useResolveAssertion, Outcome } from '@/hooks/useResolveAssertion';
import { isGuardian } from '@/lib/guardian';
import { supabase } from '@/lib/supabase';
import { formatAddress } from '@/lib/wallet';
import Link from 'next/link';

interface ChallengedAssertion {
  id: number;
  assertion_id: number;
  event_id: number;
  asserter: string;
  assertion_type: number;
  claim_hash: string;
  stake_amount: string;
  created_at: string;
  challenge?: {
    challenger: string;
    counter_hash: string;
    stake_amount: string;
    created_at: string;
  };
}

export default function AdminResolvePage() {
  const { address, isConnected, chainId } = useWallet();
  const { resolve, state, isResolving } = useResolveAssertion();
  const [assertions, setAssertions] = useState<ChallengedAssertion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssertion, setSelectedAssertion] = useState<ChallengedAssertion | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingOutcome, setPendingOutcome] = useState<Outcome | null>(null);

  const isGuard = isGuardian(address);

  useEffect(() => {
    async function fetchChallenged() {
      const { data, error } = await supabase
        .from('assertions')
        .select(`
          *,
          challenges(*)
        `)
        .eq('status', 'CHALLENGED')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAssertions(data);
      }
      setLoading(false);
    }

    if (isGuard) {
      fetchChallenged();
    }
  }, [isGuard, state.status]);

  const handleResolve = async () => {
    if (!selectedAssertion || !pendingOutcome) return;
    
    await resolve(selectedAssertion.assertion_id, pendingOutcome);
    setShowConfirmModal(false);
    setSelectedAssertion(null);
    setPendingOutcome(null);
  };

  const openConfirm = (assertion: ChallengedAssertion, outcome: Outcome) => {
    setSelectedAssertion(assertion);
    setPendingOutcome(outcome);
    setShowConfirmModal(true);
  };

  if (!isConnected) {
    return <div className="p-8 text-center">Connect wallet to access</div>;
  }

  if (chainId !== 84532) {
    return <div className="p-8 text-center">Switch to Base Sepolia</div>;
  }

  if (!isGuard) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-gray-400">This page is restricted to guardians.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Guardian Resolution</h1>
        <p className="text-gray-400">Resolve challenged assertions</p>
        <div className="mt-2 text-sm text-purple-400">
          Guardian: {formatAddress(address || '')}
        </div>
      </div>

      {state.status === 'confirmed' && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400">✅ Resolution confirmed!</p>
          <a 
            href={`https://sepolia.basescan.org/tx/${state.txHash}`}
            target="_blank"
            rel="noopener"
            className="text-blue-400 hover:underline text-sm"
          >
            View tx →
          </a>
        </div>
      )}

      {state.status === 'error' && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">❌ Error: {state.error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : assertions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No challenged assertions awaiting resolution
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50 text-left">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">ID</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Event</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Asserter</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Challenger</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Total Stake</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Age</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {assertions.map(a => {
                const totalStake = parseFloat(a.stake_amount) + parseFloat(a.challenge?.stake_amount || '0');
                const age = Math.floor((Date.now() - new Date(a.created_at).getTime()) / 3600000);
                
                return (
                  <tr key={a.id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-mono">#{a.assertion_id}</td>
                    <td className="px-4 py-3">
                      <Link href={`/event/${a.event_id}`} className="text-blue-400 hover:underline">
                        Event #{a.event_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{formatAddress(a.asserter || '')}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {a.challenge ? formatAddress(a.challenge.challenger || '') : '-'}
                    </td>
                    <td className="px-4 py-3">{(totalStake / 1e18).toFixed(4)} ETH</td>
                    <td className="px-4 py-3 text-gray-400">{age}h ago</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openConfirm(a, 'UPHELD')}
                          disabled={isResolving}
                          className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded text-sm"
                        >
                          ✅ Uphold
                        </button>
                        <button
                          onClick={() => openConfirm(a, 'SLASHED')}
                          disabled={isResolving}
                          className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded text-sm"
                        >
                          ❌ Slash
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedAssertion && pendingOutcome && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Resolution</h3>
            
            <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-400">Assertion #{selectedAssertion.assertion_id}</p>
              <p className={`text-lg font-medium ${
                pendingOutcome === 'UPHELD' ? 'text-green-400' : 'text-red-400'
              }`}>
                {pendingOutcome === 'UPHELD' ? '✅ Uphold Assertion' : '❌ Slash Assertion'}
              </p>
            </div>

            <div className="space-y-2 mb-6 text-sm">
              <p className="text-gray-400">
                <span className="text-white">Asserter:</span> {formatAddress(selectedAssertion.asserter || '')}
              </p>
              <p className="text-gray-400">
                <span className="text-white">Challenger:</span> {formatAddress(selectedAssertion.challenge?.challenger || '')}
              </p>
              <p className="text-yellow-400 mt-4">
                ⚠️ This action is final and will slash stake.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={isResolving}
                className={`flex-1 py-3 rounded-lg font-medium ${
                  pendingOutcome === 'UPHELD'
                    ? 'bg-green-600 hover:bg-green-500'
                    : 'bg-red-600 hover:bg-red-500'
                } text-white disabled:opacity-50`}
              >
                {isResolving ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
