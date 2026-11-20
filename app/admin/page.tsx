import Link from "next/link";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { currentUser } from "@/lib/session";
import { getCourses, getBatchForCourse, courseLessons } from "@/lib/data";
import { createCourseAction } from "@/app/actions";

export default async function AdminPage({ searchParams }: { searchParams: { error?: string } }) {
  const me = await currentUser();
  if (!me) redirect("/login");
  if (me.role !== "admin") return <Shell user={me}><div className="card">Admin only.</div></Shell>;

  const courses = await getCourses();
  const rows = await Promise.all(courses.map(async (c) => ({
    course: c, batch: await getBatchForCourse(c.id), nLessons: (await courseLessons(c.id)).length,
  })));
  const published = courses.filter((c) => c.published).length;
  const lessonCount = rows.reduce((a, r) => a + r.nLessons, 0);

  return (
    <Shell user={me}>
      <h1 className="mb-4 text-2xl font-bold text-ink">Welcome back, {me.name.split(" ")[0]}</h1>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="card"><p className="label">Courses</p><p className="mt-1 text-2xl font-bold text-ink">{courses.length}</p></div>
        <div className="card"><p className="label">Published</p><p className="mt-1 text-2xl font-bold text-brand">{published}</p></div>
        <div className="card"><p className="label">Lessons</p><p className="mt-1 text-2xl font-bold text-ink">{lessonCount}</p></div>
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Your courses</h2>
          {rows.length === 0 ? (
            <div className="card text-sm text-muted">No courses yet. Create your first one.</div>
          ) : (
            <ul className="space-y-2">
              {rows.map(({ course: c, batch, nLessons }) => (
                <li key={c.id}>
                  <Link href={`/admin/courses/${c.id}`} className="card flex items-center justify-between hover:border-brand">
                    <div>
                      <p className="font-semibold text-ink">{c.title}</p>
                      <p className="text-xs text-muted">{nLessons} lessons · {batch ? batch.name : "no batch yet"}</p>
                    </div>
                    <span className={`pill ${c.published ? "pill-good" : ""}`}>{c.published ? "Published" : "Draft"}</span>
                  </Link>
                </li>
              ))}
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
