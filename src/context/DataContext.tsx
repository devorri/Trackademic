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
} from '../utils/types'
import { computeGrade, computeClassAverages, getSubjectTitle } from '../utils/helpers'
import {
  dbProfiles,
  dbStudents,
  dbSubjects,
  dbClasses,
  dbInstructors,
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
  createClass: (classData: Omit<ClassRecord, 'id' | 'created_at'>) => Promise<ClassRecord>
  updateClass: (classId: string, classData: Partial<ClassRecord>) => Promise<void>
  deleteClass: (classId: string) => Promise<void>
  createClassFromSubject: (subject: Subject) => Promise<void>
  updateGrade: (classId: string, studentId: string, field: keyof GradeRow, value: number) => void
  updateDetailedGrade: (
    classId: string,
    studentId: string,
    period: 'prelim' | 'midterm' | 'final',
    field: 'exam' | 'quiz' | 'activities',
    value: number,
  ) => void
  generateReport: (type: string, activeUserName: string) => void
  reportText: () => string
  printReport: () => void
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

  // Load data from database on mount if available, else keep rich defaults
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profilesData, studentsData, subjectsData, classesData] = await Promise.all([
          dbProfiles.getAll().catch(() => []),
          dbStudents.getAll().catch(() => []),
          dbSubjects.getAll().catch(() => []),
          dbClasses.getAll().catch(() => []),
        ])

        if (profilesData && profilesData.length > 0) {
          const usersData: User[] = profilesData.map((profile) => ({
            id: profile.id,
            name: `${profile.first_name} ${profile.last_name}`,
            email: profile.email,
            role: profile.role,
            status: profile.status,
          }))
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

        if (studentsData && studentsData.length > 0) {
          setStudents((prev) => {
            const map = new Map<string, Student>()
            prev.forEach((s) => map.set(s.id, s))
            ;(studentsData as any[]).forEach((s) => map.set(s.id, s))
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
            return Array.from(map.values())
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
  const instructors = useMemo(
    () => users.filter((user) => user.role === 'instructor' && user.status === 'active'),
    [users],
  )

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
      classes.flatMap((classItem) =>
        (grades[classItem.id] ?? []).map((row) => ({
          classItem,
          row,
          student: students.find((student) => student.id === row.studentId),
          computed: computeGrade(row),
        })),
      ),
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
        const newStudId = `stud-${crypto.randomUUID().slice(0, 8)}`
        const newUserId = `user-${crypto.randomUUID().slice(0, 8)}`
        const newStudent: Student = {
          id: newStudId,
          profile_id: newUserId,
          student_no: studentNo,
          studentNo: studentNo,
          name: studentForm.name,
          email: studentForm.email,
          course: studentForm.course || 'BSIT',
          section_label: studentForm.section_label || 'BSIT-4A',
          year_level: studentForm.year_level || 4,
          created_at: new Date().toISOString(),
          password: studentForm.password || 'password123',
        }

        setStudents((current) => [newStudent, ...current])
        setUsers((current) => [
          {
            id: newUserId,
            name: studentForm.name || '',
            email: studentForm.email || `${studentNo.toLowerCase()}@example.com`,
            role: 'student',
            status: 'active',
            password: studentForm.password || 'password123',
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

        try {
          const nameParts = (studentForm.name || '').split(' ')
          const profile = await dbProfiles.create({
            email: studentForm.email || '',
            password_plain: studentForm.password || '',
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            role: 'student',
            status: 'active',
          })
          await dbStudents.create({
            profile_id: profile.id,
            student_no: studentNo,
            course: studentForm.course,
            section_label: studentForm.section_label,
          })
        } catch {}
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
      addActivityLog('Administrator', `Updated class record and assignments`, 'Subjects & Classes')
      try {
        await dbClasses.update(classId, classData)
      } catch {}
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

  function updateDetailedGrade(
    classId: string,
    studentId: string,
    period: 'prelim' | 'midterm' | 'final',
    field: 'exam' | 'quiz' | 'activities',
    value: number,
  ) {
    setDetailedGradingSheets((current) => {
      const classSheet = current[classId] ?? []
      const updatedSheet = classSheet.map((item) => {
        if (item.studentId !== studentId) return item

        const updatedPeriod = {
          ...item[period],
          [field]: value,
        }
        // Recalculate term grade: e.g. quiz 30%, activities 30%, exam 40%
        const computedTermGrade = Math.round(
          updatedPeriod.quiz * (settings.quizWeight / 100) +
            updatedPeriod.activities * (settings.activityWeight / 100) +
            updatedPeriod.exam * (settings.examWeight / 100),
        )
        updatedPeriod.computedTermGrade = computedTermGrade

        const prelimGrade = period === 'prelim' ? computedTermGrade : item.prelim.computedTermGrade
        const midtermGrade = period === 'midterm' ? computedTermGrade : item.midterm.computedTermGrade
        const finalGrade = period === 'final' ? computedTermGrade : item.final.computedTermGrade

        const overallAverage = Math.round(
          prelimGrade * (settings.prelimWeight / 100) +
            midtermGrade * (settings.midtermWeight / 100) +
            finalGrade * (settings.finalWeight / 100),
        )

        let status: any = 'Average'
        if (overallAverage >= 90) status = 'Excellent'
        else if (overallAverage >= 83) status = 'Good'
        else if (overallAverage >= 75) status = 'Average'
        else if (overallAverage >= 70) status = 'At Risk'
        else status = 'Bound to Fail'

        return {
          ...item,
          [period]: updatedPeriod,
          average: overallAverage,
          status,
        }
      })

      return { ...current, [classId]: updatedSheet }
    })

    // Also sync with main GradeRow
    const syncField: keyof GradeRow =
      field === 'exam' ? (period === 'final' ? 'finalExam' : 'midtermExam') : field === 'quiz' ? 'quizzes' : 'activities'
    updateGrade(classId, studentId, syncField, value)
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
          item.student?.student_no ?? item.student?.name ?? 'Unknown',
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

  function printReport() {
    const printable = window.open('', '_blank')
    if (!printable) return
    printable.document.write(`<pre style="font-family: monospace; padding: 2rem;">${reportText()}</pre>`)
    printable.document.close()
    printable.print()
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
    createClass,
    updateClass,
    deleteClass,
    createClassFromSubject,
    updateGrade,
    updateDetailedGrade,
    generateReport,
    reportText,
    printReport,
    markNotificationRead,
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
