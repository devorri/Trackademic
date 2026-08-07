-- Create ENUM types
CREATE TYPE app_role AS ENUM ('administrator', 'instructor', 'student');
CREATE TYPE user_status AS ENUM ('active', 'inactive');

-- Create profiles table
CREATE TABLE public.profiles (
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

-- Create instructors table
CREATE TABLE public.instructors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE,
  employee_no text NOT NULL UNIQUE,
  department text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT instructors_pkey PRIMARY KEY (id),
  CONSTRAINT instructors_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create students table
CREATE TABLE public.students (
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

-- Create subjects table
CREATE TABLE public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  units numeric NOT NULL DEFAULT 3.0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subjects_pkey PRIMARY KEY (id)
);

-- Create sections table
CREATE TABLE public.sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  course text,
  year_level integer CHECK (year_level >= 1 AND year_level <= 6),
  school_year text NOT NULL,
  semester text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sections_pkey PRIMARY KEY (id)
);

-- Create classes table
CREATE TABLE public.classes (
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

-- Create class_students join table
CREATE TABLE public.class_students (
  class_id uuid NOT NULL,
  student_id uuid NOT NULL,
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_students_pkey PRIMARY KEY (class_id, student_id),
  CONSTRAINT class_students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
  CONSTRAINT class_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- Create grade_components table
CREATE TABLE public.grade_components (
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

-- Create grades table
CREATE TABLE public.grades (
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

-- Create grade_summaries table
CREATE TABLE public.grade_summaries (
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

-- Create predictions table
CREATE TABLE public.predictions (
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

-- Create reports table
CREATE TABLE public.reports (
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

-- Create activity_logs table
CREATE TABLE public.activity_logs (
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

-- Enable Row Level Security (RLS)
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

-- Create RLS policies for public access (development mode)
-- Allow all operations for authenticated and anonymous users

CREATE POLICY "profiles_allow_all" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "instructors_allow_all" ON public.instructors
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "students_allow_all" ON public.students
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "subjects_allow_all" ON public.subjects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "sections_allow_all" ON public.sections
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "classes_allow_all" ON public.classes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "class_students_allow_all" ON public.class_students
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "grade_components_allow_all" ON public.grade_components
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "grades_allow_all" ON public.grades
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "grade_summaries_allow_all" ON public.grade_summaries
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "predictions_allow_all" ON public.predictions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "reports_allow_all" ON public.reports
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "activity_logs_allow_all" ON public.activity_logs
  FOR ALL USING (true) WITH CHECK (true);
