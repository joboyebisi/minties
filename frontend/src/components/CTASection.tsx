"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Send, Gift } from "lucide-react";
import { GiftClaim } from "@/components/GiftClaim";
import { GiftSend } from "@/components/GiftSend";

export function CTASection() {
  return (
    <div id="gifts" className="card p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Send size={18} className="text-[#30f0a8]" />
        <h2 className="text-xl font-semibold text-[#e8fdf4]">Send or Claim Gifts</h2>
      </div>
      <p className="text-sm text-[#bfe8d7]">
        Share USDC with family and friends via secure links, or claim gifts sent to you directly inside Telegram.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="border border-[#1e2a24] rounded-xl p-3 bg-[rgba(48,240,168,0.06)]">
          <GiftSend />
        </div>
        <div className="border border-[#1e2a24] rounded-xl p-3 bg-[rgba(48,240,168,0.06)]">
          <Suspense fallback={<div className="text-sm text-gray-400">Loading...</div>}>
            <GiftClaim />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

