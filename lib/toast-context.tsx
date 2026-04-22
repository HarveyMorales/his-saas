"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastCtx {
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastCtx>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(x => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string; titleColor: string }> = {
  success: { bg: "#F0FDF4", border: "#86EFAC", icon: "✓", titleColor: "#166534" },
  error:   { bg: "#FEF2F2", border: "#FCA5A5", icon: "✕", titleColor: "#991B1B" },
  warning: { bg: "#FFFBEB", border: "#FCD34D", icon: "⚠", titleColor: "#92400E" },
  info:    { bg: "#EFF6FF", border: "#93C5FD", icon: "ℹ", titleColor: "#1E40AF" },
};

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      {toasts.map(t => {
        const s = TOAST_STYLES[t.type];
        return (
          <div
            key={t.id}
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: "12px 16px",
              minWidth: 300, maxWidth: 400,
              display: "flex", alignItems: "flex-start", gap: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              animation: "slideUp 0.2s ease-out",
            }}
          >
            <span style={{ fontWeight: 700, color: s.titleColor, fontSize: 14, flexShrink: 0 }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.titleColor }}>{t.title}</div>
              {t.message && <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{t.message}</div>}
            </div>
            <button onClick={() => dismiss(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 16, padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
          </div>
        );
      })}
    </div>
  );
}
