import React, { createContext, useState, useMemo, useContext, useEffect, useRef } from 'react'
import type {
  User,
  Student,
  Subject,
  Section,
  ClassRecord,
  GradeRow,
  Report,
  DashboardSection,
  ClassAverages,
  NotificationItem,
  ActivityLogItem,
  SystemSettings,
  DetailedGradingSheet,
  DetailedTermScores,
  GradingPeriodKey,
  TermComponentField,
  TermComponentMaxItems,
  Role,
  UserStatus,
  StudentAssessmentRow,
} from '../utils/types'
import {
  computeGrade,
  computeClassAverages,
  getSubjectTitle,
  computeItemsAverage,
  computeCategoryTotalAndAvg,
  getDefaultTermMaxItems,
  createEmptyTermScores,
  ensureTermScores,
  recalculateSheetGrades,
  normalizeCourseSection,
  formatCourseSection,
  formatYearLevel,
  mapYearLevelToInt,
  isTermEncoded,
} from '../utils/helpers'
import {
  printStudentGradingBookReport,
  printClassGradeReport,
  type PrintClassStudentRow,
} from '../utils/printReport'
import {
  dbProfiles,
  dbStudents,
  dbSubjects,
  dbSections,
  dbClasses,
  dbInstructors,
  dbGradeComponents,
  dbGrades,
  dbGradeSummaries,
  dbPredictions,
  dbNotifications,
  dbActivityLogs,
  dbSystemSettings,
  dbReports,
} from '../utils/db'

const isUuid = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val))

export const blankUser: Omit<User, 'id'> = {
  name: '',
  email: '',
  role: 'instructor',
  status: 'active',
  password: '',
}

export const blankStudent = {
  profile_id: '',
  student_no: '',
  studentNo: '',
  course: 'BSIT 1A',
  section_label: '1A',
  status: 'active' as UserStatus,
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  year_level: 1,
  year: '1st Year',
  created_at: new Date().toISOString(),
} as Omit<Student, 'id'>

export const blankSubject = {
  code: '',
  title: '',
  units: 3,
  has_laboratory: false,
  hasLab: false,
  created_at: new Date().toISOString(),
} as Omit<Subject, 'id'>

