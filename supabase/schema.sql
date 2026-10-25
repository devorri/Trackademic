-- ==============================================================================
-- TRACKADEMIC SUPABASE DATABASE SCHEMA
-- Fully Idempotent Setup Script (Safe to re-run multiple times)
-- ==============================================================================

-- 1. Create ENUM types safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('administrator', 'instructor', 'student');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('active', 'inactive');
  END IF;
END $$;

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_plain text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role app_role NOT NULL DEFAULT 'student'::app_role,
  status user_status NOT NULL DEFAULT 'active'::user_status,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- 3. Create instructors table
CREATE TABLE IF NOT EXISTS public.instructors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE,
  employee_no text NOT NULL UNIQUE,
  department text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT instructors_pkey PRIMARY KEY (id),
  CONSTRAINT instructors_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 4. Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE,
  student_no text NOT NULL UNIQUE,
  course text,
  year_level integer CHECK (year_level >= 1 AND year_level <= 6),
  section_label text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 5. Create subjects table (with laboratory and lecture/lab hours support)
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  units numeric NOT NULL DEFAULT 3.0,
  has_laboratory boolean NOT NULL DEFAULT false,
  lecture_hours integer DEFAULT 3,
  lab_hours integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subjects_pkey PRIMARY KEY (id)
);

-- Ensure columns exist in case table was created previously without them
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'has_laboratory'
  ) THEN
    ALTER TABLE public.subjects ADD COLUMN has_laboratory boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'lecture_hours'
  ) THEN
    ALTER TABLE public.subjects ADD COLUMN lecture_hours integer DEFAULT 3;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'lab_hours'
  ) THEN
    ALTER TABLE public.subjects ADD COLUMN lab_hours integer DEFAULT 0;
  END IF;
END $$;

-- 6. Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  course text,
  year_level integer CHECK (year_level >= 1 AND year_level <= 6),
  school_year text NOT NULL,
  semester text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sections_pkey PRIMARY KEY (id)
);

-- 7. Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL,
  section_id uuid NOT NULL,
  instructor_id uuid NOT NULL,
  schedule text,
  room text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE,
  CONSTRAINT classes_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE,
  CONSTRAINT classes_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(id) ON DELETE CASCADE
);

-- 8. Create class_students join table
CREATE TABLE IF NOT EXISTS public.class_students (
  class_id uuid NOT NULL,
  student_id uuid NOT NULL,
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_students_pkey PRIMARY KEY (class_id, student_id),
  CONSTRAINT class_students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
  CONSTRAINT class_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- 9. Create grade_components table
CREATE TABLE IF NOT EXISTS public.grade_components (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  name text NOT NULL,
  grading_period text NOT NULL CHECK (grading_period = ANY (ARRAY['Preliminary'::text, 'Midterm'::text, 'Final'::text])),
  weight numeric NOT NULL CHECK (weight > 0::numeric AND weight <= 100::numeric),
  max_score numeric NOT NULL DEFAULT 100 CHECK (max_score > 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT grade_components_pkey PRIMARY KEY (id),
  CONSTRAINT grade_components_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE
);

-- 10. Create grades table
CREATE TABLE IF NOT EXISTS public.grades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  component_id uuid NOT NULL,
  student_id uuid NOT NULL,
  score numeric NOT NULL CHECK (score >= 0::numeric),
  encoded_by uuid,
  encoded_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT grades_pkey PRIMARY KEY (id),
  CONSTRAINT grades_component_id_fkey FOREIGN KEY (component_id) REFERENCES public.grade_components(id) ON DELETE CASCADE,
  CONSTRAINT grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT grades_encoded_by_fkey FOREIGN KEY (encoded_by) REFERENCES public.profiles(id)
);

-- 11. Create grade_summaries table
CREATE TABLE IF NOT EXISTS public.grade_summaries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  student_id uuid NOT NULL,
  preliminary_grade numeric,
  midterm_grade numeric,
  final_grade numeric,
  overall_grade numeric,
  remarks text,
  computed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT grade_summaries_pkey PRIMARY KEY (id),
  CONSTRAINT grade_summaries_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
  CONSTRAINT grade_summaries_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- 12. Create predictions table
CREATE TABLE IF NOT EXISTS public.predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  student_id uuid NOT NULL,
  status text NOT NULL,
  confidence numeric NOT NULL DEFAULT 0 CHECK (confidence >= 0::numeric AND confidence <= 100::numeric),
  basis jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT predictions_pkey PRIMARY KEY (id),
  CONSTRAINT predictions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
  CONSTRAINT predictions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- 13. Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid,
  student_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  generated_by uuid,
  export_format text CHECK (export_format = ANY (ARRAY['view'::text, 'print'::text, 'pdf'::text, 'excel'::text])),
  file_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
  CONSTRAINT reports_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.profiles(id)
);

