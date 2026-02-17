'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { VerificationBlock } from '@/components/VerificationBadge';
import type { VerificationStatus } from '@/components/VerificationBadge';
import ChallengePanel from '@/components/ChallengePanel';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  Shield, 
  Database,
  ChevronUp,
  Flame,
  TrendingUp,
  Users,
  Zap,
  Blocks,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

interface Event {
  event_id: string;
  title: string;
  summary?: string;
  content?: string;
  source: string;
  sourceUrl: string;
  status: string;
  verification_score: number;
  verification_status?: VerificationStatus;
  verification_reason?: string;
  verified_at?: string;
  verified_by?: string;
  impact?: { market: number; narrative: number; tech: number };
  metrics?: { boost?: number; burn?: number };
  evidence?: Array<{ source_type: string; url: string; tx_hash?: string }>;
  tags?: string[];
  created_at: string;
  agent_slug?: string;
  agent_symbol?: string;
}

function formatTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'verified':
      return 'text-green-400 bg-green-500/10 border-green-500/30';
    case 'challenged':
      return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    case 'rejected':
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  }
}

export default function EventPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rawId = params?.id;
    if (!rawId || typeof rawId !== 'string') {
      setError('Invalid event ID');
      setLoading(false);
      return;
    }
    
    // event_id is numeric in DB
    const eventId = parseInt(rawId, 10);
    if (isNaN(eventId)) {
      setError('Invalid event ID format');
      setLoading(false);
      return;
    }
    
    (async () => {
    try {
      const result = await supabase
        .from('events')
        .select('*')
        .eq('event_id', eventId)
        .single();
      
      const { data, error: supabaseError } = result;
      
      if (supabaseError || !data) {
        console.error('Supabase error:', supabaseError);
        setError('Event not found');
      } else {
        // Normalize data to match Event interface
        const normalized: Event = {
          event_id: String(data.event_id),
          title: data.title || 'Untitled Event',
          summary: data.summary || data.description || '',
          content: data.content || '',
          source: data.source || data.source_type || 'Unknown',
          sourceUrl: data.sourceUrl || data.url || '#',
          status: data.status || 'PENDING',
          verification_score: data.verification_score || 0,
          impact: data.impact || { market: 0, narrative: 0, tech: 0 },
          metrics: data.metrics || { boost: 0, burn: 0 },
          evidence: data.evidence || [],
          tags: data.tags || [],
          created_at: data.created_at,
        };
        setEvent(normalized);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
    })();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-400">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Feed</span>
            </Link>
          </div>
        </header>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <p className="text-gray-400">{error || 'Event not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Feed</span>
          </Link>
          <span className="text-sm text-gray-500">Event Details</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(event.status)}`}>
              {(event.status || 'PENDING').toUpperCase()}
            </span>
            <span className="text-sm text-gray-400">{event.source}</span>
            <span className="text-gray-600">•</span>
            <span className="text-sm text-gray-500">{formatTimeAgo(event.created_at)}</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
            {event.title}
          </h1>
          
          <p className="text-gray-400 text-lg leading-relaxed">
            {event.summary || event.content}
          </p>
        </div>

        {/* Protocol Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-500">Verification</span>
            </div>
            <div className="text-xl font-bold">{event.verification_score || 0}%</div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-500">Market Impact</span>
            </div>
            <div className="text-xl font-bold">{event.impact?.market || 0}</div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-500">Narrative</span>
            </div>
            <div className="text-xl font-bold">{event.impact?.narrative || 0}</div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-500">Tech Impact</span>
            </div>
            <div className="text-xl font-bold">{event.impact?.tech || 0}</div>
          </div>
        </div>

        {/* Verification Block */}
        <VerificationBlock
          status={event.verification_status || 'PENDING'}
          reason={event.verification_reason}
          verifiedAt={event.verified_at}
          verifiedBy={event.verified_by}
          txHash={event.evidence?.[0]?.tx_hash}
          boostCount={event.metrics?.boost || 0}
          challengeCount={0}
        />

        {/* Token Metrics */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            Protocol Metrics
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChevronUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Total Boost</span>
              </div>
              <span className="text-lg font-semibold text-green-400">
                {(event.metrics?.boost || 0).toLocaleString()} PULSE
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-400">Total Burn</span>
              </div>
              <span className="text-lg font-semibold text-orange-400">
                {(event.metrics?.burn || 0).toLocaleString()} PULSE
              </span>
            </div>
          </div>
        </div>

        {/* Evidence Section */}
        {event.evidence && event.evidence.length > 0 && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Blocks className="w-5 h-5 text-blue-400" />
              Evidence ({event.evidence.length})
            </h2>
            
            <div className="space-y-3">
              {event.evidence.map((ev, idx) => (
                <div key={idx} className="bg-black/30 rounded-lg p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-400">
                      {ev.source_type}
                    </span>
                    <a href={ev.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      View
                    </a>
                  </div>
                  {ev.tx_hash && (
                    <div className="text-xs text-gray-500 font-mono">
                      Tx: {ev.tx_hash.slice(0, 20)}...{ev.tx_hash.slice(-8)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 text-sm bg-white/5 text-gray-300 rounded-lg border border-white/10">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Challenges & Resolution */}
        <div className="mb-8">
          <ChallengePanel 
            eventId={Number(event.event_id)} 
            eventStatus={event.verification_status || 'PENDING'}
          />
        </div>

        {/* Linked Agent */}
        {event.agent_slug && (
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {event.agent_symbol?.[0] || 'A'}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Linked Agent</p>
                  <p className="text-white font-medium">{event.agent_symbol || event.agent_slug}</p>
                </div>
              </div>
              <Link 
                href={`/agents/${event.agent_slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">View Agent</span>
              </Link>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-6 border-t border-white/10">
          {event.sourceUrl && event.sourceUrl !== '#' ? (
            <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm font-medium">View Source</span>
            </a>
          ) : null}
          
          <Link href="/" className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Feed</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
