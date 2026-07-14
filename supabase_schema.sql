-- Trackademic Supabase schema
-- Paste this file into Supabase Dashboard > SQL Editor > New query > Run.
-- Google OAuth is intentionally not used here. Enable Email provider only in Authentication settings.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('administrator', 'instructor', 'student');
  end if;

  if not exists (select 1 from pg_type where typname = 'user_status') then
    create type public.user_status as enum ('active', 'inactive');
  end if;

  if not exists (select 1 from pg_type where typname = 'prediction_status') then
    create type public.prediction_status as enum ('Excellent', 'Good', 'Average', 'At Risk');
  end if;

  if not exists (select 1 from pg_type where typname = 'report_type') then
    create type public.report_type as enum (
      'Student Grade Report',
      'Class Record',
      'Academic Performance Report',
      'Prediction Report'
    );
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  first_name text not null,
  last_name text not null,
  email text not null unique,
  status public.user_status not null default 'active',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  employee_no text not null unique,
  department text,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  student_no text not null unique,
  course text,
  year_level int check (year_level between 1 and 6),
  section_label text,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  units numeric(3,1) not null default 3.0,
  created_at timestamptz not null default now()
);

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course text,
  year_level int check (year_level between 1 and 6),
  school_year text not null,
  semester text not null,
  created_at timestamptz not null default now(),
  unique (name, school_year, semester)
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete restrict,
  section_id uuid not null references public.sections(id) on delete restrict,
  instructor_id uuid not null references public.instructors(id) on delete restrict,
  schedule text,
  room text,
  created_at timestamptz not null default now(),
  unique (subject_id, section_id, instructor_id)
);

create table if not exists public.class_students (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table if not exists public.grade_components (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  grading_period text not null check (grading_period in ('Preliminary', 'Midterm', 'Final')),
  weight numeric(5,2) not null check (weight > 0 and weight <= 100),
  max_score numeric(8,2) not null default 100 check (max_score > 0),
  created_at timestamptz not null default now(),
  unique (class_id, name, grading_period)
);

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.grade_components(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  score numeric(8,2) not null check (score >= 0),
  encoded_by uuid references public.profiles(id) on delete set null,
  encoded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (component_id, student_id)
);

create table if not exists public.grade_summaries (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  preliminary_grade numeric(5,2),
  midterm_grade numeric(5,2),
  final_grade numeric(5,2),
  overall_grade numeric(5,2),
  remarks text,
  computed_at timestamptz not null default now(),
  unique (class_id, student_id)
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status public.prediction_status not null,
  confidence numeric(5,2) not null default 0 check (confidence >= 0 and confidence <= 100),
  basis jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  unique (class_id, student_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  type public.report_type not null,
  title text not null,
  generated_by uuid references public.profiles(id) on delete set null,
  export_format text check (export_format in ('view', 'print', 'pdf', 'excel')),
  file_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  table_name text,
  record_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_grades_updated_at on public.grades;
create trigger set_grades_updated_at
before update on public.grades
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', 'New'),
    coalesce(new.raw_user_meta_data->>'last_name', 'User'),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'student')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'administrator'
      and status = 'active'
  );
$$;

create or replace function public.is_instructor_for_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes c
    join public.instructors i on i.id = c.instructor_id
    where c.id = target_class_id
      and i.profile_id = auth.uid()
  );
$$;

create or replace function public.is_student_in_class(target_class_id uuid, target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.students s
    join public.class_students cs on cs.student_id = s.id
    where s.profile_id = auth.uid()
      and cs.class_id = target_class_id
      and cs.student_id = target_student_id
  );
$$;

