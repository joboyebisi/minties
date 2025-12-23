"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);

  const short = (addr?: string | null) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="space-y-3 w-full">
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

