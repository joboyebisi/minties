"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

// Reuse the hook or logic from UserDashboard eventually, but for now duplicate roughly
// ideally refactor useUserItems to a shared hook file.
// It WAS defined in UserDashboard.tsx locally. I should extract it or copy it.
// I'll copy the logic for speed and robustness here.

type MoneyBox = { id: string; title: string; progress: number; target: number };

export default function MoneyBoxListPage() {
    const { address } = useAccount();
    const [boxes, setBoxes] = useState<MoneyBox[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // 1. Local
                const { getAllItems } = await import("@/lib/local-db");
                const localData = getAllItems();
                let loadedBoxes: any[] = localData?.moneyBoxes || [];

                // 2. DB
                if (address) {
                    try {
                        const { getUserMoneyBoxes } = await import("@/lib/supabase");
                        const dbBoxes = await getUserMoneyBoxes(address);
                        if (dbBoxes && dbBoxes.length > 0) loadedBoxes = dbBoxes;
                    } catch (e) {
                        console.error("DB Error", e);
                    }
                }
                setBoxes(loadedBoxes);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [address]);

    return (
        <div className="max-w-md mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Link href="/" className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition text-[#8da196]">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-[#e8fdf4]">My Goals</h1>
                </div>
                <Link href="/moneybox/create" className="btn-primary py-2 px-3 text-xs flex items-center gap-1">
                    <Plus size={16} /> New Goal
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12 text-[#8da196]">Loading goals...</div>
            ) : boxes.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#1e2a24] rounded-xl">
                    <div className="w-12 h-12 bg-[rgba(48,240,168,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
                        <Target className="text-[#30f0a8]" />
                    </div>
                    <h3 className="text-[#e8fdf4] font-semibold mb-1">No goals yet</h3>
                    <p className="text-[#8da196] text-sm mb-4">Start saving for your dreams today.</p>
                    <Link href="/moneybox/create" className="btn-primary inline-flex items-center gap-2">
                        Create Goal
                    </Link>
                </div>
            ) : (
                <div className="grid gap-3">
                    {boxes.map(box => (
                        <Link href={`/moneybox/${box.id}`} key={box.id} className="card p-4 hover:bg-[rgba(48,240,168,0.05)] transition border border-[#1e2a24] flex items-center justify-between group">
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-[#e8fdf4] group-hover:text-[#30f0a8] transition">{box.title}</h3>
                                    <span className="text-xs text-[#8da196] font-mono">{(box.progress || 0).toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-2 bg-[rgba(48,240,168,0.1)] rounded-full overflow-hidden mb-1">
                                    <div className="h-full bg-[#30f0a8]" style={{ width: `${box.progress || 0}%` }} />
                                </div>
                                <div className="flex justify-between text-xs text-[#8da196]">
                                    <span>Target: {box.target} USDC</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
