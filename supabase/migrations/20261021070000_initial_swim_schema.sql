
-- Initial schema for Sparks Swim
-- Migration: 20261021070000_initial_swim_schema.sql
-- Strategy: preserve source Student IDs and attendance history.
-- Do not automatically merge C1/C2 memberships.

begin;

-- 1. Centers: source spreadsheet configuration
create table public.swim_centers (
  id uuid primary key default gen_random_uuid(),
  center_code text not null unique,
  center_name text not null,
  source_spreadsheet_id text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Students: internal profile
-- Initially, create a separate profile for each source Student ID.
-- Profiles must not be merged based on name alone.
create table public.swim_students (
  id uuid primary key default gen_random_uuid(),
  student_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Memberships: one record per source Student ID per center
create table public.swim_memberships (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null
    references public.swim_centers(id) on delete restrict,
  student_id uuid not null
    references public.swim_students(id) on delete restrict,
  source_student_id text not null,
  source_unique_key_name text,
  student_status text,
  phone text,
  sessions_used numeric,
  sessions_remaining numeric,
  source_row_number integer,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint swim_memberships_source_id_unique
    unique (center_id, source_student_id),

  constraint swim_memberships_source_id_not_blank
    check (length(trim(source_student_id)) > 0)
);

create index swim_memberships_student_id_idx
  on public.swim_memberships(student_id);

create index swim_memberships_center_status_idx
  on public.swim_memberships(center_id, student_status);

-- 4. Attendance: preserve the source membership and history
-- The business key assumes at most one attendance per membership per day.
-- Check In ID is source metadata, NOT the primary key.
create table public.swim_attendance (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null
    references public.swim_memberships(id) on delete restrict,
  attendance_date date not null,
  source_check_in_id text,
  source_unique_key_name text,
  student_name text,
  check_in_time text,
  age_group text,
  session_type text,
  duration_minutes numeric,
  attendance_status text,
  scheduled_time text,
  coach_notes text,
  level text,
  coach text,
  student_advisor text,
  source_phone text,
  source_row_number integer,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint swim_attendance_membership_date_unique
    unique (membership_id, attendance_date)
);

create index swim_attendance_date_idx
  on public.swim_attendance(attendance_date);

create index swim_attendance_membership_date_idx
  on public.swim_attendance(membership_id, attendance_date desc);

-- 5. Sync logs: operational audit trail
create table public.swim_sync_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  center_id uuid
    references public.swim_centers(id) on delete restrict,
  source_tab text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  run_status text not null default 'running'
    check (run_status in ('running', 'success', 'partial', 'failed')),
  rows_read integer not null default 0,
  rows_inserted integer not null default 0,
  rows_updated integer not null default 0,
  rows_skipped integer not null default 0,
  rows_failed integer not null default 0,
  error_summary text,
  created_at timestamptz not null default now()
);

create index swim_sync_logs_run_id_idx
  on public.swim_sync_logs(run_id);

create index swim_sync_logs_started_at_idx
  on public.swim_sync_logs(started_at desc);

-- Seed the six known Swim centers.
insert into public.swim_centers
  (center_code, center_name, source_spreadsheet_id)
values
  ('bintaro-u-town', 'Bintaro U-Town',
   '1okFYVqPFZ0H2ZWna1f9YjLSJsg6-jxdEMX_NA2Q27h4'),
  ('harapan-indah', 'Harapan Indah Bekasi',
   '1_mrsQ855J-JrEN5bTfHFPNo-k7CsGxtJ-eYmOejlx5s'),
  ('taman-palem', 'Taman Palem',
   '1KRvl_Tq-LTUxvq9EBxYt7z77N-ucQuWA5T_IYXPCLko'),
  ('pamulang', 'Pamulang',
   '1RSXVRkALTs0EUB1F_WG--WaUQRS5NtV9Rmmc6dU8y-k'),
  ('karawaci', 'Karawaci',
   '1q-xNnnooq05dFMswdX-rkmHUe8lhnepRRXpUoTiPXwo'),
  ('kalimalang', 'Kalimalang',
   '18_hRWY4aRz0qZz0e3q7Ot24mv80koltvyIMgrDPMcBM')
on conflict (center_code) do nothing;

-- Enable RLS on every application table.
alter table public.swim_centers enable row level security;
alter table public.swim_students enable row level security;
alter table public.swim_memberships enable row level security;
alter table public.swim_attendance enable row level security;
alter table public.swim_sync_logs enable row level security;

-- No direct access for public or signed-in browser roles yet.
-- Add narrowly scoped grants and policies only after reviewing
-- website authentication and the server-side sync mechanism.
revoke all on table public.swim_centers
  from anon, authenticated;
revoke all on table public.swim_students
  from anon, authenticated;
revoke all on table public.swim_memberships
  from anon, authenticated;
revoke all on table public.swim_attendance
  from anon, authenticated;
revoke all on table public.swim_sync_logs
  from anon, authenticated;

commit();
