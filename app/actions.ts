"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import {
  createCourse, addChapter, addLesson, publishCourse, createBatch,
  getCourse, getBatchForCourse, enrol, getEnrolmentForCourse, markComplete,
  getLesson, saveQuiz, issueCert, eligibleForCert, createOrder,
} from "@/lib/data";
import { createRazorpayOrder, razorpayLive } from "@/lib/razorpay";

export async function signOutAction() {
  const sb = createClient();
  await sb.auth.signOut();
  redirect("/login");
}

// ---- admin ----
export async function createCourseAction(formData: FormData) {
  const me = await currentUser(); if (me?.role !== "admin") redirect("/");
  const title = String(formData.get("title") || "").trim();
  const blurb = String(formData.get("blurb") || "").trim();
  if (!title) redirect("/admin?error=title");
  const c = await createCourse(title, blurb);
  revalidatePath("/admin");
  redirect(c ? `/admin/courses/${c.id}` : "/admin");
}
export async function addChapterAction(formData: FormData) {
  const me = await currentUser(); if (me?.role !== "admin") redirect("/");
  const courseId = String(formData.get("courseId"));
  const title = String(formData.get("title") || "").trim();
  const dripDay = Number(formData.get("dripDay") || 0);
  if (title) await addChapter(courseId, title, dripDay);
  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}
export async function addLessonAction(formData: FormData) {
  const me = await currentUser(); if (me?.role !== "admin") redirect("/");
  const courseId = String(formData.get("courseId"));
  const chapterId = String(formData.get("chapterId"));
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const minutes = Number(formData.get("minutes") || 10);
  if (title) await addLesson(chapterId, title, content, minutes);
  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}
export async function publishBatchAction(formData: FormData) {
  const me = await currentUser(); if (me?.role !== "admin") redirect("/");
  const courseId = String(formData.get("courseId"));
  const name = String(formData.get("name") || "").trim() || "New cohort";
  const startDate = String(formData.get("startDate") || new Date().toISOString().slice(0, 10));
  const seatsRaw = String(formData.get("seats") || "").trim();
  const seats = seatsRaw ? Number(seatsRaw) : null;
  await publishCourse(courseId);
  await createBatch(courseId, name, startDate, seats);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/");
  redirect(`/admin/courses/${courseId}`);
}

// ---- learner ----
export async function enrolAction(formData: FormData) {
  const me = await currentUser(); if (!me) redirect("/login");
  const courseId = String(formData.get("courseId"));
  const batch = await getBatchForCourse(courseId);
  if (!batch) redirect(`/courses/${courseId}`);
  await enrol(me.id, batch.id);
  revalidatePath(`/courses/${courseId}`);
  redirect(`/learn/${courseId}`);
}
export async function checkoutAction(formData: FormData) {
  const me = await currentUser(); if (!me) redirect("/login");
  const courseId = String(formData.get("courseId"));
  const course = await getCourse(courseId);
  if (!course) redirect("/");
  const qty = Math.max(1, Number(formData.get("qty") || 1));
  const buyerName = String(formData.get("name") || me.name).trim();
  const buyerEmail = String(formData.get("email") || me.email).trim();
  const buyerState = String(formData.get("state") || "West Bengal");
  const buyerGstin = String(formData.get("gstin") || "").trim();
  const coupon = String(formData.get("coupon") || "").trim();

  // Razorpay order (live when keys are set; simulated otherwise).
  const order = await createRazorpayOrder(course.priceMinor * qty, "rcpt_" + Date.now());
  const paymentId = razorpayLive ? null : "pay_sim_" + Date.now();

  const inv = await createOrder({
    userId: me.id, courseId, qty, buyerName, buyerEmail, buyerState, buyerGstin, coupon,
    razorpayPaymentId: order.simulated ? paymentId : null,
  });
  revalidatePath(`/learn/${courseId}`);
  redirect(`/invoices/${encodeURIComponent(inv.no)}`);
}
export async function completeLessonAction(formData: FormData) {
  const me = await currentUser(); if (!me) redirect("/login");
  const courseId = String(formData.get("courseId"));
  const lessonId = String(formData.get("lessonId"));
  const e = await getEnrolmentForCourse(me.id, courseId);
  if (e) await markComplete(e.id, lessonId);
  revalidatePath(`/learn/${courseId}`);
  redirect(`/learn/${courseId}`);
}
export async function submitQuizAction(formData: FormData) {
  const me = await currentUser(); if (!me) redirect("/login");
  const courseId = String(formData.get("courseId"));
  const lessonId = String(formData.get("lessonId"));
  const e = await getEnrolmentForCourse(me.id, courseId);
  const lesson = await getLesson(lessonId);
  if (e && lesson?.quiz) {
    let score = 0;
    lesson.quiz.forEach((q, i) => { if (Number(formData.get("q" + i)) === q.a) score++; });
    await saveQuiz(e.id, lessonId, score);
    await markComplete(e.id, lessonId);
  }
  revalidatePath(`/learn/${courseId}`);
  redirect(`/learn/${courseId}?quiz=${lessonId}`);
}
export async function getCertAction(formData: FormData) {
  const me = await currentUser(); if (!me) redirect("/login");
  const courseId = String(formData.get("courseId"));
  const e = await getEnrolmentForCourse(me.id, courseId);
  if (e && (await eligibleForCert(courseId, e.id))) await issueCert(me.id, courseId);
  revalidatePath(`/learn/${courseId}`);
  redirect(`/learn/${courseId}/certificate`);
}
