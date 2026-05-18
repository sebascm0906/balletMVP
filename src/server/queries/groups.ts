import { requireProfile } from "@/server/queries/auth";

export type GroupListItem = {
  id: string;
  grade_id: string;
  grade_name: string;
  name: string;
  teacher_name: string | null;
  classroom: string | null;
  capacity: number;
  status: "active" | "inactive";
  active_enrollments: number;
};

type GroupRow = {
  id: string;
  grade_id: string;
  name: string;
  teacher_name: string | null;
  classroom: string | null;
  capacity: number;
  status: "active" | "inactive";
};

export async function getGroups(): Promise<GroupListItem[]> {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("groups")
    .select("id, grade_id, name, teacher_name, classroom, capacity, status")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const groups = (data ?? []) as unknown as GroupRow[];
  const [gradesResult, enrollmentsResult] = await Promise.all([
    supabase.from("grades").select("id, name"),
    supabase.from("student_enrollments").select("group_id").eq("status", "active"),
  ]);

  if (gradesResult.error) {
    throw new Error(gradesResult.error.message);
  }

  if (enrollmentsResult.error) {
    throw new Error(enrollmentsResult.error.message);
  }

  const gradeNames = new Map(
    (gradesResult.data ?? []).map((grade) => [grade.id, grade.name]),
  );
  const counts = new Map<string, number>();
  for (const enrollment of enrollmentsResult.data ?? []) {
    counts.set(enrollment.group_id, (counts.get(enrollment.group_id) ?? 0) + 1);
  }

  return groups.map((group) => ({
    ...group,
    grade_name: gradeNames.get(group.grade_id) ?? "Sin grado",
    active_enrollments: counts.get(group.id) ?? 0,
  }));
}
