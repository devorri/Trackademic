import React, { createContext, useState, useMemo, useContext } from 'react'
import type { User, Student, Subject, ClassRecord, GradeRow, Report, DashboardSection, ClassAverages } from '../utils/types'
import { initialUsers, initialStudents, initialSubjects, initialClasses, initialGrades } from '../data/initialData'
import { nextId, computeGrade, computeClassAverages, getSubjectTitle } from '../utils/helpers'

export const blankUser: Omit<User, 'id'> = {
  name: '',
  email: '',
  role: 'Instructor',
  status: 'Active',
  password: '',
}

export const blankStudent: Omit<Student, 'id'> = {
  name: '',
  studentNo: '',
  course: '',
  section: '',
  email: '',
  password: '',
};

export const blankSubject: Omit<Subject, 'id'> = {
  code: '',
  title: '',
  units: 3,
}

export const blankClassForm: Omit<ClassRecord, 'id'> = {
  subjectId: 0,
  section: '',
  instructor: '',
  room: '',
  schedule: '',
  studentIds: [],
}

interface DataContextType {
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  instructors: User[]
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
  selectedClassAverages: ClassAverages
  allComputedRows: any[]
  atRiskRows: any[]
  boundToFailRows: any[]
  averagePerformance: number
  filteredStudents: Student[]
  
  handleSaveUser: (event: React.FormEvent) => void
  handleSaveStudent: (event: React.FormEvent) => void
  deleteStudent: (studentId: number) => void
  handleSaveSubject: (event: React.FormEvent) => void

  createClass: (classData: Omit<ClassRecord, 'id'>) => ClassRecord
  updateClass: (classId: number, classData: Partial<ClassRecord>) => void
  deleteClass: (classId: number) => void
  createClassFromSubject: (subject: Subject) => void
  updateGrade: (classId: number, studentId: number, field: keyof GradeRow, value: number) => void
  generateReport: (type: string, activeUserName: string) => void
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

  const instructors = useMemo(() =>
    users.filter((user) => user.role === 'Instructor' && user.status === 'Active')
  , [users])

  const selectedClass = useMemo(() => 
    classes.find((classItem) => classItem.id === selectedClassId) ?? classes[0]
  , [classes, selectedClassId])

  const selectedGrades = useMemo(() => 
    grades[selectedClass?.id] ?? []
  , [grades, selectedClass?.id])

  const gradebook = useMemo(() =>
    selectedGrades.map((row) => ({
      row,
      student: students.find((student) => student.id === row.studentId),
      computed: computeGrade(row),
    }))
  , [selectedGrades, students])

  const selectedClassAverages = useMemo(() =>
    computeClassAverages(gradebook)
  , [gradebook])

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

  const boundToFailRows = useMemo(() => 
    allComputedRows.filter((item) => item.computed.status === 'Bound to Fail')
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
    const formattedUser = {
      ...userForm,
      email: userForm.email.trim().toLowerCase(),
    }
    if (editingUserId) {
      setUsers((current) =>
        current.map((user) =>
          user.id === editingUserId ? { ...user, ...formattedUser } : user,
        ),
      );
    } else {
      setUsers((current) => [...current, { id: nextId(current), ...formattedUser }]);
    }
    setUserForm(blankUser)
    setEditingUserId(null)
  }

