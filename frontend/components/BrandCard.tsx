"use client";

interface BrandCardProps {
  brandID: number;
  name: string;
  description: string;
  logoURL: string;
  isActive: boolean;
  rewardPerPurchase: string;
  tokenMaxSupply: string;
}

export default function BrandCard({
  brandID,
  name,
  description,
  isActive,
  rewardPerPurchase,
  tokenMaxSupply,
}: BrandCardProps) {
  return (
    <div className="relative group rounded-xl bg-[#16213e] p-6 border border-gray-700/50 hover:border-[#6C63FF]/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6C63FF]/10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <span className="text-xs text-gray-500 font-mono">Brand #{brandID}</span>
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            isActive
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0f0f1a] rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Reward/Purchase</p>
          <p className="text-[#6C63FF] font-bold">{rewardPerPurchase} SMILE</p>
        </div>
        <div className="bg-[#0f0f1a] rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Max Supply</p>
          <p className="text-white font-bold">{tokenMaxSupply}</p>
        </div>
      </div>
    </div>
  );
}
