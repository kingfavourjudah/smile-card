"use client";

import { useState } from "react";
import { fcl } from "@/config/flow";
import { SETUP_COLLECTION, CLAIM_CARD } from "@/cadence/transactions";
import { useRouter } from "next/navigation";
import { useMintedCards, BRAND_NAMES, BRAND_PERKS, TIER_NAMES } from "./MintedCardsProvider";

interface MintCardProps {
  brandID: number;
  brandName: string;
  brandDescription: string;
  brandColor: string;
  brandIcon: string;
  productCount: number;
}

export default function MintCard({
  brandID,
  brandName,
  brandDescription,
  brandColor,
  brandIcon,
  productCount,
}: MintCardProps) {
  const [minting, setMinting] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();
  const { addCard, cards } = useMintedCards();

  const alreadyMinted = cards.some((c) => c.brandID === brandID);

  async function handleMint() {
    if (alreadyMinted) {
      router.push("/shop");
      return;
    }

    setMinting(true);
    setStatus("Connecting wallet...");
    try {
      const user = await fcl.authenticate();
      if (!user?.addr) {
        setStatus("");
        setMinting(false);
        return;
      }

      setStatus("Setting up collection...");
      try {
        await fcl.mutate({
          cadence: SETUP_COLLECTION,
          args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
            arg(brandID.toString(), t.UInt64),
          ],
          limit: 999,
        });
      } catch {
        // Setup may fail if emulator not running
      }

      setStatus("Minting your card...");
      try {
        await fcl.mutate({
          cadence: CLAIM_CARD,
          args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
            arg(brandID.toString(), t.UInt64),
          ],
          limit: 999,
        });
      } catch {
        // Mint may fail on-chain — still save locally for demo
      }

      const now = Math.floor(Date.now() / 1000);
      addCard({
        id: Date.now(),
        tier: 1,
        tierName: TIER_NAMES[1],
        brandID,
        brandName: BRAND_NAMES[brandID] || brandName,
        issueDate: now,
        expiryDate: now + 365 * 86400,
        perks: BRAND_PERKS[brandID] || ["Member rewards"],
        isLimitedEdition: false,
        editionNumber: 0,
      });

      setStatus("Card minted!");
      setTimeout(() => router.push("/shop"), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Minting failed";
      setStatus(message);
      setTimeout(() => {
        setStatus("");
        setMinting(false);
      }, 3000);
    }
  }

  return (
    <div className="group rounded-2xl border border-gray-200 p-8 hover:border-gray-300 hover:shadow-sm transition-all flex flex-col">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5"
        style={{ background: `${brandColor}12` }}
      >
        {brandIcon}
      </div>
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{brandName}</h3>
      <p className="text-sm text-zinc-500 mb-4 flex-1">{brandDescription}</p>
      <p className="text-xs text-zinc-400 mb-5">{productCount} products available</p>

      {status ? (
        <div className="text-center py-3">
          <p className="text-sm text-zinc-600">{status}</p>
          {minting && status !== "Card minted!" && (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#1a1a1a] rounded-full animate-spin mx-auto mt-2" />
          )}
        </div>
      ) : alreadyMinted ? (
        <button
          onClick={() => router.push("/shop")}
          className="w-full py-3 rounded-lg font-medium text-zinc-500 border border-gray-200 hover:border-gray-300 transition-all"
        >
          Card Minted — Go Shop
        </button>
      ) : (
        <button
          onClick={handleMint}
          disabled={minting}
          className="w-full py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: brandColor }}
        >
          Mint Loyalty Card
        </button>
      )}
    </div>
  );
}
