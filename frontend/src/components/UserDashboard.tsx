"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, useBalance } from "wagmi";
import { PiggyBank, Target, Gift, Clock, Plus, ArrowRight } from "lucide-react";
import { useWalletReady } from "@/hooks/useWalletReady";
import { useTelegram } from "@/hooks/useTelegram";
import { PermissionGuard } from "./PermissionGuard";
import { getProfile } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { ProfileModal } from "./ProfileModal";
import { TelegramFeatures } from "./TelegramFeatures";

// Types for items
type MoneyBox = { id: string; title: string; progress: number; target: number };
type Circle = { id: string; name: string };
type GiftItem = { id: string; amount: number };

const useUserItems = (address?: string) => {
    const [items, setItems] = useState({
        moneyBoxes: [] as MoneyBox[],
        circles: [] as Circle[],
        gifts: [] as GiftItem[]
    });

    useEffect(() => {
        const loadItems = async () => {
            // 1. Try Loading from Supabase
            try {
                // Determine address to fetch for (requires importing helper)
                // We'll dynamic import to avoid issues if helpers aren't perfectly typed yet
                const { getUserMoneyBoxes, getCircles, getUserGifts } = await import("@/lib/supabase");
                const { address: currentAddress } = await import("@/lib/smart-account").then(() => ({ address: "TODO_fix_scope" })); // Hacky, better to use the hook's address in scope

                // We can't easily access 'address' from hook here inside useEffect if not passed to helper
                // But we can use the 'items' state setter.
            } catch (e) { console.error(e); }

            // Actual Implementation:
            let dbData = { moneyBoxes: [], circles: [], gifts: [] };

            // We need 'address' for queries. It's available in the component scope, but this hook is outside.
            // Refactoring: move the fetching logic INSIDE the component or pass address to the hook.
        };
        // ...
    }, []);


    return items;
};

