import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="mb-8">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          <span className="text-gradient">SmileCard</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
          Multi-brand tokenized loyalty platform on Flow blockchain
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
        <div className="bg-[#16213e] rounded-xl p-6 border border-gray-700/50">
          <div className="w-12 h-12 rounded-lg bg-[#6C63FF]/20 flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6 text-[#6C63FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-white mb-2">Earn Rewards</h3>
          <p className="text-sm text-gray-400">Shop at partner brands and earn SMILE tokens with every purchase</p>
        </div>

        <div className="bg-[#16213e] rounded-xl p-6 border border-gray-700/50">
          <div className="w-12 h-12 rounded-lg bg-[#FF6584]/20 flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6 text-[#FF6584]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="font-bold text-white mb-2">Stake & Level Up</h3>
          <p className="text-sm text-gray-400">Stake tokens to climb tiers: Bronze, Silver, and Gold</p>
        </div>

        <div className="bg-[#16213e] rounded-xl p-6 border border-gray-700/50">
          <div className="w-12 h-12 rounded-lg bg-[#FFD700]/20 flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6 text-[#FFD700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="font-bold text-white mb-2">Collect NFT Cards</h3>
          <p className="text-sm text-gray-400">Mint exclusive loyalty NFT cards with real perks and benefits</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/brands"
          className="px-8 py-3 rounded-lg bg-gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          Explore Brands
        </Link>
        <Link
          href="/dashboard"
          className="px-8 py-3 rounded-lg border border-gray-700 text-gray-300 hover:border-[#6C63FF] hover:text-white transition-colors"
        >
          My Dashboard
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-8 text-center">
        <div>
          <p className="text-3xl font-bold text-gradient">50+</p>
          <p className="text-sm text-gray-500">Bronze Threshold</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gradient">150+</p>
          <p className="text-sm text-gray-500">Silver Threshold</p>
        </div>
        <div>
          <p className="text-3xl font-bold" style={{ color: "#FFD700" }}>500+</p>
          <p className="text-sm text-gray-500">Gold Threshold</p>
        </div>
      </div>
    </div>
  );
}
