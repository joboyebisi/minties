"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useToast } from "@/components/ToastProvider";
import { Send } from "lucide-react";

export function GiftSend() {
  const { address, isConnected } = useAccount();
  const { show } = useToast();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!isConnected || !address) {
      show("error", "Connect wallet first");
      return;
    }
    if (!recipient || !amount) {
      show("error", "Enter recipient and amount");
      return;
    }
    try {
      setLoading(true);
      // Placeholder: call backend to create a gift link or direct transfer
      show("success", `Gift prepared for ${recipient} (${amount} USDC). Link ready to share.`);
    } catch (e: any) {
      show("error", e?.message || "Failed to send gift");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-[#bfe8d7]">
        <Send size={16} className="text-[#30f0a8]" /> Send a gift
      </div>
      <div className="px-3 py-2 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24]">
        <input
          type="text"
          placeholder="Recipient (wallet or handle)"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full bg-transparent outline-none text-sm text-[#e8fdf4] placeholder:text-[#8da196]"
        />
      </div>
      <div className="px-3 py-2 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24]">
        <input
          type="number"
          placeholder="Amount (USDC)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-transparent outline-none text-sm text-[#e8fdf4] placeholder:text-[#8da196]"
        />
      </div>
      <button
        className="btn-primary w-full text-center disabled:opacity-60"
        disabled={loading || !isConnected}
        onClick={handleSend}
      >
        {loading ? "Preparing..." : "Send Gift Link"}
      </button>
      <p className="text-[11px] text-[#8da196]">
        We’ll generate a shareable gift link for your recipient. Recurring flow will use permissions later.
      </p>
    </div>
  );
}

