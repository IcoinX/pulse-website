import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PULSE | Real-Time Agent Intelligence Feed',
  description: 'PULSE Protocol - Decentralized intelligence layer for the agent economy. Real-time verification of AI, crypto, and tech events.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
