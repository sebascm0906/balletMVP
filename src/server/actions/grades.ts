"use server";

import { revalidatePath } from "next/cache";

import { gradeSchema } from "@/lib/validations/grade";
import { STAFF_ROLES } from "@/server/permissions/roles";
import { requireRole } from "@/server/queries/auth";
import type { ActionState } from "@/server/actions/types";
import type { ActiveStatus } from "@/types/database";

export async function createGradeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = gradeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    suggestedMinAge: formData.get("suggestedMinAge"),
    suggestedMaxAge: formData.get("suggestedMaxAge"),
    baseMonthlyFee: formData.get("baseMonthlyFee"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase } = await requireRole(STAFF_ROLES);
  const { error } = await supabase.from("grades").insert({
    name: parsed.data.name,
    description: parsed.data.description || null,
    suggested_min_age: parsed.data.suggestedMinAge ?? null,
    suggested_max_age: parsed.data.suggestedMaxAge ?? null,
    base_monthly_fee: parsed.data.baseMonthlyFee,
    status: "active",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/grados");
  return { success: "Grado creado." };
}

export async function updateGradeStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !["active", "inactive"].includes(status)) {
    return;
  }

  const nextStatus = status as ActiveStatus;
  const { supabase } = await requireRole(STAFF_ROLES);
  await supabase.from("grades").update({ status: nextStatus }).eq("id", id);
  revalidatePath("/grados");
}
