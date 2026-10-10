import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { getSubjectTitle } from '../../utils/helpers'
import { TrendingUp, AlertTriangle, ArrowRight, Search, FileText } from 'lucide-react'

export const Analytics: React.FC = () => {
  const { selectedClass, subjects, gradebook, setActiveSection } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'AT_RISK' | 'ON_TRACK' | 'GOOD'>('ALL')

  const subjectTitle = selectedClass ? getSubjectTitle(subjects, selectedClass.subject_id) : 'Class Analytics'

  // Performance Trend:
  // Prelim → 78%
  // Midterm → 82%
  // Current → 85%
  const prelimTrend = 78
  const midtermTrend = 82
  const currentTrend = 85

  // At-Risk alert: ⚠️ 8 Students At Risk
  const atRiskCount = 8

  // Sample benchmarks requested by user:
  // Student A: 72% | 74% | At Risk
  // Student B: 80% | 82% | On Track
  // Student C: 91% | 93% | Good
  const benchmarkStudents = [
    {
      studentName: 'Student A',
      studentNo: '2026-005',
      currentGrade: 72,
      predictedPerformance: 74,
      status: 'At Risk',
      guidance: 'Below passing threshold (75%). Urgent review recommended.',
    },
    {
      studentName: 'Student B',
      studentNo: '2026-006',
      currentGrade: 80,
      predictedPerformance: 82,
      status: 'On Track',
      guidance: 'Solid passing performance. Consistent score trajectory.',
    },
    {
      studentName: 'Student C',
      studentNo: '2026-007',
      currentGrade: 91,
      predictedPerformance: 93,
      status: 'Good',
      guidance: 'Exceptional academic standing. Above 90% benchmark.',
    },
  ]

  // Add students from active gradebook
  const activeClassStudents = gradebook.map((item) => {
    const currentGrade = item.computed.overall
    const predictedPerformance = Math.min(100, currentGrade + 2)
    let status: 'At Risk' | 'On Track' | 'Good' = 'On Track'
    if (currentGrade < 75) status = 'At Risk'
    else if (currentGrade >= 88) status = 'Good'

    return {
      studentName: item.student?.name || 'Student',
      studentNo: item.student?.student_no || item.student?.studentNo || '2026-001',
      currentGrade,
      predictedPerformance,
      status,
      guidance:
        status === 'At Risk'
          ? 'Needs at least 75% in Final Exam to pass.'
          : 'Pacing well towards successful course completion.',
    }
  })

  // Combine benchmark and class students
  const combinedList = [
    ...benchmarkStudents,
    ...activeClassStudents.filter((s) => !benchmarkStudents.some((b) => b.studentName === s.studentName)),
  ]

  const filteredList = combinedList.filter((item) => {
    if (filter === 'AT_RISK' && item.status !== 'At Risk') return false
    if (filter === 'ON_TRACK' && item.status !== 'On Track') return false
    if (filter === 'GOOD' && item.status !== 'Good') return false

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      return item.studentName.toLowerCase().includes(q) || item.studentNo.toLowerCase().includes(q)
    }
    return true
  })

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
            {subjectTitle} ({selectedClass?.section?.name || 'Section'})
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
            <TrendingUp size={22} color="#2563eb" /> Class Analytics & Performance Forecasting
          </h3>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
            Predictive student grade forecasting, performance growth trajectories, and intervention alerts
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setActiveSection('reports')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.65rem 1.2rem',
            fontWeight: 700,
            borderRadius: '10px',
          }}
        >
          <FileText size={16} /> Generate Analytics Report
        </button>
      </div>

      {/* Performance Trend & At-Risk Alert Section
          Performance Trend:
          Prelim → 78%
          Midterm → 82%
          Current → 85%
          At-Risk Students:
          ⚠️ 8 Students At Risk
      */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.4rem' }}>
        {/* Performance Trend Card */}
        <section
          style={{
            padding: '1.6rem 2rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
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
              PERFORMANCE TREND
            </span>
            <h4 style={{ margin: '0.6rem 0 1rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              Class Progress Trajectory
            </h4>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '1.2rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Prelim
                </span>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                  {prelimTrend}%
                </div>
              </div>

              <ArrowRight size={20} color="#2563eb" />

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#1d4ed8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Midterm
                </span>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.2rem' }}>
                  {midtermTrend}%
                </div>
              </div>

              <ArrowRight size={20} color="#059669" />

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700 }}>
                  Current
                </span>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                  {currentTrend}%
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              fontSize: '0.85rem',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            ↗️ Positive +7% growth trend from Preliminary term to Current standing
          </div>
        </section>

        {/* At-Risk Students Alert Card */}
        <section
          style={{
            padding: '1.6rem 2rem',
            background: '#fff5f5',
            borderRadius: '16px',
            border: '1.5px solid #fecaca',
            boxShadow: '0 4px 16px -2px rgba(239, 68, 68, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
              }}
            >
              AT-RISK STUDENTS ALERT
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.6rem' }}>
              <AlertTriangle size={28} color="#dc2626" />
              <h4 style={{ margin: 0, fontSize: '1.4rem', color: '#991b1b', fontWeight: 800 }}>
                ⚠️ {atRiskCount} Students At Risk
              </h4>
            </div>
            <p style={{ margin: '0.8rem 0 1.2rem 0', fontSize: '0.9rem', color: '#7f1d1d', lineHeight: 1.5 }}>
              Students with grade projection below 75% or with failing Preliminary marks require immediate remedial tutoring and instructor guidance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFilter('AT_RISK')}
            style={{
              padding: '0.7rem 1.2rem',
              borderRadius: '10px',
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
              width: '100%',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
            }}
          >
            Filter At-Risk Students Only
          </button>
        </section>
      </div>

      {/* Table:
          Student | Current Grade | Predicted Performance | Status
          Student A | 72% | 74% | At Risk
          Student B | 80% | 82% | On Track
          Student C | 91% | 93% | Good
      */}
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
            <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              Student Predictive Analytics Breakdown
            </h4>
            <p style={{ margin: '0.2rem 0 0 0', color: '#475569', fontSize: '0.9rem' }}>
              Comparison of current earned grades against forecasted end-of-term results
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              style={{
                cursor: 'pointer',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: filter === 'ALL' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                background: filter === 'ALL' ? '#eff6ff' : '#f8fafc',
                color: filter === 'ALL' ? '#1d4ed8' : '#475569',
              }}
            >
              All ({combinedList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('AT_RISK')}
              style={{
                cursor: 'pointer',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: filter === 'AT_RISK' ? '1.5px solid #ef4444' : '1px solid #fecaca',
                background: filter === 'AT_RISK' ? '#fee2e2' : '#fff5f5',
                color: '#b91c1c',
              }}
            >
              ⚠️ At Risk
            </button>
            <button
              type="button"
              onClick={() => setFilter('ON_TRACK')}
              style={{
                cursor: 'pointer',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: filter === 'ON_TRACK' ? '1.5px solid #059669' : '1px solid #bbf7d0',
                background: filter === 'ON_TRACK' ? '#f0fdf4' : '#ffffff',
                color: '#15803d',
              }}
            >
              On Track
            </button>
            <button
              type="button"
              onClick={() => setFilter('GOOD')}
              style={{
                cursor: 'pointer',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: filter === 'GOOD' ? '1.5px solid #7c3aed' : '1px solid #e9d5ff',
                background: filter === 'GOOD' ? '#faf5ff' : '#ffffff',
                color: '#7e22ce',
              }}
            >
              Good
            </button>

            <div style={{ position: 'relative', width: '240px' }}>
              <input
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.4rem',
                  paddingRight: '0.8rem',
                  paddingTop: '0.55rem',
                  paddingBottom: '0.55rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                }}
              />
              <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '1.2rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ margin: 0, width: '100%' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Student</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Current Grade</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Predicted Performance</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Status</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Guidance / Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, idx) => {
                const isAtRisk = item.status === 'At Risk'
                const isGood = item.status === 'Good'

                return (
                  <tr
                    key={idx}
                    style={{
                      background: isAtRisk ? '#fff5f5' : '#ffffff',
                      borderLeft: isAtRisk ? '4px solid #ef4444' : undefined,
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{item.studentName}</strong>
                      <small style={{ color: '#64748b' }}>{item.studentNo}</small>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1.05rem', color: isAtRisk ? '#dc2626' : '#0f172a', fontWeight: 800 }}>
                        {item.currentGrade}%
                      </strong>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1.05rem', color: isAtRisk ? '#d97706' : '#1d4ed8', fontWeight: 800 }}>
                        {item.predictedPerformance}%
                      </strong>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.7rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isAtRisk
                            ? '#fee2e2'
                            : isGood
                            ? '#faf5ff'
                            : '#f0fdf4',
                          color: isAtRisk ? '#b91c1c' : isGood ? '#7e22ce' : '#15803d',
                          border: isAtRisk
                            ? '1px solid #fecaca'
                            : isGood
                            ? '1px solid #e9d5ff'
                            : '1px solid #bbf7d0',
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <small style={{ color: isAtRisk ? '#991b1b' : '#64748b', fontWeight: isAtRisk ? 600 : 500 }}>
                        {item.guidance}
                      </small>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Analytics
