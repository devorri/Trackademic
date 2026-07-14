import { useData } from '../context/DataContext'

export function useStudents() {
  const {
    students,
    setStudents,
    searchTerm,
    setSearchTerm,
    studentForm,
    setStudentForm,
    editingStudentId,
    setEditingStudentId,
    filteredStudents,
    handleSaveStudent,
  } = useData()

  return {
    students,
    setStudents,
    searchTerm,
    setSearchTerm,
    studentForm,
    setStudentForm,
    editingStudentId,
    setEditingStudentId,
    filteredStudents,
    handleSaveStudent,
  }
}
