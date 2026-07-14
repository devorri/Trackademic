import React, { createContext, useState, useMemo, useContext } from 'react'
import type { User, Student, Subject, ClassRecord, GradeRow, Report, DashboardSection } from '../utils/types'
import { initialUsers, initialStudents, initialSubjects, initialClasses, initialGrades } from '../data/initialData'
import { nextId, computeGrade, getSubjectTitle } from '../utils/helpers'

export const blankUser: Omit<User, 'id'> = {
  name: '',
  email: '',
  role: 'Student',
  status: 'Active',
}

export const blankStudent: Omit<Student, 'id'> = {
  name: '',
  email: '',
  studentNo: '',
  course: '',
  section: '',
}

export const blankSubject: Omit<Subject, 'id'> = {
  code: '',
  title: '',
  units: 3,
}

interface DataContextType {
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  students: Student[]
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>
  subjects: Subject[]
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>
  classes: ClassRecord[]
  setClasses: React.Dispatch<React.SetStateAction<ClassRecord[]>>
  grades: Record<number, GradeRow[]>
  setGrades: React.Dispatch<React.SetStateAction<Record<number, GradeRow[]>>>
  reports: Report[]
  setReports: React.Dispatch<React.SetStateAction<Report[]>>
  
  searchTerm: string
  setSearchTerm: (term: string) => void
  userForm: Omit<User, 'id'>
  setUserForm: React.Dispatch<React.SetStateAction<Omit<User, 'id'>>>
  editingUserId: number | null
  setEditingUserId: (id: number | null) => void
  studentForm: Omit<Student, 'id'>
  setStudentForm: React.Dispatch<React.SetStateAction<Omit<Student, 'id'>>>
  editingStudentId: number | null
  setEditingStudentId: (id: number | null) => void
  subjectForm: Omit<Subject, 'id'>
  setSubjectForm: React.Dispatch<React.SetStateAction<Omit<Subject, 'id'>>>
  editingSubjectId: number | null
  setEditingSubjectId: (id: number | null) => void
  selectedClassId: number
  setSelectedClassId: (id: number) => void
  activeSection: DashboardSection
  setActiveSection: (section: DashboardSection) => void

  selectedClass: ClassRecord | undefined
  selectedGrades: GradeRow[]
  gradebook: any[]
  allComputedRows: any[]
  atRiskRows: any[]
  averagePerformance: number
  filteredStudents: Student[]
  
