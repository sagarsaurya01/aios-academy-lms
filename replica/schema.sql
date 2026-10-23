-- AI OS Academy LMS (Edmingle clone) — schema (Postgres / Supabase)
-- Money in integer paise. GST computed at checkout (CGST+SGST intra-WB, IGST else),
-- reusing the aios-lms prototype's engine. One academy in v1 (not multi-tenant SaaS).

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'learner' check (role in ('learner','instructor','admin')),
  org_id uuid,                                   -- set when this learner belongs to a company
  state text not null default 'West Bengal',     -- for GST place-of-supply
  created_at timestamptz not null default now()
);

-- courses & content ----------------------------------------------------------
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  blurb text,
  price_minor bigint not null default 0,         -- 0 = free
  sac text not null default '999293',
  level text default 'Beginner',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table chapters (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  position int not null default 0,
  drip_day int not null default 0,               -- unlocks this many days into the batch
  created_at timestamptz not null default now()
);
create index on chapters (course_id, position);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  title text not null,
  kind text not null default 'video' check (kind in ('video','text','quiz','assignment')),
  content text,                                  -- text body / video url / quiz json
  minutes int default 0,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index on lessons (chapter_id, position);

-- batches / cohorts -----------------------------------------------------------
create table batches (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  name text not null,
  start_date date not null,
  seats int,                                     -- null = unlimited
  status text not null default 'upcoming' check (status in ('upcoming','running','completed')),
  created_at timestamptz not null default now()
);
create index on batches (course_id, start_date);

create table enrolments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  batch_id uuid not null references batches(id) on delete cascade,
  source text not null default 'individual' check (source in ('individual','org_seat')),
  enrolled_at timestamptz not null default now(),
  unique (user_id, batch_id)
);
create index on enrolments (batch_id);

-- per-lesson progress (derive % from this)
create table lesson_progress (
  enrolment_id uuid not null references enrolments(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (enrolment_id, lesson_id)
);

-- live classes ---------------------------------------------------------------
create table live_classes (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references batches(id) on delete cascade,
  title text not null,
  start_at timestamptz not null,
  join_link text,
  recording_url text,
  created_at timestamptz not null default now()
);
create index on live_classes (batch_id, start_at);

-- assessments ----------------------------------------------------------------
create table submissions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  answers jsonb not null default '{}',
  score int,
  ai_score int,                                  -- AI suggestion, trainer approves `score`
  status text not null default 'submitted' check (status in ('submitted','approved')),
  created_at timestamptz not null default now()
);
create index on submissions (user_id);

create table certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  cert_no text not null unique,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- B2B sub-organisations (company seats) --------------------------------------
create table organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  admin_id uuid not null references profiles(id) on delete set null,
  gstin text,
  state text not null default 'West Bengal',
  created_at timestamptz not null default now()
);

create table org_seats (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  course_id uuid not null references courses(id) on delete restrict,
  assigned_user_id uuid references profiles(id) on delete set null,  -- null = free seat
  created_at timestamptz not null default now()
);
create index on org_seats (org_id);

-- orders & GST invoices (reuse aios-lms engine) ------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_user_id uuid references profiles(id) on delete set null,
  org_id uuid references organisations(id) on delete set null,
  course_id uuid not null references courses(id) on delete restrict,
  qty int not null default 1,                    -- >1 for company seats
  coupon text,
  gross_minor bigint not null,
  discount_minor bigint not null default 0,
  taxable_minor bigint not null,
  cgst_minor bigint not null default 0,
  sgst_minor bigint not null default 0,
  igst_minor bigint not null default 0,
  total_minor bigint not null,
  invoice_no text not null unique,               -- AIOS/26-27/0001
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);
create index on orders (buyer_user_id);
create index on orders (org_id);

-- DERIVED (data layer / views), shown as intent:
--  course progress = count(lesson_progress) / count(lessons in course) per enrolment.
--  drip lock: a lesson is open iff (today - batch.start_date) >= chapter.drip_day.
--  certificate eligibility: all lessons done + quiz passed + assignment approved.
--  GST: intra = buyer.state == 'West Bengal' -> CGST 9% + SGST 9%; else IGST 18%.

-- RLS: learners read published courses + their own enrolments/progress/orders;
--   admins/instructors manage courses, batches, classes, submissions; org admins
--   manage their org's seats. Policies in the first migration.
