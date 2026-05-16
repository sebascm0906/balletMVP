"use server";

import { revalidatePath } from "next/cache";

import { guardianSchema, studentGuardianSchema } from "@/lib/validations/guardian";
import { STAFF_ROLES } from "@/server/permissions/roles";
import { requireRole } from "@/server/queries/auth";
import type { ActionState } from "@/server/actions/types";

export async function createGuardianAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = guardianSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase } = await requireRole(STAFF_ROLES);
  const { error } = await supabase.from("guardians").insert({
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    address: parsed.data.address || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tutores");
  return { success: "Tutor creado." };
}

export async function linkGuardianToStudentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = studentGuardianSchema.safeParse({
    studentId: formData.get("studentId"),
    guardianId: formData.get("guardianId"),
    relationship: formData.get("relationship"),
    isPrimary: formData.get("isPrimary") === "on",
    isEmergencyContact: formData.get("isEmergencyContact") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase } = await requireRole(STAFF_ROLES);

  if (parsed.data.isPrimary) {
    await supabase
      .from("student_guardians")
      .update({ is_primary: false })
      .eq("student_id", parsed.data.studentId);
  }

  const { error } = await supabase.from("student_guardians").upsert(
    {
      student_id: parsed.data.studentId,
      guardian_id: parsed.data.guardianId,
      relationship: parsed.data.relationship,
      is_primary: parsed.data.isPrimary,
      is_emergency_contact: parsed.data.isEmergencyContact,
    },
    { onConflict: "student_id,guardian_id" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/alumnas/${parsed.data.studentId}`);
  return { success: "Tutor relacionado." };
}
