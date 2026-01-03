"use client";

import { useTelegram } from "@/hooks/useTelegram";
import { Share, Home, Smartphone, Maximize, Minimize } from "lucide-react";

export function TelegramFeatures() {
    const {
        isTelegram,
        shareToStory,
        addToHomeScreen,
        requestContact,
        isFullscreen,
        requestFullscreen,
        exitFullscreen,
        hapticFeedback
    } = useTelegram();

    if (!isTelegram) return null;

    const handleShareStory = () => {
        hapticFeedback.impact('light');
        shareToStory("https://minties.vercel.app/og-image.png", {
            text: "Join me on Minties! 🎁",
            widget_link: {
                url: "https://t.me/MintiesBot/app",
                name: "Open App"
            }
        });
    };

    const handleAddToHome = () => {
        hapticFeedback.impact('light');
        addToHomeScreen();
    };

    const handleRequestContact = () => {
        hapticFeedback.impact('light');
        requestContact((granted) => {
            if (granted) {
                hapticFeedback.notification('success');
            }
        });
    };

    const toggleFullscreen = () => {
        hapticFeedback.impact('light');
        if (isFullscreen) {
            exitFullscreen();
        } else {
            requestFullscreen();
        }
    };

    return (
        <div className="card p-4 space-y-4 border-[#30f0a8]/20">
            <h3 className="text-lg font-semibold text-[#e8fdf4]">Telegram Features</h3>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleShareStory}
                    className="btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                >
                    <Share size={16} /> Share Story
                </button>

                <button
                    onClick={handleAddToHome}
                    className="btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                >
                    <Home size={16} /> Add to Home
                </button>

                <button
                    onClick={handleRequestContact}
                    className="btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                >
                    <Smartphone size={16} /> Share Contact
                </button>

                <button
                    onClick={toggleFullscreen}
                    className="btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                >
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                    {isFullscreen ? "Exit Full" : "Fullscreen"}
                </button>
            </div>
        </div>
    );
}
