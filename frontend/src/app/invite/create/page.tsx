"use client";

import { useState } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { setupSmartAccount, createInviteDelegation, encodeDelegation } from "@/lib/smart-account";
import { useToast } from "@/components/ToastProvider";
import { parseEther } from "viem";
import { Link2, Loader2, Share2, Copy } from "lucide-react";

export default function CreateInvitePage() {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { show } = useToast();

    const [loading, setLoading] = useState(false);
    const [inviteLink, setInviteLink] = useState("");
    const [amount, setAmount] = useState("0.001"); // Default amount in ETH (for gas)

    const handleCreateInvite = async () => {
        if (!address || !walletClient) {
            show("error", "Please connect your wallet");
            return;
        }

        setLoading(true);
        try {
            // 1. Setup Smart Account
            const { smartAccount } = await setupSmartAccount('hybrid');

            // 2. Create Delegation (0.001 ETH max spend)
            const amountWei = parseEther(amount);
            const delegation = await createInviteDelegation(smartAccount, amountWei);

            // 3. Encode logic
            const encoded = encodeDelegation(delegation);

            // 4. Generate URL
            const url = new URL(window.location.origin + '/invite/claim');
            url.searchParams.set('delegation', encoded);

            setInviteLink(url.toString());
            show("success", "Invite link generated!");
        } catch (error: any) {
            console.error(error);
            show("error", error.message || "Failed to create invite");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        show("success", "Copied to clipboard");
    };

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="max-w-md mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-[#e8fdf4]">Create Invite Link</h1>
                    <p className="text-sm text-[#bfe8d7]">
                        Share a link to onboard friends instantly. You pay the gas for their first transaction!
                    </p>
                </div>

                {!inviteLink ? (
                    <div className="card p-6 space-y-6 bg-[rgba(48,240,168,0.03)] border border-[#1e2a24]">
                        <div className="space-y-2">
                            <label className="text-sm text-[#bfe8d7]">Unsponsored Gas Amount (ETH)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-[#050908] border border-[#1e2a24] rounded-xl px-4 py-3 text-[#e8fdf4]"
                            />
                            <p className="text-xs text-[#8da196]">
                                This amount is delegated to the new user to pay for gas.
                            </p>
                        </div>

                        <button
                            onClick={handleCreateInvite}
                            disabled={loading}
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Link2 size={18} />}
                            Generate Link
                        </button>
                    </div>
                ) : (
                    <div className="card p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-3 bg-[rgba(48,240,168,0.1)] rounded-lg break-all text-xs text-[#30f0a8] font-mono border border-[#30f0a8]">
                            {inviteLink}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={copyToClipboard} className="btn-secondary py-2 flex items-center justify-center gap-2">
                                <Copy size={16} /> Copy
                            </button>
                            <button className="btn-primary py-2 flex items-center justify-center gap-2">
                                <Share2 size={16} /> Share
                            </button>
                        </div>
                        <p className="text-xs text-[#8da196] text-center">
                            Anyone with this link can claim the funds to start using Minties.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
