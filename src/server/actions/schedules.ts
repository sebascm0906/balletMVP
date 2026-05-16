"use server";

import { revalidatePath } from "next/cache";

import { scheduleSchema } from "@/lib/validations/schedule";
import { STAFF_ROLES } from "@/server/permissions/roles";
import { requireRole } from "@/server/queries/auth";
import type { ActionState } from "@/server/actions/types";
import type { ActiveStatus } from "@/types/database";

export async function createGroupScheduleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = scheduleSchema.safeParse({
    groupId: formData.get("groupId"),
    weekday: formData.get("weekday"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase } = await requireRole(STAFF_ROLES);
  const { error } = await supabase.from("group_schedules").insert({
    group_id: parsed.data.groupId,
    weekday: parsed.data.weekday,
    starts_at: parsed.data.startsAt,
    ends_at: parsed.data.endsAt,
    status: "active",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/horarios");
  return { success: "Horario creado." };
}

export async function updateGroupScheduleStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !["active", "inactive"].includes(status)) {
    return;
  }

  const nextStatus = status as ActiveStatus;
  const { supabase } = await requireRole(STAFF_ROLES);
  await supabase.from("group_schedules").update({ status: nextStatus }).eq("id", id);
  revalidatePath("/horarios");
}
