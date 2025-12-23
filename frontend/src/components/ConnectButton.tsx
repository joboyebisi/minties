"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

export function ConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const chainId = useChainId();
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
  
  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  const short = (addr?: string | null) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: sepolia.id });
    } catch (error: any) {
      console.error("Failed to switch chain:", error);
    }
  };

  if (isConnected) {
    return (
      <div className="space-y-3 w-full">
        {isWrongNetwork && (
          <div className="p-3 rounded-lg bg-[rgba(255,107,107,0.1)] border border-[#ff6b6b] text-xs text-[#bfe8d7]">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-[#ff6b6b] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-[#ff6b6b] mb-1">Wrong Network</p>
                <p className="mb-2">Switch to Sepolia to use Minties</p>
                <button
                  onClick={handleSwitchNetwork}
                  disabled={isSwitching}
                  className="btn-primary w-full text-xs py-2 disabled:opacity-60"
                >
                  {isSwitching ? "Switching..." : "Switch to Sepolia"}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="text-sm text-[#bfe8d7]">
          <p className="flex items-center gap-2">
            <span className="badge">EOA</span>
            <span className="break-all text-xs">{short(address)}</span>
          </p>
          {smartAccountAddress && (
            <p className="flex items-center gap-2 mt-1">
              <span className="badge">Smart</span>
              <span className="break-all text-xs">{short(smartAccountAddress)}</span>
            </p>
          )}
          {chain && (
            <p className="flex items-center gap-2 mt-1 text-xs">
              <span className="badge">Network</span>
              <span className={isWrongNetwork ? "text-[#ff6b6b]" : "text-[#30f0a8]"}>
                {chain.name || `Chain ${chainId}`}
              </span>
            </p>
          )}
        </div>
        <button
          onClick={() => disconnect()}
          className="btn-primary w-full text-center"
        >
          🚪 Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="btn-primary w-full text-center"
    >
      🔗 Connect Wallet
    </button>
  );
}

