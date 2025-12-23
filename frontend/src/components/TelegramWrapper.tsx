"use client";

import { useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";

interface TelegramWrapperProps {
  children: React.ReactNode;
}

export function TelegramWrapper({ children }: TelegramWrapperProps) {
  const { tg, isReady, theme, themeParams } = useTelegram();

  useEffect(() => {
    if (tg) {
      // Set theme colors
      const bgColor = themeParams.bg_color || (theme === "dark" ? "#000000" : "#ffffff");
      const textColor = themeParams.text_color || (theme === "dark" ? "#ffffff" : "#000000");
      
      tg.setBackgroundColor(bgColor);
      document.body.style.backgroundColor = bgColor;
      document.body.style.color = textColor;

      // Listen for theme changes
      tg.onEvent("themeChanged", () => {
        const newBgColor = tg.themeParams.bg_color || (tg.colorScheme === "dark" ? "#000000" : "#ffffff");
        const newTextColor = tg.themeParams.text_color || (tg.colorScheme === "dark" ? "#ffffff" : "#000000");
        document.body.style.backgroundColor = newBgColor;
        document.body.style.color = newTextColor;
      });
    }
  }, [tg, theme, themeParams]);

  // Add Telegram-specific styles
  useEffect(() => {
    if (tg) {
      // Ensure viewport is set correctly for Telegram
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        );
      } else {
        const meta = document.createElement("meta");
        meta.name = "viewport";
        meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
        document.head.appendChild(meta);
      }
    }
  }, [tg]);

  return <>{children}</>;
}

