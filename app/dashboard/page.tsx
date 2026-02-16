'use client';

import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { useUserAssertions } from '@/hooks/useUserAssertions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPIs } from '@/components/dashboard/KPIs';
import { AssertionFilters } from '@/components/dashboard/AssertionFilters';
import { AssertionsTable } from '@/components/dashboard/AssertionsTable';
import { EmptyState } from '@/components/dashboard/EmptyState';
import Header from '@/components/Header';

function ConnectPrompt() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header activeTab="all" onTabChange={() => {}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Connect your wallet to view your dashboard, track your assertions, and manage your reputation.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Go Home to Connect
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 bg-red-500/10 rounded-lg border border-red-500/30">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-medium text-red-400 mb-2">Error loading assertions</h3>
      <p className="text-gray-400">{message}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useWallet();
  const { assertions, loading, error } = useUserAssertions(address);

  if (!isConnected) {
    return <ConnectPrompt />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header activeTab="all" onTabChange={() => {}} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader address={address!} />
        
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <>
            <KPIs assertions={assertions} />
            <AssertionFilters />
            
            {assertions.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
                <AssertionsTable assertions={assertions} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
