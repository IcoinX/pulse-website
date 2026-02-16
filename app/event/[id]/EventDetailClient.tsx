'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FeedItem } from '@/types';
import { 
  formatTimeAgo, 
  getImpactColor, 
  getImpactBorderColor, 
  getCategoryColor,
  getCategoryBgColor 
} from '@/lib/rss';
import { ArrowLeft, ExternalLink, Share2, Bookmark, Clock, Tag, User } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface EventDetailClientProps {
  feed: FeedItem;
}

export default function EventDetailClient({ feed }: EventDetailClientProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'critical': return 'Critical Impact';
      case 'high': return 'High Impact';
      case 'medium': return 'Medium Impact';
      case 'low': return 'Low Impact';
      default: return 'Unknown Impact';
    }
  };

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
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border ${getImpactBorderColor(feed.impact)}`}
        >
          {/* Category & Impact Badge */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${getCategoryBgColor(feed.category)} ${getCategoryColor(feed.category)}`}>
              {feed.category}
            </span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getImpactColor(feed.impact)}`} />
              <span className="text-sm text-gray-400">{getImpactLabel(feed.impact)}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
            {feed.title}
          </h1>

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
              <span>{feed.source}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-lg text-gray-300 leading-relaxed">
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
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/10">
            <a
              href={feed.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <span>Read Full Article</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-gray-300 font-medium rounded-xl hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Feed</span>
            </Link>
          </div>
        </motion.article>

        {/* Related Events Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">More from {feed.category}</h2>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <p className="text-gray-400">
              Explore more {feed.category} intelligence on the{' '}
              <Link href="/?category={feed.category}" className="text-purple-400 hover:underline">
                main feed
              </Link>
              .
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
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
