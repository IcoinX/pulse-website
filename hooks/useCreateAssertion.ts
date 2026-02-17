import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { createAssertion, CreateAssertionParams, generateClaimHash, MIN_ASSERTION_STAKE, ASSERTIONS_ABI } from '@/lib/contracts';
import { useWallet } from './useWallet';
import { isWhitelisted } from '@/lib/whitelist';
import { CONTRACTS } from '@/lib/wallet';

type CreateAssertionState = 
  | { status: 'idle' }
  | { status: 'preparing' }
  | { status: 'awaiting_signature' }
  | { status: 'pending'; txHash: string }
  | { status: 'confirmed'; txHash: string; assertionId?: number }
  | { status: 'error'; error: string };

export { ASSERTION_TYPES, MIN_ASSERTION_STAKE } from '@/lib/contracts';

export function useCreateAssertion() {
  const { signer, chainId, address } = useWallet();
  const [state, setState] = useState<CreateAssertionState>({ status: 'idle' });

  const canCreate = useCallback((): { ok: boolean; reason: string } => {
    if (!signer) return { ok: false, reason: 'Wallet not connected' };
    if (chainId !== 84532) return { ok: false, reason: 'Please switch to Base Sepolia' };
    if (!isWhitelisted(address)) return { ok: false, reason: 'Certified assertions in limited test' };
    return { ok: true, reason: '' };
  }, [signer, chainId, address]);

  const create = useCallback(async (params: Omit<CreateAssertionParams, 'claimHash'> & { summary: string; evidenceRefs: string[] }) => {
    const check = canCreate();
    if (!check.ok) {
      setState({ status: 'error', error: check.reason });
      return;
    }

    setState({ status: 'awaiting_signature' });

    try {
      // Generate claim hash
      const claimHash = generateClaimHash({
        type: params.assertionType === 0 ? 'AGENT' : 'HUMAN',
        summary: params.summary,
        evidenceRefs: params.evidenceRefs,
        timestamp: Date.now()
      });

      const assertionParams: CreateAssertionParams = {
        eventId: params.eventId,
        assertionType: params.assertionType,
        claimHash,
        stake: params.stake
      };

      const contract = new ethers.Contract(
        CONTRACTS[84532].assertions,
        ASSERTIONS_ABI,
        signer!
      );
      
      const valueWei = ethers.utils.parseEther(params.stake);
      
      const tx = await contract.createAssertion(
        params.eventId,
        params.assertionType,
        claimHash,
        { value: valueWei }
      );
      
      setState({ status: 'pending', txHash: tx.hash });
      
      // Wait for 2 confirmations
      const receipt = await tx.wait(2);
      
      if (receipt?.status === 1) {
        // Parse assertionId from event logs if possible
        const assertionId = parseAssertionIdFromReceipt(receipt);
        setState({ status: 'confirmed', txHash: tx.hash, assertionId });
      } else {
        setState({ status: 'error', error: 'Transaction failed' });
      }
    } catch (err: any) {
      if (err.code === 'ACTION_REJECTED') {
        setState({ status: 'error', error: 'User rejected signature' });
      } else {
        setState({ status: 'error', error: err.message || 'Unknown error' });
      }
    }
  }, [canCreate, signer]);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return {
    create,
    reset,
    state,
    isCreating: state.status === 'awaiting_signature' || state.status === 'pending',
    canCreate: state.status === 'idle' || state.status === 'error',
    minStake: MIN_ASSERTION_STAKE
  };
}

function parseAssertionIdFromReceipt(receipt: ethers.ContractReceipt): number | undefined {
  // Try to parse assertionId from event logs
  // AssertionCreated event signature hash
  const ASSERTION_CREATED_SIGNATURE = '0x92de17393c86c705ab45bf458c308459abdac49a555b62300a658dc3c8d33939';
  
  try {
    const eventLog = receipt.logs.find(log => 
      log.topics[0] === ASSERTION_CREATED_SIGNATURE
    );
    if (eventLog) {
      // assertionId is in topics[1] as indexed uint256
      return parseInt(eventLog.topics[1], 16);
    }
  } catch {}
  return undefined;
}
