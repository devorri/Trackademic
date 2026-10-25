import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../hooks/useAuth'
import { Printer, Eye, X, FlaskConical, BookOpen } from 'lucide-react'

export const StudentGrades: React.FC = () => {
  const { activeUser } = useAuth()
  const { studentTemplateRecords, printStudentGradingBookReport, students } = useData()

  // Match current active student or fallback to Juan Dela Cruz (stud-3)
  const currentStudent = students.find((s) => s.email === activeUser?.email || s.name === activeUser?.name) || students.find((s) => s.id === 'stud-3') || students[0]
  const record = studentTemplateRecords[currentStudent?.id || 'stud-3'] || studentTemplateRecords['stud-3']

  const [selectedSubject, setSelectedSubject] = useState<typeof record.rows[0] | null>(null)

  const overallAverage = Number(
    (record.rows.reduce((sum, r) => sum + r.subjectAverage, 0) / record.rows.length).toFixed(1),
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
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
              Curriculum: 8 Subjects (27 Units)
            </span>
          </div>

          <h3 style={{ margin: '0.5rem 0 0.2rem 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>
            {record.studentName} — Official Grade Report
          </h3>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
            Section: <strong>{record.section}</strong> • Academic Period: <strong>{record.schoolYear}</strong>
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

      {/* Official 8-Subject Grading Sheet Table: Mirroring Grading_Book_Template (1).xlsx */}
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
              Curriculum Assessment Record (8 Subjects)
            </h4>
            <p style={{ margin: '0.2rem 0 0 0', color: '#475569', fontSize: '0.88rem' }}>
              Full itemized scores across Prelim Exam, Quiz, Activity, Attendance, Participation, Laboratory & Major Exams.
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

        <div style={{ overflowX: 'auto', marginTop: '1.2rem', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
          <table style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
                <th style={{ color: '#ffffff', fontWeight: 800, padding: '0.75rem', width: '12%', border: '1px solid #1e3a8a' }}>Subject Code</th>
                <th style={{ color: '#ffffff', fontWeight: 800, padding: '0.75rem', textAlign: 'left', border: '1px solid #1e3a8a' }}>Subject Name</th>
                <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', border: '1px solid #1e3a8a' }}>Prelim Exam</th>
                <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', border: '1px solid #1e3a8a' }}>Quiz</th>
                <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', border: '1px solid #1e3a8a' }}>Activity</th>
                <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', border: '1px solid #1e3a8a' }}>Attendance</th>
                <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', border: '1px solid #1e3a8a' }}>Participation</th>
                <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', border: '1px solid #1e3a8a' }}>Laboratory Exam</th>
                <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', border: '1px solid #1e3a8a' }}>Midterm</th>
                <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', border: '1px solid #1e3a8a' }}>Final</th>
                <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', border: '1px solid #1e3a8a', background: '#0f766e' }}>Subject Average</th>
                <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', border: '1px solid #1e3a8a' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {record.rows.map((row) => (
                <tr key={row.code} style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.75rem 0.85rem', fontWeight: 800, color: '#1e3a8a', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>
                    {row.code}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', borderRight: '1px solid #cbd5e1' }}>
                    <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.95rem' }}>{row.title}</strong>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <span className="chip" style={{ fontSize: '0.72rem' }}>{row.units} Units</span>
                      {row.hasLaboratory ? (
                        <span style={{ fontSize: '0.72rem', color: '#1d4ed8', fontWeight: 700, background: '#eff6ff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          🧪 Lab Component
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, background: '#f8fafc', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          Lecture-Only
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>{row.prelimExam}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>{row.quiz}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>{row.activity}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>{row.attendance}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>{row.participation}</td>
                  <td style={{ textAlign: 'center', borderRight: '1px solid #cbd5e1', background: row.hasLaboratory ? '#f5f3ff' : 'transparent' }}>
                    {row.hasLaboratory ? (
                      <strong style={{ color: '#6b21a8', fontWeight: 800 }}>{row.labExam}</strong>
                    ) : (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.55rem',
                          background: '#e2e8f0',
                          color: '#64748b',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                        }}
                      >
                        N/A
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>{row.midterm}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, borderRight: '1px solid #cbd5e1' }}>{row.final}</td>
                  <td style={{ textAlign: 'center', background: '#ecfdf5', fontWeight: 900, color: '#065f46', fontSize: '1.05rem', borderRight: '1px solid #cbd5e1' }}>
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
              ))}
            </tbody>
            {/* Overall Average Row: Exact replica of Excel Template row 16 */}
            <tfoot style={{ background: '#fef3c7', fontWeight: 900, borderTop: '2.5px solid #b45309' }}>
              <tr>
                <td colSpan={10} style={{ padding: '0.9rem 1.2rem', textAlign: 'right', color: '#92400e', fontSize: '1rem', letterSpacing: '0.04em' }}>
                  OVERALL ACADEMIC AVERAGE:
                </td>
                <td style={{ textAlign: 'center', background: '#fde68a', color: '#92400e', fontSize: '1.25rem', fontWeight: 900, borderRight: '1px solid #cbd5e1' }}>
                  {overallAverage}%
                </td>
                <td style={{ textAlign: 'center', color: '#15803d', fontWeight: 800, fontSize: '0.85rem' }}>
                  PASSED
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Itemized Subject Breakdown Modal */}
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
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '650px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #cbd5e1',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                  {selectedSubject.code} • {selectedSubject.units} Units
                </span>
                <h3 style={{ margin: '0.2rem 0', fontSize: '1.4rem', color: '#0f172a' }}>{selectedSubject.title}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  {selectedSubject.hasLaboratory ? '🧪 Laboratory Subject (Lecture + Lab Exam)' : '📚 Lecture-Only Course'}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.9rem', marginTop: '1.2rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Attendance</span>
                <h4 style={{ margin: '0.3rem 0 0 0', color: '#0f172a', fontSize: '1.3rem' }}>{selectedSubject.attendance}%</h4>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Participation</span>
                <h4 style={{ margin: '0.3rem 0 0 0', color: '#0f172a', fontSize: '1.3rem' }}>{selectedSubject.participation}%</h4>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Quizzes</span>
                <h4 style={{ margin: '0.3rem 0 0 0', color: '#0f172a', fontSize: '1.3rem' }}>{selectedSubject.quiz}%</h4>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Activities</span>
                <h4 style={{ margin: '0.3rem 0 0 0', color: '#0f172a', fontSize: '1.3rem' }}>{selectedSubject.activity}%</h4>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Prelim Exam</span>
                <h4 style={{ margin: '0.3rem 0 0 0', color: '#0f172a', fontSize: '1.3rem' }}>{selectedSubject.prelimExam}%</h4>
              </div>
              <div style={{ background: selectedSubject.hasLaboratory ? '#faf5ff' : '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: selectedSubject.hasLaboratory ? '1.5px solid #d8b4fe' : '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: selectedSubject.hasLaboratory ? '#6b21a8' : '#64748b', fontWeight: 700 }}>
                  Laboratory Exam {selectedSubject.hasLaboratory ? '🧪' : ''}
                </span>
                <h4 style={{ margin: '0.3rem 0 0 0', color: selectedSubject.hasLaboratory ? '#6b21a8' : '#94a3b8', fontSize: '1.3rem' }}>
                  {selectedSubject.hasLaboratory ? `${selectedSubject.labExam}%` : 'N/A'}
                </h4>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Midterm</span>
                <h4 style={{ margin: '0.3rem 0 0 0', color: '#0f172a', fontSize: '1.3rem' }}>{selectedSubject.midterm}%</h4>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Final</span>
                <h4 style={{ margin: '0.3rem 0 0 0', color: '#0f172a', fontSize: '1.3rem' }}>{selectedSubject.final}%</h4>
              </div>
              <div style={{ background: '#ecfdf5', padding: '0.9rem', borderRadius: '10px', border: '1.5px solid #86efac', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 800 }}>Subject Average</span>
                <h4 style={{ margin: '0.3rem 0 0 0', color: '#047857', fontSize: '1.4rem', fontWeight: 900 }}>
                  {selectedSubject.subjectAverage.toFixed(1)}%
                </h4>
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
