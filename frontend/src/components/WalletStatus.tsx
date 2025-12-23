"use client";

import { useAccount, useWalletClient } from "wagmi";
import { useEffect, useState } from "react";

/**
 * Debug component to show wallet connection status
 * Can be removed in production
 */
export function WalletStatus() {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { data: walletClient, isPending: walletClientPending, error: walletClientError } = useWalletClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-black/80 border border-[#1e2a24] rounded-lg text-xs text-[#bfe8d7] z-50 max-w-xs">
      <div className="font-semibold text-[#30f0a8] mb-2">Wallet Debug</div>
      <div className="space-y-1">
        <div>Connected: {isConnected ? "✅" : "❌"}</div>
        <div>Connecting: {isConnecting ? "⏳" : "✅"}</div>
        <div>Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "None"}</div>
        <div>Chain: {chain?.name || "Unknown"}</div>
        <div>Wallet Client: {walletClient ? "✅" : walletClientPending ? "⏳" : "❌"}</div>
        {walletClientError && (
          <div className="text-red-400">Error: {walletClientError.message}</div>
        )}
      </div>
    </div>
  );
}

