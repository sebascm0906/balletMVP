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
};

export async function getSchedules(): Promise<ScheduleListItem[]> {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("group_schedules")
    .select("id, group_id, weekday, starts_at, ends_at, status")
    .order("weekday", { ascending: true })
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const schedules = (data ?? []) as unknown as ScheduleRow[];
  const groupIds = [...new Set(schedules.map((schedule) => schedule.group_id))];

  if (groupIds.length === 0) {
    return [];
  }

  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("id, grade_id, name")
    .in("id", groupIds);

  if (groupsError) {
    throw new Error(groupsError.message);
  }

  const gradeIds = [...new Set((groups ?? []).map((group) => group.grade_id))];
  const { data: grades, error: gradesError } = await supabase
    .from("grades")
    .select("id, name")
    .in("id", gradeIds);

  if (gradesError) {
    throw new Error(gradesError.message);
  }

  const gradeNames = new Map((grades ?? []).map((grade) => [grade.id, grade.name]));
  const groupLookup = new Map(
    (groups ?? []).map((group) => [
      group.id,
      {
        name: group.name,
        gradeName: gradeNames.get(group.grade_id) ?? "Sin grado",
      },
    ]),
  );

  return schedules.map((schedule) => ({
    ...schedule,
    group_name: groupLookup.get(schedule.group_id)?.name ?? "Sin grupo",
    grade_name: groupLookup.get(schedule.group_id)?.gradeName ?? "Sin grado",
  }));
}
