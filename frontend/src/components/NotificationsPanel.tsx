"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAccount } from "wagmi";
import { getNotifications, markNotificationRead, Notification } from "@/lib/supabase";

export function NotificationsPanel() {
    const { address } = useAccount();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!address) return;

        const load = async () => {
            const data = await getNotifications(address);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        };

        load();

        // Poll every 30s for demo purposes (realtime subscription would be better)
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, [address]);

    const handleOpen = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            // Mark all valid notifications as read visually, and update DB
            const unread = notifications.filter(n => !n.read);
            // Optimistic update
            const updated = notifications.map(n => ({ ...n, read: true }));
            setNotifications(updated);
            setUnreadCount(0);

            // Background update
            for (const n of unread) {
                await markNotificationRead(n.id);
            }
        }
    };

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isOpen && !target.closest('.notifications-container')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    if (!address) return null;

    return (
        <div className="relative notifications-container">
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-full hover:bg-[rgba(48,240,168,0.1)] transition text-[#30f0a8]"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#050908]"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 w-80 bg-[#0a0f0d] border border-[#1e2a24] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-[#1e2a24] bg-[#0f1613]">
                        <h3 className="text-sm font-semibold text-[#e8fdf4]">Notifications</h3>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-[#8da196] text-sm">
                                No notifications yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-[#1e2a24]">
                                {notifications.map(n => (
                                    <div key={n.id} className="p-3 hover:bg-[rgba(48,240,168,0.02)] transition">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-sm text-[#e8fdf4] leading-snug">{n.message}</p>
                                            <span className="text-[10px] text-[#8da196] whitespace-nowrap">
                                                {new Date(n.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
