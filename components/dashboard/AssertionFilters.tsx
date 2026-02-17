'use client';

import { useState } from 'react';

interface FilterState {
  status: string[];
  outcome: string[];
  type: string[];
  minStake: string;
  search: string;
}

export function AssertionFilters() {
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    outcome: [],
    type: [],
    minStake: '',
    search: ''
  });

  return (
    <div className="flex flex-wrap gap-3 mb-4 p-4 bg-gray-900/50 rounded-lg">
      {/* Status filter */}
      <select 
        className="px-3 py-2 bg-gray-800 rounded text-sm"
        onChange={(e) => setFilters(f => ({ ...f, status: [e.target.value] }))}
      >
        <option value="">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="CHALLENGED">Challenged</option>
        <option value="VERIFIED">Verified</option>
        <option value="SLASHED">Slashed</option>
      </select>

      {/* Type filter */}
      <select className="px-3 py-2 bg-gray-800 rounded text-sm">
        <option value="">All Types</option>
        <option value="AGENT">Agent</option>
        <option value="HUMAN">Human</option>
      </select>

      {/* Outcome filter */}
      <select className="px-3 py-2 bg-gray-800 rounded text-sm">
        <option value="">All Outcomes</option>
        <option value="WIN">Win</option>
        <option value="LOSS">Loss</option>
        <option value="ONGOING">Ongoing</option>
      </select>

      {/* Search */}
      <input 
        type="text" 
        placeholder="Search event/assertion ID..."
        className="px-3 py-2 bg-gray-800 rounded text-sm flex-grow"
      />
    </div>
  );
}
