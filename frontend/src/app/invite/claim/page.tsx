"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { setupSmartAccount, decodeDelegation, redeemInviteDelegation } from "@/lib/smart-account";
import { useToast } from "@/components/ToastProvider";
import { Sparkles, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { parseEther } from "viem";

export default function ClaimInvitePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { show } = useToast();

    const [status, setStatus] = useState<'idle' | 'redeeming' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState("Waiting to redeem...");

    const delegationParam = searchParams?.get("delegation");

    const handleRedeem = async () => {
        if (!delegationParam) return;

        setStatus('redeeming');
        setMessage("Setting up your smart account...");

        try {
            // 1. Setup New User Smart Account (Stateless or Hybrid)
            // Ideally invitee doesn't even need funds, so we use the Delegation to pay gas.
            // NOTE: For true gasless onboarding, we rely on the Bundler Paymaster + Delegation.
            const { smartAccount, bundlerClient } = await setupSmartAccount('hybrid');

            setMessage("Verifying invitation...");
            const delegation = decodeDelegation(delegationParam);

            // 2. Redeem Delegation (Execute a tx to 'activate' account or just use funds)
            // Here we redeem it to "claim" the gas/funds usage.
            setMessage("Redeeming invitation funds...");

            // Hardcoded amount matches what was delegated (or less)
            const amountWei = parseEther("0.0005"); // Spending a bit to prove it works

            const userOp = await redeemInviteDelegation(smartAccount, delegation, bundlerClient, amountWei);

            console.log("Redemption UserOp:", userOp);

            setStatus('success');
            setMessage("Welcome to Minties!");
            show("success", "Invite redeemed successfully!");

        } catch (error: any) {
            console.error(error);
            setStatus('error');
            setMessage(error.message || "Failed to claim invite.");
        }
    };

    if (!delegationParam) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[#bfe8d7]">
                Invalid Invite Link
            </div>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#050908] to-[#0a0f0d]">
            <div className="w-full max-w-md card p-8 text-center space-y-6 border-[#30f0a8]/30 shadow-[0_0_50px_rgba(48,240,168,0.1)]">
                <div className="mx-auto w-16 h-16 rounded-full bg-[rgba(48,240,168,0.1)] flex items-center justify-center text-[#30f0a8] mb-4">
                    <Sparkles size={32} />
                </div>

                <h1 className="text-3xl font-bold text-[#e8fdf4]">You've been invited!</h1>
                <p className="text-[#bfe8d7]">
                    Claim your sponsored account to start saving & gifting with Minties.
                </p>

                {status === 'idle' && (
                    <button
                        onClick={handleRedeem}
                        className="w-full btn-primary py-4 text-lg font-semibold shadow-lg shadow-[#30f0a8]/20"
                    >
                        Accept Invite
                    </button>
                )}

                {status === 'redeeming' && (
                    <div className="space-y-3">
                        <Loader2 className="animate-spin w-8 h-8 mx-auto text-[#30f0a8]" />
                        <p className="text-sm text-[#8da196] animate-pulse">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4 animate-in zoom-in">
                        <div className="text-[#30f0a8] flex items-center justify-center gap-2 font-semibold">
                            <CheckCircle /> {message}
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
                        >
                            Go to Dashboard <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {message}
                        <button
                            onClick={() => setStatus('idle')}
                            className="text-[#e8fdf4] underline ml-2 hover:text-white"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
