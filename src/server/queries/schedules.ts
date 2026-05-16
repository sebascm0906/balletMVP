import { requireProfile } from "@/server/queries/auth";

export type ScheduleListItem = {
  id: string;
  group_id: string;
  group_name: string;
  grade_name: string;
  weekday: number;
  starts_at: string;
  ends_at: string;
  status: "active" | "inactive";
};

type ScheduleRow = {
  id: string;
  group_id: string;
  weekday: number;
  starts_at: string;
  ends_at: string;
  status: "active" | "inactive";
  groups: {
    name: string;
    grades: { name: string } | null;
  } | null;
};

export async function getSchedules(): Promise<ScheduleListItem[]> {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("group_schedules")
    .select("id, group_id, weekday, starts_at, ends_at, status, groups(name, grades(name))")
    .order("weekday", { ascending: true })
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as ScheduleRow[]).map((schedule) => ({
    ...schedule,
    group_name: schedule.groups?.name ?? "Sin grupo",
    grade_name: schedule.groups?.grades?.name ?? "Sin grado",
  }));
}
