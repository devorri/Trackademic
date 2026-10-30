// Zero mock data — all records are loaded directly from Supabase PostgreSQL.
import type {
  User,
  Student,
  Subject,
  Section,
  ClassRecord,
  GradeRow,
  Report,
  NotificationItem,
  ActivityLogItem,
  SystemSettings,
  DetailedGradingSheet,
  StudentAssessmentRow,
} from '../utils/types'

export const initialUsers: User[] = []
export const initialStudents: Student[] = []
export const initialSubjects: Subject[] = []
export const initialSections: Section[] = []
export const initialClasses: ClassRecord[] = []
export const initialGrades: Record<string, GradeRow[]> = {}
export const initialDetailedGradingSheets: Record<string, DetailedGradingSheet[]> = {}
export const initialStudentTemplateRecords: Record<
  string,
  {
    studentName: string
    section: string
    schoolYear: string
    rows: StudentAssessmentRow[]
  }
> = {}
export const initialNotifications: NotificationItem[] = []
export const initialActivityLogs: ActivityLogItem[] = []
export const initialSettings: SystemSettings = {
  schoolYear: '2025-2026',
  semester: '1st Semester',
  passingGrade: 75,
  prelimWeight: 40,
  midtermWeight: 60,
  prefinalWeight: 60,
  finalWeight: 60,
  attendanceWeight: 10,
  quizWeight: 20,
  activityWeight: 20,
  participationWeight: 10,
  examWeight: 40,
  assignmentWeight: 0,
  labExamWeight: 0,
  withLabQuizWeight: 20,
  withLabActivityWeight: 20,
  withLabExamWeight: 40,
  automatedRiskAlerts: true,
  systemPreferences: {
    theme: 'light',
    allowExport: true,
    autoCompute: true,
  },
}
export const initialReports: Report[] = []
