import React from 'react'
import { useData } from '../../context/DataContext'

export const InstructorOverview: React.FC = () => {
  const { classes, selectedClass, reports } = useData()

  const assignedSubjectsCount = new Set(classes.map((classItem) => classItem.subjectId)).size
  const studentCount = selectedClass ? selectedClass.studentIds.length : 0
  const recentActivitiesCount = reports.length + 4

  return (
    <section className="stats-grid compact">
      <article>
        <span>Assigned Subjects</span>
        <strong>{assignedSubjectsCount}</strong>
      </article>
      <article>
        <span>Assigned Classes</span>
        <strong>{classes.length}</strong>
      </article>
      <article>
        <span>Number of Students</span>
        <strong>{studentCount}</strong>
      </article>
      <article>
        <span>Recent Activities</span>
        <strong>{recentActivitiesCount}</strong>
      </article>
    </section>
  )
}
export default InstructorOverview
