export type FeedTab = 'live' | 'new' | 'trending' | 'research';

interface FeedTabsProps {
  activeTab: FeedTab;
  tabCounts?: {
    live: number;
    new: number;
    trending: number;
    research: number;
  };
}

export default function FeedTabs({ activeTab, tabCounts = { live: 0, new: 0, trending: 0, research: 0 } }: FeedTabsProps) {
  const tabs: { id: FeedTab; label: string; icon: string }[] = [
    { id: 'live', label: 'Live / Breaking', icon: '🔴' },
    { id: 'new', label: 'New Agents', icon: '⚡' },
    { id: 'trending', label: 'Trending', icon: '🔥' },
    { id: 'research', label: 'Research', icon: '📊' },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <a
              key={tab.id}
              href={`?tab=${tab.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                background: isActive ? '#2563eb' : '#1a1a1a',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? '#fff' : '#888',
                fontSize: 14,
                fontWeight: 500,
                border: `1px solid ${isActive ? '#2563eb' : '#333'}`,
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tabCounts[tab.id] > 0 && (
                <span style={{
                  padding: '2px 8px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#333',
                  borderRadius: 4,
                  fontSize: 12,
                  marginLeft: 4
                }}>
                  {tabCounts[tab.id] > 99 ? '99+' : tabCounts[tab.id]}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
