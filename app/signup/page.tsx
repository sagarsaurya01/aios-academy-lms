"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/AuthCard";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const res = await fetch("/api/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email: email.trim(), password }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(body.error || "Could not create your account."); setBusy(false); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setErr("Account created — please log in."); setBusy(false); router.push("/login"); return; }
    router.push("/"); router.refresh();
  }

  return (
    <AuthCard title="Create your account" subtitle="Start learning with AI OS Academy.">
      <form onSubmit={onSubmit} className="space-y-3">
        <div><label className="label" htmlFor="name">Your name</label><input id="name" required className="field" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" type="password" required minLength={6} className="field" value={password} onChange={(e) => setPassword(e.target.value)} /><p className="mt-1 text-xs text-muted">At least 6 characters.</p></div>
        {err && <p className="text-xs text-bad">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">Already have an account? <Link href="/login" className="font-semibold text-brand">Log in</Link></p>
    </AuthCard>
  );
}
