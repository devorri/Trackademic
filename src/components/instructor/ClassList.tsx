import React from 'react'
import { useData } from '../../context/DataContext'
import { getSubjectTitle } from '../../utils/helpers'

export const ClassList: React.FC = () => {
  const { classes, subjects, instructors, selectedClassId, setSelectedClassId, selectedClass } = useData()

  if (!selectedClass) return null

  const selectedInstructor = instructors.find((i) => i.id === selectedClass.instructor_id)

  return (
    <section className="panel">
      <div className="card-heading">
        <h3>Assigned Classes</h3>
        <select value={selectedClassId ?? ''} onChange={(event) => setSelectedClassId(event.target.value)}>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {getSubjectTitle(subjects, classItem.subject_id)} - {classItem.section?.name || 'N/A'}
            </option>
          ))}
        </select>
      </div>
      <div className="class-meta">
        <span>{selectedClass.schedule}</span>
        <span>{selectedClass.room}</span>
        <span>{selectedInstructor?.name || 'Unassigned'}</span>
      </div>
    </section>
  )
}
export default ClassList
