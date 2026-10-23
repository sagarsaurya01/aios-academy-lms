# Build log — AI OS Academy LMS (Edmingle clone)

Working name: **AI OS Academy**. Teal palette (own brand, from aios-lms), not Edmingle's.

## Milestone 0 — vertical slice (2026-10-23)

| screen | status | notes |
| --- | --- | --- |
| S02 Catalog + role picker | done | lists published courses; demo role switch (admin/learner) |
| S03 Course landing | done | curriculum, drip labels, enrol free |
| S04 Admin dashboard | done | course list + create-course form |
| S05 Course builder | done | add chapters (with drip day), add lessons, publish batch |
| S06 Batch (publish) | done | name, start date, seats; course goes Published |
| S08 Learner player | done | video placeholder (name-watermark note), drip lock, mark complete, progress % |
| S09 Quiz | done | auto-scored, 2+ to pass |
| S10 Certificate | done | issued on eligibility, LinkedIn add link |

**Verified in the browser** (localhost:3400):
- Learner (Priya): enrolled → Week 2 correctly **locked by drip** ("Unlocks day 7" when batch was 2 days old) → with batch 9 days old, completed all 4 lessons → quiz **3/3 passed** → progress **100%** → **certificate issued** (ID AIOS-W2DBQQ). No console errors.
- Admin (Sagar): created "AI for Accounts Staff" → added a chapter (drip day 0) → added a lesson → **published "January 2027 cohort · 25 seats"** → course went Published. "Publish batch" correctly disabled until a lesson exists.
- Role switch gates admin pages from learners.

**Logic** (`lib/data.ts`): progress derived from a lesson_progress list (never stored); drip = `today − batch.start ≥ chapter.dripDay`; certificate eligibility = all lessons done + quiz ≥ 2. Supabase-shaped signatures.

### Harder than expected
- In-memory seed persists on `globalThis`, so changing the seed needs a server restart (not just HMR). Expected for the fake data layer.

### Not in this milestone (by design — reuse aios-lms next)
- Razorpay checkout + **GST invoice** (engine already exists in the aios-lms prototype — port in M1).
- **B2B company seats**, AI assignment marking, live-class scheduling (M2).
- White-label branding, analytics, memberships, community (M3).
- Real auth + persistence (Supabase) — replica-backend. Note: this is a Next.js server app, so it hosts on Vercel (not GitHub Pages).

## Next
`/replica-backend` — Supabase + Razorpay, then port the aios-lms GST/seats/AI-marking logic.
