"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { Gift, Repeat, User, ArrowRight, Sparkles, Check } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { PermissionGuard } from "@/components/PermissionGuard";
import { createWalletClientWithPermissions, setupRecurringGift } from "@/lib/metamask-permissions";
import { createGift } from "@/lib/transactions";
import { createNotification } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";

export default function SendGiftPage() {
    const router = useRouter();
    const { isConnected, address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { show } = useToast();

    const [step, setStep] = useState<"amount" | "customize" | "success">("amount");
    const [formData, setFormData] = useState({
        recipient: "",
        amount: "",
        message: "",
        recurring: false,
        frequency: "monthly" as "daily" | "weekly" | "monthly",
        duration: "12", // periods
    });
    const [loading, setLoading] = useState(false);
    const [giftId, setGiftId] = useState<string | null>(null);
    const [shareLink, setShareLink] = useState("");

    const handleCreateGift = async () => {
        if (!walletClient || !address) {
            show("error", "Wallet not connected");
            return;
        }
        setLoading(true);

        try {
            // 1. If recurring, request permission
            if (formData.recurring) {
                console.log("Requesting recurring gift permission...");
                try {
                    const client = createWalletClientWithPermissions();
                    await setupRecurringGift({
                        walletClient: client as any,
                        sessionAccountAddress: address,
                        amount: formData.amount,
                        frequency: formData.frequency,
                        duration: parseInt(formData.duration)
                    });
                    show("success", "Recurring gift permission granted!");
                } catch (err: any) {
                    console.error("Permission request failed", err);
                    show("error", "Permission denied or failed. Check console.");
                    setLoading(false);
                    return; // Stop flow
                }
            }

            // 2. Create the initial gift on-chain
            console.log("Creating gift on-chain...");
            // Generate ID
            const { keccak256, toBytes, concat } = await import("viem");
            const timestamp = Date.now().toString();
            const giftIdBytes = concat([toBytes(address), toBytes(timestamp)]);
            const id = keccak256(giftIdBytes) as `0x${string}`;

            const { hash } = await createGift({
                walletClient,
                giftId: id,
                amount: formData.amount,
                giftType: formData.recurring ? 2 : 0, // 0=Single, 2=Scheduled/Recurring logic
                maxClaims: formData.recurring ? parseInt(formData.duration) : 1,
            });
            console.log("Gift created on-chain:", hash);

            const frontendUrl = window.location.origin;
            const link = `${frontendUrl}/gift/claim?id=${id}`;

            setGiftId(id);
            setShareLink(link);

            // Save to local storage for dashboard
            try {
                const { saveItem } = await import("@/lib/local-db");
                saveItem("gifts", {
                    id: id,
                    amount: parseFloat(formData.amount),
                    recipient: formData.recipient || "Anyone"
                });
            } catch (e) {
                console.warn("Local save failed", e);
            }

            setStep("success");

            // Notify
            // Don't await notification failure
            createNotification({
                user_id: address,
                type: 'gift_sent',
                message: `Sent a gift of ${formData.amount} USDC${formData.recipient ? ` to ${formData.recipient}` : ''}`,
            }).catch(console.error);

            show("success", "Gift created! Share the link.");

        } catch (error: any) {
            console.error("Gift creation failed", error);
            show("error", error.message || "Failed to create gift");
        } finally {
            setLoading(false);
        }
    };

    const renderAmountStep = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
                <h2 className="text-xl text-[#e8fdf4] font-semibold">How much to send?</h2>
                <div className="relative inline-block">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-[#30f0a8]">$</span>
                    <input
                        type="number"
                        className="bg-transparent text-5xl font-bold text-[#e8fdf4] w-48 text-center focus:outline-none placeholder:text-[#1e2a24]"
                        placeholder="0"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        autoFocus
                    />
                </div>
                <p className="text-[#8da196] text-sm">Balance: Loading...</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {["10", "25", "50", "100", "500", "1000"].map(val => (
                    <button
                        key={val}
                        onClick={() => setFormData({ ...formData, amount: val })}
                        className="p-3 rounded-xl border border-[#1e2a24] bg-[rgba(48,240,168,0.05)] hover:bg-[rgba(48,240,168,0.1)] transition text-[#bfe8d7] text-sm font-medium"
                    >
                        ${val}
                    </button>
                ))}
            </div>

            <div className="pt-4 border-t border-[#1e2a24]">
                <label className="label">Recipient (Optional)</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8da196]" size={16} />
                    <input
                        type="text"
                        className="input w-full pl-10"
                        placeholder="Name, @handle, or address"
                        value={formData.recipient}
                        onChange={e => setFormData({ ...formData, recipient: e.target.value })}
                    />
                </div>
                <p className="text-xs text-[#8da196] mt-2">
                    Or leave blank to create a generic claim link anyone can use.
                </p>
            </div>

            <button
                disabled={!formData.amount || parseFloat(formData.amount) <= 0}
                onClick={() => setStep("customize")}
                className="btn-primary w-full py-4 rounded-xl flex justify-center items-center gap-2"
            >
                Next <ArrowRight size={18} />
            </button>
        </div>
    );

    const renderCustomizeStep = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-[#e8fdf4] flex items-center gap-2">
                    <Gift size={20} className="text-[#30f0a8]" /> Customize Gift
                </h3>

                <div>
                    <label className="label">Message</label>
                    <textarea
                        className="input w-full h-24 resize-none"
                        placeholder="Write a note..."
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                    />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(48,240,168,0.05)] border border-[#1e2a24]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-[rgba(48,240,168,0.1)] text-[#30f0a8]">
                            <Repeat size={20} />
                        </div>
                        <div>
                            <p className="text-[#e8fdf4] font-medium">Make it Recurring</p>
                            <p className="text-xs text-[#8da196]">Send {formData.amount} USDC regularly</p>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        className="toggle toggle-success"
                        checked={formData.recurring}
                        onChange={e => setFormData({ ...formData, recurring: e.target.checked })}
                    />
                </div>

                {formData.recurring && (
                    <div className="space-y-4 pl-2 border-l-2 border-[#1e2a24] animate-in slide-in-from-top-2">
                        <div>
                            <label className="label">Frequency</label>
                            <select
                                className="input w-full"
                                value={formData.frequency}
                                onChange={e => setFormData({ ...formData, frequency: e.target.value as any })}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Duration (# of times to send)</label>
                            <input
                                type="number"
                                min="1"
                                className="input w-full"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            />
                            <p className="text-xs text-[#8da196] mt-1">
                                Total: {(parseFloat(formData.amount || "0") * parseInt(formData.duration || "0")).toFixed(2)} USDC
                            </p>
                        </div>

                        <div className="p-3 bg-[rgba(48,240,168,0.05)] rounded-lg text-xs text-[#bfe8d7]">
                            You will be asked to sign a permission to allow Minties to send <strong>{formData.amount} USDC</strong> every <strong>{formData.frequency}</strong> for <strong>{formData.duration}</strong> periods.
                        </div>
                    </div>
                )}
            </div>

            <button
                disabled={loading}
                onClick={handleCreateGift}
                className="btn-primary w-full py-4 rounded-xl flex justify-center items-center gap-2"
            >
                {loading ? "Creating..." : (
                    <>
                        <Gift size={18} /> {formData.recurring ? "Setup Recurring Gift" : "Send Gift"}
                    </>
                )}
            </button>

            <button
                onClick={() => setStep("amount")}
                className="text-[#8da196] text-sm w-full text-center hover:text-[#e8fdf4]"
            >
                Back
            </button>
        </div>
    );

    const renderSuccessStep = () => (
        <div className="text-center space-y-6 animate-in zoom-in-50 duration-300">
            <div className="inline-flex p-4 rounded-full bg-[rgba(48,240,168,0.2)] text-[#30f0a8] mb-2">
                <Sparkles size={40} />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-[#e8fdf4] mb-2">Gift Ready! 🎁</h2>
                <p className="text-[#bfe8d7]">
                    You've sent <strong>${formData.amount} USDC</strong>
                    {formData.recurring && ` (${formData.frequency})`}
                </p>
            </div>

            <div className="bg-white p-4 rounded-xl w-fit mx-auto">
                <QRCodeSVG value={shareLink} size={180} />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-[#8da196]">Share this link with {formData.recipient || "the recipient"}:</p>
                <div className="flex items-center justify-center gap-2">
                    <code className="bg-[#1e2a24] px-3 py-2 rounded text-[#30f0a8] text-xs max-w-[200px] truncate">
                        {shareLink}
                    </code>
                    <button
                        onClick={() => navigator.clipboard.writeText(shareLink)}
                        className="p-2 rounded bg-[rgba(48,240,168,0.1)] text-[#30f0a8]"
                    >
                        <Check size={16} />
                    </button>
                </div>
            </div>

            <button
                onClick={() => router.push("/")}
                className="btn-secondary w-full"
            >
                Done
            </button>
        </div>
    );

    return (
        <div className="max-w-md mx-auto px-4 py-8">
            {step !== "success" && (
                <div className="mb-6 flex items-center justify-between text-[#8da196] text-sm">
                    <span>Send a Gift</span>
                    <span>Step {step === "amount" ? 1 : 2}/2</span>
                </div>
            )}

            {step === "amount" && renderAmountStep()}
            {step === "customize" && renderCustomizeStep()}
            {step === "success" && renderSuccessStep()}
        </div>
    );
}
