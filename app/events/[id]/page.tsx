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

  const icons: Record<string, string> = {
    'AGENT': '🤖',
    'ONCHAIN': '⛓️',
    'MEDIA': '📰',
    'GITHUB': '💻',
    'X': '🐦'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <Header />
      
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
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
        
        <article style={{
          padding: 32,
          background: '#111',
          borderRadius: 16,
          border: '1px solid #222'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <span style={{ fontSize: 48 }}>{icons[event.source_type] || '📋'}</span>
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700, lineHeight: 1.3 }}>
                {event.title}
              </h1>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{
                  padding: '6px 12px',
                  background: '#1a1a1a',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#888'
                }}>
                  {event.source_type}
                </span>
                <span style={{
                  padding: '6px 12px',
                  background: '#fbbf2422',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#fbbf24',
                  fontWeight: 500
                }}>
                  {event.status}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ 
            padding: 20, 
            background: '#0a0a0a', 
            borderRadius: 12,
            marginBottom: 24
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#666' }}>
              Event Details
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Event ID</span>
                <span style={{ fontFamily: 'monospace', color: '#888' }}>#{event.event_id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Chain</span>
                <span style={{ fontFamily: 'monospace', color: '#888' }}>
                  {event.chain_id || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Created</span>
                <span style={{ color: '#888' }}>
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </div>
              {event.block_number && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Block</span>
                  <span style={{ fontFamily: 'monospace', color: '#888' }}>
                    {event.block_number}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Evidence section placeholder */}
          <div style={{ 
            padding: 20, 
            background: '#0a0a0a', 
            borderRadius: 12 
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#666' }}>
              Evidence & Verification
            </h3>
            <p style={{ margin: 0, color: '#888', fontSize: 14 }}>
              Evidence tracking and verification status will appear here.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
