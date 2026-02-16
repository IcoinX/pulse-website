'use client';

import { UserAssertion } from '@/hooks/useUserAssertions';

interface KPIsProps {
  assertions: UserAssertion[];
}

export function KPIs({ assertions }: KPIsProps) {
  const total = assertions.length;
  const verified = assertions.filter(a => a.status === 'VERIFIED').length;
  const challenged = assertions.filter(a => a.status === 'CHALLENGED').length;
  const slashed = assertions.filter(a => a.status === 'SLASHED').length;
  const netReputation = assertions.reduce((sum, a) => sum + a.reputationDelta, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <KPICard 
        label="Total Assertions" 
        value={total} 
        color="blue" 
      />
      <KPICard 
        label="Verified" 
        value={verified} 
        color="green" 
        subtitle="Wins"
      />
      <KPICard 
        label="Challenged" 
        value={challenged} 
        color="yellow" 
      />
      <KPICard 
        label="Slashed" 
        value={slashed} 
        color="red" 
        subtitle="Losses"
      />
    </div>
  );
}

function KPICard({ label, value, color, subtitle }: { 
  label: string; 
  value: number; 
  color: 'blue' | 'green' | 'yellow' | 'red';
  subtitle?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    red: 'bg-red-500/10 border-red-500/30 text-red-400'
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
      {subtitle && <div className="text-xs opacity-60">{subtitle}</div>}
    </div>
  );
}
