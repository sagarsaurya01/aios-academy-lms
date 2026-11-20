// Supabase-backed data layer. All functions are async and run on the server
// (they use the request-scoped server client, so RLS sees the logged-in user).
import { createClient } from "./supabase/server";
import { quote as gstQuote, invoiceNo } from "./gst";

export type Role = "learner" | "instructor" | "admin";
export type QuizQ = { q: string; o: string[]; a: number };
export type Lesson = {
  id: string; chapterId: string; title: string;
  kind: "video" | "text" | "quiz" | "assignment"; content: string; minutes: number; position: number;
  quiz: QuizQ[] | null;
};
export type Chapter = { id: string; courseId: string; title: string; position: number; dripDay: number };
export type ChapterWithLessons = Chapter & { lessons: Lesson[] };
export type Course = { id: string; title: string; slug: string; blurb: string; priceMinor: number; level: string; published: boolean };
export type Batch = { id: string; courseId: string; name: string; startDate: string; seats: number | null; status: string };
export type Enrolment = { id: string; userId: string; batchId: string; source: string; enrolledAt: string };
export type User = { id: string; name: string; email: string; role: Role };
export type Order = {
  no: string; at: string; courseId: string; qty: number;
  buyerName: string; buyerEmail: string; buyerState: string; buyerGstin: string;
  rateMinor: number; grossMinor: number; discountMinor: number; taxableMinor: number;
  cgstMinor: number; sgstMinor: number; igstMinor: number; totalMinor: number; intra: boolean;
  coupon: string; razorpayPaymentId: string | null;
};

const DAY = 86400000;

