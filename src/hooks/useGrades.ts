import { useData } from '../context/DataContext'

export function useGrades() {
  const {
    grades,
    setGrades,
    selectedGrades,
    gradebook,
    allComputedRows,
    atRiskRows,
    averagePerformance,
    updateGrade,
  } = useData()

  return {
    grades,
    setGrades,
    selectedGrades,
    gradebook,
    allComputedRows,
    atRiskRows,
    averagePerformance,
    updateGrade,
  }
}
