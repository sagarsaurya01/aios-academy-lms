import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { currentUser } from "@/lib/session";
import { getCourse, getChapters, getLessons, getBatchesForCourse, courseLessons } from "@/lib/data";
import { addChapterAction, addLessonAction, publishBatchAction } from "@/app/actions";

export default function CourseBuilder({ params }: { params: { id: string } }) {
  const me = currentUser();
  if (!me) redirect("/");
  if (me.role !== "admin") redirect("/");
  const course = getCourse(params.id);
  if (!course) notFound();
  const chapters = getChapters(course.id);
  const batch = getBatchesForCourse(course.id)[0];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Shell user={me}>
      <Link href="/admin" className="text-sm text-muted hover:text-ink">← Admin</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-ink">{course.title}</h1>
          <p className="text-sm text-muted">{courseLessons(course.id).length} lessons · <span className={course.published ? "text-good" : ""}>{course.published ? "Published" : "Draft"}</span></p>
        </div>
        {course.published && <Link href={`/courses/${course.id}`} className="btn-ghost">View live page</Link>}
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-[1fr_320px]">
        {/* curriculum */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Curriculum</h2>
          {chapters.length === 0 && <div className="card text-sm text-muted">No chapters yet. Add one on the right.</div>}
          {chapters.map((ch) => (
            <div key={ch.id} className="card">
              <div className="mb-2 flex items-center justify-between">
                <b className="text-ink">{ch.title}</b>
                <span className="pill">{ch.dripDay === 0 ? "From day 1" : "Unlocks day " + ch.dripDay}</span>
              </div>
              <ul className="mb-3 space-y-1 text-sm text-muted">
                {getLessons(ch.id).map((l) => (
                  <li key={l.id} className="flex items-center gap-2"><span className="text-brand">{l.kind === "quiz" ? "◆" : "▸"}</span>{l.title}<span className="ml-auto">{l.minutes} min</span></li>
                ))}
                {getLessons(ch.id).length === 0 && <li className="italic">No lessons yet.</li>}
              </ul>
              <form action={addLessonAction} className="space-y-2 rounded-lg bg-sunk p-3">
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="chapterId" value={ch.id} />
                <div className="flex gap-2">
                  <input name="title" required placeholder="Lesson title" className="field flex-1" />
                  <input name="minutes" type="number" min="1" defaultValue="10" className="field w-20" />
                </div>
                <textarea name="content" rows={2} placeholder="Lesson text" className="field" />
                <button className="btn-ghost text-sm">+ Add lesson</button>
              </form>
            </div>
          ))}
          <form action={addChapterAction} className="card space-y-3">
            <h3 className="text-sm font-semibold text-ink">Add a chapter</h3>
            <div className="flex gap-2">
              <input name="title" required placeholder="Chapter title" className="field flex-1" />
              <div className="w-28">
                <input name="dripDay" type="number" min="0" defaultValue="0" className="field" title="Unlocks this many days into the batch" />
              </div>
            </div>
            <input type="hidden" name="courseId" value={course.id} />
            <p className="text-xs text-muted">Drip day 0 = open at start. 7 = unlocks a week in.</p>
            <button className="btn-ghost">+ Add chapter</button>
          </form>
        </div>

        {/* publish batch */}
        <aside>
          <div className="card">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{batch ? "Batch" : "Publish as a batch"}</h2>
            {batch ? (
              <div className="text-sm text-ink">
                <p className="font-semibold">{batch.name}</p>
                <p className="text-muted">Starts {batch.startDate}{batch.seats ? ` · ${batch.seats} seats` : " · unlimited"}</p>
                <span className="pill pill-good mt-2">Live</span>
              </div>
            ) : (
              <form action={publishBatchAction} className="space-y-3">
                <input type="hidden" name="courseId" value={course.id} />
                <div><label className="label" htmlFor="name">Batch name</label><input id="name" name="name" required className="field" placeholder="November 2026 cohort" /></div>
                <div><label className="label" htmlFor="startDate">Start date</label><input id="startDate" name="startDate" type="date" defaultValue={today} className="field" /></div>
                <div><label className="label" htmlFor="seats">Seats (blank = unlimited)</label><input id="seats" name="seats" type="number" min="1" className="field" placeholder="30" /></div>
                <button className="btn w-full" disabled={courseLessons(course.id).length === 0}>Publish batch</button>
                {courseLessons(course.id).length === 0 && <p className="text-xs text-muted">Add at least one lesson first.</p>}
              </form>
            )}
          </div>
        </aside>
      </div>
    </Shell>
  );
}
