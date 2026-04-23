"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ChevronDown } from "lucide-react";
import { LOGIN_USERS } from "@/lib/data";
import type { LoginUser } from "@/lib/types";

interface LoginViewProps {
  onLogin: (user: LoginUser) => void;
}

const ROLE_LABELS: Record<LoginUser["role"], { label: string; color: string }> = {
  MEDICO:       { label: "Médico",        color: "#00BFA6" },
  ENFERMERO:    { label: "Enfermero/a",   color: "#06B6D4" },
  TECNICO:      { label: "Técnico/a",     color: "#6366F1" },
  CAMILLERO:    { label: "Camillero/a",   color: "#84CC16" },
  RECEPCION:    { label: "Recepción",     color: "#2563EB" },
  ADMISION:     { label: "Admisión",      color: "#0EA5E9" },
  FACTURACION:  { label: "Facturación",   color: "#F59E0B" },
  ADMIN_INST:   { label: "Admin Inst.",   color: "#8B5CF6" },
  TENANT_ADMIN: { label: "Admin Tenant",  color: "#EC4899" },
  SUPER_ADMIN:  { label: "Super Admin",   color: "#EF4444" },
  ADMIN_IT:     { label: "IT Admin",      color: "#EF4444" },
};

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState("admin.it@his.com");
  const [pass, setPass] = useState("it123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Try real Supabase auth first
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (!authError) {
        // Redirect to dashboard — middleware will verify session server-side
        window.location.href = "/dashboard";
        return;
      }
    } catch {
      // Supabase not configured — fall through to mock
    }

    // Fallback: mock credentials for development
    const user = LOGIN_USERS.find(u => u.email === email.trim() && u.password === pass);
    if (!user) {
      setLoading(false);
      setError("Email o contraseña incorrectos");
      return;
    }
    setTimeout(() => { setLoading(false); onLogin(user); }, 400);
  };

  const fillDemo = (u: LoginUser) => {
    setEmail(u.email);
    setPass(u.password);
    setError("");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--navy)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0,191,166,0.08) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(37,99,235,0.08) 0%, transparent 40%)`,
      }} />

      <div style={{ width: 440, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 18,
            background: "linear-gradient(135deg, #00BFA6, #2563EB)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 34, margin: "0 auto 14px",
            boxShadow: "0 8px 32px rgba(0,191,166,0.3)",
          }}>🏥</div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: "white", letterSpacing: -1 }}>
            HIS SaaS
          </h1>
          <p style={{ margin: "5px 0 0", color: "var(--teal)", fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
            Sistema Clínico Multi-Institución
          </p>
        </div>

        {/* Login card */}
        <div style={{
          background: "var(--navy-mid)", borderRadius: 20, padding: 32,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-400)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={14} color="var(--slate-500)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  style={{
                    width: "100%", padding: "10px 14px 10px 36px",
                    borderRadius: 10, border: error ? "1px solid #EF4444" : "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)", color: "white",
                    fontSize: 14, outline: "none", boxSizing: "border-box",
                  }}
                  autoComplete="username"
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate-400)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={14} color="var(--slate-500)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type={showPass ? "text" : "password"}
                  value={pass}
                  onChange={e => { setPass(e.target.value); setError(""); }}
                  style={{
                    width: "100%", padding: "10px 38px 10px 36px",
                    borderRadius: 10, border: error ? "1px solid #EF4444" : "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)", color: "white",
                    fontSize: 14, outline: "none", boxSizing: "border-box",
                  }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(o => !o)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--slate-500)", display: "flex" }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {error && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#EF4444", fontWeight: 600 }}>
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 12,
                background: loading ? "rgba(0,191,166,0.5)" : "linear-gradient(135deg, #00BFA6, #00D4B8)",
                color: "white", border: "none", cursor: loading ? "default" : "pointer",
                fontSize: 15, fontWeight: 700, fontFamily: "Georgia, serif",
                boxShadow: loading ? "none" : "0 4px 20px rgba(0,191,166,0.35)",
              }}
            >
              {loading ? "Verificando..." : "Ingresar al sistema"}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: 16, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => setShowDemo(o => !o)}
            style={{
              width: "100%", padding: "11px 16px", background: "rgba(255,255,255,0.04)",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--slate-400)", fontWeight: 600 }}>
              🔑 Credenciales de demostración
            </span>
            <ChevronDown size={14} color="var(--slate-500)"
              style={{ transform: showDemo ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
          </button>

          {showDemo && (
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "4px 0" }}>
              {LOGIN_USERS.map(u => {
                const cfg = ROLE_LABELS[u.role];
                return (
                  <button
                    key={u.id}
                    onClick={() => fillDemo(u)}
                    style={{
                      width: "100%", padding: "9px 16px", background: "transparent",
                      border: "none", cursor: "pointer", display: "flex", alignItems: "center",
                      gap: 12, textAlign: "left",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: `${cfg.color}22`, border: `1.5px solid ${cfg.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: cfg.color,
                    }}>
                      {u.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--slate-500)" }}>
                        {u.email} · <span style={{ color: "rgba(255,255,255,0.3)" }}>{u.password}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                      background: `${cfg.color}22`, color: cfg.color, flexShrink: 0,
                    }}>
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <ShieldCheck size={12} color="var(--slate-600)" />
          <span style={{ fontSize: 10, color: "var(--slate-600)" }}>Sesión encriptada TLS 1.3 · Auditoría activa · Zero trust</span>
        </div>
      </div>
    </div>
  );
}
