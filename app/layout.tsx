import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pulse Protocol — Crypto trading, with clarity', description: 'A multi-exchange crypto trading terminal with SmartTrades, bots and market intelligence.', icons: { icon: '/favicon.svg' } };

export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