create or replace function public.compute_class_grades(target_class_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.grade_summaries (
    class_id,
    student_id,
    preliminary_grade,
    midterm_grade,
    final_grade,
    overall_grade,
    remarks,
    computed_at
  )
  select
    target_class_id,
    cs.student_id,
    round(sum(case when gc.grading_period = 'Preliminary' then (g.score / gc.max_score) * gc.weight end), 2),
    round(sum(case when gc.grading_period = 'Midterm' then (g.score / gc.max_score) * gc.weight end), 2),
    round(sum(case when gc.grading_period = 'Final' then (g.score / gc.max_score) * gc.weight end), 2),
    round(avg((g.score / gc.max_score) * 100), 2),
    case when round(avg((g.score / gc.max_score) * 100), 2) < 75 then 'Needs intervention' else 'Passed monitoring' end,
    now()
  from public.class_students cs
  left join public.grade_components gc on gc.class_id = cs.class_id
  left join public.grades g on g.component_id = gc.id and g.student_id = cs.student_id
  where cs.class_id = target_class_id
  group by cs.student_id
  on conflict (class_id, student_id) do update set
    preliminary_grade = excluded.preliminary_grade,
    midterm_grade = excluded.midterm_grade,
    final_grade = excluded.final_grade,
    overall_grade = excluded.overall_grade,
    remarks = excluded.remarks,
    computed_at = now();
end;
$$;

create or replace function public.refresh_predictions(target_class_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.predictions (class_id, student_id, status, confidence, basis, generated_at)
  select
    class_id,
    student_id,
    case
      when overall_grade >= 90 then 'Excellent'::public.prediction_status
      when overall_grade >= 83 then 'Good'::public.prediction_status
      when overall_grade >= 75 then 'Average'::public.prediction_status
      else 'At Risk'::public.prediction_status
    end,
    case
      when overall_grade is null then 0
      when overall_grade < 75 then 88
      else 82
    end,
    jsonb_build_object(
      'overall_grade', overall_grade,
      'preliminary_grade', preliminary_grade,
      'midterm_grade', midterm_grade,
      'final_grade', final_grade
    ),
    now()
  from public.grade_summaries
  where class_id = target_class_id
  on conflict (class_id, student_id) do update set
    status = excluded.status,
    confidence = excluded.confidence,
    basis = excluded.basis,
    generated_at = now();
end;
$$;

alter table public.profiles enable row level security;
alter table public.instructors enable row level security;
alter table public.students enable row level security;
alter table public.subjects enable row level security;
alter table public.sections enable row level security;
alter table public.classes enable row level security;
alter table public.class_students enable row level security;
alter table public.grade_components enable row level security;
alter table public.grades enable row level security;
alter table public.grade_summaries enable row level security;
alter table public.predictions enable row level security;
alter table public.reports enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
drop policy if exists "admin_full_access_instructors" on public.instructors;
drop policy if exists "instructors_select_own" on public.instructors;
drop policy if exists "admin_full_access_students" on public.students;
drop policy if exists "students_select_own" on public.students;
drop policy if exists "authenticated_subjects_read" on public.subjects;
drop policy if exists "admin_subjects_write" on public.subjects;
drop policy if exists "authenticated_sections_read" on public.sections;
drop policy if exists "admin_sections_write" on public.sections;
drop policy if exists "classes_read_by_role" on public.classes;
drop policy if exists "admin_classes_write" on public.classes;
drop policy if exists "class_students_read_by_role" on public.class_students;
drop policy if exists "admin_class_students_write" on public.class_students;
drop policy if exists "grade_components_read_by_role" on public.grade_components;
drop policy if exists "grade_components_write_by_admin_or_instructor" on public.grade_components;
drop policy if exists "grades_read_by_role" on public.grades;
drop policy if exists "grades_write_by_admin_or_instructor" on public.grades;
drop policy if exists "grade_summaries_read_by_role" on public.grade_summaries;
drop policy if exists "grade_summaries_write_by_admin_or_instructor" on public.grade_summaries;
drop policy if exists "predictions_read_by_role" on public.predictions;
drop policy if exists "predictions_write_by_admin_or_instructor" on public.predictions;
drop policy if exists "reports_read_by_role" on public.reports;
drop policy if exists "reports_write_by_admin_or_instructor" on public.reports;
drop policy if exists "activity_logs_admin_read" on public.activity_logs;
drop policy if exists "activity_logs_authenticated_insert" on public.activity_logs;

create policy "profiles_select_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "admin_full_access_instructors"
on public.instructors for all
using (public.is_admin())
with check (public.is_admin());

create policy "instructors_select_own"
on public.instructors for select
using (profile_id = auth.uid() or public.is_admin());

create policy "admin_full_access_students"
on public.students for all
using (public.is_admin())
with check (public.is_admin());

create policy "students_select_own"
on public.students for select
using (profile_id = auth.uid() or public.is_admin());

create policy "authenticated_subjects_read"
on public.subjects for select
using (auth.role() = 'authenticated');

create policy "admin_subjects_write"
on public.subjects for all
using (public.is_admin())
with check (public.is_admin());

create policy "authenticated_sections_read"
on public.sections for select
using (auth.role() = 'authenticated');

create policy "admin_sections_write"
on public.sections for all
using (public.is_admin())
with check (public.is_admin());

create policy "classes_read_by_role"
on public.classes for select
using (
  public.is_admin()
  or public.is_instructor_for_class(id)
  or exists (
    select 1
    from public.students s
    join public.class_students cs on cs.student_id = s.id
    where s.profile_id = auth.uid()
      and cs.class_id = classes.id
  )
);

create policy "admin_classes_write"
on public.classes for all
using (public.is_admin())
with check (public.is_admin());

create policy "class_students_read_by_role"
on public.class_students for select
using (
  public.is_admin()
  or public.is_instructor_for_class(class_id)
  or exists (
    select 1
    from public.students s
    where s.id = class_students.student_id
      and s.profile_id = auth.uid()
  )
);

create policy "admin_class_students_write"
on public.class_students for all
using (public.is_admin())
with check (public.is_admin());

create policy "grade_components_read_by_role"
on public.grade_components for select
using (
  public.is_admin()
  or public.is_instructor_for_class(class_id)
  or exists (
    select 1
    from public.students s
    join public.class_students cs on cs.student_id = s.id
    where s.profile_id = auth.uid()
      and cs.class_id = grade_components.class_id
  )
);

create policy "grade_components_write_by_admin_or_instructor"
on public.grade_components for all
using (public.is_admin() or public.is_instructor_for_class(class_id))
with check (public.is_admin() or public.is_instructor_for_class(class_id));

create policy "grades_read_by_role"
on public.grades for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.grade_components gc
    where gc.id = grades.component_id
      and public.is_instructor_for_class(gc.class_id)
  )
  or exists (
    select 1
    from public.students s
    where s.id = grades.student_id
      and s.profile_id = auth.uid()
  )
);

