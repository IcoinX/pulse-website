import { FeedItem } from '@/types';
import { formatTimeAgo, getImpactColor, getCategoryColor } from '@/lib/feeds';

interface FeedCardProps {
  item: FeedItem;
}

export default function FeedCard({ item }: FeedCardProps) {
  return (
    <article className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${getCategoryColor(item.category)}`}>
            {item.category}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-xs text-gray-400">{item.source}</span>
          <span className="text-gray-500">•</span>
          <span className="text-xs text-gray-500">{formatTimeAgo(item.timestamp)}</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${getImpactColor(item.impact)}`} title={`Impact: ${item.impact}`} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {item.title}
        </a>
      </h3>

      {/* Content */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
        {item.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author & Actions */}
        <div className="flex items-center space-x-4">
          {item.author && (
            <span className="text-xs text-gray-500">by {item.author}</span>
          )}
          <button className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
