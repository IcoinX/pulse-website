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
    // Base query
    let query = supabase
      .from('events')
      .select('*');
    
    // Apply tab filters
    switch (activeTab) {
      case 'live':
        // Live = recent events (last 24h)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', yesterday);
        break;
      case 'new':
        // New agents = AGENT type or recent deployments
        query = query.or('source_type.eq.AGENT,title.ilike.%deploy%,title.ilike.%launch%');
        break;
      case 'trending':
        // Trending = verified events (highest trust) + recent
        query = query.eq('verification_status', 'VERIFIED');
        break;
      case 'research':
        // Research = MEDIA type or detailed content
        query = query.eq('source_type', 'MEDIA');
        break;
    }
    
    // Apply category filter if specified
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
    
    // Order and limit
    query = query.order('created_at', { ascending: false }).limit(50);
    
    const { data, error: supaError } = await query;
    
    if (supaError) {
      error = supaError.message;
    } else {
      events = data || [];
    }
    
    // Get counts for each tab (simplified - in production these would be separate queries)
    const { count: liveCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    const { count: newCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .or('source_type.eq.AGENT,title.ilike.%deploy%');
    
    const { count: trendingCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'VERIFIED');
    
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
    
  } catch (e: any) {
    error = e.message;
  }

  const getTabTitle = (tab: FeedTab) => {
    switch (tab) {
      case 'live': return 'Breaking Live';
      case 'new': return 'New Agents';
      case 'trending': return 'Trending Now';
      case 'research': return 'Research & Analysis';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <Header activeTab={category} />
      
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
          {/* Main Feed */}
          <div>
            {/* Tabs */}
            <FeedTabsWrapper 
              activeTab={activeTab} 
              counts={tabCounts}
            />
            
            {/* Feed Header */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 600 }}>
                {getTabTitle(activeTab)}
              </h2>
              <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                {events.length} events tracked
                {category !== 'all' && ` in ${category}`}
              </p>
            </div>
            
            {/* Error */}
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
            
            {/* Events List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {events.length === 0 ? (
                <div style={{ 
                  padding: 48, 
                  textAlign: 'center', 
                  color: '#666',
                  border: '2px dashed #222',
                  borderRadius: 12
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: 16 }}>No events found</p>
                  <p style={{ margin: 0, fontSize: 14, color: '#555' }}>
                    {activeTab === 'live' && 'Check back soon for breaking events'}
                    {activeTab === 'new' && 'New agent launches will appear here'}
                    {activeTab === 'trending' && 'Trending events will appear here'}
                    {activeTab === 'research' && 'Research articles will appear here'}
                  </p>
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
                  <span style={{ color: '#A855F7', fontSize: 14 }}>Base Sepolia</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: 14 }}>Indexer</span>
                  <span style={{ color: '#22C55E', fontSize: 14 }}>Active</span>
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
