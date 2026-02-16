import { Suspense } from 'react';
import { ProtocolEvent } from '@/types';
import { protocolEvents } from '@/lib/data';
import HomeClient from './HomeClient';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export default async function Home() {
  // Use protocol-native mock data
  let feeds: ProtocolEvent[] = protocolEvents;
  let error: string | null = null;

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
