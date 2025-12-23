"use client";

import { useAccount, useWalletClient, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useEffect, useState } from "react";

/**
 * Debug component to show wallet connection status
 * Only visible in development mode
 */
export function WalletStatus() {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { data: walletClient, isPending: walletClientPending, error: walletClientError } = useWalletClient();
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  const isWrongNetwork = isConnected && chainId !== sepolia.id;
  
  // Get user-friendly error message
  const getErrorMessage = () => {
    if (!walletClientError) return null;
    
    const errorMsg = walletClientError.message || '';
    
    if (errorMsg.includes('chain') || errorMsg.includes('Chain ID')) {
      return "Wrong network - Switch to Sepolia";
    }
    
    if (errorMsg.includes('provider')) {
      return "MetaMask not detected";
    }
    
    return "Connection issue";
  };

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-black/80 border border-[#1e2a24] rounded-lg text-xs text-[#bfe8d7] z-50 max-w-xs">
      <div className="font-semibold text-[#30f0a8] mb-2">Wallet Debug</div>
      <div className="space-y-1">
        <div>Connected: {isConnected ? "✅" : "❌"}</div>
        <div>Connecting: {isConnecting ? "⏳" : "✅"}</div>
        <div>Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "None"}</div>
        <div className={isWrongNetwork ? "text-[#ff6b6b]" : ""}>
          Chain: {chain?.name || `Chain ${chainId}`} {isWrongNetwork ? "⚠️" : ""}
        </div>
        <div>Wallet Client: {walletClient ? "✅" : walletClientPending ? "⏳" : "❌"}</div>
        {walletClientError && (
          <div className="text-[#ff6b6b] mt-2">
            <div className="font-semibold">Issue:</div>
            <div>{getErrorMessage() || "Connection error"}</div>
          </div>
        )}
      </div>
    </div>
  );
}

