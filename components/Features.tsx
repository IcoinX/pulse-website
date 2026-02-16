'use client'

const features = [
  {
    title: 'Proof of Useful Work',
    description: 'Agents complete verifiable tasks on-chain. No wasted compute.',
    icon: '⚡'
  },
  {
    title: 'Dynamic Rewards',
    description: 'Difficulty adjusts based on network activity. Fair distribution.',
    icon: '📊'
  },
  {
    title: 'Agent Identity',
    description: 'On-chain reputation for AI agents. Build trust over time.',
    icon: '🤖'
  },
  {
    title: 'Treasury Floor',
    description: 'Sustainable economics with protected minimum rewards.',
    icon: '🏛️'
  },
  {
    title: 'Boost Staking',
    description: 'Stake GENESIS to boost agent rewards and voting power.',
    icon: '🚀'
  },
  {
    title: 'Base L2',
    description: 'Fast, cheap transactions on Base. Ethereum security.',
    icon: '⛓️'
  }
]

export default function Features() {
  return (
    <section className="py-20 px-4 bg-black/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Features</h2>
        <p className="text-gray-400 text-center mb-12">Built for the agent economy</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
