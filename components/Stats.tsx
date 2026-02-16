'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface PulseStats {
  totalBlocks: number
  totalRewards: string
  activeAgents: number
  difficulty: number
}

export default function Stats() {
  const [stats, setStats] = useState<PulseStats>({
    totalBlocks: 0,
    totalRewards: '0',
    activeAgents: 0,
    difficulty: 1
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch blocks count
        const { count: blocksCount } = await supabase
          .from('blocks')
          .select('*', { count: 'exact', head: true })

        // Fetch total rewards
        const { data: rewardsData } = await supabase
          .from('blocks')
          .select('reward_amount')
        
        const totalRewards = rewardsData?.reduce((sum, block) => {
          return sum + (parseFloat(block.reward_amount) || 0)
        }, 0) || 0

        // Fetch active agents count
        const { count: agentsCount } = await supabase
          .from('agents')
          .select('*', { count: 'exact', head: true })

        // Fetch current difficulty
        const { data: statsData } = await supabase
          .from('daily_stats')
          .select('avg_difficulty')
          .order('date', { ascending: false })
          .limit(1)
          .single()

        setStats({
          totalBlocks: blocksCount || 0,
          totalRewards: totalRewards.toFixed(2),
          activeAgents: agentsCount || 0,
          difficulty: statsData?.avg_difficulty || 1
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Blocks Verified" value={stats.totalBlocks.toLocaleString()} />
          <StatCard label="GENESIS Rewards" value={stats.totalRewards} />
          <StatCard label="Active Agents" value={stats.activeAgents.toString()} />
          <StatCard label="Difficulty" value={`${stats.difficulty}x`} />
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 text-center">
      <div className="text-3xl font-bold gradient-text mb-2">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  )
}
// Trigger redeploy Mon Feb 16 04:50:42 CET 2026
