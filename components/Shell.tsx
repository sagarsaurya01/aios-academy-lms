import Link from "next/link";
import { User, getUsers } from "@/lib/data";
import { switchUserAction } from "@/app/actions";

// Top bar with a demo role switch (admin / learner), then the content column.
export default function Shell({ user, children }: { user: User; children: React.ReactNode }) {
  const users = getUsers();
  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">AI</span>
            <span className="text-lg font-bold text-ink">AI OS Academy</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-muted">
            <Link href="/" className="hover:text-ink">Courses</Link>
            {user.role === "admin" && <Link href="/admin" className="hover:text-ink">Admin</Link>}
            {/* demo role switch */}
            <form action={switchUserAction} className="flex items-center gap-1">
              <input type="hidden" name="to" value="/" />
              <span className="text-xs text-muted">View as</span>
              {users.map((u) => (
                <button key={u.id} name="uid" value={u.id} type="submit"
                  className={`rounded-md px-2 py-1 text-xs ${u.id === user.id ? "bg-brand text-white" : "bg-sunk text-ink hover:bg-line"}`}>
                  {u.name.split(" ")[0]} <span className="opacity-70">· {u.role}</span>
                </button>
              ))}
            </form>
          </nav>
        </div>
      </header>
      <div className="border-b border-line bg-brand-soft/60">
        <div className="mx-auto max-w-5xl px-4 py-2 text-xs text-muted">
          First version — data is saved in this server session only. Payments, video and AI parts come next.
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </>
  );
}
