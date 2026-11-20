-- AI OS Academy LMS — Phase 1 database (Postgres / Supabase)
-- Run this ONCE in your Supabase project: SQL Editor -> paste -> Run.
-- Money is stored in integer paise. One academy in v1 (not multi-tenant SaaS).

-- ------------------------------------------------------------------ profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'learner' check (role in ('learner','instructor','admin')),
  org_id uuid,
  state text not null default 'West Bengal',
  created_at timestamptz not null default now()
);

-- create a profile row automatically whenever someone signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- helper: is the caller an admin?  (security definer avoids RLS recursion)
create or replace function is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- -------------------------------------------------------------- courses/content
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  blurb text,
  price_minor bigint not null default 0,
  sac text not null default '999293',
  level text default 'Beginner',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists chapters (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  position int not null default 0,
  drip_day int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists chapters_course_idx on chapters (course_id, position);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  title text not null,
  kind text not null default 'video' check (kind in ('video','text','quiz','assignment')),
  content text,
  quiz jsonb,
  minutes int default 0,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists lessons_chapter_idx on lessons (chapter_id, position);

create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  name text not null,
  start_date date not null,
  seats int,
  status text not null default 'upcoming' check (status in ('upcoming','running','completed')),
  created_at timestamptz not null default now()
);
create index if not exists batches_course_idx on batches (course_id, start_date);

create table if not exists enrolments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  batch_id uuid not null references batches(id) on delete cascade,
  source text not null default 'individual' check (source in ('individual','org_seat')),
  enrolled_at timestamptz not null default now(),
  unique (user_id, batch_id)
);
create index if not exists enrolments_batch_idx on enrolments (batch_id);

create table if not exists lesson_progress (
  enrolment_id uuid not null references enrolments(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (enrolment_id, lesson_id)
);

create table if not exists quiz_scores (
  enrolment_id uuid not null references enrolments(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  score int not null default 0,
  primary key (enrolment_id, lesson_id)
);

create table if not exists live_classes (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references batches(id) on delete cascade,
  title text not null,
  start_at timestamptz not null,
  join_link text,
  recording_url text,
  created_at timestamptz not null default now()
);
create index if not exists live_batch_idx on live_classes (batch_id, start_at);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  answers jsonb not null default '{}',
  score int,
  ai_score int,
  status text not null default 'submitted' check (status in ('submitted','approved')),
  created_at timestamptz not null default now()
);
create index if not exists submissions_user_idx on submissions (user_id);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  cert_no text not null unique,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ------------------------------------------------------------------- B2B seats
create table if not exists organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  admin_id uuid references profiles(id) on delete set null,
  gstin text,
  state text not null default 'West Bengal',
  created_at timestamptz not null default now()
);

create table if not exists org_seats (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  course_id uuid not null references courses(id) on delete restrict,
  assigned_user_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists org_seats_org_idx on org_seats (org_id);

-- ---------------------------------------------------------- orders / invoices
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_user_id uuid references profiles(id) on delete set null,
  org_id uuid references organisations(id) on delete set null,
  course_id uuid not null references courses(id) on delete restrict,
  qty int not null default 1,
  buyer_name text,
  buyer_email text,
  buyer_state text,
  buyer_gstin text,
  coupon text,
  rate_minor bigint not null default 0,
  gross_minor bigint not null,
  discount_minor bigint not null default 0,
  taxable_minor bigint not null,
  cgst_minor bigint not null default 0,
  sgst_minor bigint not null default 0,
  igst_minor bigint not null default 0,
  total_minor bigint not null,
  intra boolean not null default true,
  invoice_no text not null unique,
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);
create index if not exists orders_buyer_idx on orders (buyer_user_id);

-- ============================================================ Row-Level Security
alter table profiles        enable row level security;
alter table courses         enable row level security;
alter table chapters        enable row level security;
alter table lessons         enable row level security;
alter table batches         enable row level security;
alter table enrolments      enable row level security;
alter table lesson_progress enable row level security;
alter table quiz_scores     enable row level security;
alter table live_classes    enable row level security;
alter table submissions     enable row level security;
alter table certificates    enable row level security;
alter table organisations   enable row level security;
alter table org_seats       enable row level security;
alter table orders          enable row level security;

-- profiles: read own or admin; update own; admin manage all
create policy profiles_read   on profiles for select using (id = auth.uid() or is_admin());
create policy profiles_update on profiles for update using (id = auth.uid() or is_admin());
create policy profiles_admin  on profiles for all    using (is_admin()) with check (is_admin());

