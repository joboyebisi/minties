"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { Calculator, Calendar, PiggyBank, Target, ArrowRight, ArrowLeft, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { PermissionGuard } from "@/components/PermissionGuard";
import { createWalletClientWithPermissions, setupMoneyBoxRecurringTransfer } from "@/lib/metamask-permissions";
import { fetchAaveApy, supplyUsdc } from "@/lib/aave";
import { createNotification } from "@/lib/supabase";

export default function CreateMoneyBoxPage() {
    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <PermissionGuard
                fallback={
                    <div className="bg-[rgba(48,240,168,0.05)] border border-[#1e2a24] rounded-xl p-6 text-center mt-10">
                        <h3 className="text-lg font-semibold text-[#e8fdf4] mb-2">Connect to Start Saving</h3>
                        <p className="text-[#bfe8d7] mb-4">You need to connect your wallet to create a Money Box.</p>
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
        durationValue: "6",
        durationUnit: "monthly" as "daily" | "weekly" | "monthly",
        autoSave: false,
        enableYield: true,
    });

    const [loading, setLoading] = useState(false);
    const [apy, setApy] = useState<number>(5.0); // Default fallback

    // Calculate projections
    const monthlyRate = (apy / 100) / 12; // Crude approximation for non-monthly
    const amount = parseFloat(formData.targetAmount) || 0;
    const durationVal = parseInt(formData.durationValue) || 1;

    // "Contribution per period"
    const contributionPerPeriod = amount / durationVal;

    // Rough yield est
    const projectedYield = formData.enableYield ? (amount * 0.05 * (durationVal / (formData.durationUnit === 'monthly' ? 12 : formData.durationUnit === 'weekly' ? 52 : 365))) : 0;
    const totalProjected = amount + projectedYield;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Submit triggered", { formData, address, hasWalletClient: !!walletClient });

        if (!address) {
            show("error", "Wallet not connected");
            return;
        }
        if (!walletClient) {
            show("error", "Wallet Client not ready. Please refresh or reconnect.");
            return;
        }

        setLoading(true);
        try {
            // 1. If Yield Enabled, Deposit Initial Amount to Aave
            if (formData.enableYield && amount > 0) {
                try {
                    console.log("Supplying to Aave...");
                    const initialDeposit = contributionPerPeriod;
                    await supplyUsdc({
                        walletClient: walletClient,
                        amount: initialDeposit,
                    });
                    show("success", `Deposited ${initialDeposit.toFixed(2)} USDC to Aave!`);
                } catch (err: any) {
                    console.error("Aave Supply Failed", err);
                    show("error", `Aave Deposit Failed: ${err.message || 'Unknown error'}`);
                    // We prevent blocking the rest of the flow? 
                    // No, yield is critical if enabled.
                    throw err;
                }
            }

            // 2. If auto-save enabled, request permission
            if (formData.autoSave) {
                try {
                    console.log("Requesting Permissions...");
                    const client = createWalletClientWithPermissions();
                    // Request recurring transfer permission
                    await setupMoneyBoxRecurringTransfer({
                        walletClient: client as any,
                        sessionAccountAddress: address,
                        monthlyAmount: contributionPerPeriod.toFixed(2),
                        frequency: formData.durationUnit,
                        duration: durationVal
                    });
                    show("success", "Recurring saving permission granted!");
                } catch (err: any) {
                    console.error("Permission Request Failed", err);
                    show("error", `Permission Denied: ${err.message || 'User rejected request'}`);
                    throw err;
                }
            }

            // 3. Create MoneyBox (Save to database/contract)
            console.log("Saving MoneyBox to DB...");

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
                // Non-blocking
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
            console.error("Creation failed globally", error);
            show("error", error.message || "Failed to create Money Box");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition text-[#8da196]"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[#e8fdf4]">Create Money Box</h1>
                    <p className="text-sm text-[#bfe8d7]">Save towards a goal with yield & automation.</p>
                </div>
            </div>

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
                    <p className="text-xs text-[#8da196] mt-1 pl-1">What are you saving for?</p>
                </div>

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
                    <p className="text-xs text-[#8da196] mt-1 pl-1">Total amount you want to save.</p>
                </div>

                <div>
                    <label className="label">Timeline (Duration)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min="1"
                            className="input w-1/3"
                            value={formData.durationValue}
                            onChange={e => setFormData({ ...formData, durationValue: e.target.value })}
                            required
                        />
                        <select
                            className="input w-2/3"
                            value={formData.durationUnit}
                            onChange={e => setFormData({ ...formData, durationUnit: e.target.value as any })}
                        >
                            <option value="daily">Days</option>
                            <option value="weekly">Weeks</option>
                            <option value="monthly">Months</option>
                        </select>
                    </div>
                    <p className="text-xs text-[#8da196] mt-1 pl-1">How long do you want to save for?</p>
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
                            <p className="text-xs text-[#8da196]">Deposits earn ~5% APY via Aave V3</p>
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
                            <p className="text-[#e8fdf4] font-medium">Auto-save</p>
                            <p className="text-xs text-[#8da196]">
                                Pull {contributionPerPeriod.toFixed(2)} USDC every {formData.durationUnit}
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
                    <span className="text-[#bfe8d7]">Contribution per {formData.durationUnit}</span>
                    <span className="text-[#e8fdf4]">{contributionPerPeriod.toFixed(2)} USDC</span>
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
                <div className="p-3 bg-[rgba(255,193,7,0.1)] rounded-lg text-xs flex gap-2 items-start">
                    <AlertCircle size={16} className="text-[#ffc107] shrink-0 mt-0.5" />
                    <p className="text-[#bfe8d7]">
                        You will be asked to sign an <strong>Advanced Permission</strong>. This allows Minties to automatically pull exactly <strong>{contributionPerPeriod.toFixed(2)} USDC</strong> from your wallet once per {formData.durationUnit} for the next {durationVal} periods.
                    </p>
                </div>
            )}
        </form>
    );
}
