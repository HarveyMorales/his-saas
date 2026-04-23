"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { NotificationsPanel } from "./NotificationsPanel";
import { LoginView } from "./views/LoginView";
import { InstitutionView } from "./views/InstitutionView";
import { DashboardView } from "./views/DashboardView";
import { PatientsView } from "./views/PatientsView";
import { PatientDetailView } from "./views/PatientDetailView";
import { AppointmentsView } from "./views/AppointmentsView";
import { GuardsView } from "./views/GuardsView";
import { InsuranceView } from "./views/InsuranceView";
import { BillingView } from "./views/BillingView";
import { SharingView } from "./views/SharingView";
import { AuditView } from "./views/AuditView";
import { UsersView } from "./views/UsersView";
import { ReportesView } from "./views/ReportesView";
import { AdminView } from "./views/admin/AdminView";
import { NewConsultationModal } from "./modals/NewConsultationModal";
import { NewPatientModal } from "./modals/NewPatientModal";
import { KeyboardShortcutsModal } from "./modals/KeyboardShortcutsModal";
import { signOut } from "@/app/actions/auth";
import { PATIENTS, INSTITUTIONS } from "@/lib/data";
import type { Phase, NavId, Institution, Patient, LoginUser } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

interface AppShellProps {
  supabaseUser?: User | null;
  supabaseProfile?: any;
}

