"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { setupSmartAccount } from "@/lib/smart-account";
import { useToast } from "./ToastProvider";
import { ShieldAlert } from "lucide-react";

interface PermissionGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export function PermissionGuard({ children, fallback }: PermissionGuardProps) {
    const { isConnected, address } = useAccount();
    const { show } = useToast();
    const [isSmartAccount, setIsSmartAccount] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isConnected && address) {
            checkSmartAccount();
        } else {
            setIsSmartAccount(false);
        }
    }, [isConnected, address]);

    const checkSmartAccount = async () => {
        try {
            // In a real app we would check if the connected address matches a known Smart Account
            // or check code at address. For now, we'll try to initialize one or check connection
            // This is a simplified check
            // const { type } = await setupSmartAccount();
            // setIsSmartAccount(true); 

            // MOCK for development: Assume if connected, we can upgrade/use it
            // In reality, we need to check if upgraded
            setIsSmartAccount(true);
        } catch (e) {
            console.error("Smart Account check failed", e);
            setIsSmartAccount(false);
        }
    };

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const { smartAccount } = await setupSmartAccount('hybrid');
            show("success", "Account upgraded to Smart Account!");
            setIsSmartAccount(true);
        } catch (e: any) {
            console.error("Upgrade failed", e);
            show("error", e.message || "Failed to upgrade account");
        } finally {
            setLoading(false);
        }
    };

    if (isSmartAccount === null) {
        return <div className="animate-pulse h-20 bg-[rgba(48,240,168,0.05)] rounded-lg"></div>;
    }

    if (isSmartAccount) {
        return <>{children}</>;
    }

    return fallback || (
        <div className="p-6 rounded-xl border border-[#1e2a24] bg-[rgba(10,15,13,0.6)] text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-[rgba(48,240,168,0.1)] text-[#30f0a8]">
                <ShieldAlert size={24} />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-[#e8fdf4]">Smart Account Required</h3>
                <p className="text-sm text-[#bfe8d7] max-w-xs mx-auto mt-2">
                    This feature requires a MetaMask Smart Account to enable recurring transfers and advanced security.
                </p>
            </div>
            <button
                onClick={handleUpgrade}
                disabled={loading}
                className="btn-primary w-full sm:w-auto"
            >
                {loading ? "Upgrading..." : "Enable Smart Features"}
            </button>
        </div>
    );
}
