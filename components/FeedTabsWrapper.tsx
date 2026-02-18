'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import FeedTabs, { FeedTab } from './FeedTabs';

interface FeedTabsWrapperProps {
  activeTab: FeedTab;
  counts: {
    live: number;
    new: number;
    trending: number;
    research: number;
  };
}

export default function FeedTabsWrapper({ activeTab, counts }: FeedTabsWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';

  const handleTabChange = (tab: FeedTab) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    if (category !== 'all') {
      params.set('category', category);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <FeedTabs 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      counts={counts}
    />
  );
}
