import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../hooks/useAuth'
import { getSubjectTitle, clampScore } from '../../utils/helpers'
import { Save, Printer, Search, Layers, FileSpreadsheet, Check, Info, FlaskConical, BookOpen } from 'lucide-react'

export const Gradebook: React.FC = () => {
  const { activeUser } = useAuth()
  const {
    classes,
    subjects,
    selectedClass,
    setSelectedClassId,
    instructors,
    students,
    gradebook,
    selectedClassAverages,
    detailedGradingSheets,
    updateDetailedGrade,
    generateReport,
    printReport,
    printStudentGradingBookReport,
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

  const instructorName = instructors.find((i) => i.id === selectedClass.instructor_id)?.name || 'Prof. Ochavilla'
  const currentSubject = subjects.find((s) => s.id === selectedClass.subject_id)
  const subjectTitle = getSubjectTitle(subjects, selectedClass.subject_id)
  const hasLaboratory = currentSubject?.has_laboratory ?? (selectedClass.subject?.has_laboratory ?? false)

  const currentDetailedSheet = detailedGradingSheets[selectedClass.id] || (
    selectedClass.studentIds?.map((stId) => {
      const st = students.find((s) => s.id === stId)
      return {
        studentId: stId,
        studentName: st?.name || 'Student',
        studentNo: st?.student_no || '2026-001',
        prelimExam: 82,
        quiz: 84,
        activity: 85,
        attendance: 90,
        participation: 88,
        labExam: hasLaboratory ? 86 : null,
        midterm: 83,
        final: 85,
        average: 85.4,
        status: 'On Track' as any,
        prelim: { exam: 82, quiz: 84, activities: 85, attendance: 90, participation: 88, labExam: hasLaboratory ? 86 : null, computedTermGrade: 85 },
      }
    }) || []
  )

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #dbeafe',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                Official Grading Book
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
                Section: {selectedClass.section?.name || 'BSIT-2A'}
              </span>

              {/* Laboratory vs Non-Laboratory Indicator */}
              {hasLaboratory ? (
                <span
                  style={{
                    background: '#e0e7ff',
                    color: '#3730a3',
                    border: '1px solid #c7d2fe',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <FlaskConical size={12} /> With Laboratory Exam
                </span>
              ) : (
                <span
                  style={{
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <BookOpen size={12} /> Lecture-Only Subject (No Lab)
                </span>
              )}
            </div>

            <h3 style={{ margin: '0.6rem 0 0.25rem 0', fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>
              {currentSubject?.code ? `${currentSubject.code} — ` : ''}{subjectTitle}
            </h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
              Instructor / Trainer: <strong style={{ color: '#0f172a' }}>{instructorName}</strong> • Room: {selectedClass.room || 'Computer Lab 1'} • Schedule: {selectedClass.schedule}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
              {classes.map((c) => {
                const s = subjects.find((subj) => subj.id === c.subject_id)
                return (
                  <option key={c.id} value={c.id}>
                    {s?.code || 'SUBJ'} - {getSubjectTitle(subjects, c.subject_id)} ({c.section?.name || 'Section'})
                  </option>
                )
              })}
            </select>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveGrades}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.1rem',
                fontWeight: 700,
                borderRadius: '10px',
              }}
            >
              <Save size={16} /> Save Grades
            </button>

            {/* Print Class Grade Record PDF */}
            <button
              type="button"
              onClick={printReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.1rem',
                background: '#ffffff',
                color: '#1e3a8a',
                border: '1.5px solid #bfdbfe',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              <Printer size={16} color="#2563eb" /> Print Class Record (PDF)
            </button>

            {/* Print Student Grade Book (Template PDF) */}
            <button
              type="button"
              onClick={() => printStudentGradingBookReport()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.1rem',
                background: '#f8fafc',
                color: '#047857',
                border: '1.5px solid #a7f3d0',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
              title="Prints 8-Subject Student Grading Book matching Grading_Book_Template (1).xlsx"
            >
              <FileSpreadsheet size={16} color="#059669" /> Print Student Grade Book (Template PDF)
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
        {/* Toggle between Detailed Assessment Sheet & Summary View */}
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
            <FileSpreadsheet size={16} /> Official Assessment Sheet (Aligned with Excel Template)
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
            placeholder="Search student name..."
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

      {/* 1. OFFICIAL ASSESSMENT SHEET: Aligned 100% with Grading_Book_Template (1).xlsx */}
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
                Assessment Scoring Breakdown: Prelim Exam, Quiz, Activity, Attendance, Participation, Laboratory & Major Exams
              </h4>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.88rem', color: '#475569' }}>
                Aligned with official template columns. Laboratory Exam is active for lab subjects and marked as N/A for lecture-only subjects.
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
              <Info size={15} /> Auto-calculated subject average mirroring official Excel formula
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0, margin: 0, width: '100%' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ borderBottom: '2px solid #cbd5e1', minWidth: '180px', color: '#0f172a', fontWeight: 800 }}>Student Name</th>
                  <th style={{ borderBottom: '2px solid #2563eb', color: '#1d4ed8', textAlign: 'center', fontWeight: 700 }}>Prelim Exam</th>
                  <th style={{ borderBottom: '2px solid #2563eb', color: '#1d4ed8', textAlign: 'center', fontWeight: 700 }}>Quiz</th>
                  <th style={{ borderBottom: '2px solid #2563eb', color: '#1d4ed8', textAlign: 'center', fontWeight: 700 }}>Activity</th>
                  <th style={{ borderBottom: '2px solid #059669', color: '#047857', textAlign: 'center', fontWeight: 700 }}>Attendance</th>
                  <th style={{ borderBottom: '2px solid #059669', color: '#047857', textAlign: 'center', fontWeight: 700 }}>Participation</th>
                  <th style={{ borderBottom: '2px solid #7c3aed', color: '#6d28d9', textAlign: 'center', fontWeight: 700, background: hasLaboratory ? '#faf5ff' : '#f8fafc' }}>
                    Laboratory Exam {hasLaboratory ? '🧪' : ''}
                  </th>
                  <th style={{ borderBottom: '2px solid #059669', color: '#047857', textAlign: 'center', fontWeight: 700 }}>Midterm</th>
                  <th style={{ borderBottom: '2px solid #7c3aed', color: '#6d28d9', textAlign: 'center', fontWeight: 700 }}>Final</th>
                  <th style={{ borderBottom: '2px solid #d97706', color: '#b45309', textAlign: 'center', background: '#fef3c7', fontWeight: 800 }}>Subject Average</th>
                  <th style={{ borderBottom: '2px solid #cbd5e1', color: '#334155', textAlign: 'center', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetailedSheet.map((item) => {
                  const studentName = item.studentName || 'Student'
                  const prelimScore = item.prelimExam ?? item.prelim?.exam ?? 0
                  const quizScore = item.quiz ?? item.prelim?.quiz ?? 0
                  const activityScore = item.activity ?? item.prelim?.activities ?? 0
                  const attendanceScore = item.attendance ?? 85
                  const participationScore = item.participation ?? 85
                  const midtermScore = typeof item.midterm === 'number' ? item.midterm : (item.midterm?.computedTermGrade || prelimScore)
                  const finalScore = typeof item.final === 'number' ? item.final : (item.final?.computedTermGrade || prelimScore)

                  return (
                    <tr key={item.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Student Name (No raw ID number needed) */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.98rem' }}>{studentName}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Enrolled Student</span>
                      </td>

                      {/* 1. Prelim Exam */}
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={prelimScore}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'prelimExam', clampScore(e.target.value))
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

                      {/* 2. Quiz */}
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={quizScore}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'quiz', clampScore(e.target.value))
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

                      {/* 3. Activity */}
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={activityScore}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'activity', clampScore(e.target.value))
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

                      {/* 4. Attendance */}
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={attendanceScore}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'attendance', clampScore(e.target.value))
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

                      {/* 5. Participation */}
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={participationScore}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'participation', clampScore(e.target.value))
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

                      {/* 6. Laboratory Exam (Active if hasLaboratory, N/A if lecture-only) */}
                      <td style={{ textAlign: 'center', padding: '0.5rem', background: hasLaboratory ? '#faf5ff' : 'transparent' }}>
                        {hasLaboratory ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.labExam ?? 85}
                            onChange={(e) =>
                              updateDetailedGrade(selectedClass.id, item.studentId, 'labExam', clampScore(e.target.value))
                            }
                            style={{
                              width: '56px',
                              textAlign: 'center',
                              padding: '0.4rem 0.2rem',
                              borderRadius: '8px',
                              border: '1.5px solid #a855f7',
                              background: '#ffffff',
                              color: '#6b21a8',
                              fontWeight: 800,
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.65rem',
                              background: '#e2e8f0',
                              color: '#64748b',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              letterSpacing: '0.04em',
                            }}
                          >
                            N/A
                          </span>
                        )}
                      </td>

                      {/* 7. Midterm */}
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={midtermScore}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'midterm', clampScore(e.target.value))
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

                      {/* 8. Final */}
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={finalScore}
                          onChange={(e) =>
                            updateDetailedGrade(selectedClass.id, item.studentId, 'final', clampScore(e.target.value))
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

                      {/* Subject Average (Green highlight matching template) */}
                      <td style={{ textAlign: 'center', fontWeight: 900, fontSize: '1.05rem', color: '#065f46', background: '#ecfdf5' }}>
                        {item.average ? item.average.toFixed(1) : '0.0'}%
                      </td>

                      {/* Remarks */}
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: item.status === 'Bound to Fail' ? '#fee2e2' : item.status === 'At Risk' ? '#ffedd5' : '#dcfce7',
                            color: item.status === 'Bound to Fail' ? '#991b1b' : item.status === 'At Risk' ? '#9a3412' : '#166534',
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 2. SUMMARY VIEW (Student Name, Prelim, Midterm, Final, Average) */}
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
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>Student Name</th>
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
                        <small style={{ color: '#64748b' }}>Enrolled Student</small>
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
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: isRisk ? '#fee2e2' : '#dcfce7',
                            color: isRisk ? '#991b1b' : '#166534',
                          }}
                        >
                          {item.computed.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Class Statistics Footer */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ background: '#ffffff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Class Batch Average</span>
          <h3 style={{ margin: '0.4rem 0 0 0', color: '#1e3a8a', fontSize: '1.5rem', fontWeight: 800 }}>
            {selectedClassAverages.overallAvg}%
          </h3>
        </div>
        <div style={{ background: '#ffffff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>GPA Equivalent</span>
          <h3 style={{ margin: '0.4rem 0 0 0', color: '#047857', fontSize: '1.5rem', fontWeight: 800 }}>
            {selectedClassAverages.gpaAvg}
          </h3>
        </div>
        <div style={{ background: '#ffffff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Enrolled</span>
          <h3 style={{ margin: '0.4rem 0 0 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>
            {filteredDetailedSheet.length} Students
          </h3>
        </div>
        <div style={{ background: '#ffffff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Passing / Safe Count</span>
          <h3 style={{ margin: '0.4rem 0 0 0', color: '#16a34a', fontSize: '1.5rem', fontWeight: 800 }}>
            {selectedClassAverages.safeCount} Students
          </h3>
        </div>
      </section>
    </div>
  )
}
