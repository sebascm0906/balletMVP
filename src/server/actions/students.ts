"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deactivateStudentSchema, studentSchema } from "@/lib/validations/student";
import { STAFF_ROLES } from "@/server/permissions/roles";
import { requireRole } from "@/server/queries/auth";
import type { ActionState } from "@/server/actions/types";

async function generateStudentFolio() {
  const { supabase } = await requireRole(STAFF_ROLES);
  const { data: settings } = await supabase
    .from("app_settings")
    .select("student_folio_prefix")
    .limit(1)
    .maybeSingle();
  const { count } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true });

  const prefix = settings?.student_folio_prefix ?? "ALU";
  return `${prefix}-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export async function createStudentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = studentSchema.safeParse({
    fullName: formData.get("fullName"),
    birthDate: formData.get("birthDate"),
    phone: formData.get("phone"),
    joinedAt: formData.get("joinedAt"),
    medicalNotes: formData.get("medicalNotes"),
    generalNotes: formData.get("generalNotes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase } = await requireRole(STAFF_ROLES);
  const folio = await generateStudentFolio();
  const { data, error } = await supabase
    .from("students")
    .insert({
      folio,
      full_name: parsed.data.fullName,
      birth_date: parsed.data.birthDate,
      phone: parsed.data.phone || null,
      joined_at: parsed.data.joinedAt,
      medical_notes: parsed.data.medicalNotes || null,
      general_notes: parsed.data.generalNotes || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/alumnas");
  redirect(`/alumnas/${data.id}`);
}

export async function deactivateStudentAction(formData: FormData) {
  const parsed = deactivateStudentSchema.safeParse({
    studentId: formData.get("studentId"),
    leftAt: formData.get("leftAt"),
    leftReason: formData.get("leftReason"),
  });

  if (!parsed.success) {
    return;
  }

  const { supabase } = await requireRole(STAFF_ROLES);
  await supabase
    .from("students")
    .update({
      status: "inactive",
      left_at: parsed.data.leftAt,
      left_reason: parsed.data.leftReason,
    })
    .eq("id", parsed.data.studentId);
  revalidatePath("/alumnas");
  revalidatePath(`/alumnas/${parsed.data.studentId}`);
}

export async function activateStudentAction(formData: FormData) {
  const studentId = String(formData.get("studentId") ?? "");

  if (!studentId) {
    return;
  }

  const { supabase } = await requireRole(STAFF_ROLES);
  await supabase
    .from("students")
    .update({ status: "active", left_at: null, left_reason: null })
    .eq("id", studentId);
  revalidatePath("/alumnas");
  revalidatePath(`/alumnas/${studentId}`);
}
