import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { getSubjectTitle } from '../../utils/helpers'

export const Analytics: React.FC = () => {
  const { gradebook, selectedClass, selectedClassAverages, subjects } = useData()
  const [filter, setFilter] = useState<'ALL' | 'BOUND_TO_FAIL' | 'AT_RISK' | 'SAFE'>('ALL')

  if (!selectedClass) return null

  const subjectTitle = getSubjectTitle(subjects, selectedClass.subject_id)

  const filteredItems = gradebook.filter((item) => {
    if (filter === 'BOUND_TO_FAIL') return item.computed.status === 'Bound to Fail'
    if (filter === 'AT_RISK') return item.computed.status === 'At Risk'
    if (filter === 'SAFE') return item.computed.status !== 'At Risk' && item.computed.status !== 'Bound to Fail'
    return true
  })

  function getRiskBadgeStyle(status: string) {
    switch (status) {
      case 'Bound to Fail':
        return { background: '#ef4444', color: '#fff' }
      case 'At Risk':
        return { background: '#f59e0b', color: '#000' }
      case 'Average':
        return { background: '#3b82f6', color: '#fff' }
      case 'Good':
      case 'Excellent':
        return { background: '#10b981', color: '#fff' }
      default:
        return { background: '#6b7280', color: '#fff' }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Analytics Summary Bar */}
      <section className="panel data-card" style={{ padding: '1.5rem' }}>
        <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Predictive Failure Risk & Academic Performance</h3>
            <span className="chip">{subjectTitle} ({selectedClass.section?.name || 'N/A'})</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`chip ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
              style={{ cursor: 'pointer', background: filter === 'ALL' ? '#3b82f6' : 'rgba(255,255,255,0.08)' }}
            >
              All ({gradebook.length})
            </button>
            <button
              type="button"
              className={`chip ${filter === 'BOUND_TO_FAIL' ? 'active' : ''}`}
              onClick={() => setFilter('BOUND_TO_FAIL')}
              style={{ cursor: 'pointer', background: filter === 'BOUND_TO_FAIL' ? '#ef4444' : 'rgba(255,255,255,0.08)', color: '#fff' }}
            >
              🔴 Bound to Fail ({selectedClassAverages.boundToFailCount})
            </button>
            <button
              type="button"
              className={`chip ${filter === 'AT_RISK' ? 'active' : ''}`}
              onClick={() => setFilter('AT_RISK')}
              style={{ cursor: 'pointer', background: filter === 'AT_RISK' ? '#f59e0b' : 'rgba(255,255,255,0.08)', color: filter === 'AT_RISK' ? '#000' : '#fff' }}
            >
              🟡 Alanganin / At Risk ({selectedClassAverages.atRiskCount})
            </button>
            <button
              type="button"
              className={`chip ${filter === 'SAFE' ? 'active' : ''}`}
              onClick={() => setFilter('SAFE')}
              style={{ cursor: 'pointer', background: filter === 'SAFE' ? '#10b981' : 'rgba(255,255,255,0.08)' }}
            >
              🟢 Safe ({selectedClassAverages.safeCount})
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Class Mean Overall</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#60a5fa', marginTop: '0.2rem' }}>
              {selectedClassAverages.overallAvg}%
            </div>
            <small style={{ color: '#60a5fa' }}>GPA {selectedClassAverages.gpaAvg}</small>
          </div>

          <div style={{ background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)' }}>
            <span style={{ fontSize: '0.8rem', color: '#fca5a5' }}>Bound to Fail (&lt;70%)</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ef4444', marginTop: '0.2rem' }}>
              {selectedClassAverages.boundToFailCount} <small style={{ fontSize: '0.9rem' }}>students</small>
            </div>
            <small style={{ color: '#f87171' }}>High risk of subject failure</small>
          </div>

          <div style={{ background: 'rgba(245,158,11,0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.3)' }}>
            <span style={{ fontSize: '0.8rem', color: '#fde68a' }}>Alanganin / At Risk (70-74%)</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.2rem' }}>
              {selectedClassAverages.atRiskCount} <small style={{ fontSize: '0.9rem' }}>students</small>
            </div>
            <small style={{ color: '#fbbf24' }}>Borderline passing status</small>
          </div>

          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)' }}>
            <span style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>Safe / Passing (75%+)</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '0.2rem' }}>
              {selectedClassAverages.safeCount} <small style={{ fontSize: '0.9rem' }}>students</small>
            </div>
            <small style={{ color: '#34d399' }}>On track to pass</small>
          </div>
        </div>
      </section>

      {/* Student Prediction Analysis Cards Grid */}
      <section className="panel data-card" style={{ padding: '1.5rem' }}>
        <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Student Prediction Analysis ({filteredItems.length})</h4>

        {filteredItems.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No students match the selected filter criteria.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.2rem' }}>
            {filteredItems.map((item) => {
              const comp = item.computed
              const studentName = item.student?.name || 'Student'
              const studentNo = item.student?.studentNo || 'N/A'

              return (
                <div
                  key={item.studentId}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '12px',
                    padding: '1.2rem',
                    border:
                      comp.status === 'Bound to Fail'
                        ? '1px solid #ef4444'
                        : comp.status === 'At Risk'
                        ? '1px solid #f59e0b'
                        : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{studentName}</h4>
                      <small style={{ color: '#9ca3af' }}>{studentNo} | {item.student?.course} {item.student?.section_label}</small>
                    </div>
                    <span
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        ...getRiskBadgeStyle(comp.status),
                      }}
                    >
                      {comp.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Current Overall Grade</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{comp.overall}%</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>GPA Equivalent</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#60a5fa' }}>{comp.gpaEquiv}</div>
                    </div>
                  </div>

                  {/* Failure Factors */}
                  {comp.riskFactors.length > 0 && (
                    <div style={{ marginBottom: '0.8rem' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#fca5a5', display: 'block', marginBottom: '0.3rem' }}>
                        ⚠️ Identified Weak Areas & Risk Factors:
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#d1d5db' }}>
                        {comp.riskFactors.map((factor: string, idx: number) => (
                          <li key={idx}>{factor}</li>
                        ))}
                      </ul>

                    </div>
                  )}

                  {/* Target Score */}
                  <div style={{ background: 'rgba(59,130,246,0.1)', padding: '0.6rem 0.8rem', borderRadius: '8px', marginBottom: '0.8rem', fontSize: '0.82rem' }}>
                    <strong>🎯 Target Final Exam Score:</strong> Needs at least{' '}
                    <strong style={{ color: '#60a5fa' }}>{comp.requiredFinalScore}%</strong> in Final Exam to achieve passing 75% overall.
                  </div>

                  {/* Recommendation */}
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.6rem' }}>
                    💬 {comp.recommendation}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
export default Analytics

