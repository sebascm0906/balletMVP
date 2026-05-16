import { requireProfile } from "@/server/queries/auth";

export async function getStudents() {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getStudentProfile(studentId: string) {
  const { supabase } = await requireProfile();
  const { data: student, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!student) {
    return null;
  }

  const { data: guardianLinks, error: guardiansError } = await supabase
    .from("student_guardians")
    .select("id, relationship, is_primary, is_emergency_contact, guardians(id, full_name, phone, email)")
    .eq("student_id", studentId)
    .order("is_primary", { ascending: false });

  if (guardiansError) {
    throw new Error(guardiansError.message);
  }

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("student_enrollments")
    .select("*, groups(name, grades(name))")
    .eq("student_id", studentId)
    .order("starts_on", { ascending: false });

  if (enrollmentsError) {
    throw new Error(enrollmentsError.message);
  }

  return {
    student,
    guardianLinks: guardianLinks ?? [],
    enrollments: enrollments ?? [],
  };
}
