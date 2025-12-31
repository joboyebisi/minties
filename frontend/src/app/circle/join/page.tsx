"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";

export default function JoinCircleEntryPage() {
    const router = useRouter();
    const [circleId, setCircleId] = useState("");

    const handleGo = () => {
        if (circleId.trim()) {
            router.push(`/circle/${circleId.trim()}`);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
            <h1 className="text-2xl font-bold text-[#e8fdf4]">Join a Circle</h1>
            <p className="text-[#bfe8d7]">Enter the Circle ID shared by your friend.</p>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8da196]" size={20} />
                <input
                    type="text"
                    placeholder="Paste Circle ID (0x...)"
                    className="input w-full pl-10 pr-12"
                    value={circleId}
                    onChange={e => setCircleId(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGo()}
                />
                <button
                    onClick={handleGo}
                    disabled={!circleId}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded bg-[rgba(48,240,168,0.1)] text-[#30f0a8] disabled:opacity-50"
                >
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}
