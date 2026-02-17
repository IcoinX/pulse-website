'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { boostEvent, BoostParams, BOOST_TIERS } from '@/lib/contracts';
import { useWallet } from './useWallet';
import { isWhitelisted } from '@/lib/whitelist';
import { logBoostAttempt } from '@/lib/analytics';

type BoostState = 
  | { status: 'idle' }
  | { status: 'preparing' }
  | { status: 'awaiting_signature' }
  | { status: 'pending'; txHash: string }
  | { status: 'confirmed'; txHash: string }
  | { status: 'error'; error: string };

export function useBoost() {
  const { signer, chainId, address } = useWallet();
  const [boostState, setBoostState] = useState<BoostState>({ status: 'idle' });

  const canBoost = useCallback(() => {
    if (!signer) return { ok: false, reason: 'Wallet not connected' };
    if (chainId !== 84532) return { ok: false, reason: 'Please switch to Base Sepolia' };
    if (!isWhitelisted(address)) return { ok: false, reason: 'Boost in limited test' };
    return { ok: true };
  }, [signer, chainId, address]);

  const boost = useCallback(async (params: BoostParams) => {
    if (!signer) {
      setBoostState({ status: 'error', error: 'Wallet not connected' });
      return;
    }

    if (chainId !== 84532) {
      setBoostState({ status: 'error', error: 'Please switch to Base Sepolia' });
      return;
    }

    const userAddress = await signer.getAddress();
    const whitelisted = isWhitelisted(userAddress);

    if (!whitelisted) {
      setBoostState({ status: 'error', error: 'Boost in limited test' });
      logBoostAttempt({
        address: userAddress,
        whitelisted: false,
        eventId: params.eventId,
        tier: params.tier,
        success: false,
        error: 'Boost in limited test'
      });
      return;
    }

    setBoostState({ status: 'awaiting_signature' });

    try {
      const tx = await boostEvent(params, signer);
      
      setBoostState({ status: 'pending', txHash: tx.hash });
      
      // Wait for 2 confirmations
      const receipt = await tx.wait(2);
      
      const success = receipt?.status === 1;
      
      if (success) {
        setBoostState({ status: 'confirmed', txHash: tx.hash });
      } else {
        setBoostState({ status: 'error', error: 'Transaction failed' });
      }

      // Log the attempt
      logBoostAttempt({
        address: userAddress,
        whitelisted: true,
        eventId: params.eventId,
        tier: params.tier,
        success,
        error: receipt?.status !== 1 ? 'Transaction failed' : undefined
      });
    } catch (err: any) {
      let errorMessage = err.message || 'Unknown error';
      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'User rejected signature';
      }
      
      setBoostState({ status: 'error', error: errorMessage });
      
      // Log the failed attempt
      logBoostAttempt({
        address: userAddress,
        whitelisted: true,
        eventId: params.eventId,
        tier: params.tier,
        success: false,
        error: errorMessage
      });
    }
  }, [signer, chainId]);

  const reset = useCallback(() => {
    setBoostState({ status: 'idle' });
  }, []);

  return {
    boost,
    reset,
    state: boostState,
    isBoosting: boostState.status === 'awaiting_signature' || boostState.status === 'pending',
    canBoost: boostState.status === 'idle' || boostState.status === 'error',
    canBoostCheck: canBoost
  };
}

export { BOOST_TIERS };
export type { BoostParams };
