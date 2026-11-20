// Creates an email-confirmed account (service role), so sign-up can log in
// immediately without a confirmation email. Registration is open in v1.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { name, email, password } = await req.json().catch(() => ({}));
  if (!email || !password || String(password).length < 6)
    return NextResponse.json({ error: "Enter an email and a password of at least 6 characters." }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: String(email).trim(),
    password: String(password),
    email_confirm: true,
    user_metadata: { name: String(name || "").trim() || String(email).split("@")[0] },
  });
  if (error) {
    const msg = /registered|exists/i.test(error.message) ? "That email already has an account — try logging in." : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
