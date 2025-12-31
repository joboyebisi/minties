"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { PiggyBank, Users, Lock, Wallet, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { PermissionGuard } from "@/components/PermissionGuard";
import { createWalletClientWithPermissions, setupCircleRecurringContribution } from "@/lib/metamask-permissions";
import { joinCircle } from "@/lib/transactions";

export default function SavingsCircleJoinPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { show } = useToast();

    const [circle, setCircle] = useState<any>(null);
    const [loading, setLoading] = useState(true); // Loading circle data
    const [joining, setJoining] = useState(false); // Joining process
    const [autoContribute, setAutoContribute] = useState(false);
    const [weeklyAmount, setWeeklyAmount] = useState("50");

    useEffect(() => {
        // Simulate fetching circle data
        setTimeout(() => {
            setCircle({
                id,
                targetAmount: 2000,
                lockPeriodWeeks: 12,
                yieldPercentage: 5,
                participants: 3,
                creator: "0x123...abc"
            });
            setLoading(false);
        }, 500);
    }, [id]);

    const handleJoin = async () => {
        if (!walletClient || !address) {
            show("error", "Please connect wallet");
            return;
        }

        setJoining(true);
        try {
            // 1. Setup recurring if selected
            if (autoContribute) {
                const client = createWalletClientWithPermissions();
                await setupCircleRecurringContribution({
                    walletClient: client as any,
                    sessionAccountAddress: address,
                    weeklyAmount: weeklyAmount,
                    weeks: circle.lockPeriodWeeks
                });
                show("success", "Recurring contribution set!");
            }

            // 2. Join Circle On-Chain
            const { hash } = await joinCircle({
                walletClient,
                circleId: id
            });

            show("success", "Joined circle successfully!");
            // Redirect to dashboard or refresh
            router.push("/");

        } catch (error: any) {
            console.error("Join failed", error);
            show("error", error.message || "Failed to join circle");
        } finally {
            setJoining(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-[#8da196]">Loading circle details...</div>;
    if (!circle) return <div className="p-8 text-center text-[#ff6b6b]">Circle not found</div>;

    return (
        <div className="max-w-md mx-auto px-4 py-8 space-y-6">
            <div className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-[rgba(48,240,168,0.1)] text-[#30f0a8]">
                    <Users size={40} />
                </div>
                <h1 className="text-2xl font-bold text-[#e8fdf4]">Join Savings Circle</h1>
                <p className="text-[#bfe8d7]">You've been invited to save together!</p>
            </div>

            <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-[#e8fdf4] border-b border-[#1e2a24] pb-2">Circle Details</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[#8da196]">Target per person</p>
                        <p className="text-[#e8fdf4] font-semibold">{circle.targetAmount} USDC</p>
                    </div>
                    <div>
                        <p className="text-[#8da196]">Lock Period</p>
                        <p className="text-[#e8fdf4] font-semibold">{circle.lockPeriodWeeks} Weeks</p>
                    </div>
                    <div>
                        <p className="text-[#8da196]">Yield</p>
                        <p className="text-[#30f0a8] font-semibold">{circle.yieldPercentage}% APY</p>
                    </div>
                    <div>
                        <p className="text-[#8da196]">Members</p>
                        <p className="text-[#e8fdf4] font-semibold">{circle.participants}</p>
                    </div>
                </div>
            </div>

            <PermissionGuard fallback={null}>
                <div className="card p-4 bg-[rgba(48,240,168,0.05)] border-2 border-[#1e2a24]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-[rgba(48,240,168,0.1)] text-[#30f0a8]">
                                <Lock size={16} />
                            </div>
                            <span className="text-[#e8fdf4] font-medium">Auto-Contribute</span>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle toggle-success"
                            checked={autoContribute}
                            onChange={e => setAutoContribute(e.target.checked)}
                        />
                    </div>

                    {autoContribute && (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                            <p className="text-xs text-[#8da196]">
                                Automatically contribute weekly to reach your goal effortlessly.
                            </p>
                            <label className="text-xs text-[#bfe8d7]">Weekly Amount (USDC)</label>
                            <input
                                type="number"
                                className="input w-full"
                                value={weeklyAmount}
                                onChange={e => setWeeklyAmount(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </PermissionGuard>

            <button
                onClick={handleJoin}
                disabled={joining}
                className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-2"
            >
                {joining ? "Joining..." : (
                    <>
                        Join Circle <ArrowRight size={20} />
                    </>
                )}
            </button>
        </div>
    );
}
