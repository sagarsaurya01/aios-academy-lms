import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { currentUser } from "@/lib/session";
import { getCourse, getChapters, getLessons, getBatchesForCourse, getEnrolmentForCourse, courseLessons } from "@/lib/data";
import { enrolAction } from "@/app/actions";

export default function CoursePage({ params }: { params: { id: string } }) {
  const me = currentUser();
  if (!me) redirect("/");
  const course = getCourse(params.id);
  if (!course) notFound();
  const batch = getBatchesForCourse(course.id)[0];
  const enrolled = getEnrolmentForCourse(me.id, course.id);
  const chapters = getChapters(course.id);

  return (
    <Shell user={me}>
      <Link href="/" className="text-sm text-muted hover:text-ink">← Courses</Link>
      <div className="mt-2 grid gap-6 md:grid-cols-[1fr_280px]">
        <div>
          <h1 className="text-2xl font-bold text-ink">{course.title}</h1>
          <p className="mt-1 text-muted">{course.blurb}</p>
          <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-muted">Course content</h2>
          <div className="space-y-3">
            {chapters.map((ch) => (
              <div key={ch.id} className="card">
                <div className="mb-2 flex items-center justify-between">
                  <b className="text-ink">{ch.title}</b>
                  {ch.dripDay > 0 && <span className="pill">Unlocks day {ch.dripDay}</span>}
                </div>
                <ul className="space-y-1 text-sm text-muted">
                  {getLessons(ch.id).map((l) => (
                    <li key={l.id} className="flex items-center gap-2">
                      <span className="text-brand">{l.kind === "quiz" ? "◆" : "▸"}</span>
                      {l.title} <span className="ml-auto">{l.minutes} min</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <aside>
          <div className="card">
            <p className="text-2xl font-bold text-ink">{course.priceMinor ? "₹" + course.priceMinor / 100 : "Free"}</p>
            <p className="mb-3 text-xs text-muted">{courseLessons(course.id).length} lessons{batch ? ` · ${batch.name}` : ""}</p>
            {enrolled
              ? <Link href={`/learn/${course.id}`} className="btn w-full">Continue learning</Link>
              : <form action={enrolAction}><input type="hidden" name="courseId" value={course.id} /><button className="btn w-full">Enrol free</button></form>}
            {batch && <p className="mt-2 text-xs text-muted">Batch starts {batch.startDate}{batch.seats ? ` · ${batch.seats} seats` : ""}</p>}
          </div>
        </aside>
      </div>
    </Shell>
  );
}
