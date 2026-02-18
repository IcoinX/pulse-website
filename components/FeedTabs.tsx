'use client';

export type FeedTab = 'live' | 'new' | 'trending' | 'research';

interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  counts?: Record<FeedTab, number>;
}

const tabs: { id: FeedTab; label: string; icon: string; description: string }[] = [
  {
    id: 'live',
    label: 'Live',
    icon: '●',
    description: 'Breaking events in real-time'
  },
  {
    id: 'new',
    label: 'New Agents',
    icon: '✦',
    description: 'Fresh launches & deployments'
  },
  {
    id: 'trending',
    label: 'Trending',
    icon: '↗',
    description: 'What\'s hot right now'
  },
  {
    id: 'research',
    label: 'Research',
    icon: '◈',
    description: 'Deep dives & analysis'
  }
];

export default function FeedTabs({ activeTab, onTabChange, counts = { live: 0, new: 0, trending: 0, research: 0 } }: FeedTabsProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      overflowX: 'auto',
      paddingBottom: '8px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts[tab.id];
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              padding: '12px 16px',
              background: isActive ? '#1a1a1a' : 'transparent',
              border: `1px solid ${isActive ? '#A855F7' : '#222'}`,
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '120px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.background = '#0d0d0d';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#222';
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #A855F7, #EC4899)'
              }} />
            )}
            
            {/* Icon + Label row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%'
            }}>
              <span style={{
                fontSize: '14px',
                color: isActive ? '#A855F7' : '#666'
              }}>
                {tab.id === 'live' && isActive ? (
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    background: '#EF4444',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                ) : tab.icon}
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: isActive ? '#fff' : '#888'
              }}>
                {tab.label}
              </span>
              {count > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  padding: '2px 8px',
                  background: isActive ? 'rgba(168, 85, 247, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                  color: isActive ? '#A855F7' : '#666',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>
            
            {/* Description */}
            <span style={{
              fontSize: '11px',
              color: '#666',
              textAlign: 'left'
            }}>
              {tab.description}
            </span>
          </button>
        );
      })}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
