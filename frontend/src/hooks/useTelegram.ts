"use client";

import { useEffect, useState } from "react";

type TelegramWebApp = NonNullable<Window["Telegram"]>["WebApp"];

export function useTelegram() {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [safeAreaInset, setSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    // Check if we're running in Telegram
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      setTg(webApp);

      // Initialize the Mini App
      webApp.ready();
      setIsReady(true);
      setIsFullscreen(webApp.isFullscreen);
      if (webApp.safeAreaInset) {
        setSafeAreaInset(webApp.safeAreaInset);
      }

      // Expand the Mini App to full height
      webApp.expand();

      // Set background color based on theme
      const bgColor = webApp.themeParams.bg_color || "#ffffff";
      webApp.setBackgroundColor(bgColor);
      document.body.style.backgroundColor = bgColor;

      // Event Listeners for 8.0+ features
      const handleFullscreenChanged = () => setIsFullscreen(webApp.isFullscreen);
      const handleSafeAreaChanged = () => setSafeAreaInset(webApp.safeAreaInset);

      webApp.onEvent("fullscreenChanged", handleFullscreenChanged);
      webApp.onEvent("safeAreaChanged", handleSafeAreaChanged);

      return () => {
        webApp.offEvent("fullscreenChanged", handleFullscreenChanged);
        webApp.offEvent("safeAreaChanged", handleSafeAreaChanged);
      };
    }
  }, []);

  const onClose = () => {
    if (tg) tg.close();
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
    if (tg) tg.sendData(JSON.stringify(data));
  };

  const showMainButton = (text: string, onClick: () => void) => {
    if (tg) {
      tg.MainButton.setText(text);
      tg.MainButton.onClick(onClick);
      tg.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (tg) tg.MainButton.hide();
  };

  const showBackButton = (onClick: () => void) => {
    if (tg) {
      tg.BackButton.onClick(onClick);
      tg.BackButton.show();
    }
  };

  const hideBackButton = () => {
    if (tg) tg.BackButton.hide();
  };

  // Bot API 8.0+ Methods
  const requestContact = (callback?: (granted: boolean) => void) => {
    tg?.requestContact(callback);
  };

  const shareToStory = (mediaUrl: string, params?: { text?: string; widget_link?: { url: string; name?: string } }) => {
    tg?.shareToStory(mediaUrl, params);
  };

  const addToHomeScreen = () => {
    tg?.addToHomeScreen();
  };

  const checkHomeScreenStatus = (callback: (status: string) => void) => {
    tg?.checkHomeScreenStatus(callback);
  };

  const requestFullscreen = () => {
    tg?.requestFullscreen();
  };

  const exitFullscreen = () => {
    tg?.exitFullscreen();
  };

  const hapticFeedback = {
    impact: (style: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium") => {
      tg?.HapticFeedback.impactOccurred(style);
    },
    notification: (type: "error" | "success" | "warning") => {
      tg?.HapticFeedback.notificationOccurred(type);
    },
    selection: () => {
      tg?.HapticFeedback.selectionChanged();
    },
  };

  return {
    tg,
    isReady,
    isTelegram: !!tg,
    isFullscreen,
    safeAreaInset,
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
    requestContact,
    shareToStory,
    addToHomeScreen,
    checkHomeScreenStatus,
    requestFullscreen,
    exitFullscreen
  };
}

