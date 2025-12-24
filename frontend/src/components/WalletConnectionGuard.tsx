"use client";

import { useAccount } from "wagmi";
import { AlertCircle, Loader2 } from "lucide-react";
import { NetworkSwitcher } from "./NetworkSwitcher";
import { useWalletReady } from "@/hooks/useWalletReady";

interface WalletConnectionGuardProps {
  children: React.ReactNode;
  showMessage?: boolean;
}

/**
 * Wrapper component that shows user-friendly messages when wallet is not ready
 * Handles chain mismatches and wallet client availability with timeout protection
 */
export function WalletConnectionGuard({ children, showMessage = true }: WalletConnectionGuardProps) {
  const { isConnected } = useAccount();
  const { isReady, isLoading, isWrongNetwork, walletClient, error: walletClientError } = useWalletReady();

  // If wallet client has a chain mismatch error, show network switcher
  if (walletClientError?.message?.includes("chain") || isWrongNetwork) {
    return (
      <>
        <NetworkSwitcher />
        {showMessage && (
          <div className="card p-4 mb-4 border border-[#1e2a24] bg-[rgba(48,240,168,0.08)]">
            <div className="flex items-center gap-2 text-sm text-[#bfe8d7]">
              <AlertCircle size={16} className="text-[#30f0a8]" />
              <span>Please switch to Sepolia network to continue</span>
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  // If wallet is connecting/loading - show message but allow interaction after timeout
  if (isConnected && isLoading && !isReady) {
    return (
      <>
        {showMessage && (
          <div className="card p-4 mb-4 border border-[#1e2a24] bg-[rgba(48,240,168,0.08)]">
            <div className="flex items-center gap-2 text-sm text-[#bfe8d7]">
              <Loader2 size={16} className="text-[#30f0a8] animate-spin" />
              <span>Preparing your wallet...</span>
            </div>
          </div>
        )}
        {/* Still render children - don't block UI completely */}
        {children}
      </>
    );
  }

  // If wallet client error (but not chain error)
  if (walletClientError && !walletClientError.message?.includes("chain")) {
    return (
      <>
        {showMessage && (
          <div className="card p-4 mb-4 border-2 border-[#ff6b6b] bg-[rgba(255,107,107,0.1)]">
            <div className="flex items-start gap-2">
              <AlertCircle size={20} className="text-[#ff6b6b] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#e8fdf4] mb-1">
                  Wallet Connection Issue
                </p>
                <p className="text-xs text-[#bfe8d7] mb-2">
                  There was a problem connecting to your wallet. Please try:
                </p>
                <ol className="list-decimal list-inside text-xs text-[#8da196] space-y-1 ml-2">
                  <li>Disconnect and reconnect your wallet</li>
                  <li>Refresh this page</li>
                  <li>Make sure MetaMask is unlocked</li>
                </ol>
              </div>
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  return <>{children}</>;
}

