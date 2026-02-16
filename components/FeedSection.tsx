import { FeedItem, Category } from '@/types';
import FeedCard from './FeedCard';

interface FeedSectionProps {
  items: FeedItem[];
  category: Category;
}

export default function FeedSection({ items, category }: FeedSectionProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-white mb-2">No feeds found</h3>
        <p className="text-gray-400">Check back later for updates in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white capitalize">
          {category === 'all' ? 'Latest Intelligence' : `${category} Intelligence`}
        </h2>
        <span className="text-sm text-gray-400">{items.length} updates</span>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>

      <div className="text-center py-8">
        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors text-sm font-medium">
          Load More
        </button>
      </div>
    </div>
  );
}
