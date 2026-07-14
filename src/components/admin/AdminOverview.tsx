import React from 'react'
import { useData } from '../../context/DataContext'

export const AdminOverview: React.FC = () => {
  const { students, users, subjects, classes, atRiskRows, averagePerformance } = useData()

  const totalInstructors = users.filter((user) => user.role === 'Instructor').length

  return (
    <>
      <section className="stats-grid" aria-label="Analytics dashboard">
        <article><span>Total Students</span><strong>{students.length}</strong></article>
        <article><span>Total Instructors</span><strong>{totalInstructors}</strong></article>
        <article><span>Total Subjects</span><strong>{subjects.length}</strong></article>
        <article><span>Total Classes</span><strong>{classes.length}</strong></article>
        <article><span>Students At Risk</span><strong>{atRiskRows.length}</strong></article>
        <article><span>Average Performance</span><strong>{averagePerformance}%</strong></article>
      </section>
      <section className="panel">
        <h3>Administrative Control Center</h3>
        <p className="muted">Monitor school records, manage users, organize classes, and generate reports from the left navigation.</p>
      </section>
    </>
  )
}