  handleSaveUser: (event: React.FormEvent) => void
  handleSaveStudent: (event: React.FormEvent) => void
  handleSaveSubject: (event: React.FormEvent) => void
  updateGrade: (classId: number, studentId: number, field: keyof GradeRow, value: number) => void
  generateReport: (type: string, activeUserName: string) => void
  createClassFromSubject: (subject: Subject) => void
  reportText: () => string
  printReport: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [classes, setClasses] = useState<ClassRecord[]>(initialClasses)
  const [grades, setGrades] = useState<Record<number, GradeRow[]>>(initialGrades)
  const [reports, setReports] = useState<Report[]>([])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [userForm, setUserForm] = useState<Omit<User, 'id'>>(blankUser)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [studentForm, setStudentForm] = useState<Omit<Student, 'id'>>(blankStudent)
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null)
  const [subjectForm, setSubjectForm] = useState<Omit<Subject, 'id'>>(blankSubject)
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<number>(initialClasses[0]?.id || 0)
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')

  const selectedClass = useMemo(() => 
    classes.find((classItem) => classItem.id === selectedClassId) ?? classes[0]
  , [classes, selectedClassId])

  const selectedGrades = useMemo(() => 
    grades[selectedClass?.id] ?? []
  , [grades, selectedClass?.id])

  const gradebook = useMemo(() =>
    selectedGrades.map((row) => ({
      ...row,
      student: students.find((student) => student.id === row.studentId),
      computed: computeGrade(row),
    }))
  , [selectedGrades, students])

  const allComputedRows = useMemo(() =>
    classes.flatMap((classItem) =>
      (grades[classItem.id] ?? []).map((row) => ({
        classItem,
        row,
        student: students.find((student) => student.id === row.studentId),
        computed: computeGrade(row),
      }))
    )
  , [classes, grades, students])

  const atRiskRows = useMemo(() => 
    allComputedRows.filter((item) => item.computed.status === 'At Risk')
  , [allComputedRows])

  const averagePerformance = useMemo(() => 
    allComputedRows.length > 0
      ? Math.round(allComputedRows.reduce((sum, item) => sum + item.computed.overall, 0) / allComputedRows.length)
      : 0
  , [allComputedRows])

  const filteredStudents = useMemo(() => 
    students.filter((student) =>
      [student.name, student.email, student.studentNo, student.course, student.section]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  , [students, searchTerm])

  function handleSaveUser(event: React.FormEvent) {
    event.preventDefault()
    if (!userForm.name || !userForm.email) return
    if (editingUserId) {
      setUsers((current) => current.map((user) => (user.id === editingUserId ? { ...user, ...userForm } : user)))
    } else {
      setUsers((current) => [...current, { id: nextId(current), ...userForm }])
    }
    setUserForm(blankUser)
    setEditingUserId(null)
  }

  function handleSaveStudent(event: React.FormEvent) {
    event.preventDefault()
    if (!studentForm.name || !studentForm.studentNo) return
    if (editingStudentId) {
      setStudents((current) =>
        current.map((student) => (student.id === editingStudentId ? { ...student, ...studentForm } : student)),
      )
    } else {
      setStudents((current) => [...current, { id: nextId(current), ...studentForm }])
    }
    setStudentForm(blankStudent)
    setEditingStudentId(null)
  }

  function handleSaveSubject(event: React.FormEvent) {
    event.preventDefault()
    if (!subjectForm.code || !subjectForm.title) return
    if (editingSubjectId) {
      setSubjects((current) =>
        current.map((subject) => (subject.id === editingSubjectId ? { ...subject, ...subjectForm } : subject)),
      )
    } else {
      setSubjects((current) => [...current, { id: nextId(current), ...subjectForm }])
    }
    setSubjectForm(blankSubject)
    setEditingSubjectId(null)
  }

  function updateGrade(classId: number, studentId: number, field: keyof GradeRow, value: number) {
    setGrades((current) => ({
      ...current,
      [classId]: (current[classId] ?? []).map((row) => (row.studentId === studentId ? { ...row, [field]: value } : row)),
    }))
  }

  function generateReport(type: any, activeUserName: string) {
    const report: Report = {
      id: Date.now(),
      type,
      title: `${type} - ${selectedClass ? getSubjectTitle(subjects, selectedClass.subjectId) : 'Schoolwide'}`,
      generatedBy: activeUserName || 'System',
      generatedAt: new Date().toLocaleString(),
    }
    setReports((current) => [report, ...current])
  }

  function createClassFromSubject(subject: Subject) {
    const newClass: ClassRecord = {
      id: nextId(classes),
      subjectId: subject.id,
      section: `${studentForm.course || 'BSIT'} ${studentForm.section || classes.length + 1}`,
      instructor: users.find((user) => user.role === 'Instructor' && user.status === 'Active')?.name ?? 'Unassigned',
      room: `Room ${200 + classes.length}`,
      schedule: 'TBA',
      studentIds: students.slice(0, 4).map((student) => student.id),
    }
    setClasses((current) => [...current, newClass])
    setGrades((current) => ({
      ...current,
      [newClass.id]: newClass.studentIds.map((studentId) => ({
        studentId,
        quizzes: 0,
        assignments: 0,
        activities: 0,
        midtermExam: 0,
        finalExam: 0,
        historical: 75,
      })),
    }))
  }

  function reportText() {
    const lines = [
      'Trackademic Report',
      `Class: ${selectedClass ? getSubjectTitle(subjects, selectedClass.subjectId) : 'N/A'}`,
      `Section: ${selectedClass?.section ?? 'N/A'}`,
      `Generated by: System`,
      '',
      'Student,Preliminary,Midterm,Final,Overall,Prediction',
      ...gradebook.map((item) =>
        [
          item.student?.name ?? 'Unknown',
          item.computed.preliminary,
          item.computed.midterm,
          item.computed.final,
          item.computed.overall,
          item.computed.status,
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

  return (
    <DataContext.Provider
      value={{
        users,
        setUsers,
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
        selectedClass,
        selectedGrades,
        gradebook,
        allComputedRows,
        atRiskRows,
        averagePerformance,
        filteredStudents,
        handleSaveUser,
        handleSaveStudent,
        handleSaveSubject,
        updateGrade,
        generateReport,
        createClassFromSubject,
        reportText,
        printReport,
      }}
    >
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
