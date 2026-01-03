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

                <a
                    href="https://t.me/Minties_X_Bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#24A1DE] hover:bg-[#208bbf] text-white font-semibold transition shadow-lg shadow-[#24A1DE]/20"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-current">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm5.849 8.16l-1.994 9.4c-.15.68-.698.85-1.41.53l-3.904-2.88-1.886 1.815c-.207.208-.382.383-.783.383l.28-3.974 7.237-6.538c.314-.28-.068-.435-.487-.156l-8.94 5.626-3.854-1.205c-.838-.262-.852-.835.174-1.237l15.048-5.795c.698-.253 1.309.155 1.519 1.031z" />
                    </svg>
                    Open Bot
                </a>
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
