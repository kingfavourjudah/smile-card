"use client";

import { useState, useEffect } from "react";
import { fcl } from "@/config/flow";
import { GET_ALL_BRANDS, GET_STAKING_INFO } from "@/cadence/scripts";
import StakingPanel from "@/components/StakingPanel";

interface User {
  addr: string | null;
  loggedIn: boolean;
}

interface Brand {
  brandID: number;
  name: string;
}

export default function StakePage() {
  const [user, setUser] = useState<User>({ addr: null, loggedIn: false });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stakingData, setStakingData] = useState<Record<number, { balance: number; staked: number; tier: number; tierName: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (user.addr && brands.length > 0) {
      fetchStakingData();
    }
  }, [user.addr, brands]);

  async function fetchBrands() {
    try {
      const result = await fcl.query({ cadence: GET_ALL_BRANDS });
      setBrands(result || []);
    } catch {
      console.error("Failed to fetch brands");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStakingData() {
    if (!user.addr) return;
    const data: Record<number, { balance: number; staked: number; tier: number; tierName: string }> = {};
    for (const brand of brands) {
      try {
        const result = await fcl.query({
          cadence: GET_STAKING_INFO,
          args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
            arg(user.addr, t.Address),
            arg(brand.brandID.toString(), t.UInt64),
          ],
        });
        data[brand.brandID] = {
          balance: parseFloat(result?.balance || "0"),
          staked: parseFloat(result?.balance || "0"),
          tier: parseInt(result?.tier || "0"),
          tierName: result?.tierName || "None",
        };
      } catch {
        data[brand.brandID] = { balance: 0, staked: 0, tier: 0, tierName: "None" };
      }
    }
    setStakingData(data);
  }

  if (!user.loggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">Connect to stake tokens and earn tier status</p>
        <button
          onClick={() => fcl.authenticate()}
          className="px-8 py-3 rounded-lg bg-[#6C63FF] hover:bg-[#5b54e6] transition-colors font-medium text-white"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Stake Tokens</h1>
        <p className="text-gray-400">Stake SMILE tokens to earn tier status and unlock perks</p>
      </div>

      <div className="bg-[#16213e] rounded-xl p-4 border border-gray-700/50 mb-8">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Bronze</p>
            <p className="font-bold" style={{ color: "#CD7F32" }}>50+ SMILE</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Silver</p>
            <p className="font-bold" style={{ color: "#C0C0C0" }}>150+ SMILE</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Gold</p>
            <p className="font-bold" style={{ color: "#FFD700" }}>500+ SMILE</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No brands available for staking</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brands.map((brand) => {
            const data = stakingData[brand.brandID] || { balance: 0, staked: 0, tier: 0, tierName: "None" };
            return (
              <StakingPanel
                key={brand.brandID}
                brandID={brand.brandID}
                brandName={brand.name}
                currentBalance={data.balance}
                stakedBalance={data.staked}
                tier={data.tier}
                tierName={data.tierName}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
