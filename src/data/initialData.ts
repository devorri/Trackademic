import type { User, Student, Subject, ClassRecord, GradeRow } from '../utils/types'
import { roleEmails } from '../utils/constants'

export const initialUsers: User[] = [
  { id: 1, name: 'Anna Cruz', email: roleEmails.Administrator, role: 'Administrator', status: 'Active' },
  { id: 2, name: 'Marco Reyes', email: roleEmails.Instructor, role: 'Instructor', status: 'Active' },
  { id: 3, name: 'Rhea Cruz', email: roleEmails.Student, role: 'Student', status: 'Active' },
  { id: 4, name: 'Ben Ortiz', email: 'ben.ortiz@sandigan.edu.ph', role: 'Instructor', status: 'Inactive' },
]

export const initialStudents: Student[] = [
  { id: 101, name: 'Aira Mendoza', email: 'aira@sandigan.edu.ph', studentNo: 'SC-2026-069', course: 'BSIT', section: '1A' },
  { id: 102, name: 'Miguel Santos', email: 'miguel@sandigan.edu.ph', studentNo: 'SC-2026-070', course: 'BSCS', section: '2B' },
  { id: 103, name: 'Rhea Cruz', email: roleEmails.Student, studentNo: 'SC-2026-072', course: 'BSCS', section: '2B' },
  { id: 104, name: 'Noel Garcia', email: 'noel@sandigan.edu.ph', studentNo: 'SC-2026-073', course: 'BSED', section: '1C' },
]

export const initialSubjects: Subject[] = [
  { id: 201, code: 'MATH101', title: 'Mathematics 101', units: 3 },
  { id: 202, code: 'SCI102', title: 'Science 102', units: 3 },
  { id: 203, code: 'ENG103', title: 'English 103', units: 3 },
]

export const initialClasses: ClassRecord[] = [
  {
    id: 301,
    subjectId: 201,
    section: 'BSIT 1A',
    instructor: 'Marco Reyes',
    room: 'Room 204',
    schedule: 'MWF 9:00 AM',
    studentIds: [101, 102, 103, 104],
  },
  {
    id: 302,
    subjectId: 202,
    section: 'BSCS 2B',
    instructor: 'Marco Reyes',
    room: 'Lab 3',
    schedule: 'TTh 1:00 PM',
    studentIds: [102, 103],
  },
]

export const initialGrades: Record<number, GradeRow[]> = {
  301: [
    { studentId: 101, quizzes: 94, assignments: 91, activities: 93, midtermExam: 90, finalExam: 95, historical: 89 },
    { studentId: 102, quizzes: 86, assignments: 84, activities: 88, midtermExam: 82, finalExam: 85, historical: 82 },
    { studentId: 103, quizzes: 79, assignments: 77, activities: 80, midtermExam: 76, finalExam: 78, historical: 77 },
    { studentId: 104, quizzes: 70, assignments: 69, activities: 72, midtermExam: 68, finalExam: 70, historical: 73 },
  ],
  302: [
    { studentId: 102, quizzes: 83, assignments: 87, activities: 85, midtermExam: 86, finalExam: 88, historical: 82 },
    { studentId: 103, quizzes: 91, assignments: 89, activities: 92, midtermExam: 90, finalExam: 93, historical: 86 },
  ],
}
