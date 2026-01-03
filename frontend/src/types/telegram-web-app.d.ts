// Type definitions for Telegram Web App
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
          };
          query_id?: string;
          auth_date?: number;
          hash?: string;
        };
        version: string;
        platform: string;
        colorScheme: "light" | "dark";
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
          notificationOccurred: (type: "error" | "success" | "warning") => void;
          selectionChanged: () => void;
        };
        CloudStorage: {
          setItem: (key: string, value: string, callback?: (error: Error | null, success: boolean) => void) => void;
          getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void;
          getItems: (keys: string[], callback: (error: Error | null, values: Record<string, string>) => void) => void;
          removeItem: (key: string, callback?: (error: Error | null, success: boolean) => void) => void;
          removeItems: (keys: string[], callback?: (error: Error | null, success: boolean) => void) => void;
          getKeys: (callback: (error: Error | null, keys: string[]) => void) => void;
        };
        // Bot API 8.0+ Additions
        shareMessage: (msg_id: string, callback?: (success: boolean) => void) => void;
        shareToStory: (media_url: string, params?: { text?: string; widget_link?: { url: string; name?: string } }) => void;
        requestFullscreen: () => void;
        exitFullscreen: () => void;
        addToHomeScreen: () => void;
        checkHomeScreenStatus: (callback?: (status: "unsupported" | "unknown" | "added" | "missed") => void) => void;
        setEmojiStatus: (custom_emoji_id: string, params?: { duration?: number }, callback?: (success: boolean) => void) => void;
        requestEmojiStatusAccess: (callback?: (granted: boolean) => void) => void;
        downloadFile: (params: { url: string; file_name: string }, callback?: (accepted: boolean) => void) => void;

        // Location & Sensors (Bot API 8.0+)
        LocationManager: {
          isInited: boolean;
          isLocationAvailable: boolean;
          isAccessRequested: boolean;
          isAccessGranted: boolean;
          init: (callback?: () => void) => void;
          getLocation: (callback: (data: null | {
            latitude: number;
            longitude: number;
            altitude?: number;
            speed?: number;
          }) => void) => void;
          openSettings: () => void;
        };
        Accelerometer: {
          isStarted: boolean;
          x: number;
          y: number;
          z: number;
          start: (params: { refresh_rate?: number }, callback?: (success: boolean) => void) => void;
          stop: (callback?: (success: boolean) => void) => void;
        };
        DeviceOrientation: {
          isStarted: boolean;
          absolute: boolean;
          alpha: number;
          beta: number;
          gamma: number;
          start: (params: { refresh_rate?: number; need_absolute?: boolean }, callback?: (success: boolean) => void) => void;
          stop: (callback?: (success: boolean) => void) => void;
        };
        Gyroscope: {
          isStarted: boolean;
          x: number;
          y: number;
          z: number;
          start: (params: { refresh_rate?: number }, callback?: (success: boolean) => void) => void;
          stop: (callback?: (success: boolean) => void) => void;
        };

        // Existing methods
        ready: () => void;
        expand: () => void;
        close: () => void;
        sendData: (data: string) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: "default" | "ok" | "close" | "cancel" | "destructive";
            text: string;
          }>;
        }, callback?: (id: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showScanQrPopup: (params: {
          text?: string;
        }, callback?: (data: string) => void) => void;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (callback?: (text: string) => void) => void;
        requestWriteAccess: (callback?: (granted: boolean) => void) => void;
        requestContact: (callback?: (granted: boolean) => void) => void;
        onEvent: (eventType: string, eventHandler: (...args: any[]) => void) => void;
        offEvent: (eventType: string, eventHandler: (...args: any[]) => void) => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        onClose: (callback: () => void) => void;
        offClose: (callback: () => void) => void;

        // New fields
        isActive: boolean;
        isFullscreen: boolean;
        isOrientationLocked: boolean;
        safeAreaInset: {
          top: number;
          bottom: number;
          left: number;
          right: number;
        };
        contentSafeAreaInset: {
          top: number;
          bottom: number;
          left: number;
          right: number;
        };
      };
    };
  }
}

export { };

