"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Phone, Wallet } from "lucide-react";

interface TelegramContact {
    telegram_user_id: number;
    first_name: string;
    last_name?: string;
    phone_number: string;
    wallet_address?: string;
}

export function ContactsList() {
    const [contacts, setContacts] = useState<TelegramContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContacts = async () => {
            // In a real app, this should filter by the *current user's* contacts.
            // Since we haven't implemented a "user_contacts" join table yet, 
            // we will show ALL synced contacts for Demo purposes, or mock it if empty.
            // If you are using RLS policies properly, this might return nothing if not auth'd.
            // But contacts table is usually public read based on our migration (or filtered).

            // For this MVP, we just fetch all to show the feature works (assuming "friends").
            try {
                if (!supabase) throw new Error("Supabase client not initialized");

                const { data, error } = await supabase.from('contacts').select('*').limit(20);
                if (error) throw error;
                if (data) setContacts(data as any);
            } catch (err: any) {
                console.error("Error fetching contacts:", err);
                setError(err.message || "Failed to load contacts");
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, []);

    if (loading) return <div className="text-[#8da196] text-sm animate-pulse">Syncing contacts...</div>;

    if (error) return (
        <div className="text-red-400 text-xs p-3 border border-red-500/20 rounded-lg bg-red-500/5">
            Unable to load contacts. Please try sharing a contact with the bot again.
        </div>
    );

    if (contacts.length === 0) return (
        <div className="text-[#8da196] text-sm text-center py-4 border border-dashed border-[#1e2a24] rounded-lg">
            <User size={24} className="mx-auto mb-2 opacity-50" />
            <p>No saved contacts yet.</p>
            <p className="text-xs pt-2">Share a contact with the bot to see them here!</p>
        </div>
    );

    return (
        <div className="space-y-3">
            <h4 className="text-[#bfe8d7] text-sm font-medium flex items-center gap-2">
                <User size={14} /> Saved Contacts
            </h4>
            <div className="grid gap-2">
                {contacts.map(contact => (
                    <div key={contact.telegram_user_id} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(48,240,168,0.02)] border border-[#1e2a24]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#30f0a8]/10 flex items-center justify-center text-[#30f0a8] font-bold text-xs">
                                {contact.first_name[0]}
                            </div>
                            <div>
                                <p className="text-[#e8fdf4] text-sm font-medium">
                                    {contact.first_name} {contact.last_name || ""}
                                </p>
                                <p className="text-[#8da196] text-xs flex items-center gap-1">
                                    <Phone size={10} /> {contact.phone_number}
                                </p>
                            </div>
                        </div>
                        {contact.wallet_address && (
                            <div title="Wallet Linked">
                                <Wallet size={14} className="text-[#30f0a8]" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
