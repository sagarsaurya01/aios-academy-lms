import Link from "next/link";
import { User, getUsers } from "@/lib/data";
import { switchUserAction } from "@/app/actions";

// Edmingle-style layout: a dark navy icon-rail sidebar, a dark top bar with the
// academy name + a demo role switch, then a light content area with white cards.
export default function Shell({ user, children }: { user: User; children: React.ReactNode }) {
  const users = getUsers();
  const nav = [
    { href: "/", label: "Courses", icon: "▦" },
    ...(user.role === "admin" ? [{ href: "/admin", label: "Admin", icon: "◧" }] : []),
  ];

  return (
    <div className="flex min-h-screen">
      {/* dark icon rail */}
      <aside className="hidden w-[76px] shrink-0 flex-col items-center gap-1 bg-sidebar py-4 md:flex">
        <div className="mb-4 grid h-9 w-9 place-items-center rounded-lg bg-brand text-sm font-bold text-white">AI</div>
        {nav.map((n) => (
          <Link key={n.label} href={n.href} className="flex w-full flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-sidebar-text hover:text-white">
            <span className="grid h-9 w-9 place-items-center rounded-lg text-lg hover:bg-sidebar-hover">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* dark top bar */}
        <header className="flex items-center justify-between gap-3 bg-sidebar-bar px-4 py-2.5">
          <div className="flex items-center gap-2 text-white">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-brand text-xs font-bold md:hidden">AI</span>
            <span className="font-semibold">AI OS Academy</span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-sidebar-text">demo</span>
          </div>
          <div className="flex items-center gap-2">
            {/* demo role switch */}
            <form action={switchUserAction} className="flex items-center gap-1">
              <input type="hidden" name="to" value="/" />
              {users.map((u) => (
                <button key={u.id} name="uid" value={u.id} type="submit"
                  className={`rounded-md px-2 py-1 text-xs ${u.id === user.id ? "bg-brand text-white" : "bg-white/10 text-sidebar-text hover:bg-white/20"}`}>
                  {u.name.split(" ")[0]} · {u.role}
                </button>
              ))}
            </form>
          </div>
        </header>

        {/* mobile nav strip */}
        <div className="flex items-center gap-4 border-b border-line bg-surface px-4 py-2 text-sm md:hidden">
          <Link href="/" className="font-medium text-ink">Courses</Link>
          {user.role === "admin" && <Link href="/admin" className="font-medium text-ink">Admin</Link>}
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
