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
  'MEDIA': 40
};

// Origin bonuses (platform quality signal)
const ORIGIN_BONUSES: Record<string, number> = {
  'VIRTUALS': 30,  // Most selective, highest quality
  'BANKR': 25,     // Financial agents, serious builders
  'CLANKER': 20,   // Volume + experimentation
  'NATIVE': 10     // PULSE native agents
};

// Minimum items threshold (anti-n'importe-quoi rule)
const MIN_ITEMS = 3;
const WINDOW_HOURS = 168; // 7 days

export async function GET() {
  try {
    // Get verified events from last 7 days
    const sevenDaysAgo = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    
    // Get events: VERIFIED first, but include PENDING agents (for agent radar)
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .or('verification_status.eq.VERIFIED,and(verification_status.eq.PENDING,source_type.eq.AGENT)')
      .gte('created_at', sevenDaysAgo)
      .in('source_type', ['ONCHAIN', 'AGENT', 'GITHUB', 'MEDIA', 'CRYPTO', 'AI'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: error.message, items: [] },
        { status: 500 }
      );
    }

    // Anti-n'importe-quoi: if < 3 items, return empty with reason
    if (!events || events.length < MIN_ITEMS) {
      return NextResponse.json({
        items: [],
        meta: {
          reason: 'NOT_ENOUGH_SIGNALS',
          message: 'Need at least 3 verified events in the last 7 days.',
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
      
      // Recency score: linear decay over 7 days (168h)
      const recencyScore = Math.max(0, 100 - (ageHours * (100 / WINDOW_HOURS)));
      
      // Source weight (default 40 if unknown)
      const sourceScore = SOURCE_WEIGHTS[event.source_type] || 40;
      
      // Origin bonus (platform credibility)
      const originBonus = event.agent_origin ? (ORIGIN_BONUSES[event.agent_origin] || 0) : 0;
      
      // Verification multiplier: VERIFIED = 1.0, PENDING = 0.6
      const verificationMultiplier = event.verification_status === 'VERIFIED' ? 1.0 : 0.6;
      
      // Parse convergence score if available
      let convergenceScore: number | undefined;
      let convergenceClass: string | undefined;
      const convergenceMatch = event.verification_reason?.match(/→\s*([\d.]+)\s*\(([A-Z]+)\)/);
      if (convergenceMatch) {
        convergenceScore = parseFloat(convergenceMatch[1]);
        convergenceClass = convergenceMatch[2];
      }
      
      // Final score: if convergence available, boost by it; otherwise use legacy formula
      let score: number;
      if (convergenceScore && convergenceScore >= 4.0) {
        // Boost events with strong convergence
        score = Math.round((recencyScore * 0.4) + (convergenceScore * 10) + (originBonus * 0.2));
      } else {
        // Legacy formula
        const rawScore = (recencyScore * 0.5) + (sourceScore * 0.3) + (originBonus * 0.2);
        score = Math.round(rawScore * verificationMultiplier);
      }
      
      // Determine age badge
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

    // Sort by score descending (boosted by convergence)
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
