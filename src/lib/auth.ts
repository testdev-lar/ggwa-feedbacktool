import { createSupabaseServerClient } from "./supabase-auth";

export async function isAuthenticated(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}
