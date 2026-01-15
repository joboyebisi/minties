"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, PiggyBank, Building2, PieChart, Plus, Users, Wallet, ArrowRight, Check, Loader2, Info, TrendingUp, DollarSign } from "lucide-react";
import { useAccount, useSwitchChain, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { mantleSepoliaTestnet } from "wagmi/chains";
import { CONTRACTS } from "../../contracts/config";
import { formatEther, parseEther } from "viem";

export default function SavingsAssetsPage() {
    const [activeTab, setActiveTab] = useState<"circles" | "save-to-buy" | "fractional">("circles");
    const { address, chainId } = useAccount();
    const { switchChain } = useSwitchChain();

    const isMantle = chainId === mantleSepoliaTestnet.id;

    return (
        <div className="max-w-md mx-auto px-4 py-6 space-y-6 pb-24 text-[#e8fdf4]">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <Link href="/" className="p-2 rounded-full hover:bg-white/5 transition -ml-2">
                        <ArrowLeft size={20} className="text-[#8da196]" />
                    </Link>
                    <h1 className="text-xl font-bold">Savings & Assets</h1>
                </div>
                <p className="text-sm text-[#8da196] leading-relaxed">
                    Save with friends and earn yield through fractional ownership of premium real estate.
                </p>
            </div>

            {/* Network Warning for Mantle features */}
            {activeTab !== "circles" && !isMantle && (
                <div onClick={() => switchChain({ chainId: mantleSepoliaTestnet.id })} className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-between cursor-pointer hover:bg-yellow-500/20 transition">
                    <div className="flex items-center gap-2">
                        <Wallet size={16} className="text-yellow-500" />
                        <span className="text-xs text-yellow-200">Switch to Mantle Network for Assets</span>
                    </div>
                    <span className="text-xs font-bold text-yellow-500">Switch</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex p-1 bg-[#1e2a24]/50 rounded-xl border border-white/5">
                <button
                    onClick={() => setActiveTab("circles")}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex justify-center items-center gap-1 ${activeTab === "circles" ? "bg-[#30f0a8] text-[#0d1612] shadow-sm" : "text-[#8da196] hover:text-[#e8fdf4]"}`}
                >
                    <Users size={14} /> Circles
                </button>
                <button
                    onClick={() => setActiveTab("save-to-buy")}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex justify-center items-center gap-1 ${activeTab === "save-to-buy" ? "bg-[#30f0a8] text-[#0d1612] shadow-sm" : "text-[#8da196] hover:text-[#e8fdf4]"}`}
                >
                    <Building2 size={14} /> Save To Buy
                </button>
                <button
                    onClick={() => setActiveTab("fractional")}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex justify-center items-center gap-1 ${activeTab === "fractional" ? "bg-[#30f0a8] text-[#0d1612] shadow-sm" : "text-[#8da196] hover:text-[#e8fdf4]"}`}
                >
                    <PieChart size={14} /> My Assets
                </button>
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                {activeTab === "circles" && <CirclesTab />}
                {activeTab === "save-to-buy" && <SaveToBuyTab isMantle={isMantle} />}
                {activeTab === "fractional" && <FractionalAssetsTab isMantle={isMantle} address={address} />}
            </div>
        </div>
    );
}

// ... CirclesTab (Same) ...
function CirclesTab() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-[#8da196]">Join friends to reach goals faster.</p>
                <Link href="/circle/create" className="btn-primary py-2 px-3 text-xs flex items-center gap-1">
                    <Plus size={14} /> New Circle
                </Link>
            </div>
            <div className="card p-8 border-dashed border-[#1e2a24] bg-transparent flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-[#1e2a24] rounded-full text-[#30f0a8]">
                    <Users size={24} />
                </div>
                <div>
                    <h3 className="text-[#e8fdf4] font-medium mb-1">No Active Circles</h3>
                    <p className="text-xs text-[#8da196] max-w-[200px] mx-auto">Create a circle for a group trip, gift, or shared goal.</p>
                </div>
            </div>
        </div>
    );
}

// ... SaveToBuyTab (Same, but keeping here for completeness) ...
function SaveToBuyTab({ isMantle }: { isMantle: boolean }) {
    const { data: properties, isLoading } = useReadContracts({
        contracts: [0n, 1n, 2n].map(id => ({
            ...CONTRACTS.RealEstate,
            abi: CONTRACTS.RealEstate.abi as any,
            functionName: "properties",
            args: [id]
        })),
        query: { enabled: isMantle }
    });

    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [circleModalOpen, setCircleModalOpen] = useState(false);
    const [selectedProp, setSelectedProp] = useState<any>(null);

    // Flash Loan State
    const [flashLoading, setFlashLoading] = useState(false);
    const { writeContractAsync } = useWriteContract();
    const [flashTx, setFlashTx] = useState("");

    const handleBuyClick = (prop: any) => { setSelectedProp(prop); setBuyModalOpen(true); }
    const handleCircleClick = (prop: any) => { setSelectedProp(prop); setCircleModalOpen(true); }

    const executeFlashLoan = async () => {
        setFlashLoading(true);
        try {
            // Flash Loan Contract on Sepolia
            const FLASH_LOAN_ADDRESS = "0x83B32997B28062972EfE86f54D1C20a7eA322c7f";
            const USDC_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";

            // Minimal ABI for the function we added
            const abi = [{
                inputs: [
                    { name: "_token", type: "address" },
                    { name: "_amount", type: "uint256" }
                ],
                name: "fn_RequestFlashLoan",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function"
            }];

            const tx = await writeContractAsync({
                address: FLASH_LOAN_ADDRESS,
                abi: abi,
                functionName: "fn_RequestFlashLoan",
                args: [USDC_ADDRESS, BigInt(10 * 10 ** 6)], // Borrow 10 USDC (6 decimals)
            });
            setFlashTx(tx);
        } catch (e) {
            console.error("Flash Loan Error", e);
        } finally {
            setFlashLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {!isMantle && (
                <div className="card p-5 border border-indigo-500/20 bg-indigo-500/5 mb-6 relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h3 className="text-indigo-400 font-bold text-lg flex items-center gap-2"><DollarSign size={18} /> Aave Flash Loan Demo</h3>
                            <p className="text-xs text-[#8da196] mt-1 max-w-xs">Borrow 10 USDC without collateral on Sepolia network. (Requires contract to have gas fees pre-funded technically, but for demo we simulate call).</p>
                        </div>
                        <button
                            onClick={executeFlashLoan}
                            disabled={flashLoading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {flashLoading ? <Loader2 className="animate-spin" size={14} /> : "Execute Loan"}
                        </button>
                    </div>
                    {flashTx && (
                        <div className="mt-3 text-xs bg-black/20 p-2 rounded border border-indigo-500/20 text-indigo-300 font-mono truncate">
                            Tx: {flashTx}
                        </div>
                    )}
                </div>
            )}

            {!isMantle ? (
                <div className="text-center py-12 text-[#8da196] bg-white/5 rounded-2xl">Connect to Mantle to view assets.</div>
            ) : isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#30f0a8]" /></div>
            ) : properties ? (
                <div className="grid gap-6">
                    {properties.map((result: any, index: number) => {
                        if (result.status !== "success") return null;
                        const property = result.result;
                        return (
                            <div key={index} className="card p-0 overflow-hidden group border border-[#1e2a24] hover:border-[#30f0a8]/30 transition-all shadow-lg shadow-black/20">
                                <div className="h-40 bg-gray-800 relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={property[4] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"} alt="Prop" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1612] to-transparent opacity-80" />
                                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                                        <div>
                                            <span className="px-2 py-0.5 rounded bg-[#30f0a8] text-[#0d1612] text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">
                                                {formatEther(property[2]) > "0.1" ? "Luxury" : "Investment"}
                                            </span>
                                            <h4 className="text-lg text-[#e8fdf4] font-bold leading-tight">{property[1]}</h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-2 text-[#8da196]">
                                            <Info size={14} className="mt-0.5 shrink-0" />
                                            <div className="text-xs leading-relaxed line-clamp-2">{property[3]}</div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="block text-[#30f0a8] font-mono font-bold text-sm tracking-tight">{formatEther(property[8])} MNT</span>
                                            <span className="text-[10px] text-[#8da196] uppercase tracking-wide">per share</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center text-xs text-[#bfe8d7] mb-2 tracking-wide font-medium">
                                            <span>Market Progress</span>
                                            <span>{Number(property[7])} / {Number(property[6])} Sold</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-[#30f0a8] to-emerald-400" style={{ width: `${(Number(property[7]) / Number(property[6])) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button className="btn-secondary py-2.5 text-xs font-semibold" onClick={() => handleBuyClick(property)}>Buy Share</button>
                                        <button onClick={() => handleCircleClick(property)} className="btn-primary py-2.5 text-xs bg-gradient-to-r from-purple-500 to-indigo-500 border-none text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all font-semibold">Circle to Buy</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center text-[#8da196]">No properties found.</div>
            )}
            {buyModalOpen && selectedProp && <BuyShareModal property={selectedProp} onClose={() => setBuyModalOpen(false)} />}
            {circleModalOpen && selectedProp && <CircleBuyWizard propertyId={selectedProp[0]} propertyPrice={selectedProp[5]} onClose={() => setCircleModalOpen(false)} />}
        </div>
    );
}

// --- My Assets Logic ---

function FractionalAssetsTab({ isMantle, address }: { isMantle: boolean, address?: `0x${string}` }) {
    // 1. Fetch investments
    const { data: investmentsData, isLoading: investsLoading } = useReadContracts({
        contracts: [0n, 1n, 2n].map(id => ({
            ...CONTRACTS.RealEstate,
            abi: CONTRACTS.RealEstate.abi as any,
            functionName: "investments",
            args: [id, address],
        })),
        query: { enabled: !!address && isMantle }
    });

    // 2. Fetch properties (for price/name)
    const { data: propData } = useReadContracts({
        contracts: [0n, 1n, 2n].map(id => ({
            ...CONTRACTS.RealEstate,
            abi: CONTRACTS.RealEstate.abi as any, // Cast to any to avoid generic type mismatch
            functionName: "properties",
            args: [id],
        })),
        query: { enabled: isMantle }
    });

    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [selectedSellProp, setSelectedSellProp] = useState<any>(null);

    if (!isMantle) return <div className="text-center py-12 text-[#8da196] bg-white/5 rounded-2xl">Connect to Mantle.</div>;
    if (investsLoading || !investmentsData || !propData) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#30f0a8]" /></div>;

    // Process Data
    const myAssets = investmentsData.map((res: any, idx) => {
        if (res.status !== 'success' || !res.result) return null;
        // Investment: shares, amountPaid
        if (BigInt(res.result[0] as bigint) === 0n) return null; // No shares

        const propRes = propData[idx];
        if (propRes.status !== 'success') return null;

        const prop = propRes.result as any[]; // Cast result to any[]
        // Current Value
        const shares = BigInt(res.result[0] as bigint);
        const currentPrice = BigInt(prop[8] as bigint); // pricePerShare
        const currentValue = shares * currentPrice;

        return {
            id: prop[0],
            name: prop[1],
            shares: shares,
            value: currentValue,
            pricePerShare: currentPrice
        };
    }).filter(Boolean);

    const totalValue = myAssets.reduce((acc, a) => acc + (a?.value || 0n), 0n);

    const handleSell = (asset: any) => {
        setSelectedSellProp(asset);
        setSellModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="card p-5 flex items-center justify-between border-[#1e2a24] bg-gradient-to-br from-[#0d1612] to-[#1e2a24] shadow-xl">
                <div>
                    <p className="text-[10px] text-[#8da196] uppercase tracking-wider font-bold mb-1">Portfolio Value</p>
                    <p className="text-3xl font-bold text-[#e8fdf4] tracking-tight font-mono">{formatEther(totalValue)} MNT</p>
                </div>
                <div className="p-3 bg-[#30f0a8]/10 rounded-full text-[#30f0a8] border border-[#30f0a8]/20">
                    <TrendingUp size={24} />
                </div>
            </div>

            {myAssets.length === 0 ? (
                <div className="text-center py-16 bg-[#1e2a24]/30 rounded-2xl border border-dashed border-[#1e2a24]">
                    <p className="text-[#8da196] text-sm mb-2">You don't own any fractional assets yet.</p>
                    <button className="text-[#30f0a8] text-xs font-bold uppercase tracking-wider hover:underline">Explore 'Save To Buy'</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* @ts-ignore */}
                    {myAssets.map((asset: any) => (
                        <div key={asset.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center hover:bg-white/10 transition">
                            <div>
                                <h4 className="text-[#e8fdf4] font-bold">{asset.name}</h4>
                                <div className="text-xs text-[#8da196] mt-1 flex gap-3">
                                    <span>{Number(asset.shares)} Shares</span>
                                    <span className="text-[#30f0a8]">{formatEther(asset.value)} MNT</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSell(asset)}
                                className="px-3 py-1.5 bg-[#ff4d4d]/10 text-[#ff4d4d] rounded-lg text-xs font-bold hover:bg-[#ff4d4d]/20 transition"
                            >
                                Sell
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {sellModalOpen && selectedSellProp && (
                <SellShareModal asset={selectedSellProp} onClose={() => setSellModalOpen(false)} />
            )}
        </div>
    );
}

// ... BuyShareModal & CircleBuyWizard (Same) ...
// Included implicitly if not changed, but I will rewrite full file for safety or assume context?
// Re-adding them below for content integrity.

function BuyShareModal({ property, onClose }: { property: any, onClose: () => void }) {
    const [shares, setShares] = useState(1);
    const pricePerShare = property[8];
    const totalCost = BigInt(Math.floor(shares)) * pricePerShare;
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleBuy = () => {
        writeContract({
            ...CONTRACTS.RealEstate,
            functionName: "buyShare",
            args: [property[0], BigInt(shares)],
            value: totalCost
        });
    };

    useEffect(() => { if (isSuccess) setTimeout(() => onClose(), 2000); }, [isSuccess]);

    if (isSuccess) return <SuccessModal message={`Bought ${shares} shares of ${property[1]}`} />;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 animate-in fade-in duration-200 backdrop-blur-sm">
            <div className="bg-[#0d1612] border-t sm:border border-[#1e2a24] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm space-y-6 shadow-2xl">
                <div className="flex justify-between items-start">
                    <div><h3 className="text-lg font-bold text-[#e8fdf4]">Buy Shares</h3><p className="text-xs text-[#8da196]">{property[1]}</p></div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition"><ArrowLeft size={18} className="rotate-180 text-[#8da196]" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-[#8da196] font-medium block mb-2">Number of Shares</label>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShares(Math.max(1, shares - 1))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#e8fdf4] font-bold text-lg transition">-</button>
                            <div className="flex-1 h-10 bg-black/40 rounded-xl flex items-center justify-center text-[#30f0a8] font-mono font-bold text-xl border border-white/5">{shares}</div>
                            <button onClick={() => setShares(shares + 1)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#e8fdf4] font-bold text-lg transition">+</button>
                        </div>
                    </div>
                    <div className="bg-[#1e2a24]/50 p-4 rounded-xl border border-[#1e2a24] space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-[#8da196]">Price per Share</span><span className="text-[#e8fdf4] font-mono">{formatEther(pricePerShare)} MNT</span></div>
                        <div className="h-px bg-white/5 w-full" />
                        <div className="flex justify-between items-center pt-1"><span className="text-[#8da196] text-sm">Total Cost</span><span className="text-[#30f0a8] font-bold font-mono text-lg">{formatEther(totalCost)} MNT</span></div>
                    </div>
                    <button onClick={handleBuy} disabled={isPending || isConfirming} className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2">{(isPending || isConfirming) && <Loader2 className="animate-spin" size={16} />}{isPending ? "Confirming..." : isConfirming ? "Processing..." : "Confirm Purchase"}</button>
                </div>
            </div>
        </div>
    );
}

function SellShareModal({ asset, onClose }: { asset: any, onClose: () => void }) {
    const [shares, setShares] = useState(1);
    const payout = BigInt(shares) * asset.pricePerShare;
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleSell = () => {
        writeContract({
            ...CONTRACTS.RealEstate,
            functionName: "sellShare",
            args: [asset.id, BigInt(shares)]
        });
    };

    useEffect(() => { if (isSuccess) setTimeout(() => onClose(), 2000); }, [isSuccess]);

    if (isSuccess) return <SuccessModal message={`Sold ${shares} shares of ${asset.name}`} />;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 animate-in fade-in duration-200 backdrop-blur-sm">
            <div className="bg-[#0d1612] border-t sm:border border-[#1e2a24] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm space-y-6 shadow-2xl">
                <div className="flex justify-between items-start">
                    <div><h3 className="text-lg font-bold text-[#e8fdf4]">Sell Shares</h3><p className="text-xs text-[#8da196]">{asset.name}</p></div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition"><ArrowLeft size={18} className="rotate-180 text-[#8da196]" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-[#8da196] font-medium block mb-2">Shares to Sell (Max: {Number(asset.shares)})</label>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShares(Math.max(1, shares - 1))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#e8fdf4] font-bold text-lg transition">-</button>
                            <div className="flex-1 h-10 bg-black/40 rounded-xl flex items-center justify-center text-[#30f0a8] font-mono font-bold text-xl border border-white/5">{shares}</div>
                            <button onClick={() => setShares(Math.min(Number(asset.shares), shares + 1))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#e8fdf4] font-bold text-lg transition">+</button>
                        </div>
                    </div>
                    <div className="bg-[#1e2a24]/50 p-4 rounded-xl border border-[#1e2a24] space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-[#8da196]">Price per Share</span><span className="text-[#e8fdf4] font-mono">{formatEther(asset.pricePerShare)} MNT</span></div>
                        <div className="h-px bg-white/5 w-full" />
                        <div className="flex justify-between items-center pt-1"><span className="text-[#8da196] text-sm">You Receive</span><span className="text-[#30f0a8] font-bold font-mono text-lg">{formatEther(payout)} MNT</span></div>
                    </div>
                    <button onClick={handleSell} disabled={isPending || isConfirming} className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 bg-[#ff4d4d]/10 text-[#ff4d4d] hover:bg-[#ff4d4d]/20 border border-[#ff4d4d]/20">{(isPending || isConfirming) && <Loader2 className="animate-spin" size={16} />}{isPending ? "Confirming..." : isConfirming ? "Processing..." : "Confirm Sell"}</button>
                </div>
            </div>
        </div>
    );
}

function SuccessModal({ message }: { message: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-[#1e2a24] rounded-2xl p-6 w-full max-w-sm text-center space-y-4 shadow-2xl border border-[#30f0a8]/20">
                <div className="w-16 h-16 bg-[#30f0a8]/10 rounded-full flex items-center justify-center mx-auto text-[#30f0a8] animate-in zoom-in duration-300">
                    <Check size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#e8fdf4]">Success!</h3>
                <p className="text-[#8da196]">{message}</p>
            </div>
        </div>
    )
}

function CircleBuyWizard({ propertyId, propertyPrice, onClose }: { propertyId: bigint, propertyPrice: bigint, onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [myEquity, setMyEquity] = useState(50); // Percent
    const [members, setMembers] = useState<{ name: string, address: string, equity: number }[]>([]);

    // Form States
    const [newName, setNewName] = useState("");
    const [newAddr, setNewAddr] = useState("");
    const [newEq, setNewEq] = useState(25);

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const totalEquity = myEquity + members.reduce((acc, m) => acc + m.equity, 0);

    const handleAddMember = () => {
        if (!newName || !newAddr) return;
        setMembers([...members, { name: newName, address: newAddr, equity: newEq }]);
        setNewName(""); setNewAddr("");
    };

    const { address } = useAccount();

    const deployGroup = () => {
        if (!address) return;
        const memberAddrs = [address, ...members.map(m => m.address)];
        const equities = [myEquity * 100, ...members.map(m => m.equity * 100)];
        writeContract({
            ...CONTRACTS.AssetGroupFactory,
            functionName: "createGroup",
            args: [propertyId, 100n, memberAddrs as `0x${string}`[], equities.map(e => BigInt(e))]
        });
    };

    useEffect(() => { if (isSuccess) setTimeout(() => onClose(), 2000); }, [isSuccess]);

    if (isSuccess) return <SuccessModal message="Group Circle Created! Invite friends to contribute." />;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
            <div className="bg-[#0d1612] border border-[#1e2a24] rounded-2xl p-6 w-full max-w-sm space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#e8fdf4]">
                        {step === 1 ? "My Share" : step === 2 ? "Add Friends" : "Review"}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition"><ArrowLeft size={18} className="rotate-180 text-[#8da196]" /></button>
                </div>
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <p className="text-sm text-[#8da196]">How much of the asset do you want to own?</p>
                            <div className="py-6 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-4xl font-bold text-[#30f0a8] text-center tracking-tight">{myEquity}%</div>
                                <div className="text-xs text-[#8da196] text-center mt-1 uppercase tracking-wide">Equity Share</div>
                            </div>
                        </div>
                        <input type="range" min="1" max="100" value={myEquity} onChange={(e) => setMyEquity(Number(e.target.value))} className="w-full h-2 bg-[#1e2a24] rounded-lg appearance-none cursor-pointer accent-[#30f0a8]" />
                        <button onClick={() => setStep(2)} className="btn-primary w-full py-3.5 text-sm font-semibold">Next: Add Friends</button>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-5">
                        <div className="flex justify-between text-sm font-medium bg-[#1e2a24]/50 p-3 rounded-lg"><span className="text-[#8da196]">Total Equity Assigned</span><span className={totalEquity === 100 ? "text-[#30f0a8]" : "text-yellow-500"}>{totalEquity}%</span></div>
                        <div className="space-y-2">
                            <div className="flex justify-between bg-white/5 p-3 rounded-lg text-sm border border-transparent hover:border-white/10 transition"><span className="text-[#e8fdf4] font-medium">You</span><span className="text-[#30f0a8] font-mono">{myEquity}%</span></div>
                            {members.map((m, i) => (<div key={i} className="flex justify-between bg-white/5 p-3 rounded-lg text-sm border border-transparent hover:border-white/10 transition"><span className="text-[#e8fdf4] font-medium">{m.name}</span><span className="text-[#30f0a8] font-mono">{m.equity}%</span></div>))}
                        </div>
                        {totalEquity < 100 && (
                            <div className="border-t border-white/10 pt-4 space-y-3">
                                <input placeholder="Friend Name (e.g. Alice)" className="input-field text-sm" value={newName} onChange={e => setNewName(e.target.value)} />
                                <input placeholder="Wallet Address (0x...)" className="input-field text-sm" value={newAddr} onChange={e => setNewAddr(e.target.value)} />
                                <div className="flex items-center gap-2"><input type="number" className="input-field text-sm w-24" value={newEq} onChange={e => setNewEq(Number(e.target.value))} /><span className="text-[#8da196] text-sm">% Equity</span></div>
                                <button onClick={handleAddMember} className="btn-secondary w-full py-2.5 text-xs font-semibold">Add Member</button>
                            </div>
                        )}
                        <div className="flex gap-3 pt-2"><button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 text-sm">Back</button><button onClick={() => setStep(3)} disabled={totalEquity !== 100} className="btn-primary flex-1 py-3 disabled:opacity-50 text-sm font-semibold">Review</button></div>
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-5">
                        <div className="bg-[#1e2a24]/50 border border-[#1e2a24] p-5 rounded-2xl space-y-3">
                            <div className="flex justify-between text-sm"><span className="text-[#8da196]">Group Size</span><span className="text-[#e8fdf4] font-medium">{members.length + 1} People</span></div>
                            <div className="h-px bg-white/5" /><div className="flex justify-between text-sm"><span className="text-[#8da196]">Total Cost</span><span className="text-[#30f0a8] font-mono font-bold">{(Number(formatEther(propertyPrice)) * 100).toFixed(4)} MNT</span></div>
                        </div>
                        <button onClick={deployGroup} disabled={isPending || isConfirming} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 border-none text-sm font-bold shadow-lg shadow-purple-500/20">{(isPending || isConfirming) && <Loader2 className="animate-spin" size={16} />}{isPending ? "Confirming..." : isConfirming ? "Deploying..." : "Create Circle & Deploy"}</button>
                        <button onClick={() => setStep(2)} className="text-xs text-[#8da196] w-full hover:text-white py-2">Back</button>
                    </div>
                )}
            </div>
        </div>
    );
}
