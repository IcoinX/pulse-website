'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users,
  Flame,
  ChevronUp,
  ExternalLink,
  Lock,
  Unlock
} from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plojsqsjykzqwdaolfpi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_r61eP5kLy0S15KiUXr4x0g_Fh0368BQ';

const supabase = createClient(supabaseUrl, supabaseKey);

interface Challenge {
  id: string;
  challenge_id: number;
  event_id: number;
  challenger_address: string;
  challenger_stake: number;
  title: string;
  description: string;
  evidence_urls: string[];
  status: 'OPEN' | 'VOTING' | 'RESOLVED';
  resolution: 'VALID' | 'INVALID' | 'INCONCLUSIVE' | null;
  resolution_reason: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  votes_for: number;
  votes_against: number;
  quorum_reached: boolean;
  created_at: string;
  voting_ends_at: string | null;
}

interface ChallengePanelProps {
  eventId: number;
  eventStatus: string;
}

const MIN_STAKE = 50; // Minimum GENESIS tokens to challenge
const QUORUM_THRESHOLD = 1000; // Minimum total votes to resolve

export default function ChallengePanel({ eventId, eventStatus }: ChallengePanelProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stake, setStake] = useState(MIN_STAKE);
  const [evidence, setEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadChallenges();
    
    // Check for wallet connection (mock for now)
    const saved = localStorage.getItem('pulse_wallet_address');
    if (saved) setUserAddress(saved);
  }, [eventId]);

  async function loadChallenges() {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setChallenges(data);
    }
    setLoading(false);
  }

  async function handleSubmitChallenge(e: React.FormEvent) {
    e.preventDefault();
    if (!userAddress) {
      alert('Connect wallet first');
      return;
    }
    
    setSubmitting(true);
    
    // Get next challenge ID
    const { data: maxId } = await supabase
      .from('challenges')
      .select('challenge_id')
      .order('challenge_id', { ascending: false })
      .limit(1);
    
    const nextId = (maxId?.[0]?.challenge_id || 1000) + 1;
    
    const { error } = await supabase.from('challenges').insert({
      challenge_id: nextId,
      event_id: eventId,
      challenger_address: userAddress,
      challenger_stake: stake,
      title,
      description,
      evidence_urls: evidence.split('\n').filter(u => u.trim()),
      status: 'OPEN',
      votes_for: 0,
      votes_against: 0
    });
    
    if (error) {
      alert('Error: ' + error.message);
    } else {
      setShowCreateForm(false);
      setTitle('');
      setDescription('');
      setEvidence('');
      loadChallenges();
    }
    
    setSubmitting(false);
  }

  const activeChallenge = challenges.find(c => c.status !== 'RESOLVED');
  const resolvedChallenges = challenges.filter(c => c.status === 'RESOLVED');

  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <div className="animate-pulse h-32 bg-white/10 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Challenge */}
      {activeChallenge ? (
        <ActiveChallengeCard challenge={activeChallenge} onVote={loadChallenges} />
      ) : (
        <NoChallengeCard 
          eventStatus={eventStatus}
          onChallenge={() => setShowCreateForm(true)}
          hasWallet={!!userAddress}
        />
      )}

      {/* Create Challenge Form */}
      {showCreateForm && (
        <CreateChallengeForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          stake={stake}
          setStake={setStake}
          evidence={evidence}
          setEvidence={setEvidence}
          submitting={submitting}
          onSubmit={handleSubmitChallenge}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Resolved Challenges History */}
      {resolvedChallenges.length > 0 && (
        <ResolvedChallengesList challenges={resolvedChallenges} />
      )}
    </div>
  );
}

