import Link from "next/link";
import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { currentUser } from "@/lib/session";
import { getPublishedCourses, getBatchForCourse, courseLessons, getEnrolmentForCourse } from "@/lib/data";

export default async function Home() {
  const me = await currentUser();
  if (!me) redirect("/login");

  const courses = await getPublishedCourses();
  const cards = await Promise.all(courses.map(async (c) => ({
    course: c,
    batch: await getBatchForCourse(c.id),
    nLessons: (await courseLessons(c.id)).length,
    enrolled: await getEnrolmentForCourse(me.id, c.id),
  })));

  return (
    <Shell user={me}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Courses</h1>
        <p className="text-sm text-muted">Short lessons and live cohorts you can use in your business the same week.</p>
      </div>
      {cards.length === 0 ? (
        <div className="card text-sm text-muted">No published courses yet. {me.role === "admin" && <Link href="/admin" className="text-brand">Create one →</Link>}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map(({ course: c, batch, nLessons, enrolled }) => (
            <article key={c.id} className="card flex flex-col">
              <div className="mb-2 flex gap-2">
                <span className="pill">{c.level}</span>
                <span className="pill">{nLessons} lessons</span>
                <span className="pill">{c.priceMinor ? "₹" + c.priceMinor / 100 : "Free"}</span>
              </div>
              <h3 className="font-semibold text-ink">{c.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted">{c.blurb}</p>
              {batch && <p className="mt-2 text-xs text-muted">{batch.name} · starts {batch.startDate}</p>}
              <div className="mt-3">
                {enrolled
                  ? <Link href={`/learn/${c.id}`} className="btn">Continue learning</Link>
                  : <Link href={`/courses/${c.id}`} className="btn">View course</Link>}
              </div>
            </article>
          ))}
        </div>
      )}
    </Shell>
  );
}
