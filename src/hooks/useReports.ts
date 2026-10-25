import { useData } from '../context/DataContext'

export function useReports() {
  const {
    reports,
    setReports,
    generateReport,
    reportText,
    printReport,
    printStudentGradingBookReport,
    printClassGradeReport,
  } = useData()

  return {
    reports,
    setReports,
    generateReport,
    reportText,
    printReport,
    printStudentGradingBookReport,
    printClassGradeReport,
  }
}
