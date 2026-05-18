import { calculateDashboardMetrics } from "@/lib/dashboard/metrics";
import { requireProfile } from "@/server/queries/auth";

type ClassTodayRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  groups: {
    name: string;
    teacher_name: string | null;
    classroom: string | null;
    grades: { name: string } | null;
  } | null;
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
        .select("id, starts_at, ends_at, groups(name, teacher_name, classroom, grades(name))")
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

  return {
    metrics,
    month,
    year,
    classesToday: ((classesResult.data ?? []) as unknown as ClassTodayRow[]).map(
      (classItem) => ({
        id: classItem.id,
        startsAt: classItem.starts_at,
        endsAt: classItem.ends_at,
        groupName: classItem.groups?.name ?? "Grupo",
        gradeName: classItem.groups?.grades?.name ?? "Grado",
        teacherName: classItem.groups?.teacher_name ?? "Sin maestra",
        classroom: classItem.groups?.classroom ?? "Sin salón",
      }),
    ),
  };
}
