import { supabase } from './supabase';
import { UserStats, UserActivity, AssertionStatus, UserAssertion, UserChallenge } from '@/types';

// Get user assertions from Supabase
export async function getUserAssertions(wallet: string): Promise<UserAssertion[]> {
  const { data, error } = await supabase
    .from('assertions')
    .select(`
      id,
      event_id,
      assertion_type,
      claim_hash,
      stake_amount,
      status,
      outcome,
      created_at,
      resolved_at,
      events: event_id (
        id,
        title,
        canonical_hash
      )
    `)
    .eq('asserter', wallet.toLowerCase())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user assertions:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id.toString(),
    eventId: row.event_id,
    eventTitle: row.events?.title || 'Unknown Event',
    eventHash: row.events?.canonical_hash || '',
    type: row.assertion_type === 0 ? 'Agent' : 'Human' as const,
    stake: row.stake_amount,
    status: mapAssertionStatus(row.status),
    outcome: (row.outcome === null ? 'ongoing' : row.outcome === 0 ? 'win' : 'loss') as 'win' | 'loss' | 'ongoing',
    createdAt: row.created_at,
    resolvedAt: row.resolved_at
  }));
}

// Get user challenges from Supabase
export async function getUserChallenges(wallet: string): Promise<UserChallenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select(`
      id,
      assertion_id,
      stake_amount,
      counter_hash,
      resolved,
      created_at,
      assertions: assertion_id (
        id,
        event_id,
        events: event_id (
          id,
          title
        )
      )
    `)
    .eq('challenger', wallet.toLowerCase())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user challenges:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id.toString(),
    assertionId: row.assertion_id,
    eventId: row.assertions?.event_id,
    eventTitle: row.assertions?.events?.title || 'Unknown Event',
    stake: row.stake_amount,
    counterHash: row.counter_hash,
    resolved: row.resolved,
    createdAt: row.created_at
  }));
}

// Get user stats (aggregates)
export async function getUserStats(wallet: string): Promise<UserStats> {
  // Get assertions
  const { data: assertions, error: assertionsError } = await supabase
    .from('assertions')
    .select('status, outcome, stake_amount')
    .eq('asserter', wallet.toLowerCase());

  if (assertionsError) {
    console.error('Error fetching assertions stats:', assertionsError);
  }

  // Get challenges
  const { data: challenges, error: challengesError } = await supabase
    .from('challenges')
    .select('resolved, stake_amount')
    .eq('challenger', wallet.toLowerCase());

  if (challengesError) {
    console.error('Error fetching challenges stats:', challengesError);
  }

  // Get events submitted
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id')
    .eq('creator', wallet.toLowerCase());

  if (eventsError) {
    console.error('Error fetching events stats:', eventsError);
  }

  // Calculate stats
  const totalAssertions = assertions?.length || 0;
  const totalChallenges = challenges?.length || 0;
  const totalEvents = events?.length || 0;
  
  // Calculate wins/losses
  const wins = (assertions || []).filter((a: any) => a.outcome === 0).length;
  const losses = (assertions || []).filter((a: any) => a.outcome === 1).length;
  
  const resolvedCount = wins + losses;
  const winRate = resolvedCount > 0 ? Math.round((wins / resolvedCount) * 100) : 0;

  // Calculate total staked
  const totalStaked = (assertions || []).reduce((sum, a) => sum + parseFloat(a.stake_amount || '0'), 0) +
                      (challenges || []).reduce((sum, c) => sum + parseFloat(c.stake_amount || '0'), 0);

  // Calculate rewards (simplified - would need reward distribution table in real implementation)
  const totalRewards = wins * 0.02; // Placeholder calculation

  // Calculate reputation (simplified formula)
  const reputation = Math.min(100, Math.max(0, 
    50 + (wins * 5) - (losses * 10) + (totalEvents * 2)
  ));

  return {
    wallet,
    reputation,
    eventsSubmitted: totalEvents,
    assertionsCount: totalAssertions,
    challengesCount: totalChallenges,
    winRate,
    totalStaked: totalStaked.toFixed(4),
    totalRewards: totalRewards.toFixed(4)
  };
}

// Get user activity timeline
export async function getUserActivity(wallet: string): Promise<UserActivity[]> {
  const activities: UserActivity[] = [];

  // Get boosts
  const { data: boosts, error: boostsError } = await supabase
    .from('boosts')
    .select('id, event_id, amount, tier, created_at, tx_hash')
    .eq('booster', wallet.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(50);

  if (!boostsError && boosts) {
    activities.push(...boosts.map((b: any) => ({
      id: `boost-${b.id}`,
      type: 'boost' as const,
      eventId: b.event_id,
      timestamp: b.created_at,
      amount: b.amount,
      outcome: 'pending' as const,
      txHash: b.tx_hash
    })));
  }

  // Get assertions
  const { data: assertions, error: assertionsError } = await supabase
    .from('assertions')
    .select('id, event_id, stake_amount, status, outcome, created_at, tx_hash')
    .eq('asserter', wallet.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(50);

  if (!assertionsError && assertions) {
    activities.push(...assertions.map((a: any) => ({
      id: `assertion-${a.id}`,
      type: 'assertion' as const,
      eventId: a.event_id,
      timestamp: a.created_at,
      amount: a.stake_amount,
      outcome: (a.outcome === null ? 'pending' : a.outcome === 0 ? 'win' : 'loss') as 'win' | 'loss' | 'pending',
      txHash: a.tx_hash
    })));
  }

  // Get challenges
  const { data: challenges, error: challengesError } = await supabase
    .from('challenges')
    .select('id, assertion_id, stake_amount, resolved, created_at, tx_hash, assertions!inner(event_id)')
    .eq('challenger', wallet.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(50);

  if (!challengesError && challenges) {
    activities.push(...challenges.map((c: any) => ({
      id: `challenge-${c.id}`,
      type: 'challenge' as const,
      eventId: c.assertions?.event_id || 0,
      timestamp: c.created_at,
      amount: c.stake_amount,
      outcome: (c.resolved ? (c.outcome === 1 ? 'win' : 'loss') : 'pending') as 'win' | 'loss' | 'pending',
      txHash: c.tx_hash
    })));
  }

  // Sort by timestamp descending
  return activities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Helper function to map status from DB to enum
function mapAssertionStatus(status: number): AssertionStatus {
  switch (status) {
    case 0: return 'pending';
    case 1: return 'challenged';
    case 2: return 'verified';
    case 3: return 'slashed';
    default: return 'pending';
  }
}
