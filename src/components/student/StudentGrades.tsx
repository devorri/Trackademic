import React, { useState } from 'react'
import { User, Eye, X, CheckCircle2 } from 'lucide-react'

type StudentSubjectGrade = {
  id: string
  subject: string
  code: string
  instructor: string
  prelim: number
  midterm: number
  final: number | null
  average: number
  examScore: number
  quizScore: number
  activityScore: number
  status: string
}

export const StudentGrades: React.FC = () => {
  const [selectedSubjectForView, setSelectedSubjectForView] = useState<StudentSubjectGrade | null>(null)

  // Enrolled subjects exactly matching user examples:
  // Database: 85, 87, 89, 87 (Instructor: Mr. Reyes)
  // Networking: 80, 82, 84, 82 (Instructor: Ms. Santos)
  // Web Dev: 90, 91, null (Instructor: Mr. Reyes)
  // Plus additional subjects to total 6 subjects:
  const gradesList: StudentSubjectGrade[] = [
    {
      id: 'sub-1',
      subject: 'Database Management',
      code: 'IT301',
      instructor: 'Mr. Reyes',
      prelim: 85,
      midterm: 87,
      final: 89,
      average: 87,
      examScore: 88,
      quizScore: 86,
      activityScore: 87,
      status: 'Passed',
    },
    {
      id: 'sub-2',
      subject: 'Networking',
      code: 'IT202',
      instructor: 'Ms. Santos',
      prelim: 80,
      midterm: 82,
      final: 84,
      average: 82,
      examScore: 82,
      quizScore: 81,
      activityScore: 83,
      status: 'Passed',
    },
    {
      id: 'sub-3',
      subject: 'Web Dev',
      code: 'IT205',
      instructor: 'Mr. Reyes',
      prelim: 90,
      midterm: 91,
      final: null,
      average: 90.5,
      examScore: 92,
      quizScore: 90,
      activityScore: 90,
      status: 'In Progress',
    },
    {
      id: 'sub-4',
      subject: 'Introduction to Computing',
      code: 'CS101',
      instructor: 'Mr. Reyes',
      prelim: 84,
      midterm: 86,
      final: 85,
      average: 85,
      examScore: 85,
      quizScore: 84,
      activityScore: 86,
      status: 'Passed',
    },
    {
      id: 'sub-5',
      subject: 'Data Structures',
      code: 'CS201',
      instructor: 'Adrian Josh',
      prelim: 82,
      midterm: 84,
      final: 86,
      average: 84,
      examScore: 84,
      quizScore: 83,
      activityScore: 85,
      status: 'Passed',
    },
    {
      id: 'sub-6',
      subject: 'Systems Analysis',
      code: 'IT304',
      instructor: 'Kissy S.',
      prelim: 83,
      midterm: 85,
      final: 87,
      average: 85,
      examScore: 86,
      quizScore: 84,
      activityScore: 85,
      status: 'Passed',
    },
  ]

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
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#1d4ed8',
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
            }}
          >
            Official Term Records
          </span>
          <h3 style={{ margin: '0.5rem 0 0.2rem 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>
            My Academic Grades
          </h3>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
            Official read-only grades issued and certified by your assigned subject instructors.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontSize: '0.88rem', fontWeight: 700, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.5rem 0.9rem', borderRadius: '10px' }}>
          <CheckCircle2 size={18} color="#16a34a" /> All grades are locked & certified
        </div>
      </div>

      {/* Grades Table */}
      <section
        style={{
          padding: '1.6rem 2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              Current Semester Enrolled Subjects (6 Subjects)
            </h4>
            <p style={{ margin: '0.2rem 0 0 0', color: '#475569', fontSize: '0.9rem' }}>
              Academic Year 2025-2026 • 1st Semester
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '1.2rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ margin: 0, width: '100%' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ minWidth: '220px', color: '#0f172a', fontWeight: 700 }}>Subject & Instructor</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Prelim</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Midterm</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Final</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Average</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Status</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {gradesList.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {/* Subject and Teacher right below it */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{item.subject}</strong>
                      <span style={{ fontSize: '0.82rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem', fontWeight: 600 }}>
                        <User size={14} /> {item.instructor}
                      </span>
                    </div>
                  </td>

                  <td>
                    <strong style={{ fontSize: '0.95rem', color: '#334155' }}>{item.prelim}</strong>
                  </td>

                  <td>
                    <strong style={{ fontSize: '0.95rem', color: '#334155' }}>{item.midterm}</strong>
                  </td>

                  <td>
                    {item.final !== null ? (
                      <strong style={{ fontSize: '0.95rem', color: '#334155' }}>{item.final}</strong>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 500 }}>Pending</span>
                    )}
                  </td>

                  <td>
                    <strong style={{ fontSize: '1.1rem', color: '#1d4ed8', fontWeight: 800 }}>{item.average}</strong>
                  </td>

                  <td>
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: item.status === 'Passed' ? '#f0fdf4' : '#fef3c7',
                        color: item.status === 'Passed' ? '#15803d' : '#b45309',
                        border: item.status === 'Passed' ? '1px solid #bbf7d0' : '1px solid #fde68a',
                      }}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td>
                    {/* "View Grades" Button Requested by User */}
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setSelectedSubjectForView(item)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.82rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                        fontWeight: 700,
                        borderRadius: '8px',
                      }}
                    >
                      <Eye size={14} /> View Grades
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #e2e8f0' }}>
              <tr>
                <td style={{ color: '#0f172a', padding: '1rem' }}>Cumulative Standing</td>
                <td colSpan={3} style={{ textAlign: 'right', color: '#475569' }}>Cumulative Final Average:</td>
                <td>
                  <strong style={{ fontSize: '1.2rem', color: '#1d4ed8', fontWeight: 900 }}>85.5%</strong>
                </td>
                <td colSpan={2}>
                  <span
                    style={{
                      background: '#f0fdf4',
                      color: '#15803d',
                      border: '1px solid #bbf7d0',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    ON TRACK
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* "View Grades" Detailed Breakdown Modal */}
      {selectedSubjectForView && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setSelectedSubjectForView(null)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.4rem' }}>
              <div>
                <span
                  style={{
                    color: '#1d4ed8',
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  Detailed Breakdown
                </span>
                <h3 style={{ margin: '0.5rem 0 0.1rem 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>
                  {selectedSubjectForView.subject}
                </h3>
                <small style={{ color: '#475569', fontSize: '0.88rem' }}>
                  Instructor: <strong style={{ color: '#0f172a' }}>{selectedSubjectForView.instructor}</strong> • Code: {selectedSubjectForView.code}
                </small>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubjectForView(null)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', marginBottom: '1.4rem' }}>
              <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #dbeafe' }}>
                <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Prelim Grade</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.2rem' }}>
                  {selectedSubjectForView.prelim}%
                </div>
              </div>

              <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Midterm Grade</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', marginTop: '0.2rem' }}>
                  {selectedSubjectForView.midterm}%
                </div>
              </div>

              <div style={{ background: '#faf5ff', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #e9d5ff' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b21a8', fontWeight: 700, textTransform: 'uppercase' }}>Final Grade</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.2rem' }}>
                  {selectedSubjectForView.final !== null ? `${selectedSubjectForView.final}%` : 'TBA'}
                </div>
              </div>
            </div>

            {/* Itemized Assessment Breakdown */}
            <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.4rem' }}>
              <h5 style={{ margin: '0 0 0.8rem 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: 800 }}>
                Itemized Assessment Scores:
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569' }}>
                  <span>Major Examination Score:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedSubjectForView.examScore} / 100</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569' }}>
                  <span>Quizzes Average:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedSubjectForView.quizScore} / 100</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569' }}>
                  <span>Activities & Assignments:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedSubjectForView.activityScore} / 100</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>Cumulative Weighted Average:</span>
              <strong style={{ fontSize: '1.5rem', color: '#1d4ed8', fontWeight: 900 }}>{selectedSubjectForView.average}%</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentGrades
