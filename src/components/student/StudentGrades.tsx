import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../context/DataContext'
import { getSubjectTitle } from '../../utils/helpers'

export const StudentGrades: React.FC = () => {
  const { activeUser } = useAuth()
  const { allComputedRows, subjects, activeSection } = useData()

  if (!activeUser) return null

  const studentPortalRows = allComputedRows.filter((item) => item.student?.email === activeUser.email)

  return (
    <section className="panel data-card">
      <div className="card-heading">
        <h3>{activeSection === 'grades' ? 'My Subjects and Grades' : 'Prediction Result'}</h3>
        <span className="chip">Read-only access</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Prelim</th>
            <th>Midterm</th>
            <th>Final Grade</th>
            <th>Academic Status</th>
            <th>Prediction</th>
          </tr>
        </thead>
        <tbody>
          {studentPortalRows.map((item) => (
            <tr key={item.classItem.id}>
              <td>
                {getSubjectTitle(subjects, item.classItem.subjectId)}
                <small>{item.classItem.section}</small>
              </td>
              <td>{item.computed.preliminary}</td>
              <td>{item.computed.midterm}</td>
              <td>{item.computed.final}</td>
              <td>{item.computed.overall >= 75 ? 'Passing' : 'Needs intervention'}</td>
              <td>
                <span className={`pill ${item.computed.status.toLowerCase().replace(' ', '-')}`}>
                  {item.computed.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
export default StudentGrades
