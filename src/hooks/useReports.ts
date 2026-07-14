import { useData } from '../context/DataContext'

export function useReports() {
  const {
    reports,
    setReports,
    generateReport,
    reportText,
    printReport,
  } = useData()

  return {
    reports,
    setReports,
    generateReport,
    reportText,
    printReport,
  }
}
