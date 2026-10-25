import React, { createContext, useState, useMemo, useContext, useEffect } from 'react'
import type {
  User,
  Student,
  Subject,
  ClassRecord,
  GradeRow,
  Report,
  DashboardSection,
  ClassAverages,
  NotificationItem,
  ActivityLogItem,
  SystemSettings,
  DetailedGradingSheet,
  Role,
  UserStatus,
} from '../utils/types'
import { computeGrade, computeClassAverages, getSubjectTitle, computeTemplateSubjectAverage } from '../utils/helpers'
import {
  printStudentGradingBookReport,
  printClassGradeReport,
  type PrintClassStudentRow,
} from '../utils/printReport'
import {
  dbProfiles,
  dbStudents,
  dbSubjects,
  dbClasses,
  dbInstructors,
  dbGradeSummaries,
} from '../utils/db'
import {
  initialUsers,
  initialStudents,
  initialSubjects,
  initialClasses,
  initialGrades,
  initialDetailedGradingSheets,
  initialNotifications,
  initialActivityLogs,
  initialSystemSettings,
  initialReports,
  studentTemplateRecords,
} from '../data/initialData'

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
  course: 'BSIT',
  section_label: 'BSIT-4A',
  name: '',
  email: '',
  password: '',
  year_level: 4,
} as Omit<Student, 'id'>

export const blankSubject = {
  code: '',
  title: '',
  units: 3,
} as Omit<Subject, 'id'>

