import { NextResponse } from 'next/server';
import { fetchAllFeeds } from '@/lib/rss';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const feeds = await fetchAllFeeds();
    const feed = feeds.find(f => f.id === id);
    
    if (!feed) {
      return NextResponse.json({
        success: false,
        error: 'Feed not found',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: feed,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch feed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
