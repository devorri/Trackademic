import type {
  Subject,
  GradeRow,
  PredictionStatus,
  PredictionAnalysis,
  ClassAverages,
  DetailedTermScores,
} from './types'

export function clampScore(value: string) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 0
  return Math.max(0, Math.min(100, parsed))
}

export function normalizeCourseSection(
  course?: string,
  sectionLabel?: string,
): { course: 'CIT'; section_label: 'A' | 'B'; display: 'CIT A' | 'CIT B' } {
  const combined = `${course || ''} ${sectionLabel || ''}`.trim().toUpperCase()
  const isSectionB =
    sectionLabel?.trim().toUpperCase() === 'B' ||
    combined.endsWith('B') ||
    combined.includes('CIT B') ||
    combined.includes('CIT-B')
  const section_label: 'A' | 'B' = isSectionB ? 'B' : 'A'
  return {
    course: 'CIT',
    section_label,
    display: `CIT ${section_label}`,
  }
}

export function formatCourseSection(course?: string, sectionLabel?: string): 'CIT A' | 'CIT B' {
  return normalizeCourseSection(course, sectionLabel).display
}

export function getSubjectTitle(subjects: Subject[], subjectId: string | number) {
  return (
    subjects.find((subject) => subject.id === subjectId || subject.id === String(subjectId))?.title ??
    'Unassigned subject'
  )
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

export function computeTermGrade(
  term: {
    attendance?: number
    quiz?: number
    labActivity?: number | null
    activity?: number
    activities?: number
    exam?: number
    labExam?: number | null
  },
  hasLaboratory: boolean = true,
): number {
  const attendance = typeof term.attendance === 'number' ? term.attendance : 0
  const quiz = typeof term.quiz === 'number' ? term.quiz : 0
  const activity =
    typeof term.activity === 'number'
      ? term.activity
      : typeof term.activities === 'number'
      ? term.activities
      : 0
  const exam = typeof term.exam === 'number' ? term.exam : 0
  const rawLab = term.labActivity !== undefined ? term.labActivity : term.labExam

  if (hasLaboratory && typeof rawLab === 'number') {
    // Weighted term computation with Lab Activity:
    // Attendance (10%) + Quiz (20%) + Lab Activity (20%) + Activity (10%) + Exam (40%) = 100%
    const weighted =
      attendance * 0.1 + quiz * 0.2 + rawLab * 0.2 + activity * 0.1 + exam * 0.4
    return Number(weighted.toFixed(1))
  }

  // Lecture-only term computation:
  // Attendance (10%) + Quiz (25%) + Activity (25%) + Exam (40%) = 100%
  const weighted = attendance * 0.1 + quiz * 0.25 + activity * 0.25 + exam * 0.4
  return Number(weighted.toFixed(1))
}

export function computeOverallFromTerms(
  prelimGrade: number,
  midtermGrade: number,
  finalGrade: number,
): number {
  const active = [
    { grade: prelimGrade, weight: 0.3 },
    { grade: midtermGrade, weight: 0.3 },
    { grade: finalGrade, weight: 0.4 },
  ].filter((t) => typeof t.grade === 'number' && t.grade > 0)

  if (active.length === 0) return 0
  const totalWeight = active.reduce((sum, t) => sum + t.weight, 0)
  const weightedSum = active.reduce((sum, t) => sum + t.grade * t.weight, 0)
  return Number((weightedSum / totalWeight).toFixed(1))
}

export function ensureTermScores(
  rawTerm: any,
  fallbackBase: number = 82,
  hasLaboratory: boolean = true,
): DetailedTermScores {
  if (typeof rawTerm === 'number') {
    const base = rawTerm || fallbackBase
    const attendance = Math.min(100, base + 4)
    const quiz = base
    const labActivity = hasLaboratory ? base + 1 : null
    const activity = Math.min(100, base + 2)
    const exam = base
    const computedTermGrade = computeTermGrade(
      { attendance, quiz, labActivity, activity, exam },
      hasLaboratory,
    )
    return {
      attendance,
      quiz,
      labActivity,
      activity,
      exam,
      computedTermGrade,
      activities: activity,
      labExam: labActivity,
    }
  }

  const attendance = typeof rawTerm?.attendance === 'number' ? rawTerm.attendance : fallbackBase + 4
  const quiz = typeof rawTerm?.quiz === 'number' ? rawTerm.quiz : fallbackBase
  const activity =
    typeof rawTerm?.activity === 'number'
      ? rawTerm.activity
      : typeof rawTerm?.activities === 'number'
      ? rawTerm.activities
      : fallbackBase + 2
  const exam = typeof rawTerm?.exam === 'number' ? rawTerm.exam : fallbackBase
  const rawLab =
    rawTerm?.labActivity !== undefined
      ? rawTerm.labActivity
      : rawTerm?.labExam !== undefined
      ? rawTerm.labExam
      : hasLaboratory
      ? fallbackBase + 1
      : null
  const labActivity = hasLaboratory ? (typeof rawLab === 'number' ? rawLab : fallbackBase) : null

  const computedTermGrade = computeTermGrade(
    { attendance, quiz, labActivity, activity, exam },
    hasLaboratory,
  )

  return {
    attendance,
    quiz,
    labActivity,
    activity,
    exam,
    computedTermGrade,
    activities: activity,
    labExam: labActivity,
  }
}

export function computeTemplateSubjectAverage(
  scores: {
    prelim?: any
    midterm?: any
    final?: any
    prelimExam?: number
    quiz?: number
    activity?: number
    attendance?: number
    participation?: number
    labExam?: number | null
  },
  hasLaboratory: boolean,
): number {
  if (
    scores.prelim &&
    typeof scores.prelim === 'object' &&
    scores.midterm &&
    typeof scores.midterm === 'object' &&
    scores.final &&
    typeof scores.final === 'object'
  ) {
    const pGrade = computeTermGrade(scores.prelim, hasLaboratory)
    const mGrade = computeTermGrade(scores.midterm, hasLaboratory)
    const fGrade = computeTermGrade(scores.final, hasLaboratory)
    return computeOverallFromTerms(pGrade, mGrade, fGrade)
  }

  const values: number[] = []
  if (typeof scores.prelimExam === 'number' && scores.prelimExam > 0) values.push(scores.prelimExam)
  if (typeof scores.quiz === 'number' && scores.quiz > 0) values.push(scores.quiz)
  if (typeof scores.activity === 'number' && scores.activity > 0) values.push(scores.activity)
  if (typeof scores.attendance === 'number' && scores.attendance > 0) values.push(scores.attendance)
  if (typeof scores.participation === 'number' && scores.participation > 0) values.push(scores.participation)
  if (hasLaboratory && typeof scores.labExam === 'number' && scores.labExam > 0) values.push(scores.labExam)
  if (typeof scores.midterm === 'number' && scores.midterm > 0) values.push(scores.midterm)
  if (typeof scores.final === 'number' && scores.final > 0) values.push(scores.final)

  if (values.length === 0) return 0
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length
  return Number(avg.toFixed(1))
}

export function computeGrade(row: GradeRow): PredictionAnalysis {
  let preliminary: number
  let midterm: number
  let final: number

  if (row.prelim && row.midterm && row.final) {
    const hasLab = row.prelim.labActivity !== null && row.prelim.labActivity !== undefined
    preliminary = Math.round(computeTermGrade(row.prelim, hasLab))
    midterm = Math.round(computeTermGrade(row.midterm, hasLab))
    final = Math.round(computeTermGrade(row.final, hasLab))
  } else {
    const attScore = typeof row.attendance === 'number' ? row.attendance : 85
    const labScore = typeof row.labExam === 'number' ? row.labExam : row.activities
    preliminary = Math.round(
      attScore * 0.1 +
        row.quizzes * 0.2 +
        labScore * 0.2 +
        row.activities * 0.1 +
        (row.midtermExam || row.quizzes) * 0.4,
    )
    midterm = Math.round(
      attScore * 0.1 +
        row.quizzes * 0.2 +
        labScore * 0.2 +
        row.activities * 0.1 +
        row.midtermExam * 0.4,
    )
    final = Math.round(
      attScore * 0.1 +
        row.quizzes * 0.2 +
        labScore * 0.2 +
        row.activities * 0.1 +
        row.finalExam * 0.4,
    )
  }

  const overall = Math.round(computeOverallFromTerms(preliminary, midterm, final))
  const trendScore = Math.round(overall * 0.75 + row.historical * 0.25)

  const status = getPrediction(overall, trendScore)
  const gpaEquiv = getGPAEquivalent(overall)

  // Identify risk factors
  const riskFactors: string[] = []
  if (row.quizzes < 75) riskFactors.push(`Low Quizzes average (${row.quizzes}%)`)
  if (row.assignments < 75) riskFactors.push(`Low Assignments average (${row.assignments}%)`)
  if (row.activities < 75) riskFactors.push(`Low Activities average (${row.activities}%)`)
  if (typeof row.attendance === 'number' && row.attendance < 75)
    riskFactors.push(`Critical: Poor Attendance (${row.attendance}%)`)
  if (typeof row.labExam === 'number' && row.labExam < 75)
    riskFactors.push(`Weak Lab Activity score (${row.labExam}%)`)
  if (row.midtermExam < 75) riskFactors.push(`Sub-par Midterm Exam (${row.midtermExam}%)`)
  if (row.historical < 75) riskFactors.push(`Weak historical performance (${row.historical}%)`)
  if (riskFactors.length === 0 && (status === 'At Risk' || status === 'Bound to Fail')) {
    riskFactors.push(`Borderline overall grade trend (${overall}%)`)
  }

  const targetFinalExam = Math.max(0, Math.min(100, Math.ceil((75 - preliminary * 0.3 - midterm * 0.3) / 0.4)))
  const requiredFinalScore = Number.isNaN(targetFinalExam) ? 75 : targetFinalExam

  let confidence = 85
  if (status === 'Bound to Fail') confidence = 92
  else if (status === 'At Risk') confidence = 88
  else if (status === 'Excellent') confidence = 95

  let recommendation = 'Performance is on track. Maintain current study habits.'
  if (status === 'Bound to Fail') {
    recommendation =
      'CRITICAL: Urgent remedial tutoring, mandatory consultation with instructor, and retaking missed quizzes/activities required.'
  } else if (status === 'At Risk') {
    recommendation =
      'WARNING: Student needs at least ' +
      requiredFinalScore +
      '% in Final term to secure a passing grade. Recommend peer study group & instructor guidance.'
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
  rows: { row: GradeRow; computed: PredictionAnalysis }[],
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
  const midtermAvg = Math.round(rows.reduce((sum, r) => sum + r.computed.midterm, 0) / total)
  const finalAvg = Math.round(rows.reduce((sum, r) => sum + r.computed.final, 0) / total)
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
