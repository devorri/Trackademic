import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../context/DataContext'

export const StudentOverview: React.FC = () => {
  const { activeUser } = useAuth()
  const { allComputedRows } = useData()

  if (!activeUser) return null

  const studentPortalRows = allComputedRows.filter((item) => item.student?.email === activeUser.email)
  const firstRow = studentPortalRows[0]

  return (
    <section className="student-hero panel">
      <div>
        <p className="eyebrow">Student Portal</p>
        <h3>{activeUser.name}</h3>
        
      </div>
      <div className="student-status">
        <span>Academic Status</span>
        <strong>{firstRow?.computed.status ?? 'No grades yet'}</strong>
        <span>Final Average</span>
        <strong>{firstRow?.computed.overall ?? 0}%</strong>
      </div>
    </section>
  )
}
export default StudentOverview
