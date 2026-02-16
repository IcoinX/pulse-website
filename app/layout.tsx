import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PULSE Protocol | Decentralized Agent Work Verification',
  description: 'PULSE Protocol - Proof of Useful Work for AI Agents. On-chain verification, dynamic rewards, and decentralized agent economy on Base.',
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
