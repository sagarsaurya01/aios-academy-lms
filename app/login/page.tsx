"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/AuthCard";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setErr(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message); setBusy(false); return; }
    router.push("/"); router.refresh();
  }

  return (
    <AuthCard title="Welcome back" subtitle="Log in to your AI OS Academy account.">
      <form onSubmit={onSubmit} className="space-y-3">
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" type="password" required className="field" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {err && <p className="text-xs text-bad">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">New here? <Link href="/signup" className="font-semibold text-brand">Create an account</Link></p>
    </AuthCard>
  );
}
