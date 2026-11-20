import Link from "next/link";
import { User } from "@/lib/data";
import { signOutAction } from "@/app/actions";

// The AI OS leaf symbol (from the brand sheet).
export function AiosMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="aiosL" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#141A3D" /><stop offset="0.5" stopColor="#0F3DFF" /><stop offset="1" stopColor="#7655E8" />
        </linearGradient>
        <linearGradient id="aiosR" x1="1" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#141A3D" /><stop offset="0.55" stopColor="#FF8A22" /><stop offset="1" stopColor="#ffd0a3" />
        </linearGradient>
      </defs>
      <path d="M20 4 C11 8 5 13 5 20 C5 27 12 33 20 36.5" stroke="url(#aiosL)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M20 4 C29 8 35 13 35 20 C35 27 28 33 20 36.5" stroke="url(#aiosR)" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

// AI OS layout: navy icon rail + navy top bar (academy name, who's logged in,
// sign out), then a cream content area with white cards.
export default function Shell({ user, children }: { user: User; children: React.ReactNode }) {
  const nav = [
    { href: "/", label: "Courses", icon: "▦" },
    ...(user.role === "admin" ? [{ href: "/admin", label: "Admin", icon: "◧" }] : []),
  ];
  const initials = (user.name || user.email || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-[76px] shrink-0 flex-col items-center gap-1 bg-sidebar py-4 md:flex">
        <div className="mb-4"><AiosMark size={34} /></div>
        {nav.map((n) => (
          <Link key={n.label} href={n.href} className="flex w-full flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-sidebar-text hover:text-white">
            <span className="grid h-9 w-9 place-items-center rounded-lg text-lg hover:bg-sidebar-hover">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 bg-sidebar-bar px-4 py-2.5">
          <div className="flex items-center gap-2 text-white">
            <span className="md:hidden"><AiosMark size={26} /></span>
            <span className="font-display font-semibold">AI OS Academy</span>
            {user.role === "admin" && <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-sidebar-text">admin</span>}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-[11px] font-bold">{initials}</span>
              <span className="hidden text-sm sm:inline">{user.name}</span>
            </div>
            <form action={signOutAction}>
              <button className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-sidebar-text hover:bg-white/20 hover:text-white">Sign out</button>
            </form>
          </div>
        </header>

        <div className="flex items-center gap-4 border-b border-line bg-surface px-4 py-2 text-sm md:hidden">
          <Link href="/" className="font-medium text-ink">Courses</Link>
          {user.role === "admin" && <Link href="/admin" className="font-medium text-ink">Admin</Link>}
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
