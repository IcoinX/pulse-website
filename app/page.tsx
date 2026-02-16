import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function Home() {
  let events: any[] = [];
  let error: string | null = null;

  try {
    const { data, error: supaError } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
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
      <Header />
      
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
          {/* Feed */}
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 600 }}>
                Latest Intelligence
              </h2>
              <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                {events.length} events tracked
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
                  <p>No events found.</p>
                </div>
              ) : (
                events.map((event) => (
                  <EventCard key={event.event_id} event={event} />
                ))
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <aside>
            <div style={{ 
              padding: 20, 
              background: '#111', 
              borderRadius: 12,
              border: '1px solid #222'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, color: '#888' }}>
                Protocol Stats
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: 14 }}>Events</span>
                  <span style={{ fontWeight: 600 }}>{events.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: 14 }}>Status</span>
                  <span style={{ color: '#fbbf24', fontSize: 14 }}>Live</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      
      {/* Debug footer (hidden in prod) */}
      {process.env.NEXT_PUBLIC_DEBUG === 'true' && (
        <footer style={{ padding: 16, borderTop: '1px solid #222', fontSize: 12, color: '#444' }}>
          Build: 2026-02-17_0045Z_PROD_V1
        </footer>
      )}
    </div>
  );
}
