import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function ChallengesPage() {
  // Fetch challenges
  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch event titles separately
  const eventIds = challenges?.map(c => c.event_id).filter(Boolean) || [];
  const { data: events } = await supabase
    .from('events')
    .select('event_id, title')
    .in('event_id', eventIds.length > 0 ? eventIds : [0]);

  const eventMap = new Map(events?.map(e => [e.event_id, e.title]) || []);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <Header />
      
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700 }}>
            Challenges
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
            Contested events under review
          </p>
        </div>
        
        {error && (
          <div style={{ padding: 16, background: '#450a0a', borderRadius: 8, marginBottom: 16 }}>
            <p style={{ margin: 0, color: '#fca5a5' }}>Error: {error.message}</p>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {challenges && challenges.length > 0 ? (
            challenges.map((challenge: any) => (
              <div key={challenge.challenge_id} style={{
                padding: 20,
                background: '#111',
                borderRadius: 12,
                border: '1px solid #222',
                borderLeft: '3px solid #ef4444'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Link 
                    href={`/events/${challenge.event_id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>
                      {eventMap.get(challenge.event_id) || `Event #${challenge.event_id}`}
                    </h3>
                  </Link>
                  <span style={{
                    padding: '4px 10px',
                    background: challenge.status === 'OPEN' ? '#ef444422' : '#22c55e22',
                    borderRadius: 6,
                    fontSize: 12,
                    color: challenge.status === 'OPEN' ? '#ef4444' : '#22c55e'
                  }}>
                    {challenge.status}
                  </span>
                </div>
                
                <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#ccc' }}>
                  {challenge.reason}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
                    By: {challenge.challenger?.slice(0, 20)}...
                  </span>
                  <span style={{ fontSize: 12, color: '#666' }}>
                    {new Date(challenge.created_at).toLocaleDateString()}
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
              <p style={{ fontSize: 16, margin: '0 0 8px 0' }}>🛡️ No challenges yet</p>
              <p style={{ fontSize: 14, margin: 0 }}>Events are being verified without contestation</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
