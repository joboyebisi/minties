"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { useSearchParams } from "next/navigation";
import { claimGift } from "@/lib/gift";
import { useTelegram } from "@/hooks/useTelegram";
import { useToast } from "@/components/ToastProvider";
import { Gift, Link2, Sparkles } from "lucide-react";

interface GiftClaimProps {
  onSuccess?: (data: { amount: string; txHash: string }) => void;
}

export function GiftClaim({ onSuccess }: GiftClaimProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const searchParams = useSearchParams(); // This is safe because parent page wraps in Suspense
  const { isTelegram, showMainButton, hideMainButton, hapticFeedback } = useTelegram();
  const { show } = useToast();

  // Get delegation from URL if present
  const delegationParam = searchParams?.get("delegation");
  const [giftLink, setGiftLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (delegationParam && typeof window !== "undefined") {
      setGiftLink(`${window.location.origin}/claim?delegation=${delegationParam}`);
    }
  }, [delegationParam]);

  useEffect(() => {
    if (isTelegram && giftLink && isConnected) {
      showMainButton("Claim Gift", handleClaim);
    } else {
      hideMainButton();
    }

    return () => {
      hideMainButton();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTelegram, giftLink, isConnected]);

  const handleClaim = async () => {
    if (!isConnected || !address) {
      setResult("Please connect your wallet first");
      show("error", "Connect your wallet first");
      if (isTelegram) hapticFeedback.notification("error");
      return;
    }

    if (!giftLink) {
      setResult("Please enter a gift link");
      show("error", "Please enter a gift link");
      if (isTelegram) hapticFeedback.notification("error");
      return;
    }

    setLoading(true);
    setResult(null);
    if (isTelegram) {
      hapticFeedback.selection();
    }

    try {
      // Parse ID from link or input
      // Assuming link format: .../claim?id=0x... or just the ID itself
      let idToClaim = giftLink;
      try {
        const url = new URL(giftLink);
        const id = url.searchParams.get("id");
        if (id) idToClaim = id;
      } catch (e) {
        // not a url, treat as ID
      }

      // Check if it looks like a bytes32 hex
      if (!idToClaim.startsWith("0x") || idToClaim.length !== 66) {
        throw new Error("Invalid Gift ID. Please check the link.");
      }

      const { claimGift } = await import("@/lib/transactions");

      const { hash } = await claimGift({
        walletClient,
        giftId: idToClaim,
        password: ""
      });

      setResult(`✅ Gift claimed! Check wallet.`);
      show("success", `Transaction sent!`);
      if (isTelegram) hapticFeedback.notification("success");

      if (onSuccess) {
        onSuccess({ amount: "Verified On-Chain", txHash: hash });
      }

    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
      show("error", error.message || "Claim failed");
      if (isTelegram) hapticFeedback.notification("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-[#bfe8d7]">
        <Gift size={16} className="text-[#30f0a8]" /> Claim a gift link
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24]">
        <Link2 size={16} className="text-[#30f0a8]" />
        <input
          type="text"
          placeholder="Paste gift link here"
          value={giftLink}
          onChange={(e) => setGiftLink(e.target.value)}
          className="w-full bg-transparent outline-none text-sm text-[#e8fdf4] placeholder:text-[#8da196]"
        />
      </div>
      <button
        onClick={handleClaim}
        disabled={loading || !isConnected}
        className="btn-primary w-full text-center disabled:opacity-60"
      >
        {loading ? "Claiming..." : "✨ Claim Gift"}
      </button>
      {result && (
        <p className="text-sm text-[#bfe8d7]">{result}</p>
      )}
      {!isConnected && (
        <p className="text-sm text-[#facc15]">Enter the secret code shared with you</p>
      )}
    </div>
  );
}

