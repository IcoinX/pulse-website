import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import LiveStats from '@/components/LiveStats';
import HotRightNow from '@/components/HotRightNow';
import FeedTabsWrapper from '@/components/FeedTabsWrapper';
import { FeedTab } from '@/components/FeedTabs';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

interface PageProps {
  searchParams: { category?: string; tab?: string };
}

export default async function Home({ searchParams }: PageProps) {
  const category = searchParams.category || 'all';
  const activeTab = (searchParams.tab as FeedTab) || 'live';
  
  let events: any[] = [];
  let error: string | null = null;
  let tabCounts = { live: 0, new: 0, trending: 0, research: 0 };

  try {
    // Get counts for each tab
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // Live count (last 24h)
    const { count: liveCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday);
    
    // New count (AGENT type - includes PENDING for radar visibility)
    const { count: newCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('source_type', 'AGENT')
      .gte('created_at', lastWeek);
    
    // Trending count (verified events)
    const { count: trendingCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'VERIFIED')
      .gte('created_at', lastWeek);
    
    // Research count (MEDIA type)
    const { count: researchCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('source_type', 'MEDIA');

    tabCounts = {
      live: liveCount || 0,
      new: newCount || 0,
      trending: trendingCount || 0,
      research: researchCount || 0
    };

    // Base query for events
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    // Apply tab filters
    switch (activeTab) {
      case 'live':
        query = query.gte('created_at', yesterday);
        break;
      case 'new':
        // New Agents tab: ONLY agent-related events
        query = query
          .eq('source_type', 'AGENT')
          .gte('created_at', lastWeek)
          .order('created_at', { ascending: false });
        break;
      case 'trending':
        // Trending: VERIFIED events + PENDING agents (scored differently)
        query = query
          .or('verification_status.eq.VERIFIED,and(verification_status.eq.PENDING,source_type.eq.AGENT)')
          .gte('created_at', lastWeek)
          .order('created_at', { ascending: false });
        break;
      case 'research':
        query = query.eq('source_type', 'MEDIA');
        break;
    }
    
    // Filter by category if specified
    if (category !== 'all') {
      const categoryMap: Record<string, string[]> = {
        'crypto': ['ONCHAIN', 'CRYPTO'],
        'ai': ['AGENT', 'AI', 'MEDIA'],
        'tech': ['GITHUB', 'TECH'],
        'agents': ['AGENT']
      };
      
      const sourceTypes = categoryMap[category];
      if (sourceTypes) {
        query = query.in('source_type', sourceTypes);
      }
    }
    
    const { data, error: supaError } = await query;
    
    if (supaError) {
      error = supaError.message;
    } else {
      events = data || [];
    }
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <Header activeTab={category} />
      
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
          {/* Feed */}
          <div>
            {/* Tabs */}
            <FeedTabsWrapper activeTab={activeTab} tabCounts={tabCounts} />
            
            {error && (
              <div style={{ 
                padding: 16, 
                background: '#450a0a', 
                borderRadius: 8, 
                marginBottom: 16,
                border: '1px solid #7f1d1d'
              }}>
                <p style={{ margin: 0, color: '#fca5a5' }}>Error: {error}</p>
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {events.length === 0 ? (
                <div style={{ 
                  padding: 48, 
                  textAlign: 'center', 
                  color: '#666',
                  border: '2px dashed #222',
                  borderRadius: 12
                }}>
                  {activeTab === 'new' ? (
                    <>
                      <p style={{ margin: '0 0 8px 0', fontSize: 16, color: '#888' }}>
                        No agent signals yet
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: '#555' }}>
                        Waiting for on-chain AgentCreated events or GitHub/X sources.
                      </p>
                    </>
                  ) : (
                    <p>No events found in this tab.</p>
                  )}
                </div>
              ) : (
                events.map((event) => (
                  <EventCard key={event.event_id} event={event} />
                ))
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Hot Right Now */}
            <HotRightNow />

            {/* Live Stats */}
            <div style={{ 
              padding: 20, 
              background: '#111', 
              borderRadius: 12,
              border: '1px solid #222'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, color: '#888' }}>
                Live Stats
              </h3>
              <LiveStats />
            </div>

            {/* Protocol Info */}
            <div style={{ 
              padding: 20, 
              background: '#111', 
              borderRadius: 12,
              border: '1px solid #222'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, color: '#888' }}>
                Protocol Info
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: 14 }}>Network</span>
                  <span style={{ color: '#a855f7', fontSize: 14 }}>Base Sepolia</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: 14 }}>Indexer</span>
                  <span style={{ color: '#34d399', fontSize: 14 }}>Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: 14 }}>Filter</span>
                  <span style={{ color: '#888', fontSize: 14, textTransform: 'capitalize' }}>
                    {category}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
