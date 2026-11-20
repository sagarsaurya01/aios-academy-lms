// Aggregates for the admin console (dashboard + list screens). Admin RLS lets
// these read across all rows. Data is small, so we fetch and compute in JS.
import { createClient } from "./supabase/server";
import { rupees } from "./gst";

/* eslint-disable @typescript-eslint/no-explicit-any */
const num = (v: any) => Number(v ?? 0);
const DAY = 86400000;

export type Tile = { label: string; value: string; delta?: string; kind?: "money" | "count" | "live" };
export type Dashboard = {
  tiles: Tile[];
  chart: { months: string[]; revenue: number[]; enrol: number[]; maxRev: number };
  topCourses: { id: string; title: string; learners: number; completion: number; revenue: string; accent: "blue" | "orange" }[];
  activity: { kind: "enrol" | "order" | "cert" | "seat"; text: string; when: string }[];
  liveToday: { title: string; at: string }[];
  monthName: string;
  calendar: { day: number; muted: boolean; today: boolean; has: boolean }[];
};

function monthKey(d: Date) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); }
function ago(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + " min ago";
  if (s < 86400) return Math.floor(s / 3600) + " hr ago";
  return Math.floor(s / 86400) + " d ago";
}

export async function getDashboard(): Promise<Dashboard> {
  const sb = createClient();
  const [coursesR, chaptersR, lessonsR, batchesR, enrolR, progressR, ordersR, profilesR, certsR, liveR, seatsR] = await Promise.all([
    sb.from("courses").select("id,title,published"),
    sb.from("chapters").select("id,course_id"),
    sb.from("lessons").select("id,chapter_id"),
    sb.from("batches").select("id,course_id"),
    sb.from("enrolments").select("id,user_id,batch_id,enrolled_at"),
    sb.from("lesson_progress").select("enrolment_id"),
    sb.from("orders").select("course_id,total_minor,buyer_name,qty,created_at,invoice_no"),
    sb.from("profiles").select("id,name,role"),
    sb.from("certificates").select("user_id,course_id,issued_at"),
    sb.from("live_classes").select("title,start_at"),
    sb.from("organisations").select("name,created_at"),
  ]);
  const courses = coursesR.data ?? [], chapters = chaptersR.data ?? [], lessons = lessonsR.data ?? [];
  const batches = batchesR.data ?? [], enrol = enrolR.data ?? [], progress = progressR.data ?? [];
  const orders = ordersR.data ?? [], profiles = profilesR.data ?? [], certs = certsR.data ?? [];
  const live = liveR.data ?? [], orgs = seatsR.data ?? [];

  const batchCourse = new Map(batches.map((b: any) => [b.id, b.course_id]));
  const chapterCourse = new Map(chapters.map((c: any) => [c.id, c.course_id]));
  const lessonsPerCourse = new Map<string, number>();
  lessons.forEach((l: any) => { const c = chapterCourse.get(l.chapter_id); if (c) lessonsPerCourse.set(c, (lessonsPerCourse.get(c) ?? 0) + 1); });
  const enrolCourse = new Map(enrol.map((e: any) => [e.id, batchCourse.get(e.batch_id)]));
  const nameById = new Map(profiles.map((p: any) => [p.id, p.name]));
  const titleById = new Map(courses.map((c: any) => [c.id, c.title]));

  // tiles
  const now = new Date();
  const thisMonth = monthKey(now);
  const revenueMonth = orders.filter((o: any) => monthKey(new Date(o.created_at)) === thisMonth).reduce((a: number, o: any) => a + num(o.total_minor), 0);
  const learners = profiles.filter((p: any) => p.role === "learner").length;
  const liveToday = live.filter((l: any) => new Date(l.start_at).toDateString() === now.toDateString());
  const tiles: Tile[] = [
    { label: "Revenue (this month)", value: rupees(revenueMonth), kind: "money" },
    { label: "Enrollments", value: String(enrol.length), kind: "count" },
    { label: "Active learners", value: String(learners), kind: "count" },
    { label: "Live classes", value: String(liveToday.length), delta: "Today", kind: "live" },
  ];

  // chart: last 8 months
  const months: string[] = [], revenue: number[] = [], enrolSeries: number[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    months.push(d.toLocaleDateString("en-IN", { month: "short" }));
    revenue.push(orders.filter((o: any) => monthKey(new Date(o.created_at)) === key).reduce((a: number, o: any) => a + num(o.total_minor), 0));
    enrolSeries.push(enrol.filter((e: any) => monthKey(new Date(e.enrolled_at)) === key).length);
  }
  const maxRev = Math.max(1, ...revenue);

  // top courses
  const topCourses = courses.map((c: any, i: number) => {
    const myEnrol = enrol.filter((e: any) => enrolCourse.get(e.id) === c.id);
    const myEnrolIds = new Set(myEnrol.map((e: any) => e.id));
    const totalLessons = (lessonsPerCourse.get(c.id) ?? 0) * Math.max(1, myEnrol.length);
    const done = progress.filter((p: any) => myEnrolIds.has(p.enrolment_id)).length;
    const revenue = orders.filter((o: any) => o.course_id === c.id).reduce((a: number, o: any) => a + num(o.total_minor), 0);
    return {
      id: c.id, title: c.title, learners: myEnrol.length,
      completion: totalLessons ? Math.round((done / totalLessons) * 100) : 0,
      revenue: rupees(revenue), accent: (i % 3 === 2 ? "orange" : "blue") as "blue" | "orange",
      _sort: myEnrol.length,
    };
  }).sort((a, b) => b._sort - a._sort).slice(0, 5).map(({ _sort, ...r }) => r);

  // recent activity (merge)
  type Ev = { kind: "enrol" | "order" | "cert" | "seat"; text: string; at: number; when: string };
  const evs: Ev[] = [];
  enrol.forEach((e: any) => evs.push({ kind: "enrol", at: +new Date(e.enrolled_at), when: ago(e.enrolled_at), text: `${nameById.get(e.user_id) ?? "A learner"} enrolled in ${titleById.get(enrolCourse.get(e.id)) ?? "a course"}` }));
  orders.forEach((o: any) => evs.push({ kind: o.qty > 1 ? "seat" : "order", at: +new Date(o.created_at), when: ago(o.created_at), text: o.qty > 1 ? `${o.buyer_name || "A company"} bought ${o.qty} company seats` : `GST invoice ${o.invoice_no} · ${rupees(num(o.total_minor))}` }));
  certs.forEach((c: any) => evs.push({ kind: "cert", at: +new Date(c.issued_at), when: ago(c.issued_at), text: `Certificate issued to ${nameById.get(c.user_id) ?? "a learner"}` }));
  orgs.forEach((o: any) => evs.push({ kind: "seat", at: +new Date(o.created_at), when: ago(o.created_at), text: `${o.name} added as a company` }));
  const activity = evs.sort((a, b) => b.at - a.at).slice(0, 6).map(({ kind, text, when }) => ({ kind, text, when }));

  // calendar (current month)
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDow = (first.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const prevDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  const liveDays = new Set(live.filter((l: any) => { const d = new Date(l.start_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).map((l: any) => new Date(l.start_at).getDate()));
  const calendar: Dashboard["calendar"] = [];
  for (let i = 0; i < startDow; i++) calendar.push({ day: prevDays - startDow + 1 + i, muted: true, today: false, has: false });
  for (let d = 1; d <= daysInMonth; d++) calendar.push({ day: d, muted: false, today: d === now.getDate(), has: liveDays.has(d) });
  while (calendar.length % 7 !== 0) calendar.push({ day: calendar.length - (startDow + daysInMonth) + 1, muted: true, today: false, has: false });

  return {
    tiles, chart: { months, revenue, enrol: enrolSeries, maxRev }, topCourses, activity,
    liveToday: liveToday.map((l: any) => ({ title: l.title, at: new Date(l.start_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) })),
    monthName: now.toLocaleDateString("en-IN", { month: "long", year: "numeric" }), calendar,
  };
}

// ---------------- list screens ----------------
export async function listBatches() {
  const sb = createClient();
  const [b, c, e] = await Promise.all([
    sb.from("batches").select("*").order("start_date", { ascending: false }),
    sb.from("courses").select("id,title"),
    sb.from("enrolments").select("batch_id"),
  ]);
  const title = new Map((c.data ?? []).map((x: any) => [x.id, x.title]));
  const counts: Record<string, number> = {};
  (e.data ?? []).forEach((x: any) => { counts[x.batch_id] = (counts[x.batch_id] ?? 0) + 1; });
  return (b.data ?? []).map((x: any) => ({ id: x.id, name: x.name, course: title.get(x.course_id) ?? "—", startDate: x.start_date, seats: x.seats as number | null, filled: counts[x.id] ?? 0, status: x.status }));
}

export async function listLearners() {
  const sb = createClient();
  const [p, e, b, pr, l, ch] = await Promise.all([
    sb.from("profiles").select("id,name,email,role,created_at"),
    sb.from("enrolments").select("id,user_id,batch_id"),
    sb.from("batches").select("id,course_id"),
    sb.from("lesson_progress").select("enrolment_id"),
    sb.from("lessons").select("id,chapter_id"),
    sb.from("chapters").select("id,course_id"),
  ]);
  const batchCourse = new Map((b.data ?? []).map((x: any) => [x.id, x.course_id]));
  const chapterCourse = new Map((ch.data ?? []).map((x: any) => [x.id, x.course_id]));
  const lessonsPerCourse: Record<string, number> = {};
  (l.data ?? []).forEach((x: any) => { const c = chapterCourse.get(x.chapter_id); if (c) lessonsPerCourse[c] = (lessonsPerCourse[c] ?? 0) + 1; });
  const doneByEnrol: Record<string, number> = {};
  (pr.data ?? []).forEach((x: any) => { doneByEnrol[x.enrolment_id] = (doneByEnrol[x.enrolment_id] ?? 0) + 1; });
  return (p.data ?? []).map((u: any) => {
    const mine = (e.data ?? []).filter((x: any) => x.user_id === u.id);
    let done = 0, total = 0;
    mine.forEach((en: any) => { const c = batchCourse.get(en.batch_id); total += lessonsPerCourse[c] ?? 0; done += doneByEnrol[en.id] ?? 0; });
    return { id: u.id, name: u.name, email: u.email, role: u.role, courses: mine.length, progress: total ? Math.round((done / total) * 100) : 0 };
  });
}

export async function listCertificates() {
  const sb = createClient();
  const [c, p, co] = await Promise.all([
    sb.from("certificates").select("*").order("issued_at", { ascending: false }),
    sb.from("profiles").select("id,name"),
    sb.from("courses").select("id,title"),
  ]);
  const name = new Map((p.data ?? []).map((x: any) => [x.id, x.name]));
  const title = new Map((co.data ?? []).map((x: any) => [x.id, x.title]));
  return (c.data ?? []).map((x: any) => ({ certNo: x.cert_no, learner: name.get(x.user_id) ?? "—", course: title.get(x.course_id) ?? "—", issuedAt: x.issued_at }));
}

export async function listOrgs() {
  const sb = createClient();
  const [o, s] = await Promise.all([
    sb.from("organisations").select("*"),
    sb.from("org_seats").select("org_id,assigned_user_id"),
  ]);
  return (o.data ?? []).map((x: any) => {
    const seats = (s.data ?? []).filter((r: any) => r.org_id === x.id);
    return { id: x.id, name: x.name, gstin: x.gstin, seats: seats.length, used: seats.filter((r: any) => r.assigned_user_id).length };
  });
}

export async function listLiveClasses() {
  const sb = createClient();
  const [l, b, c] = await Promise.all([
    sb.from("live_classes").select("*").order("start_at", { ascending: true }),
    sb.from("batches").select("id,course_id"),
    sb.from("courses").select("id,title"),
  ]);
  const bc = new Map((b.data ?? []).map((x: any) => [x.id, x.course_id]));
  const title = new Map((c.data ?? []).map((x: any) => [x.id, x.title]));
  return (l.data ?? []).map((x: any) => ({ id: x.id, title: x.title, course: title.get(bc.get(x.batch_id)) ?? "—", startAt: x.start_at, recording: x.recording_url as string | null }));
}

export async function listAssessments() {
  const sb = createClient();
  const [l, ch, co, s] = await Promise.all([
    sb.from("lessons").select("id,title,kind,chapter_id").eq("kind", "quiz"),
    sb.from("chapters").select("id,course_id"),
    sb.from("courses").select("id,title"),
    sb.from("quiz_scores").select("lesson_id,score"),
  ]);
  const cc = new Map((ch.data ?? []).map((x: any) => [x.id, x.course_id]));
  const title = new Map((co.data ?? []).map((x: any) => [x.id, x.title]));
  return (l.data ?? []).map((x: any) => {
    const sc = (s.data ?? []).filter((r: any) => r.lesson_id === x.id);
    const avg = sc.length ? Math.round(sc.reduce((a: number, r: any) => a + r.score, 0) / sc.length) : 0;
    return { id: x.id, title: x.title, course: title.get(cc.get(x.chapter_id)) ?? "—", submissions: sc.length, avg };
  });
}

export async function getAnalytics() {
  const sb = createClient();
  const [eR, prR, cR, lR, chR, oR] = await Promise.all([
    sb.from("enrolments").select("id,batch_id,source"),
    sb.from("lesson_progress").select("enrolment_id"),
    sb.from("certificates").select("user_id"),
    sb.from("lessons").select("id,chapter_id"),
    sb.from("chapters").select("id,course_id"),
    sb.from("batches").select("id,course_id"),
  ]);
  const enrol = eR.data ?? [], prog = prR.data ?? [], batches = oR.data ?? [];
  const chapterCourse = new Map((chR.data ?? []).map((x: any) => [x.id, x.course_id]));
  const lessonsPerCourse: Record<string, number> = {};
  (lR.data ?? []).forEach((x: any) => { const c = chapterCourse.get(x.chapter_id); if (c) lessonsPerCourse[c] = (lessonsPerCourse[c] ?? 0) + 1; });
  const batchCourse = new Map(batches.map((x: any) => [x.id, x.course_id]));
  const doneByEnrol: Record<string, number> = {};
  prog.forEach((x: any) => { doneByEnrol[x.enrolment_id] = (doneByEnrol[x.enrolment_id] ?? 0) + 1; });
  let done = 0, total = 0;
  enrol.forEach((en: any) => { const c = batchCourse.get(en.batch_id); total += lessonsPerCourse[c] ?? 0; done += doneByEnrol[en.id] ?? 0; });
  const org = enrol.filter((e: any) => e.source === "org_seat").length;
  return {
    completion: total ? Math.round((done / total) * 100) : 0,
    certificates: (cR.data ?? []).length,
    enrolments: enrol.length,
    b2bPct: enrol.length ? Math.round((org / enrol.length) * 100) : 0,
    individualPct: enrol.length ? Math.round(((enrol.length - org) / enrol.length) * 100) : 0,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
