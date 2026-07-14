export type Role = 'Administrator' | 'Instructor' | 'Student'
export type UserStatus = 'Active' | 'Inactive'
export type PredictionStatus = 'Excellent' | 'Good' | 'Average' | 'At Risk'
export type ReportType = 'Student Grade Report' | 'Class Record' | 'Academic Performance Report' | 'Prediction Report'
export type DashboardSection =
  | 'overview'
  | 'users'
  | 'students'
  | 'classes'
  | 'gradebook'
  | 'analytics'
  | 'reports'
  | 'grades'

export type User = {
  id: number
  name: string
  email: string
  role: Role
  status: UserStatus
}

export type Student = {
  id: number
  name: string
  email: string
  studentNo: string
  course: string
  section: string
}

export type Subject = {
  id: number
  code: string
  title: string
  units: number
}

export type ClassRecord = {
  id: number
  subjectId: number
  section: string
  instructor: string
  room: string
  schedule: string
  studentIds: number[]
}

export type GradeRow = {
  studentId: number
  quizzes: number
  assignments: number
  activities: number
  midtermExam: number
  finalExam: number
  historical: number
}

export type Report = {
  id: number
  type: ReportType
  title: string
  generatedBy: string
  generatedAt: string
}
