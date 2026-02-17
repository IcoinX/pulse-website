import { NextResponse } from 'next/server';
import { fetchAllFeeds } from '@/lib/rss';

export const runtime = 'edge';
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
  try {
    const feeds = await fetchAllFeeds();
    
    return NextResponse.json({
      success: true,
      data: feeds,
      count: feeds.length,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching feeds:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch feeds',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
