// hooks/useResolveAssertion.ts — Hook for guardian resolution

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { isGuardian } from '@/lib/guardian';
import { CONTRACTS } from '@/lib/contracts';

const ASSERTIONS_ABI = [
  "function resolve(uint256 assertionId, uint8 outcome) external",
  "event AssertionResolved(uint256 indexed assertionId, uint8 outcome, address indexed slashedParty, uint256 rewardAmount)"
];

type ResolveState = 
  | { status: 'idle' }
  | { status: 'awaiting_signature' }
  | { status: 'pending'; txHash: string }
  | { status: 'confirmed'; txHash: string }
  | { status: 'error'; error: string };

export type Outcome = 'UPHELD' | 'SLASHED';

export function useResolveAssertion() {
  const { signer, chainId, address } = useWallet();
  const [state, setState] = useState<ResolveState>({ status: 'idle' });

  const canResolve = useCallback(() => {
    if (!signer) return { ok: false, reason: 'Wallet not connected' };
    if (chainId !== 84532) return { ok: false, reason: 'Please switch to Base Sepolia' };
    if (!isGuardian(address)) return { ok: false, reason: 'Only guardians can resolve' };
    return { ok: true };
  }, [signer, chainId, address]);

  const resolve = useCallback(async (assertionId: number, outcome: Outcome) => {
    const check = canResolve();
    if (!check.ok) {
      setState({ status: 'error', error: check.reason });
      return;
    }

    setState({ status: 'awaiting_signature' });

    try {
      const contract = new ethers.Contract(
        CONTRACTS[84532].assertions,
        ASSERTIONS_ABI,
        signer!
      );

      const outcomeCode = outcome === 'UPHELD' ? 1 : 2;
      
      const tx = await contract.resolve(assertionId, outcomeCode);
      
      setState({ status: 'pending', txHash: tx.hash });
      
      const receipt = await tx.wait(2);
      
      if (receipt?.status === 1) {
        setState({ status: 'confirmed', txHash: tx.hash });
      } else {
        setState({ status: 'error', error: 'Transaction failed' });
      }
    } catch (err: any) {
      if (err.code === 'ACTION_REJECTED') {
        setState({ status: 'error', error: 'User rejected signature' });
      } else if (err.message?.includes('Only guardian')) {
        setState({ status: 'error', error: 'Only guardians can resolve' });
      } else if (err.message?.includes('Not challenged')) {
        setState({ status: 'error', error: 'Assertion is not challenged' });
      } else {
        setState({ status: 'error', error: err.message || 'Unknown error' });
      }
    }
  }, [canResolve, signer]);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return {
    resolve,
    reset,
    state,
    isResolving: state.status === 'awaiting_signature' || state.status === 'pending',
    canResolve: canResolve().ok,
  };
}
