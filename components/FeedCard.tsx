'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FeedItem } from '@/types';
import { 
  formatTimeAgo, 
  getImpactColor, 
  getImpactBorderColor,
  getCategoryColor 
} from '@/lib/rss';
import { ExternalLink, ArrowRight } from 'lucide-react';

interface FeedCardProps {
  item: FeedItem;
  index?: number;
}

export default function FeedCard({ item, index = 0 }: FeedCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`group bg-white/5 backdrop-blur-sm rounded-xl p-5 border ${getImpactBorderColor(item.impact)} hover:border-white/30 transition-all duration-300 cursor-pointer`}
    >
      <Link href={`/event/${item.id}`} className="block">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${getCategoryColor(item.category)}`}>
              {item.category}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-xs text-gray-400">{item.source}</span>
            <span className="text-gray-500">•</span>
            <span className="text-xs text-gray-500">{formatTimeAgo(item.timestamp)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${getImpactColor(item.impact)}`} 
              title={`Impact: ${item.impact}`} 
            />
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </motion.div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
          {item.title}
        </h3>

        {/* Content */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
          {item.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded-md group-hover:bg-white/10 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{item.tags.length - 3}
              </span>
            )}
          </div>

          {/* Author & Actions */}
          <div className="flex items-center space-x-4">
            {item.author && (
              <span className="text-xs text-gray-500">by {item.author}</span>
            )}
          </div>
        </div>
      </Link>

      {/* External Link */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Read on {item.source}</span>
        </a>
        
        <Link
          href={`/event/${item.id}`}
          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.article>
  );
}
