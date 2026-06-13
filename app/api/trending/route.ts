import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Source weights (exact spec)
const SOURCE_WEIGHTS: Record<string, number> = {
  'ONCHAIN': 100,
  'AGENT': 80,
  'GITHUB': 60,
  'MEDIA': 40,
  'AI': 50,
  'CRYPTO': 45,
};

// Origin bonuses (platform quality signal)
const ORIGIN_BONUSES: Record<string, number> = {
  'VIRTUALS': 30,
  'BANKR': 25,
  'CLANKER': 20,
  'NATIVE': 10
};

// Minimum items threshold
const MIN_ITEMS = 3;
const WINDOW_HOURS = 168; // 7 days

export async function GET() {
  try {
    // Get events from last 7 days — include all verification statuses
    // (RSS-ingested events are auto-verified from trusted sources)
    const sevenDaysAgo = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .in('source_type', ['ONCHAIN', 'AGENT', 'GITHUB', 'MEDIA', 'CRYPTO', 'AI'])
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: error.message, items: [] },
        { status: 500 }
      );
    }

    // Anti-spam: if < 3 items, return empty with reason
    if (!events || events.length < MIN_ITEMS) {
      return NextResponse.json({
        items: [],
        meta: {
          reason: 'NOT_ENOUGH_SIGNALS',
          message: 'Need at least 3 events in the last 7 days.',
          window: '7d',
          count: events?.length || 0,
          minRequired: MIN_ITEMS
        }
      }, { status: 200 });
    }

    const now = Date.now();

    // Calculate trending score for each event
    const items = events.map((event) => {
      const eventTime = new Date(event.created_at).getTime();
      const ageHours = (now - eventTime) / (1000 * 60 * 60);

      // Recency score: linear decay over 7 days
      const recencyScore = Math.max(0, 100 - (ageHours * (100 / WINDOW_HOURS)));

      // Source weight
      const sourceScore = SOURCE_WEIGHTS[event.source_type] || 40;

      // Origin bonus
      const originBonus = event.agent_origin ? (ORIGIN_BONUSES[event.agent_origin] || 0) : 0;

      // Verification multiplier: VERIFIED = 1.0, PENDING = 0.8 (trusted RSS)
      const verificationMultiplier = event.verification_status === 'VERIFIED' ? 1.0 : 0.8;

      // Parse convergence score if available
      let convergenceScore: number | undefined;
      let convergenceClass: string | undefined;
      const convergenceMatch = event.verification_reason?.match(/→\s*([\d.]+)\s*\(([A-Z]+)\)/);
      if (convergenceMatch) {
        convergenceScore = parseFloat(convergenceMatch[1]);
        convergenceClass = convergenceMatch[2];
      }

      // Final score
      let score: number;
      if (convergenceScore && convergenceScore >= 4.0) {
        score = Math.round((recencyScore * 0.4) + (convergenceScore * 10) + (originBonus * 0.2));
      } else {
        const rawScore = (recencyScore * 0.5) + (sourceScore * 0.3) + (originBonus * 0.2);
        score = Math.round(rawScore * verificationMultiplier);
      }

      const ageDays = ageHours / 24;
      const ageBadge = ageDays < 7 ? 'NEW' : 'Established';

      return {
        id: event.event_id.toString(),
        title: event.title,
        source_type: event.source_type,
        agent_origin: event.agent_origin,
        score,
        convergenceScore,
        convergenceClass,
        recencyScore: Math.round(recencyScore),
        sourceScore,
        originBonus,
        ageHours: Math.round(ageHours),
        ageBadge,
        created_at: event.created_at,
        verification_status: event.verification_status,
        verification_reason: event.verification_reason
      };
    });

    // Sort by score descending
    const sortedItems = items
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    return NextResponse.json({
      items: sortedItems,
      meta: {
        window: '7d',
        count: events.length,
        returned: sortedItems.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, items: [] },
      { status: 500 }
    );
  }
}
