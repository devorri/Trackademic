import type {
  Subject,
  GradeRow,
  PredictionStatus,
  PredictionAnalysis,
  ClassAverages,
  DetailedTermScores,
  DetailedGradingSheet,
  TermComponentItems,
  TermComponentMaxItems,
} from './types'

export function clampScore(value: string) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 0
  return Math.max(0, Math.min(100, parsed))
}

export function normalizeCourseSection(
  course?: string,
  sectionLabel?: string,
): { course: string; section_label: string; display: string } {
  const rawCourse = (course || '').trim()
  const rawSec = (sectionLabel || '').trim()

  if (!rawCourse && !rawSec) {
    return { course: '', section_label: '', display: 'Unassigned' }
  }

  // Clean delimiters (e.g. "CIT-1A" -> "CIT 1A", "BSIT-1A" -> "BSIT 1A")
  let combined = rawCourse && rawSec ? `${rawCourse} ${rawSec}` : rawCourse || rawSec
  combined = combined.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()

  // Standard program with year & section (e.g. "CIT 1A", "CIT 1B", "BSIT 1A", "BSCS 2B")
  const stdMatch = combined.match(/^([A-Za-z]+)\s*([1-6])\s*([A-Za-z])$/i)
  if (stdMatch) {
    const prog = stdMatch[1].toUpperCase()
    const yr = stdMatch[2]
    const sec = stdMatch[3].toUpperCase()
    return {
      course: prog,
      section_label: `${yr}${sec}`,
      display: `${prog} ${yr}${sec}`,
    }
  }

  // Program with letter only (e.g. "CIT A" -> course: "CIT", section: "A", display: "CIT A")
  const progLetterMatch = combined.match(/^([A-Za-z]+)\s*([A-Za-z])$/i)
  if (progLetterMatch) {
    const prog = progLetterMatch[1].toUpperCase()
    const sec = progLetterMatch[2].toUpperCase()
    return {
      course: prog,
      section_label: sec,
      display: `${prog} ${sec}`,
    }
  }

  // Generic multi-word fallback
  const parts = combined.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const sec = parts[parts.length - 1].toUpperCase()
    const crs = parts.slice(0, -1).join(' ').toUpperCase()
    return { course: crs, section_label: sec, display: `${crs} ${sec}` }
  }

  return { course: combined.toUpperCase(), section_label: '1A', display: `${combined.toUpperCase()} 1A` }
}

export function formatCourseSection(course?: string, sectionLabel?: string): string {
  return normalizeCourseSection(course, sectionLabel).display
}

export type YearLevelOptionGroup = {
  category: string
  options: string[]
}

export const YEAR_LEVEL_GROUPS: YearLevelOptionGroup[] = [
  {
    category: 'College / Higher Education',
    options: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'],
  },
  {
    category: 'Senior High School (SHS)',
    options: ['Grade 11', 'Grade 12'],
  },
  {
    category: 'Junior High School (JHS)',
    options: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
  },
  {
    category: '2-Year Technical / Vocational Course',
    options: ['1st Year (2-Year Course)', '2nd Year (2-Year Course)'],
  },
]

export function mapYearLevelToInt(yearValue?: string | number): number {
  if (typeof yearValue === 'number' && !Number.isNaN(yearValue)) {
    return Math.max(1, Math.min(6, Math.round(yearValue)))
  }
  if (!yearValue) return 1
  const str = String(yearValue).trim()

  // Match Grade 7..12
  const gradeMatch = str.match(/grade\s*(\d+)/i)
  if (gradeMatch) {
    const g = parseInt(gradeMatch[1], 10)
    if (g === 7) return 1
    if (g === 8) return 2
    if (g === 9) return 3
    if (g === 10) return 4
    if (g === 11) return 5
    if (g === 12) return 6
    return Math.max(1, Math.min(6, g))
  }

  // Match 2-year course
  if (str.toLowerCase().includes('2-year')) {
    if (/\b(?:2nd|second)\b/i.test(str) || /^\s*2/i.test(str)) return 2
    return 1
  }

  // Match numeric ordinals
  const numMatch = str.match(/(\d+)/)
  if (numMatch) {
    const n = parseInt(numMatch[1], 10)
    if (n === 12) return 6
    if (n === 11) return 5
    if (n === 10) return 4
    if (n === 9) return 3
    if (n === 8) return 2
    if (n === 7) return 1
    return Math.max(1, Math.min(6, n))
  }

  return 1
}

