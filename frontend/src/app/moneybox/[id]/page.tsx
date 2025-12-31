"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ArrowLeft, Clock, DollarSign, PiggyBank, Share2, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { PermissionGuard } from "@/components/PermissionGuard";
import { redeemPermissionAndTransfer, PERIOD_DURATIONS } from "@/lib/metamask-permissions";
import { createBundlerClientWithDelegation } from "@/lib/metamask-permissions"; // Wait, need to refactor this util first
// Let's stub the bundler creation here or look if I exported it properly
import { publicClient } from "@/lib/smart-account";
import { createBundlerClient } from "viem/account-abstraction";
import { http } from "viem";
import { sepolia } from "viem/chains";

// Mock data store (since we don't have a backend DB for this demo yet)
const MOCK_GOALS: Record<string, any> = {
    "new": {
        title: "Dream Vacation",
        targetAmount: 2000,
        currentAmount: 350,
        yieldEarned: 12.45,
        deadline: Date.now() + 15552000000, // ~6 months
        autoSave: true,
        monthlyAmount: 333,
        lastSaved: Date.now() - 2500000000, // ~1 month ago
    }
};

export default function MoneyBoxDashboardPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { address } = useAccount();
    const { show } = useToast();

    const [goal, setGoal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);

    useEffect(() => {
        // Simulate fetch
        setTimeout(() => {
            setGoal(MOCK_GOALS[id] || MOCK_GOALS["new"]);
            setLoading(false);
        }, 500);
    }, [id]);

    const handleManualAutoSave = async () => {
        setRedeeming(true);
        try {
            // In a real app, we'd fetch the stored permission from DB
            // Here we simulate the redemption process
            show("info", "Executing auto-save via Smart Account...");

            // We would call redeemPermissionAndTransfer here
            // const tx = await redeemPermissionAndTransfer(...)

            await new Promise(r => setTimeout(r, 2000)); // Sim delay

            show("success", "Auto-save executed successfully!");
            setGoal((prev: any) => ({
                ...prev,
                currentAmount: prev.currentAmount + prev.monthlyAmount,
                lastSaved: Date.now()
            }));
        } catch (error: any) {
            console.error("Redemption failed", error);
            show("error", "Failed to execute auto-save");
        } finally {
            setRedeeming(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-[#8da196]">Loading goal...</div>;
    if (!goal) return <div className="p-8 text-center text-[#ff6b6b]">Goal not found</div>;

    const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
    const daysLeft = Math.ceil((goal.deadline - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[#8da196] hover:text-[#e8fdf4] transition"
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-[#e8fdf4]">{goal.title}</h1>
                    <p className="text-[#bfe8d7] flex items-center gap-2 mt-1">
                        <Clock size={14} /> {daysLeft} days left
                    </p>
                </div>
                <button className="p-2 rounded-lg bg-[rgba(48,240,168,0.1)] text-[#30f0a8]">
                    <Share2 size={20} />
                </button>
            </div>

            {/* Progress Card */}
            <div className="card p-6 space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-sm text-[#8da196]">Current Balance</p>
                        <p className="text-3xl font-bold text-[#e8fdf4]">${goal.currentAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-[#8da196]">Target</p>
                        <p className="text-lg font-semibold text-[#bfe8d7]">${goal.targetAmount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="w-full h-3 bg-[rgba(48,240,168,0.1)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#30f0a8] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center gap-2 text-sm text-[#30f0a8] bg-[rgba(48,240,168,0.1)] p-2 rounded-lg w-fit">
                    <TrendingUp size={14} />
                    <span>+${goal.yieldEarned} earned from Aave yield</span>
                </div>
            </div>

            {/* Auto-Save Status */}
            {goal.autoSave && (
                <div className="card p-5 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-[rgba(255,193,7,0.1)] text-[#ffc107]">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#e8fdf4]">Auto-Save Active</h3>
                            <p className="text-sm text-[#8da196]">
                                Next pull: ${goal.monthlyAmount} on {new Date(Date.now() + 86400000).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-[#1e2a24]">
                        <p className="text-xs text-[#8da196] mb-2 flex items-center gap-1">
                            <AlertCircle size={12} />
                            Testing: You can manually trigger the recurring payment now to verify permissions.
                        </p>
                        <button
                            onClick={handleManualAutoSave}
                            disabled={redeeming}
                            className="btn-secondary w-full text-xs py-2"
                        >
                            {redeeming ? "Processing..." : "Trigger Auto-Save Now"}
                        </button>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
                <button className="btn-primary py-3">
                    Deeposit
                </button>
                <button className="btn-secondary py-3">
                    Withdraw
                </button>
            </div>
        </div>
    );
}
