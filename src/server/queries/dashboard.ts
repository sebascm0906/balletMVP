import { calculateDashboardMetrics } from "@/lib/dashboard/metrics";
import { requireProfile } from "@/server/queries/auth";

type ClassTodayRow = {
  id: string;
  group_id: string;
  starts_at: string;
  ends_at: string;
};

export async function getDashboardSummary() {
  const { supabase } = await requireProfile();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const startOfMonth = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const startOfNextMonth = new Date(Date.UTC(year, month, 1)).toISOString();
  const weekday = now.getDay();

  const [studentsResult, groupsResult, chargesResult, paymentsResult, classesResult] =
    await Promise.all([
      supabase.from("students").select("id, status"),
      supabase.from("groups").select("id, status"),
      supabase
        .from("charges")
        .select("id, student_id, amount_due, amount_paid, status")
        .eq("month", month)
        .eq("year", year),
      supabase
        .from("payments")
        .select("amount, method")
        .eq("status", "active")
        .gte("paid_at", startOfMonth)
        .lt("paid_at", startOfNextMonth),
      supabase
        .from("group_schedules")
        .select("id, group_id, starts_at, ends_at")
        .eq("weekday", weekday)
        .eq("status", "active")
        .order("starts_at", { ascending: true }),
    ]);

  for (const result of [
    studentsResult,
    groupsResult,
    chargesResult,
    paymentsResult,
    classesResult,
  ]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const metrics = calculateDashboardMetrics({
    students: studentsResult.data ?? [],
    groups: groupsResult.data ?? [],
    charges: chargesResult.data ?? [],
    payments: paymentsResult.data ?? [],
  });
  const classRows = (classesResult.data ?? []) as unknown as ClassTodayRow[];
  const classGroupIds = [...new Set(classRows.map((classItem) => classItem.group_id))];
  const { data: classGroups, error: classGroupsError } = classGroupIds.length
    ? await supabase
        .from("groups")
        .select("id, grade_id, name, teacher_name, classroom")
        .in("id", classGroupIds)
    : { data: [], error: null };

  if (classGroupsError) {
    throw new Error(classGroupsError.message);
  }

  const classGradeIds = [...new Set((classGroups ?? []).map((group) => group.grade_id))];
  const { data: classGrades, error: classGradesError } = classGradeIds.length
    ? await supabase.from("grades").select("id, name").in("id", classGradeIds)
    : { data: [], error: null };

  if (classGradesError) {
    throw new Error(classGradesError.message);
  }

  const classGradeNames = new Map(
    (classGrades ?? []).map((grade) => [grade.id, grade.name]),
  );
  const classGroupLookup = new Map(
    (classGroups ?? []).map((group) => [
      group.id,
      {
        name: group.name,
        teacherName: group.teacher_name,
        classroom: group.classroom,
        gradeName: classGradeNames.get(group.grade_id) ?? "Grado",
      },
    ]),
  );

  return {
    metrics,
    month,
    year,
    classesToday: classRows.map((classItem) => {
      const group = classGroupLookup.get(classItem.group_id);

      return {
        id: classItem.id,
        startsAt: classItem.starts_at,
        endsAt: classItem.ends_at,
        groupName: group?.name ?? "Grupo",
        gradeName: group?.gradeName ?? "Grado",
        teacherName: group?.teacherName ?? "Sin maestra",
        classroom: group?.classroom ?? "Sin salón",
      };
    }),
  };
}