export function formatYearLevel(yearValue?: string | number, course?: string): string {
  const courseStr = (course || '').trim().toUpperCase()

  // If yearValue is a non-empty string, check if it's already descriptive
  if (typeof yearValue === 'string' && yearValue.trim()) {
    const trimmed = yearValue.trim()
    if (/^(grade\s*\d+|1st\s*year|2nd\s*year|3rd\s*year|4th\s*year|5th\s*year|6th\s*year)/i.test(trimmed)) {
      return trimmed
    }
    if (/grade|jhs|shs|2-year|vocational/i.test(trimmed)) {
      return trimmed
    }
    const parsed = parseInt(trimmed, 10)
    if (!Number.isNaN(parsed) && parsed >= 7 && parsed <= 12) {
      return `Grade ${parsed}`
    }
  }

  // Infer from course if it has SHS or JHS indicators (e.g. "HUMMS 12 A", "STEM 12", "Grade 7")
  if (courseStr) {
    if (/\b(?:GRADE\s*12|HUMMS\s*12|STEM\s*12|ABM\s*12|GAS\s*12|TVL\s*12|12\s*[A-Z]?)\b/i.test(courseStr)) {
      return 'Grade 12'
    }
    if (/\b(?:GRADE\s*11|HUMMS\s*11|STEM\s*11|ABM\s*11|GAS\s*11|TVL\s*11|11\s*[A-Z]?)\b/i.test(courseStr)) {
      return 'Grade 11'
    }
    if (/\b(?:GRADE\s*10|JHS\s*10|10\s*[A-Z]?)\b/i.test(courseStr)) {
      return 'Grade 10'
    }
    if (/\b(?:GRADE\s*9|JHS\s*9|9\s*[A-Z]?)\b/i.test(courseStr)) {
      return 'Grade 9'
    }
    if (/\b(?:GRADE\s*8|JHS\s*8|8\s*[A-Z]?)\b/i.test(courseStr)) {
      return 'Grade 8'
    }
    if (/\b(?:GRADE\s*7|JHS\s*7|7\s*[A-Z]?)\b/i.test(courseStr)) {
      return 'Grade 7'
    }
    if (courseStr.includes('2-YEAR') || courseStr.includes('ACT') || courseStr.includes('ASSOCIATE')) {
      const yl = typeof yearValue === 'number' ? yearValue : parseInt(String(yearValue || 1), 10) || 1
      return `${yl === 2 ? '2nd' : '1st'} Year (2-Year Course)`
    }
    // College program with year & section (e.g. "BSIT 4A" -> 4th Year, "BSCS 3B" -> 3rd Year)
    const collegeSecMatch = courseStr.match(/\b[A-Za-z]+\s*([1-6])\s*[A-Za-z]?\b/i)
    if (collegeSecMatch && (!yearValue || yearValue === 1)) {
      const num = parseInt(collegeSecMatch[1], 10)
      const suffixes: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th' }
      return `${suffixes[num] || `${num}th`} Year`
    }
  }

  const yl =
    typeof yearValue === 'number' && !Number.isNaN(yearValue)
      ? yearValue
      : parseInt(String(yearValue || 1), 10) || 1

  const suffixes: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th' }
  return `${suffixes[yl] || `${yl}th`} Year`
}

export function getSubjectTitle(subjects: Subject[], subjectId: string | number) {
  return (
    subjects.find((subject) => subject.id === subjectId || subject.id === String(subjectId))?.title ??
    'Unassigned subject'
  )
}

export function getGPAEquivalent(score: number): string {
  if (score <= 0) return 'N/A'
  const rounded = Math.round(score)
  if (rounded >= 96) return '1.00'
  if (rounded >= 92) return '1.25'
  if (rounded >= 87) return '1.50'
  if (rounded >= 83) return '1.75'
  if (rounded >= 78) return '2.00'
  if (rounded >= 75) return '2.25'
  if (rounded >= 70) return '2.50'
  if (rounded >= 65) return '2.75'
  if (rounded >= 60) return '3.00'
  return '5.00'
}

export function getLetterGrade(score: number): string {
  if (score <= 0) return '—'
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 75) return 'C'
  if (score >= 70) return 'D'
  return 'F'
}

export function getPrediction(overall: number, trendScore: number): PredictionStatus {
  if (overall <= 0 && trendScore <= 0) return 'Pending'
  if (overall < 74 || (trendScore > 0 && trendScore < 74)) return 'Bound to Fail'
  if (overall < 75 || (trendScore > 0 && trendScore < 75)) return 'At Risk'
  if (overall >= 90) return 'Excellent'
  if (overall >= 83) return 'Good'
  return 'Average'
}

