import React, { useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../context/DataContext'
import { Award, CheckCircle, BookOpen, TrendingUp } from 'lucide-react'

export const StudentOverview: React.FC = () => {
  const { activeUser } = useAuth()
  const { setActiveSection, students, classes, detailedGradingSheets } = useData()

  const currentStudent = useMemo(
    () =>
      students.find(
        (s) =>
          s.profile_id === activeUser?.id ||
          s.id === activeUser?.id ||
          (activeUser?.email && s.email?.toLowerCase() === activeUser.email.toLowerCase()) ||
          (activeUser?.name && s.name?.toLowerCase() === activeUser.name.toLowerCase()),
      ),
    [students, activeUser],
  )

  const enrolledClasses = useMemo(() => {
    if (!currentStudent) return []
    return classes.filter((c) => (c.studentIds || []).includes(currentStudent.id))
  }, [classes, currentStudent])

  const studentGradesList = useMemo(() => {
    if (!currentStudent) return []
    return enrolledClasses
      .map((cls) => {
        const sheetRow = (detailedGradingSheets[cls.id] || []).find(
          (r) => r.studentId === currentStudent.id,
        )
        return sheetRow?.average ? Math.round(sheetRow.average) : 0
      })
      .filter((avg) => avg > 0)
  }, [enrolledClasses, detailedGradingSheets, currentStudent])

  const finalAverageNum =
    studentGradesList.length > 0
      ? Math.round(
          studentGradesList.reduce((acc, v) => acc + v, 0) / studentGradesList.length,
        )
      : 0

  const finalAverage = finalAverageNum > 0 ? `${finalAverageNum}%` : '—'
  const totalSubjects = enrolledClasses.length
  const academicStatus =
    finalAverageNum === 0
      ? 'Pending'
      : finalAverageNum >= 90
      ? 'Excellent'
      : finalAverageNum >= 75
      ? 'On Track'
      : 'At Risk'
  const predictedGrade =
    finalAverageNum > 0 ? `${Math.min(100, Math.round(finalAverageNum + 2))}%` : '—'
  const studentName = currentStudent?.name || activeUser?.name || 'Student'

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
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
            }}
          >
            STUDENT DASHBOARD
          </span>
          <h2 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>
            Welcome, {studentName}!
          </h2>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
            Check your current academic standing, rounded term grades, and predictive performance forecast.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setActiveSection('grades')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, borderRadius: '10px' }}
        >
          <BookOpen size={16} /> View My Grades
        </button>
      </div>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.2rem',
        }}
        aria-label="Student Standing Cards"
      >
        <div
          onClick={() => setActiveSection('grades')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Current Average
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1d4ed8',
              }}
            >
              <Award size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.8rem' }}>
            <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1d4ed8' }}>{finalAverage}</strong>
            <small style={{ display: 'block', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>
              Rounded cumulative grade
            </small>
          </div>
        </div>

        <div
          onClick={() => setActiveSection('prediction')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Academic Status
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#15803d',
              }}
            >
              <CheckCircle size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.8rem' }}>
            <strong
              style={{
                fontSize: '2.1rem',
                fontWeight: 800,
                color: academicStatus === 'At Risk' ? '#dc2626' : '#15803d',
              }}
            >
              {academicStatus}
            </strong>
            <small style={{ display: 'block', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>
              {finalAverageNum > 0 ? 'Based on encoded grades' : 'Awaiting grade encoding'}
            </small>
          </div>
        </div>

        <div
          onClick={() => setActiveSection('grades')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Subjects
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed',
              }}
            >
              <BookOpen size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.8rem' }}>
            <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: '#7c3aed' }}>{totalSubjects}</strong>
            <small style={{ display: 'block', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>
              Enrolled credit courses
            </small>
          </div>
        </div>

        <div
          onClick={() => setActiveSection('prediction')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Predicted Grade
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.8rem' }}>
            <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: '#b45309' }}>{predictedGrade}</strong>
            <small style={{ display: 'block', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>
              Academic end-of-term projection
            </small>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: '1.8rem 2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>
              Current Academic Standing
            </h3>
            <p style={{ margin: '0.3rem 0 0 0', color: '#475569', fontSize: '0.92rem' }}>
              {totalSubjects > 0
                ? `You are currently enrolled in ${totalSubjects} subject(s) with ${studentGradesList.length} subject(s) having encoded grades.`
                : 'You are not enrolled in any subjects yet.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setActiveSection('grades')}
              style={{ padding: '0.65rem 1.2rem', fontWeight: 700, borderRadius: '10px' }}
            >
              View Detailed Grades
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('performance')}
              style={{
                padding: '0.65rem 1.2rem',
                background: '#f8fafc',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Performance Insights
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default StudentOverview
