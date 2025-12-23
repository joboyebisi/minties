"use client";

import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

/**
 * Component that detects wrong network and prompts user to switch
 * Shows user-friendly messages and handles chain switching automatically
 */
export function NetworkSwitcher() {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const chainId = useChainId();
  const { show } = useToast();
  const [hasShownError, setHasShownError] = useState(false);

  const expectedChainId = sepolia.id; // 11155111
  const isWrongNetwork = isConnected && chainId !== expectedChainId;

  useEffect(() => {
    if (isWrongNetwork && !hasShownError) {
      setHasShownError(true);
      show("error", "Please switch to Sepolia network in MetaMask");
    }
  }, [isWrongNetwork, hasShownError, show]);

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: expectedChainId });
      show("success", "Switched to Sepolia network");
      setHasShownError(false);
    } catch (error: any) {
      console.error("Failed to switch chain:", error);
      if (error?.code === 4902) {
        // User rejected or network not added
        show("error", "Please add Sepolia network to MetaMask manually");
      } else {
        show("error", "Failed to switch network. Please switch manually in MetaMask.");
      }
    }
  };

  if (!isConnected || !isWrongNetwork) {
    return null;
  }

  // Get user-friendly chain name
  const getChainName = (id: number) => {
    const chainNames: Record<number, string> = {
      1: "Ethereum Mainnet",
      5: "Goerli",
      97: "BSC Testnet",
      11155111: "Sepolia",
      137: "Polygon",
      80001: "Mumbai",
    };
    return chainNames[id] || `Chain ${id}`;
  };

  return (
    <div className="card p-4 mb-4 border-2 border-[#ff6b6b] bg-[rgba(255,107,107,0.1)]">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-[#ff6b6b] flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-semibold text-[#e8fdf4]">
            Wrong Network Detected
          </h3>
          <p className="text-xs text-[#bfe8d7]">
            Your wallet is connected to <strong>{getChainName(chainId)}</strong>, but Minties requires{" "}
            <strong>Sepolia Testnet</strong>.
          </p>
          <div className="space-y-2">
            <button
              onClick={handleSwitchNetwork}
              disabled={isSwitching}
              className="btn-primary w-full text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSwitching ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Switching...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Switch to Sepolia Network
                </>
              )}
            </button>
            <details className="text-xs text-[#8da196]">
              <summary className="cursor-pointer hover:text-[#bfe8d7] mb-2">
                Need help? Click here for manual steps
              </summary>
              <div className="mt-2 space-y-2 pl-2 border-l-2 border-[#1e2a24]">
                <p className="font-semibold text-[#bfe8d7]">Manual Steps:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Open MetaMask extension</li>
                  <li>Click the network dropdown (top of MetaMask)</li>
                  <li>Select "Sepolia" from the list</li>
                  <li>If Sepolia is not listed:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Click "Add Network" or "Show Test Networks"</li>
                      <li>Enable "Show test networks" in Settings</li>
                      <li>Then select Sepolia</li>
                    </ul>
                  </li>
                  <li>Come back to Minties and refresh the page</li>
                </ol>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