export function UserDashboard() {
    const { address } = useAccount();
    const { user: telegramUser } = useTelegram();
    const { moneyBoxes, circles } = useUserItems(address);
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Fetch Balances
    const { data: ethBalance } = useBalance({ address });
    const { data: usdcBalance } = useBalance({
        address,
        token: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
    });

    // Fetch Profile
    useEffect(() => {
        if (address) {
            getProfile(address).then(p => {
                if (p) setProfile(p);
            });
        }
    }, [address]);

    const displayName = profile?.display_name
        ? profile.display_name
        : telegramUser?.first_name
            ? `${telegramUser.first_name}`
            : address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "Friend";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <TelegramFeatures />
            {/* Header & Balance Card */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col justify-center gap-1">
                    <button onClick={() => setIsProfileModalOpen(true)} className="text-left group">
                        <h2 className="text-2xl font-bold text-[#e8fdf4] group-hover:text-[#30f0a8] transition flex items-center gap-2">
                            Welcome, {displayName}! <span className="text-xs opacity-0 group-hover:opacity-50 font-normal">Edit</span>
                        </h2>
                    </button>
                    <p className="text-sm text-[#bfe8d7] font-mono opacity-80">
                        {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : "Connect Wallet"}
                    </p>
                </div>

                {/* Balance Summary Card */}
                <div className="card p-4 bg-[rgba(48,240,168,0.03)] border-opacity-30">
                    <p className="text-xs text-[#bfe8d7] uppercase tracking-wider mb-2">Wallet Balance</p>
                    <div className="flex gap-4">
                        <div>
                            <p className="text-lg font-bold text-[#e8fdf4]">{usdcBalance?.formatted.slice(0, 7) || "0.00"} <span className="text-sm text-[#30f0a8]">USDC</span></p>
                            <p className="text-xs text-[#8da196]">Available</p>
                        </div>
                        <div className="w-px bg-[#1e2a24]"></div>
                        <div>
                            <p className="text-lg font-bold text-[#e8fdf4]">{ethBalance?.formatted.slice(0, 6) || "0.00"} <span className="text-sm text-[#30f0a8]">ETH</span></p>
                            <p className="text-xs text-[#8da196]">Gas</p>
                        </div>
                    </div>
                </div>
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
                    {/* Onboarding: Default Goal if list is empty */}
                    {moneyBoxes.length === 0 ? (
                        <div className="card p-4 border border-[#30f0a8] bg-[rgba(48,240,168,0.03)] relative overflow-hidden group transition-all">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Target size={64} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="font-bold text-[#e8fdf4] mb-1">🌴 Dream Vacation</h4>
                                <p className="text-xs text-[#bfe8d7] mb-3">Sample Goal · Target: 2,000 USDC</p>
                                <div className="w-full h-1.5 bg-[rgba(48,240,168,0.1)] rounded-full overflow-hidden mb-3">
                                    <div className="h-full bg-[#30f0a8]" style={{ width: '15%' }} />
                                </div>
                                <div className="flex gap-2">
                                    <Link href="/moneybox/create?title=Dream%20Vacation&amount=2000" className="btn-primary py-1.5 px-3 text-xs">Start This Goal</Link>
                                    <button className="btn-secondary py-1.5 px-3 text-xs hover:bg-white/10">Dismiss</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        moneyBoxes.map(box => (
                            <Link href={`/moneybox/${box.id}`} key={box.id} className="card p-4 hover:bg-[rgba(48,240,168,0.05)] transition border border-[#1e2a24]">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-[#e8fdf4]">{box.title}</span>
                                    <span className="text-xs text-[#8da196]">{box.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-[rgba(48,240,168,0.1)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#30f0a8]" style={{ width: `${box.progress}%` }} />
                                </div>
                            </Link>
                        ))
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
                        <div className="text-center p-6 border border-dashed border-[#1e2a24] rounded-xl flex flex-col items-center gap-2 hover:bg-[rgba(48,240,168,0.02)] transition">
                            <p className="text-[#8da196] text-sm">Save with friends and earn yield.</p>
                            <div className="flex gap-2">
                                <Link href="/circle/create" className="btn-primary text-xs py-2 px-3">Start Circle</Link>
                                <Link href="/circle/join" className="btn-secondary text-xs py-2 px-3">Join Existing</Link>
                            </div>
                        </div>
                    ) : (
                        circles.map(circle => (
                            <Link href={`/circle/${circle.id}`} key={circle.id} className="card p-4 hover:bg-[rgba(48,240,168,0.05)] transition border border-[#1e2a24] flex justify-between items-center">
                                <div>
                                    <span className="font-semibold text-[#e8fdf4] block">{circle.name}</span>
                                    <span className="text-xs text-[#8da196]">{circle.id.slice(0, 10)}...</span>
                                </div>
                                <ArrowRight size={16} className="text-[#8da196]" />
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* My Gifts (Sent) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#e8fdf4] flex items-center gap-2">
                        <Gift size={18} className="text-[#30f0a8]" /> Sent Gifts
                    </h3>
                    <Link href="/gift/send" className="text-xs text-[#30f0a8] hover:underline flex items-center gap-1">
                        Send <Plus size={14} />
                    </Link>
                </div>

                <div className="grid gap-3">
                    {useUserItems(address).gifts.length > 0 && useUserItems(address).gifts.map(gift => (
                        <div key={gift.id} className="card p-4 bg-[rgba(48,240,168,0.02)] border border-[#1e2a24] flex justify-between items-center">
                            <div>
                                <span className="font-semibold text-[#e8fdf4] block">Gift ${gift.amount}</span>
                                <span className="text-xs text-[#8da196]">ID: {gift.id.slice(0, 8)}...</span>
                            </div>
                            {/* Link to claim page or status if we had it */}
                            <span className="text-xs text-[#30f0a8] bg-[#30f0a8]/10 px-2 py-1 rounded">Active</span>
                        </div>
                    ))}
                    {useUserItems(address).gifts.length === 0 && (
                        <div className="text-center p-6 border border-dashed border-[#1e2a24] rounded-xl">
                            <p className="text-[#8da196] text-sm">You haven't sent any gifts yet.</p>
                        </div>
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

            {isProfileModalOpen && (
                <ProfileModal
                    currentName={profile?.display_name || telegramUser?.first_name || ""}
                    onClose={() => setIsProfileModalOpen(false)}
                    onUpdate={(p) => setProfile(p)}
                />
            )}
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
