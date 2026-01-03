"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { Gift, Check, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { ConnectButton } from "@/components/ConnectButton";

// Mock function for demo if contract isn't fully ready, 
// but we should aim to use real contract calls if possible.
import { claimGift } from "@/lib/transactions";

export default function ClaimGiftPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { show } = useToast();

    const giftId = searchParams.get("id");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"checking" | "ready" | "claiming" | "success" | "error">("checking");
    const [giftDetails, setGiftDetails] = useState<any>(null);

    useEffect(() => {
        if (!giftId) {
            setStatus("error");
            return;
        }

        // Simulate fetching gift details
        // In real app: call chain or backend to get amount
        const fetchGift = async () => {
            // For hackathon demo, we trust the link or fetch from backend
            // Let's pretend we fetched it
            setTimeout(() => {
                setGiftDetails({
                    amount: "???", // We often can't see amount onchain easily without graph, using placeholder
                    sender: "A friend"
                });
                setStatus("ready");
            }, 1000);
        };
        fetchGift();

    }, [giftId]);

    const handleClaim = async () => {
        if (!walletClient || !giftId) return;
        setLoading(true);
        setStatus("claiming");

        try {
            const { hash } = await claimGift({
                walletClient,
                giftId: giftId as `0x${string}`,
            });
            console.log("Claim tx:", hash);

            setStatus("success");
            show("success", "Gift claimed successfully!");

            // Notify backend (optional)
        } catch (error: any) {
            console.error("Claim failed", error);
            show("error", error.message || "Failed to claim gift");
            setStatus("ready"); // Allow retry
        } finally {
            setLoading(false);
        }
    };

    if (!giftId || status === "error") {
        return (
            <div className="max-w-md mx-auto px-4 py-20 text-center">
                <div className="inline-flex p-4 rounded-full bg-red-900/20 text-red-500 mb-4">
                    <Gift size={40} />
                </div>
                <h1 className="text-2xl font-bold text-[#e8fdf4] mb-2">Invalid Gift Link</h1>
                <p className="text-[#8da196]">This gift link seems to be broken or missing an ID.</p>
                <button onClick={() => router.push("/")} className="btn-secondary mt-8 w-full">Go Home</button>
            </div>
        );
    }

    if (status === "checking") {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
                <Loader2 className="animate-spin text-[#30f0a8] mb-4" size={40} />
                <p className="text-[#bfe8d7]">Checking gift box...</p>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="max-w-md mx-auto px-4 py-20 text-center animate-in zoom-in-50">
                <div className="inline-flex p-4 rounded-full bg-[rgba(48,240,168,0.2)] text-[#30f0a8] mb-4">
                    <Check size={40} />
                </div>
                <h1 className="text-3xl font-bold text-[#e8fdf4] mb-2">You got Money! 💸</h1>
                <p className="text-[#bfe8d7] mb-8">The gift has been claimed to your wallet.</p>

                <button onClick={() => router.push("/")} className="btn-primary w-full">
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="card p-8 text-center space-y-6 border-[#30f0a8]/30 shadow-[0_0_50px_-20px_rgba(48,240,168,0.3)]">
                <div className="w-24 h-24 bg-[radial-gradient(circle,_rgba(48,240,168,0.2)_0%,_transparent_70%)] mx-auto flex items-center justify-center rounded-full">
                    <Gift size={48} className="text-[#30f0a8] drop-shadow-[0_0_10px_rgba(48,240,168,0.5)]" />
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-[#e8fdf4]">You received a gift!</h1>
                    <p className="text-[#8da196] mt-2">
                        Someone sent you crypto via Minties.
                    </p>
                </div>

                {!isConnected ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-[rgba(255,255,255,0.05)] rounded-xl">
                            <p className="text-sm text-[#bfe8d7] mb-3">Connect your wallet to claim</p>
                            <ConnectButton />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-[rgba(255,255,255,0.05)] rounded-xl border border-[#1e2a24]">
                            <p className="text-xs text-[#8da196] uppercase tracking-wider font-semibold">Recipient</p>
                            <p className="text-[#e8fdf4] font-mono text-sm truncate">{address}</p>
                        </div>

                        <button
                            onClick={handleClaim}
                            disabled={loading}
                            className="btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-[#30f0a8]/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" /> Claiming...
                                </>
                            ) : (
                                "Claim Gift now"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
