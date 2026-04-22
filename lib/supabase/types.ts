// lib/supabase/types.ts
// Tipos generados del schema de Supabase
// Regenerar con: npx supabase gen types typescript --project-id fxgnoexdeacuwezcpqpo > lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enums sincronizados con schema.prisma
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
          logo_url: string | null;
          primary_color: string;
          plan_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tenants"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>;
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          auth_id: string;
          tenant_id: string;
          role: UserRole;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          specialty: string | null;
          license_num: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      patients: {
        Row: {
          id: string;
          tenant_id: string;
          dni: string;
          cuil: string | null;
          first_name: string;
          last_name: string;
          birth_date: string | null;
          sex: "M" | "F" | "X" | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          blood_type: string | null;
          allergies: string | null;
          insurance_plan_id: string | null;
          affiliate_num: string | null;
          emergency_contact: string | null;
          emergency_phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["patients"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "patients_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      appointments: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          doctor_id: string;
          specialty_id: string | null;
          room_id: string | null;
          scheduled_at: string;
          duration_min: number;
          status: AppointmentStatus;
          insurance_plan_id: string | null;
          chief_complaint: string | null;
          notes: string | null;
          cancelled_at: string | null;
          cancel_reason: string | null;
          reminder_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["appointments"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      medical_records: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          appointment_id: string | null;
          author_id: string;
          specialty_id: string | null;
          entry_type: string;
          subjective: string | null;
          objective: string | null;
          assessment: string | null;
          plan: string | null;
          diagnosis_cie10: string | null;
          diagnosis_free_text: string | null;
          treatment: string | null;
          vitals_bp_systolic: number | null;
          vitals_bp_diastolic: number | null;
          vitals_hr_bpm: number | null;
          vitals_temp_c: number | null;
          vitals_weight_kg: number | null;
          vitals_height_cm: number | null;
          vitals_bmi_calc: number | null;
          vitals_o2_pct: number | null;
          is_confidential: boolean;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["medical_records"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["medical_records"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "medical_records_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medical_records_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      billing_items: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string | null;
          appointment_id: string | null;
          insurance_plan_id: string | null;
          nomenclature_id: string | null;
          description: string;
          quantity: number;
          unit_value: number;
          total_value: number;
          status: BillingStatus;
          invoice_id: string | null;
          service_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["billing_items"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["billing_items"]["Insert"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          action: string;
          resource: string;
          resource_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">;
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
      user_role: UserRole;
      tenant_type: TenantType;
      appointment_status: AppointmentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Makes all nullable fields optional for insert operations
export type LooseInsert<T extends keyof Database["public"]["Tables"]> = {
  [K in keyof InsertTables<T> as null extends InsertTables<T>[K] ? K : never]?: InsertTables<T>[K];
} & {
  [K in keyof InsertTables<T> as null extends InsertTables<T>[K] ? never : K]: InsertTables<T>[K];
};
