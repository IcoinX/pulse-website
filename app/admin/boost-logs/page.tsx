'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { BOOST_WHITELIST } from '@/lib/whitelist';

interface BoostLog {
  timestamp: string;
  address: string;
  whitelisted: boolean;
  eventId: number;
  tier: number;
  success: boolean;
  error?: string;
}

export default function BoostLogsPage() {
  const [logs, setLogs] = useState<BoostLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'whitelisted' | 'not-whitelisted'>('all');

  // Capture console logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    const boostLogs: BoostLog[] = [];

    console.log = (...args: any[]) => {
      originalConsoleLog(...args);
      
      // Check if this is a boost log
      if (args[0] === '[BOOST]' && args[1]) {
        boostLogs.unshift(args[1]);
        setLogs([...boostLogs]);
      }
    };

    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  const filteredLogs = logs.filter(log => {
    switch (filter) {
      case 'success':
        return log.success;
      case 'error':
        return !log.success;
      case 'whitelisted':
        return log.whitelisted;
      case 'not-whitelisted':
        return !log.whitelisted;
      default:
        return true;
    }
  });

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.success).length,
    errors: logs.filter(l => !l.success).length,
    whitelisted: logs.filter(l => l.whitelisted).length,
    notWhitelisted: logs.filter(l => !l.whitelisted).length,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>
            <h1 className="text-xl font-semibold">Boost Logs</h1>
            <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full">
              Admin
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total" value={stats.total} color="text-white" />
          <StatCard label="Success" value={stats.success} color="text-green-400" />
          <StatCard label="Errors" value={stats.errors} color="text-red-400" />
          <StatCard label="Whitelisted" value={stats.whitelisted} color="text-blue-400" />
          <StatCard label="Not Whitelisted" value={stats.notWhitelisted} color="text-yellow-400" />
        </div>

        {/* Whitelist Info */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Current Whitelist</h2>
          <div className="space-y-2">
            {BOOST_WHITELIST.map((addr, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm font-mono text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                {addr}
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'success', 'error', 'whitelisted', 'not-whitelisted'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Logs Table */}
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Whitelisted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Event ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No logs yet. Logs will appear here when users attempt to boost.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5"
                    >
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-300">
                        {log.address.slice(0, 6)}...{log.address.slice(-4)}
                      </td>
                      <td className="px-4 py-3">
                        {log.whitelisted ? (
                          <span className="flex items-center gap-1 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-400 text-sm">
                            <XCircle className="w-4 h-4" />
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">#{log.eventId}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{log.tier}</td>
                      <td className="px-4 py-3">
                        {log.success ? (
                          <span className="flex items-center gap-1 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Success
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400 text-sm">
                            <XCircle className="w-4 h-4" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-300 max-w-xs truncate">
                        {log.error || '-'}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Note: Logs are stored in memory and will be lost on page refresh. 
          For persistent storage, integrate with Supabase or another analytics service.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}
