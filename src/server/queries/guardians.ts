import { requireProfile } from "@/server/queries/auth";

export async function getGuardians() {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("guardians")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
