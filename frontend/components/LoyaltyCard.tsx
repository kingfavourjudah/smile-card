"use client";

interface LoyaltyCardProps {
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

const TIER_GRADIENTS: Record<number, string> = {
  1: "linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)",
  2: "linear-gradient(135deg, #C0C0C0 0%, #808080 100%)",
  3: "linear-gradient(135deg, #FFD700 0%, #DAA520 100%)",
};

export default function LoyaltyCard({
  id,
  tier,
  tierName,
  brandID,
  issueDate,
  expiryDate,
  perks,
  isLimitedEdition,
  editionNumber,
}: LoyaltyCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = Date.now() / 1000 > expiryDate;

  return (
    <div className="relative w-full max-w-sm">
      <div
        className="rounded-2xl p-6 text-white shadow-2xl aspect-[1.6/1] flex flex-col justify-between relative overflow-hidden"
        style={{ background: TIER_GRADIENTS[tier] || "#333" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-2 border-white/30" />
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full border-2 border-white/20" />
          <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full border-2 border-white/20" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs opacity-80 uppercase tracking-wider">SmileCard</p>
              <p className="text-lg font-bold">{tierName} Loyalty Card</p>
            </div>
            {isLimitedEdition && (
              <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                Limited #{editionNumber}
              </span>
            )}
          </div>
        </div>

        <div className="relative z-10">
          <p className="font-mono text-sm tracking-widest mb-2 opacity-90">
            #{id.toString().padStart(6, "0")}
          </p>
          <div className="flex justify-between text-[10px] opacity-70">
            <span>Brand #{brandID}</span>
            <span>
              {isExpired ? "EXPIRED" : `Exp: ${formatDate(expiryDate)}`}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 bg-[#16213e] rounded-xl p-4 border border-gray-700/50">
        <p className="text-xs text-gray-500 mb-2 font-medium">Perks</p>
        <div className="flex flex-wrap gap-1.5">
          {perks.map((perk, i) => (
            <span
              key={i}
              className="text-[10px] bg-[#0f0f1a] text-gray-300 px-2 py-1 rounded-full"
            >
              {perk}
            </span>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-[10px] text-gray-500">
          <span>Issued: {formatDate(issueDate)}</span>
          <span>Expires: {formatDate(expiryDate)}</span>
        </div>
      </div>
    </div>
  );
}
