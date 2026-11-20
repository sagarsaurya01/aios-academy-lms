# AI OS Academy — Status & Roadmap

*Plain-English status of our own LMS (learning platform) for the AI training business.
Last updated: 20 November 2026.*

---

## What this is

Our own training platform — an "Edmingle for AI OS". An admin (you) builds courses,
runs them as dated batches with live classes, learners enrol and pay, learn, take
quizzes and get certificates — all under the **AI OS Academy** brand. It also does
the two things most platforms don't: **automatic GST invoices** and **company (B2B)
seats** where a business buys seats in bulk for its staff.

- **Code lives at:** `Downloads\edmingle-clone` on your PC
- **Backup on GitHub:** github.com/sagarsaurya01/aios-academy-lms
- **Built with:** Next.js + Tailwind (the brand uses the real AI OS colours + fonts)
- **Clickable mockup:** `Downloads\aios-academy-prototype.html` (shows the full vision)

---

## What is built today ✅

The full learner journey works as a demo:

1. **Courses** — browse the catalog, open a course page, enrol.
2. **Course builder** — add chapters & lessons, set **drip** (lessons unlock day by day),
   and **publish a batch** with a start date and seats.
3. **Learn** — watch lessons (locked until their drip day), mark complete, progress tracked.
4. **Quiz** — auto-scored, pass/fail.
5. **Certificate** — issued automatically on completion, with an "Add to LinkedIn" link.
6. **Checkout + GST invoice** — full GST engine (CGST/SGST/IGST, 15% bulk discount for
   10+ seats, coupons, invoice number) and a proper tax-invoice screen.
7. **AI OS brand** — navy / cream / blue–orange, the AIOS leaf logo, Chillax + Satoshi
   fonts, applied across the whole app.

---

## What is NOT built yet ❌

Shown in the mockup, not yet in the real app:

- **Admin dashboard** with charts, stat tiles and an activity feed (current one is basic)
- **Batches manager**, **Live Classes** (Zoom scheduling), **Learners** list
- **Company / B2B seats** admin screen (the pricing logic exists; the screen doesn't)
- **Assessments** admin + **AI marking**, **Analytics**, **Veda AI**, **Branding** &
  **Settings** screens

### The big gap underneath

- **No database** — everything is held in memory and **resets when the server restarts**.
- **No login / accounts** — anyone picks a demo role.
- **Payments are simulated** — Razorpay code is written but runs without real keys.
- **Not online** — it only runs on your PC; there is no website a learner can visit.

---

## The plan

### Phase 1 — Make it real (turn the demo into a product)  ← **recommended next**
The point of this phase: data is saved, people can log in and pay, and it's a live website.

| Step | What it does | What it needs from you |
| --- | --- | --- |
| Database (Supabase) | Saves courses, learners, enrolments permanently | A free Supabase account |
| Login / accounts | Real sign-up & sign-in for learners and admins | — |
| Razorpay (test) | Real checkout in test mode | Razorpay test keys + Aikigai GSTIN |
| Deploy (Vercel) | Puts it online at a real web address | A domain, e.g. learn.aikigai.ai |

### Phase 2 — Finish the admin screens
Build the missing pages so the app matches the mockup: Batches, Live Classes, Learners,
Company seats, Assessments, Analytics, Branding, Settings.

### Phase 3 — The AI + growth edges
Veda-style AI (tutor, auto-marking, drop-off alerts), memberships, communities,
campaigns, and the white-label academy.

---

## Recommended order

1. **Push the brand to GitHub** (done — this update).
2. **Phase 1** — get it online with saved data and test payments. This is what makes it
   a business instead of a demo.
3. **Phase 2 & 3** — keep adding screens and the AI features once it's live.

*To start Phase 1, the first thing needed from you is a free Supabase account and
Razorpay test keys. Everything else is build work.*
