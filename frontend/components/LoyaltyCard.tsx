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

const TIER_CONFIG: Record<number, { bg: string; text: string; badge: string }> = {
  1: {
    bg: "#CD7F32",
    text: "#fff",
    badge: "\uD83E\uDD49",
  },
  2: {
    bg: "#808080",
    text: "#fff",
    badge: "\uD83E\uDD48",
  },
  3: {
    bg: "#DAA520",
    text: "#fff",
    badge: "\uD83E\uDD47",
  },
};

const BRAND_NAMES: Record<number, string> = {
  1: "TechVibe",
  2: "StyleHaus",
  3: "FreshBite",
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
  const config = TIER_CONFIG[tier] || TIER_CONFIG[1];
  const brandName = BRAND_NAMES[brandID] || `Brand #${brandID}`;

  const formatDate = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const isExpired = Date.now() / 1000 > expiryDate;

  return (
    <div className="group">
      {/* Card */}
      <div
        className="rounded-2xl p-6 text-white shadow-md aspect-[1.6/1] flex flex-col justify-between relative overflow-hidden transition-transform group-hover:scale-[1.02]"
        style={{ background: config.bg }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full border border-white/30" />
          <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full border border-white/20" />
          <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full border border-white/20" />
        </div>

        {/* Top row */}
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-[10px] opacity-70 uppercase tracking-[0.2em] font-medium">SmileCard</p>
            <p className="text-lg font-bold mt-0.5">{tierName}</p>
          </div>
          <div className="flex items-center gap-2">
            {isLimitedEdition && (
              <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                Ltd #{editionNumber}
              </span>
            )}
            <span className="text-2xl">{config.badge}</span>
          </div>
        </div>

        {/* Bottom row */}
        <div className="relative z-10">
          <p className="font-mono text-sm tracking-[0.3em] mb-2 opacity-80">
            #{id.toString().padStart(6, "0")}
          </p>
          <div className="flex justify-between items-end">
            <span className="text-xs font-medium opacity-80">{brandName}</span>
            <span className={`text-[10px] font-medium ${isExpired ? "text-red-200" : "opacity-60"}`}>
              {isExpired ? "EXPIRED" : `Exp ${formatDate(expiryDate)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Perks section */}
      <div className="mt-3 rounded-xl border border-gray-200 p-4">
        <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-2">Perks</p>
        <div className="flex flex-wrap gap-1.5">
          {perks.map((perk, i) => (
            <span
              key={i}
              className="text-[10px] bg-gray-50 text-zinc-600 px-2.5 py-1 rounded-full border border-gray-100"
            >
              {perk}
            </span>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-[10px] text-zinc-400">
          <span>Issued {formatDate(issueDate)}</span>
          <span>Expires {formatDate(expiryDate)}</span>
        </div>
      </div>
    </div>
  );
}
