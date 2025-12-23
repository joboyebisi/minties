"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { NavBar } from "@/components/NavBar";

export default function ConnectPage() {
  const { address, isConnected } = useAccount();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(48,240,168,0.08),transparent_40%)]">
      <NavBar />
      <div className="max-w-lg mx-auto px-4 py-8 md:px-6 md:py-10 space-y-6">
        <div className="card p-6 space-y-4">
          <div className="space-y-2">
            <p className="badge w-fit">Wallet</p>
            <h1 className="text-3xl font-semibold text-[#e8fdf4]">Connect your wallet</h1>
            <p className="text-sm text-[#bfe8d7]">
              This Mini App runs inside Telegram. Use the connect button to link MetaMask / EOA on Sepolia. Your keys stay in your wallet.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-[#8da196]">Network: Sepolia</p>
            <p className="text-sm text-[#8da196]">RPC: ethereum-sepolia-rpc.publicnode.com</p>
            {isConnected ? (
              <p className="text-sm text-[#30f0a8] break-all">Connected: {address}</p>
            ) : (
              <p className="text-sm text-[#bfe8d7]">Not connected</p>
            )}
          </div>

          <ConnectButton />
        </div>
      </div>
    </main>
  );
}

