-- ==============================================================================
-- TRACKADEMIC DATABASE MIGRATION
-- Migration: 20261026_align_grading_and_laboratory.sql
-- Description: Aligns Supabase schema with Grading_Book_Template (1).xlsx:
--   1. Ensures public.subjects exists with laboratory and lecture/lab hours
--   2. Ensures public.system_settings exists with grading weights
--   3. Seeds the exact 8 curriculum subjects (2 with-lab, 6 lecture-only)
-- ==============================================================================

-- 1. Ensure public.subjects table exists
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

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'subjects_allow_all'
  ) THEN
    CREATE POLICY "subjects_allow_all" ON public.subjects
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- In case subjects table already existed from older schema, add columns safely
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

-- 2. Create or update public.system_settings table
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

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'system_settings' AND policyname = 'system_settings_allow_all'
  ) THEN
    CREATE POLICY "system_settings_allow_all" ON public.system_settings
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 3. Upsert the 8 exact Curriculum Subjects matching Grading_Book_Template (1).xlsx
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