create policy "grades_write_by_admin_or_instructor"
on public.grades for all
using (
  public.is_admin()
  or exists (
    select 1
    from public.grade_components gc
    where gc.id = grades.component_id
      and public.is_instructor_for_class(gc.class_id)
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.grade_components gc
    where gc.id = grades.component_id
      and public.is_instructor_for_class(gc.class_id)
  )
);

create policy "grade_summaries_read_by_role"
on public.grade_summaries for select
using (
  public.is_admin()
  or public.is_instructor_for_class(class_id)
  or public.is_student_in_class(class_id, student_id)
);

create policy "grade_summaries_write_by_admin_or_instructor"
on public.grade_summaries for all
using (public.is_admin() or public.is_instructor_for_class(class_id))
with check (public.is_admin() or public.is_instructor_for_class(class_id));

create policy "predictions_read_by_role"
on public.predictions for select
using (
  public.is_admin()
  or public.is_instructor_for_class(class_id)
  or public.is_student_in_class(class_id, student_id)
);

create policy "predictions_write_by_admin_or_instructor"
on public.predictions for all
using (public.is_admin() or public.is_instructor_for_class(class_id))
with check (public.is_admin() or public.is_instructor_for_class(class_id));

create policy "reports_read_by_role"
on public.reports for select
using (
  public.is_admin()
  or generated_by = auth.uid()
  or (class_id is not null and public.is_instructor_for_class(class_id))
  or (class_id is not null and student_id is not null and public.is_student_in_class(class_id, student_id))
);

create policy "reports_write_by_admin_or_instructor"
on public.reports for insert
with check (
  public.is_admin()
  or (class_id is not null and public.is_instructor_for_class(class_id))
);

create policy "activity_logs_admin_read"
on public.activity_logs for select
using (public.is_admin());

create policy "activity_logs_authenticated_insert"
on public.activity_logs for insert
with check (auth.role() = 'authenticated');

create or replace view public.at_risk_students
with (security_invoker = true) as
select
  p.class_id,
  p.student_id,
  pr.first_name,
  pr.last_name,
  pr.email,
  gs.overall_grade,
  p.status,
  p.confidence,
  p.generated_at
from public.predictions p
join public.students s on s.id = p.student_id
join public.profiles pr on pr.id = s.profile_id
left join public.grade_summaries gs on gs.class_id = p.class_id and gs.student_id = p.student_id
where p.status = 'At Risk';

create or replace view public.dashboard_totals
with (security_invoker = true) as
select
  (select count(*) from public.students) as total_students,
  (select count(*) from public.instructors) as total_instructors,
  (select count(*) from public.subjects) as total_subjects,
  (select count(*) from public.classes) as total_classes,
  (select count(*) from public.predictions where status = 'At Risk') as students_at_risk,
  (select round(avg(overall_grade), 2) from public.grade_summaries) as average_class_performance;
