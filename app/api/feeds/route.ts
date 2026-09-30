import { NextResponse } from 'next/server';
import { fetchAllFeedsSnapshot } from '@/lib/rss';

export const runtime = 'edge';
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
  try {
    const snapshot = await fetchAllFeedsSnapshot();
    const feeds = snapshot.data;
    
    return NextResponse.json({
      success: snapshot.availableSources > 0,
      data: feeds,
      count: feeds.length,
      timestamp: new Date(snapshot.timestamp).toISOString(),
      health: {
        partial: snapshot.partial, stale: snapshot.stale,
        availableSources: snapshot.availableSources,
        unavailableSources: snapshot.unavailableSources,
        checkedAt: new Date(snapshot.checkedAt).toISOString(),
      },
    }, {
      status: snapshot.availableSources > 0 ? 200 : 503,
      headers: {
        'Cache-Control': snapshot.stale ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching feeds:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch feeds',
    }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
