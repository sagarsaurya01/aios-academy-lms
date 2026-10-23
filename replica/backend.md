# Backend — AI OS Academy LMS

## Built this pass (runs now, no keys needed)
- **GST engine** (`lib/gst.ts`) — ported from the aios-lms prototype. Intra-WB CGST+SGST,
  inter-state IGST, 15% bulk discount at 10+ seats, coupons, invoice numbers, amount-in-words.
- **Checkout** (`app/checkout/[courseId]`) — buyer details, live GST quote by state/qty/coupon,
  "Buy seats for your team" path (10+). Free courses still enrol directly.
- **GST invoice** (`app/invoices/[no]`) — a proper tax invoice created on payment.
- **Razorpay server integration** (`lib/razorpay.ts`) — create-order, signature verify, webhook
  verify; **env-gated** with a simulated fallback so the flow runs without keys.
- **Webhook route** (`app/api/razorpay/webhook`) — verifies signature, idempotent by payment id.
- `.env.example` with every variable; `.env*.local` git-ignored.

## Needs the user's credentials to go live (your steps)
1. **Supabase project for the LMS** — create one at supabase.com, run a migration from
   `replica/schema.sql`, then put `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. (A separate project from Ravan Rush —
   the LMS needs auth-gated RLS, not public writes.)
2. **Razorpay test keys** — Dashboard → Settings → API Keys → generate TEST keys. Put
   `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` in `.env.local`.
   Add a webhook pointing to `/api/razorpay/webhook` and set `RAZORPAY_WEBHOOK_SECRET`.
3. **Aikigai GSTIN** — required before actually charging GST. Set `NEXT_PUBLIC_SELLER_GSTIN`.
4. **Hosting** — this is a Next.js server app, so deploy to **Vercel** and add the same env
   vars there (not GitHub Pages).

## Still to wire once the project exists (replica-backend, round 2)
- Replace the in-memory `lib/data.ts` with Supabase queries (same function signatures).
- **Supabase Auth** (email + Google) to replace the demo role switch; roles on the profile.
- RLS policies per the schema (a second user must read nothing of another's).
- Client-side Razorpay Checkout widget + verify step (server lib is ready).
- Confirm the order in the webhook (mark paid) rather than at checkout, for live mode.

## Security checklist
- [x] secrets only in env vars; `.env*` git-ignored; secret keys server-only (`lib/razorpay.ts` not imported client-side)
- [x] webhook verifies signature + idempotent
- [ ] server-side input validation (zod) on actions — add with Supabase round
- [ ] authorisation tested with a second user — needs RLS + Supabase
- [ ] rate limits on auth/checkout — add at deploy
- [ ] `npm audit` clean
- [ ] privacy policy lists processors (Supabase, Razorpay, Vercel)

Next: provide the Supabase + Razorpay keys, then `/replica-backend` round 2 to swap the data
layer and wire auth; or `/replica-test`.
