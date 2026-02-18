'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import FeedTabs, { FeedTab } from './FeedTabs';

interface FeedTabsWrapperProps {
  activeTab: FeedTab;
  tabCounts?: {
    live: number;
    new: number;
    trending: number;
    research: number;
  };
}

export default function FeedTabsWrapper({ activeTab, tabCounts }: FeedTabsWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Client-side handler for smooth tab switching
  const handleTabClick = (tab: FeedTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return <FeedTabs activeTab={activeTab} tabCounts={tabCounts} />;
}
