export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "secretaria";
export type ActiveStatus = "active" | "inactive";
export type EnrollmentStatus = "active" | "finished" | "cancelled";
export type DiscountType = "none" | "percentage" | "fixed";
export type ChargeType = "mensualidad" | "inscripcion" | "otro";
export type ChargeStatus =
  | "pendiente"
  | "pagado"
  | "parcial"
  | "vencido"
  | "cancelado"
  | "becada";
export type PaymentMethod =
  | "efectivo"
  | "transferencia"
  | "tarjeta"
  | "deposito"
  | "otro";
export type PaymentStatus = "active" | "cancelled";

type TableRow<T> = T;
type TableInsert<T> = Partial<T>;
type TableUpdate<T> = Partial<T>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: TableRow<{
          id: string;
          auth_user_id: string;
          full_name: string;
          role: UserRole;
          status: ActiveStatus;
          created_at: string;
          updated_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      students: {
        Row: TableRow<{
          id: string;
          folio: string;
          full_name: string;
          birth_date: string;
          phone: string | null;
          status: ActiveStatus;
          joined_at: string;
          left_at: string | null;
          left_reason: string | null;
          medical_notes: string | null;
          general_notes: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["students"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["students"]["Row"]>;
        Relationships: [];
      };
      guardians: {
        Row: TableRow<{
          id: string;
          full_name: string;
          phone: string;
          email: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["guardians"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["guardians"]["Row"]>;
        Relationships: [];
      };
      student_guardians: {
        Row: TableRow<{
          id: string;
          student_id: string;
          guardian_id: string;
          relationship: string;
          is_primary: boolean;
          is_emergency_contact: boolean;
          created_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["student_guardians"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["student_guardians"]["Row"]>;
        Relationships: [];
      };
      grades: {
        Row: TableRow<{
          id: string;
          name: string;
          description: string | null;
          suggested_min_age: number | null;
          suggested_max_age: number | null;
          base_monthly_fee: number;
          status: ActiveStatus;
          created_at: string;
          updated_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["grades"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["grades"]["Row"]>;
        Relationships: [];
      };
      groups: {
        Row: TableRow<{
          id: string;
          grade_id: string;
          name: string;
          teacher_name: string | null;
          classroom: string | null;
          capacity: number;
          status: ActiveStatus;
          created_at: string;
          updated_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["groups"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["groups"]["Row"]>;
        Relationships: [];
      };
      group_schedules: {
        Row: TableRow<{
          id: string;
          group_id: string;
          weekday: number;
          starts_at: string;
          ends_at: string;
          status: ActiveStatus;
          created_at: string;
          updated_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["group_schedules"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["group_schedules"]["Row"]>;
        Relationships: [];
      };
      student_enrollments: {
        Row: TableRow<{
          id: string;
          student_id: string;
          group_id: string;
          starts_on: string;
          ends_on: string | null;
          status: EnrollmentStatus;
          assigned_monthly_fee: number;
          discount_type: DiscountType;
          discount_value: number;
          final_monthly_fee: number;
          created_at: string;
          updated_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["student_enrollments"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["student_enrollments"]["Row"]>;
        Relationships: [];
      };
      charges: {
        Row: TableRow<{
          id: string;
          student_id: string;
          enrollment_id: string | null;
          month: number;
          year: number;
          type: ChargeType;
          concept: string;
          amount_due: number;
          amount_paid: number;
          due_date: string;
          status: ChargeStatus;
          created_at: string;
          updated_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["charges"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["charges"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: TableRow<{
          id: string;
          charge_id: string;
          student_id: string;
          amount: number;
          method: PaymentMethod;
          paid_at: string;
          registered_by: string;
          notes: string | null;
          receipt_number: string;
          status: PaymentStatus;
          cancellation_reason: string | null;
          cancelled_by: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["payments"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
      payment_proofs: {
        Row: TableRow<{
          id: string;
          payment_id: string;
          student_id: string;
          original_name: string;
          content_type: "application/pdf" | "image/jpeg" | "image/png";
          storage_path: string;
          uploaded_by: string;
          created_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["payment_proofs"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["payment_proofs"]["Row"]>;
        Relationships: [];
      };
      receipts: {
        Row: TableRow<{
          id: string;
          payment_id: string;
          receipt_number: string;
          storage_path: string | null;
          generated_by: string;
          generated_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["receipts"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["receipts"]["Row"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: TableRow<{
          id: string;
          actor_profile_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Relationships: [];
      };
      app_settings: {
        Row: TableRow<{
          id: string;
          academy_name: string;
          logo_path: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          payment_due_day: number;
          enrollment_fee_enabled: boolean;
          enrollment_fee_amount: number;
          receipt_prefix: string;
          student_folio_prefix: string;
          created_at: string;
          updated_at: string;
        }>;
        Insert: TableInsert<Database["public"]["Tables"]["app_settings"]["Row"]>;
        Update: TableUpdate<Database["public"]["Tables"]["app_settings"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_profile_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      current_profile_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
      is_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
