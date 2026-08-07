import type { Subject, GradeRow, PredictionStatus, PredictionAnalysis, ClassAverages } from './types'

export function clampScore(value: string) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 0
  return Math.max(0, Math.min(100, parsed))
}

export function getSubjectTitle(subjects: Subject[], subjectId: string | number) {
  return subjects.find((subject) => subject.id === subjectId || subject.id === String(subjectId))?.title ?? 'Unassigned subject'
}

export function getGPAEquivalent(score: number): string {
  if (score >= 96) return '1.00'
  if (score >= 91.5) return '1.25'
  if (score >= 87) return '1.50'
  if (score >= 82.5) return '1.75'
  if (score >= 78) return '2.00'
  if (score >= 73.5) return '2.25'
  if (score >= 70) return '2.50'
  if (score >= 65) return '2.75'
  if (score >= 60) return '3.00'
  return '5.00'
}

export function getPrediction(overall: number, trendScore: number): PredictionStatus {
  if (overall < 74 || trendScore < 74) return 'Bound to Fail'
  if (overall < 75 || trendScore < 75) return 'At Risk'
  if (overall >= 90) return 'Excellent'
  if (overall >= 83) return 'Good'
  return 'Average'
}

export function computeGrade(row: GradeRow): PredictionAnalysis {
  const preliminary = Math.round(row.quizzes * 0.4 + row.assignments * 0.3 + row.activities * 0.3)
  const midterm = Math.round(preliminary * 0.4 + row.midtermExam * 0.6)
  const final = Math.round(preliminary * 0.25 + midterm * 0.25 + row.finalExam * 0.5)
  const overall = Math.round(preliminary * 0.3 + midterm * 0.3 + final * 0.4)
  const trendScore = Math.round(overall * 0.75 + row.historical * 0.25)
  
  const status = getPrediction(overall, trendScore)
  const gpaEquiv = getGPAEquivalent(overall)

  // Identify risk factors
  const riskFactors: string[] = []
  if (row.quizzes < 75) riskFactors.push(`Low Quizzes average (${row.quizzes}%)`)
  if (row.assignments < 75) riskFactors.push(`Low Assignments average (${row.assignments}%)`)
  if (row.activities < 75) riskFactors.push(`Low Activities average (${row.activities}%)`)
  if (row.midtermExam < 75) riskFactors.push(`Sub-par Midterm Exam (${row.midtermExam}%)`)
  if (row.historical < 75) riskFactors.push(`Weak historical performance (${row.historical}%)`)
  if (riskFactors.length === 0 && (status === 'At Risk' || status === 'Bound to Fail')) {
    riskFactors.push(`Borderline overall grade trend (${overall}%)`)
  }

  // Calculate required Final Exam score to reach passing grade (75 overall)
  // overall = prelim * 0.3 + midterm * 0.3 + (prelim*0.25 + midterm*0.25 + finalExam*0.5)*0.4
  // 75 = prelim*0.4 + midterm*0.4 + finalExam*0.2
  // 0.2 * finalExam = 75 - 0.4*prelim - 0.4*midterm
  // finalExam = (75 - 0.4*prelim - 0.4*midterm) / 0.2
  const targetFinalExam = Math.max(0, Math.min(100, Math.ceil((75 - 0.4 * preliminary - 0.4 * midterm) / 0.2)))
  const requiredFinalScore = Number.isNaN(targetFinalExam) ? 75 : targetFinalExam

  // Confidence level (0-100%)
  let confidence = 85
  if (status === 'Bound to Fail') confidence = 92
  else if (status === 'At Risk') confidence = 88
  else if (status === 'Excellent') confidence = 95

  // Recommendations
  let recommendation = 'Performance is on track. Maintain current study habits.'
  if (status === 'Bound to Fail') {
    recommendation = 'CRITICAL: Urgent remedial tutoring, mandatory consultation with instructor, and retaking missed quizzes/activities required.'
  } else if (status === 'At Risk') {
    recommendation = 'WARNING: Student needs at least ' + requiredFinalScore + '% in Final Exam to secure a passing grade. Recommend peer study group & instructor guidance.'
  }

  return {
    preliminary,
    midterm,
    final,
    overall,
    gpaEquiv,
    status,
    confidence,
    riskFactors,
    requiredFinalScore,
    recommendation,
  }
}

export function computeClassAverages(
  rows: { row: GradeRow; computed: PredictionAnalysis }[]
): ClassAverages {
  if (rows.length === 0) {
    return {
      quizzesAvg: 0,
      assignmentsAvg: 0,
      activitiesAvg: 0,
      midtermAvg: 0,
      finalAvg: 0,
      overallAvg: 0,
      gpaAvg: 'N/A',
      totalStudents: 0,
      atRiskCount: 0,
      boundToFailCount: 0,
      safeCount: 0,
    }
  }

  const total = rows.length
  const quizzesAvg = Math.round(rows.reduce((sum, r) => sum + r.row.quizzes, 0) / total)
  const assignmentsAvg = Math.round(rows.reduce((sum, r) => sum + r.row.assignments, 0) / total)
  const activitiesAvg = Math.round(rows.reduce((sum, r) => sum + r.row.activities, 0) / total)
  const midtermAvg = Math.round(rows.reduce((sum, r) => sum + r.row.midtermExam, 0) / total)
  const finalAvg = Math.round(rows.reduce((sum, r) => sum + r.row.finalExam, 0) / total)
  const overallAvg = Math.round(rows.reduce((sum, r) => sum + r.computed.overall, 0) / total)
  const gpaAvg = getGPAEquivalent(overallAvg)

  const boundToFailCount = rows.filter((r) => r.computed.status === 'Bound to Fail').length
  const atRiskCount = rows.filter((r) => r.computed.status === 'At Risk').length
  const safeCount = total - boundToFailCount - atRiskCount

  return {
    quizzesAvg,
    assignmentsAvg,
    activitiesAvg,
    midtermAvg,
    finalAvg,
    overallAvg,
    gpaAvg,
    totalStudents: total,
    atRiskCount,
    boundToFailCount,
    safeCount,
  }
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