export function isTermEncoded(term?: Partial<DetailedTermScores> | null): boolean {
  if (!term || typeof term !== 'object') return false
  if (term.hasData === true) return true
  const hasPositiveScore =
    (typeof term.attendance === 'number' && term.attendance > 0) ||
    (typeof term.quiz === 'number' && term.quiz > 0) ||
    (typeof term.activity === 'number' && term.activity > 0) ||
    (typeof term.activities === 'number' && term.activities > 0) ||
    (typeof term.participation === 'number' && term.participation > 0) ||
    (typeof term.exam === 'number' && term.exam > 0) ||
    (typeof term.labActivity === 'number' && term.labActivity > 0) ||
    (typeof term.rawGrade === 'number' && term.rawGrade > 0) ||
    (typeof term.computedTermGrade === 'number' && term.computedTermGrade > 0) ||
    (typeof term.termGrade === 'number' && term.termGrade > 0)
  return hasPositiveScore
}

/**
 * Computes the Period Raw Grade (100%) using the required grading system formula:
 * Attendance (10%) + Quizzes (20%) + Activity (20%) + Participation (10%) + Exam (40%) = 100%
 */
export function computeTermGrade(
  term: {
    attendance?: number
    quiz?: number
    activity?: number
    activities?: number
    participation?: number
    exam?: number
    labActivity?: number | null
    labExam?: number | null
    hasData?: boolean
  },
  _hasLaboratory: boolean = false,
  weights?: {
    attendance?: number
    quiz?: number
    activity?: number
    participation?: number
    exam?: number
  },
): number {
  if (!term) return 0
  const attendance = typeof term.attendance === 'number' ? term.attendance : 0
  const quiz = typeof term.quiz === 'number' ? term.quiz : 0
  const activity =
    typeof term.activity === 'number'
      ? term.activity
      : typeof term.activities === 'number'
      ? term.activities
      : 0
  const participation =
    typeof term.participation === 'number'
      ? term.participation
      : typeof term.labActivity === 'number' && term.labActivity > 0
      ? term.labActivity
      : typeof term.labExam === 'number' && term.labExam > 0
      ? term.labExam
      : 0
  const exam = typeof term.exam === 'number' ? term.exam : 0

  if (
    term.hasData !== true &&
    attendance <= 0 &&
    quiz <= 0 &&
    activity <= 0 &&
    participation <= 0 &&
    exam <= 0
  ) {
    return 0
  }

  const wAtt = (weights?.attendance ?? 10) / 100
  const wQuiz = (weights?.quiz ?? 20) / 100
  const wAct = (weights?.activity ?? 20) / 100
  const wPart = (weights?.participation ?? 10) / 100
  const wExam = (weights?.exam ?? 40) / 100

  const weighted =
    attendance * wAtt +
    quiz * wQuiz +
    activity * wAct +
    participation * wPart +
    exam * wExam

  return Number(weighted.toFixed(1))
}

/**
 * Computes cumulative grades across periods:
 * - Prelim Grade = Prelim Raw Grade
 * - Midterm Grade = Prelim Grade (40%) + Midterm Raw Grade (60%)
 * - Pre-Final Grade = Midterm Grade (40%) + Pre-Final Raw Grade (60%)
 * - Final Grade = Pre-Final Grade (40%) + Final Raw Grade (60%)
 */
