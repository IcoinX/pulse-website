import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get total events
    const { count: totalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    // Get verified events
    const { count: verifiedEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'VERIFIED');

    // Get events from last 24h
    const { count: events24h } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Get events by category
    const { data: categoryData } = await supabase
      .from('events')
      .select('source_type');
    
    const categories: Record<string, number> = {};
    categoryData?.forEach(e => {
      categories[e.source_type] = (categories[e.source_type] || 0) + 1;
    });

    // Get recent events trend (last 7 days)
    const { data: trendData } = await supabase
      .from('events')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    const dailyTrend: Record<string, number> = {};
    trendData?.forEach(e => {
      const date = new Date(e.created_at).toISOString().split('T')[0];
      dailyTrend[date] = (dailyTrend[date] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalEvents: totalEvents || 0,
        verifiedEvents: verifiedEvents || 0,
        events24h: events24h || 0,
        verificationRate: totalEvents ? Math.round((verifiedEvents || 0) / totalEvents * 100) : 0,
        categories,
        dailyTrend,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
