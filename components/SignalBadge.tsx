interface SignalBadgeProps {
  type: 'convergence' | 'market' | 'smart' | 'narrative';
  value?: string | number;
  strength?: 'none' | 'low' | 'medium' | 'high';
  tooltip?: string;
}

const colors = {
  convergence: {
    STRONG: { bg: '#22c55e22', text: '#22c55e', border: '#22c55e' },
    MEDIUM: { bg: '#f59e0b22', text: '#f59e0b', border: '#f59e0b' },
    WEAK: { bg: '#6b728022', text: '#9ca3af', border: '#6b7280' },
    none: { bg: '#1a1a1a', text: '#666', border: '#333' }
  },
  market: {
    high: { bg: '#22c55e22', text: '#22c55e' },
    medium: { bg: '#f59e0b22', text: '#f59e0b' },
    low: { bg: '#6b728022', text: '#9ca3af' },
    none: { bg: '#1a1a1a', text: '#666' }
  },
  smart: {
    high: { bg: '#3b82f622', text: '#60a5fa' },
    medium: { bg: '#f59e0b22', text: '#f59e0b' },
    low: { bg: '#6b728022', text: '#9ca3af' },
    none: { bg: '#1a1a1a', text: '#666' }
  },
  narrative: {
    high: { bg: '#a855f722', text: '#c084fc' },
    medium: { bg: '#f59e0b22', text: '#f59e0b' },
    low: { bg: '#6b728022', text: '#9ca3af' },
    none: { bg: '#1a1a1a', text: '#666' }
  }
};

function getConvergenceClass(score?: number): 'STRONG' | 'MEDIUM' | 'WEAK' | 'none' {
  if (score === undefined || score === null) return 'none';
  if (score >= 7.0) return 'STRONG';
  if (score >= 4.0) return 'MEDIUM';
  return 'WEAK';
}

export default function SignalBadge({ type, value, strength, tooltip }: SignalBadgeProps) {
  if (type === 'convergence') {
    const score = typeof value === 'number' ? value : parseFloat(value as string) || 0;
    const cls = getConvergenceClass(score);
    const color = colors.convergence[cls];
    
    return (
      <span
        title={tooltip || `Convergence Score: ${score.toFixed(1)} (${cls})`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          background: color.bg,
          border: `1px solid ${color.border}`,
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          color: color.text,
          fontFamily: 'monospace',
          letterSpacing: '0.5px'
        }}
      >
        {score.toFixed(1)} {cls}
      </span>
    );
  }

  // Market/Smart/Narrative badges
  const color = colors[type][strength || 'none'];
  const label = type === 'market' ? 'M' : type === 'smart' ? 'S' : 'N';
  
  return (
    <span
      title={tooltip || `${type}: ${strength || 'none'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        background: color.bg,
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        color: color.text,
        textTransform: 'uppercase'
      }}
    >
      {label}: {strength || '—'}
    </span>
  );
}

// Parse verification_reason to extract signal data
export function parseSignalsFromReason(reason?: string): {
  convergence?: { score: number; class: string };
  market?: { strength: 'low' | 'medium' | 'high' | 'none' };
  smart?: { strength: 'low' | 'medium' | 'high' | 'none' };
  narrative?: { strength: 'low' | 'medium' | 'high' | 'none'; velocity?: number };
} {
  const signals: ReturnType<typeof parseSignalsFromReason> = {};
  
  if (!reason) return signals;
  
  // Parse Convergence: "V:X M:X S:X N:X → X.X (CLASS)"
  const convergenceMatch = reason.match(/→\s*([\d.]+)\s*\(([A-Z]+)\)/);
  if (convergenceMatch) {
    signals.convergence = {
      score: parseFloat(convergenceMatch[1]),
      class: convergenceMatch[2]
    };
  }
  
  // Parse Market: "Market confirmed: (strength) strength"
  const marketMatch = reason.match(/Market confirmed:\s*(low|medium|high)\s*strength/);
  if (marketMatch) {
    signals.market = { strength: marketMatch[1] as any };
  }
  
  // Parse Smart: "Smart signal: (strength)"
  const smartMatch = reason.match(/Smart signal:\s*(low|medium|high)/);
  if (smartMatch) {
    signals.smart = { strength: smartMatch[1] as any };
  }
  
  // Parse Narrative: "Narrative (strength):"
  const narrativeMatch = reason.match(/Narrative\s*(low|medium|high)/);
  if (narrativeMatch) {
    signals.narrative = { strength: narrativeMatch[1] as any };
    // Extract velocity
    const velMatch = reason.match(/(\d+)% velocity/);
    if (velMatch) {
      signals.narrative.velocity = parseInt(velMatch[1]);
    }
  }
  
  return signals;
}
