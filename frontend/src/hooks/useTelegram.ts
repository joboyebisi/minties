"use client";

import { useEffect, useState } from "react";

type TelegramWebApp = NonNullable<Window["Telegram"]>["WebApp"];

export function useTelegram() {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we're running in Telegram
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      setTg(webApp);
      
      // Initialize the Mini App
      webApp.ready();
      setIsReady(true);

      // Expand the Mini App to full height
      webApp.expand();

      // Set background color based on theme
      const bgColor = webApp.themeParams.bg_color || "#ffffff";
      webApp.setBackgroundColor(bgColor);
      document.body.style.backgroundColor = bgColor;
    }
  }, []);

  const onClose = () => {
    if (tg) {
      tg.close();
    }
  };

  const onToggleButton = () => {
    if (tg) {
      if (tg.MainButton.isVisible) {
        tg.MainButton.hide();
      } else {
        tg.MainButton.show();
      }
    }
  };

  const sendDataToBot = (data: Record<string, any>) => {
    if (tg) {
      tg.sendData(JSON.stringify(data));
    }
  };

  const showMainButton = (text: string, onClick: () => void) => {
    if (tg) {
      tg.MainButton.setText(text);
      tg.MainButton.onClick(onClick);
      tg.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (tg) {
      tg.MainButton.hide();
    }
  };

  const showBackButton = (onClick: () => void) => {
    if (tg) {
      tg.BackButton.onClick(onClick);
      tg.BackButton.show();
    }
  };

  const hideBackButton = () => {
    if (tg) {
      tg.BackButton.hide();
    }
  };

  const hapticFeedback = {
    impact: (style: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium") => {
      if (tg) {
        tg.HapticFeedback.impactOccurred(style);
      }
    },
    notification: (type: "error" | "success" | "warning") => {
      if (tg) {
        tg.HapticFeedback.notificationOccurred(type);
      }
    },
    selection: () => {
      if (tg) {
        tg.HapticFeedback.selectionChanged();
      }
    },
  };

  return {
    tg,
    isReady,
    isTelegram: !!tg,
    user: tg?.initDataUnsafe?.user,
    queryId: tg?.initDataUnsafe?.query_id,
    theme: tg?.colorScheme || "light",
    themeParams: tg?.themeParams || {},
    onClose,
    onToggleButton,
    sendDataToBot,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
  };
}

