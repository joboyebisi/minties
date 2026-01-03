"use client";

import { useTelegram } from "@/hooks/useTelegram";
import { TelegramFeatures } from "@/components/TelegramFeatures";
import { ContactsList } from "@/components/ContactsList";
import { ShieldCheck, Workflow } from "lucide-react";

export default function TelegramPage() {
    const { user, isReady, isTelegram } = useTelegram();

    return (
        <div className="max-w-md mx-auto space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#e8fdf4] mb-1">Telegram Integration</h1>
                <p className="text-sm text-[#8da196]">Manage your connected experience.</p>
            </div>

            {/* Connection Status */}
            <div className="card p-4 border-[#30f0a8]/20 bg-[rgba(48,240,168,0.03)]">
                <h3 className="text-sm uppercase tracking-wider text-[#bfe8d7] mb-3 flex items-center gap-2">
                    <Workflow size={14} /> Connection Status
                </h3>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`relative w-2 h-2 rounded-full ${isReady ? "bg-[#30f0a8] shadow-[0_0_8px_#30f0a8]" : "bg-yellow-500"}`}>
                            {isReady && <div className="absolute inset-0 rounded-full bg-[#30f0a8] animate-ping opacity-50"></div>}
                        </div>
                        <div>
                            <p className="text-[#e8fdf4] font-medium text-sm">
                                {isTelegram ? "Connected to Telegram" : "Web Browser Mode"}
                            </p>
                            <p className="text-[#8da196] text-xs">
                                {user ? `Signed in as @${user.username || user.first_name}` : "Bot features limited"}
                            </p>
                        </div>
                    </div>
                    {isTelegram && (
                        <ShieldCheck size={18} className="text-[#30f0a8]" />
                    )}
                </div>
            </div>

            {/* Native Features */}
            <TelegramFeatures />

            {/* Saved Contacts */}
            <ContactsList />

        </div>
    );
}
