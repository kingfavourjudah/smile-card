import MintCard from "@/components/MintCard";
import Link from "next/link";

const BRANDS = [
  {
    brandID: 1,
    brandName: "TechVibe",
    brandDescription: "Premium electronics and cutting-edge gadgets for the modern lifestyle.",
    brandColor: "#6C63FF",
    brandIcon: "\u26A1",
    productCount: 4,
  },
  {
    brandID: 2,
    brandName: "StyleHaus",
    brandDescription: "Curated fashion essentials with timeless design and contemporary style.",
    brandColor: "#e11d48",
    brandIcon: "\uD83D\uDC8E",
    productCount: 4,
  },
  {
    brandID: 3,
    brandName: "FreshBite",
    brandDescription: "Artisan food & drinks crafted from the finest organic ingredients.",
    brandColor: "#16a34a",
    brandIcon: "\uD83C\uDF3F",
    productCount: 4,
  },
];

const STEPS = [
  {
    number: "01",
    title: "Connect Wallet",
    description: "Link your Flow wallet to get started",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Mint a Card",
    description: "Choose a brand and mint your loyalty NFT",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Shop & Save",
    description: "Unlock tier-based discounts across all brands",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-zinc-500 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-soft" />
            Built on Flow Blockchain
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-[#1a1a1a]">
            Shop. Earn.{" "}
            <span className="text-[#6C63FF]">Save.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Mint a loyalty card, unlock tier-based discounts, and shop across
            multiple brands — all powered by blockchain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="px-8 py-3.5 rounded-lg bg-[#1a1a1a] text-white font-medium hover:bg-[#333] transition-colors"
            >
              Start Shopping
            </Link>
            <a
              href="#brands"
              className="px-8 py-3.5 rounded-lg border border-gray-200 text-zinc-600 hover:text-[#1a1a1a] hover:border-gray-300 transition-colors font-medium"
            >
              Explore Brands
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-3">How it works</h2>
          <p className="text-zinc-500">Three simple steps to start saving</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div key={step.number} className="relative rounded-2xl border border-gray-200 p-8 group hover:border-gray-300 hover:shadow-sm transition-all">
              <span className="text-5xl font-bold text-gray-100 absolute top-4 right-6">
                {step.number}
              </span>
              <div className="w-12 h-12 rounded-xl bg-gray-50 text-zinc-600 flex items-center justify-center mb-5">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section id="brands" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-3">Choose your brand</h2>
          <p className="text-zinc-500">Mint a loyalty card and start earning rewards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BRANDS.map((brand) => (
            <MintCard key={brand.brandID} {...brand} />
          ))}
        </div>
      </section>

      {/* Tier Info */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-2xl border border-gray-200 p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-3">Tier Rewards</h2>
            <p className="text-zinc-500">Stake more tokens to unlock bigger discounts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl mb-3">&#x1F949;</div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">Bronze</h3>
              <p className="text-2xl font-bold text-[#CD7F32] mb-2">5% off</p>
              <p className="text-xs text-zinc-500">50+ tokens staked</p>
            </div>

            <div className="rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl mb-3">&#x1F948;</div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">Silver</h3>
              <p className="text-2xl font-bold text-zinc-500 mb-2">10% off</p>
              <p className="text-xs text-zinc-500">150+ tokens staked</p>
            </div>

            <div className="rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl mb-3">&#x1F947;</div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">Gold</h3>
              <p className="text-2xl font-bold text-[#DAA520] mb-2">20% off</p>
              <p className="text-xs text-zinc-500">500+ tokens staked</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
