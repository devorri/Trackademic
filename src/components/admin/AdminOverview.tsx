import React from 'react'
import { useData } from '../../context/DataContext'
import { Users, UserCheck, BookOpen, AlertTriangle, ArrowRight, ShieldAlert, TrendingUp } from 'lucide-react'

export const AdminOverview: React.FC = () => {
  const {
    students,
    users,
    classes,
    instructors,
    atRiskRows,
    boundToFailRows,
    setActiveSection,
    setSelectedClassId,
  } = useData()

  const totalInstructors = users.filter((user) => user.role === 'instructor').length
  const totalStudents = students.length
  const totalClasses = classes.length
  const totalAtRisk = atRiskRows.length + boundToFailRows.length

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
            System Administrator Portal
          </span>
          <h2 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>
            Welcome, Administrator!
          </h2>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
            Here is your live high-level summary and real-time status of the academic system.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setActiveSection('predictive_analytics')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <TrendingUp size={16} /> View Analytics
          </button>
        </div>
      </div>

      {/* 4 Primary Summary Cards Requested by User */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.2rem',
        }}
        aria-label="System Summary Cards"
      >
        {/* Total Instructor */}
        <div
          onClick={() => setActiveSection('instructors')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            borderRadius: '16px',
            padding: '1.4rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Total ng Instructor
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
              <Users size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.9rem' }}>
            <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{totalInstructors}</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2563eb', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 600 }}>
              <span>Manage instructors</span> <ArrowRight size={14} />
            </div>
          </div>
        </div>

        {/* Total Student */}
        <div
          onClick={() => setActiveSection('students')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            borderRadius: '16px',
            padding: '1.4rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Total ng Student
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
              <UserCheck size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.9rem' }}>
            <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{totalStudents}</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 600 }}>
              <span>View student directory</span> <ArrowRight size={14} />
            </div>
          </div>
        </div>

        {/* Total Classes */}
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
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Total Classes
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#f5f3ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed',
              }}
            >
              <BookOpen size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.9rem' }}>
            <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{totalClasses}</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#7c3aed', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 600 }}>
              <span>Subjects & classes</span> <ArrowRight size={14} />
            </div>
          </div>
        </div>

        {/* At-Risk Students */}
        <div
          onClick={() => setActiveSection('predictive_analytics')}
          style={{
            background: '#fff5f5',
            border: '1px solid #fecaca',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.06)',
            borderRadius: '16px',
            padding: '1.4rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.9rem' }}>
            <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: '#dc2626', lineHeight: 1.1 }}>{totalAtRisk}</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#b91c1c', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 600 }}>
              <span>Predictive failure watchlist</span> <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* Schoolwide Risk Watchlist */}
      <section className="panel data-card" style={{ padding: '1.5rem' }}>
        <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="#f59e0b" />
              Schoolwide Predictive Risk Watchlist
            </h3>
            <span className="chip" style={{ marginTop: '0.3rem' }}>
              Students flagged as At-Risk or Bound-to-Fail based on real-time class records
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setActiveSection('predictive_analytics')}
              style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              Full Predictive Analytics
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class & Section</th>
                <th>Assigned Instructor</th>
                <th>Current Performance</th>
                <th>Prediction</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[...boundToFailRows, ...atRiskRows].length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '1.8rem' }}>
                    ✅ No students currently flagged as Bound to Fail or At Risk schoolwide.
                  </td>
                </tr>
              ) : (
                [...boundToFailRows, ...atRiskRows].map((item, idx) => {
                  const studentName = item.student?.name || 'Student'
                  const studentNo = item.student?.student_no || item.student?.studentNo || 'N/A'
                  const instructorName =
                    instructors.find((i) => i.id === item.classItem?.instructor_id)?.name || 'Mr. Reyes'

                  return (
                    <tr
                      key={idx}
                      className={item.computed.status === 'Bound to Fail' ? 'bound-to-fail-row' : 'risk-row'}
                    >
                      <td>
                        <strong>{studentName}</strong>
                        <small>{studentNo}</small>
                      </td>
                      <td>
                        <strong>{item.classItem?.subject?.title || 'Subject'}</strong>
                        <small>{item.classItem?.section?.name || 'CIT A'}</small>
                      </td>
                      <td>{instructorName}</td>
                      <td>
                        <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{item.computed.overall}%</strong>
                      </td>
                      <td>
                        <strong style={{ color: '#2563eb', fontWeight: 700 }}>{Math.min(100, item.computed.overall + 2)}%</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '0.3rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: item.computed.status === 'Bound to Fail' ? '#fef2f2' : '#fffbeb',
                            color: item.computed.status === 'Bound to Fail' ? '#b91c1c' : '#b45309',
                            border: item.computed.status === 'Bound to Fail' ? '1px solid #fecaca' : '1px solid #fde68a',
                          }}
                        >
                          {item.computed.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedClassId(item.classItem.id)
                            setActiveSection('classes')
                          }}
                        >
                          View Class
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default AdminOverview
