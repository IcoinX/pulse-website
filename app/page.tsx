import Hero from '@/components/Hero'
import Stats from '@/components/Stats'
import Contracts from '@/components/Contracts'
import Features from '@/components/Features'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <Hero />
      <Stats />
      <Contracts />
      <Features />
      <Footer />
    </main>
  )
}
