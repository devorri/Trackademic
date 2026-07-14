import { useData } from '../context/DataContext'

export function useClasses() {
  const {
    subjects,
    setSubjects,
    classes,
    setClasses,
    subjectForm,
    setSubjectForm,
    editingSubjectId,
    setEditingSubjectId,
    selectedClassId,
    setSelectedClassId,
    selectedClass,
    handleSaveSubject,
    createClassFromSubject,
  } = useData()

  return {
    subjects,
    setSubjects,
    classes,
    setClasses,
    subjectForm,
    setSubjectForm,
    editingSubjectId,
    setEditingSubjectId,
    selectedClassId,
    setSelectedClassId,
    selectedClass,
    handleSaveSubject,
    createClassFromSubject,
  }
}
