"use client";

import { useState, useEffect } from "react";
import { fcl } from "@/config/flow";
import { GET_STAKING_INFO } from "@/cadence/scripts";
import ProductCard from "@/components/ProductCard";
import BrandFilter from "@/components/BrandFilter";
import { useCart } from "@/components/CartProvider";

interface User {
  addr?: string;
  loggedIn: boolean;
}

const PRODUCTS = [
  // TechVibe
  { id: "tv-1", name: "Wireless Earbuds Pro", brand: "TechVibe", brandColor: "#6C63FF", price: 45, image: "\uD83C\uDFA7" },
  { id: "tv-2", name: "Smart Watch Ultra", brand: "TechVibe", brandColor: "#6C63FF", price: 120, image: "\u231A" },
  { id: "tv-3", name: "Portable Charger X", brand: "TechVibe", brandColor: "#6C63FF", price: 25, image: "\uD83D\uDD0B" },
  { id: "tv-4", name: "LED Desk Lamp", brand: "TechVibe", brandColor: "#6C63FF", price: 35, image: "\uD83D\uDCA1" },
  // StyleHaus
  { id: "sh-1", name: "Premium Hoodie", brand: "StyleHaus", brandColor: "#e11d48", price: 55, image: "\uD83E\uDDE5" },
  { id: "sh-2", name: "Canvas Sneakers", brand: "StyleHaus", brandColor: "#e11d48", price: 80, image: "\uD83D\uDC5F" },
  { id: "sh-3", name: "Leather Wallet", brand: "StyleHaus", brandColor: "#e11d48", price: 30, image: "\uD83D\uDC5B" },
  { id: "sh-4", name: "Sunglasses Classic", brand: "StyleHaus", brandColor: "#e11d48", price: 40, image: "\uD83D\uDD76\uFE0F" },
  // FreshBite
  { id: "fb-1", name: "Artisan Coffee Bundle", brand: "FreshBite", brandColor: "#16a34a", price: 20, image: "\u2615" },
  { id: "fb-2", name: "Organic Snack Box", brand: "FreshBite", brandColor: "#16a34a", price: 15, image: "\uD83C\uDF6A" },
  { id: "fb-3", name: "Smoothie Pack (6x)", brand: "FreshBite", brandColor: "#16a34a", price: 28, image: "\uD83E\uDD64" },
  { id: "fb-4", name: "Gourmet Tea Set", brand: "FreshBite", brandColor: "#16a34a", price: 22, image: "\uD83C\uDF75" },
];

const BRAND_NAMES = ["TechVibe", "StyleHaus", "FreshBite"];

function getTierDiscount(tier: number): number {
  if (tier >= 3) return 20;
  if (tier >= 2) return 10;
  if (tier >= 1) return 5;
  return 0;
}

export default function ShopPage() {
  const [filter, setFilter] = useState("All");
  const [user, setUser] = useState<User>({ loggedIn: false });
  const [tierDiscount, setLocalTierDiscount] = useState(0);
  const [tierName, setTierName] = useState("");
  const { setTierDiscount } = useCart();

  useEffect(() => {
    fcl.currentUser.subscribe((u: any) => setUser(u));
  }, []);

  useEffect(() => {
    async function fetchTier() {
      const addr = user.addr;
      if (!addr) return;
      try {
        const info = await fcl.query({
          cadence: GET_STAKING_INFO,
          args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
            arg(addr, t.Address),
            arg("1", t.UInt64),
          ],
        });
        const tier = Number(info?.tier || 0);
        const discount = getTierDiscount(tier);
        setLocalTierDiscount(discount);
        setTierDiscount(discount);
        setTierName(String(info?.tierName || ""));
      } catch {
        setLocalTierDiscount(0);
        setTierDiscount(0);
      }
    }
    fetchTier();
  }, [user.addr, setTierDiscount]);

  const filtered = filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.brand === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-1">Shop</h1>
          <p className="text-zinc-500">Browse products across all partner brands</p>
        </div>

        {tierDiscount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-zinc-600">
              {tierName} member — <span className="text-green-600 font-semibold">{tierDiscount}% off</span> all items
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-8">
        <BrandFilter brands={BRAND_NAMES} active={filter} onChange={setFilter} />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            tierDiscount={tierDiscount}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-zinc-500">No products found for this filter.</p>
        </div>
      )}
    </div>
  );
}
