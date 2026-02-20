"use client";

import { useState, useEffect } from "react";
import { fcl } from "@/config/flow";
import { GET_NFT_IDS, GET_NFT_METADATA } from "@/cadence/scripts";
import LoyaltyCard from "@/components/LoyaltyCard";

interface User {
  addr: string | null;
  loggedIn: boolean;
}

interface CardData {
  id: number;
  tier: number;
  tierName: string;
  brandID: number;
  issueDate: number;
  expiryDate: number;
  perks: string[];
  isLimitedEdition: boolean;
  editionNumber: number;
}

export default function CardsPage() {
  const [user, setUser] = useState<User>({ addr: null, loggedIn: false });
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);

  useEffect(() => {
    if (user.addr) {
      fetchCards();
    }
  }, [user.addr]);

  async function fetchCards() {
    if (!user.addr) return;
    setLoading(true);
    try {
      const ids: number[] = await fcl.query({
        cadence: GET_NFT_IDS,
        args: (arg: typeof fcl.arg, t: typeof fcl.t) => [arg(user.addr, t.Address)],
      });

      const cardPromises = (ids || []).map(async (id: number) => {
        const metadata = await fcl.query({
          cadence: GET_NFT_METADATA,
          args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
            arg(user.addr, t.Address),
            arg(id.toString(), t.UInt64),
          ],
        });
        return metadata as CardData;
      });

      const results = await Promise.all(cardPromises);
      setCards(results.filter(Boolean));
    } catch (err) {
      console.error("Failed to fetch cards:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!user.loggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">Connect to view your loyalty card collection</p>
        <button
          onClick={() => fcl.authenticate()}
          className="px-8 py-3 rounded-lg bg-[#6C63FF] hover:bg-[#5b54e6] transition-colors font-medium text-white"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Loyalty Cards</h1>
        <p className="text-gray-400">Your NFT loyalty card collection</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-2">No loyalty cards yet</p>
          <p className="text-gray-600 text-sm mb-6">
            Stake tokens to reach Bronze tier, then claim your first loyalty card
          </p>
          <a
            href="/stake"
            className="px-6 py-3 rounded-lg bg-[#6C63FF] hover:bg-[#5b54e6] transition-colors text-white font-medium inline-block"
          >
            Start Staking
          </a>
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
