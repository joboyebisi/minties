"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowRight } from "lucide-react";

export function GiftSend() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleStart = () => {
    const params = new URLSearchParams();
    if (amount) params.set("amount", amount);
    if (recipient) params.set("recipient", recipient);
    router.push(`/gift/send?${params.toString()}`);
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
        className="btn-primary w-full text-center flex items-center justify-center gap-2"
        onClick={handleStart}
      >
        Send Gift <ArrowRight size={16} />
      </button>
      <p className="text-[11px] text-[#8da196]">
        Start here, then customize your gift and enable recurring options in the next step.
      </p>
    </div>
  );
}
