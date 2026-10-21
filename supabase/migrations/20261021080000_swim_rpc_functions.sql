
-- Sparks Swim: limited RPC functions for the public website.
-- Does not grant direct access to application tables.

begin;

-- 1. Normalize Indonesian phone-number formats for matching.
create or replace function public.normalize_swim_phone(p_phone text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when d like '62%' then '0' || substr(d, 3)
    when d like '8%' then '0' || d
    else d
  end
  from (
    select pg_catalog.regexp_replace(
      coalesce(p_phone, ''),
      '[^0-9]',
      '',
      'g'
    ) as d
  ) normalized;
$$;

-- This helper must not be callable directly by public browser roles.
revoke all on function public.normalize_swim_phone(text)
  from public, anon, authenticated;

-- 2. Find memberships registered to a parent's phone number.
create or replace function public.get_swim_students_by_phone(
  p_phone text
)
returns table (
  membership_id uuid,
  student_id uuid,
  source_student_id text,
  student_name text,
  center_code text,
  center_name text,
  student_status text,
  sessions_used numeric,
  sessions_remaining numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    m.id,
    s.id,
    m.source_student_id,
    s.student_name,
    c.center_code,
    c.center_name,
    m.student_status,
    m.sessions_used,
    m.sessions_remaining
  from public.swim_memberships m
  join public.swim_students s on s.id = m.student_id
  join public.swim_centers c on c.id = m.center_id
  where c.is_active = true
    and public.normalize_swim_phone(m.phone)
        = public.normalize_swim_phone(p_phone)
    and public.normalize_swim_phone(p_phone) <> ''
  order by c.center_name, s.student_name;
$$;

-- 3. Return attendance only after validating the phone against
-- the requested membership. A membership UUID alone is insufficient.
create or replace function public.get_swim_attendance_by_membership(
  p_membership_id uuid,
  p_phone text
)
returns table (
  attendance_id uuid,
  attendance_date date,
  check_in_time text,
  attendance_status text,
  session_type text,
  duration_minutes numeric,
  scheduled_time text,
  level text,
  age_group text,
  coach text,
  student_advisor text,
  coach_notes text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    a.id,
    a.attendance_date,
    a.check_in_time,
    a.attendance_status,
    a.session_type,
    a.duration_minutes,
    a.scheduled_time,
    a.level,
    a.age_group,
    a.coach,
    a.student_advisor,
    a.coach_notes
  from public.swim_attendance a
  join public.swim_memberships m on m.id = a.membership_id
  join public.swim_centers c on c.id = m.center_id
  where m.id = p_membership_id
    and c.is_active = true
    and public.normalize_swim_phone(m.phone)
        = public.normalize_swim_phone(p_phone)
    and public.normalize_swim_phone(p_phone) <> ''
  order by a.attendance_date desc, a.id desc;
$$;

-- 4. Grant execution of only the intended RPCs.
revoke all on function
  public.get_swim_students_by_phone(text)
  from public, anon, authenticated;

revoke all on function
  public.get_swim_attendance_by_membership(uuid, text)
  from public, anon, authenticated;

grant execute on function
  public.get_swim_students_by_phone(text)
  to anon, authenticated;

grant execute on function
  public.get_swim_attendance_by_membership(uuid, text)
  to anon, authenticated;

commit;
