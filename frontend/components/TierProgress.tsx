"use client";

interface TierProgressProps {
  currentAmount: number;
  tierName: string;
  tier: number;
}

const THRESHOLDS = [
  { name: "Bronze", amount: 50, color: "#CD7F32" },
  { name: "Silver", amount: 150, color: "#C0C0C0" },
  { name: "Gold", amount: 500, color: "#FFD700" },
];

export default function TierProgress({ currentAmount, tierName, tier }: TierProgressProps) {
  const maxDisplay = 600;
  const percentage = Math.min((currentAmount / maxDisplay) * 100, 100);

  const nextTier = THRESHOLDS.find((t) => t.amount > currentAmount);
  const remaining = nextTier ? nextTier.amount - currentAmount : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">
          Current Tier:{" "}
          <span
            className="font-bold"
            style={{
              color: tier === 3 ? "#FFD700" : tier === 2 ? "#C0C0C0" : tier === 1 ? "#CD7F32" : "#666",
            }}
          >
            {tierName}
          </span>
        </span>
        <span className="text-sm text-gray-400">
          {currentAmount.toFixed(1)} SMILE staked
        </span>
      </div>

      <div className="relative w-full h-3 bg-[#0f0f1a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, #6C63FF, ${
              tier >= 3 ? "#FFD700" : tier >= 2 ? "#C0C0C0" : "#CD7F32"
            })`,
          }}
        />
        {THRESHOLDS.map((t) => (
          <div
            key={t.name}
            className="absolute top-0 h-full w-0.5 bg-gray-600"
            style={{ left: `${(t.amount / maxDisplay) * 100}%` }}
          />
        ))}
      </div>

      <div className="flex justify-between mt-1">
        {THRESHOLDS.map((t) => (
          <span
            key={t.name}
            className="text-[10px]"
            style={{
              color: currentAmount >= t.amount ? t.color : "#555",
              position: "relative",
              left: `${(t.amount / maxDisplay) * 20}%`,
            }}
          >
            {t.name} ({t.amount})
          </span>
        ))}
      </div>

      {nextTier && (
        <p className="text-xs text-gray-500 mt-2">
          Stake {remaining.toFixed(1)} more to reach{" "}
          <span style={{ color: nextTier.color }}>{nextTier.name}</span>
        </p>
      )}
      {!nextTier && tier > 0 && (
        <p className="text-xs text-[#FFD700] mt-2">Max tier reached!</p>
      )}
    </div>
  );
}
