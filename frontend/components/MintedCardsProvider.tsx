"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { fcl } from "@/config/flow";
import { GET_NFT_IDS, GET_NFT_METADATA } from "@/cadence/scripts";

export interface MintedCard {
  id: number;
  tier: number;
  tierName: string;
  brandID: number;
  brandName: string;
  issueDate: number;
  expiryDate: number;
  perks: string[];
  isLimitedEdition: boolean;
  editionNumber: number;
}

interface MintedCardsContextType {
  cards: MintedCard[];
  loading: boolean;
  addCard: (card: MintedCard) => void;
  refreshCards: () => Promise<void>;
}

const BRAND_NAMES: Record<number, string> = {
  1: "TechVibe",
  2: "StyleHaus",
  3: "FreshBite",
};

const BRAND_PERKS: Record<number, string[]> = {
  1: ["Early access to new tech", "Free shipping", "Extended warranty"],
  2: ["Style previews", "Free returns", "VIP fitting"],
  3: ["Free samples", "Recipe access", "Priority delivery"],
};

const TIER_NAMES: Record<number, string> = {
  0: "Member",
  1: "Bronze",
  2: "Silver",
  3: "Gold",
};

const MintedCardsContext = createContext<MintedCardsContextType | null>(null);

export function useMintedCards() {
  const context = useContext(MintedCardsContext);
  if (!context) throw new Error("useMintedCards must be used within MintedCardsProvider");
  return context;
}

export default function MintedCardsProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<MintedCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [userAddr, setUserAddr] = useState<string | undefined>();

  useEffect(() => {
    fcl.currentUser.subscribe((u: any) => {
      setUserAddr(u?.addr);
    });
  }, []);

  // Try to fetch on-chain cards when user connects
  useEffect(() => {
    if (userAddr) {
      refreshCards();
    }
  }, [userAddr]);

  const refreshCards = useCallback(async () => {
    const addr = userAddr;
    if (!addr) return;
    setLoading(true);
    try {
      const ids: number[] = await fcl.query({
        cadence: GET_NFT_IDS,
        args: (arg: typeof fcl.arg, t: typeof fcl.t) => [arg(addr, t.Address)],
      });

      if (ids && ids.length > 0) {
        const cardPromises = ids.map(async (id: number) => {
          const metadata = await fcl.query({
            cadence: GET_NFT_METADATA,
            args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
              arg(addr, t.Address),
              arg(id.toString(), t.UInt64),
            ],
          });
          return {
            ...metadata,
            brandName: BRAND_NAMES[metadata?.brandID] || `Brand #${metadata?.brandID}`,
          } as MintedCard;
        });
        const results = await Promise.all(cardPromises);
        const onChainCards = results.filter(Boolean);
        if (onChainCards.length > 0) {
          setCards((prev) => {
            // Merge: keep local cards not found on-chain, add on-chain ones
            const onChainIds = new Set(onChainCards.map((c) => c.id));
            const localOnly = prev.filter((c) => !onChainIds.has(c.id));
            return [...onChainCards, ...localOnly];
          });
        }
      }
    } catch {
      // On-chain query failed (no emulator) — keep local cards
    } finally {
      setLoading(false);
    }
  }, [userAddr]);

  const addCard = useCallback((card: MintedCard) => {
    setCards((prev) => {
      // Don't duplicate same brand
      const exists = prev.find((c) => c.brandID === card.brandID);
      if (exists) return prev;
      return [...prev, card];
    });
  }, []);

  return (
    <MintedCardsContext.Provider value={{ cards, loading, addCard, refreshCards }}>
      {children}
    </MintedCardsContext.Provider>
  );
}

// Helper exports for use when minting
export { BRAND_NAMES, BRAND_PERKS, TIER_NAMES };
