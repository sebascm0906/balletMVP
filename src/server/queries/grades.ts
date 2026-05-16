import { requireProfile } from "@/server/queries/auth";

export async function getGrades() {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("grades")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
