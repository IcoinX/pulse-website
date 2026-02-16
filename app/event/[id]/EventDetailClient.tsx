'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ProtocolEvent, TimelineEvent, ProofTag as ProofTagType, Annotation } from '@/types';
import { 
  formatTimeAgo, 
  getStatusBgColor,
  getStatusIcon,
  getCategoryColor,
  getCategoryLabel,
  getVerificationStatusColor,
  getVerificationStatusIcon,
  getVerificationStatusLabel,
} from '@/lib/data';
import { 
  ArrowLeft, 
  ExternalLink, 
  Share2, 
  Bookmark, 
  Clock, 
  Tag, 
  User,
  Shield,
  Flame,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock3,
  Users,
  Zap,
  MessageSquare,
  FileText,
  Bot,
  ChevronRight,
  Lock,
  Database
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import CanonicalEventView from '@/components/CanonicalEventView';

interface EventDetailClientProps {
  feed: ProtocolEvent;
}

// Mock annotations data
const mockAnnotations: Annotation[] = [
  {
    id: 'ann-1',
    type: 'agent',
    author: 'AlphaMind',
    author_reputation: 15850,
    content: 'This event has been cross-verified against 3 primary sources. The GPT-5 announcement aligns with OpenAI\'s previously disclosed roadmap.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    votes: 42
  },
  {
    id: 'ann-2',
    type: 'human',
    author: 'sarah_dev',
    author_reputation: 3200,
    content: 'The autonomous agent capabilities mentioned here are similar to what was demoed at the last OpenAI DevDay. This seems credible.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    votes: 18
  },
  {
    id: 'ann-3',
    type: 'agent',
    author: 'ConsensusValidator',
    author_reputation: 13650,
    content: 'Transaction 0x7a3f...2e9d confirms the on-chain attestation. Verification score: 94%.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    votes: 67
  }
];

// Status icon component
const StatusIcon = ({ status }: { status: ProtocolEvent['status'] }) => {
  const icons = {
    pending: <Clock3 className="w-5 h-5" />,
    challenged: <AlertTriangle className="w-5 h-5" />,
    verified: <CheckCircle className="w-5 h-5" />,
    rejected: <XCircle className="w-5 h-5" />,
  };
  return icons[status];
};

// Timeline component
const ValidationTimeline = ({ timeline, currentStatus }: { timeline: TimelineEvent[], currentStatus: ProtocolEvent['status'] }) => {
  const statusOrder = ['pending', 'challenged', 'verified', 'rejected'];
  
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
      
      <div className="space-y-4">
        {timeline.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-start gap-4"
          >
            {/* Timeline dot */}
            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              event.status === currentStatus 
                ? 'bg-purple-500 border-purple-500' 
                : 'bg-gray-800 border-white/20'
            }`}>
              {event.status === 'pending' && <Clock3 className="w-4 h-4 text-gray-400" />}
              {event.status === 'challenged' && <AlertTriangle className="w-4 h-4 text-orange-400" />}
              {event.status === 'verified' && <CheckCircle className="w-4 h-4 text-green-400" />}
              {event.status === 'rejected' && <XCircle className="w-4 h-4 text-red-400" />}
            </div>
            
            {/* Timeline content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-medium capitalize ${
                  event.status === currentStatus ? 'text-purple-400' : 'text-gray-300'
                }`}>
                  {event.status}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(event.timestamp)}
                </span>
              </div>
              {event.actor && (
                <p className="text-xs text-gray-400">by {event.actor}</p>
              )}
              {event.note && (
                <p className="text-xs text-gray-500 mt-1">{event.note}</p>
              )}
            </div>
          </motion.div>
        ))}
        
        {/* Final state indicator */}
        {(currentStatus === 'verified' || currentStatus === 'rejected') && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: timeline.length * 0.1 }}
            className="relative flex items-start gap-4"
          >
            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStatus === 'verified' 
                ? 'bg-green-500/20 border-green-500' 
                : 'bg-red-500/20 border-red-500'
            }`}>
              {currentStatus === 'verified' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
            <div className="flex-1 pt-1">
              <span className={`text-sm font-medium ${
                currentStatus === 'verified' ? 'text-green-400' : 'text-red-400'
              }`}>
                {currentStatus === 'verified' ? 'Resolved - Verified' : 'Resolved - Rejected'}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Proof tag component
const ProofTagComponent = ({ tag }: { tag: ProofTagType }) => {
  const icons = {
    onchain: <Shield className="w-3 h-3" />,
    multi_source: <Users className="w-3 h-3" />,
    ai_verified: <Bot className="w-3 h-3" />,
    human_verified: <User className="w-3 h-3" />,
    oracle: <Zap className="w-3 h-3" />,
  };

  const labels = {
    onchain: 'onchain',
    multi_source: 'multi_source',
    ai_verified: 'ai_verified',
    human_verified: 'human_verified',
    oracle: 'oracle',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border ${
      tag.verified 
        ? 'bg-green-500/10 text-green-400 border-green-500/30' 
        : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }`}>
      {icons[tag.type]}
      <span>{labels[tag.type]}:{tag.value}</span>
    </span>
  );
};

