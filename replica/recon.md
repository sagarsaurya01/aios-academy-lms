# Recon map: Edmingle (Web + mobile)

Scope: the core "run an online training business" loop — an academy admin builds courses/programs, runs them as batches (cohorts) with live classes + recorded lessons, students enrol and pay, take assessments and get certificates, and the admin sees analytics. Plus the two things that matter for AI OS Academy: B2B sub-organisations (company seats) and white-labelled academy branding.
For: Sagar's own LMS — **AI OS Academy** (Aikigai Edtech LLP). Clean-room: rebuild what Edmingle does, not its code/brand/app.
Date: 2026-10-23

NOTE: recon from PUBLIC sources only (marketing site, feature pages, pricing, review sites). I did not and cannot log into Edmingle. Ties into the existing `aios-lms` blueprint, which already compared 10 platforms.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | features page | https://www.edmingle.com/features | pillars: ops, engagement, branding, analytics |
| 2 | Veda AI page | https://www.edmingle.com/ (AI section) | AI assessments, auto-evaluation, insights |
| 3 | pricing (vendor blog) | https://www.edmingle.com/blog/lms-pricing-in-india/ | Core/Prime/Power/Maxx tiers, what each gates |
| 4 | Capterra / SoftwareSuggest | capterra.in, softwaresuggest.com | feature cross-check, reviews, gaps |
| 5 | existing AI OS blueprint | aios-lms repo | 10-platform comparison already done |

## Core loop

An academy owner creates a course/program → sets it up as a batch with a start date → adds recorded lessons and schedules live classes (Zoom) → students enrol and pay → they learn, attend, take quizzes/assignments → get an automated certificate → the owner tracks attendance, progress and revenue, under their own brand/app.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Sign up / Log in | /login | auth (learner + admin) | form, Google | empty, error |
| S02 | Academy storefront | / (white-label) | public course catalog, branded | course cards, hero, enrol CTA | empty, filled |
| S03 | Course landing | /course/:id | one course: outline, price, batch, enrol | curriculum, price, instructor | locked, enrolled |
| S04 | Admin dashboard | /admin | revenue, enrolments, active learners, upcoming classes | stat tiles, charts, lists | empty, filled |
| S05 | Course builder | /admin/courses/:id | chapters + lessons (video/text/quiz), drip rules | tree editor, upload, drip settings | draft, published |
| S06 | Batch / cohort manager | /admin/batches/:id | start date, enrolled students, schedule, attendance | roster, calendar, attendance grid | upcoming, running, done |
| S07 | Live class scheduler | /admin/classes | schedule Zoom/Meet, invite batch, recordings | form, list, join link | scheduled, live, recorded |
| S08 | Learner course player | /learn/:id | watch lessons, unlock by drip, mark complete | video player, lesson list, progress | locked, in-progress, done |
| S09 | Assessment | /learn/:id/quiz | quiz / assignment, auto or AI marking | questions, submit, result | not-taken, submitted, graded |
| S10 | Certificate | /learn/:id/certificate | issued on completion, LinkedIn share | cert, share | eligible, issued |
| S11 | Checkout | /checkout | pay (Razorpay), coupon, GST invoice | summary, coupon, pay | valid, paid, failed |
| S12 | Students / learners (admin) | /admin/learners | list, progress, segments | table, filters | empty, filled |
| S13 | Sub-organisation (B2B) | /admin/orgs/:id | a company buys seats, assigns staff, tracks progress | seats, roster, reports | — |
| S14 | Branding / white-label | /admin/branding | logo, colours, custom domain, app | brand form, domain, app config | — |
| S15 | Analytics / reports | /admin/analytics | engagement, cohort, assessment, revenue | charts, export | empty, filled |

## Flows

