"use client";

import { useCart } from "./CartProvider";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  brandColor: string;
  price: number;
  image: string;
  tierDiscount: number;
}

export default function ProductCard({
  id,
  name,
  brand,
  brandColor,
  price,
  image,
  tierDiscount,
}: ProductCardProps) {
  const { addItem } = useCart();

  const discountedPrice = tierDiscount > 0 ? price * (1 - tierDiscount / 100) : price;

  return (
    <div className="group rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all">
      {/* Image placeholder */}
      <div className="aspect-square relative bg-gray-50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-300">
          {image}
        </div>

        {tierDiscount > 0 && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-green-600 text-[10px] font-bold text-white uppercase">
            {tierDiscount}% off
          </div>
        )}

        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-medium text-white"
          style={{ background: brandColor }}
        >
          {brand}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-[#1a1a1a] font-medium mb-3">{name}</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#1a1a1a]">
              {tierDiscount > 0 ? discountedPrice.toFixed(1) : price}
            </span>
            {tierDiscount > 0 && (
              <span className="text-sm text-zinc-400 line-through">{price}</span>
            )}
            <span className="text-xs text-zinc-400">SMILE</span>
          </div>

          <button
            onClick={() => addItem({ id, name, brand, price: discountedPrice, image })}
            className="p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#333] transition-colors text-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