export function computeCumulativePeriodGrades(params: {
  prelimRaw: number
  prelimEncoded?: boolean
  midtermRaw?: number
  midtermEncoded?: boolean
  prefinalRaw?: number
  prefinalEncoded?: boolean
  finalRaw?: number
  finalEncoded?: boolean
}) {
  const isPrelimEncoded =
    params.prelimEncoded ?? (typeof params.prelimRaw === 'number' && params.prelimRaw > 0)
  const isMidtermEncoded =
    params.midtermEncoded ?? (typeof params.midtermRaw === 'number' && params.midtermRaw > 0)
  const isPrefinalEncoded =
    params.prefinalEncoded ?? (typeof params.prefinalRaw === 'number' && params.prefinalRaw > 0)
  const isFinalEncoded =
    params.finalEncoded ?? (typeof params.finalRaw === 'number' && params.finalRaw > 0)

  let runningCumulative: number | null = null

  const prelimCumulative = isPrelimEncoded ? Number(params.prelimRaw.toFixed(1)) : 0
  if (isPrelimEncoded) {
    runningCumulative = prelimCumulative
  }

  let midtermCumulative = 0
  if (isMidtermEncoded && typeof params.midtermRaw === 'number') {
    midtermCumulative =
      runningCumulative !== null
        ? Number((runningCumulative * 0.4 + params.midtermRaw * 0.6).toFixed(1))
        : Number(params.midtermRaw.toFixed(1))
    runningCumulative = midtermCumulative
  }

  let prefinalCumulative = 0
  if (isPrefinalEncoded && typeof params.prefinalRaw === 'number') {
    prefinalCumulative =
      runningCumulative !== null
        ? Number((runningCumulative * 0.4 + params.prefinalRaw * 0.6).toFixed(1))
        : Number(params.prefinalRaw.toFixed(1))
    runningCumulative = prefinalCumulative
  }

  let finalCumulative = 0
  if (isFinalEncoded && typeof params.finalRaw === 'number') {
    finalCumulative =
      runningCumulative !== null
        ? Number((runningCumulative * 0.4 + params.finalRaw * 0.6).toFixed(1))
        : Number(params.finalRaw.toFixed(1))
    runningCumulative = finalCumulative
  }

  const currentOverall = runningCumulative !== null ? Math.round(runningCumulative) : 0

  return {
    prelimCumulative,
    midtermCumulative,
    prefinalCumulative,
    finalCumulative,
    prelimGrade: isPrelimEncoded ? prelimCumulative : null,
    midtermGrade: isMidtermEncoded ? midtermCumulative : null,
    prefinalGrade: isPrefinalEncoded ? prefinalCumulative : null,
    finalGrade: isFinalEncoded ? finalCumulative : null,
    currentOverall,
  }
}

export function computeOverallFromTerms(
  prelimGrade: number,
  midtermGrade: number,
  finalGrade: number,
  prefinalGrade?: number,
): number {
  if (finalGrade > 0) return Math.round(finalGrade)
  if (typeof prefinalGrade === 'number' && prefinalGrade > 0) return Math.round(prefinalGrade)
  if (midtermGrade > 0) return Math.round(midtermGrade)
  if (prelimGrade > 0) return Math.round(prelimGrade)
  return 0
}

export function computeItemsAverage(scores: number[]): number {
  if (!Array.isArray(scores) || scores.length === 0) return 0
  const valid = scores.map((n) => (typeof n === 'number' && !Number.isNaN(n) ? n : 0))
  const sum = valid.reduce((acc, val) => acc + val, 0)
  return Number((sum / valid.length).toFixed(1))
}

/**
 * Computes category total student score, total possible items, and percentage average:
 * Average = (Total Student Score / Total Items) * 100
 * Example: Q1(20) + Q2(20) + Q3(20) = 60 total items.
 * Student gets 40 total -> Average = (40 / 60) * 100 = 66.7%
 */
export function computeCategoryTotalAndAvg(
  scores: number[],
  maxItems?: number[],
  directTotalItems?: number,
): { totalScore: number; totalItems: number; average: number } {
  const safeScores = Array.isArray(scores) ? scores : []
  const totalScore = safeScores.reduce(
    (acc, s) => acc + (typeof s === 'number' && !Number.isNaN(s) ? s : 0),
    0,
  )

  let totalItems = 0
  if (typeof directTotalItems === 'number' && directTotalItems > 0) {
    totalItems = directTotalItems
  } else if (Array.isArray(maxItems) && maxItems.length > 0) {
    totalItems = maxItems.reduce(
      (acc, m) => acc + (typeof m === 'number' && !Number.isNaN(m) && m > 0 ? m : 100),
      0,
    )
  } else {
    totalItems = safeScores.length > 0 ? safeScores.length * 100 : 100
  }

  const average = totalItems > 0 ? Number(((totalScore / totalItems) * 100).toFixed(1)) : 0
  return { totalScore, totalItems, average }
}

export function getDefaultTermMaxItems(counts?: {
  attendance?: number
  quiz?: number
  activity?: number
  participation?: number
  exam?: number
  labActivity?: number
}): TermComponentMaxItems {
  const attCount = Math.max(1, counts?.attendance ?? 2)
  const quizCount = Math.max(1, counts?.quiz ?? 2)
  const actCount = Math.max(1, counts?.activity ?? 2)
  const partCount = Math.max(1, counts?.participation ?? 1)
  const examCount = Math.max(1, counts?.exam ?? 1)
  const labCount = counts?.labActivity ? Math.max(1, counts.labActivity) : 0

  return {
    attendance: Array(attCount).fill(10),
    attendanceTotal: attCount * 10,
    quiz: Array(quizCount).fill(20),
    activity: Array(actCount).fill(50),
    participation: Array(partCount).fill(20),
    exam: Array(examCount).fill(100),
    labActivity: labCount > 0 ? Array(labCount).fill(50) : [],
  }
}

