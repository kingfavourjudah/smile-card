"use client";

import { useState, useEffect } from "react";
import { fcl } from "@/config/flow";

interface User {
  addr: string | null;
  loggedIn: boolean;
}

export default function ConnectWallet() {
  const [user, setUser] = useState<User>({ addr: null, loggedIn: false });

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);

  if (user.loggedIn) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300 bg-[#1a1a2e] px-3 py-1.5 rounded-lg font-mono">
          {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
        </span>
        <button
          onClick={() => fcl.unauthenticate()}
          className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => fcl.authenticate()}
      className="px-6 py-2.5 rounded-lg bg-[#6C63FF] hover:bg-[#5b54e6] transition-colors font-medium text-white shadow-lg shadow-[#6C63FF]/20"
    >
      Connect Wallet
    </button>
  );
}
