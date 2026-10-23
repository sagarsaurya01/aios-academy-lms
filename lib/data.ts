// In-memory data layer for Milestone 0. Signatures match the future Supabase
// layer so replica-backend swaps the body without touching screens.

export type Role = "learner" | "instructor" | "admin";
export type Lesson = {
  id: string; chapterId: string; title: string;
  kind: "video" | "text" | "quiz"; content: string; minutes: number; position: number;
  quiz?: { q: string; o: string[]; a: number }[];
};
export type Chapter = { id: string; courseId: string; title: string; position: number; dripDay: number };
export type Course = { id: string; title: string; slug: string; blurb: string; priceMinor: number; level: string; published: boolean };
export type Batch = { id: string; courseId: string; name: string; startDate: string; seats: number | null; status: string };
export type Enrolment = { id: string; userId: string; batchId: string; source: string; enrolledAt: string };
export type User = { id: string; name: string; email: string; role: Role };

type DB = {
  users: User[]; courses: Course[]; chapters: Chapter[]; lessons: Lesson[];
  batches: Batch[]; enrolments: Enrolment[];
  progress: { enrolmentId: string; lessonId: string }[];
  quizScores: { enrolmentId: string; lessonId: string; score: number }[];
  certs: { userId: string; courseId: string; certNo: string; issuedAt: string }[];
};

const g = globalThis as unknown as { __lmsdb?: DB };
const DAY = 86400000;

function seed(): DB {
  const users: User[] = [
    { id: "u-admin", name: "Sagar Pathak", email: "admin@aios.in", role: "admin" },
    { id: "u-learn", name: "Priya Sen", email: "priya@demo.in", role: "learner" },
  ];
  const courses: Course[] = [
    { id: "c1", title: "AI for MSME Owners", slug: "ai-for-msme-owners", level: "Beginner", published: true, priceMinor: 0,
      blurb: "Four short chapters to find the repeat work in your business and hand it to AI." },
  ];
  const chapters: Chapter[] = [
    { id: "ch1", courseId: "c1", title: "Week 1 · Where AI saves you time", position: 0, dripDay: 0 },
    { id: "ch2", courseId: "c1", title: "Week 2 · Running the business with AI", position: 1, dripDay: 7 },
  ];
  const lessons: Lesson[] = [
    { id: "l1", chapterId: "ch1", title: "Mapping your week: find the repeat work", kind: "video", minutes: 12, position: 0,
      content: "List every task you or your staff do more than once a week. Mark each as writing, checking, chasing or deciding. Writing and chasing tasks are the easiest to hand to AI first — quotations, payment reminders, follow-up messages." },
    { id: "l2", chapterId: "ch1", title: "AI for sales follow-up and WhatsApp", kind: "video", minutes: 14, position: 1,
      content: "Give the AI your customer list with last order date and amount due, then ask it to draft a follow-up for each customer in your own tone. Keep a short style note — polite, Hinglish, under 60 words — and reuse it every time." },
    { id: "l3", chapterId: "ch2", title: "Reading your numbers with AI", kind: "video", minutes: 15, position: 0,
      content: "Export your sales and expense reports from Tally or Excel and ask the AI to explain month-on-month changes in plain language. Always cross-check totals against the original report." },
    { id: "lq", chapterId: "ch1", title: "Quiz: the basics", kind: "quiz", minutes: 5, position: 2, content: "",
      quiz: [
        { q: "Which tasks are easiest to hand to AI first?", o: ["Deciding and negotiating", "Writing and chasing", "Hiring and firing"], a: 1 },
        { q: "After AI explains your monthly numbers, you should…", o: ["Cross-check totals against the source", "Delete the source", "Send it to the bank"], a: 0 },
        { q: "A good first AI task…", o: ["Happens once a year", "Repeats weekly and can be checked", "Has no clear answer"], a: 1 },
      ] },
  ];
  const batches: Batch[] = [
    { id: "b1", courseId: "c1", name: "November 2026 cohort", startDate: isoDaysAgo(9), seats: 30, status: "running" },
  ];
  return { users, courses, chapters, lessons, batches, enrolments: [], progress: [], quizScores: [], certs: [] };
}
function isoDaysAgo(n: number) { return new Date(Date.now() - n * DAY).toISOString().slice(0, 10); }
function db(): DB { if (!g.__lmsdb) g.__lmsdb = seed(); return g.__lmsdb; }
let idc = 1000;
const newId = (p: string) => `${p}${++idc}`;

// ---- reads ----
export const getUser = (id: string) => db().users.find((u) => u.id === id) ?? null;
export const getUsers = () => db().users;
export const getCourses = () => db().courses;
export const getCourse = (id: string) => db().courses.find((c) => c.id === id) ?? null;
export const getPublishedCourses = () => db().courses.filter((c) => c.published);
export const getChapters = (courseId: string) =>
  db().chapters.filter((c) => c.courseId === courseId).sort((a, b) => a.position - b.position);
export const getLessons = (chapterId: string) =>
  db().lessons.filter((l) => l.chapterId === chapterId).sort((a, b) => a.position - b.position);
