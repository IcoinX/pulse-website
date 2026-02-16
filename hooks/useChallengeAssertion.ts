'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { challengeAssertion, ChallengeParams, generateClaimHash, ASSERTIONS_ABI } from '@/lib/contracts';
import { useWallet } from './useWallet';
import { isWhitelisted } from '@/lib/whitelist';
import { CONTRACTS } from '@/lib/wallet';

type ChallengeState = 
  | { status: 'idle' }
  | { status: 'awaiting_signature' }
  | { status: 'pending'; txHash: string }
  | { status: 'confirmed'; txHash: string; challengeId?: number }
  | { status: 'error'; error: string };

interface ChallengeFormData {
  evidenceSummary: string;
  evidenceRefs: string[];
}

export function useChallengeAssertion(assertionStake: string) {
  const { signer, chainId, address } = useWallet();
  const [state, setState] = useState<ChallengeState>({ status: 'idle' });

  const canChallenge = useCallback((asserterAddress: string): { ok: boolean; reason: string } => {
    if (!signer) return { ok: false, reason: 'Wallet not connected' };
    if (chainId !== 84532) return { ok: false, reason: 'Please switch to Base Sepolia' };
    if (!isWhitelisted(address)) return { ok: false, reason: 'Challenges in limited test' };
    if (address?.toLowerCase() === asserterAddress.toLowerCase()) {
      return { ok: false, reason: 'Cannot challenge your own assertion' };
    }
    return { ok: true, reason: '' };
  }, [signer, chainId, address]);

  const challenge = useCallback(async (
    assertionId: number,
    asserterAddress: string,
    formData: ChallengeFormData
  ) => {
    const check = canChallenge(asserterAddress);
    if (!check.ok) {
      setState({ status: 'error', error: check.reason });
      return;
    }

    setState({ status: 'awaiting_signature' });

    try {
      // Generate counter hash from challenge evidence
      const counterHash = generateClaimHash({
        type: 'HUMAN', // Doesn't matter for challenges
        summary: formData.evidenceSummary,
        evidenceRefs: formData.evidenceRefs,
        timestamp: Date.now()
      });

      const params: ChallengeParams = {
        assertionId,
        counterHash,
        stake: assertionStake
      };

      const tx = await challengeAssertion(params, signer!, chainId || 84532);
      
      setState({ status: 'pending', txHash: tx.hash });
      
      const receipt = await tx.wait(2);
      
      if (receipt?.status === 1) {
        const challengeId = parseChallengeIdFromReceipt(receipt);
        setState({ status: 'confirmed', txHash: tx.hash, challengeId });
      } else {
        setState({ status: 'error', error: 'Transaction failed' });
      }
    } catch (err: any) {
      if (err.code === 'ACTION_REJECTED') {
        setState({ status: 'error', error: 'User rejected signature' });
      } else if (err.message?.includes('Cannot challenge own')) {
        setState({ status: 'error', error: 'Cannot challenge your own assertion' });
      } else if (err.message?.includes('Not challengeable')) {
        setState({ status: 'error', error: 'Assertion is not challengeable (already challenged or resolved)' });
      } else {
        setState({ status: 'error', error: err.message || 'Unknown error' });
      }
    }
  }, [canChallenge, signer, assertionStake, chainId]);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return {
    challenge,
    reset,
    state,
    isChallenging: state.status === 'awaiting_signature' || state.status === 'pending',
    requiredStake: assertionStake
  };
}

function parseChallengeIdFromReceipt(receipt: ethers.ContractReceipt): number | undefined {
  try {
    // AssertionChallenged event signature hash
    // event AssertionChallenged(uint256 indexed assertionId, uint256 indexed challengeId, address indexed challenger, uint256 stakeAmount, bytes32 counterHash)
    const ASSERTION_CHALLENGED_SIGNATURE = '0xd2e9f7806387f0ec362fcbc665e298e7ae0eb9f7647674a3a5b33b1793b247c8';
    
    const eventLog = receipt.logs.find(log => 
      log.topics[0] === ASSERTION_CHALLENGED_SIGNATURE
    );
    if (eventLog) {
      // challengeId is in topics[2] as indexed uint256
      return parseInt(eventLog.topics[2], 16);
    }
  } catch {}
  return undefined;
}
