import React, { useState, useMemo, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../hooks/useAuth'
import { Printer, Search, ArrowUpDown, ArrowUp, ArrowDown, PlusCircle, MinusCircle } from 'lucide-react'
import { ensureTermScores, formatCourseSection, getGPAEquivalent, isTermEncoded } from '../../utils/helpers'
import type { StudentAssessmentRow } from '../../utils/types'

type SortField = 'index' | 'code' | 'title' | 'units' | 'prelim' | 'midterm' | 'final' | 'average'
type SortOrder = 'asc' | 'desc'

export const StudentGrades: React.FC = () => {
  const { activeUser } = useAuth()
  const {
    detailedGradingSheets,
    classes,
    subjects,
    instructors,
    printStudentGradingBookReport,
    students,
    settings,
  } = useData()

  // Match the logged-in student strictly from database records
  const currentStudent = useMemo(
    () =>
      students.find(
        (s) =>
          s.profile_id === activeUser?.id ||
          s.id === activeUser?.id ||
          (activeUser?.email && s.email?.toLowerCase() === activeUser.email.toLowerCase()) ||
          (activeUser?.name && s.name?.toLowerCase() === activeUser.name.toLowerCase()),
      ) || students[0],
    [students, activeUser],
  )

  const [schoolYear, setSchoolYear] = useState(settings.schoolYear || '2025-2026')
  const [term, setTerm] = useState((settings.semester || '1ST SEMESTER').toUpperCase())
  const [appliedFilter, setAppliedFilter] = useState({
    schoolYear: settings.schoolYear || '2025-2026',
    term: (settings.semester || '1ST SEMESTER').toUpperCase(),
  })
  const [subjectSearch, setSubjectSearch] = useState('')

  const [sortField, setSortField] = useState<SortField>('index')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Build rows ONLY from classes in which the student is actually enrolled
  const liveRows = useMemo(() => {
    if (!currentStudent) return []
    const enrolledClasses = classes.filter((c) =>
      (c.studentIds || []).includes(currentStudent.id),
    )

    return enrolledClasses.map((cls, idx) => {
      const sub = subjects.find((s) => s.id === cls.subject_id) || cls.subject
      const hasLab = Boolean(sub?.has_laboratory)
      const instructorObj =
        instructors.find(
          (i) =>
            i.id === cls.instructor_id ||
            i.profile_id === cls.instructor_id ||
            i.id === cls.instructor?.id,
        ) || cls.instructor
      const teacherName = (instructorObj?.name || 'UNASSIGNED').toUpperCase()

      const liveSheet = (detailedGradingSheets[cls.id] || []).find(
        (gs) => gs.studentId === currentStudent.id,
      )

      const p = ensureTermScores(liveSheet?.prelim, 0, hasLab)
      const m = ensureTermScores(liveSheet?.midterm, 0, hasLab)
      const pf = ensureTermScores(liveSheet?.prefinal, 0, hasLab)
      const f = ensureTermScores(liveSheet?.final, 0, hasLab)
      const roundedAverage = liveSheet?.average ? Math.round(liveSheet.average) : 0

      return {
        subjectId: sub?.id || cls.subject_id,
        classId: cls.id,
        code: sub?.code || 'SUBJ',
        title: sub?.title || 'Subject',
        units: Number(sub?.units) || 3,
        hasLaboratory: hasLab,
        rowIndex: idx + 1,
        prelim: p,
        midterm: m,
        prefinal: pf,
        final: f,
        subjectAverage: roundedAverage,
        teacherName,
      }
    })
  }, [classes, subjects, instructors, detailedGradingSheets, currentStudent])

  const [expandedCodes, setExpandedCodes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setExpandedCodes((prev) => {
      const next = { ...prev }
      liveRows.forEach((r) => {
        if (next[r.classId] === undefined) {
          next[r.classId] = true
        }
      })
      return next
    })
  }, [liveRows])

  function toggleRowExpand(classId: string) {
    setExpandedCodes((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }))
  }

  function handleExpandAll(expand: boolean) {
    const next: Record<string, boolean> = {}
    liveRows.forEach((r) => {
      next[r.classId] = expand
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
    : 'N/A'

  const encodedRows = liveRows.filter((r) => r.subjectAverage > 0)
  // Rounded off whole number as required ("Dapat yong grades is naka round off na")
  const overallAverage =
    encodedRows.length > 0
      ? Math.round(
          encodedRows.reduce((sum, r) => sum + r.subjectAverage, 0) / encodedRows.length,
        )
      : 0

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} style={{ opacity: 0.75 }} />
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
  }

  const allExpanded =
    displayedRows.length > 0 && displayedRows.every((r) => expandedCodes[r.classId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '980px', margin: '0 auto', width: '100%' }}>
      {/* Top School Year & Term Search Filter Card */}
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
              {currentStudent?.name || activeUser?.name || 'Student'} ({sectionDisplay})
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
              Showing Rounded Term Grades for <strong>{appliedFilter.schoolYear}</strong> • <strong>{appliedFilter.term}</strong>
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
      </section>

      {/* Expandable Grades Table */}
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
                    {liveRows.length === 0
                      ? 'You are not enrolled in any subjects yet.'
                      : 'No subjects found matching your search.'}
                  </td>
                </tr>
              ) : (
                displayedRows.map(
                  (
                    row: StudentAssessmentRow & {
                      classId: string
                      rowIndex: number
                      teacherName: string
                    },
                  ) => {
                    const isExpanded = !!expandedCodes[row.classId]
                    const prelimEncoded = isTermEncoded(row.prelim)
                    const midtermEncoded = isTermEncoded(row.midterm)
                    const prefinalEncoded = isTermEncoded(row.prefinal)
                    const finalEncoded = isTermEncoded(row.final)

                    // Rounded whole numbers as required
                    const prelimGrade = prelimEncoded ? Math.round(row.prelim.computedTermGrade) : null
                    const midtermGrade = midtermEncoded ? Math.round(row.midterm.computedTermGrade) : null
                    const prefinalGrade = prefinalEncoded
                      ? Math.round(row.prefinal!.computedTermGrade)
                      : null
                    const finalGrade = finalEncoded ? Math.round(row.final.computedTermGrade) : null
                    const roundedAvg = row.subjectAverage > 0 ? Math.round(row.subjectAverage) : null
                    const isPassed = roundedAvg !== null && roundedAvg >= 75

                    return (
                      <React.Fragment key={row.classId}>
                        <tr
                          onClick={() => toggleRowExpand(row.classId)}
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

                        {/* Expanded Grade Details Drawer (All Rounded Whole Numbers) */}
                        {isExpanded && (
                          <tr style={{ background: '#ffffff', borderBottom: '1.5px solid #cbd5e1' }}>
                            <td colSpan={4} style={{ padding: '0.8rem 1.4rem 1.1rem 1.4rem' }}>
                              <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column' }}>
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
                                  <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 700 }}>
                                    {prelimGrade !== null ? prelimGrade : '—'}
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
                                  <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 700 }}>
                                    {midtermGrade !== null ? midtermGrade : '—'}
                                  </span>
                                </div>

                                {prefinalGrade !== null && (
                                  <div
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: '140px 1fr',
                                      padding: '0.55rem 0',
                                      borderBottom: '1px solid #f1f5f9',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <strong style={{ color: '#334155', fontSize: '0.95rem' }}>Pre-Final</strong>
                                    <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 700 }}>
                                      {prefinalGrade}
                                    </span>
                                  </div>
                                )}

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
                                  <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 700 }}>
                                    {finalGrade !== null ? finalGrade : '—'}
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
                                    {roundedAvg !== null
                                      ? `${roundedAvg} (GPA: ${getGPAEquivalent(roundedAvg)})`
                                      : '—'}
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
                                      color:
                                        roundedAvg === null
                                          ? '#64748b'
                                          : isPassed
                                          ? '#15803d'
                                          : '#dc2626',
                                      fontSize: '0.92rem',
                                      fontWeight: 800,
                                    }}
                                  >
                                    {roundedAvg === null
                                      ? 'PENDING'
                                      : isPassed
                                      ? 'PASSED'
                                      : 'AT RISK'}
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
                  },
                )
              )}
            </tbody>
            <tfoot style={{ background: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
              <tr>
                <td colSpan={3} style={{ padding: '0.9rem 1rem', textAlign: 'right', fontWeight: 800, color: '#334155', fontSize: '0.95rem' }}>
                  GENERAL WEIGHTED AVERAGE (GWA):
                </td>
                <td style={{ padding: '0.9rem 1rem', textAlign: 'center', fontWeight: 900, color: '#0284c7', fontSize: '1.05rem' }}>
                  {overallAverage > 0
                    ? `${overallAverage}% (${getGPAEquivalent(overallAverage)})`
                    : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  )
}
export default StudentGrades
