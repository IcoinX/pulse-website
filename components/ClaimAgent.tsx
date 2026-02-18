'use client';

import { useState, useEffect } from 'react';

interface ClaimAgentProps {
  agentAddress: string;
  agentName?: string;
}

export default function ClaimAgent({ agentAddress, agentName }: ClaimAgentProps) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('pulse_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserAddress(user.wallet_address);
      } catch {
        setUserAddress(null);
      }
    }
    fetchClaimStatus();
  }, [agentAddress]);

  const fetchClaimStatus = async () => {
    try {
      const res = await fetch(`/api/agents/claim?agent=${agentAddress}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch claim status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!userAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setClaiming(true);
    setError(null);
    setSuccess(null);

    try {
      // Get signature from backend
      const sigRes = await fetch('/api/agents/claim-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentAddress,
          ownerAddress: userAddress
        })
      });

      if (!sigRes.ok) {
        const err = await sigRes.json();
        throw new Error(err.error || 'Failed to generate signature');
      }

      const { signature, expiry, contractAddress, chainId } = await sigRes.json();

      // Submit on-chain transaction
      const provider = (window as any).ethereum;
      if (!provider) {
        throw new Error('No wallet provider found');
      }

      // Encode transaction data using ethers
      const { ethers } = await import('ethers');
      const abi = ['function claimAgent(address agent, uint256 expiry, bytes calldata signature) external'];
      const iface = new ethers.utils.Interface(abi);
      const data = iface.encodeFunctionData('claimAgent', [agentAddress, expiry, signature]);

      // Send transaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: contractAddress,
          data: data,
          chainId: `0x${chainId.toString(16)}`
        }]
      });

      // Confirm claim
      const confirmRes = await fetch('/api/agents/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentAddress, txHash })
      });

      if (!confirmRes.ok) {
        const err = await confirmRes.json();
        throw new Error(err.error || 'Failed to confirm claim');
      }

      setSuccess(`Agent claimed! TX: ${txHash.slice(0, 20)}...`);
      fetchClaimStatus();

    } catch (err: any) {
      console.error('Claim error:', err);
      setError(err.message || 'Failed to claim agent');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 16, background: '#111', borderRadius: 8, border: '1px solid #222' }}>
        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  // Already claimed
  if (status?.hasOwner) {
    const isOwner = status.owner?.toLowerCase() === userAddress?.toLowerCase();
    
    return (
      <div style={{ padding: 16, background: '#111', borderRadius: 8, border: '1px solid #222' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>{isOwner ? '✅' : '👤'}</span>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#fff' }}>
              {isOwner ? 'You own this agent' : 'Agent claimed'}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
              {status.owner?.slice(0, 12)}...{status.owner?.slice(-8)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Can claim
  return (
    <div style={{ padding: 16, background: '#111', borderRadius: 8, border: '1px solid #222' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>🔒</span>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#fff' }}>Claim this agent</p>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#666' }}>
            Link your wallet as owner
          </p>
        </div>
      </div>

      {error && (
        <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#ef4444' }}>{error}</p>
      )}

      {success && (
        <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#22c55e' }}>{success}</p>
      )}

      <button
        onClick={handleClaim}
        disabled={claiming || !userAddress}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: userAddress ? '#2563eb' : '#374151',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          cursor: userAddress ? 'pointer' : 'not-allowed'
        }}
      >
        {claiming ? 'Claiming...' : !userAddress ? 'Connect wallet first' : 'Claim Agent'}
      </button>
    </div>
  );
}