-- 14. Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  actor_id uuid,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id)
);

-- 15. Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_year text NOT NULL DEFAULT '2025-2026'::text,
  semester text NOT NULL DEFAULT '1st Semester'::text,
  passing_grade numeric NOT NULL DEFAULT 75.0,
  prelim_weight numeric NOT NULL DEFAULT 30.0,
  midterm_weight numeric NOT NULL DEFAULT 30.0,
  final_weight numeric NOT NULL DEFAULT 40.0,
  quiz_weight numeric NOT NULL DEFAULT 20.0,
  activity_weight numeric NOT NULL DEFAULT 20.0,
  attendance_weight numeric NOT NULL DEFAULT 10.0,
  participation_weight numeric NOT NULL DEFAULT 10.0,
  exam_weight numeric NOT NULL DEFAULT 40.0,
  lab_exam_weight numeric NOT NULL DEFAULT 25.0,
  with_lab_quiz_weight numeric NOT NULL DEFAULT 15.0,
  with_lab_activity_weight numeric NOT NULL DEFAULT 15.0,
  with_lab_exam_weight numeric NOT NULL DEFAULT 25.0,
  email_alerts boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (id)
);

-- 16. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 17. Safe RLS Policies (Idempotent: drop if exists then create)
DROP POLICY IF EXISTS "profiles_allow_all" ON public.profiles;
CREATE POLICY "profiles_allow_all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "instructors_allow_all" ON public.instructors;
CREATE POLICY "instructors_allow_all" ON public.instructors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "students_allow_all" ON public.students;
CREATE POLICY "students_allow_all" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "subjects_allow_all" ON public.subjects;
CREATE POLICY "subjects_allow_all" ON public.subjects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sections_allow_all" ON public.sections;
CREATE POLICY "sections_allow_all" ON public.sections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "classes_allow_all" ON public.classes;
CREATE POLICY "classes_allow_all" ON public.classes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "class_students_allow_all" ON public.class_students;
CREATE POLICY "class_students_allow_all" ON public.class_students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "grade_components_allow_all" ON public.grade_components;
CREATE POLICY "grade_components_allow_all" ON public.grade_components FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "grades_allow_all" ON public.grades;
CREATE POLICY "grades_allow_all" ON public.grades FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "grade_summaries_allow_all" ON public.grade_summaries;
CREATE POLICY "grade_summaries_allow_all" ON public.grade_summaries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "predictions_allow_all" ON public.predictions;
CREATE POLICY "predictions_allow_all" ON public.predictions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "reports_allow_all" ON public.reports;
CREATE POLICY "reports_allow_all" ON public.reports FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "activity_logs_allow_all" ON public.activity_logs;
CREATE POLICY "activity_logs_allow_all" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "system_settings_allow_all" ON public.system_settings;
CREATE POLICY "system_settings_allow_all" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

-- 18. Seed / Upsert the 8 Curriculum Subjects from Grading Book Template
INSERT INTO public.subjects (code, title, units, has_laboratory, lecture_hours, lab_hours)
VALUES 
  ('ICT 313330', 'Apply Object-Oriented Programming Language Skills', 5.0, true, 3, 2),
  ('ICT 313331', 'Apply Programming Skills in Second Language', 5.0, true, 3, 2),
  ('Perdev II', 'Personality Development II', 3.0, false, 3, 0),
  ('Math 2', 'Statistics', 3.0, false, 3, 0),
  ('RIZAL', 'Life Works of Rizal', 3.0, false, 3, 0),
  ('Fil 2', 'Panitikan', 3.0, false, 3, 0),
  ('Econ. 2', 'Environmental Protection and Prevention II', 3.0, false, 3, 0),
  ('PE. 4', 'Team Sports', 2.0, false, 2, 0)
ON CONFLICT (code) DO UPDATE 
SET has_laboratory = EXCLUDED.has_laboratory,
    units = EXCLUDED.units,
    title = EXCLUDED.title,
    lecture_hours = EXCLUDED.lecture_hours,
    lab_hours = EXCLUDED.lab_hours;
