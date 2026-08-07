import React, { createContext, useState, useMemo, useContext, useEffect } from 'react'
import type { User, Student, Subject, ClassRecord, GradeRow, Report, DashboardSection, ClassAverages } from '../utils/types'
import { computeGrade, computeClassAverages, getSubjectTitle } from '../utils/helpers'
import { dbProfiles, dbStudents, dbSubjects, dbClasses, dbSections, dbInstructors, dbGradeComponents, dbGrades } from '../utils/db'

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
  course: '',
  section_label: '',
  name: '',
  email: '',
  password: '',
} as Omit<Student, 'id'>;

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
  reports: Report[]
  setReports: React.Dispatch<React.SetStateAction<Report[]>>
  
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
  generateReport: (type: string, activeUserName: string) => void
  reportText: () => string
  printReport: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Data state
  const [users, setUsers] = useState<User[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classes, setClasses] = useState<ClassRecord[]>([])
  const [grades, setGrades] = useState<Record<string, GradeRow[]>>({})
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [searchTerm, setSearchTerm] = useState('')
  const [userForm, setUserForm] = useState<Omit<User, 'id'>>(blankUser)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [studentForm, setStudentForm] = useState<Omit<Student, 'id'>>(blankStudent)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [subjectForm, setSubjectForm] = useState<Omit<Subject, 'id'>>(blankSubject)
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')

  // Load data from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [profilesData, studentsData, subjectsData, classesData] = await Promise.all([
          dbProfiles.getAll().catch(() => []),
          dbStudents.getAll().catch(() => []),
          dbSubjects.getAll().catch(() => []),
          dbClasses.getAll().catch(() => []),
        ])

        // Convert profiles to users format
        const usersData: User[] = profilesData.map((profile) => ({
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email,
          role: profile.role,
          status: profile.status,
        }))

        setUsers(usersData)
        setStudents(studentsData as any)
        setSubjects(subjectsData)
        setClasses(classesData as any)
        
        if (classesData.length > 0) {
          setSelectedClassId(classesData[0].id)
        }
      } catch (error) {
        console.error('Failed to load data from Supabase:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Computed values
  const instructors = useMemo(
    () =>
      users.filter((user) => user.role === 'instructor' && user.status === 'active'),
    [users],
  )

  const selectedClass = useMemo(
    () => classes.find((classItem) => classItem.id === selectedClassId) ?? classes[0],
    [classes, selectedClassId],
  )

  const selectedGrades = useMemo(() => (selectedClass?.id ? grades[selectedClass.id] ?? [] : []), [grades, selectedClass?.id])

  const gradebook = useMemo(
    () =>
      selectedGrades.map((row) => ({
        row,
        student: students.find((student) => student.id === row.studentId),
        computed: computeGrade(row),
      })),
    [selectedGrades, students],
  )

  const selectedClassAverages = useMemo(
    () => computeClassAverages(gradebook),
    [gradebook],
  )

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

  const atRiskRows = useMemo(() => allComputedRows.filter((item) => item.computed.status === 'At Risk'), [allComputedRows])

  const boundToFailRows = useMemo(() => allComputedRows.filter((item) => item.computed.status === 'Bound to Fail'), [allComputedRows])

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
        [student.student_no, student.course, student.section_label]
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
        // Update profile
        const nameParts = formattedUser.name.split(' ')
        await dbProfiles.update(editingUserId, {
          email: formattedUser.email,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          role: formattedUser.role,
          status: formattedUser.status,
          password_plain: formattedUser.password || '',
        })

        setUsers((current) =>
          current.map((user) =>
            user.id === editingUserId ? { ...user, ...formattedUser } : user,
          ),
        )
      } else {
        // Create new profile
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

        setUsers((current) => [
          ...current,
          {
            id: newProfile.id,
            name: formattedUser.name,
            email: formattedUser.email,
            role: formattedUser.role,
            status: formattedUser.status,
          },
        ])
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
    if (!studentNo) return

    try {
      if (editingStudentId) {
        // Update existing student
        const updateData = {
          ...studentForm,
          student_no: studentNo,
        }
        await dbStudents.update(editingStudentId, updateData)
        setStudents((current) =>
          current.map((student) =>
            student.id === editingStudentId ? { ...student, ...updateData } : student,
          ),
        )
      } else {
        // Create new student - first create profile
        const nameParts = (studentForm.name || '').split(' ')
        const profile = await dbProfiles.create({
          email: studentForm.email || '',
          password_plain: studentForm.password || '',
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          role: 'student',
          status: 'active',
        })

        // Then create student linked to profile
        const newStudent = await dbStudents.create({
          profile_id: profile.id,
          student_no: studentNo,
          course: studentForm.course,
          section_label: studentForm.section_label,
        })

        // Add to users list for UI
        setUsers((current) => [
          ...current,
          {
            id: profile.id,
            name: studentForm.name || '',
            email: studentForm.email || '',
            role: 'student',
            status: 'active',
          },
        ])

        setStudents((current) => [...current, newStudent])
      }

      setStudentForm(blankStudent)
      setEditingStudentId(null)
    } catch (error) {
      console.error('Failed to save student:', error)
    }
  }

  async function deleteStudent(studentId: string) {
    try {
      await dbStudents.delete(studentId)
      setStudents((current) => current.filter((s) => s.id !== studentId))

      // Clean up from all classes
      setClasses((current) =>
        current.map((c) => ({
          ...c,
          studentIds: (c.studentIds || []).filter((id) => id !== studentId),
        })),
      )

      // Clean up from all grades
      setGrades((current) => {
        const nextGrades: Record<string, GradeRow[]> = {}
        for (const classIdStr in current) {
          nextGrades[classIdStr] = (current[classIdStr] || []).filter((g) => g.studentId !== studentId)
        }
        return nextGrades
      })
    } catch (error) {
      console.error('Failed to delete student:', error)
    }
  }

  async function handleSaveSubject(event: React.FormEvent) {
    event.preventDefault()
    if (!subjectForm.code || !subjectForm.title) return

    try {
      if (editingSubjectId) {
        await dbSubjects.update(editingSubjectId, subjectForm)
        setSubjects((current) =>
          current.map((subject) =>
            subject.id === editingSubjectId ? { ...subject, ...subjectForm } : subject,
          ),
        )
      } else {
        const newSubject = await dbSubjects.create(subjectForm)
        setSubjects((current) => [...current, newSubject])
      }

      setSubjectForm(blankSubject)
      setEditingSubjectId(null)
    } catch (error) {
      console.error('Failed to save subject:', error)
    }
  }

  async function createClass(classData: Omit<ClassRecord, 'id' | 'created_at'>): Promise<ClassRecord> {
    try {
      const newClass = await dbClasses.create(classData, classData.studentIds)
      setClasses((current) => [...current, newClass])

      // Create grade components for this class
      const gradeTypes = [
        { name: 'Quizzes', type: 'Preliminary', weight: 15, max_score: 100 },
        { name: 'Assignments', type: 'Preliminary', weight: 15, max_score: 100 },
        { name: 'Activities', type: 'Preliminary', weight: 10, max_score: 100 },
        { name: 'Midterm Exam', type: 'Midterm', weight: 30, max_score: 100 },
        { name: 'Final Exam', type: 'Final', weight: 30, max_score: 100 },
      ]

      try {
        for (const gradeType of gradeTypes) {
          await dbGradeComponents.create({
            class_id: newClass.id,
            name: gradeType.name,
            grading_period: gradeType.type as 'Preliminary' | 'Midterm' | 'Final',
            weight: gradeType.weight,
            max_score: gradeType.max_score,
          })
        }
      } catch (componentError) {
        console.error('Failed to create grade components:', componentError)
      }

      // Initialize grade records locally (for UI state)
      setGrades((current) => ({
        ...current,
        [newClass.id]: (classData.studentIds || []).map((studentId) => ({
          studentId,
          quizzes: 75,
          assignments: 75,
          activities: 75,
          midtermExam: 75,
          finalExam: 75,
          historical: 75,
        })),
      }))

      if (!selectedClassId) {
        setSelectedClassId(newClass.id)
      }

      return newClass
    } catch (error) {
      console.error('Failed to create class:', error)
      throw error
    }
  }

  async function updateClass(classId: string, classData: Partial<ClassRecord>) {
    try {
      await dbClasses.update(classId, classData)
      setClasses((current) =>
        current.map((c) => (c.id === classId ? { ...c, ...classData } : c)),
      )

      if (classData.studentIds) {
        // Sync grades for newly added students
        setGrades((current) => {
          const existingGrades = current[classId] ?? []
          const updatedGrades = classData.studentIds!.map((studentId) => {
            const found = existingGrades.find((g) => g.studentId === studentId)
            if (found) return found
            return {
              studentId,
              quizzes: 75,
              assignments: 75,
              activities: 75,
              midtermExam: 75,
              finalExam: 75,
              historical: 75,
            }
          })
          return { ...current, [classId]: updatedGrades }
        })
      }
    } catch (error) {
      console.error('Failed to update class:', error)
    }
  }

  async function deleteClass(classId: string) {
    try {
      await dbClasses.delete(classId)
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
    } catch (error) {
      console.error('Failed to delete class:', error)
    }
  }

  async function createClassFromSubject(subject: Subject) {
    try {
      const defaultInstructor = instructors[0]?.id ?? ''
      const enrolledStudents = students.slice(0, 4).map((s) => s.id)
      
      // Create or get a default section
      const defaultSection = await dbSections.create({
        name: `${subject.code} - Section A`,
        school_year: new Date().getFullYear().toString(),
        semester: '1',
      })

      await createClass({
        subject_id: subject.id,
        section_id: defaultSection.id,
        instructor_id: defaultInstructor,
        room: `Room ${201 + classes.length}`,
        schedule: 'MWF 10:00 AM - 11:30 AM',
        studentIds: enrolledStudents,
      })
    } catch (error) {
      console.error('Failed to create class from subject:', error)
    }
  }

  async function updateGrade(classId: string, studentId: string, field: keyof GradeRow, value: number) {
    // Update local state immediately for responsive UI
    setGrades((current) => ({
      ...current,
      [classId]: (current[classId] ?? []).map((row) =>
        row.studentId === studentId ? { ...row, [field]: value } : row,
      ),
    }))

    // Persist to database asynchronously
    try {
      const fieldToComponentMap: Record<keyof GradeRow, string> = {
        studentId: 'studentId',
        student_name: 'student_name',
        quizzes: 'Quizzes',
        assignments: 'Assignments',
        activities: 'Activities',
        midtermExam: 'Midterm Exam',
        finalExam: 'Final Exam',
        historical: 'historical',
      }

      const componentName = fieldToComponentMap[field]
      if (!componentName || componentName === 'studentId' || componentName === 'student_name' || componentName === 'historical') {
        return // Skip non-grade fields
      }

      // Get grade components for this class
      const components = await dbGradeComponents.getByClassId(classId)
      const component = components.find((c) => c.name === componentName)

      if (component) {
        // Check if grade record exists
        const existingGrades = await dbGrades.getByComponentId(component.id)
        const existingGrade = existingGrades.find((g) => g.student_id === studentId)

        if (existingGrade) {
          // Update existing grade
          await dbGrades.update(existingGrade.id, value)
        } else {
          // Create new grade record
          await dbGrades.create({
            component_id: component.id,
            student_id: studentId,
            score: value,
            encoded_by: 'system',
          })
        }
      }
    } catch (error) {
      console.error('Failed to persist grade to database:', error)
    }
  }

  function generateReport(type: any, activeUserName: string) {
    const report: Report = {
      id: crypto.randomUUID(),
      type: type as any,
      title: `${type} - ${selectedClass ? getSubjectTitle(subjects, selectedClass.subject_id) : 'Schoolwide'}`,
      generated_by: activeUserName || 'System',
      created_at: new Date().toISOString(),
    }
    setReports((current) => [report, ...current])
  }

  function reportText() {
    const lines = [
      'Trackademic Academic & Prediction Report',
      `Class: ${selectedClass ? getSubjectTitle(subjects, selectedClass.subject_id) : 'N/A'}`,
      `Room: ${selectedClass?.room ?? 'N/A'}`,
      `Schedule: ${selectedClass?.schedule ?? 'N/A'}`,
      `Generated by: System`,
      '',
      'Student,Prelim,Midterm,Final,Overall Grade,GPA,Prediction Status,Required Final Exam Score',
      ...gradebook.map((item) =>
        [
          item.student?.student_no ?? 'Unknown',
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
    printable.document.write(`<pre>${reportText()}</pre>`)
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
    reports,
    setReports,
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
    generateReport,
    reportText,
    printReport,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

