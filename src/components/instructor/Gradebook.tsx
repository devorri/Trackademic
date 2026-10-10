import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../hooks/useAuth'
import { getSubjectTitle, clampScore } from '../../utils/helpers'
import { Save, Printer, Search, Layers, FileSpreadsheet, Check, Info } from 'lucide-react'

export const Gradebook: React.FC = () => {
  const { activeUser } = useAuth()
  const {
    classes,
    subjects,
    selectedClass,
    setSelectedClassId,
    instructors,
    gradebook,
    selectedClassAverages,
    detailedGradingSheets,
    updateDetailedGrade,
    generateReport,
    printReport,
  } = useData()

  const [viewMode, setViewMode] = useState<'detailed' | 'summary'>('detailed')
  const [studentSearch, setStudentSearch] = useState('')
  const [saveToast, setSaveToast] = useState(false)

  if (!selectedClass) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
        }}
      >
        <p style={{ color: '#64748b' }}>No classes selected. Please create or assign a class first.</p>
      </div>
    )
  }

  const instructorName = instructors.find((i) => i.id === selectedClass.instructor_id)?.name || 'Mr. Reyes'
  const subjectTitle = getSubjectTitle(subjects, selectedClass.subject_id)

  const currentDetailedSheet = detailedGradingSheets[selectedClass.id] || [
    {
      studentId: 'stud-3',
      studentName: 'Juan',
      studentNo: '2026-003',
      prelim: { exam: 80, quiz: 80, activities: 80, computedTermGrade: 80 },
      midterm: { exam: 82, quiz: 82, activities: 82, computedTermGrade: 82 },
      final: { exam: 85, quiz: 85, activities: 85, computedTermGrade: 85 },
      average: 82.3,
      status: 'On Track' as any,
    },
    {
      studentId: 'stud-4',
      studentName: 'Maria',
      studentNo: '2026-004',
      prelim: { exam: 75, quiz: 75, activities: 75, computedTermGrade: 75 },
      midterm: { exam: 78, quiz: 78, activities: 78, computedTermGrade: 78 },
      final: { exam: 80, quiz: 80, activities: 80, computedTermGrade: 80 },
      average: 77.7,
      status: 'On Track' as any,
    },
    {
      studentId: 'stud-1',
      studentName: 'Liam',
      studentNo: '2026-001',
      prelim: { exam: 84, quiz: 86, activities: 85, computedTermGrade: 85 },
      midterm: { exam: 86, quiz: 87, activities: 86, computedTermGrade: 86.3 },
      final: { exam: 87, quiz: 88, activities: 87, computedTermGrade: 87.2 },
      average: 86.2,
      status: 'On Track' as any,
    },
  ]

  const filteredDetailedSheet = currentDetailedSheet.filter((row) =>
    (row.studentName || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
    (row.studentNo || '').toLowerCase().includes(studentSearch.toLowerCase()),
  )

  const filteredSummaryGradebook = gradebook.filter((item) =>
    (item.student?.name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
    (item.student?.student_no || item.student?.studentNo || '').toLowerCase().includes(studentSearch.toLowerCase()),
  )

  function handleSaveGrades() {
    generateReport('Class Record', activeUser?.name ?? 'Instructor')
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Top Banner / Selector */}
      <section
        style={{
          padding: '1.6rem 2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #dbeafe',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Official Gradebook & Grading Sheet
              </span>
              <span
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                Section: {selectedClass.section?.name || 'BSIT'}
              </span>
            </div>
            <h3 style={{ margin: '0.6rem 0 0.25rem 0', fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>
              {subjectTitle}
            </h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
              Instructor: <strong style={{ color: '#0f172a' }}>{instructorName}</strong> • Room: {selectedClass.room || 'Room 201'} • Schedule: {selectedClass.schedule}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Class Selector Dropdown */}
            <select
              value={selectedClass.id}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {getSubjectTitle(subjects, c.subject_id)} ({c.section?.name || 'Section'})
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveGrades}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.2rem',
                fontWeight: 700,
                borderRadius: '10px',
              }}
            >
              <Save size={16} /> Save Grades
            </button>

            <button
              type="button"
              onClick={printReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.2rem',
                background: '#f8fafc',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              <Printer size={16} color="#475569" /> Print Report
            </button>
          </div>
        </div>

        {saveToast && (
          <div
            style={{
              marginTop: '1.2rem',
              padding: '0.8rem 1.2rem',
              borderRadius: '10px',
              background: '#dcfce7',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <Check size={18} /> Grades and computations successfully saved to official school record!
          </div>
        )}
      </section>

      {/* Mode Switch & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Toggle between Detailed Grading Sheet & Summary View */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '0.35rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('detailed')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: viewMode === 'detailed' ? '#ffffff' : 'transparent',
              color: viewMode === 'detailed' ? '#1d4ed8' : '#64748b',
              boxShadow: viewMode === 'detailed' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <FileSpreadsheet size={16} /> Detailed Grading Sheet (Scores Breakdown)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('summary')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: viewMode === 'summary' ? '#ffffff' : 'transparent',
              color: viewMode === 'summary' ? '#1d4ed8' : '#64748b',
              boxShadow: viewMode === 'summary' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Layers size={16} /> Term Summary View
          </button>
        </div>

        {/* Student Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            placeholder="Search student in class..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.4rem',
              paddingRight: '0.8rem',
              paddingTop: '0.65rem',
              paddingBottom: '0.65rem',
              background: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              fontSize: '0.9rem',
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        </div>
      </div>

      {/* 1. DETAILED GRADING SHEET (Exam, Quiz, Activity Breakdown per Term) */}
      {viewMode === 'detailed' && (
        <section
          style={{
            padding: '1.6rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                Itemized Scoring Breakdown: Exam, Quiz & Activities
              </h4>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.88rem', color: '#475569' }}>
                Detailed scores are recorded per period (Prelim, Midterm, Final) with instant automatic weighted calculation.
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                color: '#1d4ed8',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <Info size={15} /> Instant automatic calculation for transparent record keeping
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0, margin: 0, width: '100%' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ borderBottom: '2px solid #cbd5e1', minWidth: '150px', color: '#0f172a', fontWeight: 700 }}>Student</th>
                  {/* Prelim column group */}
                  <th style={{ borderBottom: '2px solid #2563eb', color: '#1d4ed8', textAlign: 'center', fontWeight: 700 }}>Prelim Quiz</th>
                  <th style={{ borderBottom: '2px solid #2563eb', color: '#1d4ed8', textAlign: 'center', fontWeight: 700 }}>Prelim Act</th>
                  <th style={{ borderBottom: '2px solid #2563eb', color: '#1d4ed8', textAlign: 'center', fontWeight: 700 }}>Prelim Exam</th>
                  <th style={{ borderBottom: '2px solid #2563eb', color: '#1e40af', textAlign: 'center', background: '#eff6ff', fontWeight: 800 }}>Prelim Gr.</th>
                  {/* Midterm column group */}
                  <th style={{ borderBottom: '2px solid #059669', color: '#047857', textAlign: 'center', fontWeight: 700 }}>Midterm Quiz</th>
                  <th style={{ borderBottom: '2px solid #059669', color: '#047857', textAlign: 'center', fontWeight: 700 }}>Midterm Act</th>
                  <th style={{ borderBottom: '2px solid #059669', color: '#047857', textAlign: 'center', fontWeight: 700 }}>Midterm Exam</th>
                  <th style={{ borderBottom: '2px solid #059669', color: '#065f46', textAlign: 'center', background: '#f0fdf4', fontWeight: 800 }}>Midterm Gr.</th>
                  {/* Final column group */}
                  <th style={{ borderBottom: '2px solid #7c3aed', color: '#6d28d9', textAlign: 'center', fontWeight: 700 }}>Final Quiz</th>
                  <th style={{ borderBottom: '2px solid #7c3aed', color: '#6d28d9', textAlign: 'center', fontWeight: 700 }}>Final Act</th>
                  <th style={{ borderBottom: '2px solid #7c3aed', color: '#6d28d9', textAlign: 'center', fontWeight: 700 }}>Final Exam</th>
                  <th style={{ borderBottom: '2px solid #7c3aed', color: '#5b21b6', textAlign: 'center', background: '#faf5ff', fontWeight: 800 }}>Final Gr.</th>
                  {/* Overall Average */}
                  <th style={{ borderBottom: '2px solid #d97706', color: '#b45309', textAlign: 'center', background: '#fef3c7', fontWeight: 800 }}>Average</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetailedSheet.map((item) => {
                  const studentName = item.studentName || 'Student'
                  const studentNo = item.studentNo || '2026-001'

                  return (
                    <tr key={item.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{studentName}</strong>
                        <small style={{ color: '#64748b' }}>{studentNo}</small>
                      </td>

                      {/* Prelim Scores */}
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.prelim.quiz}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'prelim', 'quiz', clampScore(e.target.value))
                          }
                          style={{
                            width: '56px',
                            textAlign: 'center',
                            padding: '0.4rem 0.2rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 700,
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.prelim.activities}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'prelim', 'activities', clampScore(e.target.value))
                          }
                          style={{
                            width: '56px',
                            textAlign: 'center',
                            padding: '0.4rem 0.2rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 700,
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.prelim.exam}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'prelim', 'exam', clampScore(e.target.value))
                          }
                          style={{
                            width: '56px',
                            textAlign: 'center',
                            padding: '0.4rem 0.2rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 700,
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#1d4ed8', background: '#eff6ff', fontSize: '0.95rem' }}>
                        {item.prelim.computedTermGrade}
                      </td>

                      {/* Midterm Scores */}
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.midterm.quiz}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'midterm', 'quiz', clampScore(e.target.value))
                          }
                          style={{
                            width: '56px',
                            textAlign: 'center',
                            padding: '0.4rem 0.2rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 700,
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.midterm.activities}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'midterm', 'activities', clampScore(e.target.value))
                          }
                          style={{
                            width: '56px',
                            textAlign: 'center',
                            padding: '0.4rem 0.2rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 700,
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.midterm.exam}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'midterm', 'exam', clampScore(e.target.value))
                          }
                          style={{
                            width: '56px',
                            textAlign: 'center',
                            padding: '0.4rem 0.2rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 700,
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#047857', background: '#f0fdf4', fontSize: '0.95rem' }}>
                        {item.midterm.computedTermGrade}
                      </td>

                      {/* Final Scores */}
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.final.quiz}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'final', 'quiz', clampScore(e.target.value))
                          }
                          style={{
                            width: '56px',
                            textAlign: 'center',
                            padding: '0.4rem 0.2rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 700,
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.final.activities}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'final', 'activities', clampScore(e.target.value))
                          }
                          style={{
                            width: '56px',
                            textAlign: 'center',
                            padding: '0.4rem 0.2rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 700,
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.final.exam}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'final', 'exam', clampScore(e.target.value))
                          }
                          style={{
                            width: '56px',
                            textAlign: 'center',
                            padding: '0.4rem 0.2rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 700,
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#6d28d9', background: '#faf5ff', fontSize: '0.95rem' }}>
                        {item.final.computedTermGrade}
                      </td>

                      {/* Final Average (e.g. Juan: 82.3, Maria: 77.7) */}
                      <td style={{ textAlign: 'center', fontWeight: 900, fontSize: '1.05rem', color: '#b45309', background: '#fef3c7' }}>
                        {item.average}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 2. SUMMARY VIEW (Student, Prelim, Midterm, Final, Average) */}
      {viewMode === 'summary' && (
        <section
          style={{
            padding: '1.6rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          }}
        >
          <h4 style={{ margin: '0 0 1.2rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
            Term Grades Summary Table
          </h4>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ margin: 0, width: '100%' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>Student</th>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>Prelim</th>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>Midterm</th>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>Final</th>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>Average</th>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>GPA Equiv</th>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummaryGradebook.map((item) => {
                  const isRisk = item.computed.status === 'Bound to Fail' || item.computed.status === 'At Risk'
                  return (
                    <tr key={item.row.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{item.student?.name || 'Student'}</strong>
                        <small style={{ color: '#64748b' }}>{item.student?.student_no || item.student?.studentNo}</small>
                      </td>
                      <td style={{ color: '#334155', fontWeight: 600 }}>{item.computed.preliminary}%</td>
                      <td style={{ color: '#334155', fontWeight: 600 }}>{item.computed.midterm}%</td>
                      <td style={{ color: '#334155', fontWeight: 600 }}>{item.computed.final}%</td>
                      <td>
                        <strong style={{ fontSize: '1.05rem', color: '#1d4ed8', fontWeight: 800 }}>{item.computed.overall}%</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #e2e8f0',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                          }}
                        >
                          {item.computed.gpaEquiv}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: isRisk ? '#fee2e2' : '#dcfce7',
                            color: isRisk ? '#b91c1c' : '#15803d',
                            border: isRisk ? '1px solid #fecaca' : '1px solid #bbf7d0',
                          }}
                        >
                          {item.computed.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #e2e8f0' }}>
                <tr>
                  <td style={{ color: '#0f172a', padding: '1rem' }}>Class Average</td>
                  <td colSpan={3} style={{ textAlign: 'right', color: '#475569' }}>Class Mean:</td>
                  <td>
                    <strong style={{ fontSize: '1.15rem', color: '#1d4ed8', fontWeight: 900 }}>{selectedClassAverages.overallAvg}%</strong>
                  </td>
                  <td style={{ color: '#334155' }}>GPA {selectedClassAverages.gpaAvg}</td>
                  <td>
                    <small style={{ color: '#64748b', fontWeight: 600 }}>
                      {selectedClassAverages.safeCount} Safe • {selectedClassAverages.atRiskCount} At Risk
                    </small>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

export default Gradebook
