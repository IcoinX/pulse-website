'use client';

import Link from 'next/link';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Header({ activeTab = 'all', onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'ai', label: 'AI' },
    { id: 'tech', label: 'Tech' },
    { id: 'agents', label: 'Agents' }
  ];
  
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
        
        <nav style={{ display: 'flex', gap: 8 }}>
          {onTabChange ? (
            tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={{ 
                  color: activeTab === tab.id ? '#fff' : '#888', 
                  background: activeTab === tab.id ? '#222' : 'transparent',
                  border: '1px solid ' + (activeTab === tab.id ? '#444' : 'transparent'),
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '8px 16px',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))
          ) : (
            tabs.map((tab) => (
              <Link 
                key={tab.id}
                href={tab.id === 'all' ? '/' : `/?category=${tab.id}`}
                style={{ 
                  color: '#888', 
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '8px 16px'
                }}
              >
                {tab.label}
              </Link>
            ))
          )}
        </nav>
      </div>
    </header>
  );
}