```
F01 Admin publishes a paid course as a batch (core)
    S05 build course -> S06 create batch (start date) -> S07 schedule live classes -> S03 landing goes live
    edge: batch full, course with no lessons, live class clash

F02 Learner enrols and learns
    S02 catalog -> S03 course -> S11 checkout (pay + GST invoice) -> S08 learn (drip) -> S09 quiz -> S10 certificate
    happy path clicks: ~6
    edge: payment fails, lesson locked by drip, failed quiz retake

F03 Live class
    S07 schedule Zoom -> batch notified -> learners join from S08 -> recording added back to the batch
    edge: no-show, recording delay

F04 B2B: company buys seats (the AI OS edge)
    S13 company buys N seats (one GST invoice) -> assigns staff -> tracks progress -> report
    edge: reassign a left employee's seat

F05 White-label launch
    S14 set logo/colours/domain -> academy storefront + branded app go live
    edge: domain not verified
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Course card | catalog, enrolled | locked, in-progress, done | S02,S03,S08 |
| Curriculum tree | chapters>lessons | draft, published, drip-locked | S05,S08 |
| Video player | recorded, live | playing, watermarked | S08 |
| Stat tile | revenue, learners, classes | up/down | S04,S15 |
| Roster table | learners, seats | empty, filled | S06,S12,S13 |
| Checkout summary | course, seats | valid, coupon, GST | S11 |
| Certificate | issued | eligible, issued | S10 |
| Schedule form | live class | scheduled, recorded | S07 |

## Inferred data model

```
Academy    id, name, brand(logo,colors), custom_domain, owner_id   | high
User       id, name, email, role (learner|instructor|admin), org_id | high
Course     id, academy_id, title, description, price, sac, published | high
Chapter    id, course_id, title, order, drip_day                    | high
Lesson     id, chapter_id, type (video|text|quiz|assignment), content, order | high
Batch      id, course_id, name, start_date, seats, status           | high
Enrolment  id, user_id, batch_id, enrolled_at, progress, source(individual|org_seat) | high
LiveClass  id, batch_id, title, start_at, join_link, recording_url   | high
Assessment id, lesson_id, type, questions(json)                      | high
Submission id, assessment_id, user_id, answers, score, status, ai_score | high
Certificate id, user_id, course_id, issued_at, cert_no              | high
Order      id, user_id|org_id, items, coupon, taxable, cgst,sgst,igst, total, invoice_no | high
Organisation id, name, admin_id, gstin, seats_bought                 | high  (B2B)
OrgSeat    id, org_id, course_id, assigned_user_id, progress         | high
```

Relationships: Academy 1-n Course; Course 1-n Chapter 1-n Lesson; Course 1-n Batch; Batch 1-n Enrolment; Batch 1-n LiveClass; Organisation 1-n OrgSeat.

## Feature matrix

See `features.csv`. Must: 12, should: 7, could: 5, skip: 6.

## Out of scope (cannot or should not be cloned)

- **DRM / anti-piracy** (Widevine L1, screenshot/screen-record blocking) — licensed, platform-level; v1 uses name-watermarking only.
- **Native white-label apps published under the customer's developer accounts** — a store/ops service, not a feature to code in v1; responsive web + PWA first.
- **Edmingle's brand, app and content.**
- **Their integrations marketplace** (HRMS, specific CRMs) — add later with the user's own keys.
- **Proctored exams / UGC-DEB compliance** — a regulated vertical; out of v1.
- **Edmingle's hosting of other academies** (multi-tenant SaaS for third parties) — v1 is one academy (AI OS Academy), not a SaaS reselling platform.

## Size

Screens 15, flows 5, entities ~13. Hard parts: (1) **payments + GST invoicing** (reuse the aios-lms prototype's engine), (2) **live-class scheduling + Zoom/recordings**, (3) **drip + batch/cohort logic**, (4) **B2B sub-orgs/company seats**, (5) **video delivery & watermarking**. **Size: L** overall. A working first slice (admin builds a course → publishes a batch → learner enrols free → learns with drip → quiz → certificate) is an **M**, but a thin vertical slice is ~1–1.5 hr.

## Reuse note

The existing `aios-lms` prototype already has the **GST invoicing, B2B company-seats, AI marking, quizzes, certificates and three roles** working as simulated front-end. This clone should lift that logic into the real build rather than redo it — Edmingle recon mainly adds the **course builder, batches/cohorts, live classes, drip, white-label branding and analytics** structure around it.

## Next step

`/replica-architect` — Next.js + Supabase (same as the other three + the Ravan Rush Supabase we just set up), turn this into SQL, and order the build: admin builds a course → publishes a batch → learner enrols → learns (drip) → quiz → certificate, with the GST/checkout and B2B seats lifted from aios-lms.