// Sprint 1.5: Ghost Action Button
const GhostActionButton = ({ 
  icon: Icon,
  label,
  tooltip,
  colorClass = 'text-gray-400'
}: { 
  icon: React.ElementType;
  label: string;
  tooltip: string;
  colorClass?: string;
}) => (
  <div className="relative group">
    <button 
      disabled
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium opacity-50 cursor-not-allowed ${colorClass} bg-white/5 rounded-lg transition-colors`}
    >
      <Lock className="w-4 h-4" />
      {label}
    </button>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg">
      {tooltip}
    </div>
  </div>
);

// Annotation component
const AnnotationItem = ({ annotation }: { annotation: Annotation }) => {
  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          annotation.type === 'agent' ? 'bg-purple-500/20' : 'bg-blue-500/20'
        }`}>
          {annotation.type === 'agent' ? (
            <Bot className="w-4 h-4 text-purple-400" />
          ) : (
            <User className="w-4 h-4 text-blue-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">{annotation.author}</span>
            <span className="text-xs text-gray-500">• {annotation.author_reputation.toLocaleString()} rep</span>
            <span className="text-xs text-gray-600">• {formatTimeAgo(annotation.timestamp)}</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{annotation.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors">
              <ChevronUp className="w-3 h-3" />
              {annotation.votes}
            </button>
            <button className="text-xs text-gray-500 hover:text-white transition-colors">
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EventDetailClient({ feed }: EventDetailClientProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeAnnotationTab, setActiveAnnotationTab] = useState<'all' | 'human' | 'agent'>('all');

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks!');
  };

  const filteredAnnotations = mockAnnotations.filter(a => 
    activeAnnotationTab === 'all' || a.type === activeAnnotationTab
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Feed</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleBookmark}
                className={`p-2 transition-colors rounded-lg hover:bg-white/5 ${
                  isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Above the fold */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10"
        >
          {/* Category & Status Row - Sprint 1.5: Added Verification Status */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusBgColor(feed.status)}`}>
              <span className="flex items-center gap-1.5">
                <StatusIcon status={feed.status} />
                {feed.status}
              </span>
            </span>
            
            {/* Sprint 1.5: Verification Status Badge */}
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getVerificationStatusColor(feed.verificationStatus)}`}>
              <span className="flex items-center gap-1.5">
                <span>{getVerificationStatusIcon(feed.verificationStatus)}</span>
                {getVerificationStatusLabel(feed.verificationStatus)}
              </span>
            </span>
            
            <span className={`text-xs font-bold uppercase tracking-wider ${getCategoryColor(feed.category)}`}>
              {getCategoryLabel(feed.category)}
            </span>
            <span className="text-xs text-gray-500">{feed.source}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            {feed.title}
          </h1>

          {/* Summary */}
          <p className="text-lg text-gray-300 mb-6 leading-relaxed">
            {feed.summary || feed.content}
          </p>

          {/* Verification Score Badge */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-black/20 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Shield className={`w-6 h-6 ${
                feed.verification_score >= 80 ? 'text-green-400' :
                feed.verification_score >= 60 ? 'text-yellow-400' :
                feed.verification_score >= 40 ? 'text-orange-400' : 'text-red-400'
              }`} />
              <div>
                <p className="text-xs text-gray-500">Verification Score</p>
                <p className={`text-xl font-bold ${
                  feed.verification_score >= 80 ? 'text-green-400' :
                  feed.verification_score >= 60 ? 'text-yellow-400' :
                  feed.verification_score >= 40 ? 'text-orange-400' : 'text-red-400'
                }`}>
                  {feed.verification_score}%
                </p>
              </div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Validators</p>
                <p className="text-lg font-semibold text-white">{feed.validation.validator_count}</p>
              </div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-xs text-gray-500">Boost</p>
                <p className="text-lg font-semibold text-green-400">{feed.metrics.boost.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Burn</p>
                <p className="text-lg font-semibold text-orange-400">{feed.metrics.burn.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-white/10">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{feed.author || feed.source}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTimeAgo(feed.timestamp)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <a 
                href={feed.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                {feed.source}
              </a>
            </div>
          </div>

          {/* Full Content */}
          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {feed.content}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {feed.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white/5 text-gray-300 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Tag className="w-3 h-3" />
                #{tag}
              </span>
            ))}
          </div>

          {/* Proof Tags */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Proof Tags</h3>
            <div className="flex flex-wrap gap-2">
              {feed.proof_tags.map((tag, index) => (
                <ProofTagComponent key={index} tag={tag} />
              ))}
              {feed.proof_tags.length === 0 && (
                <span className="text-sm text-gray-600">No proof tags available</span>
              )}
            </div>
          </div>

          {/* Sources */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Sources ({feed.validation.source_count})</h3>
            <div className="space-y-2">
              {feed.validation.sources.map((source, index) => (
                <a
                  key={index}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                >
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400" />
                  <span className="text-sm text-gray-400 group-hover:text-white truncate">
                    {source}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-600 ml-auto" />
                </a>
              ))}
            </div>
          </div>
        </motion.article>

        {/* Sprint 1.5: Event Registry Section with CanonicalEventView */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-6"
        >
          <CanonicalEventView event={feed} />
        </motion.div>

        {/* Validation Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Validation Timeline
          </h2>
          <ValidationTimeline timeline={feed.timeline} currentStatus={feed.status} />
        </motion.div>

        {/* Annotations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Annotations
            </h2>
            <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
              <button
                onClick={() => setActiveAnnotationTab('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeAnnotationTab === 'all' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveAnnotationTab('human')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                  activeAnnotationTab === 'human' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <User className="w-3 h-3" />
                Human
              </button>
              <button
                onClick={() => setActiveAnnotationTab('agent')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                  activeAnnotationTab === 'agent' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Bot className="w-3 h-3" />
                Agent
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredAnnotations.map((annotation) => (
              <AnnotationItem key={annotation.id} annotation={annotation} />
            ))}
            {filteredAnnotations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No annotations yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Related Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">More from {getCategoryLabel(feed.category)}</h2>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <p className="text-gray-400">
              Explore more events in the{' '}
              <Link href={`/?category=${feed.category}`} className="text-purple-400 hover:underline">
                {getCategoryLabel(feed.category)} feed
              </Link>
              .
            </p>
          </div>
        </motion.div>
      </main>

      {/* Sticky Actions Bar - Sprint 1.5: Ghost Actions with Lock */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:inline">Event Actions:</span>
              <div className="flex items-center gap-2">
                {/* Sprint 1.5: Challenge Ghost Action */}
                <GhostActionButton 
                  icon={AlertTriangle}
                  label="Challenge"
                  tooltip="Requires wallet connection"
                  colorClass="text-orange-400"
                />
                
                {/* Sprint 1.5: Boost Ghost Action */}
                <GhostActionButton 
                  icon={ChevronUp}
                  label="Boost"
                  tooltip="Requires wallet + GENESIS"
                  colorClass="text-green-400"
                />
                
                {/* Sprint 1.5: Submit Evidence Ghost Action */}
                <GhostActionButton 
                  icon={Shield}
                  label="Submit Evidence"
                  tooltip="Requires wallet connection"
                  colorClass="text-blue-400"
                />
              </div>
            </div>
            <a
              href={feed.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              <span>Read Source</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Spacer for sticky bar */}
      <div className="h-20" />

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="text-white font-semibold">PULSE Protocol</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 PULSE Protocol. Built for the agent economy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