export function createEmptyTermScores(hasLaboratory: boolean = false): DetailedTermScores {
  return {
    attendance: 0,
    quiz: 0,
    activity: 0,
    participation: 0,
    exam: 0,
    labActivity: hasLaboratory ? 0 : null,
    rawGrade: 0,
    computedTermGrade: 0,
    termGrade: 0,
    hasData: false,
    items: {
      attendance: [0],
      quiz: [0],
      activity: [0],
      participation: [0],
      exam: [0],
      labActivity: hasLaboratory ? [0] : [],
    },
    maxItems: getDefaultTermMaxItems({ labActivity: hasLaboratory ? 1 : 0 }),
    quiz1: 0,
    quiz2: 0,
    act1: 0,
    act2: 0,
    act3: 0,
    activities: 0,
    labExam: hasLaboratory ? 0 : null,
  }
}

export function ensureTermScores(
  rawTerm: any,
  _fallbackBase: number = 0,
  hasLaboratory: boolean = false,
): DetailedTermScores {
  if (!rawTerm) {
    return createEmptyTermScores(hasLaboratory)
  }

  if (typeof rawTerm === 'number') {
    if (rawTerm <= 0) return createEmptyTermScores(hasLaboratory)
    const val = Math.max(0, Math.min(100, rawTerm))
    const items: TermComponentItems = {
      attendance: [val],
      quiz: [val],
      activity: [val],
      participation: [val],
      exam: [val],
      labActivity: hasLaboratory ? [val] : [],
    }
    const rawGrade = computeTermGrade(
      { attendance: val, quiz: val, activity: val, participation: val, exam: val, hasData: true },
      hasLaboratory,
    )
    return {
      attendance: val,
      quiz: val,
      activity: val,
      participation: val,
      exam: val,
      labActivity: hasLaboratory ? val : null,
      rawGrade,
      computedTermGrade: rawGrade,
      termGrade: rawGrade,
      hasData: true,
      items,
      maxItems: getDefaultTermMaxItems(),
      quiz1: val,
      quiz2: val,
      act1: val,
      act2: val,
      act3: val,
      activities: val,
      labExam: hasLaboratory ? val : null,
    }
  }

  const encoded = isTermEncoded(rawTerm)
  if (!encoded) {
    return {
      ...createEmptyTermScores(hasLaboratory),
      items: {
        attendance:
          Array.isArray(rawTerm?.items?.attendance) && rawTerm.items.attendance.length > 0
            ? rawTerm.items.attendance
            : [0],
        quiz:
          Array.isArray(rawTerm?.items?.quiz) && rawTerm.items.quiz.length > 0
            ? rawTerm.items.quiz
            : [0],
        activity:
          Array.isArray(rawTerm?.items?.activity) && rawTerm.items.activity.length > 0
            ? rawTerm.items.activity
            : [0],
        participation:
          Array.isArray(rawTerm?.items?.participation) && rawTerm.items.participation.length > 0
            ? rawTerm.items.participation
            : [0],
        exam:
          Array.isArray(rawTerm?.items?.exam) && rawTerm.items.exam.length > 0
            ? rawTerm.items.exam
            : [0],
        labActivity: hasLaboratory
          ? Array.isArray(rawTerm?.items?.labActivity) && rawTerm.items.labActivity.length > 0
            ? rawTerm.items.labActivity
            : [0]
          : [],
      },
    }
  }

  const baseAttendance = typeof rawTerm?.attendance === 'number' ? rawTerm.attendance : 0
  const baseQuiz = typeof rawTerm?.quiz === 'number' ? rawTerm.quiz : 0
  const baseActivity =
    typeof rawTerm?.activity === 'number'
      ? rawTerm.activity
      : typeof rawTerm?.activities === 'number'
      ? rawTerm.activities
      : 0
  const baseParticipation =
    typeof rawTerm?.participation === 'number'
      ? rawTerm.participation
      : typeof rawTerm?.labActivity === 'number'
      ? rawTerm.labActivity
      : typeof rawTerm?.labExam === 'number'
      ? rawTerm.labExam
      : 0
  const baseExam = typeof rawTerm?.exam === 'number' ? rawTerm.exam : 0
  const baseLab = hasLaboratory
    ? typeof rawTerm?.labActivity === 'number'
      ? rawTerm.labActivity
      : baseParticipation
    : null

  const items: TermComponentItems = {
    attendance:
      Array.isArray(rawTerm?.items?.attendance) && rawTerm.items.attendance.length > 0
        ? rawTerm.items.attendance
        : [baseAttendance],
    quiz:
      Array.isArray(rawTerm?.items?.quiz) && rawTerm.items.quiz.length > 0
        ? rawTerm.items.quiz
        : [baseQuiz],
    activity:
      Array.isArray(rawTerm?.items?.activity) && rawTerm.items.activity.length > 0
        ? rawTerm.items.activity
        : [baseActivity],
    participation:
      Array.isArray(rawTerm?.items?.participation) && rawTerm.items.participation.length > 0
        ? rawTerm.items.participation
        : [baseParticipation],
    exam:
      Array.isArray(rawTerm?.items?.exam) && rawTerm.items.exam.length > 0
        ? rawTerm.items.exam
        : [baseExam],
    labActivity: hasLaboratory
      ? Array.isArray(rawTerm?.items?.labActivity) && rawTerm.items.labActivity.length > 0
        ? rawTerm.items.labActivity
        : [baseLab ?? 0]
      : [],
  }

  const attendance = computeItemsAverage(items.attendance)
  const quiz = computeItemsAverage(items.quiz)
  const activity = computeItemsAverage(items.activity)
  const participation = computeItemsAverage(items.participation)
  const exam = computeItemsAverage(items.exam)
  const labActivity = hasLaboratory ? computeItemsAverage(items.labActivity || [0]) : null

  const rawGrade = computeTermGrade(
    { attendance, quiz, activity, participation, exam, labActivity, hasData: true },
    hasLaboratory,
  )

  const computedVal =
    typeof rawTerm.computedTermGrade === 'number' && rawTerm.computedTermGrade > 0
      ? rawTerm.computedTermGrade
      : typeof rawTerm.termGrade === 'number' && rawTerm.termGrade > 0
      ? rawTerm.termGrade
      : rawGrade

  return {
    attendance,
    quiz,
    activity,
    participation,
    exam,
    labActivity,
    rawGrade,
    computedTermGrade: computedVal,
    termGrade: computedVal,
    hasData: true,
    items,
    maxItems: rawTerm?.maxItems || getDefaultTermMaxItems(),
    quiz1: items.quiz[0] ?? quiz,
    quiz2: items.quiz[1] ?? quiz,
    act1: items.activity[0] ?? activity,
    act2: items.activity[1] ?? activity,
    act3: items.activity[2] ?? activity,
    activities: activity,
    labExam: labActivity,
  }
}

