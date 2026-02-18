import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Get verified events from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('verification_status', 'VERIFIED')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json(
        { error: error.message, items: [] },
        { status: 500 }
      );
    }

    if (!events || events.length < 5) {
      return NextResponse.json(
        { items: [], count: events?.length || 0 },
        { status: 200 }
      );
    }

    // Calculate trending score based on available data
    // For now: recency + source_type weight
    const sourceWeights: Record<string, number> = {
      'ONCHAIN': 100,
      'GITHUB': 80,
      'AGENT': 70,
      'X': 60,
      'MEDIA': 50
    };

    const now = Date.now();
    const items = events.map((event, index) => {
      const eventTime = new Date(event.created_at).getTime();
      const hoursAgo = (now - eventTime) / (1000 * 60 * 60);
      
      // Recency score: newer = higher (max 100, decays over 24h)
      const recencyScore = Math.max(0, 100 - (hoursAgo * 4));
      
      // Source weight
      const sourceScore = sourceWeights[event.source_type] || 50;
      
      // Combined score (0-100)
      const score = Math.round((recencyScore * 0.6) + (sourceScore * 0.4));
      
      // Mock 24h change (would come from real metrics)
      const change24h = Math.round((Math.random() - 0.3) * 40);

      return {
        rank: index + 1,
        title: event.title,
        score,
        change24h,
        id: event.event_id.toString()
      };
    });

    // Sort by score and re-rank
    const sortedItems = items
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    return NextResponse.json({
      items: sortedItems,
      count: events.length,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, items: [] },
      { status: 500 }
    );
  }
}
