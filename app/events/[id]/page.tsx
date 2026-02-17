import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

interface PageProps {
  params: { id: string };
}

export default async function EventPage({ params }: PageProps) {
  const { id } = params;
  
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_id', parseInt(id))
    .single();
  
  if (error || !event) {
    notFound();
  }

  // Fetch challenges and boosts for this event
  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .eq('event_id', parseInt(id))
    .order('created_at', { ascending: false });

  const { data: boosts } = await supabase
    .from('boosts')
    .select('*')
    .eq('event_id', parseInt(id))
    .order('created_at', { ascending: false });

  const icons: Record<string, string> = {
    'AGENT': '🤖',
    'ONCHAIN': '⛓️',
    'MEDIA': '📰',
    'GITHUB': '💻',
    'X': '🐦'
  };

  const categoryMap: Record<string, string> = {
    'AGENT': 'Agents',
    'ONCHAIN': 'Crypto',
    'MEDIA': 'AI',
    'GITHUB': 'Tech',
    'X': 'AI'
  };

  const hasRawData = event.raw_data && Object.keys(event.raw_data).length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <Header />
      
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <Link 
          href="/"
          style={{ 
            color: '#888', 
            textDecoration: 'none', 
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24
          }}
        >
          ← Back to feed
        </Link>
        
        {/* Event Header */}
        <article style={{
          padding: 32,
          background: '#111',
          borderRadius: 16,
          border: '1px solid #222',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
            <span style={{ fontSize: 48 }}>{icons[event.source_type] || '📋'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 10px',
                  background: '#1a1a1a',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#888'
                }}>
                  {categoryMap[event.source_type] || event.source_type}
                </span>
                <span style={{
                  padding: '4px 10px',
                  background: '#fbbf2422',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#fbbf24',
                  fontWeight: 500
                }}>
                  {event.status}
                </span>
                {(challenges?.length || 0) > 0 && (
                  <span style={{
                    padding: '4px 10px',
                    background: '#ef444422',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#ef4444',
                    fontWeight: 500
                  }}>
                    {challenges?.length} Challenge{challenges?.length !== 1 ? 's' : ''}
                  </span>
                )}
                {(boosts?.length || 0) > 0 && (
                  <span style={{
                    padding: '4px 10px',
                    background: '#a855f722',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#a855f7',
                    fontWeight: 500
                  }}>
                    {boosts?.length} Boost
                  </span>
                )}
              </div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, lineHeight: 1.3 }}>
                {event.title}
              </h1>
            </div>
          </div>
          
          {/* Meta */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16,
            padding: 16,
            background: '#0a0a0a',
            borderRadius: 8
          }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#666' }}>Event ID</p>
              <p style={{ margin: 0, fontFamily: 'monospace', color: '#888' }}>#{event.event_id}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#666' }}>Source</p>
              <p style={{ margin: 0, color: '#888' }}>{event.source_type}</p>
            </div>
            {event.chain_id && (
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#666' }}>Chain</p>
                <p style={{ margin: 0, fontFamily: 'monospace', color: '#888' }}>{event.chain_id}</p>
              </div>
            )}
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#666' }}>Created</p>
              <p style={{ margin: 0, color: '#888' }}>
                {new Date(event.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </article>
        
        {/* Evidence Panel */}
        <section style={{
          padding: 24,
          background: '#111',
          borderRadius: 16,
          border: '1px solid #222',
          marginBottom: 24
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600 }}>
            Evidence & Verification
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Canonical Hash */}
            {event.canonical_hash && (
              <div style={{ padding: 16, background: '#0a0a0a', borderRadius: 8 }}>
                <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#666' }}>
                  Canonical Hash
                </p>
                <code style={{ 
                  fontSize: 12, 
                  color: '#888',
                  wordBreak: 'break-all'
                }}>
                  {event.canonical_hash}
                </code>
              </div>
            )}
            
            {/* Raw Data - only if present */}
            {hasRawData ? (
              <div style={{ padding: 16, background: '#0a0a0a', borderRadius: 8 }}>
                <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#666' }}>
                  Raw Event Data
                </p>
                <pre style={{ 
                  margin: 0,
                  fontSize: 11,
                  color: '#666',
                  overflow: 'auto',
                  maxHeight: 200
                }}>
                  {JSON.stringify(event.raw_data, null, 2)}
                </pre>
              </div>
            ) : (
              <div style={{ 
                padding: 24, 
                background: '#0a0a0a', 
                borderRadius: 8,
                border: '1px dashed #333',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                  📋 No evidence payload yet
                </p>
                <p style={{ margin: '8px 0 0 0', color: '#444', fontSize: 12 }}>
                  Event data will be enriched as verification progresses
                </p>
              </div>
            )}
          </div>
        </section>
        
        {/* Challenges Section */}
        <section style={{
          padding: 24,
          background: '#111',
          borderRadius: 16,
          border: '1px solid #222',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              Challenges
            </h2>
            <span style={{ 
              padding: '4px 12px', 
              background: challenges?.length ? '#ef444422' : '#1a1a1a',
              borderRadius: 6,
              fontSize: 13,
              color: challenges?.length ? '#ef4444' : '#666'
            }}>
              {challenges?.length || 0} open
            </span>
          </div>
          
          {challenges && challenges.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {challenges.map((challenge: any) => (
                <div key={challenge.challenge_id} style={{
                  padding: 16,
                  background: '#0a0a0a',
                  borderRadius: 8,
                  borderLeft: '3px solid #ef4444'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#888', fontFamily: 'monospace' }}>
                      {challenge.challenger?.slice(0, 20)}...
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      background: challenge.status === 'OPEN' ? '#ef444422' : '#22c55e22',
                      borderRadius: 4,
                      fontSize: 11,
                      color: challenge.status === 'OPEN' ? '#ef4444' : '#22c55e'
                    }}>
                      {challenge.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: '#ccc' }}>
                    {challenge.reason}
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#666' }}>
                    {new Date(challenge.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: 32, 
              background: '#0a0a0a', 
              borderRadius: 8,
              border: '1px dashed #333',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                🛡️ No challenges yet
              </p>
              <p style={{ margin: '8px 0 0 0', color: '#444', fontSize: 12 }}>
                This event has not been contested
              </p>
            </div>
          )}
        </section>
        
        {/* Boosts Section */}
        <section style={{
          padding: 24,
          background: '#111',
          borderRadius: 16,
          border: '1px solid #222',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              Boosts
            </h2>
            <span style={{ 
              padding: '4px 12px', 
              background: boosts?.length ? '#a855f722' : '#1a1a1a',
              borderRadius: 6,
              fontSize: 13,
              color: boosts?.length ? '#a855f7' : '#666'
            }}>
              {boosts?.reduce((sum: number, b: any) => sum + (Number(b.amount_wei) || 0) / 1e18, 0).toFixed(2)} total
            </span>
          </div>
          
          {boosts && boosts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {boosts.map((boost: any) => (
                <div key={boost.boost_id} style={{
                  padding: 16,
                  background: '#0a0a0a',
                  borderRadius: 8,
                  borderLeft: '3px solid #a855f7'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#888', fontFamily: 'monospace' }}>
                      {boost.booster?.slice(0, 20)}...
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      background: '#a855f722',
                      borderRadius: 4,
                      fontSize: 11,
                      color: '#a855f7',
                      fontWeight: 600
                    }}>
                      +{(Number(boost.amount_wei) / 1e18).toFixed(2)}
                    </span>
                  </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#666' }}>
                    {new Date(boost.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: 32, 
              background: '#0a0a0a', 
              borderRadius: 8,
              border: '1px dashed #333',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                ⚡ No boosts yet
              </p>
              <p style={{ margin: '8px 0 0 0', color: '#444', fontSize: 12 }}>
                Be the first to signal importance
              </p>
            </div>
          )}
        </section>
        
        {/* Timeline */}
        <section style={{
          padding: 24,
          background: '#111',
          borderRadius: 16,
          border: '1px solid #222'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600 }}>
            Timeline
          </h2>
          
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{ 
              position: 'absolute',
              left: 7,
              top: 8,
              bottom: 8,
              width: 2,
              background: '#222'
            }} />
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                position: 'absolute',
                left: 0,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#a855f7',
                border: '2px solid #000'
              }} />
              <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                Event created
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#666' }}>
                {new Date(event.created_at).toLocaleString()}
              </p>
            </div>
            
            {event.resolved_at && (
              <div>
                <div style={{ 
                  position: 'absolute',
                  left: 0,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#34d399',
                  border: '2px solid #000'
                }} />
                <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                  Event resolved
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#666' }}>
                  {new Date(event.resolved_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
