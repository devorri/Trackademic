import React from 'react'
import { useData } from '../../context/DataContext'

export const Analytics: React.FC = () => {
  const { gradebook } = useData()

  const riskStudents = gradebook.filter((item) => item.computed.status === 'At Risk')

  return (
    <section className="panel">
      <div className="card-heading">
        <h3>At-Risk Students</h3>
        <span className="chip">Predictive analytics</span>
      </div>
      <div className="risk-list">
        {riskStudents.length === 0 ? (
          <span>No students currently flagged as At Risk.</span>
        ) : (
          riskStudents.map((item) => (
            <span key={item.studentId}>
              {item.student?.name} - {item.computed.overall}%
            </span>
          ))
        )}
      </div>
    </section>
  )
}
export default Analytics