export const defaultSystemSettings: SystemSettings = {
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

/**
 * Creates a clean, unencoded grading sheet for a student (NO auto-filled scores).
 */
export function createEmptyStudentSheet(
  studentId: string,
  studentName: string,
  studentNo: string,
  hasLab: boolean,
): DetailedGradingSheet {
  const prelim = createEmptyTermScores(hasLab)
  const midterm = createEmptyTermScores(hasLab)
  const prefinal = createEmptyTermScores(hasLab)
  const final = createEmptyTermScores(hasLab)

  return {
    studentId,
    studentName,
    studentNo,
    prelim,
    midterm,
    prefinal,
    final,
    prelimExam: 0,
    quiz: 0,
    activity: 0,
    attendance: 0,
    participation: 0,
    labExam: hasLab ? 0 : null,
    midtermScore: 0,
    finalScore: 0,
    average: 0,
    overallGrade: 0,
    predictedFinal: 0,
    status: 'Pending',
  }
}

function formatRelativeOrTime(isoString?: string): string {
  if (!isoString) return 'Just now'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface DataContextType {
  // Data
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  instructors: (User & { profile_id?: string; employee_no?: string })[]
  students: Student[]
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>
  subjects: Subject[]
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>
  sections: Section[]
  setSections: React.Dispatch<React.SetStateAction<Section[]>>
  classes: ClassRecord[]
  setClasses: React.Dispatch<React.SetStateAction<ClassRecord[]>>
  grades: Record<string, GradeRow[]>
  setGrades: React.Dispatch<React.SetStateAction<Record<string, GradeRow[]>>>
  detailedGradingSheets: Record<string, DetailedGradingSheet[]>
  detailedGrades: Record<string, DetailedGradingSheet[]>
  setDetailedGradingSheets: React.Dispatch<React.SetStateAction<Record<string, DetailedGradingSheet[]>>>
  notifications: NotificationItem[]
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>
  activityLogs: ActivityLogItem[]
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLogItem[]>>
  settings: SystemSettings
  setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>
  reports: Report[]
  setReports: React.Dispatch<React.SetStateAction<Report[]>>
  studentRecordsModalId: string | null
  setStudentRecordsModalId: (id: string | null) => void

  // State
  searchTerm: string
  setSearchTerm: (term: string) => void
  studentQuery: string
  setStudentQuery: (term: string) => void
  subjectQuery: string
  setSubjectQuery: (term: string) => void
  filteredSubjects: Subject[]
  userForm: Omit<User, 'id'>
  setUserForm: React.Dispatch<React.SetStateAction<Omit<User, 'id'>>>
  editingUserId: string | null
  setEditingUserId: (id: string | null) => void
  studentForm: Omit<Student, 'id'>
  setStudentForm: React.Dispatch<React.SetStateAction<Omit<Student, 'id'>>>
  editingStudentId: string | null
  setEditingStudentId: (id: string | null) => void
  handleEditStudent: (student: Student) => void
  handleDeleteStudent: (studentId: string) => Promise<void>
  resetStudentForm: () => void
  subjectForm: Omit<Subject, 'id'>
  setSubjectForm: React.Dispatch<React.SetStateAction<Omit<Subject, 'id'>>>
  editingSubjectId: string | null
  setEditingSubjectId: (id: string | null) => void
  handleEditSubject: (subject: Subject) => void
  resetSubjectForm: () => void
  selectedClassId: string | null
  setSelectedClassId: (id: string | null) => void
  activeSection: DashboardSection
  setActiveSection: (section: DashboardSection) => void
  loading: boolean

  // Computed
  selectedClass: ClassRecord | undefined
  selectedGrades: GradeRow[]
  gradebook: any[]
  selectedClassAverages: ClassAverages
  allComputedRows: any[]
  atRiskRows: any[]
  boundToFailRows: any[]
  averagePerformance: number
  filteredStudents: Student[]

  // Methods
  refreshData: () => Promise<void>
  handleSaveUser: (event: React.FormEvent) => Promise<void>
  handleSaveStudent: (event: React.FormEvent) => Promise<void>
  deleteStudent: (studentId: string) => Promise<void>
  toggleStudentDropOut: (studentId: string) => Promise<void>
  handleSaveSubject: (event: React.FormEvent) => Promise<void>
  deleteSubject: (subjectId: string) => Promise<void>
  createClass: (classData: Omit<ClassRecord, 'id' | 'created_at'>) => Promise<ClassRecord>
  updateClass: (classId: string, classData: Partial<ClassRecord>) => Promise<void>
  deleteClass: (classId: string) => Promise<void>
  enrollStudentInClasses: (studentId: string, classIds: string[]) => Promise<void>
  createClassFromSubject: (subject: Subject) => Promise<void>
  updateGrade: (classId: string, studentId: string, field: keyof GradeRow, value: number) => void
  updateDetailedGrade: (
    classId: string,
    studentId: string,
    periodOrField: GradingPeriodKey | string,
    fieldOrValue: TermComponentField | string | number,
    value?: number,
  ) => void
  updateComponentItemScore: (
    classId: string,
    studentId: string,
    period: GradingPeriodKey,
    field: TermComponentField,
    itemIndex: number,
    value: number,
  ) => void
  classMaxScores: Record<string, Record<GradingPeriodKey, TermComponentMaxItems>>
  updateComponentMaxScore: (
    classId: string,
    period: GradingPeriodKey,
    field: TermComponentField,
    itemIndex: number,
    maxScore: number,
  ) => void
  updateComponentTotalItems: (
    classId: string,
    period: GradingPeriodKey,
    field: TermComponentField,
    totalItems: number,
  ) => void
  getClassPeriodMaxItems: (
    classId: string,
    period: GradingPeriodKey,
    counts?: {
      attendance?: number
      quiz?: number
      activity?: number
      participation?: number
      exam?: number
      labActivity?: number
    },
  ) => TermComponentMaxItems
  addComponentColumn: (
    classId: string,
    period: GradingPeriodKey,
    field: TermComponentField,
  ) => void
  removeComponentColumn: (
    classId: string,
    period: GradingPeriodKey,
    field: TermComponentField,
  ) => void
  updateAssessmentGrade: (classId: string, studentId: string, field: string, value: number) => void
  submitClassGradesToAdmin: (classId: string, instructorName?: string) => Promise<void>
  saveClassGradeDraft: (classId: string, instructorName?: string) => Promise<void>
  generateReport: (type: string, activeUserName: string) => void
  reportText: () => string
  printReport: () => void
  printStudentGradingBookReport: (studentId?: string, gradesOnly?: boolean) => void
  printClassGradeReport: (classId?: string) => void
  studentTemplateRecords: Record<string, any>
  markNotificationRead: (id: string) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  deleteNotification: (id: string) => void
  clearAllNotifications: () => void
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void
  addActivityLog: (actor: string, action: string, target?: string) => void
  updateSettings: (newSettings: Partial<SystemSettings>) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function useData(): DataContextType {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pure database-driven state — NO mock/fake initial data
  const [users, setUsers] = useState<User[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [classes, setClasses] = useState<ClassRecord[]>([])
  const [grades, setGrades] = useState<Record<string, GradeRow[]>>({})
  const [detailedGradingSheets, setDetailedGradingSheets] = useState<
    Record<string, DetailedGradingSheet[]>
  >({})
  const [classMaxScores, setClassMaxScores] = useState<
    Record<string, Record<GradingPeriodKey, TermComponentMaxItems>>
  >(() => {
    try {
      const stored = localStorage.getItem('trackademic_class_max_items')
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to parse trackademic_class_max_items from localStorage:', e)
    }
    return {}
  })

  useEffect(() => {
    try {
      localStorage.setItem('trackademic_class_max_items', JSON.stringify(classMaxScores))
    } catch (e) {
      console.warn('Failed to save trackademic_class_max_items to localStorage:', e)
    }
  }, [classMaxScores])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([])
  const [settings, setSettings] = useState<SystemSettings>(defaultSystemSettings)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [studentRecordsModalId, setStudentRecordsModalId] = useState<string | null>(null)

  // Form state
  const [searchTerm, setSearchTerm] = useState('')
  const [studentQuery, setStudentQuery] = useState('')
  const [subjectQuery, setSubjectQuery] = useState('')
  const [userForm, setUserForm] = useState<Omit<User, 'id'>>(blankUser)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [studentForm, setStudentForm] = useState<Omit<Student, 'id'>>(blankStudent)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [subjectForm, setSubjectForm] = useState<Omit<Subject, 'id'>>(blankSubject)
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')

  const [dbInstructorsList, setDbInstructorsList] = useState<any[]>([])

  const weightsConfig = useMemo(
    () => ({
      attendance: settings.attendanceWeight || 10,
      quiz: settings.quizWeight || 20,
      activity: settings.activityWeight || 20,
      participation: settings.participationWeight || 10,
      exam: settings.examWeight || 40,
    }),
    [
      settings.attendanceWeight,
      settings.quizWeight,
      settings.activityWeight,
      settings.participationWeight,
      settings.examWeight,
    ],
  )

  const refreshData = async () => {
    setLoading(true)
    try {
      const [
        profilesData,
        studentsData,
        instructorsData,
        subjectsData,
        sectionsData,
        classesData,
        componentsData,
        rawGradesData,
        summariesData,
        predictionsData,
        notificationsData,
        activityLogsData,
        settingsData,
        reportsData,
      ] = await Promise.all([
        dbProfiles.getAll().catch(() => []),
        dbStudents.getAll().catch(() => []),
        dbInstructors.getAll().catch(() => []),
        dbSubjects.getAll().catch(() => []),
        dbSections.getAll().catch(() => []),
        dbClasses.getAll().catch(() => []),
        dbGradeComponents.getAll().catch(() => []),
        dbGrades.getAll().catch(() => []),
        dbGradeSummaries.getAll().catch(() => []),
        dbPredictions.getAll().catch(() => []),
        dbNotifications.getAll().catch(() => []),
        dbActivityLogs.getAll().catch(() => []),
        dbSystemSettings.get().catch(() => null),
        dbReports.getAll().catch(() => []),
      ])

      setDbInstructorsList(instructorsData || [])
      setSections(sectionsData || [])

      const profileMap = new Map<string, any>()
      const loadedUsers: User[] = (profilesData || []).map((profile) => {
        profileMap.set(profile.id, profile)
        const rawName =
          `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
          profile.name ||
          profile.email?.split('@')[0] ||
          'User'
        const role = (
          profile.role === 'faculty' || profile.role === 'instructor'
            ? 'instructor'
            : profile.role === 'admin' || profile.role === 'administrator'
            ? 'administrator'
            : 'student'
        ) as Role
        const email = profile.email || ''
        const status: UserStatus =
          profile.avatar_url === 'DROPPED' || profile.status === 'dropped'
            ? 'dropped'
            : (profile.status as UserStatus) || 'active'
        return {
          id: profile.id,
          profile_id: profile.id,
          name: rawName,
          email,
          role,
          status,
          password: profile.password_plain || 'password123',
        }
      })
      setUsers(loadedUsers)

      const savedStudentYears: Record<string, string> = (() => {
        try {
          return JSON.parse(localStorage.getItem('trackademic_student_years') || '{}')
        } catch {
          return {}
        }
      })()

      const loadedStudents: Student[] = (studentsData || []).map((s: any) => {
        const prof = s.profiles || profileMap.get(s.profile_id)
        const isDropped =
          prof?.avatar_url === 'DROPPED' ||
          prof?.status === 'dropped' ||
          prof?.status === 'inactive'
        const norm = normalizeCourseSection(s.course, s.section_label)
        const yl = Number(s.year_level) || 1
        const savedYear = savedStudentYears[s.id]
        const yearStr = savedYear || formatYearLevel(yl, s.course)
        return {
          id: s.id,
          profile_id: s.profile_id,
          student_no: s.student_no,
          studentNo: s.student_no,
          name:
            `${prof?.first_name || ''} ${prof?.last_name || ''}`.trim() ||
            prof?.email?.split('@')[0] ||
            'Student',
          email: prof?.email || '',
          course: norm.display,
          section_label: norm.section_label,
          status: isDropped ? 'dropped' : 'active',
          year_level: yl,
          year: yearStr,
          created_at: s.created_at,
          password: prof?.password_plain || 'password123',
        }
      })
      setStudents(loadedStudents)

      const loadedSubjects: Subject[] = (subjectsData || []).map((s: any) => ({
        ...s,
        units: Number(s.units) || 3,
        has_laboratory: Boolean(s.has_laboratory),
        hasLab: Boolean(s.has_laboratory),
      }))
      setSubjects(loadedSubjects)

      if (settingsData) {
        setSettings((prev) => ({
          ...prev,
          id: settingsData.id,
          schoolYear: settingsData.school_year || prev.schoolYear,
          semester: settingsData.semester || prev.semester,
          passingGrade: Number(settingsData.passing_grade) || 75,
          prelimWeight: Number(settingsData.prelim_weight) || 40,
          midtermWeight: Number(settingsData.midterm_weight) || 60,
          finalWeight: Number(settingsData.final_weight) || 60,
          quizWeight: Number(settingsData.quiz_weight) || 20,
          activityWeight: Number(settingsData.activity_weight) || 20,
          examWeight: Number(settingsData.exam_weight) || 40,
          automatedRiskAlerts: Boolean(settingsData.email_alerts),
        }))
      }

      const loadedClasses: ClassRecord[] = (classesData || []).map((c: any) => {
        const rawSecName = c.section?.name || 'BSIT 1A'
        const rawSecCourse = c.section?.course || rawSecName.split(/[\s-]+/)[0] || 'BSIT'
        return {
          ...c,
          section: c.section
            ? {
                ...c.section,
                name: rawSecName,
                course: rawSecCourse,
              }
            : {
                id: c.section_id || '',
                name: rawSecName,
                course: rawSecCourse,
                year_level: 1,
                school_year: '2025-2026',
                semester: '1st Semester',
                created_at: c.created_at,
              },
        }
      })
      setClasses(loadedClasses)

      if (loadedClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(loadedClasses[0].id)
      }

      // Reconstruct grading sheets strictly from real DB records (zero fake scores)
      const nextSheets: Record<string, DetailedGradingSheet[]> = {}
      const nextGrades: Record<string, GradeRow[]> = {}

      for (const cls of loadedClasses) {
        const enrolledIds = cls.studentIds || []
        const hasLab = Boolean(cls.subject?.has_laboratory)
        const classComponents = (componentsData || []).filter((comp) => comp.class_id === cls.id)
        const classSummaries = (summariesData || []).filter((sum) => sum.class_id === cls.id)
        const classPredictions = (predictionsData || []).filter((pred) => pred.class_id === cls.id)

        // Include any students who have grades/summaries in this class as well as enrolledIds
        const studentIdSet = new Set<string>([
          ...enrolledIds,
          ...classSummaries.map((s) => s.student_id),
          ...classPredictions.map((p) => p.student_id),
        ])

        const sheetRows: DetailedGradingSheet[] = []

        for (const sid of studentIdSet) {
          const st = loadedStudents.find((s) => s.id === sid)
          let sheetRow = createEmptyStudentSheet(
            sid,
            st?.name || 'Student',
            st?.student_no || st?.studentNo || 'N/A',
            hasLab,
          )

          // 1. Check predictions.basis JSONB for full itemized term data
          const predRecord = classPredictions.find((p) => p.student_id === sid)
          if (predRecord?.basis && typeof predRecord.basis === 'object') {
            const basis = predRecord.basis as any
            if (basis.prelim) sheetRow.prelim = ensureTermScores(basis.prelim, 0, hasLab)
            if (basis.midterm) sheetRow.midterm = ensureTermScores(basis.midterm, 0, hasLab)
            if (basis.prefinal) sheetRow.prefinal = ensureTermScores(basis.prefinal, 0, hasLab)
            if (basis.final) sheetRow.final = ensureTermScores(basis.final, 0, hasLab)
            if (basis.submittedToAdmin) sheetRow.submittedToAdmin = Boolean(basis.submittedToAdmin)
            if (basis.submittedAt) sheetRow.submittedAt = String(basis.submittedAt)
          }

          // 2. Overlay relational component grades from grade_components + grades
          if (classComponents.length > 0 && rawGradesData && rawGradesData.length > 0) {
            for (const comp of classComponents) {
              const gradeRec = rawGradesData.find(
                (g) => g.component_id === comp.id && g.student_id === sid,
              )
              if (!gradeRec) continue
              const scoreVal = Number(gradeRec.score)
              const compNameLower = comp.name.toLowerCase()

              let periodKey: GradingPeriodKey = 'prelim'
              if (comp.grading_period === 'Midterm') {
                periodKey = 'midterm'
              } else if (comp.grading_period === 'Final') {
                periodKey = compNameLower.startsWith('prefinal:') ? 'prefinal' : 'final'
              } else {
                periodKey = 'prelim'
              }

              const cleanName = compNameLower.replace(/^prefinal:/, '').trim()
              const fieldKey: TermComponentField = cleanName.includes('attend')
                ? 'attendance'
                : cleanName.includes('quiz')
                ? 'quiz'
                : cleanName.includes('partic')
                ? 'participation'
                : cleanName.includes('lab')
                ? 'labActivity'
                : cleanName.includes('exam')
                ? 'exam'
                : 'activity'

              const targetTerm = ensureTermScores(sheetRow[periodKey], 0, hasLab)
              const existingItems = targetTerm.items || {
                attendance: [0],
                quiz: [0],
                activity: [0],
                participation: [0],
                exam: [0],
                labActivity: hasLab ? [0] : [],
              }

              // If basis didn't already populate multiple items for this field, set it from component score
              const currentArr = existingItems[fieldKey] || [0]
              const updatedArr =
                currentArr.length <= 1 ? [scoreVal] : currentArr

              const updatedTerm: DetailedTermScores = {
                ...targetTerm,
                [fieldKey]: scoreVal,
                hasData: scoreVal > 0 || targetTerm.hasData,
                items: {
                  ...existingItems,
                  [fieldKey]: updatedArr,
                },
              }
              sheetRow[periodKey] = updatedTerm
            }
          }

          // 3. Check grade_summaries fallback if summary exists without component scores
          const summaryRec = classSummaries.find((s) => s.student_id === sid)
          if (summaryRec) {
            if (
              !isTermEncoded(sheetRow.prelim) &&
              typeof summaryRec.preliminary_grade === 'number' &&
              summaryRec.preliminary_grade > 0
            ) {
              sheetRow.prelim = ensureTermScores(Number(summaryRec.preliminary_grade), 0, hasLab)
            }
            if (
              !isTermEncoded(sheetRow.midterm) &&
              typeof summaryRec.midterm_grade === 'number' &&
              summaryRec.midterm_grade > 0
            ) {
              sheetRow.midterm = ensureTermScores(Number(summaryRec.midterm_grade), 0, hasLab)
            }
            if (
              !isTermEncoded(sheetRow.final) &&
              typeof summaryRec.final_grade === 'number' &&
              summaryRec.final_grade > 0
            ) {
              sheetRow.final = ensureTermScores(Number(summaryRec.final_grade), 0, hasLab)
            }
          }

          sheetRow = recalculateSheetGrades(sheetRow, hasLab)
          if (st?.status === 'dropped') {
            sheetRow.status = 'Dropped'
          }
          sheetRows.push(sheetRow)
        }

        nextSheets[cls.id] = sheetRows
        nextGrades[cls.id] = sheetRows.map((sr) => ({
          studentId: sr.studentId,
          student_name: sr.studentName,
          quizzes: sr.prelim.quiz,
          assignments: sr.prelim.activity,
          activities: sr.prelim.activity,
          participation: sr.prelim.participation,
          midtermExam: sr.midterm.exam,
          finalExam: sr.final.exam,
          historical: Math.round(sr.prelim.computedTermGrade || 0),
          attendance: sr.prelim.attendance,
          labExam: sr.prelim.labActivity ?? undefined,
          prelim: sr.prelim,
          midterm: sr.midterm,
          prefinal: sr.prefinal,
          final: sr.final,
        }))
      }

      setDetailedGradingSheets(nextSheets)
      setGrades(nextGrades)

      // Map notifications from DB
      const loadedNotifications: NotificationItem[] = (notificationsData || []).map((n: any) => ({
        id: n.id,
        user_id: n.user_id,
        title: n.title,
        message: n.message,
        timestamp: formatRelativeOrTime(n.created_at),
        created_at: n.created_at,
        read: Boolean(n.is_read),
        is_read: Boolean(n.is_read),
        role: (n.role as Role | 'all') || 'all',
        category: (n.category as any) || 'system',
      }))

      // Auto-ensure students with encoded grades have initial grade update notifications
      for (const clsId of Object.keys(nextSheets)) {
        const cls = loadedClasses.find((c) => c.id === clsId)
        const subj = loadedSubjects.find((s) => s.id === cls?.subject_id) || cls?.subject
        const rows = nextSheets[clsId] || []
        for (const row of rows) {
          const st = loadedStudents.find((s) => s.id === row.studentId)
          if (!st) continue
          const hasPrelim = isTermEncoded(row.prelim)
          const hasMidterm = isTermEncoded(row.midterm)
          const hasPrefinal = isTermEncoded(row.prefinal)
          const hasFinal = isTermEncoded(row.final)
          if (!hasPrelim && !hasMidterm && !hasPrefinal && !hasFinal) continue

          const profId = st.profile_id || st.id
          const alreadyNotified = loadedNotifications.some(
            (n) =>
              (n.user_id === profId || n.user_id === st.id) &&
              n.category === 'grades' &&
              n.title.toLowerCase().includes(subj?.code?.toLowerCase() || 'grade'),
          )
          if (!alreadyNotified) {
            const pGrade = hasPrelim ? Math.round(row.prelim.computedTermGrade) : null
            const mGrade = hasMidterm ? Math.round(row.midterm.computedTermGrade) : null
            const gradeText = [
              pGrade !== null ? `Prelim: ${pGrade}%` : '',
              mGrade !== null ? `Midterm: ${mGrade}%` : '',
            ]
              .filter(Boolean)
              .join(' | ')

            const initNotif: NotificationItem = {
              id: crypto.randomUUID(),
              user_id: profId,
              role: 'student',
              category: 'grades',
              title: `Grade Update: ${subj?.code || 'Subject'} (${gradeText || 'Active'})`,
              message: `Your grade record has been updated in ${subj?.code || ''} - ${subj?.title || 'Subject'} (${cls?.section?.name || 'Section'}). Status: ${row.status || 'Passing'}.`,
              timestamp: 'Just now',
              created_at: new Date().toISOString(),
              read: false,
              is_read: false,
            }
            loadedNotifications.unshift(initNotif)
            dbNotifications
              .create({
                user_id: profId,
                role: 'student',
                category: 'grades',
                title: initNotif.title,
                message: initNotif.message,
              })
              .catch(() => {})
          }
        }
      }
      setNotifications(loadedNotifications)

      // Map activity logs from DB
      const loadedLogs: ActivityLogItem[] = (activityLogsData || []).map((log: any) => {
        const actorProfile = log.actor_id ? profileMap.get(log.actor_id) : null
        const actorName =
          log.metadata?.actor_name ||
          (actorProfile
            ? `${actorProfile.first_name || ''} ${actorProfile.last_name || ''}`.trim()
            : 'System')
        return {
          id: String(log.id),
          actor: actorName || 'System',
          actor_id: log.actor_id,
          action: log.action,
          timestamp: log.created_at,
          timeFormatted: formatRelativeOrTime(log.created_at),
          target: log.metadata?.target || log.table_name || 'System',
          metadata: log.metadata,
        }
      })
      setActivityLogs(loadedLogs)

      setReports(reportsData || [])
    } catch (error) {
      console.error('Error loading data from Supabase:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  // Helper to resolve an instructor's profile_id from instructor_id or profile_id
  function resolveInstructorProfileId(instructorId?: string): string | null {
    if (!instructorId) return null
    const dbInst = dbInstructorsList.find(
      (i: any) => i.id === instructorId || i.profile_id === instructorId,
    )
    if (dbInst?.profile_id) return dbInst.profile_id
    const userMatch = users.find((u) => u.id === instructorId || u.profile_id === instructorId)
    return userMatch?.id || null
  }

  // Activity log helper (persists to Supabase activity_logs)
  function addActivityLog(actor: string, action: string, target?: string) {
    const now = new Date()
    const timeFormatted = formatRelativeOrTime(now.toISOString())

    const newLog: ActivityLogItem = {
      id: crypto.randomUUID(),
      actor,
      action,
      timestamp: now.toISOString(),
      timeFormatted,
      target,
    }
    setActivityLogs((prev) => [newLog, ...prev])

    const actorUser = users.find(
      (u) => u.name.toLowerCase() === actor.toLowerCase() || u.role === 'administrator',
    )
    dbActivityLogs
      .create({
        actor_id: isUuid(actorUser?.id) ? actorUser!.id : null,
        action,
        table_name: target || 'system',
        metadata: { actor_name: actor, target: target || 'System' },
      })
      .catch((err) => console.warn('Activity log DB save notice:', err))
  }

  // Notification helper (persists to Supabase notifications)
  function addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    const tempId = crypto.randomUUID()
    const newNotif: NotificationItem = {
      id: tempId,
      ...notif,
      timestamp: 'Just now',
      created_at: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [newNotif, ...prev])

    dbNotifications
      .create({
        user_id: notif.user_id || null,
        role: notif.role,
        title: notif.title,
        message: notif.message,
        category: notif.category || 'system',
      })
      .then((created) => {
        if (created?.id) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === tempId ? { ...n, id: created.id } : n)),
          )
        }
      })
      .catch((err) => console.warn('Notification DB save notice:', err))
  }

  function markNotificationRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, is_read: true } : n)),
    )
    dbNotifications.markRead(id).catch(() => {})
  }

  function markAllNotificationsAsRead() {
    setNotifications((prev) => {
      prev.forEach((n) => {
        if (!n.read) dbNotifications.markRead(n.id).catch(() => {})
      })
      return prev.map((n) => ({ ...n, read: true, is_read: true }))
    })
  }

  function deleteNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    dbNotifications.delete(id).catch(() => {})
  }

  function clearAllNotifications() {
    setNotifications((prev) => {
      prev.forEach((n) => dbNotifications.delete(n.id).catch(() => {}))
      return []
    })
  }

  function updateSettings(newSettings: Partial<SystemSettings>) {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      addActivityLog('Administrator', `Updated system configuration & grading settings`, 'Settings')
      dbSystemSettings
        .upsert({
          school_year: updated.schoolYear,
          semester: updated.semester,
          passing_grade: updated.passingGrade,
          prelim_weight: updated.prelimWeight,
          midterm_weight: updated.midtermWeight,
          final_weight: updated.finalWeight,
          exam_weight: updated.examWeight,
          quiz_weight: updated.quizWeight,
          activity_weight: updated.activityWeight,
          email_alerts: updated.automatedRiskAlerts,
        })
        .catch((err) => console.warn('Settings DB save notice:', err))
      return updated
    })
  }

  // Computed values
  const instructors = useMemo(() => {
    const list: (User & { profile_id?: string; employee_no?: string })[] = []
    const seenProfileIds = new Set<string>()
    const seenInstIds = new Set<string>()

    dbInstructorsList.forEach((inst: any) => {
      const name =
        `${inst.profiles?.first_name || ''} ${inst.profiles?.last_name || ''}`.trim() ||
        inst.profiles?.email?.split('@')[0] ||
        'Instructor'
      const email = inst.profiles?.email || ''
      const status = inst.profiles?.status || 'active'
      list.push({
        id: inst.id,
        profile_id: inst.profile_id,
        employee_no: inst.employee_no,
        name,
        email,
        role: 'instructor',
        status,
        password: inst.profiles?.password_plain || 'password123',
      })
      seenInstIds.add(inst.id)
      if (inst.profile_id) seenProfileIds.add(inst.profile_id)
    })

    users
      .filter((u) => u.role === 'instructor')
      .forEach((u) => {
        if (!seenProfileIds.has(u.id) && !seenInstIds.has(u.id)) {
          list.push({ ...u, profile_id: u.id })
          seenProfileIds.add(u.id)
        }
      })

    return list
  }, [users, dbInstructorsList])

  const selectedClass = useMemo(
    () => classes.find((classItem) => classItem.id === selectedClassId) ?? classes[0],
    [classes, selectedClassId],
  )

  const selectedGrades = useMemo(
    () => (selectedClass?.id ? grades[selectedClass.id] ?? [] : []),
    [grades, selectedClass?.id],
  )

  const gradebook = useMemo(
    () =>
      selectedGrades.map((row) => {
        const sheetRow = (detailedGradingSheets[selectedClass?.id || ''] || []).find(
          (s) => s.studentId === row.studentId,
        )
        const enrichedRow: GradeRow = sheetRow
          ? {
              ...row,
              prelim: sheetRow.prelim,
              midterm: sheetRow.midterm,
              prefinal: sheetRow.prefinal,
              final: sheetRow.final,
            }
          : row
        const student = students.find((s) => s.id === row.studentId)
        const computed = computeGrade(enrichedRow)
        if (student?.status === 'dropped') {
          computed.status = 'Dropped'
        }
        return {
          row: enrichedRow,
          sheetRow,
          student,
          computed,
        }
      }),
    [selectedGrades, students, detailedGradingSheets, selectedClass?.id],
  )

  const selectedClassAverages = useMemo(() => computeClassAverages(gradebook), [gradebook])

  const allComputedRows = useMemo(
    () =>
      classes.flatMap((classItem) => {
        const classGrades = grades[classItem.id] ?? []
        const classSheets = detailedGradingSheets[classItem.id] ?? []
        const studentIds = classItem.studentIds || []
        const allStudentIds = Array.from(
          new Set([
            ...classGrades.map((g) => g.studentId),
            ...classSheets.map((s) => s.studentId),
            ...studentIds,
          ]),
        )

        return allStudentIds.map((studentId) => {
          const sheetRow = classSheets.find((s) => s.studentId === studentId)
          const baseRow = classGrades.find((g) => g.studentId === studentId) ?? {
            studentId,
            quizzes: 0,
            assignments: 0,
            activities: 0,
            midtermExam: 0,
            finalExam: 0,
            historical: 0,
          }
          const row: GradeRow = sheetRow
            ? {
                ...baseRow,
                prelim: sheetRow.prelim,
                midterm: sheetRow.midterm,
                prefinal: sheetRow.prefinal,
                final: sheetRow.final,
              }
            : baseRow
          const student = students.find((s) => s.id === studentId)
          const computed = computeGrade(row)
          if (student?.status === 'dropped') {
            computed.status = 'Dropped'
          }
          return {
            classItem,
            row,
            sheetRow,
            student,
            computed,
          }
        })
      }),
    [classes, grades, detailedGradingSheets, students],
  )

  const atRiskRows = useMemo(
    () => allComputedRows.filter((item) => item.computed.status === 'At Risk'),
    [allComputedRows],
  )

  const boundToFailRows = useMemo(
    () => allComputedRows.filter((item) => item.computed.status === 'Bound to Fail'),
    [allComputedRows],
  )

  const averagePerformance = useMemo(() => {
    const encodedRows = allComputedRows.filter((item) => item.computed.overall > 0)
    return encodedRows.length > 0
      ? Math.round(
          encodedRows.reduce((sum, item) => sum + item.computed.overall, 0) / encodedRows.length,
        )
      : 0
  }, [allComputedRows])

  const filteredStudents = useMemo(
    () => {
      const q = (studentQuery || searchTerm || '').toLowerCase()
      if (!q) return students
      return students.filter((student) =>
        [
          student.name,
          student.student_no,
          student.studentNo,
          student.course,
          student.section_label,
          formatCourseSection(student.course, student.section_label),
          student.email,
          student.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    },
    [students, searchTerm, studentQuery],
  )

  const filteredSubjects = useMemo(
    () => {
      const q = (subjectQuery || '').toLowerCase()
      if (!q) return subjects
      return subjects.filter((s) =>
        [s.code, s.title, s.units]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    },
    [subjects, subjectQuery],
  )

  // Helper to persist a student's grading sheet + summary + prediction basis to Supabase
  function syncStudentSheetToSupabase(
    classId: string,
    studentId: string,
    sheetRow: DetailedGradingSheet,
    changedPeriod?: GradingPeriodKey,
    changedField?: TermComponentField,
    changedScore?: number,
  ) {
    if (!isUuid(classId) || !isUuid(studentId)) return

    if (changedPeriod && changedField && typeof changedScore === 'number') {
      const dbPeriod: 'Preliminary' | 'Midterm' | 'Final' =
        changedPeriod === 'midterm'
          ? 'Midterm'
          : changedPeriod === 'final' || changedPeriod === 'prefinal'
          ? 'Final'
          : 'Preliminary'

      const compMeta: Record<TermComponentField, { name: string; weight: number }> = {
        attendance: { name: 'Attendance', weight: weightsConfig.attendance },
        quiz: { name: 'Quiz', weight: weightsConfig.quiz },
        activity: { name: 'Activity', weight: weightsConfig.activity },
        participation: { name: 'Participation', weight: weightsConfig.participation },
        exam: { name: 'Exam', weight: weightsConfig.exam },
        labActivity: { name: 'Lab Activity', weight: 20 },
      }
      const baseMeta = compMeta[changedField] || { name: 'Activity', weight: 20 }
      const componentName =
        changedPeriod === 'prefinal' ? `PreFinal:${baseMeta.name}` : baseMeta.name

      dbGrades
        .upsertComponentScore({
          classId,
          studentId,
          gradingPeriod: dbPeriod,
          componentName,
          weight: baseMeta.weight,
          score: changedScore,
        })
        .catch((err) => console.warn('Supabase component score sync notice:', err))
    }

    dbGradeSummaries
      .upsert({
        class_id: classId,
        student_id: studentId,
        preliminary_grade: isTermEncoded(sheetRow.prelim) ? sheetRow.prelim.computedTermGrade : undefined,
        midterm_grade: isTermEncoded(sheetRow.midterm) ? sheetRow.midterm.computedTermGrade : undefined,
        final_grade: isTermEncoded(sheetRow.final)
          ? sheetRow.final.computedTermGrade
          : isTermEncoded(sheetRow.prefinal)
          ? sheetRow.prefinal?.computedTermGrade
          : undefined,
        overall_grade: sheetRow.average > 0 ? sheetRow.average : undefined,
        remarks: sheetRow.status,
        computed_at: new Date().toISOString(),
      })
      .catch((err) => console.warn('Supabase grade summary sync notice:', err))

    dbPredictions
      .upsert({
        class_id: classId,
        student_id: studentId,
        status: sheetRow.status,
        confidence: sheetRow.average > 0 ? 90 : 0,
        current_grade: sheetRow.average > 0 ? sheetRow.average : undefined,
        predicted_grade: sheetRow.average > 0 ? sheetRow.average : undefined,
        basis: {
          prelim: sheetRow.prelim,
          midterm: sheetRow.midterm,
          prefinal: sheetRow.prefinal,
          final: sheetRow.final,
          submittedToAdmin: sheetRow.submittedToAdmin || false,
          submittedAt: sheetRow.submittedAt || null,
        },
      })
      .catch((err) => console.warn('Supabase prediction basis sync notice:', err))
  }

  // Database operations
  async function handleSaveUser(event: React.FormEvent) {
    event.preventDefault()
    if (!userForm.name || !userForm.email) return

    try {
      const formattedUser = {
        ...userForm,
        name: userForm.name.trim(),
        email: userForm.email.trim().toLowerCase(),
      }
      const nameParts = formattedUser.name.split(' ')
      const firstName = nameParts[0] || 'Instructor'
      const lastName = nameParts.slice(1).join(' ') || ''

      if (editingUserId) {
        const instMatch = dbInstructorsList.find(
          (i: any) => i.id === editingUserId || i.profile_id === editingUserId,
        )
        const profileIdToUpdate = instMatch?.profile_id || editingUserId

        if (isUuid(profileIdToUpdate)) {
          await dbProfiles.update(profileIdToUpdate, {
            email: formattedUser.email,
            first_name: firstName,
            last_name: lastName,
            role: formattedUser.role,
            status: formattedUser.status,
            ...(formattedUser.password ? { password_plain: formattedUser.password } : {}),
          })
        }

        setUsers((current) =>
          current.map((user) =>
            user.id === editingUserId || user.id === profileIdToUpdate
              ? { ...user, ...formattedUser }
              : user,
          ),
        )
        setDbInstructorsList((current) =>
          current.map((inst: any) =>
            inst.id === editingUserId || inst.profile_id === profileIdToUpdate
              ? {
                  ...inst,
                  profiles: {
                    ...inst.profiles,
                    first_name: firstName,
                    last_name: lastName,
                    email: formattedUser.email,
                    status: formattedUser.status,
                    password_plain: formattedUser.password || inst.profiles?.password_plain,
                  },
                }
              : inst,
          ),
        )
        addActivityLog(
          'Administrator',
          `Updated instructor account: ${formattedUser.name}`,
          'Instructor Management',
        )
      } else {
        const newProfile = await dbProfiles.create({
          email: formattedUser.email,
          password_plain: formattedUser.password || 'password123',
          first_name: firstName,
          last_name: lastName,
          role: formattedUser.role,
          status: formattedUser.status,
        })

        let createdInst: any = null
        if (formattedUser.role === 'instructor') {
          createdInst = await dbInstructors.create({
            profile_id: newProfile.id,
            employee_no: `EMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
            department: undefined,
          })
          setDbInstructorsList((prev) => [
            { ...createdInst, profiles: newProfile },
            ...prev,
          ])
        }

        const newUser: User = {
          id: newProfile.id,
          profile_id: newProfile.id,
          name: formattedUser.name,
          email: formattedUser.email,
          role: formattedUser.role,
          status: formattedUser.status,
          password: formattedUser.password || 'password123',
        }
        setUsers((current) => [newUser, ...current])
        addActivityLog(
          'Administrator',
          `Added new instructor: ${formattedUser.name}`,
          'Instructor Management',
        )
      }

      setUserForm(blankUser)
      setEditingUserId(null)
    } catch (error) {
      console.error('Failed to save user:', error)
      alert('Failed to save instructor: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  async function handleSaveStudent(event: React.FormEvent) {
    event.preventDefault()
    if (!studentForm.name) return
    const studentNo = (
      studentForm.studentNo ||
      studentForm.student_no ||
      `2026-${String(students.length + 1).padStart(3, '0')}`
    ).trim()

    const norm = normalizeCourseSection(
      studentForm.course,
      studentForm.section_label,
    )
    const desiredStatus: UserStatus = studentForm.status || 'active'
    const yearLabel = (
      typeof studentForm.year === 'string' && studentForm.year
        ? studentForm.year
        : formatYearLevel(studentForm.year_level, norm.display)
    ).trim()
    const parsedYearLevel = mapYearLevelToInt(yearLabel)

    try {
      if (editingStudentId) {
        const existingStudent = students.find((s) => s.id === editingStudentId)
        const wasDropped = existingStudent?.status === 'dropped'
        const isNowDropped = desiredStatus === 'dropped'

        const updateData: Partial<Student> = {
          ...studentForm,
          student_no: studentNo,
          studentNo: studentNo,
          course: norm.course,
          section_label: norm.section_label,
          status: desiredStatus,
          year_level: parsedYearLevel,
          year: yearLabel,
        }

        try {
          const savedStudentYears = JSON.parse(localStorage.getItem('trackademic_student_years') || '{}')
          savedStudentYears[editingStudentId] = yearLabel
          localStorage.setItem('trackademic_student_years', JSON.stringify(savedStudentYears))
        } catch {
          // ignore
        }

        if (isUuid(editingStudentId)) {
          await dbStudents.update(editingStudentId, {
            student_no: studentNo,
            course: norm.course,
            section_label: norm.section_label,
            year_level: parsedYearLevel,
          })
        }

        const profId = existingStudent?.profile_id || studentForm.profile_id
        if (isUuid(profId)) {
          const nameParts = (studentForm.name || '').trim().split(' ')
          await dbProfiles.update(profId!, {
            first_name: nameParts[0] || 'Student',
            last_name: nameParts.slice(1).join(' ') || '',
            status: desiredStatus,
            ...(studentForm.email ? { email: studentForm.email.trim().toLowerCase() } : {}),
            ...(studentForm.password ? { password_plain: studentForm.password } : {}),
          })
        }

        setStudents((current) =>
          current.map((student) =>
            student.id === editingStudentId ? { ...student, ...updateData } : student,
          ),
        )
        setUsers((current) =>
          current.map((u) =>
            u.id === editingStudentId ||
            u.id === existingStudent?.profile_id ||
            u.email === studentForm.email
              ? { ...u, name: studentForm.name!, status: desiredStatus }
              : u,
          ),
        )

        if (!wasDropped && isNowDropped && existingStudent) {
          notifyInstructorsOfStudentDropOut(editingStudentId, studentForm.name, studentNo)
        }

        addActivityLog(
          'Administrator',
          `Updated student profile: ${studentForm.name} (${studentNo}) — ${norm.display} [${desiredStatus.toUpperCase()}]`,
          'Student Management',
        )
      } else {
        const nameParts = (studentForm.name || '').trim().split(' ')
        const firstName = nameParts[0] || 'Student'
        const lastName = nameParts.slice(1).join(' ') || ''
        const generatedEmail =
          (studentForm.email || '').trim().toLowerCase() ||
          `${studentNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@trackademic.edu`
        const passwordPlain = studentForm.password || 'password123'

        const profile = await dbProfiles.create({
          email: generatedEmail,
          password_plain: passwordPlain,
          first_name: firstName,
          last_name: lastName,
          role: 'student',
          status: desiredStatus,
        })

        const dbStud = await dbStudents.create({
          profile_id: profile.id,
          student_no: studentNo,
          course: norm.course,
          section_label: norm.section_label,
          year_level: parsedYearLevel,
        })

        try {
          const savedStudentYears = JSON.parse(localStorage.getItem('trackademic_student_years') || '{}')
          savedStudentYears[dbStud.id] = yearLabel
          localStorage.setItem('trackademic_student_years', JSON.stringify(savedStudentYears))
        } catch {
          // ignore
        }

        const newStudent: Student = {
          id: dbStud.id,
          profile_id: profile.id,
          student_no: studentNo,
          studentNo: studentNo,
          name: studentForm.name.trim(),
          email: generatedEmail,
          course: norm.course,
          section_label: norm.section_label,
          status: desiredStatus,
          year_level: parsedYearLevel,
          year: yearLabel,
          created_at: dbStud.created_at || new Date().toISOString(),
          password: passwordPlain,
        }

        setStudents((current) => [newStudent, ...current])
        setUsers((current) => [
          {
            id: profile.id,
            profile_id: profile.id,
            name: studentForm.name!.trim(),
            email: generatedEmail,
            role: 'student',
            status: desiredStatus,
            password: passwordPlain,
          },
          ...current,
        ])

        addActivityLog(
          'Administrator',
          `Registered new student: ${studentForm.name} (${studentNo}) in ${norm.display}`,
          'Student Management',
        )
      }

      setStudentForm(blankStudent)
      setEditingStudentId(null)
    } catch (error) {
      console.error('Failed to save student:', error)
      alert('Failed to save student: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  function handleEditStudent(student: Student) {
    setEditingStudentId(student.id)
    setStudentForm({
      ...student,
      year: student.year || formatYearLevel(student.year_level, student.course),
      studentNo: student.student_no || student.studentNo || '',
      student_no: student.student_no || student.studentNo || '',
    })
  }

  function resetStudentForm() {
    setStudentForm(blankStudent)
    setEditingStudentId(null)
  }

  function notifyInstructorsOfStudentDropOut(
    studentId: string,
    studentName: string,
    studentNo: string,
  ) {
    const enrolledClasses = classes.filter((c) => (c.studentIds || []).includes(studentId))
    for (const cls of enrolledClasses) {
      const subj = subjects.find((s) => s.id === cls.subject_id) || cls.subject
      const sectionName = cls.section?.name || 'Section'
      const instProfileId = resolveInstructorProfileId(cls.instructor_id)
      addNotification({
        user_id: instProfileId,
        role: 'instructor',
        category: 'risk',
        title: `Student Drop Out: ${studentName}`,
        message: `${studentName} (ID: ${studentNo}) has dropped out from your class ${subj?.code || ''} - ${subj?.title || 'Class'} (${sectionName}).`,
      })
    }
  }

  async function toggleStudentDropOut(studentId: string) {
    const target = students.find((s) => s.id === studentId)
    if (!target) return

    const nextStatus: UserStatus = target.status === 'dropped' ? 'active' : 'dropped'
    try {
      if (isUuid(target.profile_id)) {
        await dbProfiles.update(target.profile_id, { status: nextStatus })
      }
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, status: nextStatus } : s)),
      )
      setUsers((prev) =>
        prev.map((u) =>
          u.id === target.profile_id || u.id === studentId ? { ...u, status: nextStatus } : u,
        ),
      )

      // Update status in grading sheets
      setDetailedGradingSheets((prev) => {
        const next: Record<string, DetailedGradingSheet[]> = {}
        for (const cid of Object.keys(prev)) {
          next[cid] = (prev[cid] || []).map((row) => {
            if (row.studentId !== studentId) return row
            if (nextStatus === 'dropped') return { ...row, status: 'Dropped' }
            const cls = classes.find((c) => c.id === cid)
            return recalculateSheetGrades(row, Boolean(cls?.subject?.has_laboratory), weightsConfig)
          })
        }
        return next
      })

      if (nextStatus === 'dropped') {
        notifyInstructorsOfStudentDropOut(
          studentId,
          target.name || 'Student',
          target.student_no || target.studentNo || 'N/A',
        )
        addActivityLog(
          'Administrator',
          `Marked student as Dropped Out: ${target.name} (${target.student_no})`,
          'Student Management',
        )
      } else {
        const enrolledClasses = classes.filter((c) => (c.studentIds || []).includes(studentId))
        for (const cls of enrolledClasses) {
          const subj = subjects.find((s) => s.id === cls.subject_id) || cls.subject
          const instProfileId = resolveInstructorProfileId(cls.instructor_id)
          addNotification({
            user_id: instProfileId,
            role: 'instructor',
            category: 'user',
            title: `Student Reactivated: ${target.name}`,
            message: `${target.name} (${target.student_no}) has been reactivated in ${subj?.code || ''} - ${subj?.title || 'Class'}.`,
          })
        }
        addActivityLog(
          'Administrator',
          `Reactivated student: ${target.name} (${target.student_no})`,
          'Student Management',
        )
      }
    } catch (error) {
      console.error('Failed to update student drop out status:', error)
    }
  }

  async function deleteStudent(studentId: string) {
    try {
      const studentToDelete = students.find((s) => s.id === studentId)
      if (isUuid(studentId)) {
        await dbStudents.delete(studentId).catch(() => {})
      }
      if (isUuid(studentToDelete?.profile_id)) {
        await dbProfiles.delete(studentToDelete!.profile_id).catch(() => {})
      }

      setStudents((current) => current.filter((s) => s.id !== studentId))
      setClasses((current) =>
        current.map((c) => ({
          ...c,
          studentIds: (c.studentIds || []).filter((id) => id !== studentId),
        })),
      )
      setDetailedGradingSheets((current) => {
        const next: Record<string, DetailedGradingSheet[]> = {}
        for (const classIdStr in current) {
          next[classIdStr] = (current[classIdStr] || []).filter((g) => g.studentId !== studentId)
        }
        return next
      })
      setGrades((current) => {
        const nextGrades: Record<string, GradeRow[]> = {}
        for (const classIdStr in current) {
          nextGrades[classIdStr] = (current[classIdStr] || []).filter(
            (g) => g.studentId !== studentId,
          )
        }
        return nextGrades
      })

      if (studentToDelete) {
        addActivityLog(
          'Administrator',
          `Removed student record: ${studentToDelete.name}`,
          'Student Management',
        )
      }
    } catch (error) {
      console.error('Failed to delete student:', error)
    }
  }

  // Enroll a student into multiple classes (with empty unencoded grades + instructor notifications)
  async function enrollStudentInClasses(studentId: string, classIds: string[]) {
    try {
      const studentObj = students.find((s) => s.id === studentId)
      const studentName = studentObj?.name || 'Student'
      const studentNo = studentObj?.student_no || studentObj?.studentNo || 'N/A'

      await Promise.allSettled(classIds.map((classId) => dbClasses.addStudent(classId, studentId)))

      setClasses((current) =>
        current.map((c) =>
          classIds.includes(c.id)
            ? { ...c, studentIds: Array.from(new Set([...(c.studentIds || []), studentId])) }
            : c,
        ),
      )

      setDetailedGradingSheets((current) => {
        const next = { ...current }
        classIds.forEach((classId) => {
          const cls = classes.find((c) => c.id === classId)
          const hasLab = cls?.subject?.has_laboratory ?? false
          const sheet = next[classId] ?? []
          if (!sheet.some((s) => s.studentId === studentId)) {
            const newEntry = createEmptyStudentSheet(studentId, studentName, studentNo, hasLab)
            next[classId] = [...sheet, newEntry]
          }
        })
        return next
      })

      setGrades((current) => {
        const next = { ...current }
        classIds.forEach((classId) => {
          const cls = classes.find((c) => c.id === classId)
          const hasLab = cls?.subject?.has_laboratory ?? false
          const rows = next[classId] ?? []
          if (!rows.some((r) => r.studentId === studentId)) {
            const emptySheet = createEmptyStudentSheet(studentId, studentName, studentNo, hasLab)
            next[classId] = [
              ...rows,
              {
                studentId,
                student_name: studentName,
                quizzes: 0,
                assignments: 0,
                activities: 0,
                participation: 0,
                midtermExam: 0,
                finalExam: 0,
                historical: 0,
                prelim: emptySheet.prelim,
                midterm: emptySheet.midterm,
                prefinal: emptySheet.prefinal,
                final: emptySheet.final,
              },
            ]
          }
        })
        return next
      })

      // Notify each assigned instructor that a student was enrolled in their subject
      for (const cid of classIds) {
        const cls = classes.find((c) => c.id === cid)
        if (!cls) continue
        const subj = subjects.find((s) => s.id === cls.subject_id) || cls.subject
        const instProfileId = resolveInstructorProfileId(cls.instructor_id)
        addNotification({
          user_id: instProfileId,
          role: 'instructor',
          category: 'user',
          title: `New Student Enrolled: ${subj?.code || 'Class'}`,
          message: `${studentName} (${studentNo}) has been enrolled in your class ${subj?.code || ''} - ${subj?.title || 'Subject'} (${cls.section?.name || 'Section'}).`,
        })
      }

      addActivityLog(
        'Administrator',
        `Enrolled student ${studentName} into ${classIds.length} class(es)`,
        'Student Management',
      )
    } catch (error) {
      console.error('Failed to enroll student in classes:', error)
    }
  }

  async function handleSaveSubject(event: React.FormEvent) {
    event.preventDefault()
    if (!subjectForm.code || !subjectForm.title) return

    const hasLab = Boolean(subjectForm.has_laboratory ?? subjectForm.hasLab)
    const normalizedSubjectForm = {
      ...subjectForm,
      has_laboratory: hasLab,
      hasLab,
    }

    try {
      if (editingSubjectId) {
        if (isUuid(editingSubjectId)) {
          await dbSubjects.update(editingSubjectId, normalizedSubjectForm)
        }
        setSubjects((current) =>
          current.map((subject) =>
            subject.id === editingSubjectId ? { ...subject, ...normalizedSubjectForm } : subject,
          ),
        )
        addActivityLog(
          'Administrator',
          `Updated curriculum subject: ${subjectForm.code} - ${subjectForm.title}`,
          'Subjects & Classes',
        )
      } else {
        const created = await dbSubjects.create(normalizedSubjectForm)
        const newSubject: Subject = {
          ...normalizedSubjectForm,
          ...created,
          has_laboratory: hasLab,
          hasLab,
        }
        setSubjects((current) => [newSubject, ...current])
        addActivityLog(
          'Administrator',
          `Added curriculum subject: ${newSubject.code} - ${newSubject.title}`,
          'Subjects & Classes',
        )
      }

      setSubjectForm(blankSubject)
      setEditingSubjectId(null)
    } catch (error) {
      console.error('Failed to save subject:', error)
      alert('Failed to save subject: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  function handleEditSubject(subject: Subject) {
    setEditingSubjectId(subject.id)
    setSubjectForm({
      ...subject,
      has_laboratory: Boolean(subject.has_laboratory ?? subject.hasLab),
      hasLab: Boolean(subject.has_laboratory ?? subject.hasLab),
    })
  }

  function resetSubjectForm() {
    setSubjectForm(blankSubject)
    setEditingSubjectId(null)
  }

  async function deleteSubject(subjectId: string) {
    try {
      const subj = subjects.find((s) => s.id === subjectId)
      if (isUuid(subjectId)) {
        await dbSubjects.delete(subjectId)
      }
      setSubjects((current) => current.filter((s) => s.id !== subjectId))
      if (subj) {
        addActivityLog(
          'Administrator',
          `Removed curriculum subject: ${subj.code} - ${subj.title}`,
          'Subjects & Classes',
        )
      }
    } catch (error) {
      console.error('Failed to delete subject:', error)
      alert(
        'Cannot delete subject while classes are still assigned to it. Delete its classes first.',
      )
    }
  }

  async function createClass(
    classData: Omit<ClassRecord, 'id' | 'created_at'>,
  ): Promise<ClassRecord> {
    try {
      const createdDbClass = await dbClasses.create(classData, classData.studentIds)
      const realClassId = createdDbClass.id
      const subject = subjects.find((s) => s.id === classData.subject_id)
      const instructor = instructors.find(
        (u) => u.id === classData.instructor_id || u.profile_id === classData.instructor_id,
      )
      const hasLab = subject?.has_laboratory ?? false

      const newClass: ClassRecord = {
        ...classData,
        id: realClassId,
        created_at: createdDbClass.created_at || new Date().toISOString(),
        subject,
        instructor: instructor as any,
      }

      setClasses((current) => [newClass, ...current])
      if (newClass.section && isUuid(newClass.section.id)) {
        setSections((prev) =>
          prev.some((s) => s.id === newClass.section!.id) ? prev : [newClass.section!, ...prev],
        )
      }

      const initialSheetRows = (classData.studentIds || []).map((studentId) => {
        const st = students.find((s) => s.id === studentId)
        return createEmptyStudentSheet(
          studentId,
          st?.name || 'Student',
          st?.student_no || st?.studentNo || 'N/A',
          hasLab,
        )
      })

      setDetailedGradingSheets((current) => ({
        ...current,
        [realClassId]: initialSheetRows,
      }))

      setGrades((current) => ({
        ...current,
        [realClassId]: initialSheetRows.map((sr) => ({
          studentId: sr.studentId,
          student_name: sr.studentName,
          quizzes: 0,
          assignments: 0,
          activities: 0,
          participation: 0,
          midtermExam: 0,
          finalExam: 0,
          historical: 0,
          prelim: sr.prelim,
          midterm: sr.midterm,
          prefinal: sr.prefinal,
          final: sr.final,
        })),
      }))

      if (!selectedClassId) {
        setSelectedClassId(realClassId)
      }

      const sectionLabel = classData.section?.name || 'Section'
      const instProfileId = resolveInstructorProfileId(classData.instructor_id)

      // 1. Notify the assigned instructor that a new subject/class was added to them
      addNotification({
        user_id: instProfileId,
        role: 'instructor',
        category: 'system',
        title: `New Class Assigned: ${subject?.code || 'Subject'} (${sectionLabel})`,
        message: `Admin assigned you to teach ${subject?.code || ''} - ${subject?.title || 'Subject'} for ${sectionLabel} (${classData.schedule || 'TBA'}, ${classData.room || 'TBA'}).`,
      })

      // 2. If students were enrolled in this class, notify the instructor of the enrolled students
      if ((classData.studentIds || []).length > 0) {
        addNotification({
          user_id: instProfileId,
          role: 'instructor',
          category: 'user',
          title: `Students Enrolled in ${subject?.code || 'Class'} (${sectionLabel})`,
          message: `${(classData.studentIds || []).length} student(s) have been enrolled in your class ${subject?.code || ''} - ${subject?.title || 'Subject'} (${sectionLabel}).`,
        })
      }

      addActivityLog(
        'Administrator',
        `Created class: ${subject?.title || 'Subject'} (${sectionLabel}) with instructor ${instructor?.name || 'Assigned'}`,
        'Subjects & Classes',
      )

      return newClass
    } catch (error) {
      console.error('Failed to create class:', error)
      throw error
    }
  }

  async function updateClass(classId: string, classData: Partial<ClassRecord>) {
    try {
      const existingClass = classes.find((c) => c.id === classId)
      const prevStudentIds = existingClass?.studentIds || []
      const prevInstructorId = existingClass?.instructor_id

      if (isUuid(classId)) {
        await dbClasses.update(classId, classData)
      }

      const subject =
        subjects.find((s) => s.id === (classData.subject_id || existingClass?.subject_id)) ||
        existingClass?.subject
      const instructor = instructors.find(
        (u) =>
          u.id === (classData.instructor_id || existingClass?.instructor_id) ||
          u.profile_id === (classData.instructor_id || existingClass?.instructor_id),
      )

      setClasses((current) =>
        current.map((c) =>
          c.id === classId
            ? {
                ...c,
                ...classData,
                subject,
                instructor: (instructor as any) || c.instructor,
              }
            : c,
        ),
      )

      if (Array.isArray(classData.studentIds)) {
        const newStudentIds = classData.studentIds
        const hasLab = subject?.has_laboratory ?? false

        setDetailedGradingSheets((current) => {
          const classSheet = current[classId] ?? []
          const existingIds = new Set(classSheet.map((s) => s.studentId))
          const updatedSheet = classSheet.filter((s) => newStudentIds.includes(s.studentId))

          for (const sid of newStudentIds) {
            if (!existingIds.has(sid)) {
              const st = students.find((s) => s.id === sid)
              updatedSheet.push(
                createEmptyStudentSheet(
                  sid,
                  st?.name || 'Student',
                  st?.student_no || st?.studentNo || 'N/A',
                  hasLab,
                ),
              )
            }
          }
          return { ...current, [classId]: updatedSheet }
        })

        setGrades((current) => {
          const classGrades = current[classId] ?? []
          const existingIds = new Set(classGrades.map((g) => g.studentId))
          const updatedGrades = classGrades.filter((g) => newStudentIds.includes(g.studentId))

          for (const sid of newStudentIds) {
            if (!existingIds.has(sid)) {
              const st = students.find((s) => s.id === sid)
              const emptySheet = createEmptyStudentSheet(
                sid,
                st?.name || 'Student',
                st?.student_no || st?.studentNo || 'N/A',
                hasLab,
              )
              updatedGrades.push({
                studentId: sid,
                student_name: st?.name || 'Student',
                quizzes: 0,
                assignments: 0,
                activities: 0,
                participation: 0,
                midtermExam: 0,
                finalExam: 0,
                historical: 0,
                prelim: emptySheet.prelim,
                midterm: emptySheet.midterm,
                prefinal: emptySheet.prefinal,
                final: emptySheet.final,
              })
            }
          }
          return { ...current, [classId]: updatedGrades }
        })

        const newlyAddedStudents = newStudentIds.filter((id) => !prevStudentIds.includes(id))
        const targetInstructorId = classData.instructor_id || existingClass?.instructor_id
        const instProfileId = resolveInstructorProfileId(targetInstructorId)
        const sectionName = classData.section?.name || existingClass?.section?.name || 'Section'

        if (classData.instructor_id && classData.instructor_id !== prevInstructorId) {
          addNotification({
            user_id: instProfileId,
            role: 'instructor',
            category: 'system',
            title: `New Class Assigned: ${subject?.code || 'Subject'} (${sectionName})`,
            message: `Admin assigned you to teach ${subject?.code || ''} - ${subject?.title || 'Subject'} (${sectionName}).`,
          })
        }

        if (newlyAddedStudents.length > 0) {
          addNotification({
            user_id: instProfileId,
            role: 'instructor',
            category: 'user',
            title: `New Student(s) Enrolled: ${subject?.code || 'Class'}`,
            message: `${newlyAddedStudents.length} new student(s) enrolled in ${subject?.code || ''} - ${subject?.title || 'Subject'} (${sectionName}).`,
          })
        }
      }

      addActivityLog('Administrator', `Updated class record and assignments`, 'Subjects & Classes')
    } catch (error) {
      console.error('Failed to update class:', error)
    }
  }

  async function deleteClass(classId: string) {
    try {
      const cls = classes.find((c) => c.id === classId)
      if (isUuid(classId)) {
        await dbClasses.delete(classId)
      }
      setClasses((current) => current.filter((c) => c.id !== classId))
      setDetailedGradingSheets((current) => {
        const next = { ...current }
        delete next[classId]
        return next
      })
      setGrades((current) => {
        const next = { ...current }
        delete next[classId]
        return next
      })
      if (selectedClassId === classId) {
        const remaining = classes.filter((c) => c.id !== classId)
        setSelectedClassId(remaining[0]?.id || null)
      }
      if (cls) {
        addActivityLog(
          'Administrator',
          `Deleted class record: ${cls.subject?.title || 'Class'}`,
          'Subjects & Classes',
        )
      }
    } catch (error) {
      console.error('Failed to delete class:', error)
    }
  }

  async function createClassFromSubject(subject: Subject) {
    try {
      const defaultInstructor = instructors[0]?.id ?? ''
      const section = await dbSections.create({
        name: 'BSIT 1A',
        course: 'BSIT',
        year_level: 1,
        school_year: settings.schoolYear,
        semester: settings.semester,
      })

      await createClass({
        subject_id: subject.id,
        section_id: section.id,
        instructor_id: defaultInstructor,
        room: `Room ${201 + classes.length}`,
        schedule: 'MWF 10:00 AM - 11:30 AM',
        studentIds: [],
        section,
      })
    } catch (error) {
      console.error('Failed to create class from subject:', error)
    }
  }

  function updateGrade(classId: string, studentId: string, field: keyof GradeRow, value: number) {
    setGrades((current) => {
      const existing = current[classId] ?? []
      const updated = existing.map((row) =>
        row.studentId === studentId ? { ...row, [field]: value } : row,
      )
      return { ...current, [classId]: updated }
    })

    const st = students.find((s) => s.id === studentId)
    const cls = classes.find((c) => c.id === classId)
    addActivityLog(
      'Instructor',
      `Updated score (${String(field)}) for student ${st?.name || 'Student'} in ${cls?.subject?.title || 'Class'}`,
      'Gradebook',
    )
  }

  function updateDetailedGrade(
    classId: string,
    studentId: string,
    periodOrField: GradingPeriodKey | string,
    fieldOrValue: TermComponentField | string | number,
    valueOptional?: number,
  ) {
    const cls = classes.find((c) => c.id === classId)
    const currentSubject = subjects.find((s) => s.id === cls?.subject_id)
    const hasLab = currentSubject?.has_laboratory ?? cls?.subject?.has_laboratory ?? false

    let period: GradingPeriodKey = 'prelim'
    let field: TermComponentField = 'exam'
    let numericValue = 0

    if (typeof valueOptional === 'number') {
      period =
        periodOrField === 'midterm'
          ? 'midterm'
          : periodOrField === 'prefinal'
          ? 'prefinal'
          : periodOrField === 'final'
          ? 'final'
          : 'prelim'
      const rawField = String(fieldOrValue)
      field =
        rawField === 'attendance'
          ? 'attendance'
          : rawField === 'quiz'
          ? 'quiz'
          : rawField === 'participation'
          ? 'participation'
          : rawField === 'labActivity' || rawField === 'labExam'
          ? 'labActivity'
          : rawField === 'activity' || rawField === 'activities'
          ? 'activity'
          : 'exam'
      numericValue = valueOptional
    } else {
      numericValue = Number(fieldOrValue)
      const rawField = String(periodOrField)
      if (rawField === 'midterm') {
        period = 'midterm'
        field = 'exam'
      } else if (rawField === 'prefinal') {
        period = 'prefinal'
        field = 'exam'
      } else if (rawField === 'final') {
        period = 'final'
        field = 'exam'
      } else {
        period = 'prelim'
        field =
          rawField === 'attendance'
            ? 'attendance'
            : rawField === 'quiz'
            ? 'quiz'
            : rawField === 'participation'
            ? 'participation'
            : rawField === 'labExam' || rawField === 'labActivity'
            ? 'labActivity'
            : rawField === 'activity' || rawField === 'activities'
            ? 'activity'
            : 'exam'
      }
    }

    let updatedRowRef: DetailedGradingSheet | null = null

    setDetailedGradingSheets((current) => {
      const classSheet = current[classId] ?? []
      const hasStudent = classSheet.some((item) => item.studentId === studentId)
      const baseSheet = hasStudent
        ? classSheet
        : [
            ...classSheet,
            createEmptyStudentSheet(
              studentId,
              students.find((s) => s.id === studentId)?.name || 'Student',
              students.find((s) => s.id === studentId)?.student_no || 'N/A',
              hasLab,
            ),
          ]

      const updatedSheet = baseSheet.map((item) => {
        if (item.studentId !== studentId) return item

        const currentPrelim = ensureTermScores(item.prelim, 0, hasLab)
        const currentMidterm = ensureTermScores(item.midterm, 0, hasLab)
        const currentPrefinal = ensureTermScores(item.prefinal, 0, hasLab)
        const currentFinal = ensureTermScores(item.final, 0, hasLab)

        const targetTerm =
          period === 'prelim'
            ? currentPrelim
            : period === 'midterm'
            ? currentMidterm
            : period === 'prefinal'
            ? currentPrefinal
            : currentFinal

        const existingItems = targetTerm.items || {
          attendance: [0],
          quiz: [0],
          activity: [0],
          participation: [0],
          exam: [0],
          labActivity: hasLab ? [0] : [],
        }

        const updatedTerm: DetailedTermScores = {
          ...targetTerm,
          [field]: numericValue,
          hasData: true,
          items: {
            ...existingItems,
            [field]: [numericValue],
          },
          ...(field === 'activity' ? { activities: numericValue } : {}),
          ...(field === 'labActivity' ? { labExam: numericValue } : {}),
        }

        const nextSheet: DetailedGradingSheet = {
          ...item,
          prelim: period === 'prelim' ? updatedTerm : currentPrelim,
          midterm: period === 'midterm' ? updatedTerm : currentMidterm,
          prefinal: period === 'prefinal' ? updatedTerm : currentPrefinal,
          final: period === 'final' ? updatedTerm : currentFinal,
        }

        const recalculated = recalculateSheetGrades(nextSheet, hasLab, weightsConfig)
        updatedRowRef = recalculated
        return recalculated
      })

      return { ...current, [classId]: updatedSheet }
    })

    // Sync with main GradeRow
    setGrades((current) => {
      const existing = current[classId] ?? []
      const updated = existing.map((row) => {
        if (row.studentId !== studentId || !updatedRowRef) return row
        return {
          ...row,
          quizzes: updatedRowRef.prelim.quiz,
          activities: updatedRowRef.prelim.activity,
          attendance: updatedRowRef.prelim.attendance,
          participation: updatedRowRef.prelim.participation,
          labExam: updatedRowRef.prelim.labActivity ?? undefined,
          midtermExam: updatedRowRef.midterm.exam,
          finalExam: updatedRowRef.final.exam,
          prelim: updatedRowRef.prelim,
          midterm: updatedRowRef.midterm,
          prefinal: updatedRowRef.prefinal,
          final: updatedRowRef.final,
        }
      })
      return { ...current, [classId]: updated }
    })

    if (updatedRowRef) {
      syncStudentSheetToSupabase(classId, studentId, updatedRowRef, period, field, numericValue)
    }
  }

  function updateAssessmentGrade(classId: string, studentId: string, field: string, value: number) {
    updateDetailedGrade(classId, studentId, 'prelim', field as TermComponentField, value)
  }

  function getClassPeriodMaxItems(
    classId: string,
    period: GradingPeriodKey,
    counts?: {
      attendance?: number
      quiz?: number
      activity?: number
      participation?: number
      exam?: number
      labActivity?: number
    },
  ): TermComponentMaxItems {
    const defaultForCounts = getDefaultTermMaxItems(counts)
    const classPeriod = classMaxScores[classId]?.[period]
    if (!classPeriod) {
      return defaultForCounts
    }

    const padOrTrim = (arr: number[] | undefined, targetLen: number, fallbackVal: number) => {
      const result = Array.isArray(arr) ? [...arr] : []
      while (result.length < targetLen) {
        result.push(fallbackVal)
      }
      return result.slice(0, targetLen)
    }

    return {
      attendance: padOrTrim(classPeriod.attendance, defaultForCounts.attendance.length, 10),
      attendanceTotal: classPeriod.attendanceTotal ?? defaultForCounts.attendanceTotal,
      quiz: padOrTrim(classPeriod.quiz, defaultForCounts.quiz.length, 20),
      activity: padOrTrim(classPeriod.activity, defaultForCounts.activity.length, 50),
      participation: padOrTrim(classPeriod.participation, defaultForCounts.participation.length, 20),
      exam: padOrTrim(classPeriod.exam, defaultForCounts.exam.length, 100),
      labActivity: padOrTrim(classPeriod.labActivity, defaultForCounts.labActivity?.length ?? 0, 50),
    }
  }

  function recalculateAllClassRowsForPeriod(
    classId: string,
    period: GradingPeriodKey,
    maxItemsMap: TermComponentMaxItems,
  ) {
    const cls = classes.find((c) => c.id === classId)
    const currentSubject = subjects.find((s) => s.id === cls?.subject_id)
    const hasLab = currentSubject?.has_laboratory ?? cls?.subject?.has_laboratory ?? false

    setDetailedGradingSheets((current) => {
      const classSheet = current[classId] ?? []
      const updatedSheet = classSheet.map((item) => {
        const currentPrelim = ensureTermScores(item.prelim, 0, hasLab)
        const currentMidterm = ensureTermScores(item.midterm, 0, hasLab)
        const currentPrefinal = ensureTermScores(item.prefinal, 0, hasLab)
        const currentFinal = ensureTermScores(item.final, 0, hasLab)

        const targetTerm =
          period === 'prelim'
            ? currentPrelim
            : period === 'midterm'
            ? currentMidterm
            : period === 'prefinal'
            ? currentPrefinal
            : currentFinal

        const existingItems = targetTerm.items || {
          attendance: [0],
          quiz: [0],
          activity: [0],
          participation: [0],
          exam: [0],
          labActivity: hasLab ? [0] : [],
        }

        const nextAttendance = computeCategoryTotalAndAvg(
          existingItems.attendance,
          maxItemsMap.attendance,
          maxItemsMap.attendanceTotal,
        ).average
        const nextQuiz = computeCategoryTotalAndAvg(
          existingItems.quiz,
          maxItemsMap.quiz,
        ).average
        const nextActivity = computeCategoryTotalAndAvg(
          existingItems.activity,
          maxItemsMap.activity,
        ).average
        const nextParticipation = computeCategoryTotalAndAvg(
          existingItems.participation,
          maxItemsMap.participation,
        ).average
        const nextExam = computeCategoryTotalAndAvg(
          existingItems.exam,
          maxItemsMap.exam,
        ).average
        const nextLab = hasLab
          ? computeCategoryTotalAndAvg(existingItems.labActivity || [0], maxItemsMap.labActivity).average
          : null

        const updatedTerm: DetailedTermScores = {
          ...targetTerm,
          attendance: nextAttendance,
          quiz: nextQuiz,
          activity: nextActivity,
          participation: nextParticipation,
          exam: nextExam,
          labActivity: nextLab,
          maxItems: maxItemsMap,
          activities: nextActivity,
          labExam: nextLab,
          computedTermGrade: 0,
        }

        const nextSheet: DetailedGradingSheet = {
          ...item,
          prelim: period === 'prelim' ? updatedTerm : currentPrelim,
          midterm: period === 'midterm' ? updatedTerm : currentMidterm,
          prefinal: period === 'prefinal' ? updatedTerm : currentPrefinal,
          final: period === 'final' ? updatedTerm : currentFinal,
        }

        return recalculateSheetGrades(nextSheet, hasLab, weightsConfig)
      })

      return { ...current, [classId]: updatedSheet }
    })
  }

  function updateComponentMaxScore(
    classId: string,
    period: GradingPeriodKey,
    field: TermComponentField,
    itemIndex: number,
    maxScore: number,
  ) {
    const safeMax = Math.max(1, maxScore)
    const clsMap = classMaxScores[classId] || {}
    const curPeriodMax = clsMap[period] || getDefaultTermMaxItems()
    const fieldArr = [...(curPeriodMax[field] || [])]
    while (fieldArr.length <= itemIndex) {
      fieldArr.push(20)
    }
    fieldArr[itemIndex] = safeMax

    const updatedPeriod: TermComponentMaxItems = {
      ...curPeriodMax,
      [field]: fieldArr,
    }
    if (field === 'attendance') {
      updatedPeriod.attendanceTotal = fieldArr.reduce((a, b) => a + b, 0)
    }

    setClassMaxScores((current) => ({
      ...current,
      [classId]: {
        ...(current[classId] || {}),
        [period]: updatedPeriod,
      },
    }))

    recalculateAllClassRowsForPeriod(classId, period, updatedPeriod)
  }

  function updateComponentTotalItems(
    classId: string,
    period: GradingPeriodKey,
    field: TermComponentField,
    totalItems: number,
  ) {
    const safeTotal = Math.max(1, totalItems)
    const clsMap = classMaxScores[classId] || {}
    const curPeriodMax = clsMap[period] || getDefaultTermMaxItems()
    const updatedPeriod: TermComponentMaxItems = {
      ...curPeriodMax,
      attendanceTotal: field === 'attendance' ? safeTotal : curPeriodMax.attendanceTotal,
    }

    setClassMaxScores((current) => ({
      ...current,
      [classId]: {
        ...(current[classId] || {}),
        [period]: updatedPeriod,
      },
    }))

    recalculateAllClassRowsForPeriod(classId, period, updatedPeriod)
  }

  const gradeNotifyTimers = useRef<Record<string, any>>({})

  function notifyStudentGradeDebounced(
    studentId: string,
    classId: string,
    period: GradingPeriodKey,
    field: TermComponentField,
    newTermGrade: number,
  ) {
    const key = `${studentId}-${classId}-${period}`
    if (gradeNotifyTimers.current[key]) {
      clearTimeout(gradeNotifyTimers.current[key])
    }
    gradeNotifyTimers.current[key] = setTimeout(() => {
      delete gradeNotifyTimers.current[key]
      const st = students.find((s) => s.id === studentId)
      const cls = classes.find((c) => c.id === classId)
      if (!st || !cls) return
      const subj = subjects.find((s) => s.id === cls.subject_id) || cls.subject
      const inst =
        instructors.find((i) => i.id === cls.instructor_id || i.profile_id === cls.instructor_id) ||
        cls.instructor
      const instructorName = inst?.name || 'Instructor'
      const periodLabel =
        period === 'prelim'
          ? 'Prelim'
          : period === 'midterm'
          ? 'Midterm'
          : period === 'prefinal'
          ? 'Pre-Final'
          : 'Final'
      const fieldTitle = field.charAt(0).toUpperCase() + field.slice(1)
      const targetUserId = st.profile_id || st.id

      addNotification({
        user_id: targetUserId,
        role: 'student',
        category: 'grades',
        title: `Grade Update: ${subj?.code || 'Subject'} (${periodLabel}: ${newTermGrade}%)`,
        message: `Instructor ${instructorName} updated your ${fieldTitle} in ${subj?.code || ''} - ${subj?.title || 'Subject'}. Current ${periodLabel} Grade: ${newTermGrade}%.`,
      })
    }, 1500)
  }

  function updateComponentItemScore(
    classId: string,
    studentId: string,
    period: GradingPeriodKey,
    field: TermComponentField,
    itemIndex: number,
    value: number,
  ) {
    const cls = classes.find((c) => c.id === classId)
    const currentSubject = subjects.find((s) => s.id === cls?.subject_id)
    const hasLab = currentSubject?.has_laboratory ?? cls?.subject?.has_laboratory ?? false

    let updatedRowRef: DetailedGradingSheet | null = null
    let newCategoryAverage = value

    setDetailedGradingSheets((current) => {
      const classSheet = current[classId] ?? []
      const hasStudent = classSheet.some((item) => item.studentId === studentId)
      const baseSheet = hasStudent
        ? classSheet
        : [
            ...classSheet,
            createEmptyStudentSheet(
              studentId,
              students.find((s) => s.id === studentId)?.name || 'Student',
              students.find((s) => s.id === studentId)?.student_no || 'N/A',
              hasLab,
            ),
          ]

      const updatedSheet = baseSheet.map((item) => {
        if (item.studentId !== studentId) return item

        const currentPrelim = ensureTermScores(item.prelim, 0, hasLab)
        const currentMidterm = ensureTermScores(item.midterm, 0, hasLab)
        const currentPrefinal = ensureTermScores(item.prefinal, 0, hasLab)
        const currentFinal = ensureTermScores(item.final, 0, hasLab)

        const targetTerm =
          period === 'prelim'
            ? currentPrelim
            : period === 'midterm'
            ? currentMidterm
            : period === 'prefinal'
            ? currentPrefinal
            : currentFinal

        const existingItems = targetTerm.items || {
          attendance: [0],
          quiz: [0],
          activity: [0],
          participation: [0],
          exam: [0],
          labActivity: hasLab ? [0] : [],
        }

        const currentFieldArr = [...(existingItems[field] || [0])]
        while (currentFieldArr.length <= itemIndex) {
          currentFieldArr.push(0)
        }
        currentFieldArr[itemIndex] = value

        const updatedItems = {
          ...existingItems,
          [field]: currentFieldArr,
        }

        const periodMax = getClassPeriodMaxItems(classId, period, {
          attendance: updatedItems.attendance.length,
          quiz: updatedItems.quiz.length,
          activity: updatedItems.activity.length,
          participation: updatedItems.participation.length,
          exam: updatedItems.exam.length,
          labActivity: updatedItems.labActivity?.length,
        })

        const nextAttendance = computeCategoryTotalAndAvg(
          updatedItems.attendance,
          periodMax.attendance,
          periodMax.attendanceTotal,
        ).average
        const nextQuiz = computeCategoryTotalAndAvg(
          updatedItems.quiz,
          periodMax.quiz,
        ).average
        const nextActivity = computeCategoryTotalAndAvg(
          updatedItems.activity,
          periodMax.activity,
        ).average
        const nextParticipation = computeCategoryTotalAndAvg(
          updatedItems.participation,
          periodMax.participation,
        ).average
        const nextExam = computeCategoryTotalAndAvg(
          updatedItems.exam,
          periodMax.exam,
        ).average
        const nextLab = hasLab
          ? computeCategoryTotalAndAvg(updatedItems.labActivity || [0], periodMax.labActivity).average
          : null

        newCategoryAverage =
          field === 'attendance'
            ? nextAttendance
            : field === 'quiz'
            ? nextQuiz
            : field === 'participation'
            ? nextParticipation
            : field === 'labActivity'
            ? nextLab ?? 0
            : field === 'activity'
            ? nextActivity
            : nextExam

        const updatedTerm: DetailedTermScores = {
          ...targetTerm,
          attendance: nextAttendance,
          quiz: nextQuiz,
          activity: nextActivity,
          participation: nextParticipation,
          exam: nextExam,
          labActivity: nextLab,
          items: updatedItems,
          activities: nextActivity,
          labExam: nextLab,
          hasData: true,
          computedTermGrade: 0,
        }

        const nextSheet: DetailedGradingSheet = {
          ...item,
          prelim: period === 'prelim' ? updatedTerm : currentPrelim,
          midterm: period === 'midterm' ? updatedTerm : currentMidterm,
          prefinal: period === 'prefinal' ? updatedTerm : currentPrefinal,
          final: period === 'final' ? updatedTerm : currentFinal,
        }

        const recalculated = recalculateSheetGrades(nextSheet, hasLab, weightsConfig)
        updatedRowRef = recalculated
        return recalculated
      })

      return { ...current, [classId]: updatedSheet }
    })

    // Sync with main GradeRow
    setGrades((current) => {
      const existing = current[classId] ?? []
      const updated = existing.map((row) => {
        if (row.studentId !== studentId || !updatedRowRef) return row
        return {
          ...row,
          quizzes: updatedRowRef.prelim.quiz,
          activities: updatedRowRef.prelim.activity,
          attendance: updatedRowRef.prelim.attendance,
          participation: updatedRowRef.prelim.participation,
          labExam: updatedRowRef.prelim.labActivity ?? undefined,
          midtermExam: updatedRowRef.midterm.exam,
          finalExam: updatedRowRef.final.exam,
          prelim: updatedRowRef.prelim,
          midterm: updatedRowRef.midterm,
          prefinal: updatedRowRef.prefinal,
          final: updatedRowRef.final,
        }
      })
      return { ...current, [classId]: updated }
    })

    if (updatedRowRef) {
      syncStudentSheetToSupabase(
        classId,
        studentId,
        updatedRowRef,
        period,
        field,
        newCategoryAverage,
      )

      const rowToUse = updatedRowRef as DetailedGradingSheet
      const targetTerm =
        period === 'prelim'
          ? rowToUse.prelim
          : period === 'midterm'
          ? rowToUse.midterm
          : period === 'prefinal'
          ? rowToUse.prefinal
          : rowToUse.final
      const termGrade = Math.round(targetTerm?.computedTermGrade || targetTerm?.rawGrade || 0)
      notifyStudentGradeDebounced(studentId, classId, period, field, termGrade)
    }
  }

  function addComponentColumn(
    classId: string,
    period: GradingPeriodKey,
    field: TermComponentField,
  ) {
    const cls = classes.find((c) => c.id === classId)
    const currentSubject = subjects.find((s) => s.id === cls?.subject_id)
    const hasLab = currentSubject?.has_laboratory ?? cls?.subject?.has_laboratory ?? false

    // Update max items list for this field
    setClassMaxScores((current) => {
      const clsMap = current[classId] || {}
      const curPeriod = clsMap[period] || getDefaultTermMaxItems()
      const currentArr = [...(curPeriod[field] || [])]
      const defaultVal =
        field === 'quiz' ? 20 : field === 'activity' ? 50 : field === 'attendance' ? 10 : 20
      currentArr.push(defaultVal)
      const updatedPeriod: TermComponentMaxItems = {
        ...curPeriod,
        [field]: currentArr,
      }
      if (field === 'attendance') {
        updatedPeriod.attendanceTotal = currentArr.reduce((a, b) => a + b, 0)
      }
      return {
        ...current,
        [classId]: {
          ...clsMap,
          [period]: updatedPeriod,
        },
      }
    })

    setDetailedGradingSheets((current) => {
      const classSheet = current[classId] ?? []
      const updatedSheet = classSheet.map((item) => {
        const currentPrelim = ensureTermScores(item.prelim, 0, hasLab)
        const currentMidterm = ensureTermScores(item.midterm, 0, hasLab)
        const currentPrefinal = ensureTermScores(item.prefinal, 0, hasLab)
        const currentFinal = ensureTermScores(item.final, 0, hasLab)

        const targetTerm =
          period === 'prelim'
            ? currentPrelim
            : period === 'midterm'
            ? currentMidterm
            : period === 'prefinal'
            ? currentPrefinal
            : currentFinal

        const existingItems = targetTerm.items || {
          attendance: [0],
          quiz: [0],
          activity: [0],
          participation: [0],
          exam: [0],
          labActivity: hasLab ? [0] : [],
        }

        const currentFieldArr = [...(existingItems[field] || [0])]
        // Push 0 (unencoded) — NEVER auto-fill 85!
        currentFieldArr.push(0)

        const updatedItems = {
          ...existingItems,
          [field]: currentFieldArr,
        }

        const updatedTerm: DetailedTermScores = {
          ...targetTerm,
          items: updatedItems,
        }

        const nextSheet: DetailedGradingSheet = {
          ...item,
          prelim: period === 'prelim' ? updatedTerm : currentPrelim,
          midterm: period === 'midterm' ? updatedTerm : currentMidterm,
          prefinal: period === 'prefinal' ? updatedTerm : currentPrefinal,
          final: period === 'final' ? updatedTerm : currentFinal,
        }

        return recalculateSheetGrades(nextSheet, hasLab, weightsConfig)
      })

      return { ...current, [classId]: updatedSheet }
    })
  }

  function removeComponentColumn(
    classId: string,
    period: GradingPeriodKey,
    field: TermComponentField,
  ) {
    const cls = classes.find((c) => c.id === classId)
    const currentSubject = subjects.find((s) => s.id === cls?.subject_id)
    const hasLab = currentSubject?.has_laboratory ?? cls?.subject?.has_laboratory ?? false

    // Update max items list
    setClassMaxScores((current) => {
      const clsMap = current[classId] || {}
      const curPeriod = clsMap[period] || getDefaultTermMaxItems()
      const currentArr = [...(curPeriod[field] || [])]
      if (currentArr.length > 1) {
        currentArr.pop()
      }
      const updatedPeriod: TermComponentMaxItems = {
        ...curPeriod,
        [field]: currentArr,
      }
      if (field === 'attendance') {
        updatedPeriod.attendanceTotal = currentArr.reduce((a, b) => a + b, 0)
      }
      return {
        ...current,
        [classId]: {
          ...clsMap,
          [period]: updatedPeriod,
        },
      }
    })

    setDetailedGradingSheets((current) => {
      const classSheet = current[classId] ?? []
      const updatedSheet = classSheet.map((item) => {
        const currentPrelim = ensureTermScores(item.prelim, 0, hasLab)
        const currentMidterm = ensureTermScores(item.midterm, 0, hasLab)
        const currentPrefinal = ensureTermScores(item.prefinal, 0, hasLab)
        const currentFinal = ensureTermScores(item.final, 0, hasLab)

        const targetTerm =
          period === 'prelim'
            ? currentPrelim
            : period === 'midterm'
            ? currentMidterm
            : period === 'prefinal'
            ? currentPrefinal
            : currentFinal

        const existingItems = targetTerm.items || {
          attendance: [0],
          quiz: [0],
          activity: [0],
          participation: [0],
          exam: [0],
          labActivity: hasLab ? [0] : [],
        }

        const currentFieldArr = [...(existingItems[field] || [0])]
        if (currentFieldArr.length <= 1) return item
        currentFieldArr.pop()

        const updatedItems = {
          ...existingItems,
          [field]: currentFieldArr,
        }

        const updatedTerm: DetailedTermScores = {
          ...targetTerm,
          attendance: computeItemsAverage(updatedItems.attendance),
          quiz: computeItemsAverage(updatedItems.quiz),
          activity: computeItemsAverage(updatedItems.activity),
          participation: computeItemsAverage(updatedItems.participation),
          exam: computeItemsAverage(updatedItems.exam),
          labActivity: hasLab ? computeItemsAverage(updatedItems.labActivity || [0]) : null,
          items: updatedItems,
        }

        const nextSheet: DetailedGradingSheet = {
          ...item,
          prelim: period === 'prelim' ? updatedTerm : currentPrelim,
          midterm: period === 'midterm' ? updatedTerm : currentMidterm,
          prefinal: period === 'prefinal' ? updatedTerm : currentPrefinal,
          final: period === 'final' ? updatedTerm : currentFinal,
        }

        return recalculateSheetGrades(nextSheet, hasLab, weightsConfig)
      })

      return { ...current, [classId]: updatedSheet }
    })
  }

  /**
   * Saves & submits all grades for a class to the Administrator, persisting to Supabase
   * and sending an official Grade Submission notification to Admin.
   */
  async function submitClassGradesToAdmin(classId: string, instructorName?: string) {
    const cls = classes.find((c) => c.id === classId)
    if (!cls) return

    const subj = subjects.find((s) => s.id === cls.subject_id) || cls.subject
    const inst =
      instructors.find((i) => i.id === cls.instructor_id || i.profile_id === cls.instructor_id) ||
      cls.instructor
    const resolvedInstructorName = instructorName || inst?.name || 'Instructor'
    const sectionName = cls.section?.name || 'Section'
    const nowIso = new Date().toISOString()

    const classSheet = detailedGradingSheets[classId] || []
    const updatedSheet = classSheet.map((row) => ({
      ...row,
      submittedToAdmin: true,
      submittedAt: nowIso,
    }))

    setDetailedGradingSheets((prev) => ({
      ...prev,
      [classId]: updatedSheet,
    }))

    // Persist every student's summary and basis to Supabase
    for (const row of updatedSheet) {
      syncStudentSheetToSupabase(classId, row.studentId, row)

      // Notify each student that official grades were submitted
      const st = students.find((s) => s.id === row.studentId)
      const targetUserId = st?.profile_id || row.studentId
      const computedOverall = Math.round(row.average || row.prelim?.computedTermGrade || 0)
      addNotification({
        user_id: targetUserId,
        role: 'student',
        category: 'grades',
        title: `Official Grades Submitted: ${subj?.code || 'Subject'}`,
        message: `Instructor ${resolvedInstructorName} submitted your official class grades for ${subj?.code || ''} - ${subj?.title || 'Subject'} (${sectionName}) to the Administration. Overall Standing: ${computedOverall}% (${row.status || 'Active'}).`,
      })
    }

    // Create notification for Administrator
    addNotification({
      role: 'administrator',
      category: 'grades',
      title: `Grades Submitted: ${subj?.code || 'Subject'} (${sectionName})`,
      message: `Instructor ${resolvedInstructorName} submitted grades for ${subj?.code || ''} - ${subj?.title || 'Subject'} (${sectionName}) covering ${updatedSheet.length} student(s).`,
    })

    addActivityLog(
      resolvedInstructorName,
      `Submitted class grades to Admin for ${subj?.code || ''} - ${subj?.title || 'Class'} (${sectionName})`,
      'Gradebook',
    )
  }

  /**
   * Saves grading sheet draft to Supabase and notifies students of updated draft grades.
   */
  async function saveClassGradeDraft(classId: string, instructorName?: string) {
    const cls = classes.find((c) => c.id === classId)
    if (!cls) return

    const subj = subjects.find((s) => s.id === cls.subject_id) || cls.subject
    const inst =
      instructors.find((i) => i.id === cls.instructor_id || i.profile_id === cls.instructor_id) ||
      cls.instructor
    const resolvedInstructorName = instructorName || inst?.name || 'Instructor'
    const sectionName = cls.section?.name || 'Section'

    const classSheet = detailedGradingSheets[classId] || []
    for (const row of classSheet) {
      syncStudentSheetToSupabase(classId, row.studentId, row)

      const hasPrelim = isTermEncoded(row.prelim)
      const hasMidterm = isTermEncoded(row.midterm)
      const hasPrefinal = isTermEncoded(row.prefinal)
      const hasFinal = isTermEncoded(row.final)
      if (hasPrelim || hasMidterm || hasPrefinal || hasFinal) {
        const st = students.find((s) => s.id === row.studentId)
        const targetUserId = st?.profile_id || row.studentId
        const pGrade = hasPrelim ? Math.round(row.prelim.computedTermGrade) : null
        const mGrade = hasMidterm ? Math.round(row.midterm.computedTermGrade) : null
        const gradeText = [
          pGrade !== null ? `Prelim: ${pGrade}%` : '',
          mGrade !== null ? `Midterm: ${mGrade}%` : '',
        ]
          .filter(Boolean)
          .join(' | ')

        addNotification({
          user_id: targetUserId,
          role: 'student',
          category: 'grades',
          title: `Grade Draft Saved: ${subj?.code || 'Subject'}${gradeText ? ` (${gradeText})` : ''}`,
          message: `Instructor ${resolvedInstructorName} saved and updated your grade records in ${subj?.code || ''} - ${subj?.title || 'Subject'} (${sectionName}). Current Standing: ${Math.round(row.average || pGrade || 0)}% (${row.status || 'Active'}).`,
        })
      }
    }

    addActivityLog(
      resolvedInstructorName,
      `Saved Class Record Book for ${subj?.code || ''} - ${subj?.title || 'Class'} (${sectionName})`,
      'Gradebook',
    )
  }

  function generateReport(type: any, activeUserName: string) {
    const report: Report = {
      id: crypto.randomUUID(),
      class_id: selectedClass?.id,
      type: type as any,
      title: `${type} - ${selectedClass ? getSubjectTitle(subjects, selectedClass.subject_id) : 'Schoolwide'}`,
      generated_by: activeUserName || 'System',
      export_format: 'view',
      created_at: new Date().toLocaleString(),
    }
    setReports((current) => [report, ...current])
    dbReports.create(report).catch(() => {})
    addActivityLog(activeUserName || 'User', `Generated official report: ${report.title}`, 'Reports')
  }

  function reportText() {
    const lines = [
      'Trackademic Academic & Prediction Report',
      `School Year: ${settings.schoolYear} | ${settings.semester}`,
      `Class: ${selectedClass ? getSubjectTitle(subjects, selectedClass.subject_id) : 'N/A'}`,
      `Section: ${selectedClass?.section?.name ?? 'N/A'}`,
      `Room: ${selectedClass?.room ?? 'N/A'}`,
      `Schedule: ${selectedClass?.schedule ?? 'N/A'}`,
      `Generated by: System`,
      '',
      'Student,Prelim Grade,Midterm Grade,Pre-Final Grade,Final Grade,Overall Grade,GPA,Status',
      ...gradebook.map((item) => {
        const p = item.row.prelim
        const m = item.row.midterm
        const pf = item.row.prefinal
        const f = item.row.final
        return [
          item.student?.name ?? item.student?.student_no ?? 'Student',
          isTermEncoded(p) ? Math.round(p?.computedTermGrade || 0) : '-',
          isTermEncoded(m) ? Math.round(m?.computedTermGrade || 0) : '-',
          isTermEncoded(pf) ? Math.round(pf?.computedTermGrade || 0) : '-',
          isTermEncoded(f) ? Math.round(f?.computedTermGrade || 0) : '-',
          item.computed.overall > 0 ? `${Math.round(item.computed.overall)}%` : '-',
          item.computed.gpaEquiv,
          item.computed.status,
        ].join(',')
      }),
    ]
    return lines.join('\n')
  }

  function printClassGradeReportTrigger(classIdToPrint?: string) {
    const clsId = classIdToPrint || selectedClass?.id
    if (!clsId) return
    const cls = classes.find((c) => c.id === clsId)
    if (!cls) return
    const subj = subjects.find((s) => s.id === cls.subject_id) || cls.subject
    const inst =
      instructors.find((i) => i.id === cls.instructor_id || i.profile_id === cls.instructor_id) ||
      cls.instructor
    const hasLab = subj?.has_laboratory ?? false
    const classSheet = detailedGradingSheets[clsId] || []

    const studentRows: PrintClassStudentRow[] = classSheet.map((item) => {
      const matchedStudent = students.find((s) => s.id === item.studentId)
      return {
        studentName: item.studentName || matchedStudent?.name || 'Student',
        studentNo: item.studentNo || matchedStudent?.student_no,
        prelim: ensureTermScores(item.prelim, 0, hasLab),
        midterm: ensureTermScores(item.midterm, 0, hasLab),
        prefinal: ensureTermScores(item.prefinal, 0, hasLab),
        final: ensureTermScores(item.final, 0, hasLab),
        average: Math.round(item.average || 0),
        status: item.status || 'Pending',
      }
    })

    const sampleStudent = students.find((s) => (cls.studentIds || []).includes(s.id))
    const resolvedYearLevel = sampleStudent?.year_level
      ? String(sampleStudent.year_level)
      : 'All Levels'

    printClassGradeReport({
      subjectCode: subj?.code || 'SUBJ',
      subjectTitle: subj?.title || 'Subject Title',
      hasLaboratory: hasLab,
      sectionName: cls.section?.name || 'Section',
      instructorName: inst?.name || 'Instructor',
      schedule: cls.schedule || 'TBA',
      room: cls.room || 'TBA',
      schoolYear: `${settings.schoolYear} (${settings.semester})`,
      yearLevel: resolvedYearLevel,
      students: studentRows,
    })
  }

  function printStudentGradingBookReportTrigger(studentIdToPrint?: string, gradesOnly?: boolean) {
    const student =
      students.find((s) => s.id === studentIdToPrint || s.profile_id === studentIdToPrint) ||
      students[0]
    if (!student) return

    const studentClasses = classes.filter((c) => (c.studentIds || []).includes(student.id))
    const rows: StudentAssessmentRow[] = studentClasses.map((cls) => {
      const subj = subjects.find((s) => s.id === cls.subject_id) || cls.subject
      const hasLab = Boolean(subj?.has_laboratory)
      const sheetRow = (detailedGradingSheets[cls.id] || []).find(
        (r) => r.studentId === student.id,
      )
      const prelim = ensureTermScores(sheetRow?.prelim, 0, hasLab)
      const midterm = ensureTermScores(sheetRow?.midterm, 0, hasLab)
      const prefinal = ensureTermScores(sheetRow?.prefinal, 0, hasLab)
      const final = ensureTermScores(sheetRow?.final, 0, hasLab)
      return {
        subjectId: subj?.id || cls.subject_id,
        code: subj?.code || 'SUBJ',
        title: subj?.title || 'Subject',
        units: Number(subj?.units) || 3,
        hasLaboratory: hasLab,
        prelim,
        midterm,
        prefinal,
        final,
        subjectAverage: Math.round(sheetRow?.average || 0),
      }
    })

    const encodedRows = rows.filter((r) => r.subjectAverage > 0)
    const overallAverage =
      encodedRows.length > 0
        ? Math.round(
            encodedRows.reduce((sum, r) => sum + r.subjectAverage, 0) / encodedRows.length,
          )
        : 0

    printStudentGradingBookReport({
      studentName: student.name || 'Student',
      studentNo: student.student_no,
      yearLevel: student.year_level ? String(student.year_level) : undefined,
      section: formatCourseSection(student.course, student.section_label),
      schoolYear: `${settings.schoolYear} (${settings.semester})`,
      rows,
      overallAverage,
      gradesOnly,
    })
  }

  function printReport() {
    printClassGradeReportTrigger()
  }

  const value: DataContextType = {
    users,
    setUsers,
    instructors,
    students,
    setStudents,
    subjects,
    setSubjects,
    sections,
    setSections,
    classes,
    setClasses,
    grades,
    setGrades,
    detailedGradingSheets,
    detailedGrades: detailedGradingSheets,
    setDetailedGradingSheets,
    notifications,
    setNotifications,
    activityLogs,
    setActivityLogs,
    settings,
    setSettings,
    reports,
    setReports,
    studentRecordsModalId,
    setStudentRecordsModalId,
    searchTerm,
    setSearchTerm,
    studentQuery,
    setStudentQuery,
    subjectQuery,
    setSubjectQuery,
    userForm,
    setUserForm,
    editingUserId,
    setEditingUserId,
    studentForm,
    setStudentForm,
    editingStudentId,
    setEditingStudentId,
    subjectForm,
    setSubjectForm,
    editingSubjectId,
    setEditingSubjectId,
    selectedClassId,
    setSelectedClassId,
    activeSection,
    setActiveSection,
    loading,
    selectedClass,
    selectedGrades,
    gradebook,
    selectedClassAverages,
    allComputedRows,
    atRiskRows,
    boundToFailRows,
    averagePerformance,
    filteredStudents,
    filteredSubjects,
    refreshData,
    handleSaveUser,
    handleSaveStudent,
    handleEditStudent,
    deleteStudent,
    handleDeleteStudent: deleteStudent,
    resetStudentForm,
    toggleStudentDropOut,
    handleSaveSubject,
    handleEditSubject,
    deleteSubject,
    resetSubjectForm,
    createClass,
    updateClass,
    deleteClass,
    createClassFromSubject,
    updateGrade,
    updateDetailedGrade,
    classMaxScores,
    updateComponentMaxScore,
    updateComponentTotalItems,
    getClassPeriodMaxItems,
    updateComponentItemScore,
    addComponentColumn,
    removeComponentColumn,
    updateAssessmentGrade,
    submitClassGradesToAdmin,
    saveClassGradeDraft,
    generateReport,
    reportText,
    printReport,
    printStudentGradingBookReport: printStudentGradingBookReportTrigger,
    printClassGradeReport: printClassGradeReportTrigger,
    studentTemplateRecords: {},
    markNotificationRead,
    markNotificationAsRead: markNotificationRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    enrollStudentInClasses,
    addNotification,
    addActivityLog,
    updateSettings,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
