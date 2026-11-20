"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions";

function Mark() {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="cL" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0" stopColor="#141A3D" /><stop offset="0.5" stopColor="#0F3DFF" /><stop offset="1" stopColor="#7655E8" /></linearGradient>
        <linearGradient id="cR" x1="1" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor="#141A3D" /><stop offset="0.55" stopColor="#FF8A22" /><stop offset="1" stopColor="#ffd0a3" /></linearGradient>
      </defs>
      <path d="M20 4 C11 8 5 13 5 20 C5 27 12 33 20 36.5" stroke="url(#cL)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M20 4 C29 8 35 13 35 20 C35 27 28 33 20 36.5" stroke="url(#cR)" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

type Item = { href: string; label: string; icon: React.ReactNode; badge?: string };
const I = (d: React.ReactNode) => <svg fill="none" strokeWidth="1.8" viewBox="0 0 24 24" className="h-[17px] w-[17px] shrink-0 stroke-current">{d}</svg>;

const MAIN: Item[] = [
  { href: "/admin", label: "Dashboard", icon: I(<><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></>) },
  { href: "/admin/courses", label: "Courses", icon: I(<><path d="M4 5h16v14H4z" /><path d="M4 9h16" /></>) },
  { href: "/admin/batches", label: "Batches", icon: I(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></>) },
  { href: "/admin/live", label: "Live Classes", icon: I(<><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3z" /></>) },
  { href: "/admin/learners", label: "Learners", icon: I(<><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><circle cx="18" cy="9" r="2.3" /></>) },
  { href: "/admin/companies", label: "Companies", icon: I(<><path d="M3 21V8l9-5 9 5v13" /><path d="M9 21v-6h6v6" /></>), badge: "B2B" },
];
const TEACH: Item[] = [
  { href: "/admin/assessments", label: "Assessments", icon: I(<><path d="M9 11l3 3 8-8" /><path d="M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h11" /></>) },
  { href: "/admin/certificates", label: "Certificates", icon: I(<><circle cx="12" cy="9" r="5" /><path d="M9 14l-2 7 5-3 5 3-2-7" /></>) },
  { href: "/admin/analytics", label: "Analytics", icon: I(<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>) },
  { href: "/admin/veda", label: "Veda AI", icon: I(<><circle cx="13" cy="11" r="8" /><path d="M13 7v4l3 2" /></>) },
];
const SETUP: Item[] = [
  { href: "/admin/branding", label: "Branding", icon: I(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>) },
  { href: "/admin/settings", label: "Settings", icon: I(<><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.3 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.3-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z" /></>) },
];
const ALL = [...MAIN, ...TEACH, ...SETUP];

export default function ConsoleChrome({ user, children }: { user: { name: string; role: string }; children: React.ReactNode }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  const active = ALL.slice().reverse().find((i) => isActive(i.href));
  const initials = (user.name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const link = (n: Item) => (
    <Link key={n.href} href={n.href}
      className={`flex items-center gap-[11px] rounded-[10px] px-[11px] py-[9px] text-[13.5px] font-medium ${isActive(n.href) ? "bg-gradient-to-r from-brand to-purple text-white shadow-[0_6px_16px_-6px_#0F3DFF]" : "text-sidebar-text hover:bg-white/5 hover:text-white"}`}>
      {n.icon}<span className="whitespace-nowrap">{n.label}</span>
      {n.badge && <span className={`ml-auto rounded-[10px] px-[7px] py-px text-[10px] ${isActive(n.href) ? "bg-white/25" : "bg-white/15"} text-white`}>{n.badge}</span>}
    </Link>
  );
  const sec = (t: string) => <div className="px-[10px] pb-1.5 pt-3.5 text-[9.5px] uppercase tracking-[0.14em] text-[#585e86]">{t}</div>;

  return (
    <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="sticky top-0 z-20 flex gap-1 overflow-x-auto bg-sidebar px-3 py-2.5 md:h-screen md:flex-col md:self-start md:overflow-y-auto md:px-3.5 md:py-[18px]">
        <div className="mb-5 hidden items-center gap-[11px] px-2 md:flex">
          <Mark />
          <div className="leading-none"><b className="font-display text-[16px] font-semibold text-white">AI OS Academy</b><span className="mt-[3px] block text-[9.5px] uppercase tracking-[0.14em] text-sidebar-text">Making Business AI Native</span></div>
        </div>
        {MAIN.map(link)}
        <div className="hidden md:block">{sec("Teaching")}</div>
        {TEACH.map(link)}
        <div className="hidden md:block">{sec("Setup")}</div>
        {SETUP.map(link)}
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-3.5 border-b border-line bg-surface px-4 py-3">
          <div className="text-[12.5px] text-muted"><b className="font-display text-fg">{active?.label ?? "Dashboard"}</b> <span className="px-1">·</span> Overview</div>
          <div className="ml-auto hidden items-center gap-2 rounded-[10px] border border-line bg-sunk px-3 py-[7px] text-faint sm:flex" style={{ width: "min(280px,30vw)" }}>
            <svg fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-[15px] w-[15px] stroke-current"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
            <input placeholder="Search courses, learners, invoices…" className="w-full bg-transparent text-[13px] text-fg outline-none" />
          </div>
          <div className="relative grid h-9 w-9 place-items-center rounded-[10px] border border-line bg-sunk text-muted">
            <svg fill="none" strokeWidth="1.8" viewBox="0 0 24 24" className="h-[17px] w-[17px] stroke-current"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
            <span className="absolute right-2 top-[7px] h-[7px] w-[7px] rounded-full border-2 border-surface bg-orange" />
          </div>
          <div className="flex items-center gap-2">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-gradient-to-br from-brand to-purple text-[13px] font-bold text-white">{initials}</span>
            <div className="hidden leading-tight sm:block"><b className="text-[13px] text-fg">{user.name}</b><small className="block text-[11px] text-muted">Owner · {user.role === "admin" ? "Admin" : "Member"}</small></div>
          </div>
          <form action={signOutAction}><button className="rounded-md border border-line bg-sunk px-2.5 py-1 text-xs text-muted hover:text-fg">Sign out</button></form>
        </header>
        <main className="flex-1 px-4 py-5 md:px-6">{children}</main>
      </div>
    </div>
  );
}
