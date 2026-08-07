import React from 'react'
import { useData } from '../../context/DataContext'

export const AdminOverview: React.FC = () => {
  const { students, users, classes, atRiskRows, boundToFailRows, averagePerformance, setActiveSection, setSelectedClassId } = useData()


  const totalInstructors = users.filter((user) => user.role === 'Instructor').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section className="stats-grid" aria-label="Analytics dashboard">
        <article><span>Total Students</span><strong>{students.length}</strong></article>
        <article><span>Total Instructors</span><strong>{totalInstructors}</strong></article>
        <article><span>Active Classes</span><strong>{classes.length}</strong></article>
        <article><span>School GWA Mean</span><strong>{averagePerformance}%</strong></article>
        <article style={{ borderLeft: '4px solid #f59e0b' }}>
          <span style={{ color: '#fde68a' }}>Alanganin / At Risk</span>
          <strong style={{ color: '#f59e0b' }}>{atRiskRows.length}</strong>
        </article>
        <article style={{ borderLeft: '4px solid #ef4444' }}>
          <span style={{ color: '#fca5a5' }}>Bound to Fail</span>
          <strong style={{ color: '#ef4444' }}>{boundToFailRows.length}</strong>
        </article>
      </section>

      {/* Schoolwide Failure Risk Watchlist */}
      <section className="panel data-card">
        <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Schoolwide Predictive Risk Watchlist</h3>
            <span className="chip">Students flagged as Bound to Fail or At Risk across classes</span>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setActiveSection('classes')}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Manage Classes
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class & Section</th>
              <th>Assigned Instructor</th>
              <th>Current Overall</th>
              <th>GPA</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[...boundToFailRows, ...atRiskRows].length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '1.5rem' }}>
                  No students currently flagged as Bound to Fail or At Risk schoolwide.
                </td>
              </tr>
            ) : (
              [...boundToFailRows, ...atRiskRows].map((item, idx) => (
                <tr key={idx} className={item.computed.status === 'Bound to Fail' ? 'bound-to-fail-row' : 'risk-row'}>
                  <td>
                    <strong>{item.student?.name || 'Student'}</strong>
                    <small>{item.student?.studentNo}</small>
                  </td>
                  <td>
                    {item.classItem?.section}
                  </td>
                  <td>{item.classItem?.instructor}</td>
                  <td><strong>{item.computed.overall}%</strong></td>
                  <td><span className="chip">{item.computed.gpaEquiv}</span></td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: item.computed.status === 'Bound to Fail' ? '#ef4444' : '#f59e0b',
                        color: item.computed.status === 'Bound to Fail' ? '#fff' : '#000',
                      }}
                    >
                      {item.computed.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedClassId(item.classItem.id)
                        setActiveSection('gradebook')
                      }}
                    >
                      View Class
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default AdminOverview

