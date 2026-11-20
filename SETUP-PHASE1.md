# Phase 1 setup — what you do, step by step

This is the only part I can't do for you: creating your accounts and copying the keys.
It takes about 15 minutes. Once you paste the keys back to me, I build and test the rest.

Nothing here costs money — Supabase has a free plan, and Razorpay is in **test mode**.

---

## Part A — Supabase (the database + login)  ~8 min

1. Go to **https://supabase.com** and click **Start your project** → sign in with Google.
2. Click **New project**.
   - Organisation: your own.
   - Name: `aios-academy`
   - Database password: make one up and **save it somewhere** (you rarely need it).
   - Region: **Mumbai (ap-south-1)**.
   - Click **Create new project** and wait ~2 minutes while it sets up.
3. **Create the tables.** Left menu → **SQL Editor** → **New query**.
   - Open the file `supabase/migrations/20261120093000_init.sql` (in this project folder),
     copy *everything* in it, paste into the box, and click **Run**.
   - It should say *Success*. (This builds all the tables and adds 2 demo courses.)
4. **Get your 2 keys.** Left menu → **Project Settings** (gear) → **API**.
   - Copy the **Project URL** (looks like `https://abcd....supabase.co`)
   - Copy the **anon public** key (a long string)
   - Copy the **service_role** key (another long string — keep this one secret)

Send me those three values (URL, anon, service_role).

---

## Part B — Razorpay (test payments)  ~5 min

1. Go to **https://razorpay.com** and sign up (or log in).
2. In the dashboard, switch the toggle at the top to **Test Mode** (important).
3. Go to **Settings → API Keys → Generate Test Key**.
4. Copy the **Key Id** (starts with `rzp_test_`) and the **Key Secret**.

Send me those two values.

---

## Part C — paste the keys (I can talk you through this)

1. In this project folder, copy the file **`.env.local.example`** and rename the copy to
   **`.env.local`**.
2. Open `.env.local` in Notepad and replace each `YOUR-...` with the real values from
   Parts A and B.
3. Save. Done — tell me and I'll wire the app to use them and test it live.

> You can also just send me the keys here and I'll fill `.env.local` in for you.

---

## What I do after you send the keys

- Switch the app from the temporary in-memory data to your real Supabase database.
- Add real **sign-up / log-in** screens.
- Turn on **Razorpay test checkout** so a card payment flows end to end.
- Test the whole journey against your live database.
- Then: deploy to **Vercel** so it's a real website (needs a domain, e.g. learn.aikigai.ai).
