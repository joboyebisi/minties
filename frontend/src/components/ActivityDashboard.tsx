"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getWalletHistoryAction } from "@/app/actions/hypersync-actions";
import { ArrowUpRight, ArrowDownLeft, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string; // wei
    block_number?: number;
    timestamp?: number;
}

export function ActivityDashboard() {
    const { address } = useAccount();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!address) return;

        const load = async () => {
            setLoading(true);
            try {
                // Fetch from Envio HyperSync (via Server Action)
                const history = await getWalletHistoryAction(address);
                // Map to match interface if needed, Envio returns 'block_number' etc.
                const mapped = (history || []).map((tx: any) => ({
                    ...tx,
                    timestamp: tx.timestamp || Date.now() / 1000 // Fallback if Envio doesn't return timestamp for pending
                }));
                setTransactions(mapped as any);
            } catch (e) {
                console.error("Failed to load activity", e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [address]);

    const formatValue = (wei: string) => {
        try {
            const val = BigInt(wei);
            // Assuming USDC (6 decimals) or ETH (18). 
            // In a real app we'd map tokens. For MVP we assume most activity is relevant to our app.
            // Let's just show raw formatted for now or assume ETH/USDC based on value magnitude.
            return (Number(val) / 1e18).toFixed(4);
        } catch { return "0.00"; }
    };

    if (!address) return (
        <div className="text-center p-8 text-[#8da196]">
            Connect wallet to see activity.
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#e8fdf4] flex items-center gap-2">
                    <Clock size={20} className="text-[#30f0a8]" /> Activity History
                </h2>
                <span className="text-xs text-[#8da196]">Indexed by Envio</span>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 rounded-xl bg-[rgba(48,240,168,0.05)] animate-pulse" />
                    ))}
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-[#1e2a24] rounded-xl">
                    <p className="text-[#8da196]">No transactions found.</p>
                </div>
            ) : (
                <div className="grid gap-2">
                    {transactions.map(tx => {
                        const isIncoming = tx.to.toLowerCase() === address.toLowerCase();
                        return (
                            <div key={tx.hash} className="card p-3 flex justify-between items-center hover:bg-[rgba(48,240,168,0.02)] transition border border-[#1e2a24]">

                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${isIncoming ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {isIncoming ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#e8fdf4]">
                                            {isIncoming ? "Received" : "Sent"}
                                        </p>
                                        <p className="text-xs text-[#8da196]">
                                            {new Date((tx.timestamp || 0) * 1000).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm font-bold text-[#e8fdf4]">
                                        {formatValue(tx.value)} <span className="text-xs font-normal text-[#8da196]">ETH</span>
                                    </p>
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-[#30f0a8] hover:underline flex items-center justify-end gap-1"
                                    >
                                        View <ExternalLink size={8} />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
