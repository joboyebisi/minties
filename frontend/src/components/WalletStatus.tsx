"use client";

import { useAccount, useWalletClient, useChainId, useBalance } from "wagmi";
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

  // Fetch ETH Balance
  const { data: ethBalance } = useBalance({
    address,
  });

  // Fetch USDC Balance (Sepolia Address)
  const { data: usdcBalance } = useBalance({
    address,
    token: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia USDC
  });

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
    <div className="fixed bottom-4 right-4 p-4 bg-black/90 border border-[#1e2a24] rounded-xl text-xs text-[#bfe8d7] z-50 max-w-xs shadow-2xl backdrop-blur-md">
      <div className="font-semibold text-[#30f0a8] mb-3 flex items-center justify-between">
        <span>Wallet Debug</span>
        <span className="text-[10px] bg-[#30f0a8]/10 px-2 py-0.5 rounded text-[#30f0a8]">DEV MODE</span>
      </div>

      {isConnected && (
        <div className="mb-3 space-y-1 pb-3 border-b border-white/10">
          <div className="flex justify-between">
            <span>ETH</span>
            <span className="text-[#e8fdf4] font-mono">{ethBalance?.formatted.slice(0, 6)} {ethBalance?.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span>USDC</span>
            <span className="text-[#e8fdf4] font-mono">{usdcBalance?.formatted.slice(0, 6)} {usdcBalance?.symbol}</span>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span>Status</span>
          <span>{isConnected ? "✅ Connected" : "❌ Disconnected"}</span>
        </div>
        <div className="flex justify-between">
          <span>Address</span>
          <span className="font-mono text-[10px] opacity-80">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "None"}</span>
        </div>
        <div className={`flex justify-between ${isWrongNetwork ? "text-[#ff6b6b]" : ""}`}>
          <span>Chain</span>
          <span>{chain?.name || `ID: ${chainId}`} {isWrongNetwork ? "⚠️" : ""}</span>
        </div>

        {walletClientError && (
          <div className="text-[#ff6b6b] mt-2 bg-red-500/10 p-2 rounded">
            <div className="font-semibold mb-1">Issue:</div>
            <div>{getErrorMessage() || "Connection error"}</div>
          </div>
        )}
      </div>
    </div>
  );
}