-- catalog/content: everyone can read; only admins can change
create policy courses_read  on courses  for select using (true);
create policy courses_admin on courses  for all    using (is_admin()) with check (is_admin());
create policy chapters_read  on chapters for select using (true);
create policy chapters_admin on chapters for all    using (is_admin()) with check (is_admin());
create policy lessons_read   on lessons  for select using (true);
create policy lessons_admin  on lessons  for all    using (is_admin()) with check (is_admin());
create policy batches_read   on batches  for select using (true);
create policy batches_admin  on batches  for all    using (is_admin()) with check (is_admin());
create policy live_read      on live_classes for select using (true);
create policy live_admin     on live_classes for all    using (is_admin()) with check (is_admin());

-- learner-owned data: read/write own rows; admins read all
create policy enrol_own    on enrolments for all using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid());
create policy progress_own on lesson_progress for all
  using (exists (select 1 from enrolments e where e.id = enrolment_id and (e.user_id = auth.uid() or is_admin())))
  with check (exists (select 1 from enrolments e where e.id = enrolment_id and e.user_id = auth.uid()));
create policy quiz_own on quiz_scores for all
  using (exists (select 1 from enrolments e where e.id = enrolment_id and (e.user_id = auth.uid() or is_admin())))
  with check (exists (select 1 from enrolments e where e.id = enrolment_id and e.user_id = auth.uid()));
create policy subs_own  on submissions  for all using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid());
create policy certs_read on certificates for select using (user_id = auth.uid() or is_admin());
create policy certs_admin on certificates for all using (is_admin()) with check (is_admin());
create policy orders_own  on orders for select using (buyer_user_id = auth.uid() or is_admin());
create policy orders_ins  on orders for insert with check (buyer_user_id = auth.uid() or is_admin());

-- organisations / seats: admin manages (org-admin refinement comes later)
create policy orgs_admin  on organisations for all using (is_admin()) with check (is_admin());
create policy orgs_read   on organisations for select using (true);
create policy seats_admin on org_seats for all using (is_admin()) with check (is_admin());
create policy seats_read  on org_seats for select using (true);

-- ===================================================================== seed
-- Two demo courses so the live site has content on day one.
insert into courses (id, title, slug, blurb, price_minor, level, published) values
  ('11111111-1111-1111-1111-111111111111','AI for MSME Owners','ai-for-msme-owners',
   'Four short chapters to find the repeat work in your business and hand it to AI.',0,'Beginner',true),
  ('22222222-2222-2222-2222-222222222222','AI for Accounts & Office Staff','ai-for-accounts-staff',
   'Faster emails, cleaner Excel data, tidy bank narrations, and three rules for checking AI''s numbers.',299900,'Beginner',true)
on conflict (id) do nothing;

insert into chapters (id, course_id, title, position, drip_day) values
  ('aaaaaaa1-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Week 1 · Where AI saves you time',0,0),
  ('aaaaaaa2-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','Week 2 · Running the business with AI',1,7),
  ('aaaaaaa3-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','Everyday office work',0,0)
on conflict (id) do nothing;

insert into lessons (chapter_id, title, kind, content, minutes, position) values
  ('aaaaaaa1-0000-0000-0000-000000000001','Mapping your week: find the repeat work','video','List every task you or your staff do more than once a week.',12,0),
  ('aaaaaaa1-0000-0000-0000-000000000001','AI for sales follow-up and WhatsApp','video','Give the AI your customer list and ask it to draft follow-ups in your tone.',14,1),
  ('aaaaaaa2-0000-0000-0000-000000000002','Reading your numbers with AI','video','Export your reports and ask AI to explain month-on-month changes.',15,0),
  ('aaaaaaa3-0000-0000-0000-000000000003','Emails and letters in half the time','video','Paste the email, say what you want, ask for three versions.',9,0),
  ('aaaaaaa3-0000-0000-0000-000000000003','Cleaning up Excel data with AI','video','Ask AI to write the formula instead of fixing data by hand.',13,1)
on conflict do nothing;

insert into batches (course_id, name, start_date, seats, status) values
  ('11111111-1111-1111-1111-111111111111','November 2026 cohort', current_date - 9, 30, 'running'),
  ('22222222-2222-2222-2222-222222222222','Recorded · self-paced', current_date, null, 'running')
on conflict do nothing;

-- After you sign up with your own email, make yourself the admin by running:
--   update profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';
