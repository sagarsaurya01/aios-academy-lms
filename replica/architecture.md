# Architecture: AI OS Academy LMS (Edmingle clone)

From `recon.md` + `features.csv`. Date: 2026-10-23.

> This is the real build of the AI OS Academy LMS. It lifts the working GST
> invoicing, B2B company-seats, quiz, AI-marking and certificate logic from the
> existing `aios-lms` prototype, and adds the Edmingle structure around it:
> course builder, batches/cohorts, live classes, drip and white-label.

## Stack

| layer | choice | why |
| --- | --- | --- |
| web app | Next.js (App Router) + TypeScript | same as the other 3 clones; one deploy method |
| styling | Tailwind + tokens | reuse the aios-lms token palette (teal) |
| database | Supabase (Postgres) | same backend family; the Ravan Rush Supabase is already set up |
| data access | Supabase client + RLS; raw SQL for progress/GST | money + progress math stays explicit |
| auth | Supabase Auth (email + Google) | role-based (learner/instructor/admin) |
| payments | **Razorpay** (test mode first) | Indian; UPI/cards/EMI; what the market uses, not Stripe |
| email | Resend | enrolment + class reminders (later) |
| video | storage URL + name-watermark overlay | no DRM in v1 (out of scope) |
| jobs | Vercel Cron | batch status, class reminders (later) |
| hosting | Vercel | Next.js native |

One academy (AI OS Academy), one database. Not a multi-tenant SaaS reselling to other academies.

## Schema

Full SQL in `replica/schema.sql`. 13 tables:
`profiles, courses, chapters, lessons, batches, enrolments, lesson_progress, live_classes, submissions, certificates, organisations, org_seats, orders`.

**The logic to get right (most lifted from aios-lms):**
- Money = integer **paise**. **GST at checkout**: intra-state (buyer in West Bengal) → CGST 9% + SGST 9%; else IGST 18%. Bulk discount 15% at 10+ seats. Invoice numbers `AIOS/26-27/NNNN`, amount-in-words. This engine already works in the prototype — port it, don't rewrite.
- **Progress is derived** from `lesson_progress`, never stored as a column.
- **Drip lock**: a lesson is open iff `today − batch.start_date ≥ chapter.drip_day`.
- **Certificate eligibility**: all lessons done + quiz passed + (if any) assignment approved.
- **AI marking**: `submissions.ai_score` is the suggestion; a trainer approves the final `score` and flips `status` to `approved`.
- **B2B seats**: a company buys N seats in one `order` (one GST invoice), each an `org_seat`; the org admin assigns/frees them.

## API (server actions / route handlers)

| action | does | who | flow |
| --- | --- | --- | --- |
| signIn / signUp | Supabase Auth, role on profile | public | auth |
| createCourse / addChapter / addLesson | course builder | admin/instructor | F01 |
| publishBatch | course + batch with start date | admin | F01 |
| enrolFree / checkout | enrol; or Razorpay order → GST invoice | learner | F02 |
| markLessonComplete | writes lesson_progress | learner | F02 |
| submitAssessment | learner answers; AI suggests score | learner | F02 |
| approveSubmission | trainer sets final score | instructor/admin | F02 |
| issueCertificate | on eligibility | learner/system | F02 |
| scheduleLiveClass | Zoom/Meet link + batch notify | admin | F03 |
| buySeats / assignSeat / freeSeat | B2B company seats | org admin | F04 |
| setBranding | logo/colours/domain | admin | F05 |
| razorpayWebhook | confirm payment → create order+invoice | system | F02/F04 |

Razorpay uses the user's own keys. No DRM/anti-piracy endpoints (out of scope).

## The parts that bite

- **Payment idempotency** — the Razorpay webhook can fire twice; key the order on `razorpay_payment_id` so a replay doesn't double-invoice.
- **GST correctness** — place-of-supply from the buyer's state; keep the aios-lms engine's rounding.
- **Drip + batch dates** — all in the batch's timezone (IST); "day N" is calendar days from `start_date`.
- **Seat accounting** — seats bought (order.qty) must equal `org_seats` rows; never let assignment exceed bought.
- **Role boundary** — RLS is the backstop; never trust a role or org_id from the client.
- **Video** — v1 is a URL + name watermark overlay; real DRM is out of scope, say so to buyers.

## Build order

**Milestone 0 — vertical slice (~1–1.5 hr target):**
admin builds a course (1 chapter, 2 lessons) → publishes a batch → a learner enrols free → learns with drip → takes a quiz → gets a certificate.
Screens S04/S05, S06, S03, S08, S09, S10. Tables: profiles, courses, chapters, lessons, batches, enrolments, lesson_progress, submissions, certificates.

**Milestone 1 — must-haves:** Razorpay checkout + GST invoice (port aios-lms), admin dashboard, learner list, course catalog/storefront, coupons.

**Milestone 2 — the edge:** B2B sub-orgs (company seats), AI marking + trainer approval, live-class scheduling + recordings.

**Milestone 3 — should/could:** white-label branding + custom domain, attendance, analytics/exports, memberships, community, campaigns.

## Summary

Stack: Next.js + Supabase + Razorpay on Vercel. Tables: 13. Routes: ~14 actions + 1 webhook. Riskiest: (1) Razorpay/GST invoicing with idempotency, (2) drip + batch dates, (3) B2B seat accounting. Reuses the aios-lms GST/seats/quiz/cert logic. Next: `/replica-design`, or build Milestone 0 directly.
