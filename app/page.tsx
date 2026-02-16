import { Suspense } from 'react';
import { ProtocolEvent } from '@/types';
import { supabase } from '@/lib/supabase';
import HomeClient from './HomeClient';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

async function getEventsFromSupabase(): Promise<{ feeds: ProtocolEvent[]; error: string | null }> {
  try {
    // Fetch from events table (not canonical_events)
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`*`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (eventsError) {
      console.error('Supabase error:', eventsError);
      return { feeds: [], error: eventsError.message };
    }

    console.log('Supabase events fetched:', events?.length || 0, events);

    // Transform to ProtocolEvent format
    const feeds: ProtocolEvent[] = (events || []).map((event: any) => ({
      id: event.event_id,
      title: event.title || `Event #${event.event_id}`,
      description: event.description || '',
      timestamp: event.created_at,
      source: event.source_type || 'ONCHAIN',
      sourceUrl: event.source_url || '',
      chain: 'base-sepolia',
      eventType: event.source_type || 'GENERIC',
      canonicalHash: event.canonical_hash,
      status: event.status || 'UNVERIFIED',
      assertions: [],
      assertion: null,
    }));

    return { feeds, error: null };
  } catch (err: any) {
    console.error('Error fetching events:', err);
    return { feeds: [], error: err.message };
  }
}

export default async function Home() {
  const { feeds, error } = await getEventsFromSupabase();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading PULSE...</p>
        </div>
      </div>
    }>
      <HomeClient initialFeeds={feeds} error={error} />
    </Suspense>
  );
}
