"use client";

import { useState } from "react";
import { UserProfile, updateProfile } from "@/lib/supabase";
import { useAccount } from "wagmi";
import { X, User, Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface ProfileModalProps {
    currentName?: string;
    onClose: () => void;
    onUpdate: (profile: UserProfile) => void;
}

export function ProfileModal({ currentName, onClose, onUpdate }: ProfileModalProps) {
    const { address } = useAccount();
    const { show } = useToast();
    const [name, setName] = useState(currentName || "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!address) return;
        if (!name.trim()) {
            show("error", "Name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            const updated = await updateProfile(address, { display_name: name });
            if (updated) {
                onUpdate(updated);
                show("success", "Profile updated successfully");
                onClose();
            } else {
                throw new Error("Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            show("error", "Failed to save profile. Database might not be connected.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm bg-[#0a0f0d] border border-[#1e2a24] rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
                <div className="p-4 border-b border-[#1e2a24] flex justify-between items-center bg-[#0f1613]">
                    <h3 className="text-[#e8fdf4] font-semibold flex items-center gap-2">
                        <User size={18} className="text-[#30f0a8]" /> Edit Profile
                    </h3>
                    <button onClick={onClose} className="text-[#8da196] hover:text-[#e8fdf4] transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-[#bfe8d7]">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full bg-[#050908] border border-[#1e2a24] rounded-xl px-4 py-3 text-[#e8fdf4] placeholder:text-[#2d3f36] focus:outline-none focus:border-[#30f0a8] transition"
                            autoFocus
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
