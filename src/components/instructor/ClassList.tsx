import React from 'react'
import { useData } from '../../context/DataContext'
import { getSubjectTitle } from '../../utils/helpers'

export const ClassList: React.FC = () => {
  const { classes, subjects, selectedClassId, setSelectedClassId, selectedClass } = useData()

  if (!selectedClass) return null

  return (
    <section className="panel">
      <div className="card-heading">
        <h3>Assigned Classes</h3>
        <select value={selectedClassId} onChange={(event) => setSelectedClassId(Number(event.target.value))}>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {getSubjectTitle(subjects, classItem.subjectId)} - {classItem.section}
            </option>
          ))}
        </select>
      </div>
      <div className="class-meta">
        <span>{selectedClass.schedule}</span>
        <span>{selectedClass.room}</span>
        <span>{selectedClass.instructor}</span>
      </div>
    </section>
  )
}
export default ClassList
