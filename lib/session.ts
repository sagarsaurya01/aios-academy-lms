// Current user, from the Supabase auth session + their profile row.
import { createClient } from "./supabase/server";
import type { User, Role } from "./data";

export async function currentUser(): Promise<User | null> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("name, email, role").eq("id", user.id).maybeSingle();
  const email = profile?.email || user.email || "";
  return {
    id: user.id,
    name: profile?.name || (email ? email.split("@")[0] : "Member"),
    email,
    role: (profile?.role as Role) ?? "learner",
  };
}
