export type Role = 'administrator' | 'instructor' | 'student'
export type UserStatus = 'active' | 'inactive' | 'dropped'
export type PredictionStatus =
  | 'Excellent'
  | 'Good'
  | 'Average'
  | 'At Risk'
  | 'Bound to Fail'
  | 'On Track'
  | 'High'
  | 'Pending'
  | 'Dropped'
export type ReportType =
  | 'Student Performance Report'
  | 'Class Performance Report'
  | 'Instructor / Class Summary'
  | 'At-Risk Student Report'
  | 'Grade Summary'
  | 'Predictive Analytics Report'
  | 'Class Grade Report'
  | 'Class Average Report'
  | 'Student Grade Report'
  | 'Class Record'
  | 'Academic Performance Report'
  | 'Prediction Report'
export type DashboardSection =
  | 'overview'
  | 'users'
  | 'instructors'
  | 'students'
  | 'classes'
  | 'predictive_analytics'
  | 'gradebook'
  | 'analytics'
  | 'reports'
  | 'notifications'
  | 'activity_logs'
  | 'settings'
  | 'grades'
  | 'prediction'
  | 'performance'
  | 'profile'

export type Profile = {
  id: string
  name?: string
  email?: string
  password_plain?: string
  first_name?: string
  last_name?: string
  role: Role | string
  status?: UserStatus
  avatar_url?: string
  face_embedding?: any
  camera_status?: string
  created_at: string
  updated_at?: string
}

export type User = {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  password?: string
  profile_id?: string
}

export type Instructor = {
  id: string
  profile_id: string
  employee_no: string
  department?: string
  created_at: string
  name?: string
  email?: string
}

export type Student = {
  id: string
  profile_id: string
  student_no: string
  course?: string
  year_level?: number
  year?: string | number
  section_label?: string
  status?: UserStatus
  created_at: string
  // UI fields for editing profile within student form
  name?: string
  studentNo?: string // Alias for student_no (form compatibility)
  email?: string
  password?: string
  confirmPassword?: string
}

export type StudentRecord = Student

export type Subject = {
  id: string
  code: string
  title: string
  units: number
  has_laboratory?: boolean
  hasLab?: boolean
  lecture_hours?: number
  lab_hours?: number
  created_at: string
}

export type Section = {
  id: string
  name: string
  course?: string
  year_level?: number
  school_year: string
  semester: string
  created_at: string
}

export type ClassRecord = {
  id: string
  subject_id: string
  section_id: string
  instructor_id: string
  schedule?: string
  room?: string
  created_at: string
  studentIds?: string[]
  student_ids?: string[]
  students?: Student[]
  subject?: Subject
  instructor?: Instructor
  section?: Section
}

export type GradeComponent = {
  id: string
  class_id: string
  name: string
  grading_period: 'Preliminary' | 'Midterm' | 'Final'
  weight: number
  max_score: number
  created_at: string
}

export type Grade = {
  id: string
  component_id: string
  student_id: string
  score: number
  encoded_by?: string
  encoded_at: string
  updated_at: string
}

export type GradeSummary = {
  id: string
  class_id: string
  student_id: string
  preliminary_grade?: number
  midterm_grade?: number
  prefinal_grade?: number
  final_grade?: number
  overall_grade?: number
  remarks?: string
  computed_at: string
}

export type GradeRow = {
  studentId: string
  student_name?: string
  quizzes: number
  assignments: number
  activities: number
  midtermExam: number
  finalExam: number
  historical: number
  attendance?: number
  participation?: number
  labExam?: number
  prelim?: DetailedTermScores
  midterm?: DetailedTermScores
  prefinal?: DetailedTermScores
  final?: DetailedTermScores
}

export type Prediction = {
  id: string
  class_id: string
  student_id: string
  status: PredictionStatus | string
  confidence: number
  basis: Record<string, any>
  generated_at: string
  current_grade?: number
  predicted_grade?: number
}

export type PredictionAnalysis = {
  preliminary: number
  midterm: number
  prefinal?: number
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
  id: string
  class_id?: string
  student_id?: string
  type: ReportType
  title: string
  generated_by?: string
  export_format?: 'view' | 'print' | 'pdf' | 'excel' | 'csv'
  file_url?: string
  created_at: string
}

export type GradingPeriodKey = 'prelim' | 'midterm' | 'prefinal' | 'final'
export type TermComponentField =
  | 'attendance'
  | 'quiz'
  | 'activity'
  | 'participation'
  | 'exam'
  | 'labActivity'

export type TermComponentItems = {
  attendance: number[]
  quiz: number[]
  activity: number[]
  participation: number[]
  exam: number[]
  labActivity?: number[]
}

export type DetailedTermScores = {
  attendance: number
  quiz: number
  activity: number
  participation: number
  exam: number
  labActivity: number | null
  rawGrade?: number
  computedTermGrade: number
  termGrade: number
  hasData?: boolean
  items?: TermComponentItems
  // Legacy compatibility
  quiz1?: number
  quiz2?: number
  act1?: number
  act2?: number
  act3?: number
  activities?: number
  labExam?: number | null
}

export type DetailedGradingSheet = {
  studentId: string
  studentName?: string
  studentNo?: string
  prelim: DetailedTermScores
  midterm: DetailedTermScores
  prefinal?: DetailedTermScores
  final: DetailedTermScores
  // Legacy flat fields for backward compatibility
  prelimExam?: number
  quiz?: number
  activity?: number
  attendance?: number
  participation?: number
  labExam?: number | null
  midtermScore?: number
  finalScore?: number
  average: number
  overallGrade: number
  predictedFinal?: number
  status: PredictionStatus
  submittedToAdmin?: boolean
  submittedAt?: string
}

export type StudentAssessmentRow = {
  subjectId?: string
  code: string
  title: string
  units: number
  hasLaboratory: boolean
  prelim: DetailedTermScores
  midterm: DetailedTermScores
  prefinal?: DetailedTermScores
  final: DetailedTermScores
  prelimExam?: number
  quiz?: number
  activity?: number
  attendance?: number
  participation?: number
  labExam?: number | null
  subjectAverage: number
}

export type NotificationItem = {
  id: string
  user_id?: string | null
  title: string
  message: string
  timestamp: string
  read: boolean
  is_read?: boolean
  role: Role | 'all'
  category?: 'system' | 'grades' | 'risk' | 'report' | 'user' | 'class' | 'enrollment' | 'dropout'
  created_at?: string
}

export type ActivityLogItem = {
  id: string
  actor: string
  actor_id?: string | null
  action: string
  timestamp: string
  timeFormatted: string
  target?: string
  metadata?: Record<string, any>
}

export type SystemSettings = {
  id?: string
  schoolYear: string
  semester: string
  passingGrade: number
  prelimWeight: number
  midtermWeight: number
  prefinalWeight?: number
  finalWeight: number
  quizWeight: number
  assignmentWeight: number
  activityWeight: number
  examWeight: number
  attendanceWeight: number
  participationWeight: number
  labExamWeight: number
  withLabQuizWeight: number
  withLabActivityWeight: number
  withLabExamWeight: number
  automatedRiskAlerts: boolean
  systemPreferences: {
    theme: 'dark' | 'light'
    allowExport: boolean
    autoCompute: boolean
  }
}
