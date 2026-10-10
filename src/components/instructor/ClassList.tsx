import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../hooks/useAuth'
import { getSubjectTitle } from '../../utils/helpers'
import { BookOpen, Clock, MapPin, Users, X, Calculator } from 'lucide-react'
import type { ClassRecord } from '../../utils/types'

export const ClassList: React.FC = () => {
  const { classes, subjects, students, allComputedRows, setSelectedClassId, setActiveSection } = useData()
  const { activeUser } = useAuth()

  const [activeViewingClass, setActiveViewingClass] = useState<ClassRecord | null>(null)

  // Filter for instructor's classes, or all classes if not specific
  const instructorClasses = classes.filter(
    (c) => c.instructor_id === activeUser?.id || c.instructor?.id === activeUser?.id,
  )
  const displayClasses = instructorClasses.length > 0 ? instructorClasses : classes

  // When viewing a specific class, get its detailed metrics
  const classStudents = activeViewingClass
    ? students.filter((s) => (activeViewingClass.studentIds || []).includes(s.id))
    : []

  const classRows = activeViewingClass
    ? allComputedRows.filter((r) => r.classItem.id === activeViewingClass.id)
    : []

  const classAvg =
    classRows.length > 0
      ? Math.round(classRows.reduce((acc, r) => acc + r.computed.overall, 0) / classRows.length)
      : 84.5

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Header */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          borderRadius: '16px',
          padding: '1.6rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
            }}
          >
            Teaching Assignments
          </span>
          <h3
            style={{
              margin: '0.5rem 0 0.25rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '1.5rem',
              color: '#0f172a',
              fontWeight: 800,
            }}
          >
            <BookOpen size={22} color="#2563eb" /> Assigned Classes & Schedules
          </h3>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
            View teaching assignments, enrolled student rosters, grades, and class averages
          </p>
        </div>
      </div>

      {/* Classes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.4rem' }}>
        {displayClasses.map((cls) => {
          const subjectTitle = getSubjectTitle(subjects, cls.subject_id)
          const enrolledCount = cls.studentIds?.length || 0

          return (
            <div
              key={cls.id}
              style={{
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                <span
                  style={{
                    color: '#1d4ed8',
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '999px',
                  }}
                >
                  {cls.section?.name || 'BSIT'}
                </span>
                <h4 style={{ margin: '0.7rem 0 0.4rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
                  {subjectTitle}
                </h4>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                    margin: '1rem 0 1.4rem 0',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '1rem',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: '#334155', fontWeight: 500 }}>
                    <Clock size={16} color="#059669" />
                    <span>{cls.schedule || 'MWF 9:00 AM – 10:30 AM'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: '#334155', fontWeight: 500 }}>
                    <MapPin size={16} color="#7c3aed" />
                    <span>{cls.room || 'Room 201'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: '#334155', fontWeight: 500 }}>
                    <Users size={16} color="#d97706" />
                    <span>{enrolledCount} Enrolled Students</span>
                  </div>
                </div>
              </div>

              {/* View Class & Grades Buttons */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setActiveViewingClass(cls)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontWeight: 700,
                    borderRadius: '10px',
                  }}
                >
                  View Class
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClassId(cls.id)
                    setActiveSection('gradebook')
                  }}
                  style={{
                    padding: '0.65rem 1rem',
                    cursor: 'pointer',
                    background: '#f8fafc',
                    color: '#0f172a',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontWeight: 700,
                  }}
                >
                  <Calculator size={16} color="#2563eb" /> Grades
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* "View Class" Interactive Details Modal */}
      {activeViewingClass && (
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
          onClick={() => setActiveViewingClass(null)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '20px',
              maxWidth: '850px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
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
                  Assigned Classes Details
                </span>
                <h3 style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>
                  {getSubjectTitle(subjects, activeViewingClass.subject_id)} – {activeViewingClass.section?.name || 'N/A'}
                </h3>
                <div style={{ display: 'flex', gap: '1rem', color: '#475569', fontSize: '0.9rem', marginTop: '0.3rem', fontWeight: 500 }}>
                  <span>📅 {activeViewingClass.schedule || 'MWF 9:00 AM – 10:30 AM'}</span>
                  <span>📍 {activeViewingClass.room || 'Room 201'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveViewingClass(null)}
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

            {/* Class Average & Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '1.6rem',
              }}
            >
              <div style={{ background: '#eff6ff', padding: '1.2rem', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '0.78rem', color: '#1e40af', textTransform: 'uppercase', fontWeight: 700 }}>Class Average</span>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.2rem' }}>
                  {classAvg}%
                </div>
                <small style={{ color: '#3b82f6', fontWeight: 500 }}>Overall Class Performance</small>
              </div>

              <div style={{ background: '#f0fdf4', padding: '1.2rem', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '0.78rem', color: '#166534', textTransform: 'uppercase', fontWeight: 700 }}>Total Enrolled</span>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#15803d', marginTop: '0.2rem' }}>
                  {classStudents.length} Students
                </div>
                <small style={{ color: '#16a34a', fontWeight: 500 }}>Active Cohort Roster</small>
              </div>

              <div style={{ background: '#fef2f2', padding: '1.2rem', borderRadius: '14px', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '0.78rem', color: '#991b1b', textTransform: 'uppercase', fontWeight: 700 }}>At-Risk Flagged</span>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.2rem' }}>
                  {classRows.filter((r) => r.computed.status === 'At Risk' || r.computed.status === 'Bound to Fail').length}
                </div>
                <small style={{ color: '#dc2626', fontWeight: 500 }}>Requires Guidance</small>
              </div>
            </div>

            {/* Student List, Grades & Student Performance Table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.15rem', fontWeight: 800 }}>
                  Student List, Grades & Performance
                </h4>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setSelectedClassId(activeViewingClass.id)
                    setActiveViewingClass(null)
                    setActiveSection('gradebook')
                  }}
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem', fontWeight: 700 }}
                >
                  Open in Gradebook
                </button>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Student</th>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Prelim</th>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Midterm</th>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Final</th>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Average</th>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Student Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '1.8rem' }}>
                          No grades recorded yet for this class.
                        </td>
                      </tr>
                    ) : (
                      classRows.map((row, idx) => {
                        const isRisk = row.computed.status === 'Bound to Fail' || row.computed.status === 'At Risk'
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td>
                              <strong style={{ color: '#0f172a' }}>{row.student?.name || 'Student'}</strong>
                              <small style={{ color: '#64748b', display: 'block' }}>{row.student?.student_no || row.student?.studentNo}</small>
                            </td>
                            <td style={{ color: '#334155' }}>{row.computed.preliminary}%</td>
                            <td style={{ color: '#334155' }}>{row.computed.midterm}%</td>
                            <td style={{ color: '#334155' }}>{row.computed.final}%</td>
                            <td>
                              <strong style={{ color: '#1d4ed8', fontSize: '1rem' }}>{row.computed.overall}%</strong>
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
                                {row.computed.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassList
