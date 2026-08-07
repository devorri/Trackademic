import React from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../hooks/useAuth'
import type { GradeRow } from '../../utils/types'
import { clampScore } from '../../utils/helpers'

export const Gradebook: React.FC = () => {
  const { activeUser } = useAuth()
  const { selectedClass, instructors, gradebook, selectedClassAverages, updateGrade, generateReport, printReport } = useData()

  if (!selectedClass) return null

  const instructorName = instructors.find((i) => i.id === selectedClass.instructor_id)?.name || 'Unassigned'

  function getStatusBadgeStyle(status: string) {
    switch (status) {
      case 'Bound to Fail':
        return { backgroundColor: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef4444' }
      case 'At Risk':
        return { backgroundColor: '#78350f', color: '#fde68a', border: '1px solid #f59e0b' }
      case 'Average':
        return { backgroundColor: '#1e3a8a', color: '#93c5fd', border: '1px solid #3b82f6' }
      case 'Good':
        return { backgroundColor: '#064e3b', color: '#6ee7b7', border: '1px solid #10b981' }
      case 'Excellent':
        return { backgroundColor: '#312e81', color: '#c7d2fe', border: '1px solid #6366f1' }
      default:
        return {}
    }
  }

  return (
    <section className="panel data-card">
      <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>Class Gradebook & Weighted Averages</h3>
          <span className="chip">Section: {selectedClass.section?.name || 'N/A'} | Instructor: {instructorName}</span>
        </div>
        <div className="table-actions">
          <button type="button" onClick={() => generateReport('Class Record', activeUser?.name ?? 'System')}>
            Save Grades
          </button>
          <button type="button" onClick={printReport}>
            Print Report
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Quiz</th>
              <th>Assign</th>
              <th>Activity</th>
              <th>Midterm</th>
              <th>Final Exam</th>
              <th>Prelim</th>
              <th>Midterm Gr.</th>
              <th>Final Gr.</th>
              <th>Overall</th>
              <th>GPA</th>
              <th>Prediction Status</th>
            </tr>
          </thead>
          <tbody>
            {gradebook.map((item) => {
              const rowData = item.row || item
              return (
                <tr
                  key={rowData.studentId}
                  className={
                    item.computed.status === 'Bound to Fail'
                      ? 'bound-to-fail-row'
                      : item.computed.status === 'At Risk'
                      ? 'risk-row'
                      : ''
                  }
                >
                  <td>
                    <strong>{item.student?.name || 'Student'}</strong>
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
                          value={rowData[field]}
                          onChange={(event) =>
                            updateGrade(selectedClass.id, rowData.studentId, field, clampScore(event.target.value))
                          }
                        />
                      </td>
                    )
                  )}
                  <td>{item.computed.preliminary}%</td>
                  <td>{item.computed.midterm}%</td>
                  <td>{item.computed.final}%</td>
                  <td><strong>{item.computed.overall}%</strong></td>
                  <td><span className="chip" style={{ fontWeight: 600 }}>{item.computed.gpaEquiv}</span></td>
                  <td>
                    <span
                      className="pill"
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'inline-block',
                        ...getStatusBadgeStyle(item.computed.status),
                      }}
                    >
                      {item.computed.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot style={{ background: 'rgba(15, 23, 42, 0.8)', fontWeight: 600, borderTop: '2px solid rgba(255,255,255,0.2)' }}>
            <tr>
              <td><strong>Class Average</strong></td>
              <td>{selectedClassAverages.quizzesAvg}%</td>
              <td>{selectedClassAverages.assignmentsAvg}%</td>
              <td>{selectedClassAverages.activitiesAvg}%</td>
              <td>{selectedClassAverages.midtermAvg}%</td>
              <td>{selectedClassAverages.finalAvg}%</td>
              <td colSpan={3} style={{ textAlign: 'right' }}>Overall Class Mean:</td>
              <td><strong style={{ fontSize: '1rem', color: '#60a5fa' }}>{selectedClassAverages.overallAvg}%</strong></td>
              <td><span className="chip" style={{ background: '#3b82f6', color: '#fff' }}>GPA {selectedClassAverages.gpaAvg}</span></td>
              <td>
                <small style={{ color: '#9ca3af' }}>
                  {selectedClassAverages.safeCount} Safe | {selectedClassAverages.atRiskCount} At Risk | {selectedClassAverages.boundToFailCount} Bound to Fail
                </small>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
export default Gradebook

