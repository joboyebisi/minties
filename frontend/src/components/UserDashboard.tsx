"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { PiggyBank, Target, Gift, Clock, Plus, ArrowRight } from "lucide-react";
import { useWalletReady } from "@/hooks/useWalletReady";
import { PermissionGuard } from "./PermissionGuard";

// Mock data helpers (replace with real hooks in future)
const useUserItems = () => {
    // In a real app we'd fetch this from backend/indexer
    return {
        moneyBoxes: [
            { id: "new", title: "Dream Vacation", progress: 17, target: 2000 }
        ],
        circles: [],
        gifts: []
    };
};

export function UserDashboard() {
    const { address } = useAccount();
    const { moneyBoxes, circles } = useUserItems();
    const router = useRouter();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-[#e8fdf4]">Welcome back!</h2>
                <p className="text-sm text-[#bfe8d7] font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <QuickAction icon={<Target size={20} />} label="New Goal" href="/moneybox/create" color="text-[#30f0a8]" />
                <QuickAction icon={<Gift size={20} />} label="Send Gift" href="/gift/send" color="text-[#30f0a8]" />
                <QuickAction icon={<PiggyBank size={20} />} label="New Circle" href="/circle/create" color="text-[#30f0a8]" />
                <QuickAction icon={<Clock size={20} />} label="Activity" href="/" color="text-[#8da196]" />
            </div>

            {/* My MoneyBoxes */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#e8fdf4] flex items-center gap-2">
                        <Target size={18} className="text-[#30f0a8]" /> My Goals
                    </h3>
                    <Link href="/moneybox/create" className="text-xs text-[#30f0a8] hover:underline flex items-center gap-1">
                        Create <Plus size={14} />
                    </Link>
                </div>

                <div className="grid gap-3">
                    {moneyBoxes.map(box => (
                        <Link href={`/moneybox/${box.id}`} key={box.id} className="card p-4 hover:bg-[rgba(48,240,168,0.05)] transition border border-[#1e2a24]">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-[#e8fdf4]">{box.title}</span>
                                <span className="text-xs text-[#8da196]">{box.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-[rgba(48,240,168,0.1)] rounded-full overflow-hidden">
                                <div className="h-full bg-[#30f0a8]" style={{ width: `${box.progress}%` }} />
                            </div>
                        </Link>
                    ))}
                    {moneyBoxes.length === 0 && (
                        <div className="text-center p-6 border border-dashed border-[#1e2a24] rounded-xl">
                            <p className="text-[#8da196] text-sm mb-2">No active goals yet.</p>
                            <Link href="/moneybox/create" className="btn-secondary text-xs">Create your first goal</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* My Circles */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#e8fdf4] flex items-center gap-2">
                        <PiggyBank size={18} className="text-[#30f0a8]" /> Savings Circles
                    </h3>
                    <Link href="/circle/create" className="text-xs text-[#30f0a8] hover:underline flex items-center gap-1">
                        Create <Plus size={14} />
                    </Link>
                </div>

                <div className="grid gap-3">
                    {circles.length === 0 ? (
                        <div className="text-center p-6 border border-dashed border-[#1e2a24] rounded-xl flex flex-col items-center gap-2">
                            <p className="text-[#8da196] text-sm">Save with friends and earn yield.</p>
                            <div className="flex gap-2">
                                <Link href="/circle/create" className="btn-primary text-xs py-2 px-3">Start Circle</Link>
                                <Link href="/circle/join" className="btn-secondary text-xs py-2 px-3">Join Existing</Link>
                            </div>
                        </div>
                    ) : (
                        <p>Circles list...</p>
                    )}
                </div>
            </div>

            {/* Smart Features Status */}
            <PermissionGuard fallback={
                <div className="card p-4 bg-[rgba(255,193,7,0.05)] border border-[#ffc107]">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-semibold text-[#ffc107] text-sm">Enable Smart Features</h4>
                            <p className="text-xs text-[#bfe8d7]">For recurring gifts & auto-save features.</p>
                        </div>
                        {/* The guard typically wraps a distinct button, here we just show info if fallback */}
                    </div>
                </div>
            }>
                <div className="card p-3 bg-[rgba(48,240,168,0.05)] border border-[#1e2a24] flex items-center justify-between">
                    <span className="text-sm text-[#e8fdf4] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#30f0a8]" /> Smart Account Active
                    </span>
                    <span className="text-xs text-[#8da196]">Ready for recurring logic</span>
                </div>
            </PermissionGuard>

        </div>
    );
}

function QuickAction({ icon, label, href, color }: { icon: any, label: string, href: string, color: string }) {
    return (
        <Link href={href} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[rgba(48,240,168,0.02)] border border-[#1e2a24] hover:bg-[rgba(48,240,168,0.08)] transition">
            <div className={`p-2 rounded-full bg-[rgba(48,240,168,0.1)] ${color}`}>
                {icon}
            </div>
            <span className="text-xs font-medium text-[#e8fdf4]">{label}</span>
        </Link>
    );
}
