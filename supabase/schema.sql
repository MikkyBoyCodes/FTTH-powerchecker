-- FIBERLINKGUARD — Jobs backend (Supabase / Postgres)
-- Run this in your Supabase dashboard: SQL Editor → New query → paste → Run.

-- 1. Jobs table -------------------------------------------------------------
create table if not exists public.jobs (
  id           uuid primary key default gen_random_uuid(),
  -- Nullable: rows owned by auth.users are user-posted (editable only by the
  -- owner). Rows with a null owner are community/partner listings that are
  -- read-only for regular users.
  owner_id     uuid default auth.uid() references auth.users (id) on delete cascade,
  title        text not null,
  company      text not null,
  location     text not null,
  job_type     text not null default 'Full-time',   -- Full-time | Contract | Part-time
  level        text not null default 'Entry-level',
  description  text not null,
  contact      text not null default '',
  created_at   timestamptz not null default now()
);

-- Speed up the public listing feed (newest first).
create index if not exists jobs_created_at_idx on public.jobs (created_at desc);

-- 2. Row-level security -----------------------------------------------------
-- Anyone (including anonymous visitors) can READ listings...
alter table public.jobs enable row level security;

create policy "Public can read job listings"
  on public.jobs for select
  to anon, authenticated
  using (true);

-- ...but only a signed-in user can CREATE a job for themselves...
create policy "Users can insert their own job"
  on public.jobs for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

-- ...and only the owner can change or delete it.
create policy "Users can update their own job"
  on public.jobs for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own job"
  on public.jobs for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

-- 3. Optional seed listings -------------------------------------------------
-- Uncomment to add sample jobs (owner_id stays null so they are not editable by users).
-- insert into public.jobs (owner_id, title, company, location, job_type, level, description)
-- values
--   (null, 'FTTH Installation Technician', 'FIBERLINK Field Services', 'Lagos · Field-based', 'Contract', 'Entry / Mid-level', 'Assist with customer fibre installations, ONT setup and optical power verification.'),
--   (null, 'Fibre Optic Field Support', 'FIBERLINK Network Services', 'Abuja · On-site', 'Full-time', 'Mid-level', 'Support field teams with troubleshooting, documentation and service restoration.');
