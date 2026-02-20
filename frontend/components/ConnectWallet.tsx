"use client";

import { useState, useEffect } from "react";
import { fcl } from "@/config/flow";

interface User {
  addr?: string;
  loggedIn: boolean;
}

export default function ConnectWallet() {
  const [user, setUser] = useState<User>({ loggedIn: false });

  useEffect(() => {
    fcl.currentUser.subscribe((u: any) => setUser(u));
  }, []);

  if (user.loggedIn) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 bg-gray-50 px-3 py-2 rounded-lg font-mono border border-gray-200">
          {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
        </span>
        <button
          onClick={() => fcl.unauthenticate()}
          className="px-3 py-2 text-xs rounded-lg text-zinc-500 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => fcl.authenticate()}
      className="px-5 py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#333] transition-all font-medium text-sm text-white"
    >
      Connect Wallet
    </button>
  );
}
