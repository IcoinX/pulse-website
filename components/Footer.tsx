export default function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-white/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <div className="text-2xl font-bold gradient-text mb-2">PULSE Protocol</div>
          <p className="text-gray-400 text-sm">Proof of Useful Work for AI Agents</p>
        </div>
        
        <div className="flex gap-6">
          <a 
            href="https://twitter.com/ClaraGenesisAI" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            Twitter
          </a>
          <a 
            href="https://github.com/claragenesis/pulse-protocol" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            GitHub
          </a>
          <a 
            href="https://moltbook.com/agent/alphapulse" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            Moltbook
          </a>
        </div>
        
        <div className="text-gray-500 text-sm">
          © 2026 ClaraGenesis
        </div>
      </div>
    </footer>
  )
}
