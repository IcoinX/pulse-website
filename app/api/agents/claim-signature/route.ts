export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Agent registry contract info for EIP-712
const AGENT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000';
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532'); // Base Sepolia default

// Agent private key for signing (in production, use secure key management)
const AGENT_PRIVATE_KEY = process.env.AGENT_SIGNER_KEY;

/**
 * POST /api/agents/claim-signature
 * 
 * Generates an EIP-712 signature authorizing an owner to claim an agent.
 * This signature is used in the on-chain claimAgent() transaction.
 * 
 * Body: { agentAddress: string, ownerAddress: string }
 * Returns: { signature: string, nonce: number, expiry: number }
 */
export async function POST(req: NextRequest) {
  try {
    // Validate request
    const { agentAddress, ownerAddress } = await req.json();

    if (!agentAddress || !/^0x[a-fA-F0-9]{40}$/.test(agentAddress)) {
      return NextResponse.json(
        { error: 'Invalid agent address' },
        { status: 400 }
      );
    }

    if (!ownerAddress || !/^0x[a-fA-F0-9]{40}$/.test(ownerAddress)) {
      return NextResponse.json(
        { error: 'Invalid owner address' },
        { status: 400 }
      );
    }

    const normalizedAgent = agentAddress.toLowerCase();
    const normalizedOwner = ownerAddress.toLowerCase();

    // Check if agent exists in DB
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('address', normalizedAgent)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found in registry' },
        { status: 404 }
      );
    }

    // Check if agent is already claimed
    if (agent.owner_address) {
      return NextResponse.json(
        { error: 'Agent already claimed', owner: agent.owner_address },
        { status: 409 }
      );
    }

    // Get current nonce from on-chain contract (or use DB nonce as fallback)
    // For now, use DB nonce (0 if not claimed)
    const nonce = agent.nonce || 0;

    // Set expiry to 1 hour from now
    const expiry = Math.floor(Date.now() / 1000) + 3600;

    // Check if we have the signer key
    if (!AGENT_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Agent signer not configured' },
        { status: 500 }
      );
    }

    // Create EIP-712 typed data
    const domain = {
      name: 'PULSE AgentRegistry',
      version: '1',
      chainId: CHAIN_ID,
      verifyingContract: AGENT_REGISTRY_ADDRESS,
    };

    const types = {
      Claim: [
        { name: 'agent', type: 'address' },
        { name: 'owner', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
      ],
    };

    const value = {
      agent: normalizedAgent,
      owner: normalizedOwner,
      nonce: nonce,
      expiry: expiry,
    };

    // Sign with agent wallet
    const signer = new ethers.Wallet(AGENT_PRIVATE_KEY);
    const signature = await signer._signTypedData(domain, types, value);

    // Store pending claim in DB
    await supabase
      .from('agent_claims')
      .insert({
        agent_address: normalizedAgent,
        owner_address: normalizedOwner,
        nonce: nonce,
        expiry: new Date(expiry * 1000).toISOString(),
        signature: signature,
        status: 'PENDING'
      });

    return NextResponse.json({
      signature,
      nonce,
      expiry,
      agent: normalizedAgent,
      owner: normalizedOwner,
      contractAddress: AGENT_REGISTRY_ADDRESS,
      chainId: CHAIN_ID,
    });

  } catch (err: any) {
    console.error('Claim signature generation error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: err.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/claim-signature?agent=0x...
 * 
 * Returns the current nonce for an agent (for debugging/preparation)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentAddress = searchParams.get('agent');

    if (!agentAddress || !/^0x[a-fA-F0-9]{40}$/.test(agentAddress)) {
      return NextResponse.json(
        { error: 'Invalid agent address' },
        { status: 400 }
      );
    }

    const normalizedAgent = agentAddress.toLowerCase();

    const { data: agent } = await supabase
      .from('agents')
      .select('address, owner_address, nonce, is_verified')
      .eq('address', normalizedAgent)
      .single();

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      agent: agent.address,
      owner: agent.owner_address,
      nonce: agent.nonce || 0,
      isVerified: agent.is_verified,
      contractAddress: AGENT_REGISTRY_ADDRESS,
      chainId: CHAIN_ID,
    });

  } catch (err: any) {
    console.error('Claim status error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
