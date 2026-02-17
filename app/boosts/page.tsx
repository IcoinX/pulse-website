import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function BoostsPage() {
  // Fetch boosts
  const { data: boosts, error } = await supabase
    .from('boosts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch event titles separately
  const eventIds = boosts?.map(b => b.event_id).filter(Boolean) || [];
  const { data: events } = await supabase
    .from('events')
    .select('event_id, title')
    .in('event_id', eventIds.length > 0 ? eventIds : [0]);

  const eventMap = new Map(events?.map(e => [e.event_id, e.title]) || []);

  const totalBoosts = (boosts || []).reduce((sum, b) => sum + (Number(b.amount_wei) || 0) / 1e18, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <Header />
      
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700 }}>
            Boosts
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
            {totalBoosts} total signals of importance across all events
          </p>
          {/* DEBUG */}
          <p style={{ margin: '8px 0 0 0', color: '#fbbf24', fontSize: 12 }}>
            Debug: {boosts?.length || 0} boosts loaded {error ? '| Error: ' + error.message : ''}
          </p>
        </div>
        
        {error && (
          <div style={{ padding: 16, background: '#450a0a', borderRadius: 8, marginBottom: 16 }}>
            <p style={{ margin: 0, color: '#fca5a5' }}>Error: {error.message}</p>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {boosts && boosts.length > 0 ? (
            boosts.map((boost: any) => (
              <div key={boost.boost_id} style={{
                padding: 20,
                background: '#111',
                borderRadius: 12,
                border: '1px solid #222',
                borderLeft: '3px solid #a855f7'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Link 
                    href={`/events/${boost.event_id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>
                      {eventMap.get(boost.event_id) || `Event #${boost.event_id}`}
                    </h3>
                  </Link>
                  <span style={{
                    padding: '6px 12px',
                    background: '#a855f722',
                    borderRadius: 6,
                    fontSize: 14,
                    color: '#a855f7',
                    fontWeight: 600
                  }}>
                    +{(Number(boost.amount_wei) / 1e18).toFixed(2)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
                    By: {boost.booster?.slice(0, 20)}...
                  </span>
                  <span style={{ fontSize: 12, color: '#666' }}>
                    {new Date(boost.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: 48, 
              textAlign: 'center', 
              color: '#666',
              border: '2px dashed #222',
              borderRadius: 12
            }}>
              <p style={{ fontSize: 16, margin: '0 0 8px 0' }}>⚡ No boosts yet</p>
              <p style={{ fontSize: 14, margin: 0 }}>Be the first to signal important events</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
