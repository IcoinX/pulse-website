'use client';

import { useState, useEffect } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  Award,
  DollarSign,
  Clock,
  ExternalLink,
  Filter,
  ChevronUp,
  ChevronDown,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { formatAddress, getAddressExplorerUrl } from '@/lib/wallet';
import { getUserAssertions, getUserStats, getUserActivity } from '@/lib/userData';
import { UserStats, UserActivity, UserAssertion, AssertionStatus } from '@/types';
import Header from '@/components/Header';
import ConnectWallet from '@/components/ConnectWallet';

// Stats Card Component
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string; 
  trend?: { value: number; positive: boolean };
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5 hover:border-white/20 transition-colors"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.positive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-${color}-500/10`}>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
    </div>
  </motion.div>
);

// Activity Item Component
const ActivityItem = ({ activity }: { activity: UserActivity }) => {
  const icons = {
    boost: Zap,
    assertion: Shield,
    challenge: AlertTriangle,
    resolution: Award,
  };

  const colors = {
    boost: 'text-orange-400 bg-orange-500/10',
    assertion: 'text-blue-400 bg-blue-500/10',
    challenge: 'text-red-400 bg-red-500/10',
    resolution: 'text-green-400 bg-green-500/10',
  };

  const Icon = icons[activity.type];
  const colorClass = colors[activity.type];

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-white capitalize">{activity.type}</p>
        <p className="text-xs text-gray-500">
          Event #{activity.eventId} • {new Date(activity.timestamp).toLocaleDateString()}
        </p>
      </div>
      {activity.amount && (
        <span className="text-sm text-gray-400">{activity.amount} ETH</span>
      )}
      {activity.outcome && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          activity.outcome === 'win' ? 'bg-green-500/10 text-green-400' :
          activity.outcome === 'loss' ? 'bg-red-500/10 text-red-400' :
          'bg-gray-500/10 text-gray-400'
        }`}>
          {activity.outcome === 'pending' ? 'ongoing' : activity.outcome}
        </span>
      )}
    </div>
  );
};

// Assertion Row Component
const AssertionRow = ({ assertion }: { assertion: UserAssertion }) => {
  const statusColors: Record<AssertionStatus, string> = {
    pending: 'text-yellow-400 bg-yellow-500/10',
    challenged: 'text-orange-400 bg-orange-500/10',
    verified: 'text-green-400 bg-green-500/10',
    slashed: 'text-red-400 bg-red-500/10',
  };

  const outcomeColors = {
    win: 'text-green-400',
    loss: 'text-red-400',
    ongoing: 'text-gray-400',
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="py-4 px-4">
        <Link href={`/event/${assertion.eventId}`} className="text-sm text-purple-400 hover:text-purple-300">
          {assertion.eventTitle}
        </Link>
        <p className="text-xs text-gray-500">#{assertion.eventId}</p>
      </td>
      <td className="py-4 px-4">
        <span className={`text-xs px-2 py-1 rounded-full ${
          assertion.type === 'Agent' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
        }`}>
          {assertion.type}
        </span>
      </td>
      <td className="py-4 px-4 text-sm text-white">{assertion.stake} ETH</td>
      <td className="py-4 px-4">
        <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[assertion.status]}`}>
          {assertion.status}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className={`text-sm capitalize ${outcomeColors[assertion.outcome]}`}>
          {assertion.outcome}
        </span>
      </td>
      <td className="py-4 px-4 text-sm text-gray-400">
        {new Date(assertion.createdAt).toLocaleDateString()}
      </td>
      <td className="py-4 px-4">
        <Link 
          href={`/event/${assertion.eventId}`}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
        >
          View <ExternalLink className="w-3 h-3" />
        </Link>
      </td>
    </tr>
  );
};

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [activeTab, setActiveTab] = useState('all');
  const [assertionFilter, setAssertionFilter] = useState<'all' | 'pending' | 'verified' | 'slashed'>('all');
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [assertions, setAssertions] = useState<UserAssertion[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userStats, userAssertions, userActivities] = await Promise.all([
          getUserStats(address),
          getUserAssertions(address),
          getUserActivity(address),
        ]);

        setStats(userStats);
        setAssertions(userAssertions);
        setActivities(userActivities);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [address]);

  // Filter assertions
  const filteredAssertions = assertions.filter(a => 
    assertionFilter === 'all' ? true : a.status === assertionFilter
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Header activeTab="all" onTabChange={() => {}} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Connect your wallet to view your dashboard, track your assertions, and manage your reputation.
            </p>
            <ConnectWallet />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header activeTab="all" onTabChange={() => {}} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">My Dashboard</h1>
            <p className="text-sm text-gray-400">
              Track your assertions, challenges, and reputation on PULSE
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={chain?.id && address ? getAddressExplorerUrl(address, chain.id) : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View on BaseScan
            </a>
            <ConnectWallet />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard
                title="Reputation Score"
                value={stats?.reputation || 0}
                icon={Award}
                color="purple"
                trend={{ value: 5, positive: true }}
              />
              <StatCard
                title="Events Submitted"
                value={stats?.eventsSubmitted || 0}
                icon={Target}
                color="blue"
              />
              <StatCard
                title="Total Assertions"
                value={stats?.assertionsCount || 0}
                icon={Shield}
                color="green"
              />
              <StatCard
                title="Challenges Made"
                value={stats?.challengesCount || 0}
                icon={AlertTriangle}
                color="orange"
              />
              <StatCard
                title="Win Rate"
                value={`${stats?.winRate || 0}%`}
                icon={TrendingUp}
                color="cyan"
              />
              <StatCard
                title="Total Staked"
                value={`${stats?.totalStaked || '0'} ETH`}
                icon={DollarSign}
                color="pink"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Assertions Table */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">My Assertions</h2>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select
                        value={assertionFilter}
                        onChange={(e) => setAssertionFilter(e.target.value as any)}
                        className="bg-black/30 border border-white/10 rounded-lg text-sm text-gray-300 px-3 py-1.5 focus:outline-none focus:border-purple-500/50"
                      >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="slashed">Slashed</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 border-b border-white/5">
                          <th className="py-3 px-4 font-medium">Event</th>
                          <th className="py-3 px-4 font-medium">Type</th>
                          <th className="py-3 px-4 font-medium">Stake</th>
                          <th className="py-3 px-4 font-medium">Status</th>
                          <th className="py-3 px-4 font-medium">Outcome</th>
                          <th className="py-3 px-4 font-medium">Date</th>
                          <th className="py-3 px-4 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssertions.length > 0 ? (
                          filteredAssertions.map((assertion) => (
                            <AssertionRow key={assertion.id} assertion={assertion} />
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-gray-500">
                              No assertions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                  </div>
                  <div className="divide-y divide-white/5">
                    {activities.length > 0 ? (
                      activities.slice(0, 10).map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20 p-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-4">Rewards Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Total Rewards</span>
                      <span className="text-lg font-bold text-green-400">+{stats?.totalRewards || '0'} ETH</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Net Position</span>
                      <span className={`text-lg font-bold ${
                        parseFloat(stats?.totalRewards || '0') >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {parseFloat(stats?.totalRewards || '0') >= 0 ? '+' : ''}
                        {(parseFloat(stats?.totalRewards || '0') - parseFloat(stats?.totalStaked || '0')).toFixed(4)} ETH
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
