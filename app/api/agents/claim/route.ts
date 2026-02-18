export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Agent Registry contract ABI (minimal)
const AGENT_REGISTRY_ABI = [
  'function ownerOfAgent(address agent) view returns (address)',
  'function nonces(address agent) view returns (uint256)',
  'event AgentClaimed(address indexed agent, address indexed owner, uint256 nonce)',
];

const RPC_URL = process.env.RPC_URL_BASE_SEPOLIA || 'https://sepolia.base.org';
const AGENT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS;

/**
 * POST /api/agents/claim
 * 
 * Confirms an on-chain claim and updates the database.
 * Called after the owner submits the claimAgent transaction.
 * 
 * Body: { agentAddress: string, txHash: string }
 * Returns: { success: boolean, agent: object }
 */
export async function POST(req: NextRequest) {
  try {
    const { agentAddress, txHash } = await req.json();

    // Validation
    if (!agentAddress || !ethers.utils.isAddress(agentAddress)) {
      return NextResponse.json(
        { error: 'Invalid agent address' },
        { status: 400 }
      );
    }

    if (!txHash || !txHash.startsWith('0x') || txHash.length !== 66) {
      return NextResponse.json(
        { error: 'Invalid transaction hash' },
        { status: 400 }
      );
    }

    const normalizedAgent = agentAddress.toLowerCase();

    // Check if agent exists
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('address', normalizedAgent)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Verify on-chain
    if (!AGENT_REGISTRY_ADDRESS) {
      // Fallback: trust the txHash without verification (dev mode)
      console.warn('AgentRegistry address not set, skipping on-chain verification');
    } else {
      try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(
          AGENT_REGISTRY_ADDRESS,
          AGENT_REGISTRY_ABI,
          provider
        );

        // Get current owner from contract
        const onChainOwner = await contract.ownerOfAgent(normalizedAgent);
        
        if (onChainOwner === ethers.constants.AddressZero) {
          return NextResponse.json(
            { error: 'Agent not claimed on-chain yet' },
            { status: 400 }
          );
        }

        // Verify transaction receipt
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (!receipt) {
          return NextResponse.json(
            { error: 'Transaction not found or still pending' },
            { status: 404 }
          );
        }

        if (receipt.status !== 1) {
          return NextResponse.json(
            { error: 'Transaction failed' },
            { status: 400 }
          );
        }

        // Check if tx was to the registry contract
        if (receipt.to?.toLowerCase() !== AGENT_REGISTRY_ADDRESS.toLowerCase()) {
          return NextResponse.json(
            { error: 'Transaction not to AgentRegistry' },
            { status: 400 }
          );
        }

        // Parse logs to find AgentClaimed event
        const iface = new ethers.utils.Interface(AGENT_REGISTRY_ABI);
        const claimEvent = receipt.logs.find((log: any) => {
          try {
            const parsed = iface.parseLog({
              topics: log.topics as string[],
              data: log.data
            });
            return parsed?.name === 'AgentClaimed';
          } catch {
            return false;
          }
        });

        if (!claimEvent) {
          return NextResponse.json(
            { error: 'No AgentClaimed event found in transaction' },
            { status: 400 }
          );
        }

        // Update DB with verified owner
        const { data: updatedAgent, error: updateError } = await supabase
          .from('agents')
          .update({
            owner_address: onChainOwner.toLowerCase(),
            claimed_at: new Date().toISOString(),
            claim_tx_hash: txHash,
            is_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('address', normalizedAgent)
          .select()
          .single();

        if (updateError) {
          console.error('Agent update error:', updateError);
          return NextResponse.json(
            { error: 'Failed to update agent', details: updateError.message },
            { status: 500 }
          );
        }

        // Update pending claim status
        await supabase
          .from('agent_claims')
          .update({
            status: 'VERIFIED',
            tx_hash: txHash,
            verified_at: new Date().toISOString()
          })
          .eq('agent_address', normalizedAgent)
          .eq('status', 'PENDING');

        return NextResponse.json({
          success: true,
          agent: updatedAgent,
          onChainOwner: onChainOwner.toLowerCase(),
          txHash
        });

      } catch (chainErr: any) {
        console.error('On-chain verification error:', chainErr);
        return NextResponse.json(
          { error: 'On-chain verification failed', message: chainErr.message },
          { status: 500 }
        );
      }
    }

    // Dev mode fallback: just update DB with txHash
    const { data: updatedAgent, error: updateError } = await supabase
      .from('agents')
      .update({
        claim_tx_hash: txHash,
        updated_at: new Date().toISOString()
      })
      .eq('address', normalizedAgent)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      agent: updatedAgent,
      txHash,
      note: 'Dev mode - on-chain verification skipped'
    });

  } catch (err: any) {
    console.error('Claim confirmation error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: err.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/claim?agent=0x...
 *
 * Get claim status for an agent
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentAddress = searchParams.get('agent');

    if (!agentAddress || !ethers.utils.isAddress(agentAddress)) {
      return NextResponse.json(
        { error: 'Invalid agent address' },
        { status: 400 }
      );
    }

    const normalizedAgent = agentAddress.toLowerCase();

    // Get agent data
    const { data: agent } = await supabase
      .from('agents')
      .select('address, name, owner_address, claimed_at, is_verified, claim_tx_hash')
      .eq('address', normalizedAgent)
      .single();

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Get pending claims
    const { data: pendingClaims } = await supabase
      .from('agent_claims')
      .select('*')
      .eq('agent_address', normalizedAgent)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      agent: {
        address: agent.address,
        name: agent.name,
        hasOwner: !!agent.owner_address,
        owner: agent.owner_address,
        claimedAt: agent.claimed_at,
        isVerified: agent.is_verified,
        claimTxHash: agent.claim_tx_hash,
      },
      pendingClaims: pendingClaims || [],
      canClaim: !agent.owner_address && (!pendingClaims || pendingClaims.length === 0),
    });

  } catch (err: any) {
    console.error('Claim status error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
