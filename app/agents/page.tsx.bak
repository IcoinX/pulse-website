'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AgentEvent, 
  AgentEventType, 
  AgentEventStatus,
  AgentEventSourceKind,
  VerificationBadge 
} from '@/types';
import { 
  mockAgentEvents, 
  getEventsBySource,
  getEventsByType,
  getEventsByStatus,
  getRecentlyCreated,
  getTopValidators,
  getUnderDispute,
  agentEventsStats 
} from '@/lib/agentEventsData';
import AgentEventCard from '@/components/AgentEventCard';
import { 
  Bot, 
  Filter, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Activity,
  Clock,
  GitBranch,
  Link2,
  Twitter,
  CheckCircle,
  XCircle,
  HelpCircle,
  Zap
} from 'lucide-react';

// ============================================
// FILTER CONFIGURATION
// ============================================

type FilterTab = 'all' | AgentEventType | AgentEventStatus | AgentEventSourceKind;

const FILTER_TABS: { id: FilterTab; label: string; icon: React.ReactNode; count?: number }[] = [
  { id: 'all', label: 'All Events', icon: <Activity className="w-4 h-4" />, count: agentEventsStats.total },
  { id: 'AGENT_CREATED', label: 'Created', icon: <Bot className="w-4 h-4" />, count: agentEventsStats.byType.created },
  { id: 'AGENT_STAKED', label: 'Staked', icon: <Shield className="w-4 h-4" />, count: agentEventsStats.byType.staked },
  { id: 'AGENT_BOOSTED', label: 'Boosted', icon: <Zap className="w-4 h-4" />, count: agentEventsStats.byType.boosted },
  { id: 'AGENT_SLASHED', label: 'Slashed', icon: <AlertTriangle className="w-4 h-4" />, count: agentEventsStats.byType.slashed },
  { id: 'CHALLENGED', label: 'Disputed', icon: <HelpCircle className="w-4 h-4" />, count: agentEventsStats.underDispute },
];

const SOURCE_FILTERS: { id: AgentEventSourceKind | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Sources', icon: <Filter className="w-4 h-4" /> },
  { id: 'ONCHAIN', label: 'On-Chain', icon: <Link2 className="w-4 h-4" /> },
  { id: 'GITHUB', label: 'GitHub', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'X', label: 'X / Twitter', icon: <Twitter className="w-4 h-4" /> },
];

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sourceFilter, setSourceFilter] = useState<AgentEventSourceKind | 'all'>('all');
  const [badgeFilter, setBadgeFilter] = useState<VerificationBadge | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter events
  const filteredEvents = useMemo(() => {
    let events = [...mockAgentEvents];

    // Filter by tab (type or status)
    if (activeTab !== 'all') {
      if (['AGENT_CREATED', 'AGENT_UPDATED', 'AGENT_STAKED', 'AGENT_SLASHED', 'AGENT_BOOSTED', 'AGENT_PROMOTED', 'AGENT_SIGNAL'].includes(activeTab)) {
        events = getEventsByType(events, activeTab as AgentEventType);
      } else if (['PENDING', 'CHALLENGED', 'VERIFIED', 'REJECTED'].includes(activeTab)) {
        events = getEventsByStatus(events, activeTab as AgentEventStatus);
      }
    }

    // Filter by source
    if (sourceFilter !== 'all') {
      events = getEventsBySource(events, sourceFilter);
    }

    // Filter by badge
    if (badgeFilter !== 'all') {
      events = events.filter(e => e.verification.badge === badgeFilter);
    }

    // Sort by timestamp (newest first)
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activeTab, sourceFilter, badgeFilter]);

  // Get section data
  const recentlyCreated = useMemo(() => getRecentlyCreated(mockAgentEvents, 24), []);
  const topValidators = useMemo(() => getTopValidators(mockAgentEvents), []);
  const underDispute = useMemo(() => getUnderDispute(mockAgentEvents), []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Agents Feed</h1>
                  <p className="text-gray-400">Live intelligence from on-chain, GitHub, and X</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{agentEventsStats.total}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Events</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{agentEventsStats.byStatus.verified}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Verified</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{agentEventsStats.underDispute}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Disputed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main tabs */}
            <div className="flex flex-wrap gap-2">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.5 text-xs rounded ${
                      activeTab === tab.id ? 'bg-purple-500/30' : 'bg-white/10'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Source filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Source:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as AgentEventSourceKind | 'all')}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50"
              >
                {SOURCE_FILTERS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Badge filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Badge:</span>
              <select
                value={badgeFilter}
                onChange={(e) => setBadgeFilter(e.target.value as VerificationBadge | 'all')}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50"
              >
                <option value="all">All</option>
                <option value="VERIFIED">Verified</option>
                <option value="CHECKED">Checked</option>
                <option value="RAW">Raw</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Agent Activity
                <span className="px-2 py-0.5 text-sm bg-white/10 text-gray-400 rounded-full">
                  {filteredEvents.length}
                </span>
              </h2>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredEvents.length > 0 ? (
                <div className="space-y-4">
                  {filteredEvents.map((event, index) => (
                    <AgentEventCard key={event.id} event={event} index={index} />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                >
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                  <p className="text-gray-400">Try adjusting your filters</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recently Created */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                Recently Created
              </h3>
              <div className="space-y-3">
                {recentlyCreated.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <span className="text-2xl">{event.metadata?.avatar || '🤖'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{event.entities.agent}</p>
                      <p className="text-xs text-gray-500">{event.type.replace('AGENT_', '')}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] rounded ${
                      event.verification.badge === 'VERIFIED' ? 'bg-green-500/20 text-green-400' :
                      event.verification.badge === 'CHECKED' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {event.verification.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Validators */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                Top Validators
              </h3>
              <div className="space-y-3">
                {topValidators.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-sm font-bold text-white">
                      {event.metadata?.rank || '★'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{event.entities.agent}</p>
                      <p className="text-xs text-gray-500">{event.economics?.stakeAmount || '0'} PULSE</p>
                    </div>
                  </div>
                ))}
                {topValidators.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No top validators yet</p>
                )}
              </div>
            </div>

            {/* Under Dispute */}
            {underDispute.length > 0 && (
              <div className="bg-red-500/5 backdrop-blur-sm rounded-xl border border-red-500/20 p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Under Dispute
                </h3>
                <div className="space-y-3">
                  {underDispute.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
                      <span className="text-2xl">{event.metadata?.avatar || '⚠️'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{event.entities.agent}</p>
                        <p className="text-xs text-red-400">{event.type.replace('AGENT_', '')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Distribution */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Sources</h3>
              <div className="space-y-3">
                {[
                  { source: 'ONCHAIN', count: agentEventsStats.bySource.onchain, color: 'bg-blue-500' },
                  { source: 'GITHUB', count: agentEventsStats.bySource.github, color: 'bg-gray-500' },
                  { source: 'X', count: agentEventsStats.bySource.x, color: 'bg-sky-500' },
                ].map(({ source, count, color }) => (
                  <div key={source} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm text-gray-400 flex-1">{source}</span>
                    <span className="text-sm font-medium text-white">{count}</span>
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${color}`} 
                        style={{ width: `${(count / agentEventsStats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