  function handleSaveStudent(event: React.FormEvent) {
    event.preventDefault();
    if (!studentForm.name || !studentForm.studentNo) return;
    
    let savedStudentEmail = studentForm.email?.trim().toLowerCase() || '';

    if (editingStudentId) {
      setStudents((current) =>
        current.map((student) =>
          student.id === editingStudentId ? { ...student, ...studentForm } : student,
        ),
      );
      // Sync user account for student
      if (savedStudentEmail) {
        setUsers((current) => {
          const existing = current.find((u) => u.email.toLowerCase() === savedStudentEmail);
          if (existing) {
            return current.map((u) =>
              u.email.toLowerCase() === savedStudentEmail
                ? { ...u, name: studentForm.name, email: savedStudentEmail, password: studentForm.password }
                : u,
            );
          } else {
            return [
              ...current,
              {
                id: nextId(current),
                name: studentForm.name,
                email: savedStudentEmail,
                role: 'Student',
                status: 'Active',
                password: studentForm.password,
              },
            ];
          }
        });
      }
    } else {
      const newId = nextId(students);
      const newStudent = { id: newId, ...studentForm };
      setStudents((current) => [...current, newStudent]);
      
      // Automatically create student user login account
      if (savedStudentEmail) {
        setUsers((current) => [
          ...current,
          {
            id: nextId(current),
            name: studentForm.name,
            email: savedStudentEmail,
            role: 'Student',
            status: 'Active',
            password: studentForm.password,
          },
        ]);
      }
    }
    setStudentForm(blankStudent);
    setEditingStudentId(null);
  }

  function deleteStudent(studentId: number) {
    const target = students.find((s) => s.id === studentId);
    setStudents((current) => current.filter((s) => s.id !== studentId))
    if (target?.email) {
      setUsers((current) => current.filter((u) => u.email.toLowerCase() !== target.email?.toLowerCase()));
    }
    // Clean up student from all classes
    setClasses((current) =>
      current.map((c) => ({
        ...c,
        studentIds: c.studentIds.filter((id) => id !== studentId),
      }))
    )
    // Clean up student from all class grades
    setGrades((current) => {
      const nextGrades: Record<number, GradeRow[]> = {}
      for (const classIdStr in current) {
        const classId = Number(classIdStr)
        nextGrades[classId] = (current[classId] || []).filter((g) => g.studentId !== studentId)
      }
      return nextGrades
    })
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

  function createClass(classData: Omit<ClassRecord, 'id'>): ClassRecord {
    const newClass: ClassRecord = {
      id: nextId(classes),
      ...classData,
    }
    setClasses((current) => [...current, newClass])
    
    // Initialize grade records for enrolled students
    setGrades((current) => ({
      ...current,
      [newClass.id]: newClass.studentIds.map((studentId) => ({
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
  }

  function updateClass(classId: number, classData: Partial<ClassRecord>) {
    setClasses((current) =>
      current.map((c) => (c.id === classId ? { ...c, ...classData } : c))
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
  }

  function deleteClass(classId: number) {
    setClasses((current) => current.filter((c) => c.id !== classId))
    setGrades((current) => {
      const next = { ...current }
      delete next[classId]
      return next
    })
    if (selectedClassId === classId) {
      const remaining = classes.filter((c) => c.id !== classId)
      setSelectedClassId(remaining[0]?.id || 0)
    }
  }

  function createClassFromSubject(subject: Subject) {
    const defaultInstructor = instructors[0]?.name ?? 'Unassigned'
    const enrolledStudents = students.slice(0, 4).map((s) => s.id)
    createClass({
      subjectId: subject.id,
      section: `${studentForm.course || 'BSIT'} ${classes.length + 1}A`,
      instructor: defaultInstructor,
      room: `Room ${201 + classes.length}`,
      schedule: 'MWF 10:00 AM - 11:30 AM',
      studentIds: enrolledStudents,
    })
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

  function reportText() {
    const lines = [
      'Trackademic Academic & Prediction Report',
      `Class: ${selectedClass ? getSubjectTitle(subjects, selectedClass.subjectId) : 'N/A'}`,
      `Section: ${selectedClass?.section ?? 'N/A'}`,
      `Instructor: ${selectedClass?.instructor ?? 'N/A'}`,
      `Generated by: System`,
      '',
      'Student,Prelim,Midterm,Final,Overall Grade,GPA,Prediction Status,Required Final Exam Score',
      ...gradebook.map((item) =>
        [
          item.student?.name ?? 'Unknown',
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

  return (
    <DataContext.Provider
      value={{
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

