"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastState {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  show: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const show = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 inset-x-0 flex flex-col items-center gap-2 px-4 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="glass w-full max-w-sm px-4 py-3 rounded-xl border border-[rgba(48,240,168,0.25)] shadow-glow flex items-start gap-3"
          >
            <div className="mt-0.5">
              {toast.type === "success" && <CheckCircle2 size={18} className="text-[#30f0a8]" />}
              {toast.type === "error" && <AlertTriangle size={18} className="text-[#f87171]" />}
              {toast.type === "info" && <Info size={18} className="text-[#30f0a8]" />}
            </div>
            <div className="text-sm text-[#e8fdf4]">{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