interface DataContextType {
  // Data
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  instructors: User[]
  students: Student[]
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>
  subjects: Subject[]
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>
  classes: ClassRecord[]
  setClasses: React.Dispatch<React.SetStateAction<ClassRecord[]>>
  grades: Record<string, GradeRow[]>
  setGrades: React.Dispatch<React.SetStateAction<Record<string, GradeRow[]>>>
  detailedGradingSheets: Record<string, DetailedGradingSheet[]>
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
  userForm: Omit<User, 'id'>
  setUserForm: React.Dispatch<React.SetStateAction<Omit<User, 'id'>>>
  editingUserId: string | null
  setEditingUserId: (id: string | null) => void
  studentForm: Omit<Student, 'id'>
  setStudentForm: React.Dispatch<React.SetStateAction<Omit<Student, 'id'>>>
  editingStudentId: string | null
  setEditingStudentId: (id: string | null) => void
  subjectForm: Omit<Subject, 'id'>
  setSubjectForm: React.Dispatch<React.SetStateAction<Omit<Subject, 'id'>>>
  editingSubjectId: string | null
  setEditingSubjectId: (id: string | null) => void
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
  handleSaveUser: (event: React.FormEvent) => Promise<void>
  handleSaveStudent: (event: React.FormEvent) => Promise<void>
  deleteStudent: (studentId: string) => Promise<void>
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
    periodOrField: any,
    fieldOrValue: any,
    value?: number,
  ) => void
  updateAssessmentGrade: (classId: string, studentId: string, field: string, value: number) => void
  generateReport: (type: string, activeUserName: string) => void
  reportText: () => string
  printReport: () => void
  printStudentGradingBookReport: (studentId?: string) => void
  printClassGradeReport: (classId?: string) => void
  studentTemplateRecords: typeof studentTemplateRecords
  markNotificationRead: (id: string) => void
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void
  addActivityLog: (actor: string, action: string, target?: string) => void
  updateSettings: (newSettings: Partial<SystemSettings>) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Data state initialized with rich defaults
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [classes, setClasses] = useState<ClassRecord[]>(initialClasses)
  const [grades, setGrades] = useState<Record<string, GradeRow[]>>(initialGrades)
  const [detailedGradingSheets, setDetailedGradingSheets] = useState<Record<string, DetailedGradingSheet[]>>(
    initialDetailedGradingSheets,
  )
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(initialActivityLogs)
  const [settings, setSettings] = useState<SystemSettings>(initialSystemSettings)
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [loading, setLoading] = useState(false)
  const [studentRecordsModalId, setStudentRecordsModalId] = useState<string | null>(null)

  // Form state
  const [searchTerm, setSearchTerm] = useState('')
  const [userForm, setUserForm] = useState<Omit<User, 'id'>>(blankUser)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [studentForm, setStudentForm] = useState<Omit<Student, 'id'>>(blankStudent)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [subjectForm, setSubjectForm] = useState<Omit<Subject, 'id'>>(blankSubject)
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(initialClasses[0]?.id || null)
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')

  const [dbInstructorsList, setDbInstructorsList] = useState<any[]>([])

  // Load data from database on mount if available, else keep rich defaults
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profilesData, studentsData, instructorsData, subjectsData, classesData] = await Promise.all([
          dbProfiles.getAll().catch(() => []),
          dbStudents.getAll().catch(() => []),
          dbInstructors.getAll().catch(() => []),
          dbSubjects.getAll().catch(() => []),
          dbClasses.getAll().catch(() => []),
        ])

        if (instructorsData && instructorsData.length > 0) {
          setDbInstructorsList(instructorsData)
        }

        if (profilesData && profilesData.length > 0) {
          const usersData: User[] = profilesData.map((profile) => {
            const rawName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.name || 'User'
            const role = (
              profile.role === 'faculty' || profile.role === 'instructor' 
                ? 'instructor' 
                : profile.role === 'admin' || profile.role === 'administrator' 
                ? 'administrator' 
                : 'student'
            ) as Role
            const email = profile.email || `${rawName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@sandigan.edu.ph`
            return {
              id: profile.id,
              name: rawName,
              email: email,
              role: role,
              status: (profile.status as UserStatus) || 'active',
              password: profile.password_plain || 'password123',
            }
          })
          setUsers((prev) => {
            const combined = [...usersData]
            for (const u of prev) {
              if (!combined.some((item) => item.email.toLowerCase() === u.email.toLowerCase())) {
                combined.push(u)
              }
            }
            return combined
          })
        }

        let currentStudents: Student[] = []
        if (studentsData && studentsData.length > 0) {
          currentStudents = (studentsData as any[]).map((s) => ({
            id: s.id,
            profile_id: s.profile_id,
            student_no: s.student_no,
            studentNo: s.student_no,
            name: `${s.profiles?.first_name || ''} ${s.profiles?.last_name || ''}`.trim() || 'Student',
            email: s.profiles?.email || '',
            course: s.course || 'BSIT',
            section_label: s.section_label || 'BSIT-4A',
            year_level: s.year_level || 4,
            created_at: s.created_at,
            password: s.profiles?.password_plain || 'password123',
          }))

          setStudents((prev) => {
            const map = new Map<string, Student>()
            prev.forEach((s) => map.set(s.id, s))
            currentStudents.forEach((s) => map.set(s.id, s))
            return Array.from(map.values())
          })
        }

        if (subjectsData && subjectsData.length > 0) {
          setSubjects((prev) => {
            const map = new Map<string, Subject>()
            prev.forEach((s) => map.set(s.id, s))
            subjectsData.forEach((s) => map.set(s.id, s))
            return Array.from(map.values())
          })
        }

        if (classesData && classesData.length > 0) {
          setClasses((prev) => {
            const map = new Map<string, ClassRecord>()
            prev.forEach((c) => map.set(c.id, c))
            ;(classesData as any[]).forEach((c) => map.set(c.id, c))
            const allClasses = Array.from(map.values())

            // Initialize grade rows for all enrolled students
            setGrades((prevGrades) => {
              const nextGrades = { ...prevGrades }
              for (const cls of allClasses) {
                const enrolledIds = cls.studentIds || []
                const existingRows = nextGrades[cls.id] || []
                const existingSet = new Set(existingRows.map((r) => r.studentId))
                const updatedRows = [...existingRows]

                for (const sid of enrolledIds) {
                  if (!existingSet.has(sid)) {
                    const st = currentStudents.find((s) => s.id === sid) || initialStudents.find((s) => s.id === sid)
                    updatedRows.push({
                      studentId: sid,
                      student_name: st?.name || 'Student',
                      quizzes: 80,
                      assignments: 82,
                      activities: 80,
                      midtermExam: 82,
                      finalExam: 85,
                      historical: 80,
                    })
                  }
                }
                if (updatedRows.length > 0) {
                  nextGrades[cls.id] = updatedRows
                }
              }
              return nextGrades
            })

            // Initialize detailed sheets for all enrolled students
            setDetailedGradingSheets((prevSheets) => {
              const nextSheets = { ...prevSheets }
              for (const cls of allClasses) {
                const enrolledIds = cls.studentIds || []
                const existingSheet = nextSheets[cls.id] || []
                const existingSet = new Set(existingSheet.map((r) => r.studentId))
                const updatedSheet = [...existingSheet]

                for (const sid of enrolledIds) {
                  if (!existingSet.has(sid)) {
                    const st = currentStudents.find((s) => s.id === sid) || initialStudents.find((s) => s.id === sid)
                    updatedSheet.push({
                      studentId: sid,
                      studentName: st?.name || 'Student',
                      studentNo: st?.student_no || st?.studentNo || 'N/A',
                      prelim: { exam: 80, quiz: 80, activities: 80, computedTermGrade: 80 },
                      midterm: { exam: 82, quiz: 82, activities: 82, computedTermGrade: 82 },
                      final: { exam: 85, quiz: 85, activities: 85, computedTermGrade: 85 },
                      average: 82.3,
                      status: 'On Track',
                    })
                  }
                }
                if (updatedSheet.length > 0) {
                  nextSheets[cls.id] = updatedSheet
                }
              }
              return nextSheets
            })

            return allClasses
          })
        }
      } catch (error) {
        console.warn('Using seeded data as fallback:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Activity log helper
  function addActivityLog(actor: string, action: string, target?: string) {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 || 12
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const timeFormatted = `${formattedHours}:${formattedMinutes} ${ampm}`

    const newLog: ActivityLogItem = {
      id: crypto.randomUUID(),
      actor,
      action,
      timestamp: now.toISOString(),
      timeFormatted,
      target,
    }
    setActivityLogs((prev) => [newLog, ...prev])
  }

  // Notification helper
  function addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    const newNotif: NotificationItem = {
      id: crypto.randomUUID(),
      ...notif,
      timestamp: 'Just now',
      read: false,
    }
    setNotifications((prev) => [newNotif, ...prev])
  }

  function markNotificationRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  function updateSettings(newSettings: Partial<SystemSettings>) {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      addActivityLog('Administrator', `Updated system configuration & grading settings`, 'Settings')
      return updated
    })
  }

  // Computed values
  const instructors = useMemo(() => {
    const list: (User & { profile_id?: string })[] = []
    const seenIds = new Set<string>()

    dbInstructorsList.forEach((inst: any) => {
      const name = `${inst.profiles?.first_name || ''} ${inst.profiles?.last_name || ''}`.trim() || 'Instructor'
      const email = inst.profiles?.email || ''
      list.push({
        id: inst.id,
        profile_id: inst.profile_id,
        name,
        email,
        role: 'instructor',
        status: inst.profiles?.status || 'active',
      })
      seenIds.add(inst.id)
      if (inst.profile_id) seenIds.add(inst.profile_id)
    })

    users
      .filter((u) => u.role === 'instructor' && u.status === 'active')
      .forEach((u) => {
        if (!seenIds.has(u.id)) {
          list.push(u)
          seenIds.add(u.id)
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
      selectedGrades.map((row) => ({
        row,
        student: students.find((student) => student.id === row.studentId),
        computed: computeGrade(row),
      })),
    [selectedGrades, students],
  )

  const selectedClassAverages = useMemo(() => computeClassAverages(gradebook), [gradebook])

  const allComputedRows = useMemo(
    () =>
      classes.flatMap((classItem) => {
        const classGrades = grades[classItem.id] ?? []
        const studentIds = classItem.studentIds || []
        const allStudentIds = Array.from(new Set([...classGrades.map((g) => g.studentId), ...studentIds]))

        return allStudentIds.map((studentId) => {
          const row = classGrades.find((g) => g.studentId === studentId) ?? {
            studentId,
            quizzes: 80,
            assignments: 82,
            activities: 80,
            midtermExam: 82,
            finalExam: 85,
            historical: 80,
          }
          const student = students.find((s) => s.id === studentId)
          return {
            classItem,
            row,
            student,
            computed: computeGrade(row),
          }
        })
      }),
    [classes, grades, students],
  )

  const atRiskRows = useMemo(
    () => allComputedRows.filter((item) => item.computed.status === 'At Risk'),
    [allComputedRows],
  )

  const boundToFailRows = useMemo(
    () => allComputedRows.filter((item) => item.computed.status === 'Bound to Fail'),
    [allComputedRows],
  )

  const averagePerformance = useMemo(
    () =>
      allComputedRows.length > 0
        ? Math.round(allComputedRows.reduce((sum, item) => sum + item.computed.overall, 0) / allComputedRows.length)
        : 0,
    [allComputedRows],
  )

  const filteredStudents = useMemo(
    () =>
      students.filter((student) =>
        [student.name, student.student_no, student.studentNo, student.course, student.section_label, student.email]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    [students, searchTerm],
  )

  // Database operations
  async function handleSaveUser(event: React.FormEvent) {
    event.preventDefault()
    if (!userForm.name || !userForm.email) return

    try {
      const formattedUser = {
        ...userForm,
        email: userForm.email.trim().toLowerCase(),
      }

      if (editingUserId) {
        setUsers((current) =>
          current.map((user) => (user.id === editingUserId ? { ...user, ...formattedUser } : user)),
        )
        addActivityLog('Administrator', `Updated instructor account: ${formattedUser.name}`, 'Instructor Management')
        try {
          const nameParts = formattedUser.name.split(' ')
          await dbProfiles.update(editingUserId, {
            email: formattedUser.email,
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            role: formattedUser.role,
            status: formattedUser.status,
            password_plain: formattedUser.password || '',
          })
        } catch {}
      } else {
        const newId = `user-${crypto.randomUUID().slice(0, 8)}`
        const newUser: User = {
          id: newId,
          name: formattedUser.name,
          email: formattedUser.email,
          role: formattedUser.role,
          status: formattedUser.status,
          password: formattedUser.password,
        }
        setUsers((current) => [newUser, ...current])
        addActivityLog('Administrator', `Added new instructor: ${formattedUser.name}`, 'Instructor Management')
        addNotification({
          title: 'New instructor account created',
          message: `Instructor account for ${formattedUser.name} was successfully created.`,
          role: 'administrator',
          category: 'user',
        })

        try {
          const nameParts = formattedUser.name.split(' ')
          const newProfile = await dbProfiles.create({
            email: formattedUser.email,
            password_plain: formattedUser.password || '',
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            role: formattedUser.role,
            status: formattedUser.status,
          })
          if (formattedUser.role === 'instructor') {
            await dbInstructors.create({
              profile_id: newProfile.id,
              employee_no: `EMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
              department: undefined,
            })
          }
        } catch {}
      }

      setUserForm(blankUser)
      setEditingUserId(null)
    } catch (error) {
      console.error('Failed to save user:', error)
    }
  }

  async function handleSaveStudent(event: React.FormEvent) {
    event.preventDefault()
    const studentNo = studentForm.studentNo || studentForm.student_no
    if (!studentNo || !studentForm.name) return

    try {
      if (editingStudentId) {
        const updateData = {
          ...studentForm,
          student_no: studentNo,
          studentNo: studentNo,
        }
        setStudents((current) =>
          current.map((student) => (student.id === editingStudentId ? { ...student, ...updateData } : student)),
        )
        // Also update corresponding user profile in users
        setUsers((current) =>
          current.map((u) => (u.id === editingStudentId || u.email === studentForm.email ? { ...u, name: studentForm.name! } : u)),
        )
        addActivityLog('Administrator', `Updated student profile: ${studentForm.name} (${studentNo})`, 'Student Management')

        try {
          await dbStudents.update(editingStudentId, updateData)
        } catch {}
      } else {
        const nameParts = (studentForm.name || '').trim().split(' ')
        const firstName = nameParts[0] || 'Student'
        const lastName = nameParts.slice(1).join(' ') || ''
        const generatedEmail =
          (studentForm.email || '').trim().toLowerCase() ||
          `${studentNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@trackademic.edu`
        const passwordPlain = studentForm.password || 'password123'

        let createdStudentId: string = crypto.randomUUID()
        let createdProfileId: string = crypto.randomUUID()

        try {
          const profile = await dbProfiles.create({
            email: generatedEmail,
            password_plain: passwordPlain,
            first_name: firstName,
            last_name: lastName,
            role: 'student',
            status: 'active',
          })
          createdProfileId = profile.id

          const dbStud = await dbStudents.create({
            profile_id: profile.id,
            student_no: studentNo,
            course: studentForm.course || 'BSIT',
            section_label: studentForm.section_label || 'BSIT-4A',
            year_level: studentForm.year_level || 4,
          })
          createdStudentId = dbStud.id
        } catch (dbErr) {
          console.warn('DB student create warning, using fallback ID:', dbErr)
        }

        const newStudent: Student = {
          id: createdStudentId,
          profile_id: createdProfileId,
          student_no: studentNo,
          studentNo: studentNo,
          name: studentForm.name.trim(),
          email: generatedEmail,
          course: studentForm.course || 'BSIT',
          section_label: studentForm.section_label || 'BSIT-4A',
          year_level: studentForm.year_level || 4,
          created_at: new Date().toISOString(),
          password: passwordPlain,
        }

        setStudents((current) => [newStudent, ...current])
        setUsers((current) => [
          {
            id: createdProfileId,
            name: studentForm.name!.trim(),
            email: generatedEmail,
            role: 'student',
            status: 'active',
            password: passwordPlain,
          },
          ...current,
        ])

        addActivityLog('Administrator', `Registered new student: ${studentForm.name} (${studentNo})`, 'Student Management')
        addNotification({
          title: 'New student registered',
          message: `${studentForm.name} (ID: ${studentNo}) was enrolled in ${studentForm.course || 'BSIT'}.`,
          role: 'administrator',
          category: 'user',
        })
      }

      setStudentForm(blankStudent)
      setEditingStudentId(null)
    } catch (error) {
      console.error('Failed to save student:', error)
    }
  }

  async function deleteStudent(studentId: string) {
    try {
      const studentToDelete = students.find((s) => s.id === studentId)
      setStudents((current) => current.filter((s) => s.id !== studentId))
      setClasses((current) =>
        current.map((c) => ({
          ...c,
          studentIds: (c.studentIds || []).filter((id) => id !== studentId),
        })),
      )
      setGrades((current) => {
        const nextGrades: Record<string, GradeRow[]> = {}
        for (const classIdStr in current) {
          nextGrades[classIdStr] = (current[classIdStr] || []).filter((g) => g.studentId !== studentId)
        }
        return nextGrades
      })

      if (studentToDelete) {
        addActivityLog('Administrator', `Removed student record: ${studentToDelete.name}`, 'Student Management')
      }

      try {
        await dbStudents.delete(studentId)
      } catch {}
    } catch (error) {
      console.error('Failed to delete student:', error)
    }
  }

  // Enroll a student into multiple classes
  async function enrollStudentInClasses(studentId: string, classIds: string[]) {
    try {
      const studentObj = students.find((s) => s.id === studentId)
      const studentName = studentObj?.name || 'Student'

      // Update classes locally
      setClasses((current) =>
        current.map((c) =>
          classIds.includes(c.id)
            ? { ...c, studentIds: Array.from(new Set([...(c.studentIds || []), studentId])) }
            : c,
        ),
      )

      // Initialize grade rows for each class if not present
      setGrades((current) => {
        const next = { ...current }
        classIds.forEach((classId) => {
          const rows = next[classId] ?? []
          if (!rows.some((r) => r.studentId === studentId)) {
            rows.push({
              studentId,
              student_name: studentName,
              quizzes: 80,
              assignments: 82,
              activities: 80,
              midtermExam: 82,
              finalExam: 85,
              historical: 80,
            })
            next[classId] = rows
          }
        })
        return next
      })

      // Initialize detailed grading sheets similarly
      setDetailedGradingSheets((current) => {
        const next = { ...current }
        classIds.forEach((classId) => {
          const sheet = next[classId] ?? []
          if (!sheet.some((s) => s.studentId === studentId)) {
            sheet.push({
              studentId,
              studentName: studentName,
              studentNo: studentObj?.student_no || studentObj?.studentNo || 'N/A',
              prelim: { exam: 80, quiz: 80, activities: 80, computedTermGrade: 80 },
              midterm: { exam: 82, quiz: 82, activities: 82, computedTermGrade: 82 },
              final: { exam: 85, quiz: 85, activities: 85, computedTermGrade: 85 },
              average: 82.3,
              status: 'On Track',
            })
            next[classId] = sheet
          }
        })
        return next
      })

      // Persist to Supabase class_students
      await Promise.allSettled(
        classIds.map((classId) => dbClasses.addStudent(classId, studentId)),
      )

      addActivityLog('Administrator', `Enrolled student ${studentName} into ${classIds.length} class(es)`, 'Student Management')
      addNotification({
        title: 'Student enrollment updated',
        message: `${studentName} was successfully enrolled into ${classIds.length} class(es).`,
        role: 'administrator',
        category: 'user',
      })
    } catch (error) {
      console.error('Failed to enroll student in classes:', error)
    }
  }
  async function handleSaveSubject(event: React.FormEvent) {
    event.preventDefault()
    if (!subjectForm.code || !subjectForm.title) return

    try {
      if (editingSubjectId) {
        setSubjects((current) =>
          current.map((subject) => (subject.id === editingSubjectId ? { ...subject, ...subjectForm } : subject)),
        )
        addActivityLog('Administrator', `Updated curriculum subject: ${subjectForm.code} - ${subjectForm.title}`, 'Subjects & Classes')
        try {
          await dbSubjects.update(editingSubjectId, subjectForm)
        } catch {}
      } else {
        const newSubject: Subject = {
          id: `subj-${crypto.randomUUID().slice(0, 8)}`,
          ...subjectForm,
          created_at: new Date().toISOString(),
        }
        setSubjects((current) => [...current, newSubject])
        addActivityLog('Administrator', `Added curriculum subject: ${newSubject.code} - ${newSubject.title}`, 'Subjects & Classes')
        try {
          await dbSubjects.create(subjectForm)
        } catch {}
      }

      setSubjectForm(blankSubject)
      setEditingSubjectId(null)
    } catch (error) {
      console.error('Failed to save subject:', error)
    }
  }

  async function deleteSubject(subjectId: string) {
    try {
      const subj = subjects.find((s) => s.id === subjectId)
      setSubjects((current) => current.filter((s) => s.id !== subjectId))
      if (subj) {
        addActivityLog('Administrator', `Removed curriculum subject: ${subj.code} - ${subj.title}`, 'Subjects & Classes')
      }
      try {
        await dbSubjects.delete(subjectId)
      } catch {}
    } catch (error) {
      console.error('Failed to delete subject:', error)
    }
  }

  async function createClass(classData: Omit<ClassRecord, 'id' | 'created_at'>): Promise<ClassRecord> {
    try {
      const newClassId = `class-${crypto.randomUUID().slice(0, 8)}`
      const subject = subjects.find((s) => s.id === classData.subject_id)
      const instructor = users.find((u) => u.id === classData.instructor_id)

      const newClass: ClassRecord = {
        ...classData,
        id: newClassId,
        created_at: new Date().toISOString(),
        subject,
        instructor: instructor as any,
      }

      setClasses((current) => [...current, newClass])

      // Initialize grade records locally
      setGrades((current) => ({
        ...current,
        [newClass.id]: (classData.studentIds || []).map((studentId) => {
          const st = students.find((s) => s.id === studentId)
          return {
            studentId,
            student_name: st?.name || 'Student',
            quizzes: 80,
            assignments: 82,
            activities: 80,
            midtermExam: 82,
            finalExam: 85,
            historical: 80,
          }
        }),
      }))

      // Initialize detailed grading sheet
      setDetailedGradingSheets((current) => ({
        ...current,
        [newClass.id]: (classData.studentIds || []).map((studentId) => {
          const st = students.find((s) => s.id === studentId)
          return {
            studentId,
            studentName: st?.name || 'Student',
            studentNo: st?.student_no || st?.studentNo || 'N/A',
            prelim: { exam: 80, quiz: 80, activities: 80, computedTermGrade: 80 },
            midterm: { exam: 82, quiz: 82, activities: 82, computedTermGrade: 82 },
            final: { exam: 85, quiz: 85, activities: 85, computedTermGrade: 85 },
            average: 82.3,
            status: 'On Track',
          }
        }),
      }))

      if (!selectedClassId) {
        setSelectedClassId(newClass.id)
      }

      addActivityLog(
        'Administrator',
        `Created class: ${subject?.title || 'Subject'} (${classData.section?.name || 'Section'}) with instructor ${instructor?.name || 'Assigned'}`,
        'Subjects & Classes',
      )

      try {
        await dbClasses.create(classData, classData.studentIds)
      } catch {}

      return newClass
    } catch (error) {
      console.error('Failed to create class:', error)
      throw error
    }
  }

  async function updateClass(classId: string, classData: Partial<ClassRecord>) {
    try {
      setClasses((current) => current.map((c) => (c.id === classId ? { ...c, ...classData } : c)))

      if (Array.isArray(classData.studentIds)) {
        const newStudentIds = classData.studentIds
        setGrades((current) => {
          const classGrades = current[classId] ?? []
          const existingIds = new Set(classGrades.map((g) => g.studentId))
          const updatedGrades = classGrades.filter((g) => newStudentIds.includes(g.studentId))

          for (const sid of newStudentIds) {
            if (!existingIds.has(sid)) {
              const st = students.find((s) => s.id === sid)
              updatedGrades.push({
                studentId: sid,
                student_name: st?.name || 'Student',
                quizzes: 80,
                assignments: 82,
                activities: 80,
                midtermExam: 82,
                finalExam: 85,
                historical: 80,
              })
            }
          }
          return { ...current, [classId]: updatedGrades }
        })

        setDetailedGradingSheets((current) => {
          const classSheet = current[classId] ?? []
          const existingIds = new Set(classSheet.map((s) => s.studentId))
          const updatedSheet = classSheet.filter((s) => newStudentIds.includes(s.studentId))

          for (const sid of newStudentIds) {
            if (!existingIds.has(sid)) {
              const st = students.find((s) => s.id === sid)
              updatedSheet.push({
                studentId: sid,
                studentName: st?.name || 'Student',
                studentNo: st?.student_no || st?.studentNo || 'N/A',
                prelim: { exam: 80, quiz: 80, activities: 80, computedTermGrade: 80 },
                midterm: { exam: 82, quiz: 82, activities: 82, computedTermGrade: 82 },
                final: { exam: 85, quiz: 85, activities: 85, computedTermGrade: 85 },
                average: 82.3,
                status: 'On Track',
              })
            }
          }
          return { ...current, [classId]: updatedSheet }
        })
      }

      addActivityLog('Administrator', `Updated class record and assignments`, 'Subjects & Classes')
      try {
        await dbClasses.update(classId, classData)
      } catch (err) {
        console.warn('DB class update fallback:', err)
      }
    } catch (error) {
      console.error('Failed to update class:', error)
    }
  }

  async function deleteClass(classId: string) {
    try {
      const cls = classes.find((c) => c.id === classId)
      setClasses((current) => current.filter((c) => c.id !== classId))
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
        addActivityLog('Administrator', `Deleted class record: ${cls.subject?.title || 'Class'}`, 'Subjects & Classes')
      }
      try {
        await dbClasses.delete(classId)
      } catch {}
    } catch (error) {
      console.error('Failed to delete class:', error)
    }
  }

  async function createClassFromSubject(subject: Subject) {
    try {
      const defaultInstructor = instructors[0]?.id ?? users[1]?.id ?? ''
      const enrolledStudents = students.slice(0, 5).map((s) => s.id)

      await createClass({
        subject_id: subject.id,
        section_id: 'sec-gen',
        instructor_id: defaultInstructor,
        room: `Room ${201 + classes.length}`,
        schedule: 'MWF 10:00 AM - 11:30 AM',
        studentIds: enrolledStudents,
        section: {
          id: 'sec-gen',
          name: `${subject.code} - Section A`,
          course: 'BSIT',
          year_level: 2,
          school_year: settings.schoolYear,
          semester: settings.semester,
          created_at: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Failed to create class from subject:', error)
    }
  }

  function updateGrade(classId: string, studentId: string, field: keyof GradeRow, value: number) {
    setGrades((current) => {
      const existing = current[classId] ?? []
      const updated = existing.map((row) => (row.studentId === studentId ? { ...row, [field]: value } : row))
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

  function updateAssessmentGrade(
    classId: string,
    studentId: string,
    field: string,
    value: number,
  ) {
    const cls = classes.find((c) => c.id === classId)
    const hasLab = cls?.subject?.has_laboratory ?? false

    setDetailedGradingSheets((current) => {
      const classSheet = current[classId] ?? []
      const updatedSheet = classSheet.map((item) => {
        if (item.studentId !== studentId) return item

        const updatedItem = {
          ...item,
          [field]: value,
        }

        // Recalculate subject average based on template formula
        const newAverage = computeTemplateSubjectAverage(updatedItem, hasLab)
        updatedItem.average = newAverage

        let status: any = 'Average'
        if (newAverage >= 90) status = 'Excellent'
        else if (newAverage >= 83) status = 'Good'
        else if (newAverage >= 75) status = 'Average'
        else if (newAverage >= 70) status = 'At Risk'
        else status = 'Bound to Fail'
        updatedItem.status = status

        // Keep prelim term grade synced if applicable
        if (updatedItem.prelim) {
          updatedItem.prelim = {
            ...updatedItem.prelim,
            exam: field === 'prelimExam' ? value : updatedItem.prelim.exam,
            quiz: field === 'quiz' ? value : updatedItem.prelim.quiz,
            activities: field === 'activity' ? value : updatedItem.prelim.activities,
            attendance: field === 'attendance' ? value : updatedItem.attendance,
            participation: field === 'participation' ? value : updatedItem.participation,
            labExam: field === 'labExam' ? value : updatedItem.labExam,
            computedTermGrade: Math.round(newAverage),
          }
        }

        return updatedItem
      })

      return { ...current, [classId]: updatedSheet }
    })

    // Also sync with main GradeRow
    const syncField: keyof GradeRow =
      field === 'prelimExam' || field === 'midterm'
        ? 'midtermExam'
        : field === 'final'
        ? 'finalExam'
        : field === 'quiz'
        ? 'quizzes'
        : field === 'attendance'
        ? 'attendance'
        : field === 'participation'
        ? 'participation'
        : field === 'labExam'
        ? 'labExam'
        : 'activities'
    updateGrade(classId, studentId, syncField, value)

    // Persist grade summary to Supabase if valid UUID
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classId) &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)
    ) {
      const clsSheet = detailedGradingSheets[classId] || []
      const currRow = clsSheet.find((r) => r.studentId === studentId)
      if (currRow) {
        dbGradeSummaries.upsert({
          id: crypto.randomUUID(),
          class_id: classId,
          student_id: studentId,
          overall_grade: currRow.average,
          remarks: currRow.status,
          computed_at: new Date().toISOString(),
        }).catch((err) => console.warn('Supabase grade summary sync notice:', err))
      }
    }
  }

  function updateDetailedGrade(
    classId: string,
    studentId: string,
    periodOrField: any,
    fieldOrValue: any,
    valueOptional?: number,
  ) {
    if (typeof valueOptional === 'number') {
      const field = fieldOrValue === 'exam' ? 'prelimExam' : fieldOrValue === 'activities' ? 'activity' : fieldOrValue
      updateAssessmentGrade(classId, studentId, field, valueOptional)
    } else {
      updateAssessmentGrade(classId, studentId, periodOrField, fieldOrValue)
    }
  }

  function generateReport(type: any, activeUserName: string) {
    const report: Report = {
      id: crypto.randomUUID(),
      type: type as any,
      title: `${type} - ${selectedClass ? getSubjectTitle(subjects, selectedClass.subject_id) : 'Schoolwide'}`,
      generated_by: activeUserName || 'System',
      created_at: new Date().toLocaleString(),
    }
    setReports((current) => [report, ...current])
    addActivityLog(activeUserName || 'User', `Generated official report: ${report.title}`, 'Reports')
    addNotification({
      title: 'Report generated',
      message: `${report.title} is now compiled and ready for print or export.`,
      role: 'all',
      category: 'report',
    })
  }

  function reportText() {
    const lines = [
      'Trackademic Academic & Prediction Report',
      `School Year: ${settings.schoolYear} | ${settings.semester}`,
      `Class: ${selectedClass ? getSubjectTitle(subjects, selectedClass.subject_id) : 'N/A'}`,
      `Room: ${selectedClass?.room ?? 'N/A'}`,
      `Schedule: ${selectedClass?.schedule ?? 'N/A'}`,
      `Generated by: System`,
      '',
      'Student,Prelim,Midterm,Final,Overall Grade,GPA,Prediction Status,Required Final Exam Score',
      ...gradebook.map((item) =>
        [
          item.student?.name ?? item.student?.student_no ?? 'Student',
          item.computed.preliminary,
          item.computed.midterm,
          item.computed.final,
          `${item.computed.overall}%`,
          item.computed.gpaEquiv,
          item.computed.status,
          item.computed.requiredFinalScore,
        ].join(','),
      ),
    ]
    return lines.join('\n')
  }

  function printClassGradeReportTrigger(classIdToPrint?: string) {
    const clsId = classIdToPrint || selectedClass?.id
    if (!clsId) return
    const cls = classes.find((c) => c.id === clsId)
    if (!cls) return
    const subj = subjects.find((s) => s.id === cls.subject_id)
    const inst = instructors.find((i) => i.id === cls.instructor_id)
    const classSheet = detailedGradingSheets[clsId] || []

    const studentRows: PrintClassStudentRow[] = classSheet.map((item) => {
      const matchedStudent = students.find((s) => s.id === item.studentId)
      return {
        studentName: item.studentName || matchedStudent?.name || 'Student',
        studentNo: item.studentNo || matchedStudent?.student_no,
        prelimExam: item.prelimExam || item.prelim?.exam || 0,
        quiz: item.quiz || item.prelim?.quiz || 0,
        activity: item.activity || item.prelim?.activities || 0,
        attendance: item.attendance ?? 85,
        participation: item.participation ?? 85,
        labExam: subj?.has_laboratory ? (item.labExam ?? 0) : null,
        midterm: item.midterm || item.prelimExam || 0,
        final: item.final || item.prelimExam || 0,
        average: item.average || 0,
        status: item.status || 'Average',
      }
    })

    printClassGradeReport({
      subjectCode: subj?.code || 'SUBJ',
      subjectTitle: subj?.title || 'Subject Title',
      hasLaboratory: subj?.has_laboratory ?? false,
      sectionName: cls.section?.name || 'BSIT-2A',
      instructorName: inst?.name || 'Trainer',
      schedule: cls.schedule || 'TBA',
      room: cls.room || 'Room 201',
      schoolYear: `${settings.schoolYear} (${settings.semester})`,
      students: studentRows,
    })
  }

  function printStudentGradingBookReportTrigger(studentIdToPrint?: string) {
    const stId = studentIdToPrint || 'stud-3'
    const student = students.find((s) => s.id === stId) || students[0]
    const templateData = studentTemplateRecords[stId] || studentTemplateRecords['stud-3']

    printStudentGradingBookReport({
      studentName: student?.name || templateData.studentName || 'Student Name',
      section: student?.section_label || templateData.section || 'BSIT-2A',
      schoolYear: `${settings.schoolYear} (${settings.semester})`,
      rows: templateData.rows,
      overallAverage: Number(
        (templateData.rows.reduce((sum, r) => sum + r.subjectAverage, 0) / templateData.rows.length).toFixed(1),
      ),
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
    classes,
    setClasses,
    grades,
    setGrades,
    detailedGradingSheets,
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
    handleSaveUser,
    handleSaveStudent,
    deleteStudent,
    handleSaveSubject,
    deleteSubject,
    createClass,
    updateClass,
    deleteClass,
    createClassFromSubject,
    updateGrade,
    updateDetailedGrade,
    updateAssessmentGrade,
    generateReport,
    reportText,
    printReport,
    printStudentGradingBookReport: printStudentGradingBookReportTrigger,
    printClassGradeReport: printClassGradeReportTrigger,
    studentTemplateRecords,
    markNotificationRead,
    enrollStudentInClasses,
    addNotification,
    addActivityLog,
    updateSettings,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
