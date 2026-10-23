"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setCurrentUser, currentUser } from "@/lib/session";
import {
  getUsers, createCourse, addChapter, addLesson, publishCourse, createBatch,
  getCourse, getBatchesForCourse, enrol, getEnrolmentForCourse, markComplete,
  getLesson, saveQuiz, issueCert, eligibleForCert,
} from "@/lib/data";

export async function switchUserAction(formData: FormData) {
  const id = String(formData.get("uid"));
  if (getUsers().some((u) => u.id === id)) setCurrentUser(id);
  redirect(String(formData.get("to") || "/"));
}

// ---- admin ----
export async function createCourseAction(formData: FormData) {
  const me = currentUser(); if (me?.role !== "admin") redirect("/");
  const title = String(formData.get("title") || "").trim();
  const blurb = String(formData.get("blurb") || "").trim();
  if (!title) redirect("/admin?error=title");
  const c = createCourse(title, blurb);
  revalidatePath("/admin");
  redirect(`/admin/courses/${c.id}`);
}
export async function addChapterAction(formData: FormData) {
  const me = currentUser(); if (me?.role !== "admin") redirect("/");
  const courseId = String(formData.get("courseId"));
  const title = String(formData.get("title") || "").trim();
  const dripDay = Number(formData.get("dripDay") || 0);
  if (title) addChapter(courseId, title, dripDay);
  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}
export async function addLessonAction(formData: FormData) {
  const me = currentUser(); if (me?.role !== "admin") redirect("/");
  const courseId = String(formData.get("courseId"));
  const chapterId = String(formData.get("chapterId"));
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const minutes = Number(formData.get("minutes") || 10);
  if (title) addLesson(chapterId, title, content, minutes);
  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}
export async function publishBatchAction(formData: FormData) {
  const me = currentUser(); if (me?.role !== "admin") redirect("/");
  const courseId = String(formData.get("courseId"));
  const name = String(formData.get("name") || "").trim() || "New cohort";
  const startDate = String(formData.get("startDate") || new Date().toISOString().slice(0, 10));
  const seatsRaw = String(formData.get("seats") || "").trim();
  const seats = seatsRaw ? Number(seatsRaw) : null;
  publishCourse(courseId);
  createBatch(courseId, name, startDate, seats);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/");
  redirect(`/admin/courses/${courseId}`);
}

// ---- learner ----
export async function enrolAction(formData: FormData) {
  const me = currentUser(); if (!me) redirect("/login");
  const courseId = String(formData.get("courseId"));
  const batch = getBatchesForCourse(courseId)[0];
  if (!batch) redirect(`/courses/${courseId}`);
  enrol(me.id, batch.id);
  revalidatePath(`/courses/${courseId}`);
  redirect(`/learn/${courseId}`);
}
export async function completeLessonAction(formData: FormData) {
  const me = currentUser(); if (!me) redirect("/login");
  const courseId = String(formData.get("courseId"));
  const lessonId = String(formData.get("lessonId"));
  const e = getEnrolmentForCourse(me.id, courseId);
  if (e) markComplete(e.id, lessonId);
  revalidatePath(`/learn/${courseId}`);
  redirect(`/learn/${courseId}`);
}
export async function submitQuizAction(formData: FormData) {
  const me = currentUser(); if (!me) redirect("/login");
  const courseId = String(formData.get("courseId"));
  const lessonId = String(formData.get("lessonId"));
  const e = getEnrolmentForCourse(me.id, courseId);
  const lesson = getLesson(lessonId);
  if (e && lesson?.quiz) {
    let score = 0;
    lesson.quiz.forEach((q, i) => { if (Number(formData.get("q" + i)) === q.a) score++; });
    saveQuiz(e.id, lessonId, score);
    markComplete(e.id, lessonId);
  }
  revalidatePath(`/learn/${courseId}`);
  redirect(`/learn/${courseId}?quiz=${lessonId}`);
}
export async function getCertAction(formData: FormData) {
  const me = currentUser(); if (!me) redirect("/login");
  const courseId = String(formData.get("courseId"));
  const e = getEnrolmentForCourse(me.id, courseId);
  if (e && eligibleForCert(courseId, e.id)) issueCert(me.id, courseId);
  revalidatePath(`/learn/${courseId}`);
  redirect(`/learn/${courseId}/certificate`);
}
