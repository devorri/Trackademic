import React, { useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../context/DataContext'
import { AlertTriangle, TrendingUp } from 'lucide-react'

export const StudentPrediction: React.FC = () => {
  const { activeUser } = useAuth()
  const { students, classes, subjects, detailedGradingSheets } = useData()

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

  const subjectForecasts = useMemo(() => {
    if (!currentStudent) return []
    const enrolled = classes.filter((c) => (c.studentIds || []).includes(currentStudent.id))
    return enrolled.map((cls) => {
      const subj = subjects.find((s) => s.id === cls.subject_id) || cls.subject
      const sheetRow = (detailedGradingSheets[cls.id] || []).find(
        (r) => r.studentId === currentStudent.id,
      )
      const currentAvg = sheetRow?.average ? Math.round(sheetRow.average) : 0
      const predictedAvg = currentAvg > 0 ? Math.min(100, currentAvg + 2) : 0
      let status = 'Pending'
      let note = 'Awaiting grade encoding'
      if (currentAvg > 0) {
        if (currentAvg >= 90) {
          status = 'High'
          note = 'Academic honors pace'
        } else if (currentAvg >= 75) {
          status = 'On Track'
          note = 'Passing comfortably'
        } else {
          status = 'At Risk'
          note = 'Below passing threshold (75%)'
        }
      }
      return {
        classId: cls.id,
        subjectName: `${subj?.code || 'SUBJ'} - ${subj?.title || 'Subject'}`,
        currentAvg,
        predictedAvg,
        status,
        note,
      }
    })
  }, [currentStudent, classes, subjects, detailedGradingSheets])

  const encodedForecasts = subjectForecasts.filter((f) => f.currentAvg > 0)
  const currentPerformance =
    encodedForecasts.length > 0
      ? Math.round(
          encodedForecasts.reduce((acc, f) => acc + f.currentAvg, 0) / encodedForecasts.length,
        )
      : 0
  const predictedPerformance =
    currentPerformance > 0 ? Math.min(100, currentPerformance + 2) : 0

  const status =
    currentPerformance === 0
      ? 'PENDING'
      : currentPerformance >= 75
      ? 'ON TRACK'
      : 'AT RISK'
  const isAtRisk = status === 'AT RISK'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      <section
        style={{
          padding: '2rem',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          borderRadius: '16px',
        }}
      >
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
          Performance Prediction
        </span>
        <h3
          style={{
            margin: '0.6rem 0 0.3rem 0',
            fontSize: '1.6rem',
            color: '#0f172a',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <TrendingUp size={24} color="#2563eb" /> Academic Outcome Forecast
        </h3>
        <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
          Predictive model estimates your end-of-semester result based on your encoded Preliminary, Midterm, Pre-Final, and Final term grades.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.2rem',
            margin: '1.6rem 0',
          }}
        >
          <div style={{ background: '#f8fafc', padding: '1.4rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Current Performance
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>
              {currentPerformance > 0 ? `${currentPerformance}%` : '—'}
            </div>
            <small style={{ color: '#64748b', fontWeight: 500 }}>Recorded grades average</small>
          </div>

          <div style={{ background: '#eff6ff', padding: '1.4rem', borderRadius: '14px', border: '1px solid #dbeafe' }}>
            <span style={{ fontSize: '0.8rem', color: '#1d4ed8', textTransform: 'uppercase', fontWeight: 700 }}>
              Predicted Performance
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.3rem' }}>
              {predictedPerformance > 0 ? `${predictedPerformance}%` : '—'}
            </div>
            <small style={{ color: '#2563eb', fontWeight: 600 }}>Estimated final outcome</small>
          </div>

          <div style={{ background: '#f0fdf4', padding: '1.4rem', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '0.8rem', color: '#15803d', textTransform: 'uppercase', fontWeight: 700 }}>
              Status
            </span>
            <div
              style={{
                fontSize: '2.3rem',
                fontWeight: 800,
                color: isAtRisk ? '#dc2626' : '#15803d',
                marginTop: '0.3rem',
              }}
            >
              {status}
            </div>
            <small style={{ color: '#16a34a', fontWeight: 600 }}>
              {currentPerformance > 0 ? 'Based on encoded grades' : 'Awaiting grade encoding'}
            </small>
          </div>
        </div>

        {isAtRisk && (
          <div
            style={{
              background: '#fff5f5',
              border: '1.5px solid #fecaca',
              borderRadius: '12px',
              padding: '1rem 1.4rem',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
            }}
          >
            <AlertTriangle size={24} color="#dc2626" />
            <div>
              <strong style={{ display: 'block', color: '#991b1b', fontWeight: 800 }}>Academic Improvement Notice</strong>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#7f1d1d' }}>
                “Your current performance indicates that you may need improvement in some subjects.”
              </p>
            </div>
          </div>
        )}
      </section>

      <section
        style={{
          padding: '1.6rem 2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
            Subject-by-Subject Predictive Forecast
          </h4>
          <p style={{ margin: '0.2rem 0 0 0', color: '#475569', fontSize: '0.9rem' }}>
            Real-time projections for your enrolled subjects
          </p>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '1.2rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ margin: 0, width: '100%' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Subject</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Current Performance</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Prediction</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Status</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Status Description</th>
              </tr>
            </thead>
            <tbody>
              {subjectForecasts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    You are not enrolled in any subjects yet.
                  </td>
                </tr>
              ) : (
                subjectForecasts.map((item) => {
                  const isRisk = item.status === 'At Risk'
                  const isHigh = item.status === 'High'

                  return (
                    <tr key={item.classId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <strong style={{ color: '#0f172a' }}>{item.subjectName}</strong>
                      </td>
                      <td>
                        <strong style={{ color: isRisk ? '#dc2626' : '#0f172a', fontWeight: 800, fontSize: '1.05rem' }}>
                          {item.currentAvg > 0 ? `${item.currentAvg}%` : '—'}
                        </strong>
                      </td>
                      <td>
                        <strong style={{ color: isRisk ? '#d97706' : '#1d4ed8', fontWeight: 800, fontSize: '1.05rem' }}>
                          {item.predictedAvg > 0 ? `${item.predictedAvg}%` : '—'}
                        </strong>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: isRisk ? '#fee2e2' : isHigh ? '#faf5ff' : '#f0fdf4',
                            color: isRisk ? '#b91c1c' : isHigh ? '#7e22ce' : '#15803d',
                            border: isRisk ? '1px solid #fecaca' : isHigh ? '1px solid #e9d5ff' : '1px solid #bbf7d0',
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <small style={{ color: isRisk ? '#b91c1c' : '#64748b', fontWeight: isRisk ? 600 : 500 }}>
                          {item.note}
                        </small>
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

export default StudentPrediction
