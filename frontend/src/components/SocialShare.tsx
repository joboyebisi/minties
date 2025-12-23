"use client";

import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { useToast } from "@/components/ToastProvider";

interface SocialShareProps {
  title: string;
  text: string;
  url?: string;
  inviteCode?: string;
  giftLink?: string;
  circleId?: string;
}

export function SocialShare({ title, text, url, inviteCode, giftLink, circleId }: SocialShareProps) {
  const { tg, isTelegram, sendDataToBot } = useTelegram();
  const { show } = useToast();
  const [copied, setCopied] = useState(false);

  const shareText = inviteCode
    ? `Join Minties with my invite code: ${inviteCode}! 🎁`
    : giftLink
    ? `Claim this USDC gift on Minties: ${giftLink} 🎁`
    : circleId
    ? `Join my savings circle on Minties! Circle ID: ${circleId} 💰`
    : text;

  const shareUrl = url || giftLink || (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = async () => {
    if (isTelegram && tg) {
      // Use Telegram native sharing via openLink
      if (tg.openLink) {
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        tg.openLink(telegramShareUrl);
      }

      // Notify backend
      if (inviteCode) {
        sendDataToBot({
          type: "invite_shared",
          inviteCode,
        });
      }
    } else if (navigator.share) {
      // Web Share API
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        // User cancelled or error
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy();
    }
  };

  const handleCopy = async () => {
    const textToCopy = inviteCode || giftLink || circleId || shareUrl;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      show("success", "Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      show("error", "Failed to copy");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[rgba(48,240,168,0.12)] border border-[rgba(48,240,168,0.35)] text-sm text-[#30f0a8] hover:bg-[rgba(48,240,168,0.18)] transition"
      >
        <Share2 size={16} />
        Share
      </button>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[rgba(48,240,168,0.12)] border border-[rgba(48,240,168,0.35)] text-sm text-[#30f0a8] hover:bg-[rgba(48,240,168,0.18)] transition"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

