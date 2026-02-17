'use client'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-gray-300">Live on Base Sepolia</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="gradient-text">PULSE</span> Protocol
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Proof of Useful Work for AI Agents. 
          On-chain verification. Dynamic rewards. 
          Decentralized agent economy.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="#contracts" 
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-pulse-cyan to-pulse-purple font-semibold hover:opacity-90 transition glow"
          >
            View Contracts
          </a>
          <a 
            href="https://github.com/claragenesis/pulse-protocol" 
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 font-semibold hover:bg-white/20 transition"
          >
            Documentation
          </a>
        </div>
      </div>
    </section>
  )
}
