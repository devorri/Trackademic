import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../context/DataContext'
import { getSubjectTitle } from '../../utils/helpers'

export const StudentGrades: React.FC = () => {
  const { activeUser } = useAuth()
  const { allComputedRows, subjects, instructors, activeSection } = useData()

  if (!activeUser) return null

  const studentPortalRows = allComputedRows.filter((item) => item.student?.email === activeUser.email)
  const atRiskOrFailing = studentPortalRows.filter(
    (item) => item.computed.status === 'Bound to Fail' || item.computed.status === 'At Risk'
  )

  function getStatusBadgeStyle(status: string) {
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
      {/* Risk Alert Banner */}
      {atRiskOrFailing.length > 0 && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '1.2rem',
            color: '#fca5a5',
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#f87171' }}>
            ⚠️ Academic Failure Risk Warning ({atRiskOrFailing.length} subject{atRiskOrFailing.length > 1 ? 's' : ''})
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#fca5a5' }}>
            Our predictive system has flagged that your current grade trend is on the boundary or bound to fail in{' '}
            <strong>{atRiskOrFailing.map((i) => getSubjectTitle(subjects, i.classItem.subject_id)).join(', ')}</strong>.
            Please review the target scores required below and consult your instructor for remedial assistance.
          </p>
        </div>
      )}

      <section className="panel data-card">
        <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>{activeSection === 'grades' ? 'My Academic Performance' : 'Failure Risk & Target Score Forecast'}</h3>
            <span className="chip">Official Grade Records & Predictive Guidance</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table>
            <thead>
              <tr>
                <th>Subject & Section</th>
                <th>Instructor</th>
                <th>Prelim</th>
                <th>Midterm</th>
                <th>Final</th>
                <th>Overall</th>
                <th>GPA</th>
                <th>Prediction</th>
                <th>Target Final Exam Score</th>
              </tr>
            </thead>
            <tbody>
              {studentPortalRows.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#9ca3af', padding: '1.5rem' }}>
                    No enrolled subject records found for account: {activeUser.email}
                  </td>
                </tr>
              ) : (
                studentPortalRows.map((item) => (
                  <tr
                    key={item.classItem.id}
                    className={
                      item.computed.status === 'Bound to Fail'
                        ? 'bound-to-fail-row'
                        : item.computed.status === 'At Risk'
                        ? 'risk-row'
                        : ''
                    }
                  >
                    <td>
                      <strong>{getSubjectTitle(subjects, item.classItem.subject_id)}</strong>
                      <small>{item.classItem.section?.name || 'N/A'}</small>
                    </td>
                    <td>{instructors.find((i) => i.id === item.classItem.instructor_id)?.name || 'Unassigned'}</td>
                    <td>{item.computed.preliminary}%</td>
                    <td>{item.computed.midterm}%</td>
                    <td>{item.computed.final}%</td>
                    <td><strong>{item.computed.overall}%</strong></td>
                    <td><span className="chip" style={{ fontWeight: 600 }}>{item.computed.gpaEquiv}</span></td>
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          ...getStatusBadgeStyle(item.computed.status),
                        }}
                      >
                        {item.computed.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: item.computed.requiredFinalScore > 80 ? '#f87171' : '#60a5fa' }}>
                        Need <strong>{item.computed.requiredFinalScore}%</strong> to pass (75%)
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
export default StudentGrades