export function recalculateSheetGrades(
  sheet: DetailedGradingSheet,
  hasLaboratory: boolean = false,
  weights?: {
    attendance?: number
    quiz?: number
    activity?: number
    participation?: number
    exam?: number
  },
): DetailedGradingSheet {
  const prelim = ensureTermScores(sheet.prelim, 0, hasLaboratory)
  const midterm = ensureTermScores(sheet.midterm, 0, hasLaboratory)
  const prefinal = ensureTermScores(sheet.prefinal, 0, hasLaboratory)
  const final = ensureTermScores(sheet.final, 0, hasLaboratory)

  const prelimEncoded = isTermEncoded(prelim)
  const midtermEncoded = isTermEncoded(midterm)
  const prefinalEncoded = isTermEncoded(prefinal)
  const finalEncoded = isTermEncoded(final)

  const prelimRaw = prelimEncoded ? computeTermGrade(prelim, hasLaboratory, weights) : 0
  const midtermRaw = midtermEncoded ? computeTermGrade(midterm, hasLaboratory, weights) : 0
  const prefinalRaw = prefinalEncoded ? computeTermGrade(prefinal, hasLaboratory, weights) : 0
  const finalRaw = finalEncoded ? computeTermGrade(final, hasLaboratory, weights) : 0

  const cumulative = computeCumulativePeriodGrades({
    prelimRaw,
    prelimEncoded,
    midtermRaw,
    midtermEncoded,
    prefinalRaw,
    prefinalEncoded,
    finalRaw,
    finalEncoded,
  })

  prelim.rawGrade = prelimRaw
  prelim.computedTermGrade = cumulative.prelimCumulative
  prelim.termGrade = cumulative.prelimCumulative
  prelim.hasData = prelimEncoded

  midterm.rawGrade = midtermRaw
  midterm.computedTermGrade = cumulative.midtermCumulative
  midterm.termGrade = cumulative.midtermCumulative
  midterm.hasData = midtermEncoded

  prefinal.rawGrade = prefinalRaw
  prefinal.computedTermGrade = cumulative.prefinalCumulative
  prefinal.termGrade = cumulative.prefinalCumulative
  prefinal.hasData = prefinalEncoded

  final.rawGrade = finalRaw
  final.computedTermGrade = cumulative.finalCumulative
  final.termGrade = cumulative.finalCumulative
  final.hasData = finalEncoded

  const newAverage = cumulative.currentOverall

  let status: PredictionStatus = sheet.status === 'Dropped' ? 'Dropped' : 'Pending'
  if (sheet.status !== 'Dropped' && newAverage > 0) {
    if (newAverage >= 90) status = 'Excellent'
    else if (newAverage >= 83) status = 'Good'
    else if (newAverage >= 75) status = 'On Track'
    else if (newAverage >= 70) status = 'At Risk'
    else status = 'Bound to Fail'
  }

  return {
    ...sheet,
    prelim,
    midterm,
    prefinal,
    final,
    prelimExam: prelim.exam,
    quiz: prelim.quiz,
    activity: prelim.activity,
    attendance: prelim.attendance,
    participation: prelim.participation,
    labExam: prelim.labActivity,
    midtermScore: midterm.computedTermGrade,
    finalScore: final.computedTermGrade,
    average: newAverage,
    overallGrade: newAverage,
    predictedFinal: newAverage,
    status,
  }
}

