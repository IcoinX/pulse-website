'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { UserAssertion } from '@/hooks/useUserAssertions';

interface AssertionsTableProps {
  assertions: UserAssertion[];
}

export function AssertionsTable({ assertions }: AssertionsTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-900/50 text-left">
          <tr>
            <th className="px-4 py-3 text-sm font-medium text-gray-400">Event</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-400">Type</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-400">Stake</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-400">Status</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-400">Outcome</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-400">Rep</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-400">Created</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-400">Tx</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {assertions.map(assertion => (
            <>
              <tr 
                key={assertion.id}
                onClick={() => setExpandedId(expandedId === assertion.id ? null : assertion.id)}
                className="hover:bg-gray-800/50 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <Link href={`/event/${assertion.eventId}`} className="text-blue-400 hover:underline">
                    Event #{assertion.eventId}
                  </Link>
                  {assertion.eventTitle && (
                    <div className="text-xs text-gray-500">{assertion.eventTitle}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <TypeBadge type={assertion.type} />
                </td>
                <td className="px-4 py-3 font-mono">{assertion.stakeAmount}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={assertion.status} />
                </td>
                <td className="px-4 py-3">
                  <OutcomeBadge outcome={assertion.outcome} />
                </td>
                <td className="px-4 py-3">
                  <ReputationDelta delta={assertion.reputationDelta} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(assertion.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <a 
                    href={`https://sepolia.basescan.org/tx/${assertion.txHash}`}
                    target="_blank"
                    rel="noopener"
                    className="text-gray-400 hover:text-white"
                  >
                    <ExternalLinkIcon />
                  </a>
                </td>
              </tr>
              {expandedId === assertion.id && (
                <tr>
                  <td colSpan={8} className="px-4 py-4 bg-gray-900/30">
                    <AssertionDetails assertion={assertion} />
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    AGENT: 'bg-purple-500/20 text-purple-400',
    HUMAN: 'bg-blue-500/20 text-blue-400'
  };
  return (
    <span className={`px-2 py-1 text-xs rounded ${colors[type]}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    CHALLENGED: 'bg-orange-500/20 text-orange-400',
    VERIFIED: 'bg-green-500/20 text-green-400',
    SLASHED: 'bg-red-500/20 text-red-400'
  };
  return (
    <span className={`px-2 py-1 text-xs rounded ${colors[status]}`}>
      {status}
    </span>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const colors: Record<string, string> = {
    WIN: 'text-green-400',
    LOSS: 'text-red-400',
    ONGOING: 'text-gray-400'
  };
  return <span className={colors[outcome]}>{outcome}</span>;
}

function ReputationDelta({ delta }: { delta: number }) {
  const color = delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-gray-400';
  const sign = delta > 0 ? '+' : '';
  return <span className={color}>{sign}{delta}</span>;
}

function AssertionDetails({ assertion }: { assertion: UserAssertion }) {
  return (
    <div className="space-y-3 text-sm">
      <div>
        <span className="text-gray-500">Claim Hash:</span>
        <code className="ml-2 px-2 py-1 bg-gray-800 rounded font-mono text-xs">
          {assertion.claimHash}
        </code>
      </div>
      
      {assertion.challenge && (
        <div className="border-l-2 border-orange-500 pl-3">
          <div className="text-orange-400 font-medium">Challenge</div>
          <div>Challenger: {assertion.challenge.challenger}</div>
          <div>Stake: {assertion.challenge.stakeAmount}</div>
          <div>Counter Hash: {assertion.challenge.counterHash}</div>
        </div>
      )}
      
      {assertion.resolution && (
        <div className="border-l-2 border-green-500 pl-3">
          <div className="text-green-400 font-medium">Resolution</div>
          <div>Outcome: {assertion.resolution.outcome}</div>
          <div>Reward: {assertion.resolution.rewardAmount}</div>
          <div>Protocol Fee: {assertion.resolution.protocolFee}</div>
        </div>
      )}
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}
