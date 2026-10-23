import Link from "next/link";
import Shell from "@/components/Shell";
import { currentUser } from "@/lib/session";
import { getUsers, getPublishedCourses, getBatchesForCourse, courseLessons, getEnrolmentForCourse } from "@/lib/data";
import { switchUserAction } from "@/app/actions";

export default function Home() {
  const me = currentUser();
  if (!me) {
    const users = getUsers();
    return (
      <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
        <div className="w-full text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-brand text-lg font-bold text-white">AI</div>
          <h1 className="mb-1 text-2xl font-bold text-ink">AI OS Academy</h1>
          <p className="mb-6 text-sm text-muted">Practical AI training for Indian businesses. Pick a demo role to start.</p>
          <form action={switchUserAction} className="space-y-2">
            <input type="hidden" name="to" value="/" />
            {users.map((u) => (
              <button key={u.id} name="uid" value={u.id} type="submit" className="btn w-full justify-between">
                <span>Continue as {u.name}</span><span className="text-xs opacity-80">{u.role}</span>
              </button>
            ))}
          </form>
        </div>
      </main>
    );
  }

  const courses = getPublishedCourses();
  return (
    <Shell user={me}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Courses</h1>
        <p className="text-sm text-muted">Short lessons and live cohorts you can use in your business the same week.</p>
      </div>
      {courses.length === 0 ? (
        <div className="card text-sm text-muted">No published courses yet. {me.role === "admin" && <Link href="/admin" className="text-brand">Create one →</Link>}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => {
            const batch = getBatchesForCourse(c.id)[0];
            const nLessons = courseLessons(c.id).length;
            const enrolled = getEnrolmentForCourse(me.id, c.id);
            return (
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
            );
          })}
        </div>
      )}
    </Shell>
  );
}
