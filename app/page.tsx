export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';

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
    <div style={{ padding: 32, background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>PULSE Protocol</h1>
      <p>Build: 2026-02-17_0045Z_SUPABASE_V2</p>
      
      {error && (
        <div style={{ padding: 16, background: '#900', borderRadius: 8, marginBottom: 16 }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <h2>Events ({events.length})</h2>
      
      {events.length === 0 ? (
        <p style={{ color: '#666' }}>No events found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {events.map((event: any) => (
            <div key={event.event_id} style={{ padding: 16, background: '#111', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>
                  {event.source_type === 'AGENT' ? '🤖' : 
                   event.source_type === 'ONCHAIN' ? '⛓️' : '📰'}
                </span>
                <h3 style={{ margin: 0 }}>{event.title}</h3>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 14 }}>
                <span style={{ padding: '4px 8px', background: '#222', borderRadius: 4 }}>#{event.event_id}</span>
                <span style={{ padding: '4px 8px', background: '#222', borderRadius: 4 }}>{event.source_type}</span>
                <span style={{ padding: '4px 8px', background: '#330', color: '#ff0', borderRadius: 4 }}>{event.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
