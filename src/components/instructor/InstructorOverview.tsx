import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../context/DataContext'
import { BookOpen, Users, Clock, AlertTriangle } from 'lucide-react'
import { getSubjectTitle } from '../../utils/helpers'

export const InstructorOverview: React.FC = () => {
  const { activeUser } = useAuth()
  const { classes, subjects, setSelectedClassId, setActiveSection } = useData()

  // As specified by user:
  // My Classes: 3
  // Total Students: 105
  // Pending Grades: 12
  // At-Risk Students: 8
  const myClassesCount = 3
  const totalStudentsCount = 105
  const pendingGradesCount = 12
  const atRiskStudentsCount = 8

  const featuredClass =
    classes.find((c) => getSubjectTitle(subjects, c.subject_id).includes('Introduction')) ||
    classes[0]

  const featuredClassTitle = featuredClass ? getSubjectTitle(subjects, featuredClass.subject_id) : 'Introduction to Computing'
  const classAverageDisplay = '84.5%'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Welcome Banner */}
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
            Instructor Portal
          </span>
          <h2 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>
            Welcome, {activeUser?.name || 'Instructor'}!
          </h2>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
            Manage your grading sheets, analyze student academic risk, and track assigned classes.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setActiveSection('gradebook')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
        >
          <BookOpen size={16} /> Open Gradebook
        </button>
      </div>

      {/* 4 Summary Cards Requested by User:
          ┌────────────┐ ┌──────────────┐
          │ My Classes │ │ Total Students│
          │     3      │ │      105      │
          └────────────┘ └──────────────┘
          ┌──────────────┐ ┌────────────────┐
          │ Pending Grade│ │ At-Risk Students│
          │      12      │ │       8        │
          └──────────────┘ └────────────────┘
      */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.2rem',
        }}
        aria-label="Instructor Summary Cards"
      >
        {/* My Classes: 3 */}
        <div
          onClick={() => setActiveSection('classes')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            borderRadius: '16px',
            padding: '1.4rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              My Classes
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <BookOpen size={18} />
            </div>
          </div>
          <div style={{ marginTop: '0.9rem' }}>
            <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{myClassesCount}</strong>
            <small style={{ display: 'block', color: '#2563eb', marginTop: '0.3rem', fontWeight: 600 }}>Assigned teaching schedules</small>
          </div>
        </div>

        {/* Total Students: 105 */}
        <div
          onClick={() => setActiveSection('classes')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            borderRadius: '16px',
            padding: '1.4rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Total Students
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <div style={{ marginTop: '0.9rem' }}>
            <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{totalStudentsCount}</strong>
            <small style={{ display: 'block', color: '#16a34a', marginTop: '0.3rem', fontWeight: 600 }}>Enrolled across all sections</small>
          </div>
        </div>

        {/* Pending Grade: 12 */}
        <div
          onClick={() => setActiveSection('gradebook')}
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.05)',
            borderRadius: '16px',
            padding: '1.4rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Pending Grades
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ marginTop: '0.9rem' }}>
            <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>{pendingGradesCount}</strong>
            <small style={{ display: 'block', color: '#b45309', marginTop: '0.3rem', fontWeight: 600 }}>Items to encode / finalize</small>
          </div>
        </div>

        {/* At-Risk Students: 8 */}
        <div
          onClick={() => setActiveSection('analytics')}
          style={{
            background: '#fff5f5',
            border: '1px solid #fecaca',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.06)',
            borderRadius: '16px',
            padding: '1.4rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              At-Risk Students
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
              }}
            >
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ marginTop: '0.9rem' }}>
            <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: '#dc2626', lineHeight: 1.1 }}>{atRiskStudentsCount}</strong>
            <small style={{ display: 'block', color: '#b91c1c', marginTop: '0.3rem', fontWeight: 600 }}>Require remedial guidance</small>
          </div>
        </div>
      </section>

      {/* CLASS PERFORMANCE CARD
          Introduction to Computing
          Class Average: 84.5%
          [View Class]    [View Analytics]
      */}
      <section
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          borderRadius: '16px',
          padding: '1.8rem 2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
              CLASS PERFORMANCE
            </span>
            <h3 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
              {featuredClassTitle}
            </h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
              Class Average:{' '}
              <strong style={{ color: '#2563eb', fontSize: '1.25rem', fontWeight: 800 }}>{classAverageDisplay}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (featuredClass) setSelectedClassId(featuredClass.id)
                setActiveSection('classes')
              }}
              style={{ padding: '0.7rem 1.4rem', cursor: 'pointer', fontWeight: 700 }}
            >
              View Class
            </button>
            <button
              type="button"
              onClick={() => {
                if (featuredClass) setSelectedClassId(featuredClass.id)
                setActiveSection('analytics')
              }}
              style={{
                padding: '0.7rem 1.4rem',
                cursor: 'pointer',
                background: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              View Analytics
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default InstructorOverview
