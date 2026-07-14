import type { Subject, GradeRow, PredictionStatus } from './types'

export function clampScore(value: string) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 0
  return Math.max(0, Math.min(100, parsed))
}

export function getSubjectTitle(subjects: Subject[], subjectId: number) {
  return subjects.find((subject) => subject.id === subjectId)?.title ?? 'Unassigned subject'
}

export function computeGrade(row: GradeRow) {
  const preliminary = Math.round(row.quizzes * 0.4 + row.assignments * 0.3 + row.activities * 0.3)
  const midterm = Math.round(preliminary * 0.4 + row.midtermExam * 0.6)
  const final = Math.round(preliminary * 0.25 + midterm * 0.25 + row.finalExam * 0.5)
  const overall = Math.round(preliminary * 0.3 + midterm * 0.3 + final * 0.4)
  const trendScore = Math.round(overall * 0.75 + row.historical * 0.25)
  return { preliminary, midterm, final, overall, status: getPrediction(trendScore) }
}

export function getPrediction(score: number): PredictionStatus {
  if (score >= 90) return 'Excellent'
  if (score >= 83) return 'Good'
  if (score >= 75) return 'Average'
  return 'At Risk'
}

export function nextId(items: { id: number }[]) {
  return Math.max(0, ...items.map((item) => item.id)) + 1
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
