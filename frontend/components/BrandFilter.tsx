"use client";

interface BrandFilterProps {
  brands: string[];
  active: string;
  onChange: (brand: string) => void;
}

const BRAND_COLORS: Record<string, string> = {
  TechVibe: "#6C63FF",
  StyleHaus: "#e11d48",
  FreshBite: "#16a34a",
};

export default function BrandFilter({ brands, active, onChange }: BrandFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onChange("All")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          active === "All"
            ? "bg-[#1a1a1a] text-white"
            : "text-zinc-500 hover:text-[#1a1a1a] hover:bg-gray-50 border border-gray-200"
        }`}
      >
        All
      </button>
      {brands.map((brand) => (
        <button
          key={brand}
          onClick={() => onChange(brand)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            active === brand
              ? "text-white"
              : "text-zinc-500 hover:text-[#1a1a1a] hover:bg-gray-50 border border-gray-200"
          }`}
          style={
            active === brand
              ? { background: BRAND_COLORS[brand] || "#1a1a1a" }
              : undefined
          }
        >
          {brand}
        </button>
      ))}
    </div>
  );
}
