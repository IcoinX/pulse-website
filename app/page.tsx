import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import LiveStats from '@/components/LiveStats';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

interface PageProps {
  searchParams: { category?: string };
}

export default async function Home({ searchParams }: PageProps) {
  const category = searchParams.category || 'all';
  
  let events: any[] = [];
  let error: string | null = null;

  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
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
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 600 }}>
                Latest Intelligence
              </h2>
              <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                {events.length} events {category !== 'all' ? `in ${category}` : 'tracked'}
              </p>
            </div>
            
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
                  <p>No events found {category !== 'all' ? `in ${category}` : ''}.</p>
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
// Tue Feb 17 23:22:09 CET 2026
