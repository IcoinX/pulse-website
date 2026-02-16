import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserAssertion {
  id: number;
  eventId: number;
  eventTitle?: string;
  type: 'AGENT' | 'HUMAN';
  stakeAmount: string;
  status: 'PENDING' | 'CHALLENGED' | 'VERIFIED' | 'SLASHED';
  outcome: 'WIN' | 'LOSS' | 'ONGOING';
  reputationDelta: number;
  claimHash: string;
  createdAt: string;
  txHash: string;
  challenge?: {
    challenger: string;
    counterHash: string;
    stakeAmount: string;
    txHash: string;
  };
  resolution?: {
    outcome: 'UPHELD' | 'SLASHED';
    rewardAmount: string;
    protocolFee: string;
    txHash: string;
  };
}

export function useUserAssertions(walletAddress: string | null) {
  const [assertions, setAssertions] = useState<UserAssertion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setAssertions([]);
      return;
    }

    async function fetchAssertions() {
      setLoading(true);
      setError(null);

      try {
        // Query assertions where asserter == walletAddress
        const { data, error: supaError } = await supabase
          .from('assertions')
          .select(`
            *,
            canonical_events(event_id, title),
            challenges(*)
          `)
          .eq('asserter', walletAddress.toLowerCase())
          .order('created_at', { ascending: false });

        if (supaError) throw supaError;

        // Transform data
        const transformed: UserAssertion[] = (data || []).map(row => ({
          id: row.assertion_id,
          eventId: row.event_id,
          eventTitle: row.canonical_events?.title,
          type: row.assertion_type === 0 ? 'AGENT' : 'HUMAN',
          stakeAmount: formatEther(row.stake_amount),
          status: row.status,
          outcome: getOutcome(row.status, row.outcome),
          reputationDelta: row.reputation_delta || 0,
          claimHash: row.claim_hash,
          createdAt: row.created_at,
          txHash: row.tx_hash,
          challenge: row.challenges ? {
            challenger: row.challenges.challenger,
            counterHash: row.challenges.counter_hash,
            stakeAmount: formatEther(row.challenges.stake_amount),
            txHash: row.challenges.tx_hash
          } : undefined,
          resolution: row.resolution_outcome ? {
            outcome: row.resolution_outcome,
            rewardAmount: formatEther(row.reward_amount),
            protocolFee: formatEther(row.protocol_fee),
            txHash: row.resolution_tx_hash
          } : undefined
        }));

        setAssertions(transformed);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAssertions();
  }, [walletAddress]);

  return { assertions, loading, error };
}

function formatEther(wei: string): string {
  return (parseInt(wei) / 1e18).toFixed(4) + ' ETH';
}

function getOutcome(status: string, outcome: string): 'WIN' | 'LOSS' | 'ONGOING' {
  if (status === 'VERIFIED') return 'WIN';
  if (status === 'SLASHED') return 'LOSS';
  return 'ONGOING';
}
