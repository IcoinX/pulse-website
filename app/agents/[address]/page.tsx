import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';
import ClaimAgent from '@/components/ClaimAgent';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

interface PageProps {
  params: { address: string };
}

export default async function AgentPage({ params }: PageProps) {
  const { address } = params;
  
  // Validate address format
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    notFound();
  }

  const normalizedAddress = address.toLowerCase();

  // Fetch agent data
  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .eq('address', normalizedAddress)
    .single();
  
  if (error || !agent) {
    notFound();
  }

  // Fetch events by this agent
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('agent_slug', normalizedAddress)
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch blocks by this agent
  const { data: blocks } = await supabase
    .from('blocks')
    .select('*')
    .eq('agent_address', normalizedAddress)
    .order('block_number', { ascending: false })
    .limit(10);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <Header />
      
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
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

        {/* Agent Header */}
        <div style={{
          padding: 32,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)',
          borderRadius: 16,
          border: '1px solid #222',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative gradient orb */}
          <div style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 24 }}>
              {/* Avatar */}
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                flexShrink: 0
              }}>
                🤖
              </div>

              <div style={{ flex: 1 }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700 }}>
                  {agent.name || `Agent ${formatAddress(agent.address)}`}
                </h1>
                <code style={{ 
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: '#0a0a0a',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#888',
                  fontFamily: 'monospace'
                }}>
                  {agent.address}
                </code>

                {agent.owner_address && (
                  <div style={{ 
                    marginTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{ 
                      padding: '4px 12px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: 6,
                      fontSize: 12,
                      color: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      ✅ Verified Owner
                    </span>
                    <span style={{ fontSize: 12, color: '#666' }}>
                      {formatAddress(agent.owner_address)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 16
            }}>
              <div style={{
                padding: 16,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#666' }}>Reputation</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#a855f7' }}>
                  {agent.reputation_score || 100}
                </p>
              </div>

              <div style={{
                padding: 16,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#666' }}>Blocks</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>
                  {agent.total_blocks || 0}
                </p>
              </div>

              <div style={{
                padding: 16,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#666' }}>Rewards</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#22c55e' }}>
                  {(Number(agent.total_rewards) / 1e18).toFixed(2)} GEN
                </p>
              </div>

              <div style={{
                padding: 16,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#666' }}>Events</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>
                  {events?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          {/* Main Content */}
          <div>
            {/* Description */}
            {agent.description && (
              <div style={{
                padding: 24,
                background: '#111',
                borderRadius: 12,
                border: '1px solid #222',
                marginBottom: 24
              }}>
                <h2 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600, color: '#888' }}>
                  About
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: '#ccc', lineHeight: 1.6 }}>
                  {agent.description}
                </p>
              </div>
            )}

            {/* Recent Events */}
            <div style={{
              padding: 24,
              background: '#111',
              borderRadius: 12,
              border: '1px solid #222',
              marginBottom: 24
            }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#888' }}>
                Recent Events
              </h2>
              
              {events && events.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {events.map((event: any) => (
                    <Link 
                      key={event.event_id}
                      href={`/events/${event.event_id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div style={{
                        padding: 16,
                        background: '#0a0a0a',
                        borderRadius: 8,
                        border: '1px solid transparent',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }} className="hover:border-purple-500/30">
                        <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#fff' }}>
                          {event.title}
                        </p>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{
                            padding: '2px 8px',
                            background: '#222',
                            borderRadius: 4,
                            fontSize: 11,
                            color: '#888'
                          }}>
                            {event.source_type}
                          </span>
                          <span style={{ fontSize: 11, color: '#666' }}>
                            {new Date(event.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, color: '#666', fontSize: 14, textAlign: 'center', padding: 24 }}>
                  No events yet
                </p>
              )}
            </div>

            {/* Recent Blocks */}
            {blocks && blocks.length > 0 && (
              <div style={{
                padding: 24,
                background: '#111',
                borderRadius: 12,
                border: '1px solid #222'
              }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#888' }}>
                  Recent Blocks
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {blocks.map((block: any) => (
                    <div key={block.block_number} style={{
                      padding: 16,
                      background: '#0a0a0a',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: 14, color: '#fff', fontFamily: 'monospace' }}>
                          Block #{block.block_number}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                          {new Date(block.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        background: 'rgba(168, 85, 247, 0.1)',
                        borderRadius: 6,
                        fontSize: 12,
                        color: '#a855f7',
                        fontWeight: 600
                      }}>
                        +{(Number(block.reward_amount) / 1e18).toFixed(2)} GEN
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Claim Agent Component */}
            <ClaimAgent 
              agentAddress={agent.address} 
              agentName={agent.name}
            />

            {/* Meta Info */}
            <div style={{
              padding: 20,
              background: '#111',
              borderRadius: 12,
              border: '1px solid #222'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, color: '#888' }}>
                Agent Info
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: 13 }}>Status</span>
                  <span style={{ 
                    color: agent.is_active ? '#22c55e' : '#9ca3af',
                    fontSize: 13 
                  }}>
                    {agent.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: 13 }}>First Seen</span>
                  <span style={{ color: '#888', fontSize: 13 }}>
                    {agent.first_seen ? new Date(agent.first_seen).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: 13 }}>Last Active</span>
                  <span style={{ color: '#888', fontSize: 13 }}>
                    {agent.last_active ? new Date(agent.last_active).toLocaleDateString() : 'Never'}
                  </span>
                </div>
                {agent.claimed_at && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: 13 }}>Claimed</span>
                    <span style={{ color: '#888', fontSize: 13 }}>
                      {new Date(agent.claimed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