function NoChallengeCard({ 
  eventStatus, 
  onChallenge, 
  hasWallet 
}: { 
  eventStatus: string; 
  onChallenge: () => void;
  hasWallet: boolean;
}) {
  const isDisputable = ['PENDING', 'VERIFIED'].includes(eventStatus);
  
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-green-500/10 rounded-lg">
          <Shield className="w-6 h-6 text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">No Active Challenge</h3>
          <p className="text-gray-400 text-sm mb-4">
            This event has not been challenged. If you believe it's false or misleading, 
            you can stake {MIN_STAKE} GENESIS to open a challenge.
          </p>
          
          {isDisputable ? (
            <button
              onClick={onChallenge}
              disabled={!hasWallet}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertTriangle className="w-4 h-4" />
              Challenge Event
            </button>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              Event status prevents new challenges
            </div>
          )}
          
          {!hasWallet && (
            <p className="text-xs text-gray-500 mt-2">
              Connect wallet to challenge (simulated: set pulse_wallet_address in localStorage)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ActiveChallengeCard({ 
  challenge, 
  onVote 
}: { 
  challenge: Challenge; 
  onVote: () => void;
}) {
  const totalVotes = challenge.votes_for + challenge.votes_against;
  const forPct = totalVotes > 0 ? (challenge.votes_for / totalVotes) * 100 : 0;
  const timeLeft = challenge.voting_ends_at 
    ? new Date(challenge.voting_ends_at).getTime() - Date.now()
    : 0;
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

  return (
    <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-orange-400">Active Challenge</h3>
            <p className="text-xs text-gray-500">#{challenge.challenge_id} • Open for voting</p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-medium bg-orange-500/20 text-orange-400 rounded-full">
          {challenge.status}
        </span>
      </div>

      <h4 className="font-medium mb-2">{challenge.title}</h4>
      <p className="text-sm text-gray-400 mb-4">{challenge.description}</p>

      {/* Evidence */}
      {challenge.evidence_urls?.length > 0 && (
        <div className="mb-4">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Evidence</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {challenge.evidence_urls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-500/10 rounded"
              >
                <ExternalLink className="w-3 h-3" />
                Link {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Voting Progress */}
      <div className="bg-black/30 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Community Vote</span>
          <span className="text-sm text-gray-400">{hoursLeft}h left</span>
        </div>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-green-400">Valid ({challenge.votes_for})</span>
              <span className="text-red-400">Invalid ({challenge.votes_against})</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-red-500"
                style={{ 
                  background: `linear-gradient(to right, #22c55e ${forPct}%, #ef4444 ${forPct}%)` 
                }}
              />
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          Quorum: {totalVotes}/{QUORUM_THRESHOLD} votes
          {challenge.quorum_reached && ' ✅ Reached'}
        </p>
      </div>

      {/* Challenger Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-400">
          Staked: <span className="text-white font-medium">{challenge.challenger_stake} GENESIS</span>
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {challenge.challenger_address.slice(0, 8)}...{challenge.challenger_address.slice(-6)}
        </div>
      </div>
    </div>
  );
}

function CreateChallengeForm({
  title, setTitle,
  description, setDescription,
  stake, setStake,
  evidence, setEvidence,
  submitting,
  onSubmit, onCancel
}: {
  title: string; setTitle: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  stake: number; setStake: (v: number) => void;
  evidence: string; setEvidence: (v: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-red-500/5 rounded-xl border border-red-500/20 p-6">
      <h3 className="font-semibold text-red-400 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Create Challenge
      </h3>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Why is this event false or misleading?"
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide detailed reasoning and evidence..."
            rows={3}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 resize-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Evidence URLs (one per line)</label>
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="https://basescan.org/tx/...&#10;https://twitter.com/..."
            rows={2}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 resize-none font-mono text-xs"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Stake (min {MIN_STAKE} GENESIS)
          </label>
          <input
            type="number"
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            min={MIN_STAKE}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500/50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Stake will be slashed if challenge is rejected. Returned + reward if valid.
          </p>
        </div>
        
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !title || !description}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Challenge'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function ResolvedChallengesList({ challenges }: { challenges: Challenge[] }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-400" />
        Challenge History
      </h3>
      
      <div className="space-y-3">
        {challenges.map((c) => {
          const isValid = c.resolution === 'VALID';
          const Icon = isValid ? CheckCircle : XCircle;
          const color = isValid ? 'text-green-400' : 'text-red-400';
          
          return (
            <div key={c.id} className="flex items-start gap-3 p-3 bg-black/30 rounded-lg">
              <Icon className={`w-5 h-5 ${color} mt-0.5`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">#{c.challenge_id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${isValid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {c.resolution}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{c.title}</p>
                {c.resolution_reason && (
                  <p className="text-xs text-gray-500 mt-1">{c.resolution_reason}</p>
                )}
              </div>
              <span className="text-xs text-gray-600">
                {new Date(c.resolved_at!).toLocaleDateString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
