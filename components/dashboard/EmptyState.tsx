import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="text-center py-16 bg-gray-900/30 rounded-lg">
      <div className="text-4xl mb-4">📭</div>
      <h3 className="text-xl font-medium text-gray-300 mb-2">No assertions yet</h3>
      <p className="text-gray-500 mb-6">Start building your reputation on PULSE</p>
      
      <div className="flex gap-4 justify-center">
        <button 
          disabled
          className="px-6 py-3 bg-gray-800 text-gray-500 rounded-lg cursor-not-allowed"
          title="Coming in Sprint 2.4"
        >
          🔒 Create Certified Assertion
        </button>
        
        <Link 
          href="/events"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          Explore Events
        </Link>
      </div>
    </div>
  );
}
