// lib/supabase/types.ts
// Tipos sincronizados con el schema real (columnas camelCase generadas por Prisma)
// Regenerar con: npx supabase gen types typescript --project-id fxgnoexdeacuwezcpqpo > lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "SUPER_ADMIN" | "TENANT_ADMIN" | "MEDICO" | "RECEPCION" | "FACTURACION";
export type TenantType = "CONSULTORIO" | "CLINICA" | "SANATORIO" | "HOSPITAL";
export type TenantStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED";
export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "RESCHEDULED";
export type BillingStatus = "DRAFT" | "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID";
export type ShareStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "REVOKED";

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          type: TenantType;
          status: TenantStatus;
          cuit: string | null;
          address: string | null;
          city: string | null;
          province: string | null;
          country: string;
          logoUrl: string | null;
          primaryColor: string;
          planExpiresAt: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          type: TenantType;
          status?: TenantStatus;
          cuit?: string | null;
          address?: string | null;
          city?: string | null;
          province?: string | null;
          country?: string;
          logoUrl?: string | null;
          primaryColor?: string;
          planExpiresAt?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>;
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          authId: string;
          tenantId: string;
          role: UserRole;
          firstName: string;
          lastName: string;
          email: string;
          phone: string | null;
          avatarUrl: string | null;
          specialty: string | null;
          licenseNum: string | null;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
          lastLoginAt: string | null;
        };
        Insert: {
          id?: string;
          authId: string;
          tenantId: string;
          role: UserRole;
          firstName: string;
          lastName: string;
          email: string;
          phone?: string | null;
          avatarUrl?: string | null;
          specialty?: string | null;
          licenseNum?: string | null;
          isActive?: boolean;
          createdAt?: string;
          updatedAt?: string;
          lastLoginAt?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "users_tenantId_fkey";
            columns: ["tenantId"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      patients: {
        Row: {
          id: string;
          tenantId: string;
          dni: string;
          cuil: string | null;
          firstName: string;
          lastName: string;
          birthDate: string | null;
          sex: "M" | "F" | "X" | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          bloodType: string | null;
          allergies: string | null;
          insurancePlanId: string | null;
          affiliateNum: string | null;
          emergencyContact: string | null;
          emergencyPhone: string | null;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          tenantId: string;
          dni: string;
          cuil?: string | null;
          firstName: string;
          lastName: string;
          birthDate?: string | null;
          sex?: "M" | "F" | "X" | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          bloodType?: string | null;
          allergies?: string | null;
          insurancePlanId?: string | null;
          affiliateNum?: string | null;
          emergencyContact?: string | null;
          emergencyPhone?: string | null;
          isActive?: boolean;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          tenantId: string;
          patientId: string;
          doctorId: string;
          specialtyId: string | null;
          roomId: string | null;
          scheduledAt: string;
          durationMin: number;
          status: AppointmentStatus;
          insurancePlanId: string | null;
          chiefComplaint: string | null;
          notes: string | null;
          cancelledAt: string | null;
          cancelReason: string | null;
          reminderSentAt: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          tenantId: string;
          patientId: string;
          doctorId: string;
          specialtyId?: string | null;
          roomId?: string | null;
          scheduledAt: string;
          durationMin?: number;
          status?: AppointmentStatus;
          insurancePlanId?: string | null;
          chiefComplaint?: string | null;
          notes?: string | null;
          cancelledAt?: string | null;
          cancelReason?: string | null;
          reminderSentAt?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [];
      };
      medical_records: {
        Row: {
          id: string;
          tenantId: string;
          patientId: string;
          appointmentId: string | null;
          authorId: string;
          specialtyId: string | null;
          entryType: string;
          subjective: string | null;
          objective: string | null;
          assessment: string | null;
          plan: string | null;
          diagnosisCie10: string | null;
          diagnosisFreeText: string | null;
          treatment: string | null;
          vitalsBpSystolic: number | null;
          vitalsBpDiastolic: number | null;
          vitalsHrBpm: number | null;
          vitalsTempC: number | null;
          vitalsWeightKg: number | null;
          vitalsHeightCm: number | null;
          vitalsBmiCalc: number | null;
          vitalsO2Pct: number | null;
          isConfidential: boolean;
          version: number;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          tenantId: string;
          patientId: string;
          appointmentId?: string | null;
          authorId: string;
          specialtyId?: string | null;
          entryType?: string;
          subjective?: string | null;
          objective?: string | null;
          assessment?: string | null;
          plan?: string | null;
          diagnosisCie10?: string | null;
          diagnosisFreeText?: string | null;
          treatment?: string | null;
          vitalsBpSystolic?: number | null;
          vitalsBpDiastolic?: number | null;
          vitalsHrBpm?: number | null;
          vitalsTempC?: number | null;
          vitalsWeightKg?: number | null;
          vitalsHeightCm?: number | null;
          vitalsBmiCalc?: number | null;
          vitalsO2Pct?: number | null;
          isConfidential?: boolean;
          version?: number;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: Partial<Database["public"]["Tables"]["medical_records"]["Insert"]>;
        Relationships: [];
      };
      billing_items: {
        Row: {
          id: string;
          tenantId: string;
          patientId: string | null;
          appointmentId: string | null;
          insurancePlanId: string | null;
          nomenclatureId: string | null;
          description: string;
          quantity: number;
          unitValue: number;
          totalValue: number;
          status: BillingStatus;
          invoiceId: string | null;
          serviceDate: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          tenantId: string;
          patientId?: string | null;
          appointmentId?: string | null;
          insurancePlanId?: string | null;
          nomenclatureId?: string | null;
          description: string;
          quantity?: number;
          unitValue: number;
          totalValue: number;
          status?: BillingStatus;
          invoiceId?: string | null;
          serviceDate: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: Partial<Database["public"]["Tables"]["billing_items"]["Insert"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          tenantId: string;
          userId: string | null;
          action: string;
          resource: string;
          resourceId: string | null;
          oldValues: Json | null;
          newValues: Json | null;
          ipAddress: string | null;
          userAgent: string | null;
          createdAt: string;
        };
        Insert: {
          id?: string;
          tenantId: string;
          userId?: string | null;
          action: string;
          resource: string;
          resourceId?: string | null;
          oldValues?: Json | null;
          newValues?: Json | null;
          ipAddress?: string | null;
          userAgent?: string | null;
          createdAt?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_tenant_id: { Args: Record<string, never>; Returns: string };
      current_user_role: { Args: Record<string, never>; Returns: string };
      is_super_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      UserRole: UserRole;
      TenantType: TenantType;
      AppointmentStatus: AppointmentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
