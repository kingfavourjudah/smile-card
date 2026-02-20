"use client";

import { useState, useEffect } from "react";
import { fcl } from "@/config/flow";
import { GET_TOKEN_BALANCE, GET_STAKING_INFO } from "@/cadence/scripts";
import { SETUP_COLLECTION } from "@/cadence/transactions";
import TransactionStatus from "@/components/TransactionStatus";

interface User {
  addr: string | null;
  loggedIn: boolean;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User>({ addr: null, loggedIn: false });
  const [balance, setBalance] = useState("0.0");
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txMessage, setTxMessage] = useState("");

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);

  useEffect(() => {
    if (user.addr) {
      fetchBalance();
    }
  }, [user.addr]);

  async function fetchBalance() {
    if (!user.addr) return;
    try {
      const result = await fcl.query({
        cadence: GET_TOKEN_BALANCE,
        args: (arg: typeof fcl.arg, t: typeof fcl.t) => [arg(user.addr, t.Address)],
      });
      setBalance(result || "0.0");
    } catch {
      setBalance("0.0");
    }
  }

  async function setupAccount() {
    setTxStatus("pending");
    setTxMessage("Setting up your account...");
    try {
      const txId = await fcl.mutate({
        cadence: SETUP_COLLECTION,
        args: (arg: typeof fcl.arg, t: typeof fcl.t) => [arg("1", t.UInt64)],
        limit: 999,
      });
      await fcl.tx(txId).onceSealed();
      setTxStatus("success");
      setTxMessage("Account set up successfully!");
      fetchBalance();
    } catch (err: unknown) {
      setTxStatus("error");
      setTxMessage(err instanceof Error ? err.message : "Setup failed");
    }
  }

  if (!user.loggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">Connect your Flow wallet to view your dashboard</p>
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
      <TransactionStatus status={txStatus} message={txMessage} onClose={() => setTxStatus("idle")} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400 font-mono text-sm">{user.addr}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#16213e] rounded-xl p-6 border border-gray-700/50">
          <p className="text-sm text-gray-500 mb-1">Token Balance</p>
          <p className="text-2xl font-bold text-white">{parseFloat(balance).toFixed(2)} <span className="text-sm text-[#6C63FF]">SMILE</span></p>
        </div>
        <div className="bg-[#16213e] rounded-xl p-6 border border-gray-700/50">
          <p className="text-sm text-gray-500 mb-1">Network</p>
          <p className="text-2xl font-bold text-white">Emulator</p>
        </div>
        <div className="bg-[#16213e] rounded-xl p-6 border border-gray-700/50">
          <p className="text-sm text-gray-500 mb-1">Account</p>
          <button
            onClick={setupAccount}
            className="mt-1 px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#5b54e6] transition-colors text-sm text-white"
          >
            Setup Account
          </button>
        </div>
      </div>

      <div className="bg-[#16213e] rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/brands" className="bg-[#0f0f1a] rounded-lg p-4 text-center hover:bg-[#1a1a2e] transition-colors">
            <p className="text-sm text-gray-400">View Brands</p>
          </a>
          <a href="/stake" className="bg-[#0f0f1a] rounded-lg p-4 text-center hover:bg-[#1a1a2e] transition-colors">
            <p className="text-sm text-gray-400">Stake Tokens</p>
          </a>
          <a href="/cards" className="bg-[#0f0f1a] rounded-lg p-4 text-center hover:bg-[#1a1a2e] transition-colors">
            <p className="text-sm text-gray-400">My Cards</p>
          </a>
          <button onClick={fetchBalance} className="bg-[#0f0f1a] rounded-lg p-4 text-center hover:bg-[#1a1a2e] transition-colors">
            <p className="text-sm text-gray-400">Refresh Balance</p>
          </button>
        </div>
      </div>
    </div>
  );
}
