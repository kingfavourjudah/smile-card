"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useMintedCards, MintedCard } from "@/components/MintedCardsProvider";
import { fcl } from "@/config/flow";
import { TRANSFER_TOKENS } from "@/cadence/transactions";
import Link from "next/link";

const STORE_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xf8d6e0586b0a20c7";

const TIER_DISCOUNTS: Record<number, number> = {
  0: 0,
  1: 5,
  2: 10,
  3: 20,
};

const TIER_COLORS: Record<number, string> = {
  1: "#CD7F32",
  2: "#808080",
  3: "#DAA520",
};

const TIER_BADGES: Record<number, string> = {
  1: "\uD83E\uDD49",
  2: "\uD83E\uDD48",
  3: "\uD83E\uDD47",
};

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount,
  } = useCart();
  const { cards } = useMintedCards();
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [processing, setProcessing] = useState(false);
  const [appliedCard, setAppliedCard] = useState<MintedCard | null>(null);

  const discount = appliedCard ? (TIER_DISCOUNTS[appliedCard.tier] || 0) : 0;
  const savings = total * (discount / 100);
  const finalTotal = total - savings;

  async function handleCheckout() {
    if (items.length === 0) return;
    setProcessing(true);
    setCheckoutStatus("Connecting wallet...");

    try {
      const user = await fcl.authenticate();
      if (!user?.addr) {
        setCheckoutStatus("");
        setProcessing(false);
        return;
      }

      setCheckoutStatus("Processing payment...");
      const amount = finalTotal.toFixed(8);

      await fcl.mutate({
        cadence: TRANSFER_TOKENS,
        args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
          arg(amount, t.UFix64),
          arg(STORE_ADDRESS, t.Address),
        ],
        limit: 999,
      });

      setCheckoutStatus("Order placed!");
      clearCart();
      setAppliedCard(null);
      setTimeout(() => {
        setCheckoutStatus("");
        setProcessing(false);
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      setCheckoutStatus(message);
      setTimeout(() => {
        setCheckoutStatus("");
        setProcessing(false);
      }, 3000);
    }
  }

  if (items.length === 0 && !checkoutStatus) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Your cart is empty</h2>
          <p className="text-zinc-500 mb-8">Browse our shop to find products you love</p>
          <Link
            href="/shop"
            className="px-8 py-3 rounded-lg bg-[#1a1a1a] text-white font-medium hover:bg-[#333] transition-colors"
          >
            Browse Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-1">Cart</h1>
        <p className="text-zinc-500">{itemCount} item{itemCount !== 1 ? "s" : ""} in your cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-200 p-5 flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-3xl flex-shrink-0">
                {item.image}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[#1a1a1a] font-medium truncate">{item.name}</h3>
                <p className="text-xs text-zinc-400">{item.brand}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center text-zinc-500"
                >
                  -
                </button>
                <span className="w-8 text-center text-[#1a1a1a] text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center text-zinc-500"
                >
                  +
                </button>
              </div>

              <div className="text-right w-20">
                <p className="text-[#1a1a1a] font-medium">
                  {(item.price * item.quantity).toFixed(1)}
                </p>
                <p className="text-xs text-zinc-400">SMILE</p>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-zinc-400 hover:text-red-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-gray-200 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-6">Order Summary</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-[#1a1a1a]">{total.toFixed(1)} SMILE</span>
              </div>

              {appliedCard && discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Promo card ({discount}% off)</span>
                  <span className="text-green-600">-{savings.toFixed(1)} SMILE</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-[#1a1a1a] font-semibold">Total</span>
                  <div className="text-right">
                    <span className="text-[#1a1a1a] font-bold text-lg">
                      {finalTotal.toFixed(1)} SMILE
                    </span>
                    {appliedCard && discount > 0 && (
                      <p className="text-xs text-zinc-400 line-through">
                        {total.toFixed(1)} SMILE
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Card Section */}
            {!appliedCard ? (
              cards.length > 0 ? (
                <div className="mb-4">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-3">
                    Apply a Promo Card
                  </p>
                  <div className="space-y-2">
                    {cards.map((card) => {
                      const cardDiscount = TIER_DISCOUNTS[card.tier] || 0;
                      return (
                        <button
                          key={card.id}
                          onClick={() => setAppliedCard(card)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-300 hover:border-[#6C63FF] hover:bg-gray-50 transition-all text-left"
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 border"
                            style={{ borderColor: TIER_COLORS[card.tier] || "#e5e5e5", background: `${TIER_COLORS[card.tier] || "#f8f8f8"}15` }}
                          >
                            {TIER_BADGES[card.tier] || "\uD83C\uDFB4"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#1a1a1a] font-medium truncate">
                              {card.brandName} — {card.tierName}
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              {cardDiscount > 0
                                ? `${cardDiscount}% discount`
                                : "No discount yet — stake to unlock"}
                            </p>
                          </div>
                          <span className="text-xs text-[#6C63FF] font-medium flex-shrink-0">
                            Apply
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 rounded-xl border border-dashed border-gray-200 text-center">
                  <p className="text-xs text-zinc-400 mb-1">No promo cards available</p>
                  <Link href="/#brands" className="text-xs text-[#6C63FF] hover:underline">
                    Mint a loyalty card
                  </Link>
                </div>
              )
            ) : (
              <div className="mb-4">
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-3">
                  Applied Promo Card
                </p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 border"
                    style={{ borderColor: TIER_COLORS[appliedCard.tier] || "#e5e5e5", background: `${TIER_COLORS[appliedCard.tier] || "#f8f8f8"}15` }}
                  >
                    {TIER_BADGES[appliedCard.tier] || "\uD83C\uDFB4"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1a1a1a] font-medium truncate">
                      {appliedCard.brandName} — {appliedCard.tierName}
                    </p>
                    <p className="text-[10px] text-green-600">
                      {discount}% discount applied
                    </p>
                  </div>
                  <button
                    onClick={() => setAppliedCard(null)}
                    className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {checkoutStatus ? (
              <div className="text-center py-3">
                <p className="text-sm text-zinc-600 mb-2">{checkoutStatus}</p>
                {processing && checkoutStatus !== "Order placed!" && (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-[#1a1a1a] rounded-full animate-spin mx-auto" />
                )}
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={processing || items.length === 0}
                className="w-full py-3.5 rounded-lg bg-[#1a1a1a] text-white font-medium hover:bg-[#333] transition-colors disabled:opacity-50"
              >
                Checkout
              </button>
            )}

            <Link
              href="/shop"
              className="block text-center text-sm text-zinc-400 hover:text-zinc-600 transition-colors mt-4"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
