-- ==============================================================================
-- TRACKADEMIC REAL DATABASE SEEDING
-- File: seed_real_database_records.sql
-- Description:
--   Populates real database rows into Supabase (Profiles, Instructors, Students,
--   Classes, Class Enrollments, and Grades) so the system runs 100% on real DB data.
-- ==============================================================================

-- 1. Insert Administrator Profile
INSERT INTO public.profiles (id, email, password_plain, first_name, last_name, name, role, status)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'admin@sandigan.edu.ph', 'password123', 'System', 'Admin', 'System Admin', 'administrator', 'active')
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role = EXCLUDED.role;

-- 2. Insert Faculty Profiles & Instructors
INSERT INTO public.profiles (id, email, password_plain, first_name, last_name, name, role, status)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'ochavilla@sandigan.edu.ph', 'password123', 'Prof.', 'Ochavilla', 'Prof. Ochavilla', 'instructor', 'active'),
  ('b0000000-0000-0000-0000-000000000002', 'ruiz.mariano@sandigan.edu.ph', 'password123', 'Prof.', 'Ruiz-Mariano', 'Prof. Ruiz-Mariano', 'instructor', 'active'),
  ('b0000000-0000-0000-0000-000000000003', 'fordan@sandigan.edu.ph', 'password123', 'Prof.', 'Fordan', 'Prof. Fordan', 'instructor', 'active'),
  ('b0000000-0000-0000-0000-000000000004', 'ramos@sandigan.edu.ph', 'password123', 'Prof.', 'Ramos', 'Prof. Ramos', 'instructor', 'active'),
  ('b0000000-0000-0000-0000-000000000005', 'bergantin@sandigan.edu.ph', 'password123', 'Prof.', 'Bergantin', 'Prof. Bergantin', 'instructor', 'active'),
  ('b0000000-0000-0000-0000-000000000006', 'valmorida@sandigan.edu.ph', 'password123', 'Prof.', 'Valmorida', 'Prof. Valmorida', 'instructor', 'active'),
  ('b0000000-0000-0000-0000-000000000007', 'barsubia@sandigan.edu.ph', 'password123', 'Prof.', 'Barsubia', 'Prof. Barsubia', 'instructor', 'active')
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role = EXCLUDED.role;

