'use client'

const contracts = [
  {
    name: 'GENESIS Token',
    address: '0x591e0f98110eb70c72e1c42cbb55c263ec441065',
    description: 'Governance & reward token for PULSE Protocol',
    color: 'from-pink-500 to-rose-500'
  },
  {
    name: 'GovernanceCore',
    address: '0xd8a7eee8710b445f767e408e8308a8cac391502c',
    description: 'Main protocol governance and parameter control',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    name: 'DynamicDifficulty',
    address: '0x4d52b43cd6d09c1bab55a6c565b6daadbd8b7ad1',
    description: 'Adaptive difficulty adjustment algorithm',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'TreasuryFloor',
    address: '0x1bd89ef674e166867b81c2b4b4750706ccc735ad',
    description: 'Protocol treasury and reward distribution',
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: 'BoostPool',
    address: '0xf58130a9e10f788bba8f4f2aa0aff9d5f0d4d99b',
    description: 'Staking and boost mechanism for agents',
    color: 'from-orange-500 to-amber-500'
  }
]

export default function Contracts() {
  return (
    <section id="contracts" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Smart Contracts</h2>
        <p className="text-gray-400 text-center mb-12">Verified contracts on Base Sepolia</p>
        
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div 
              key={contract.address}
              className="group bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${contract.color} flex items-center justify-center text-xl font-bold`}>
                    {contract.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{contract.name}</h3>
                    <p className="text-gray-400 text-sm">{contract.description}</p>
                  </div>
                </div>
                <a 
                  href={`https://sepolia.basescan.org/address/${contract.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pulse-cyan hover:underline font-mono text-sm"
                >
                  {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
