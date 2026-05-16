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
  grades: { name: string } | null;
};

export async function getGroups(): Promise<GroupListItem[]> {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("groups")
    .select("id, grade_id, name, teacher_name, classroom, capacity, status, grades(name)")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const groups = (data ?? []) as unknown as GroupRow[];
  const { data: enrollments, error: enrollmentError } = await supabase
    .from("student_enrollments")
    .select("group_id")
    .eq("status", "active");

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  const counts = new Map<string, number>();
  for (const enrollment of enrollments ?? []) {
    counts.set(enrollment.group_id, (counts.get(enrollment.group_id) ?? 0) + 1);
  }

  return groups.map((group) => ({
    ...group,
    grade_name: group.grades?.name ?? "Sin grado",
    active_enrollments: counts.get(group.id) ?? 0,
  }));
}