// ---- mappers (DB snake_case -> app camelCase) ----
/* eslint-disable @typescript-eslint/no-explicit-any */
const mCourse = (r: any): Course => ({ id: r.id, title: r.title, slug: r.slug, blurb: r.blurb ?? "", priceMinor: Number(r.price_minor), level: r.level ?? "Beginner", published: r.published });
const mChapter = (r: any): Chapter => ({ id: r.id, courseId: r.course_id, title: r.title, position: r.position, dripDay: r.drip_day });
const mLesson = (r: any): Lesson => ({ id: r.id, chapterId: r.chapter_id, title: r.title, kind: r.kind, content: r.content ?? "", minutes: r.minutes ?? 0, position: r.position, quiz: r.quiz ?? null });
const mBatch = (r: any): Batch => ({ id: r.id, courseId: r.course_id, name: r.name, startDate: r.start_date, seats: r.seats, status: r.status });
const mEnrol = (r: any): Enrolment => ({ id: r.id, userId: r.user_id, batchId: r.batch_id, source: r.source, enrolledAt: r.enrolled_at });
const mOrder = (r: any): Order => ({
  no: r.invoice_no, at: r.created_at, courseId: r.course_id, qty: r.qty,
  buyerName: r.buyer_name ?? "", buyerEmail: r.buyer_email ?? "", buyerState: r.buyer_state ?? "", buyerGstin: r.buyer_gstin ?? "",
  rateMinor: Number(r.rate_minor), grossMinor: Number(r.gross_minor), discountMinor: Number(r.discount_minor), taxableMinor: Number(r.taxable_minor),
  cgstMinor: Number(r.cgst_minor), sgstMinor: Number(r.sgst_minor), igstMinor: Number(r.igst_minor), totalMinor: Number(r.total_minor), intra: r.intra,
  coupon: r.coupon ?? "", razorpayPaymentId: r.razorpay_payment_id ?? null,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

// ================= catalog / content =================
export async function getPublishedCourses(): Promise<Course[]> {
  const sb = createClient();
  const { data } = await sb.from("courses").select("*").eq("published", true).order("created_at");
  return (data ?? []).map(mCourse);
}
export async function getCourses(): Promise<Course[]> {
  const sb = createClient();
  const { data } = await sb.from("courses").select("*").order("created_at");
  return (data ?? []).map(mCourse);
}
export async function getCourse(id: string): Promise<Course | null> {
  const sb = createClient();
  const { data } = await sb.from("courses").select("*").eq("id", id).maybeSingle();
  return data ? mCourse(data) : null;
}
export async function getOutline(courseId: string): Promise<ChapterWithLessons[]> {
  const sb = createClient();
  const { data: chapters } = await sb.from("chapters").select("*").eq("course_id", courseId).order("position");
  const chs = (chapters ?? []).map(mChapter);
  if (chs.length === 0) return [];
  const { data: lessons } = await sb.from("lessons").select("*").in("chapter_id", chs.map((c) => c.id)).order("position");
  const ls = (lessons ?? []).map(mLesson);
  return chs.map((ch) => ({ ...ch, lessons: ls.filter((l) => l.chapterId === ch.id) }));
}
export async function courseLessons(courseId: string): Promise<Lesson[]> {
  return (await getOutline(courseId)).flatMap((ch) => ch.lessons);
}
export async function getLesson(id: string): Promise<Lesson | null> {
  const sb = createClient();
  const { data } = await sb.from("lessons").select("*").eq("id", id).maybeSingle();
  return data ? mLesson(data) : null;
}
export async function getBatchForCourse(courseId: string): Promise<Batch | null> {
  const sb = createClient();
  const { data } = await sb.from("batches").select("*").eq("course_id", courseId).order("start_date").limit(1).maybeSingle();
  return data ? mBatch(data) : null;
}

// ================= enrolment / progress =================
export async function getEnrolmentForCourse(userId: string, courseId: string): Promise<Enrolment | null> {
  const sb = createClient();
  const { data: batches } = await sb.from("batches").select("id").eq("course_id", courseId);
  const ids = (batches ?? []).map((b) => b.id);
  if (ids.length === 0) return null;
  const { data } = await sb.from("enrolments").select("*").eq("user_id", userId).in("batch_id", ids).limit(1).maybeSingle();
  return data ? mEnrol(data) : null;
}
export async function enrol(userId: string, batchId: string, source = "individual"): Promise<Enrolment | null> {
  const sb = createClient();
  const { data } = await sb.from("enrolments").upsert({ user_id: userId, batch_id: batchId, source }, { onConflict: "user_id,batch_id" }).select("*").maybeSingle();
  return data ? mEnrol(data) : null;
}
export async function markComplete(enrolmentId: string, lessonId: string): Promise<void> {
  const sb = createClient();
  await sb.from("lesson_progress").upsert({ enrolment_id: enrolmentId, lesson_id: lessonId }, { onConflict: "enrolment_id,lesson_id" });
}
export async function doneLessons(enrolmentId: string): Promise<string[]> {
  const sb = createClient();
  const { data } = await sb.from("lesson_progress").select("lesson_id").eq("enrolment_id", enrolmentId);
  return (data ?? []).map((r) => r.lesson_id);
}

// drip + progress — pure helpers on already-fetched data
export function dayInBatch(batch: Batch): number {
  return Math.floor((Date.now() - new Date(batch.startDate).getTime()) / DAY);
}
export function chapterOpen(batch: Batch, dripDay: number): boolean {
  return dayInBatch(batch) >= dripDay;
}
export function progressPct(totalLessons: number, doneCount: number): number {
  return totalLessons ? Math.round((doneCount / totalLessons) * 100) : 0;
}

// ================= quiz =================
export async function saveQuiz(enrolmentId: string, lessonId: string, score: number): Promise<void> {
  const sb = createClient();
  const { data: ex } = await sb.from("quiz_scores").select("score").eq("enrolment_id", enrolmentId).eq("lesson_id", lessonId).maybeSingle();
  if (!ex || score > ex.score) await sb.from("quiz_scores").upsert({ enrolment_id: enrolmentId, lesson_id: lessonId, score }, { onConflict: "enrolment_id,lesson_id" });
}
export async function quizScore(enrolmentId: string, lessonId: string): Promise<number | null> {
  const sb = createClient();
  const { data } = await sb.from("quiz_scores").select("score").eq("enrolment_id", enrolmentId).eq("lesson_id", lessonId).maybeSingle();
  return data ? data.score : null;
}
export async function quizScores(enrolmentId: string): Promise<Record<string, number>> {
  const sb = createClient();
  const { data } = await sb.from("quiz_scores").select("lesson_id,score").eq("enrolment_id", enrolmentId);
  const out: Record<string, number> = {};
  (data ?? []).forEach((r) => { out[r.lesson_id] = r.score; });
  return out;
}

// ================= certificate =================
export async function eligibleForCert(courseId: string, enrolmentId: string): Promise<boolean> {
  const lessons = await courseLessons(courseId);
  if (lessons.length === 0) return false;
  const done = new Set(await doneLessons(enrolmentId));
  if (!lessons.every((l) => done.has(l.id))) return false;
  const scores = await quizScores(enrolmentId);
  const quizzes = lessons.filter((l) => l.kind === "quiz");
  return quizzes.every((l) => (scores[l.id] ?? -1) >= 2);
}
export async function getCert(userId: string, courseId: string) {
  const sb = createClient();
  const { data } = await sb.from("certificates").select("*").eq("user_id", userId).eq("course_id", courseId).maybeSingle();
  return data ? { userId: data.user_id, courseId: data.course_id, certNo: data.cert_no, issuedAt: data.issued_at } : null;
}
export async function issueCert(userId: string, courseId: string) {
  const ex = await getCert(userId, courseId);
  if (ex) return ex;
  const sb = createClient();
  const certNo = "AIOS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const { data } = await sb.from("certificates").insert({ user_id: userId, course_id: courseId, cert_no: certNo }).select("*").maybeSingle();
  return data ? { userId: data.user_id, courseId: data.course_id, certNo: data.cert_no, issuedAt: data.issued_at } : null;
}

// ================= admin: course builder =================
export async function createCourse(title: string, blurb: string): Promise<Course | null> {
  const sb = createClient();
  const slug = (title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "course") + "-" + Math.random().toString(36).slice(2, 6);
  const { data } = await sb.from("courses").insert({ title, blurb, slug, price_minor: 0, level: "Beginner", published: false }).select("*").maybeSingle();
  return data ? mCourse(data) : null;
}
export async function addChapter(courseId: string, title: string, dripDay: number) {
  const sb = createClient();
  const { count } = await sb.from("chapters").select("id", { count: "exact", head: true }).eq("course_id", courseId);
  await sb.from("chapters").insert({ course_id: courseId, title, drip_day: dripDay, position: count ?? 0 });
}
export async function addLesson(chapterId: string, title: string, content: string, minutes: number) {
  const sb = createClient();
  const { count } = await sb.from("lessons").select("id", { count: "exact", head: true }).eq("chapter_id", chapterId);
  await sb.from("lessons").insert({ chapter_id: chapterId, title, content, minutes, kind: "video", position: count ?? 0 });
}
export async function publishCourse(courseId: string) {
  const sb = createClient();
  await sb.from("courses").update({ published: true }).eq("id", courseId);
}
export async function createBatch(courseId: string, name: string, startDate: string, seats: number | null) {
  const sb = createClient();
  await sb.from("batches").insert({ course_id: courseId, name, start_date: startDate, seats, status: "running" });
}

// ================= orders / GST invoices =================
export async function createOrder(input: {
  userId: string; courseId: string; qty: number;
  buyerName: string; buyerEmail: string; buyerState: string; buyerGstin: string;
  coupon?: string; razorpayPaymentId?: string | null;
}): Promise<Order> {
  const sb = createClient();
  const course = (await getCourse(input.courseId))!;
  const q = gstQuote(course.priceMinor, input.qty, input.buyerState, input.coupon || "");
  const { count } = await sb.from("orders").select("id", { count: "exact", head: true });
  const no = invoiceNo((count ?? 0) + 1);
  const { data } = await sb.from("orders").insert({
    buyer_user_id: input.userId, course_id: input.courseId, qty: input.qty,
    buyer_name: input.buyerName, buyer_email: input.buyerEmail, buyer_state: input.buyerState, buyer_gstin: input.buyerGstin,
    rate_minor: course.priceMinor, gross_minor: q.gross, discount_minor: q.discount, taxable_minor: q.taxable,
    cgst_minor: q.cgst, sgst_minor: q.sgst, igst_minor: q.igst, total_minor: q.total, intra: q.intra,
    coupon: q.coupon, invoice_no: no, razorpay_payment_id: input.razorpayPaymentId ?? null,
  }).select("*").single();
  // enrol the buyer in the course's first batch
  const batch = await getBatchForCourse(input.courseId);
  if (batch) await enrol(input.userId, batch.id, input.qty > 1 ? "org_seat" : "individual");
  return mOrder(data);
}
export async function getOrder(no: string): Promise<Order | null> {
  const sb = createClient();
  const { data } = await sb.from("orders").select("*").eq("invoice_no", no).maybeSingle();
  return data ? mOrder(data) : null;
}
