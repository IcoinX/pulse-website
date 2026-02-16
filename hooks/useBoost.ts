'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { boostEvent, BoostParams, BOOST_TIERS } from '@/lib/contracts';
import { useWallet } from './useWallet';

type BoostState = 
  | { status: 'idle' }
  | { status: 'preparing' }
  | { status: 'awaiting_signature' }
  | { status: 'pending'; txHash: string }
  | { status: 'confirmed'; txHash: string }
  | { status: 'error'; error: string };

export function useBoost() {
  const { signer, chainId } = useWallet();
  const [boostState, setBoostState] = useState<BoostState>({ status: 'idle' });

  const boost = useCallback(async (params: BoostParams) => {
    if (!signer) {
      setBoostState({ status: 'error', error: 'Wallet not connected' });
      return;
    }

    if (chainId !== 84532) {
      setBoostState({ status: 'error', error: 'Please switch to Base Sepolia' });
      return;
    }

    setBoostState({ status: 'awaiting_signature' });

    try {
      const tx = await boostEvent(params, signer);
      
      setBoostState({ status: 'pending', txHash: tx.hash });
      
      // Wait for 2 confirmations
      const receipt = await tx.wait(2);
      
      if (receipt?.status === 1) {
        setBoostState({ status: 'confirmed', txHash: tx.hash });
      } else {
        setBoostState({ status: 'error', error: 'Transaction failed' });
      }
    } catch (err: any) {
      if (err.code === 'ACTION_REJECTED') {
        setBoostState({ status: 'error', error: 'User rejected signature' });
      } else {
        setBoostState({ status: 'error', error: err.message || 'Unknown error' });
      }
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
    canBoost: boostState.status === 'idle' || boostState.status === 'error'
  };
}

export { BOOST_TIERS };
export type { BoostParams };
