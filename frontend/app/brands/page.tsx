"use client";

import { useState, useEffect } from "react";
import { fcl } from "@/config/flow";
import { GET_ALL_BRANDS } from "@/cadence/scripts";
import BrandCard from "@/components/BrandCard";

interface Brand {
  brandID: number;
  name: string;
  description: string;
  logoURL: string;
  owner: string;
  tokenMaxSupply: string;
  rewardPerPurchase: string;
  isActive: boolean;
  registeredAt: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const result = await fcl.query({ cadence: GET_ALL_BRANDS });
        setBrands(result || []);
      } catch (err) {
        console.error("Failed to fetch brands:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBrands();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Partner Brands</h1>
        <p className="text-gray-400">Explore brands in the SmileCard loyalty ecosystem</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No brands registered yet</p>
          <p className="text-gray-600 text-sm mt-2">Brands will appear here once registered on the platform</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <BrandCard
              key={brand.brandID}
              brandID={brand.brandID}
              name={brand.name}
              description={brand.description}
              logoURL={brand.logoURL}
              isActive={brand.isActive}
              rewardPerPurchase={brand.rewardPerPurchase}
              tokenMaxSupply={brand.tokenMaxSupply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
