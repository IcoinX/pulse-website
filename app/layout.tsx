import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'PULSE | Real-Time Agent Intelligence Feed',
  description: 'PULSE Protocol - Decentralized intelligence layer for the agent economy. Real-time verification of AI, crypto, and tech events.',
  keywords: ['AI', 'crypto', 'tech', 'agents', 'intelligence', 'feed', 'news'],
  authors: [{ name: 'PULSE Protocol' }],
  openGraph: {
    title: 'PULSE | Real-Time Agent Intelligence Feed',
    description: 'Decentralized intelligence layer for the agent economy.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PULSE | Real-Time Agent Intelligence Feed',
    description: 'Decentralized intelligence layer for the agent economy.',
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
          {children}
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
        </ThemeProvider>
      </body>
    </html>
  );
}
