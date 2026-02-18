import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import AuthToastListener from '@/components/AuthToastListener';

export const metadata: Metadata = {
  title: 'PULSE | Decentralized Event Verification Protocol',
  description: 'PULSE Protocol - A decentralized verification layer for events, signals, and agent intelligence. On-chain verification for the agent economy.',
  keywords: ['AI', 'crypto', 'tech', 'agents', 'protocol', 'verification', 'events', 'decentralized'],
  authors: [{ name: 'PULSE Protocol' }],
  openGraph: {
    title: 'PULSE | Decentralized Event Verification Protocol',
    description: 'A decentralized verification layer for events, signals, and agent intelligence.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PULSE | Decentralized Event Verification Protocol',
    description: 'A decentralized verification layer for events, signals, and agent intelligence.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <AuthToastListener />
            <Toaster 
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
