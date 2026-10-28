import React, { useState, useMemo } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../hooks/useAuth'
import { Printer, Search, ArrowUpDown, ArrowUp, ArrowDown, PlusCircle, MinusCircle } from 'lucide-react'
import { ensureTermScores, formatCourseSection, getGPAEquivalent } from '../../utils/helpers'
import type { StudentAssessmentRow } from '../../utils/types'

type SortField = 'index' | 'code' | 'title' | 'units' | 'prelim' | 'midterm' | 'final' | 'average'
type SortOrder = 'asc' | 'desc'

export const StudentGrades: React.FC = () => {
  const { activeUser } = useAuth()
  const {
    studentTemplateRecords,
    detailedGradingSheets,
    classes,
    subjects,
    instructors,
    printStudentGradingBookReport,
    students,
  } = useData()

  // Match current active student or fallback to Juan Dela Cruz (stud-3)
  const currentStudent =
    students.find((s) => s.email === activeUser?.email || s.name === activeUser?.name) ||
    students.find((s) => s.id === 'stud-3') ||
    students[0]

  const baseRecord = studentTemplateRecords[currentStudent?.id || 'stud-3'] || studentTemplateRecords['stud-3']

  // School Year & Term Filter state (matching the portal screenshot)
  const [schoolYear, setSchoolYear] = useState('2025-2026')
  const [term, setTerm] = useState('1ST SEMESTER')
  const [appliedFilter, setAppliedFilter] = useState({ schoolYear: '2025-2026', term: '1ST SEMESTER' })
  const [subjectSearch, setSubjectSearch] = useState('')

  // Sort state
  const [sortField, setSortField] = useState<SortField>('index')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Merge live term grades & teacher name from Instructor Gradebook
  const liveRows = useMemo(() => {
    return baseRecord.rows.map((r, idx) => {
      const matchingClass = classes.find((c) => {
        const sub = subjects.find((s) => s.id === c.subject_id)
        return (sub?.code === r.code || c.subject?.code === r.code) && (c.studentIds || []).includes(currentStudent?.id || '')
      }) || classes.find((c) => {
        const sub = subjects.find((s) => s.id === c.subject_id)
        return sub?.code === r.code || c.subject?.code === r.code
      })

      const instructorObj = matchingClass
        ? instructors.find((i) => i.id === matchingClass.instructor_id || i.id === matchingClass.instructor?.id)
        : instructors[0]
      const teacherName = (instructorObj?.name || 'MR. REYES').toUpperCase()

      const liveSheet = matchingClass
        ? (detailedGradingSheets[matchingClass.id] || []).find((gs) => gs.studentId === currentStudent?.id)
        : undefined

      const p = ensureTermScores(liveSheet ? liveSheet.prelim : r.prelim, 82, r.hasLaboratory)
      const m = ensureTermScores(liveSheet ? liveSheet.midterm : r.midterm, 84, r.hasLaboratory)
      const f = ensureTermScores(liveSheet ? liveSheet.final : r.final, 86, r.hasLaboratory)
      const subjectAverage = liveSheet ? liveSheet.average : r.subjectAverage

      return {
        ...r,
        rowIndex: idx + 1,
        prelim: p,
        midterm: m,
        final: f,
        subjectAverage,
        teacherName,
      }
    })
  }, [baseRecord.rows, classes, subjects, instructors, detailedGradingSheets, currentStudent?.id])

  // Track which rows are expanded to show Prelim, Midterm, Final, Remarks, Teacher
  // Default: expand all rows so the student immediately sees their grades like in the screenshot
  const [expandedCodes, setExpandedCodes] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    baseRecord.rows.forEach((r) => {
      initial[r.code] = true
    })
    return initial
  })

  function toggleRowExpand(code: string) {
    setExpandedCodes((prev) => ({
      ...prev,
      [code]: !prev[code],
    }))
  }

  function handleExpandAll(expand: boolean) {
    const next: Record<string, boolean> = {}
    liveRows.forEach((r) => {
      next[r.code] = expand
    })
    setExpandedCodes(next)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAppliedFilter({ schoolYear, term })
  }

  function handleSortClick(field: SortField) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder(field === 'code' || field === 'title' || field === 'index' ? 'asc' : 'desc')
    }
  }

  const displayedRows = useMemo(() => {
    const filtered = liveRows.filter((row) => {
      if (subjectSearch.trim()) {
        const q = subjectSearch.toLowerCase()
        return (
          row.code.toLowerCase().includes(q) ||
          row.title.toLowerCase().includes(q) ||
          row.teacherName.toLowerCase().includes(q)
        )
      }
      return true
    })

    return [...filtered].sort((a, b) => {
      let comparison = 0
      if (sortField === 'index') {
        comparison = a.rowIndex - b.rowIndex
      } else if (sortField === 'code') {
        comparison = a.code.localeCompare(b.code)
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title)
      } else if (sortField === 'units') {
        comparison = a.units - b.units
      } else if (sortField === 'prelim') {
        comparison = a.prelim.computedTermGrade - b.prelim.computedTermGrade
      } else if (sortField === 'midterm') {
        comparison = a.midterm.computedTermGrade - b.midterm.computedTermGrade
      } else if (sortField === 'final') {
        comparison = a.final.computedTermGrade - b.final.computedTermGrade
      } else if (sortField === 'average') {
        comparison = a.subjectAverage - b.subjectAverage
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [liveRows, subjectSearch, sortField, sortOrder])

  const sectionDisplay = currentStudent
    ? formatCourseSection(currentStudent.course, currentStudent.section_label)
    : baseRecord.section

  const overallAverage = Number(
    (liveRows.reduce((sum, r) => sum + r.subjectAverage, 0) / (liveRows.length || 1)).toFixed(1),
  )

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} style={{ opacity: 0.75 }} />
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
  }

  const allExpanded = displayedRows.length > 0 && displayedRows.every((r) => expandedCodes[r.code])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '980px', margin: '0 auto', width: '100%' }}>
      {/* Top School Year & Term Search Filter Card (Matching Screenshot) */}
      <section
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          borderRadius: '16px',
          padding: '1.6rem 2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#0284c7',
                background: '#e0f2fe',
                border: '1px solid #bae6fd',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
              }}
            >
              Student Online Grade Inquiry
            </span>
            <h3 style={{ margin: '0.45rem 0 0.15rem 0', color: '#0f172a', fontSize: '1.45rem', fontWeight: 800 }}>
              {currentStudent?.name || baseRecord.studentName} ({sectionDisplay})
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
              Showing Term Grades for <strong>{appliedFilter.schoolYear}</strong> • <strong>{appliedFilter.term}</strong>
            </p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => printStudentGradingBookReport(currentStudent?.id, true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.86rem',
              borderRadius: '10px',
              background: '#0284c7',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
            }}
          >
            <Printer size={16} /> Print / Download Grades
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                School Year
              </label>
              <select
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                Term
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                <option value="1ST SEMESTER">1ST SEMESTER</option>
                <option value="2ND SEMESTER">2ND SEMESTER</option>
                <option value="SUMMER">SUMMER</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#1d8cf8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.65rem 1.35rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(29, 140, 248, 0.3)',
              }}
            >
              <Search size={16} /> Search
            </button>

            {/* Quick Sort & Filter Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Filter subject or teacher..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: '#ffffff',
                  color: '#0f172a',
                }}
              />

              <select
                value={sortField}
                onChange={(e) => {
                  const nextField = e.target.value as SortField
                  setSortField(nextField)
                  setSortOrder(nextField === 'code' || nextField === 'title' || nextField === 'index' ? 'asc' : 'desc')
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  background: '#ffffff',
                  color: '#0f172a',
                }}
              >
                <option value="index">Sort: Default (#)</option>
                <option value="code">Sort: Code</option>
                <option value="title">Sort: Subject Name</option>
                <option value="units">Sort: Units</option>
                <option value="prelim">Sort: Prelim Grade</option>
                <option value="midterm">Sort: Midterm Grade</option>
                <option value="final">Sort: Final Grade</option>
                <option value="average">Sort: Overall Grade</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </button>

              <button
                type="button"
                onClick={() => handleExpandAll(!allExpanded)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0284c7',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {allExpanded ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
          </div>
        </form>

        <p
          style={{
            margin: '1.1rem 0 0 0',
            color: '#64748b',
            fontStyle: 'italic',
            fontSize: '0.92rem',
          }}
        >
          Select the school year and term then click Search button to display grades.
        </p>
      </section>

      {/* Expandable Grades Table (Matching the NVCFI Student Portal Screenshot) */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
            <thead>
              <tr style={{ background: '#2596e6', color: '#ffffff' }}>
                <th
                  onClick={() => handleSortClick('index')}
                  style={{
                    width: '80px',
                    padding: '0.85rem 0.75rem',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: '#ffffff',
                    borderRight: '1px solid rgba(255, 255, 255, 0.35)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    # {renderSortIcon('index')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('code')}
                  style={{
                    width: '150px',
                    padding: '0.85rem 0.9rem',
                    textAlign: 'left',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: '#ffffff',
                    borderRight: '1px solid rgba(255, 255, 255, 0.35)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                    <span>Code</span> {renderSortIcon('code')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('title')}
                  style={{
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: '#ffffff',
                    borderRight: '1px solid rgba(255, 255, 255, 0.35)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                    <span>Subject</span> {renderSortIcon('title')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('units')}
                  style={{
                    width: '110px',
                    padding: '0.85rem 0.9rem',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: '#ffffff',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Units</span> {renderSortIcon('units')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No subjects found matching your search.
                  </td>
                </tr>
              ) : (
                displayedRows.map((row: StudentAssessmentRow & { rowIndex: number; teacherName: string }) => {
                  const isExpanded = !!expandedCodes[row.code]
                  const prelimGrade = Math.round(row.prelim.computedTermGrade)
                  const midtermGrade = Math.round(row.midterm.computedTermGrade)
                  const finalGrade = Math.round(row.final.computedTermGrade)
                  const isPassed = row.subjectAverage >= 75

                  return (
                    <React.Fragment key={row.code}>
                      {/* Main Subject Row (Code | Subject | Units) */}
                      <tr
                        onClick={() => toggleRowExpand(row.code)}
                        style={{
                          background: '#f8fafc',
                          borderBottom: '1px solid #cbd5e1',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td
                          style={{
                            padding: '1rem 0.75rem',
                            textAlign: 'center',
                            borderRight: '1px solid #cbd5e1',
                            verticalAlign: 'middle',
                          }}
                        >
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                            {isExpanded ? (
                              <MinusCircle
                                size={20}
                                fill="#ef4444"
                                color="#ffffff"
                                style={{
                                  flexShrink: 0,
                                  filter: 'drop-shadow(0 1px 2px rgba(239, 68, 68, 0.35))',
                                }}
                              />
                            ) : (
                              <PlusCircle
                                size={20}
                                fill="#2596e6"
                                color="#ffffff"
                                style={{
                                  flexShrink: 0,
                                  filter: 'drop-shadow(0 1px 2px rgba(37, 150, 230, 0.35))',
                                }}
                              />
                            )}
                            <span style={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
                              {row.rowIndex}
                            </span>
                          </div>
                        </td>

                        <td
                          style={{
                            padding: '1rem 0.9rem',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            borderRight: '1px solid #cbd5e1',
                            verticalAlign: 'middle',
                          }}
                        >
                          {row.code}
                        </td>

                        <td
                          style={{
                            padding: '1rem',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            textTransform: 'uppercase',
                            borderRight: '1px solid #cbd5e1',
                            verticalAlign: 'middle',
                            lineHeight: 1.4,
                          }}
                        >
                          {row.title}
                        </td>

                        <td
                          style={{
                            padding: '1rem 0.9rem',
                            textAlign: 'center',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            verticalAlign: 'middle',
                          }}
                        >
                          {row.units}
                        </td>
                      </tr>

                      {/* Expanded Grade Details Drawer (Prelim, Midterm, Final, Remarks, Teacher) */}
                      {isExpanded && (
                        <tr style={{ background: '#ffffff', borderBottom: '1.5px solid #cbd5e1' }}>
                          <td colSpan={4} style={{ padding: '0.8rem 1.4rem 1.1rem 1.4rem' }}>
                            <div style={{ maxWidth: '460px', display: 'flex', flexDirection: 'column' }}>
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '140px 1fr',
                                  padding: '0.55rem 0',
                                  borderBottom: '1px solid #f1f5f9',
                                  alignItems: 'center',
                                }}
                              >
                                <strong style={{ color: '#334155', fontSize: '0.95rem' }}>Prelim</strong>
                                <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 600 }}>
                                  {prelimGrade}
                                </span>
                              </div>

                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '140px 1fr',
                                  padding: '0.55rem 0',
                                  borderBottom: '1px solid #f1f5f9',
                                  alignItems: 'center',
                                }}
                              >
                                <strong style={{ color: '#334155', fontSize: '0.95rem' }}>Midterm</strong>
                                <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 600 }}>
                                  {midtermGrade}
                                </span>
                              </div>

                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '140px 1fr',
                                  padding: '0.55rem 0',
                                  borderBottom: '1px solid #f1f5f9',
                                  alignItems: 'center',
                                }}
                              >
                                <strong style={{ color: '#334155', fontSize: '0.95rem' }}>Final</strong>
                                <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 600 }}>
                                  {finalGrade}
                                </span>
                              </div>

                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '140px 1fr',
                                  padding: '0.55rem 0',
                                  borderBottom: '1px solid #f1f5f9',
                                  alignItems: 'center',
                                }}
                              >
                                <strong style={{ color: '#334155', fontSize: '0.95rem' }}>Average</strong>
                                <span style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800 }}>
                                  {row.subjectAverage.toFixed(1)} (GPA: {getGPAEquivalent(row.subjectAverage)})
                                </span>
                              </div>

                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '140px 1fr',
                                  padding: '0.55rem 0',
                                  borderBottom: '1px solid #f1f5f9',
                                  alignItems: 'center',
                                }}
                              >
                                <strong style={{ color: '#334155', fontSize: '0.95rem' }}>Remarks</strong>
                                <span
                                  style={{
                                    color: isPassed ? '#15803d' : '#dc2626',
                                    fontSize: '0.92rem',
                                    fontWeight: 800,
                                  }}
                                >
                                  {isPassed ? 'PASSED' : 'AT RISK'}
                                </span>
                              </div>

                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '140px 1fr',
                                  padding: '0.55rem 0',
                                  alignItems: 'center',
                                }}
                              >
                                <strong style={{ color: '#334155', fontSize: '0.95rem' }}>Teacher</strong>
                                <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                  {row.teacherName}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
            <tfoot style={{ background: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
              <tr>
                <td colSpan={3} style={{ padding: '0.9rem 1rem', textAlign: 'right', fontWeight: 800, color: '#334155', fontSize: '0.95rem' }}>
                  GENERAL WEIGHTED AVERAGE (GWA):
                </td>
                <td style={{ padding: '0.9rem 1rem', textAlign: 'center', fontWeight: 900, color: '#0284c7', fontSize: '1.05rem' }}>
                  {overallAverage}% ({getGPAEquivalent(overallAverage)})
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  )
}
