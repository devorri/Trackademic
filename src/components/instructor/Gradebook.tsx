import React from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../hooks/useAuth'
import type { GradeRow } from '../../utils/types'
import { clampScore } from '../../utils/helpers'

export const Gradebook: React.FC = () => {
  const { activeUser } = useAuth()
  const { selectedClass, gradebook, updateGrade, generateReport, printReport } = useData()

  if (!selectedClass) return null

  return (
    <section className="panel data-card">
      <div className="card-heading">
        <h3>Class Record Management</h3>
        <div className="table-actions">
          <button type="button" onClick={() => generateReport('Class Record', activeUser?.name ?? 'System')}>
            Save Grades
          </button>
          <button type="button" onClick={printReport}>
            View Grades
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Quiz</th>
            <th>Assignment</th>
            <th>Activity</th>
            <th>Midterm</th>
            <th>Final Exam</th>
            <th>Prelim</th>
            <th>Midterm Grade</th>
            <th>Final</th>
            <th>Overall</th>
            <th>Prediction</th>
          </tr>
        </thead>
        <tbody>
          {gradebook.map((item) => (
            <tr key={item.studentId} className={item.computed.status === 'At Risk' ? 'risk-row' : ''}>
              <td>
                {item.student?.name}
                <small>{item.student?.studentNo}</small>
              </td>
              {(['quizzes', 'assignments', 'activities', 'midtermExam', 'finalExam'] as (keyof GradeRow)[]).map(
                (field) => (
                  <td key={field}>
                    <input
                      className="score-input"
                      type="number"
                      min="0"
                      max="100"
                      value={item[field]}
                      onChange={(event) =>
                        updateGrade(selectedClass.id, item.studentId, field, clampScore(event.target.value))
                      }
                    />
                  </td>
                )
              )}
              <td>{item.computed.preliminary}</td>
              <td>{item.computed.midterm}</td>
              <td>{item.computed.final}</td>
              <td>{item.computed.overall}</td>
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
export default Gradebook