export function AppShell({ supabaseUser, supabaseProfile }: AppShellProps = {}) {
  const [phase, setPhase] = useState<Phase>(supabaseUser ? "app" : "login");
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(() => {
    if (supabaseProfile?.tenants) {
      const t = supabaseProfile.tenants;
      return { id: t.id, name: t.name, type: t.type, color: t.primary_color ?? "#00BFA6", icon: "🏥", tenant: t.id };
    }
    return null;
  });
  const [activeNav, setActiveNav] = useState<NavId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [cmdOpen, setCmdOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [newConsultationOpen, setNewConsultationOpen] = useState(false);
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [patientsRefreshKey, setPatientsRefreshKey] = useState(0);
  const [consultationRefreshKey, setConsultationRefreshKey] = useState(0);

  const keySeqRef = useRef<string>("");
  const seqTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNav = useCallback((id: NavId) => {
    setActiveNav(id);
    setSelectedPatient(null);
  }, []);

  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      setCmdOpen(o => !o);
      return;
    }
    if (e.key === "?") { setShortcutsOpen(true); return; }

    const key = e.key.toUpperCase();
    const seq = keySeqRef.current;
    if (seqTimerRef.current) clearTimeout(seqTimerRef.current);

    if (seq === "G") {
      keySeqRef.current = "";
      if (key === "D") { handleNav("dashboard"); return; }
      if (key === "P") { handleNav("patients"); return; }
      if (key === "A") { handleNav("appointments"); return; }
      if (key === "H") { handleNav("records"); return; }
      if (key === "F") { handleNav("billing"); return; }
    } else if (seq === "N") {
      keySeqRef.current = "";
      if (key === "C") { setNewConsultationOpen(true); return; }
      if (key === "P") { setNewPatientOpen(true); return; }
      if (key === "T") { handleNav("appointments"); return; }
    } else {
      if (key === "G" || key === "N") {
        keySeqRef.current = key;
        seqTimerRef.current = setTimeout(() => { keySeqRef.current = ""; }, 1500);
      }
    }
  }, [handleNav]);

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [handleGlobalKey]);

  const handleLogin = (user: LoginUser) => {
    setCurrentUser(user);
    if (user.role === "ADMIN_IT") {
      setPhase("app");
    } else if (user.institution) {
      const inst = INSTITUTIONS.find(i => i.id === user.institution);
      if (inst) { setInstitution(inst); setPhase("app"); }
      else { setPhase("select-institution"); }
    } else {
      setPhase("select-institution");
    }
  };

  const handleLogout = async () => {
    if (supabaseUser) {
      await signOut();
      return;
    }
    setCurrentUser(null);
    setInstitution(null);
    setPhase("login");
    setActiveNav("dashboard");
    setSelectedPatient(null);
  };

  const handleSelectPatientById = async (patientId: string) => {
    // Try mock first
    const mockPatient = PATIENTS.find(pt => pt.id === patientId);
    if (mockPatient) { setSelectedPatient(mockPatient); setActiveNav("patients"); return; }
    // Fetch from Supabase for real DB patients
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await (supabase as any).from("patients").select("*").eq("id", patientId).single();
      if (data) {
        const birthYear = data.birthDate ? new Date(data.birthDate).getFullYear() : null;
        const age = birthYear ? new Date().getFullYear() - birthYear : 0;
        setSelectedPatient({
          id: data.id, dni: data.dni,
          name: `${data.lastName}, ${data.firstName}`,
          age, sex: data.sex ?? "M",
          obra: "Sin obra social", blood: data.bloodType ?? "—",
          phone: data.phone ?? "", email: data.email ?? "",
          alert: data.allergies ? `🔴 Alergia: ${data.allergies}` : null,
          lastVisit: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString("es-AR") : "—",
          institution: data.tenantId,
        });
        setActiveNav("patients");
      }
    } catch {}
  };

  // ── Login ────────────────────────────────────────────────────────────────────
  if (phase === "login") {
    return <LoginView onLogin={handleLogin} />;
  }

  // ── Institution select ───────────────────────────────────────────────────────
  if (phase === "select-institution") {
    return (
      <InstitutionView
        onSelect={inst => { setInstitution(inst); setPhase("app"); }}
      />
    );
  }

  // Build a display user from real supabaseProfile when available
  const displayUser: LoginUser | null = currentUser ?? (supabaseProfile ? {
    id: supabaseProfile.id,
    email: supabaseProfile.email,
    password: "",
    name: `${supabaseProfile.firstName ?? ""} ${supabaseProfile.lastName ?? ""}`.trim() || supabaseProfile.email,
    role: supabaseProfile.role as LoginUser["role"],
    avatar: `${supabaseProfile.firstName?.[0] ?? ""}${supabaseProfile.lastName?.[0] ?? ""}`.toUpperCase(),
    institution: supabaseProfile.tenantId ?? null,
    institutionName: supabaseProfile.tenants?.name ?? null,
    specialty: supabaseProfile.specialty ?? undefined,
  } : null);

  // ── Admin views (mock ADMIN_IT or real SUPER_ADMIN) ─────────────────────────
  const isSuperAdmin = currentUser?.role === "ADMIN_IT" || supabaseProfile?.role === "SUPER_ADMIN";
  if (isSuperAdmin) {
    return <AdminView currentUser={displayUser} onLogout={handleLogout} />;
  }

  // ── Normal app ───────────────────────────────────────────────────────────────
  const renderView = () => {
    if (activeNav === "patients" || activeNav === "records") {
      if (selectedPatient) {
        return (
          <PatientDetailView
            patient={selectedPatient}
            onBack={() => setSelectedPatient(null)}
            onNav={handleNav}
            onNewConsultation={() => setNewConsultationOpen(true)}
            consultationRefreshKey={consultationRefreshKey}
          />
        );
      }
      return (
        <PatientsView
          onSelectPatient={setSelectedPatient}
          onNewPatient={() => setNewPatientOpen(true)}
          refreshKey={patientsRefreshKey}
        />
      );
    }
    if (activeNav === "appointments") return <AppointmentsView />;
    if (activeNav === "guards") return <GuardsView />;
    if (activeNav === "insurance") return <InsuranceView />;
    if (activeNav === "billing") return <BillingView />;
    if (activeNav === "sharing") return <SharingView />;
    if (activeNav === "audit") return <AuditView />;
    if (activeNav === "users") return <UsersView />;
    if (activeNav === "reportes") return <ReportesView />;
    return <DashboardView institution={institution} onNav={handleNav} />;
  };

  return (
    <>
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onNav={id => { handleNav(id); setCmdOpen(false); }}
        onSelectPatient={id => { handleSelectPatientById(id); setCmdOpen(false); }}
      />
      <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      {newConsultationOpen && (
        <NewConsultationModal
          patient={selectedPatient}
          onClose={() => setNewConsultationOpen(false)}
          onSaved={() => { setNewConsultationOpen(false); setConsultationRefreshKey(k => k + 1); }}
        />
      )}
      {newPatientOpen && (
        <NewPatientModal
          onClose={() => setNewPatientOpen(false)}
          onSaved={() => { setNewPatientOpen(false); setPatientsRefreshKey(k => k + 1); }}
        />
      )}
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar
          open={sidebarOpen}
          activeNav={activeNav}
          institution={institution}
          currentUser={displayUser}
          onNav={handleNav}
          onChangeInstitution={() => setPhase("select-institution")}
          onLogout={handleLogout}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--slate-100)" }}>
          <TopBar
            institution={institution}
            onToggleSidebar={() => setSidebarOpen(o => !o)}
            onOpenCommand={() => setCmdOpen(true)}
            onOpenNotifications={() => setNotificationsOpen(true)}
          />
          <main style={{ flex: 1, padding: 24, overflow: "auto" }}>
            {renderView()}
          </main>
        </div>
      </div>
    </>
  );
}
