"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { Calculator, Calendar, PiggyBank, Target, ArrowRight, Wallet, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { PermissionGuard } from "@/components/PermissionGuard";
import { createWalletClientWithPermissions, setupMoneyBoxRecurringTransfer } from "@/lib/metamask-permissions";
import { fetchAaveApy, supplyUsdc } from "@/lib/aave";
import { createNotification } from "@/lib/supabase";

export default function CreateMoneyBoxPage() {
    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#e8fdf4] mb-2">Create Money Box</h1>
                <p className="text-[#bfe8d7]">Save towards a goal with optional Aave yield and auto-saving.</p>
            </div>

            <PermissionGuard
                fallback={
                    <div className="bg-[rgba(48,240,168,0.05)] border border-[#1e2a24] rounded-xl p-6 text-center">
                        <h3 className="text-lg font-semibold text-[#e8fdf4] mb-2">Connect to Start Saving</h3>
                        <p className="text-[#bfe8d7] mb-4">You need a Smart Account for recurring savings.</p>
                        {/* The guard will verify/upgrade */}
                    </div>
                }
            >
                <CreateMoneyBoxForm />
            </PermissionGuard>
        </div>
    );
}

function CreateMoneyBoxForm() {
    const router = useRouter();
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { show } = useToast();

    const [formData, setFormData] = useState({
        title: "",
        targetAmount: "1000",
        months: "6",
        autoSave: false,
        enableYield: true,
    });

    const [loading, setLoading] = useState(false);
    const [apy, setApy] = useState<number>(5.0); // Default fallback

    // Calculate projections
    const monthlyRate = (apy / 100) / 12;
    const amount = parseFloat(formData.targetAmount) || 0;
    const months = parseInt(formData.months) || 1;
    const monthlyContribution = amount / months;
    const projectedYield = formData.enableYield ? (amount * monthlyRate * months) / 2 : 0; // Rough estimate for linear accumulation
    const totalProjected = amount + projectedYield;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletClient || !address) return;

        setLoading(true);
        try {
            // 1. If Yield Enabled, Deposit Initial Amount to Aave
            if (formData.enableYield && amount > 0) {
                // In a real flow, you might ask for an *initial* deposit separate from monthly. 
                // Assuming the user wants to deposit the first month's contribution now:
                const initialDeposit = monthlyContribution;
                // Or we could have an "Initial Deposit" field. For simplicity, we assume 1st month.

                await supplyUsdc({
                    walletClient: walletClient,
                    amount: initialDeposit,
                });
                show("success", `Deposited ${initialDeposit.toFixed(2)} USDC to Aave!`);
            }

            // 2. If auto-save enabled, request permission
            if (formData.autoSave) {
                const client = createWalletClientWithPermissions();
                // Request recurring transfer permission
                await setupMoneyBoxRecurringTransfer({
                    walletClient: client as any,
                    sessionAccountAddress: address,
                    monthlyAmount: monthlyContribution.toFixed(2),
                    months: months
                });
                show("success", "Recurring saving permission granted!");
            }

            // 3. Create MoneyBox (Save to database/contract)
            // Ideally we save the "AaveEnabled" flag so dashboard knows to check aToken balance
            console.log("Creating MoneyBox:", { ...formData, owner: address });

            const newBox = {
                id: Date.now().toString(),
                owner: address,
                title: formData.title,
                target_amount: parseFloat(formData.targetAmount),
                progress: formData.enableYield && amount > 0 ? (amount / parseFloat(formData.targetAmount) * 100) : 0,
            };

            // 1. Save to Supabase (Primary)
            try {
                const { saveMoneyBox } = await import("@/lib/supabase");
                await saveMoneyBox(newBox);

                // Notify
                await createNotification({
                    user_id: address,
                    type: 'deposit',
                    message: `Created Money Box "${newBox.title}" with target ${newBox.target_amount} USDC`,
                });
            } catch (e) {
                console.error("Supabase Save Failed", e);
            }

            // 2. Save Locally (Secondary/Cache)
            try {
                const { saveItem } = await import("@/lib/local-db");
                saveItem("moneyBoxes", {
                    id: newBox.id,
                    title: newBox.title,
                    target: newBox.target_amount,
                    progress: newBox.progress
                });
            } catch (e) { console.error(e); }

            show("success", "Money Box created successfully!");
            router.push(`/`);

        } catch (error: any) {
            console.error("Creation failed", error);
            show("error", error.message || "Failed to create Money Box");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Details */}
            <div className="card p-5 space-y-4">
                <h3 className="text-lg font-semibold text-[#e8fdf4] flex items-center gap-2">
                    <Target size={20} className="text-[#30f0a8]" /> Goal Details
                </h3>

                <div>
                    <label className="label">Goal Name</label>
                    <input
                        type="text"
                        placeholder="e.g. New Laptop, Dream Vacation"
                        className="input w-full"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Target Amount (USDC)</label>
                        <input
                            type="number"
                            min="10"
                            className="input w-full"
                            value={formData.targetAmount}
                            onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Timeline (Months)</label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            className="input w-full"
                            value={formData.months}
                            onChange={e => setFormData({ ...formData, months: e.target.value })}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Yield & Recurring Config */}
            <div className="card p-5 space-y-4">
                <h3 className="text-lg font-semibold text-[#e8fdf4] flex items-center gap-2">
                    <TrendingUp size={20} className="text-[#30f0a8]" /> Settings
                </h3>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(48,240,168,0.05)] border border-[#1e2a24]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-[rgba(48,240,168,0.1)] text-[#30f0a8]">
                            <PiggyBank size={20} />
                        </div>
                        <div>
                            <p className="text-[#e8fdf4] font-medium">Earn Aave Yield</p>
                            <p className="text-xs text-[#8da196]">Current APY estimate: {apy.toFixed(2)}%</p>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        className="toggle toggle-success"
                        checked={formData.enableYield}
                        onChange={e => setFormData({ ...formData, enableYield: e.target.checked })}
                    />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(48,240,168,0.05)] border border-[#1e2a24]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-[rgba(48,240,168,0.1)] text-[#30f0a8]">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-[#e8fdf4] font-medium">Auto-save Monthly</p>
                            <p className="text-xs text-[#8da196]">
                                Automatically pull {monthlyContribution.toFixed(2)} USDC/month
                            </p>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        className="toggle toggle-success"
                        checked={formData.autoSave}
                        onChange={e => setFormData({ ...formData, autoSave: e.target.checked })}
                    />
                </div>
            </div>

            {/* Projection Summary */}
            <div className="bg-[rgba(10,15,13,0.6)] p-4 rounded-xl border border-[#1e2a24] space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-[#bfe8d7]">Monthly Contribution</span>
                    <span className="text-[#e8fdf4]">{monthlyContribution.toFixed(2)} USDC</span>
                </div>
                {formData.enableYield && (
                    <div className="flex justify-between text-sm">
                        <span className="text-[#bfe8d7]">Est. Yield Earned</span>
                        <span className="text-[#30f0a8]">+{projectedYield.toFixed(2)} USDC</span>
                    </div>
                )}
                <div className="border-t border-[#1e2a24] pt-2 flex justify-between font-semibold">
                    <span className="text-[#e8fdf4]">Total Goal Value</span>
                    <span className="text-[#30f0a8]">{totalProjected.toFixed(2)} USDC</span>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-2"
            >
                {loading ? "Creating..." : (
                    <>
                        Create Goal <ArrowRight size={20} />
                    </>
                )}
            </button>

            {formData.autoSave && (
                <p className="text-xs text-center text-[#8da196]">
                    By creating this goal, you will be asked to sign an advanced permission allowing Minties to transfer {monthlyContribution.toFixed(2)} USDC monthly on your behalf.
                </p>
            )}
        </form>
    );
}
