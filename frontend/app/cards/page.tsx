"use client";

import { useState, useEffect } from "react";
import { fcl } from "@/config/flow";
import { useMintedCards } from "@/components/MintedCardsProvider";
import LoyaltyCard from "@/components/LoyaltyCard";
import Link from "next/link";

interface User {
  addr?: string;
  loggedIn: boolean;
}

export default function CardsPage() {
  const [user, setUser] = useState<User>({ loggedIn: false });
  const { cards, loading } = useMintedCards();

  useEffect(() => {
    fcl.currentUser.subscribe((u: any) => setUser(u));
  }, []);

  if (!user.loggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Connect Your Wallet</h2>
          <p className="text-zinc-500 mb-8">Connect to view your loyalty card collection</p>
          <button
            onClick={() => fcl.authenticate()}
            className="px-8 py-3 rounded-lg bg-[#1a1a1a] text-white font-medium hover:bg-[#333] transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-1">My Cards</h1>
          <p className="text-zinc-500">Your NFT loyalty card collection</p>
        </div>
        <Link
          href="/#brands"
          className="text-sm text-zinc-500 hover:text-[#1a1a1a] transition-colors px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300"
        >
          Mint New Card
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#1a1a1a] rounded-full animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-6 mx-auto">
            <svg className="w-10 h-10 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <p className="text-lg text-zinc-500 mb-2">No loyalty cards yet</p>
          <p className="text-sm text-zinc-400 mb-8">
            Choose a brand and mint your first loyalty card
          </p>
          <Link
            href="/#brands"
            className="px-8 py-3 rounded-lg bg-[#1a1a1a] text-white font-medium hover:bg-[#333] transition-colors inline-block"
          >
            Mint Your First Card
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <LoyaltyCard
              key={card.id}
              id={card.id}
              tier={card.tier}
              tierName={card.tierName}
              brandID={card.brandID}
              issueDate={card.issueDate}
              expiryDate={card.expiryDate}
              perks={card.perks}
              isLimitedEdition={card.isLimitedEdition}
              editionNumber={card.editionNumber}
            />
          ))}
        </div>
      )}
    </div>
  );
}
