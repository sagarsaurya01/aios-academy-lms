import Link from "next/link";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { currentUser } from "@/lib/session";
import { getCourses, getBatchesForCourse, courseLessons } from "@/lib/data";
import { createCourseAction } from "@/app/actions";

export default function AdminPage({ searchParams }: { searchParams: { error?: string } }) {
  const me = currentUser();
  if (!me) redirect("/");
  if (me.role !== "admin") return <Shell user={me}><div className="card">Admin only. Switch to Sagar (admin) up top.</div></Shell>;

  const courses = getCourses();
  return (
    <Shell user={me}>
      <h1 className="mb-4 text-2xl font-bold text-ink">Admin</h1>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Your courses</h2>
          {courses.length === 0 ? (
            <div className="card text-sm text-muted">No courses yet. Create your first one.</div>
          ) : (
            <ul className="space-y-2">
              {courses.map((c) => {
                const batch = getBatchesForCourse(c.id)[0];
                return (
                  <li key={c.id}>
                    <Link href={`/admin/courses/${c.id}`} className="card flex items-center justify-between hover:border-brand">
                      <div>
                        <p className="font-semibold text-ink">{c.title}</p>
                        <p className="text-xs text-muted">{courseLessons(c.id).length} lessons · {batch ? batch.name : "no batch yet"}</p>
                      </div>
                      <span className={`pill ${c.published ? "pill-good" : ""}`}>{c.published ? "Published" : "Draft"}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <aside>
          <div className="card">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">New course</h2>
            <form action={createCourseAction} className="space-y-3">
              <div>
                <label className="label" htmlFor="title">Title</label>
                <input id="title" name="title" required className="field" placeholder="e.g. AI for Accounts Staff" />
              </div>
              <div>
                <label className="label" htmlFor="blurb">One-line description</label>
                <input id="blurb" name="blurb" className="field" placeholder="What the learner walks away with" />
              </div>
              {searchParams.error === "title" && <p className="text-xs text-bad">Enter a title.</p>}
              <button className="btn w-full">Create course</button>
            </form>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
