import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { currentUser } from "@/lib/session";
import {
  getCourse, getChapters, getLessons, getBatchesForCourse, getEnrolmentForCourse,
  doneLessons, lessonOpen, dayInBatch, courseProgressPct, courseLessons,
  quizScore, eligibleForCert, getCert, getLesson,
} from "@/lib/data";
import { completeLessonAction, submitQuizAction, getCertAction } from "@/app/actions";

export default function LearnPage({
  params, searchParams,
}: { params: { id: string }; searchParams: { lesson?: string; quiz?: string } }) {
  const me = currentUser();
  if (!me) redirect("/");
  const course = getCourse(params.id);
  if (!course) notFound();
  const batch = getBatchesForCourse(course.id)[0];
  const e = getEnrolmentForCourse(me.id, course.id);
  if (!e || !batch) redirect(`/courses/${course.id}`);

  const lessons = courseLessons(course.id);
  const done = new Set(doneLessons(e.id));
  const pct = courseProgressPct(course.id, e.id);
  const eligible = eligibleForCert(course.id, e.id);
  const cert = getCert(me.id, course.id);

  // current lesson: the one in the query, else the first open+incomplete, else first
  const openLessons = lessons.filter((l) => lessonOpen(batch, l));
  const current = (searchParams.lesson && getLesson(searchParams.lesson))
    || openLessons.find((l) => !done.has(l.id)) || openLessons[0] || lessons[0];
  const justQuiz = searchParams.quiz ? getLesson(searchParams.quiz) : null;

  return (
    <Shell user={me}>
      <Link href={`/courses/${course.id}`} className="text-sm text-muted hover:text-ink">← {course.title}</Link>
      <div className="mt-2 grid gap-6 md:grid-cols-[1fr_300px]">
        {/* main */}
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-2 flex-1 rounded bg-sunk"><div className="h-2 rounded bg-brand" style={{ width: pct + "%" }} /></div>
            <span className="text-sm font-semibold text-ink">{pct}%</span>
          </div>

          {justQuiz && (
            <div className="card mb-4 border-brand">
              <b className="text-ink">Quiz result: {quizScore(e.id, justQuiz.id)}/{justQuiz.quiz?.length}</b>
              <p className="text-sm text-muted">{(quizScore(e.id, justQuiz.id) ?? 0) >= 2 ? "Passed — well done." : "Score 2+ to pass. Try again from the quiz lesson."}</p>
            </div>
          )}

          {current ? <LessonView course={course} lesson={current} batch={batch} enrolmentId={e.id} done={done} /> : <div className="card text-muted">No lessons yet.</div>}
        </div>

        {/* sidebar: curriculum + certificate */}
        <aside className="space-y-4">
          <div className="card">
            <p className="label">Day {dayInBatch(batch)} of this cohort</p>
            {getChapters(course.id).map((ch) => (
              <div key={ch.id} className="mt-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
                  <span>{ch.title}</span>
                  {ch.dripDay > dayInBatch(batch) && <span className="pill-warn pill">Day {ch.dripDay}</span>}
                </div>
                <ul className="mt-1 space-y-1">
                  {getLessons(ch.id).map((l) => {
                    const open = lessonOpen(batch, l), isDone = done.has(l.id), isCur = current?.id === l.id;
                    return (
                      <li key={l.id}>
                        {open ? (
                          <Link href={`/learn/${course.id}?lesson=${l.id}`}
                            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${isCur ? "bg-brand-soft text-brand" : "text-ink hover:bg-sunk"}`}>
                            <span className={isDone ? "text-good" : "text-muted"}>{isDone ? "✓" : l.kind === "quiz" ? "◆" : "▸"}</span>
                            <span className="min-w-0 flex-1 truncate">{l.title}</span>
                          </Link>
                        ) : (
                          <span className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted">🔒 <span className="truncate">{l.title}</span></span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="card">
            <p className="label">Certificate</p>
            {cert ? (
              <Link href={`/learn/${course.id}/certificate`} className="btn w-full">View certificate</Link>
            ) : (
              <form action={getCertAction}>
                <input type="hidden" name="courseId" value={course.id} />
                <button className="btn w-full" disabled={!eligible}>Get certificate</button>
              </form>
            )}
            {!cert && !eligible && <p className="mt-2 text-xs text-muted">Finish all lessons and pass the quiz (2+).</p>}
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function LessonView({ course, lesson, batch, enrolmentId, done }: any) {
  const isDone = done.has(lesson.id);
  if (lesson.kind === "quiz" && lesson.quiz) {
    const prev = quizScore(enrolmentId, lesson.id);
    return (
      <div>
        <h1 className="mb-1 text-xl font-bold text-ink">{lesson.title}</h1>
        <p className="mb-4 text-sm text-muted">{lesson.quiz.length} questions · score 2+ to pass{prev != null ? ` · last: ${prev}/${lesson.quiz.length}` : ""}</p>
        <form action={submitQuizAction} className="space-y-4">
          <input type="hidden" name="courseId" value={course.id} />
          <input type="hidden" name="lessonId" value={lesson.id} />
          {lesson.quiz.map((q: any, qi: number) => (
            <fieldset key={qi} className="card">
              <legend className="px-1 text-xs text-muted">Question {qi + 1}</legend>
              <b className="text-ink">{q.q}</b>
              <div className="mt-2 space-y-1">
                {q.o.map((o: string, oi: number) => (
                  <label key={oi} className="flex items-center gap-2 text-sm text-ink">
                    <input type="radio" name={"q" + qi} value={oi} required /> {o}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button className="btn">Submit answers</button>
        </form>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-4 grid aspect-video place-items-center rounded-xl bg-ink/90 text-center text-sm text-white/70">
        <div>
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-xl">▶</div>
          Video plays here · {lesson.minutes} min<br />
          <span className="text-xs opacity-70">Watermarked with the learner's name</span>
        </div>
      </div>
      <h1 className="mb-2 text-xl font-bold text-ink">{lesson.title}</h1>
      <p className="leading-relaxed text-ink/90">{lesson.content}</p>
      <div className="mt-5">
        {isDone ? <span className="pill pill-good">✓ Completed</span> : (
          <form action={completeLessonAction}>
            <input type="hidden" name="courseId" value={course.id} />
            <input type="hidden" name="lessonId" value={lesson.id} />
            <button className="btn">Mark as complete</button>
          </form>
        )}
      </div>
    </div>
  );
}