export const getLesson = (id: string) => db().lessons.find((l) => l.id === id) ?? null;
export const getBatchesForCourse = (courseId: string) => db().batches.filter((b) => b.courseId === courseId);
export const getBatch = (id: string) => db().batches.find((b) => b.id === id) ?? null;

export function courseLessons(courseId: string): Lesson[] {
  return getChapters(courseId).flatMap((ch) => getLessons(ch.id));
}
export function chapterOf(lessonId: string): Chapter | null {
  const l = getLesson(lessonId); if (!l) return null;
  return db().chapters.find((c) => c.id === l.chapterId) ?? null;
}

// ---- enrolment / progress ----
export function getEnrolment(userId: string, batchId: string) {
  return db().enrolments.find((e) => e.userId === userId && e.batchId === batchId) ?? null;
}
export function getEnrolmentForCourse(userId: string, courseId: string) {
  const batches = getBatchesForCourse(courseId).map((b) => b.id);
  return db().enrolments.find((e) => e.userId === userId && batches.includes(e.batchId)) ?? null;
}
export function enrol(userId: string, batchId: string, source = "individual") {
  const ex = getEnrolment(userId, batchId); if (ex) return ex;
  const e: Enrolment = { id: newId("e"), userId, batchId, source, enrolledAt: new Date().toISOString() };
  db().enrolments.push(e); return e;
}
export function markComplete(enrolmentId: string, lessonId: string) {
  if (!db().progress.some((p) => p.enrolmentId === enrolmentId && p.lessonId === lessonId))
    db().progress.push({ enrolmentId, lessonId });
}
export const doneLessons = (enrolmentId: string) =>
  db().progress.filter((p) => p.enrolmentId === enrolmentId).map((p) => p.lessonId);

// drip: a chapter is open iff (today - batch.start) >= chapter.dripDay
export function dayInBatch(batch: Batch): number {
  return Math.floor((Date.now() - new Date(batch.startDate).getTime()) / DAY);
}
export function lessonOpen(batch: Batch, lesson: Lesson): boolean {
  const ch = chapterOf(lesson.id); if (!ch) return false;
  return dayInBatch(batch) >= ch.dripDay;
}
export function courseProgressPct(courseId: string, enrolmentId: string): number {
  const total = courseLessons(courseId).length;
  if (!total) return 0;
  const done = doneLessons(enrolmentId).length;
  return Math.round((done / total) * 100);
}

// ---- quiz ----
export function saveQuiz(enrolmentId: string, lessonId: string, score: number) {
  const ex = db().quizScores.find((q) => q.enrolmentId === enrolmentId && q.lessonId === lessonId);
  if (ex) { if (score > ex.score) ex.score = score; } else db().quizScores.push({ enrolmentId, lessonId, score });
}
export const quizScore = (enrolmentId: string, lessonId: string) =>
  db().quizScores.find((q) => q.enrolmentId === enrolmentId && q.lessonId === lessonId)?.score ?? null;

// ---- certificate ----
export function eligibleForCert(courseId: string, enrolmentId: string): boolean {
  const lessons = courseLessons(courseId);
  const done = new Set(doneLessons(enrolmentId));
  const allDone = lessons.every((l) => done.has(l.id));
  const quizzes = lessons.filter((l) => l.kind === "quiz");
  const quizzesPassed = quizzes.every((l) => (quizScore(enrolmentId, l.id) ?? -1) >= 2);
  return allDone && quizzesPassed;
}
export function getCert(userId: string, courseId: string) {
  return db().certs.find((c) => c.userId === userId && c.courseId === courseId) ?? null;
}
export function issueCert(userId: string, courseId: string) {
  const ex = getCert(userId, courseId); if (ex) return ex;
  const c = { userId, courseId, certNo: "AIOS-" + Math.random().toString(36).slice(2, 8).toUpperCase(), issuedAt: new Date().toISOString() };
  db().certs.push(c); return c;
}

// ---- admin: course builder ----
export function createCourse(title: string, blurb: string) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || newId("course");
  const c: Course = { id: newId("c"), title, slug, blurb, priceMinor: 0, level: "Beginner", published: false };
  db().courses.push(c); return c;
}
export function addChapter(courseId: string, title: string, dripDay: number) {
  const pos = getChapters(courseId).length;
  const ch: Chapter = { id: newId("ch"), courseId, title, position: pos, dripDay };
  db().chapters.push(ch); return ch;
}
export function addLesson(chapterId: string, title: string, content: string, minutes: number) {
  const pos = getLessons(chapterId).length;
  const l: Lesson = { id: newId("l"), chapterId, title, kind: "video", content, minutes, position: pos };
  db().lessons.push(l); return l;
}
export function publishCourse(courseId: string) { const c = getCourse(courseId); if (c) c.published = true; }
export function createBatch(courseId: string, name: string, startDate: string, seats: number | null) {
  const b: Batch = { id: newId("b"), courseId, name, startDate, seats, status: "running" };
  db().batches.push(b); return b;
}
