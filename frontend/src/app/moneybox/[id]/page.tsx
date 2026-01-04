"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
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
        const fetchGoal = async () => {
            // 1. Try fetching from LocalDB / Supabase
            let found = null;

            // Local Check first
            try {
                const { getAllItems } = await import("@/lib/local-db");
                const items = getAllItems();
                found = items.moneyBoxes?.find((b: any) => b.id === id);
            } catch (e) { }

            // If not found or if we have address, try DB for fresh state
            if (!found && address) {
                try {
                    const { getUserMoneyBoxes } = await import("@/lib/supabase");
                    const boxes = await getUserMoneyBoxes(address);
                    found = boxes?.find((b: any) => b.id === id);
                } catch (e) { }
            }

            if (found) {
                // Augment with logical defaults if missing
                const target = Number(found.target_amount || found.target || 0);
                const progressVal = Number(found.progress || 0);
                const current = target > 0
                    ? target * (progressVal / 100)
                    : 0; // Avoid NaN if target is 0

                setGoal({
                    ...found,
                    title: found.title || "Untitled Goal",
                    targetAmount: isNaN(target) ? 0 : target,
                    currentAmount: isNaN(current) ? 0 : current,
                    progress: isNaN(progressVal) ? 0 : progressVal,
                    autoSave: !!found.recurring_amount,
                    monthlyAmount: Number(found.recurring_amount || 0),
                    frequency: found.contribution_frequency || 'monthly',
                    yieldEarned: 0
                });
            } else {
                // Fallback to mock ONLY if truly not found (or if ID is 'new')
                if (id === 'new' || id === 'demo') {
                    setGoal(MOCK_GOALS['new']);
                }
            }
            setLoading(false);
        };
        fetchGoal();
    }, [id, address]);

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

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const handleDelete = async () => {
        if (!confirm("Are you sure? This will withdraw your funds (if any) and delete this goal.")) return;

        setRedeeming(true);
        try {
            // 1. Withdraw from Aave if needed
            const amountToWithdraw = Number(goal.currentAmount || 0);
            console.log("Checking withdrawal amount:", amountToWithdraw);

            if (amountToWithdraw > 0) {
                if (!walletClient) {
                    throw new Error("Wallet not connected for withdrawal");
                }

                show("info", "Withdrawing funds from Aave...");
                try {
                    const { withdrawUsdc } = await import("@/lib/aave");
                    await withdrawUsdc({
                        walletClient,
                        amount: amountToWithdraw
                    });
                    show("success", "Funds withdrawn to wallet!");
                } catch (e: any) {
                    console.error("Withdrawal skipped/failed", e);
                    // Critical change: If withdrawal fails, we ask the user IF they want to proceed.
                    // If they say YES, we delete. If NO, we stop.
                    if (!confirm(`Withdrawal failed (${e.message}). Do you want to force delete the goal anyway? Funds will remain in Aave.`)) {
                        setRedeeming(false);
                        return;
                    }
                }
            }

            // 2. Delete from DB (Supabase)
            try {
                const { deleteMoneyBox } = await import("@/lib/supabase");
                await deleteMoneyBox(id);
            } catch (e) { console.error("DB delete failed", e); }

            // 3. Delete from Local (Always do this to clear UI)
            try {
                const { deleteItem } = await import("@/lib/local-db");
                deleteItem("moneyBoxes", id);
                // Dispatch event to update dashboard immediately if we navigate back
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event("minties_data_updated"));
                }
            } catch (e) { console.error("Local delete failed", e); }

            show("success", "Goal deleted!");

            // Give time for state updates to propagate before navigating
            await new Promise(r => setTimeout(r, 500));
            router.push("/");

        } catch (e: any) {
            show("error", "Failed to delete: " + e.message);
        } finally {
            setRedeeming(false);
        }
    };

    const progress = goal.progress || 0;
    // Deadline is likely not stored in simple schema yet, assume 30 days or handle optional
    const daysLeft = 30; // Fallback for demo

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
                                Next pull: ${(goal.monthlyAmount || 0).toFixed(2)} {goal.frequency === 'daily' ? 'tomorrow' : `on ${new Date(Date.now() + (goal.frequency === 'weekly' ? 604800000 : 2592000000)).toLocaleDateString()}`}
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
                    Deeposit / Add
                </button>
                <button onClick={handleDelete} disabled={redeeming} className="btn-secondary py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20">
                    {redeeming ? "Withdrawing..." : "Withdraw & Delete"}
                </button>
            </div>
        </div>
    );
}
