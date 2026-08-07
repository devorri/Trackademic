export type Role = 'Administrator' | 'Instructor' | 'Student'
export type UserStatus = 'Active' | 'Inactive'
export type PredictionStatus = 'Excellent' | 'Good' | 'Average' | 'At Risk' | 'Bound to Fail'
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
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  password?: string;
};

export type Profile = {
  id: string;
  email: string;
  password_plain: string;
  first_name: string;
  last_name: string;
  role: Role;
  status: UserStatus;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type Student = {
  id: number;
  name: string;
  studentNo: string;
  course: string;
  section: string;
  profileId?: string;
  // UI fields for editing profile within student form
  email?: string;
  password?: string;
};

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

export type PredictionAnalysis = {
  preliminary: number
  midterm: number
  final: number
  overall: number
  gpaEquiv: string
  status: PredictionStatus
  confidence: number
  riskFactors: string[]
  requiredFinalScore: number
  recommendation: string
}

export type ClassAverages = {
  quizzesAvg: number
  assignmentsAvg: number
  activitiesAvg: number
  midtermAvg: number
  finalAvg: number
  overallAvg: number
  gpaAvg: string
  totalStudents: number
  atRiskCount: number
  boundToFailCount: number
  safeCount: number
}

export type Report = {
  id: number
  type: ReportType
  title: string
  generatedBy: string
  generatedAt: string
}
// Removed incorrect alias; User is defined above
