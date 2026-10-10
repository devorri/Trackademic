export type Role = 'administrator' | 'instructor' | 'student'
export type UserStatus = 'active' | 'inactive'
export type PredictionStatus = 'Excellent' | 'Good' | 'Average' | 'At Risk' | 'Bound to Fail' | 'On Track' | 'High'
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

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  password?: string;
};

export type Instructor = {
  id: string;
  profile_id: string;
  employee_no: string;
  department?: string;
  created_at: string;
};

export type Student = {
  id: string;
  profile_id: string;
  student_no: string;
  course?: string;
  year_level?: number;
  section_label?: string;
  created_at: string;
  // UI fields for editing profile within student form
  name?: string;
  studentNo?: string; // Alias for student_no (form compatibility)
  email?: string;
  password?: string;
};

export type Subject = {
  id: string
  code: string
  title: string
  units: number
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
}

export type Prediction = {
  id: string
  class_id: string
  student_id: string
  status: PredictionStatus
  confidence: number
  basis: Record<string, any>
  generated_at: string
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
  id: string
  class_id?: string
  student_id?: string
  type: ReportType
  title: string
  generated_by?: string
  export_format?: 'view' | 'print' | 'pdf' | 'excel'
  file_url?: string
  created_at: string
}

export type DetailedTermScores = {
  exam: number
  quiz: number
  activities: number
  computedTermGrade: number
}

export type DetailedGradingSheet = {
  studentId: string
  studentName?: string
  studentNo?: string
  prelim: DetailedTermScores
  midterm: DetailedTermScores
  final: DetailedTermScores
  average: number
  status: PredictionStatus
}

export type NotificationItem = {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  role: Role | 'all'
  category?: 'system' | 'grades' | 'risk' | 'report' | 'user'
}

export type ActivityLogItem = {
  id: string
  actor: string
  action: string
  timestamp: string
  timeFormatted: string
  target?: string
}

export type SystemSettings = {
  schoolYear: string
  semester: string
  passingGrade: number
  prelimWeight: number
  midtermWeight: number
  finalWeight: number
  quizWeight: number
  assignmentWeight: number
  activityWeight: number
  examWeight: number
  automatedRiskAlerts: boolean
  systemPreferences: {
    theme: 'dark' | 'light'
    allowExport: boolean
    autoCompute: boolean
  }
}
