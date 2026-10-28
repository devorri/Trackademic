import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../hooks/useAuth'
import { Printer, Eye, X, FlaskConical, BookOpen } from 'lucide-react'
import { ensureTermScores, formatCourseSection } from '../../utils/helpers'
import type { StudentAssessmentRow, GradingPeriodKey } from '../../utils/types'

export const StudentGrades: React.FC = () => {
  const { activeUser } = useAuth()
  const { studentTemplateRecords, detailedGradingSheets, classes, subjects, printStudentGradingBookReport, students } = useData()

  // Match current active student or fallback to Juan Dela Cruz (stud-3)
  const currentStudent =
    students.find((s) => s.email === activeUser?.email || s.name === activeUser?.name) ||
    students.find((s) => s.id === 'stud-3') ||
    students[0]

  const baseRecord = studentTemplateRecords[currentStudent?.id || 'stud-3'] || studentTemplateRecords['stud-3']

  // Merge live detailedGradingSheets from Instructor Gradebook so student sees real-time component scores
  const liveRows: StudentAssessmentRow[] = baseRecord.rows.map((r) => {
    const matchingClass = classes.find((c) => {
      const sub = subjects.find((s) => s.id === c.subject_id)
      return (sub?.code === r.code || c.subject?.code === r.code) && (c.studentIds || []).includes(currentStudent?.id || '')
    })
    const liveSheet = matchingClass
      ? (detailedGradingSheets[matchingClass.id] || []).find((gs) => gs.studentId === currentStudent?.id)
      : undefined

    if (!liveSheet) return r
    const p = ensureTermScores(liveSheet.prelim, 82, r.hasLaboratory)
    const m = ensureTermScores(liveSheet.midterm, 84, r.hasLaboratory)
    const f = ensureTermScores(liveSheet.final, 86, r.hasLaboratory)
    return {
      ...r,
      prelim: p,
      midterm: m,
      final: f,
      attendance: p.attendance,
      quiz: p.quiz,
      labExam: p.labActivity,
      activity: p.activity,
      prelimExam: p.exam,
      subjectAverage: liveSheet.average,
    }
  })

  const sectionDisplay = currentStudent
    ? formatCourseSection(currentStudent.course, currentStudent.section_label)
    : baseRecord.section

  const [activePeriodTab, setActivePeriodTab] = useState<'ALL' | GradingPeriodKey | 'SUMMARY'>('ALL')
  const [selectedSubject, setSelectedSubject] = useState<StudentAssessmentRow | null>(null)

  const overallAverage = Number(
    (liveRows.reduce((sum, r) => sum + r.subjectAverage, 0) / (liveRows.length || 1)).toFixed(1),
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Notice Banner */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          borderRadius: '16px',
          padding: '1.6rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#1d4ed8',
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
              }}
            >
              Official Student Grading Book
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#334155',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
              }}
            >
              Prelim • Midterm • Final Component Breakdown
            </span>
          </div>

          <h3 style={{ margin: '0.5rem 0 0.2rem 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>
            {currentStudent?.name || baseRecord.studentName} — Official Grade Report
          </h3>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
            Course & Section: <strong>{sectionDisplay}</strong> • Academic Period: <strong>{baseRecord.schoolYear}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => printStudentGradingBookReport(currentStudent?.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.4rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
            }}
          >
            <Printer size={16} /> Download Official PDF / Print
          </button>
        </div>
      </div>

      {/* Official Grading Sheet Table with Per-Term Component Breakdown */}
      <section
        style={{
          padding: '1.6rem 2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              Curriculum Assessment Record ({liveRows.length} Subjects)
            </h4>
            <p style={{ margin: '0.2rem 0 0 0', color: '#475569', fontSize: '0.88rem' }}>
              Itemized scores for Attendance, Quiz, Lab Activity, Activity, and Exam in Preliminary, Midterm, and Final periods.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#eff6ff', color: '#1e40af', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
              <FlaskConical size={13} /> With Lab (ICT 313330 & 313331)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#f8fafc', color: '#64748b', padding: '0.2rem 0.55rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <BookOpen size={13} /> Lecture-Only (Lab: N/A)
            </span>
          </div>
        </div>

        {/* Grading Period Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.1rem' }}>
          {[
            { key: 'ALL', label: 'All Periods (Prelim • Midterm • Final)', color: '#1e3a8a', bg: '#eff6ff' },
            { key: 'prelim', label: 'Prelim Breakdown', color: '#1d4ed8', bg: '#eff6ff' },
            { key: 'midterm', label: 'Midterm Breakdown', color: '#7c3aed', bg: '#f5f3ff' },
            { key: 'final', label: 'Final Breakdown', color: '#047857', bg: '#ecfdf5' },
            { key: 'SUMMARY', label: 'Term Summary View', color: '#b45309', bg: '#fffbeb' },
          ].map((tab) => {
            const isActive = activePeriodTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActivePeriodTab(tab.key as typeof activePeriodTab)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  border: isActive ? `2px solid ${tab.color}` : '1px solid #cbd5e1',
                  background: isActive ? tab.bg : '#ffffff',
                  color: isActive ? tab.color : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div style={{ overflowX: 'auto', marginTop: '1.2rem', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
          <table style={{ margin: 0, width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              {activePeriodTab === 'ALL' && (
                <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                  <th colSpan={2} style={{ color: '#ffffff', fontWeight: 800, padding: '0.55rem 0.75rem', textAlign: 'left', border: '1px solid #334155' }}>
                    Subject Information
                  </th>
                  <th colSpan={6} style={{ color: '#ffffff', fontWeight: 800, padding: '0.55rem', textAlign: 'center', background: '#1e3a8a', border: '1px solid #334155' }}>
                    PRELIMINARY PERIOD
                  </th>
                  <th colSpan={6} style={{ color: '#ffffff', fontWeight: 800, padding: '0.55rem', textAlign: 'center', background: '#4c1d95', border: '1px solid #334155' }}>
                    MIDTERM PERIOD
                  </th>
                  <th colSpan={6} style={{ color: '#ffffff', fontWeight: 800, padding: '0.55rem', textAlign: 'center', background: '#065f46', border: '1px solid #334155' }}>
                    FINAL PERIOD
                  </th>
                  <th colSpan={2} style={{ color: '#ffffff', fontWeight: 800, padding: '0.55rem', textAlign: 'center', background: '#0f172a', border: '1px solid #334155' }}>
                    OVERALL
                  </th>
                </tr>
              )}
              <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
                <th style={{ color: '#ffffff', fontWeight: 800, padding: '0.7rem', width: '10%', border: '1px solid #1e3a8a' }}>Code</th>
                <th style={{ color: '#ffffff', fontWeight: 800, padding: '0.7rem', textAlign: 'left', minWidth: '180px', border: '1px solid #1e3a8a' }}>Subject Name</th>

                {(activePeriodTab === 'ALL' || activePeriodTab === 'prelim') && (
                  <>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#1e40af', border: '1px solid #1e3a8a' }}>Att</th>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#1e40af', border: '1px solid #1e3a8a' }}>Quiz</th>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#1e40af', border: '1px solid #1e3a8a' }}>Lab Act</th>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#1e40af', border: '1px solid #1e3a8a' }}>Act</th>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#1e40af', border: '1px solid #1e3a8a' }}>Exam</th>
                    <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.55rem', background: '#1d4ed8', border: '1px solid #1e3a8a' }}>Prelim</th>
                  </>
                )}

                {(activePeriodTab === 'ALL' || activePeriodTab === 'midterm') && (
                  <>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#5b21b6', border: '1px solid #4c1d95' }}>Att</th>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#5b21b6', border: '1px solid #4c1d95' }}>Quiz</th>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#5b21b6', border: '1px solid #4c1d95' }}>Lab Act</th>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#5b21b6', border: '1px solid #4c1d95' }}>Act</th>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#5b21b6', border: '1px solid #4c1d95' }}>Exam</th>
                    <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.55rem', background: '#6d28d9', border: '1px solid #4c1d95' }}>Midterm</th>
                  </>
                )}

                {(activePeriodTab === 'ALL' || activePeriodTab === 'final') && (
                  <>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#047857', border: '1px solid #065f46' }}>Att</th>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#047857', border: '1px solid #065f46' }}>Quiz</th>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#047857', border: '1px solid #065f46' }}>Lab Act</th>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#047857', border: '1px solid #065f46' }}>Act</th>
                    <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.55rem', background: '#047857', border: '1px solid #065f46' }}>Exam</th>
                    <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.55rem', background: '#059669', border: '1px solid #065f46' }}>Final</th>
                  </>
                )}

                {activePeriodTab === 'SUMMARY' && (
                  <>
                    <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.65rem', background: '#1d4ed8', border: '1px solid #1e3a8a' }}>Prelim Grade (30%)</th>
                    <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.65rem', background: '#6d28d9', border: '1px solid #4c1d95' }}>Midterm Grade (30%)</th>
                    <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.65rem', background: '#059669', border: '1px solid #065f46' }}>Final Grade (40%)</th>
                  </>
                )}

                <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.65rem', border: '1px solid #1e3a8a', background: '#0f766e' }}>
                  Subject Avg
                </th>
                <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.65rem', border: '1px solid #1e3a8a' }}>
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {liveRows.map((row) => {
                const p = ensureTermScores(row.prelim, 82, row.hasLaboratory)
                const m = ensureTermScores(row.midterm, 84, row.hasLaboratory)
                const f = ensureTermScores(row.final, 86, row.hasLaboratory)

                const renderTermCells = (term: typeof p, accentBg: string, accentColor: string) => (
                  <>
                    <td style={{ textAlign: 'center', fontWeight: 600, padding: '0.55rem', borderRight: '1px solid #cbd5e1' }}>{term.attendance}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, padding: '0.55rem', borderRight: '1px solid #cbd5e1' }}>{term.quiz}</td>
                    <td style={{ textAlign: 'center', padding: '0.55rem', borderRight: '1px solid #cbd5e1', background: row.hasLaboratory ? '#f5f3ff' : 'transparent' }}>
                      {row.hasLaboratory ? (
                        <strong style={{ color: '#6b21a8', fontWeight: 800 }}>{term.labActivity ?? 'N/A'}</strong>
                      ) : (
                        <span style={{ display: 'inline-block', padding: '0.12rem 0.4rem', background: '#e2e8f0', color: '#64748b', borderRadius: '4px', fontWeight: 800, fontSize: '0.72rem' }}>
                          N/A
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600, padding: '0.55rem', borderRight: '1px solid #cbd5e1' }}>{term.activity}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, padding: '0.55rem', borderRight: '1px solid #cbd5e1' }}>{term.exam}</td>
                    <td style={{ textAlign: 'center', fontWeight: 900, padding: '0.55rem', borderRight: '2px solid #94a3b8', background: accentBg, color: accentColor }}>
                      {term.computedTermGrade.toFixed(1)}
                    </td>
                  </>
                )

                return (
                  <tr key={row.code} style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '0.7rem', fontWeight: 800, color: '#1e3a8a', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>
                      {row.code}
                    </td>
                    <td style={{ padding: '0.7rem', borderRight: '1px solid #cbd5e1' }}>
                      <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.9rem' }}>{row.title}</strong>
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <span className="chip" style={{ fontSize: '0.7rem' }}>{row.units} Units</span>
                        {row.hasLaboratory ? (
                          <span style={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 700, background: '#eff6ff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            🧪 Lab
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, background: '#f8fafc', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            Lecture
                          </span>
                        )}
                      </div>
                    </td>

                    {(activePeriodTab === 'ALL' || activePeriodTab === 'prelim') && renderTermCells(p, '#eff6ff', '#1e40af')}
                    {(activePeriodTab === 'ALL' || activePeriodTab === 'midterm') && renderTermCells(m, '#f5f3ff', '#5b21b6')}
                    {(activePeriodTab === 'ALL' || activePeriodTab === 'final') && renderTermCells(f, '#ecfdf5', '#065f46')}

                    {activePeriodTab === 'SUMMARY' && (
                      <>
                        <td style={{ textAlign: 'center', fontWeight: 800, color: '#1e40af', background: '#eff6ff', borderRight: '1px solid #cbd5e1' }}>
                          {p.computedTermGrade.toFixed(1)}%
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, color: '#5b21b6', background: '#f5f3ff', borderRight: '1px solid #cbd5e1' }}>
                          {m.computedTermGrade.toFixed(1)}%
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, color: '#065f46', background: '#ecfdf5', borderRight: '1px solid #cbd5e1' }}>
                          {f.computedTermGrade.toFixed(1)}%
                        </td>
                      </>
                    )}

                    <td style={{ textAlign: 'center', background: '#ecfdf5', fontWeight: 900, color: '#065f46', fontSize: '0.98rem', borderRight: '1px solid #cbd5e1' }}>
                      {row.subjectAverage.toFixed(1)}%
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedSubject(row)}
                        style={{
                          padding: '0.35rem 0.7rem',
                          fontSize: '0.78rem',
                          background: '#f8fafc',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          color: '#1e3a8a',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {/* Overall Average Row */}
            <tfoot style={{ background: '#fef3c7', fontWeight: 900, borderTop: '2.5px solid #b45309' }}>
              <tr>
                <td
                  colSpan={activePeriodTab === 'ALL' ? 20 : activePeriodTab === 'SUMMARY' ? 5 : 8}
                  style={{ padding: '0.9rem 1.2rem', textAlign: 'right', color: '#92400e', fontSize: '1rem', letterSpacing: '0.04em' }}
                >
                  OVERALL ACADEMIC AVERAGE:
                </td>
                <td style={{ textAlign: 'center', background: '#fde68a', color: '#92400e', fontSize: '1.15rem', fontWeight: 900, borderRight: '1px solid #cbd5e1' }}>
                  {overallAverage}%
                </td>
                <td style={{ textAlign: 'center', color: overallAverage >= 75 ? '#15803d' : '#b91c1c', fontWeight: 800, fontSize: '0.85rem' }}>
                  {overallAverage >= 75 ? 'PASSED' : 'AT RISK'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Itemized Subject Breakdown Modal (Prelim, Midterm, Final Component Scores) */}
      {selectedSubject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
          onClick={() => setSelectedSubject(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '760px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #cbd5e1',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                  {selectedSubject.code} • {selectedSubject.units} Units
                </span>
                <h3 style={{ margin: '0.2rem 0', fontSize: '1.4rem', color: '#0f172a' }}>{selectedSubject.title}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  {selectedSubject.hasLaboratory ? '🧪 Laboratory Subject (Attendance, Quiz, Lab Activity, Activity, Exam)' : '📚 Lecture-Only Course (Lab Activity: N/A)'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubject(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer' }}
              >
                <X size={18} color="#475569" />
              </button>
            </div>

            {/* Per-Period Component Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginTop: '1.2rem' }}>
              {(
                [
                  {
                    key: 'prelim',
                    title: 'Preliminary Period (30%)',
                    scores: selectedSubject.prelim,
                    border: '#bfdbfe',
                    bg: '#eff6ff',
                    color: '#1e40af',
                  },
                  {
                    key: 'midterm',
                    title: 'Midterm Period (30%)',
                    scores: selectedSubject.midterm,
                    border: '#ddd6fe',
                    bg: '#f5f3ff',
                    color: '#5b21b6',
                  },
                  {
                    key: 'final',
                    title: 'Final Period (40%)',
                    scores: selectedSubject.final,
                    border: '#a7f3d0',
                    bg: '#ecfdf5',
                    color: '#065f46',
                  },
                ] as const
              ).map((period) => (
                <div
                  key={period.key}
                  style={{
                    border: `1.5px solid ${period.border}`,
                    borderRadius: '14px',
                    padding: '1rem 1.2rem',
                    background: '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <strong style={{ color: period.color, fontSize: '0.95rem', fontWeight: 800 }}>
                      {period.title}
                    </strong>
                    <span
                      style={{
                        background: period.bg,
                        color: period.color,
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        padding: '0.2rem 0.7rem',
                        borderRadius: '999px',
                        border: `1px solid ${period.border}`,
                      }}
                    >
                      Term Grade: {period.scores.computedTermGrade.toFixed(1)}%
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.65rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Attendance</span>
                      <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>{period.scores.attendance}%</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Quiz</span>
                      <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>{period.scores.quiz}%</strong>
                    </div>
                    <div style={{ background: selectedSubject.hasLaboratory ? '#faf5ff' : '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: selectedSubject.hasLaboratory ? '1px solid #d8b4fe' : '1px solid #e2e8f0', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: selectedSubject.hasLaboratory ? '#6b21a8' : '#64748b', fontWeight: 700, display: 'block' }}>Lab Activity</span>
                      <strong style={{ color: selectedSubject.hasLaboratory ? '#6b21a8' : '#94a3b8', fontSize: '1.1rem' }}>
                        {selectedSubject.hasLaboratory ? `${period.scores.labActivity ?? 'N/A'}%` : 'N/A'}
                      </strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Activity</span>
                      <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>{period.scores.activity}%</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Exam</span>
                      <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>{period.scores.exam}%</strong>
                    </div>
                  </div>
                </div>
              ))}

              <div
                style={{
                  background: '#ecfdf5',
                  padding: '1rem 1.4rem',
                  borderRadius: '12px',
                  border: '1.5px solid #86efac',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 800, textTransform: 'uppercase' }}>
                    Overall Subject Average
                  </span>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#047857' }}>
                    Weighted from Prelim (30%), Midterm (30%), and Final (40%)
                  </p>
                </div>
                <strong style={{ color: '#047857', fontSize: '1.6rem', fontWeight: 900 }}>
                  {selectedSubject.subjectAverage.toFixed(1)}%
                </strong>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setSelectedSubject(null)}
                style={{ padding: '0.6rem 1.4rem', borderRadius: '10px' }}
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
