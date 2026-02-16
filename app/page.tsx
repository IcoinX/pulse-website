import { Suspense } from 'react';
import { ProtocolEvent } from '@/types';
import { supabase } from '@/lib/supabase';
import HomeClient from './HomeClient';

// Force dynamic rendering (no caching)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getEventsFromSupabase(): Promise<ProtocolEvent[]> {
  try {
    // Simple fetch from events table
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }

    console.log('Fetched events:', events);

    // Simple transform
    return (events || []).map((event: any) => ({
      id: String(event.event_id),
      title: event.title || `Event #${event.event_id}`,
      description: '',
      summary: event.title || `Event #${event.event_id}`,
      content: event.title || `Event #${event.event_id}`,
      timestamp: event.created_at,
      source: event.source_type || 'ONCHAIN',
      sourceUrl: '',
      category: 'crypto_agents',
      status: (event.status?.toLowerCase() || 'unverified') as any,
      chain: 'base-sepolia',
      eventType: event.source_type || 'GENERIC',
      canonicalHash: event.canonical_hash,
      tags: [event.source_type?.toLowerCase() || 'onchain'],
      proofTags: [],
      evidence: [],
      timeline: [],
      assertionCount: 0,
      challengeCount: 0,
    }));
  } catch (err) {
    console.error('Error:', err);
    return [];
  }
}

export default async function Home() {
  const feeds = await getEventsFromSupabase();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClient initialFeeds={feeds} />
    </Suspense>
  );
}
