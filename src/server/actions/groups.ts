"use server";

import { revalidatePath } from "next/cache";

import { groupSchema } from "@/lib/validations/group";
import { STAFF_ROLES } from "@/server/permissions/roles";
import { requireRole } from "@/server/queries/auth";
import type { ActionState } from "@/server/actions/types";
import type { ActiveStatus } from "@/types/database";

export async function createGroupAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = groupSchema.safeParse({
    gradeId: formData.get("gradeId"),
    name: formData.get("name"),
    teacherName: formData.get("teacherName"),
    classroom: formData.get("classroom"),
    capacity: formData.get("capacity"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase } = await requireRole(STAFF_ROLES);
  const { error } = await supabase.from("groups").insert({
    grade_id: parsed.data.gradeId,
    name: parsed.data.name,
    teacher_name: parsed.data.teacherName || null,
    classroom: parsed.data.classroom || null,
    capacity: parsed.data.capacity,
    status: "active",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/grupos");
  return { success: "Grupo creado." };
}

export async function updateGroupStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !["active", "inactive"].includes(status)) {
    return;
  }

  const nextStatus = status as ActiveStatus;
  const { supabase } = await requireRole(STAFF_ROLES);
  await supabase.from("groups").update({ status: nextStatus }).eq("id", id);
  revalidatePath("/grupos");
}
