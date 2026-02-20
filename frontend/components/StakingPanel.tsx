"use client";

import { useState } from "react";
import { fcl } from "@/config/flow";
import { STAKE_TOKENS, UNSTAKE_TOKENS } from "@/cadence/transactions";
import TierProgress from "./TierProgress";

interface StakingPanelProps {
  brandID: number;
  brandName: string;
  currentBalance: number;
  stakedBalance: number;
  tier: number;
  tierName: string;
}

export default function StakingPanel({
  brandID,
  brandName,
  currentBalance,
  stakedBalance,
  tier,
  tierName,
}: StakingPanelProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setStatus("Staking tokens...");
    try {
      const txId = await fcl.mutate({
        cadence: STAKE_TOKENS,
        args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
          arg(brandID.toString(), t.UInt64),
          arg(parseFloat(amount).toFixed(8), t.UFix64),
        ],
        limit: 999,
      });
      await fcl.tx(txId).onceSealed();
      setStatus("Staked successfully!");
      setAmount("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setStatus("Error: " + message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setStatus("Requesting unstake...");
    try {
      const txId = await fcl.mutate({
        cadence: UNSTAKE_TOKENS,
        args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
          arg(brandID.toString(), t.UInt64),
          arg(parseFloat(amount).toFixed(8), t.UFix64),
        ],
        limit: 999,
      });
      await fcl.tx(txId).onceSealed();
      setStatus("Unstake requested! Claimable in 7 days.");
      setAmount("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setStatus("Error: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-[#16213e] p-6 border border-gray-700/50">
      <h3 className="text-lg font-bold text-white mb-1">{brandName}</h3>
      <p className="text-xs text-gray-500 mb-4">Brand #{brandID}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0f0f1a] rounded-lg p-3">
          <p className="text-xs text-gray-500">Available</p>
          <p className="text-white font-bold">{currentBalance.toFixed(2)}</p>
        </div>
        <div className="bg-[#0f0f1a] rounded-lg p-3">
          <p className="text-xs text-gray-500">Staked</p>
          <p className="text-[#6C63FF] font-bold">{stakedBalance.toFixed(2)}</p>
        </div>
      </div>

      <TierProgress currentAmount={stakedBalance} tierName={tierName} tier={tier} />

      <div className="mt-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#6C63FF] mb-3"
          disabled={loading}
        />
        <div className="flex gap-2">
          <button
            onClick={handleStake}
            disabled={loading || !amount}
            className="flex-1 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#5b54e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-white text-sm"
          >
            {loading ? "..." : "Stake"}
          </button>
          <button
            onClick={handleUnstake}
            disabled={loading || !amount}
            className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-white text-sm"
          >
            {loading ? "..." : "Request Unstake"}
          </button>
        </div>
      </div>

      {status && (
        <p className={`text-xs mt-3 ${status.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
          {status}
        </p>
      )}
    </div>
  );
}
