"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTelegram } from "@/hooks/useTelegram";
import { GiftClaim } from "@/components/GiftClaim";

function ClaimPageContent() {
  const searchParams = useSearchParams();
  const delegation = searchParams.get("delegation");
  const { isTelegram, sendDataToBot, hapticFeedback } = useTelegram();
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (isTelegram) {
      hapticFeedback.notification("success");
    }
  }, [isTelegram, hapticFeedback]);

  const handleClaimSuccess = (data: { amount: string; txHash: string }) => {
    setClaimed(true);
    if (isTelegram) {
      sendDataToBot({
        type: "gift_claimed",
        amount: data.amount,
        txHash: data.txHash,
      });
      hapticFeedback.notification("success");
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Claim Your Gift 🎁
          </h1>
          {claimed && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-4">
              <p className="text-green-400">✅ Gift claimed successfully!</p>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <GiftClaim onSuccess={handleClaimSuccess} />
        </div>
      </div>
    </main>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              Claim Your Gift 🎁
            </h1>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <p className="text-center text-gray-400">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <ClaimPageContent />
    </Suspense>
  );
}

