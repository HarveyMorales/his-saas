"use client";

import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: number;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, subtitle, children, width = 560, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(11,29,53,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 998,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.15s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          animation: "slideUp 0.18s ease-out",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--slate-100)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate-500)" }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none", background: "none", cursor: "pointer",
              color: "var(--slate-400)", display: "flex", padding: 4, borderRadius: 6,
              flexShrink: 0, marginLeft: 12,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--slate-100)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
