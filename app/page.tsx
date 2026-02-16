import { Suspense } from 'react';
import { fetchAllFeeds } from '@/lib/rss';
import HomeClient from './HomeClient';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export default async function Home() {
  // Fetch feeds on the server
  let feeds = [];
  let error = null;

  try {
    feeds = await fetchAllFeeds();
  } catch (err) {
    console.error('Error fetching feeds:', err);
    error = err instanceof Error ? err.message : 'Failed to fetch feeds';
  }

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
