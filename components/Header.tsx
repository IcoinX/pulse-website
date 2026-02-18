'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname, useSearchParams } from 'next/navigation';

// Dynamic import with SSR disabled - ensures wallet detection only runs client-side
const ConnectButton = dynamic(() => import('./ConnectButton'), {
  ssr: false,
  loading: () => (
    <button disabled style={{ padding: '10px 16px', background: '#374151', color: '#9CA3AF', borderRadius: '8px', border: 'none', fontSize: '14px', cursor: 'not-allowed' }}>
      Loading...
    </button>
  )
});

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Header({ activeTab = 'all', onTabChange }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'ai', label: 'AI' },
    { id: 'tech', label: 'Tech' },
    { id: 'agents', label: 'Agents' }
  ];
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <header style={{ 
      borderBottom: '1px solid #222', 
      background: '#000',
      padding: '16px 24px'
    }}>
      <div style={{ 
        maxWidth: 1400, 
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
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
            <ConnectButton />
          </div>

          {/* Secondary nav */}
          <nav style={{ display: 'flex', gap: 4 }}>
            {[
              { path: '/agents', label: 'Agents', color: '#f59e0b' },
              { path: '/analytics', label: 'Analytics', color: '#34d399' },
              { path: '/challenges', label: 'Challenges', color: '#ef4444' },
              { path: '/boosts', label: 'Boosts', color: '#a855f7' }
            ].map((item) => (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive(item.path) ? item.color : '#666',
                  background: isActive(item.path) ? `${item.color}22` : 'transparent'
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Category filters - only on home */}
        {pathname === '/' && (
          <nav style={{ display: 'flex', gap: 8 }}>
            {tabs.map((tab) => {
              const href = tab.id === 'all' ? '/' : `/?category=${tab.id}`;
              const isTabActive = tab.id === currentCategory;
              
              return (
                <Link 
                  key={tab.id}
                  href={href}
                  style={{ 
                    color: isTabActive ? '#fff' : '#888', 
                    background: isTabActive ? '#222' : 'transparent',
                    border: '1px solid ' + (isTabActive ? '#444' : 'transparent'),
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: 'none',
                    padding: '8px 16px'
                  }}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