export function computeTemplateSubjectAverage(
  scores: {
    prelim?: any
    midterm?: any
    prefinal?: any
    final?: any
  },
  hasLaboratory: boolean,
): number {
  const prelim = ensureTermScores(scores.prelim, 0, hasLaboratory)
  const midterm = ensureTermScores(scores.midterm, 0, hasLaboratory)
  const prefinal = ensureTermScores(scores.prefinal, 0, hasLaboratory)
  const final = ensureTermScores(scores.final, 0, hasLaboratory)

  const cumulative = computeCumulativePeriodGrades({
    prelimRaw: prelim.rawGrade || 0,
    prelimEncoded: isTermEncoded(prelim),
    midtermRaw: midterm.rawGrade || 0,
    midtermEncoded: isTermEncoded(midterm),
    prefinalRaw: prefinal.rawGrade || 0,
    prefinalEncoded: isTermEncoded(prefinal),
    finalRaw: final.rawGrade || 0,
    finalEncoded: isTermEncoded(final),
  })
  return cumulative.currentOverall
}

export function computeGrade(row: GradeRow): PredictionAnalysis {
  const prelimEncoded = isTermEncoded(row.prelim)
  const midtermEncoded = isTermEncoded(row.midterm)
  const prefinalEncoded = isTermEncoded(row.prefinal)
  const finalEncoded = isTermEncoded(row.final)

  let preliminary = 0
  let midterm = 0
  let prefinal = 0
  let final = 0
  let overall = 0

  if (row.prelim || row.midterm || row.prefinal || row.final) {
    const pRaw = prelimEncoded ? (row.prelim?.rawGrade ?? computeTermGrade(row.prelim!)) : 0
    const mRaw = midtermEncoded ? (row.midterm?.rawGrade ?? computeTermGrade(row.midterm!)) : 0
    const pfRaw = prefinalEncoded ? (row.prefinal?.rawGrade ?? computeTermGrade(row.prefinal!)) : 0
    const fRaw = finalEncoded ? (row.final?.rawGrade ?? computeTermGrade(row.final!)) : 0

    const cum = computeCumulativePeriodGrades({
      prelimRaw: pRaw,
      prelimEncoded,
      midtermRaw: mRaw,
      midtermEncoded,
      prefinalRaw: pfRaw,
      prefinalEncoded,
      finalRaw: fRaw,
      finalEncoded,
    })

    preliminary = Math.round(cum.prelimCumulative)
    midterm = Math.round(cum.midtermCumulative)
    prefinal = Math.round(cum.prefinalCumulative)
    final = Math.round(cum.finalCumulative)
    overall = cum.currentOverall
  } else if (row.quizzes > 0 || row.activities > 0 || row.midtermExam > 0 || row.finalExam > 0) {
    const attScore = typeof row.attendance === 'number' ? row.attendance : 0
    const partScore = typeof row.participation === 'number' ? row.participation : 0
    preliminary = Math.round(
      attScore * 0.1 + row.quizzes * 0.2 + row.activities * 0.2 + partScore * 0.1 + row.midtermExam * 0.4,
    )
    midterm = preliminary
    final = Math.round(
      attScore * 0.1 + row.quizzes * 0.2 + row.activities * 0.2 + partScore * 0.1 + row.finalExam * 0.4,
    )
    overall = final > 0 ? Math.round(midterm * 0.4 + final * 0.6) : preliminary
  }

  if (overall <= 0) {
    return {
      preliminary: 0,
      midterm: 0,
      prefinal: 0,
      final: 0,
      overall: 0,
      gpaEquiv: 'N/A',
      status: 'Pending',
      confidence: 0,
      riskFactors: ['No grades encoded yet'],
      requiredFinalScore: 75,
      recommendation: 'Awaiting grade encoding by the assigned instructor.',
    }
  }

  const trendScore = row.historical > 0 ? Math.round(overall * 0.75 + row.historical * 0.25) : overall
  const status = getPrediction(overall, trendScore)
  const gpaEquiv = getGPAEquivalent(overall)

  const riskFactors: string[] = []
  if (prelimEncoded && row.prelim) {
    if (row.prelim.quiz > 0 && row.prelim.quiz < 75) riskFactors.push(`Low Quizzes average (${Math.round(row.prelim.quiz)}%)`)
    if (row.prelim.activity > 0 && row.prelim.activity < 75) riskFactors.push(`Low Activity average (${Math.round(row.prelim.activity)}%)`)
    if (row.prelim.attendance > 0 && row.prelim.attendance < 75) riskFactors.push(`Low Attendance (${Math.round(row.prelim.attendance)}%)`)
    if (row.prelim.participation > 0 && row.prelim.participation < 75) riskFactors.push(`Low Participation (${Math.round(row.prelim.participation)}%)`)
    if (row.prelim.exam > 0 && row.prelim.exam < 75) riskFactors.push(`Low Exam score (${Math.round(row.prelim.exam)}%)`)
  }
  if (riskFactors.length === 0 && (status === 'At Risk' || status === 'Bound to Fail')) {
    riskFactors.push(`Borderline cumulative grade trend (${overall}%)`)
  }

  const targetNextRaw = Math.max(0, Math.min(100, Math.ceil((75 - overall * 0.4) / 0.6)))
  const requiredFinalScore = Number.isNaN(targetNextRaw) ? 75 : targetNextRaw

  let confidence = 85
  if (status === 'Bound to Fail') confidence = 92
  else if (status === 'At Risk') confidence = 88
  else if (status === 'Excellent') confidence = 95

  let recommendation = 'Performance is on track. Maintain current study habits.'
  if (status === 'Bound to Fail') {
    recommendation =
      `CRITICAL: Student needs at least ${requiredFinalScore}% raw grade in the next grading period (40% previous + 60% current) to reach passing (75%). Urgent tutoring and instructor consultation recommended.`
  } else if (status === 'At Risk') {
    recommendation =
      `WARNING: Student needs at least ${requiredFinalScore}% raw grade in the next grading period to secure a passing cumulative grade.`
  }

  return {
    preliminary,
    midterm,
    prefinal,
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
  const encodedRows = rows.filter((r) => r.computed.overall > 0)
  if (encodedRows.length === 0) {
    return {
      quizzesAvg: 0,
      assignmentsAvg: 0,
      activitiesAvg: 0,
      midtermAvg: 0,
      finalAvg: 0,
      overallAvg: 0,
      gpaAvg: 'N/A',
      totalStudents: rows.length,
      atRiskCount: 0,
      boundToFailCount: 0,
      safeCount: 0,
    }
  }

  const total = encodedRows.length
  const quizzesAvg = Math.round(encodedRows.reduce((sum, r) => sum + (r.row.quizzes || 0), 0) / total)
  const assignmentsAvg = Math.round(encodedRows.reduce((sum, r) => sum + (r.row.assignments || 0), 0) / total)
  const activitiesAvg = Math.round(encodedRows.reduce((sum, r) => sum + (r.row.activities || 0), 0) / total)
  const midtermAvg = Math.round(encodedRows.reduce((sum, r) => sum + r.computed.midterm, 0) / total)
  const finalAvg = Math.round(encodedRows.reduce((sum, r) => sum + r.computed.final, 0) / total)
  const overallAvg = Math.round(encodedRows.reduce((sum, r) => sum + r.computed.overall, 0) / total)
  const gpaAvg = getGPAEquivalent(overallAvg)

  const boundToFailCount = encodedRows.filter((r) => r.computed.status === 'Bound to Fail').length
  const atRiskCount = encodedRows.filter((r) => r.computed.status === 'At Risk').length
  const safeCount = total - boundToFailCount - atRiskCount

  return {
    quizzesAvg,
    assignmentsAvg,
    activitiesAvg,
    midtermAvg,
    finalAvg,
    overallAvg,
    gpaAvg,
    totalStudents: rows.length,
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