INSERT INTO public.instructors (id, profile_id, employee_no, department)
VALUES 
  ('b1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'EMP-2026-001', 'College of Computer Studies'),
  ('b1000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'EMP-2026-002', 'General Education Department'),
  ('b1000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'EMP-2026-003', 'Mathematics Department'),
  ('b1000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'EMP-2026-004', 'Social Sciences Department'),
  ('b1000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'EMP-2026-005', 'Languages Department'),
  ('b1000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'EMP-2026-006', 'Economics Department'),
  ('b1000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'EMP-2026-007', 'Physical Education Department')
ON CONFLICT (profile_id) DO NOTHING;

-- 3. Insert Student Profiles & Students
INSERT INTO public.profiles (id, email, password_plain, first_name, last_name, name, role, status)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'juan@sandigan.edu.ph', 'password123', 'Juan', 'Dela Cruz', 'Juan Dela Cruz', 'student', 'active'),
  ('c0000000-0000-0000-0000-000000000002', 'maria@sandigan.edu.ph', 'password123', 'Maria', 'Santos', 'Maria Santos', 'student', 'active'),
  ('c0000000-0000-0000-0000-000000000003', 'liam@sandigan.edu.ph', 'password123', 'Liam', 'Reyes', 'Liam Reyes', 'student', 'active'),
  ('c0000000-0000-0000-0000-000000000004', 'alexander@sandigan.edu.ph', 'password123', 'Alexander', 'Cruz', 'Alexander Cruz', 'student', 'active'),
  ('c0000000-0000-0000-0000-000000000005', 'bianca@sandigan.edu.ph', 'password123', 'Bianca', 'Flores', 'Bianca Flores', 'student', 'active'),
  ('c0000000-0000-0000-0000-000000000006', 'carlos@sandigan.edu.ph', 'password123', 'Carlos', 'Mendoza', 'Carlos Mendoza', 'student', 'active')
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role = EXCLUDED.role;

INSERT INTO public.students (id, profile_id, student_no, course, year_level, section_label)
VALUES 
  ('c1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '2026-003', 'BSIT', 2, 'BSIT-2A'),
  ('c1000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', '2026-004', 'BSIT', 2, 'BSIT-2A'),
  ('c1000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', '2026-001', 'BSIT', 2, 'BSIT-2A'),
  ('c1000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', '2026-005', 'BSIT', 2, 'BSIT-2A'),
  ('c1000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', '2026-006', 'BSIT', 2, 'BSIT-2A'),
  ('c1000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000006', '2026-007', 'BSIT', 2, 'BSIT-2A')
ON CONFLICT (student_no) DO NOTHING;

-- 4. Ensure Section BSIT-2A exists with fixed UUID
INSERT INTO public.sections (id, name, course, year_level, school_year, semester)
VALUES ('d0000000-0000-0000-0000-000000000001', 'BSIT-2A', 'BSIT', 2, '2025-2026', '1st Semester')
ON CONFLICT DO NOTHING;

-- 5. Insert Classes linking each of the 8 subjects to faculty & BSIT-2A
INSERT INTO public.classes (id, subject_id, section_id, instructor_id, schedule, room)
SELECT 
  'e0000000-0000-0000-0000-000000000001',
  s.id,
  'd0000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001', -- Ochavilla
  'MW 7:30 AM – 9:45 AM',
  'Computer Lab 1'
FROM public.subjects s WHERE s.code = 'ICT 313330'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.classes (id, subject_id, section_id, instructor_id, schedule, room)
SELECT 
  'e0000000-0000-0000-0000-000000000002',
  s.id,
  'd0000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001', -- Ochavilla
  'MW 9:45 AM – 11:45 AM',
  'Computer Lab 2'
FROM public.subjects s WHERE s.code = 'ICT 313331'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.classes (id, subject_id, section_id, instructor_id, schedule, room)
SELECT 
  'e0000000-0000-0000-0000-000000000003',
  s.id,
  'd0000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000002', -- Ruiz-Mariano
  'TTH 10:45 AM – 11:45 AM',
  'Room 201'
FROM public.subjects s WHERE s.code = 'Perdev II'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.classes (id, subject_id, section_id, instructor_id, schedule, room)
SELECT 
  'e0000000-0000-0000-0000-000000000004',
  s.id,
  'd0000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000003', -- Fordan
  'TTH 9:45 AM – 10:45 AM',
  'Room 202'
FROM public.subjects s WHERE s.code = 'Math 2'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.classes (id, subject_id, section_id, instructor_id, schedule, room)
SELECT 
  'e0000000-0000-0000-0000-000000000005',
  s.id,
  'd0000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000004', -- Ramos
  'MW 2:30 PM – 3:30 PM',
  'Room 203'
FROM public.subjects s WHERE s.code = 'RIZAL'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.classes (id, subject_id, section_id, instructor_id, schedule, room)
SELECT 
  'e0000000-0000-0000-0000-000000000006',
  s.id,
  'd0000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000005', -- Bergantin
  'TTH 1:30 PM – 2:30 PM',
  'Room 204'
FROM public.subjects s WHERE s.code = 'Fil 2'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.classes (id, subject_id, section_id, instructor_id, schedule, room)
SELECT 
  'e0000000-0000-0000-0000-000000000007',
  s.id,
  'd0000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000006', -- Valmorida
  'TTH 8:30 AM – 9:30 AM',
  'Room 205'
FROM public.subjects s WHERE s.code = 'Econ. 2'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.classes (id, subject_id, section_id, instructor_id, schedule, room)
SELECT 
  'e0000000-0000-0000-0000-000000000008',
  s.id,
  'd0000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000007', -- Barsubia
  'TTH 8:30 AM – 9:30 AM',
  'Gymnasium'
FROM public.subjects s WHERE s.code = 'PE. 4'
ON CONFLICT (id) DO NOTHING;

-- 6. Enroll all 6 Students into the 8 Classes in class_students
INSERT INTO public.class_students (class_id, student_id)
SELECT c.id, st.id
FROM public.classes c
CROSS JOIN public.students st
ON CONFLICT (class_id, student_id) DO NOTHING;

-- 7. Insert Initial Grade Summaries
INSERT INTO public.grade_summaries (class_id, student_id, preliminary_grade, midterm_grade, final_grade, overall_grade, remarks)
SELECT 
  c.id,
  st.id,
  85.0,
  86.0,
  88.0,
  86.3,
  'On Track'
FROM public.classes c
CROSS JOIN public.students st
ON CONFLICT DO NOTHING;
