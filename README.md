# AI OS Academy LMS

A clean-room learning platform in the style of Edmingle, built for **AI OS
Academy** (Aikigai Edtech LLP) — practical AI training for Indian businesses.
Built with the [Replica](https://github.com/Jakeschincariol/replica-skill)
method: it rebuilds what Edmingle *does* (courses, cohorts, drip, certificates),
never its code, brand or app.

**Status:** Milestone 0 (working vertical slice). An admin builds a course and
publishes a batch; a learner enrols, learns with drip-unlocking, passes a quiz,
and gets a certificate. All verified in the browser.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3400 and pick a demo role (admin = Sagar, learner = Priya).

## What works

- **Admin:** create a course → add chapters (with a drip day) and lessons →
  publish it as a **batch** with a start date and seats.
- **Learner:** browse the catalog → enrol free → learn, with **lessons that
  unlock day by day (drip)** → take an auto-scored **quiz** → get a
  **certificate** with an "Add to LinkedIn" link.
- A demo **role switch** in the top bar; admin pages are gated from learners.

## Design decisions

- Next.js (App Router) + TypeScript + Tailwind; **in-memory seeded data layer**
  with Supabase-shaped signatures, so the backend swaps in without touching
  screens.
- **Progress is derived**, never stored. **Drip** = days since the batch start
  vs the chapter's drip day. **Certificate** needs all lessons done + quiz passed.
- Payments will be **Razorpay** (Indian market), not Stripe.

## What's next

This lifts the already-working **GST invoicing, B2B company-seats, AI assignment
marking, quizzes and certificates** from the [aios-lms](https://github.com/sagarsaurya01/aios-lms)
prototype. Milestones: M1 Razorpay checkout + GST invoices + admin dashboard;
M2 B2B seats + AI marking + live classes; M3 white-label + analytics. See
`replica/features.csv` and `replica/build-log.md`.

Being a Next.js server app, it hosts on Vercel (not GitHub Pages) once the
Supabase backend is wired.

## Earlier prototype & blueprint

The first clickable prototype and the 10-platform feature blueprint (originally
in the `aios-lms` repo, now merged here) live in [`prototype/`](prototype/):
- `prototype/lms-first-version.html` — the single-file clickable prototype
  (student / company-admin / trainer views; GST, seats, AI marking simulated).
- `prototype/LMS Blueprint - Features and Phases.html` — features from 10 course
  platforms, sorted into Phase 1 / 2 / 3, with the three "gap" edges.

The live app in this repo is the real build (Edmingle-clone approach); the
prototype is kept here for reference.
