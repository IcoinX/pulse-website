'use client';

import Link from 'next/link';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = ['All', 'Crypto', 'AI', 'Tech', 'Agents'];
  
  return (
    <header style={{ 
      borderBottom: '1px solid #222', 
      background: '#000',
      padding: '16px 24px'
    }}>
      <div style={{ 
        maxWidth: 1400, 
        margin: '0 auto', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: 24, 
            fontWeight: 700,
            background: 'linear-gradient(90deg, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            PULSE
          </h1>
        </Link>
        
        <nav style={{ display: 'flex', gap: 24 }}>
          {onTabChange ? (
            // Mode avec handler (Client Component)
            tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab.toLowerCase())}
                style={{ 
                  color: activeTab === tab.toLowerCase() ? '#fff' : '#888', 
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  padding: 0
                }}
              >
                {tab}
              </button>
            ))
          ) : (
            // Mode simple (liens)
            tabs.map((tab) => (
              <Link 
                key={tab}
                href={`/?category=${tab.toLowerCase()}`}
                style={{ 
                  color: '#888', 
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                {tab}
              </Link>
            ))
          )}
        </nav>
      </div>
    </header>
  );
}
