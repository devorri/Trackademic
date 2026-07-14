import React from 'react'
import { useData } from '../../context/DataContext'

export const SubjectManagement: React.FC = () => {
  const {
    subjects,
    setSubjects,
    classes,
    subjectForm,
    setSubjectForm,
    editingSubjectId,
    setEditingSubjectId,
    handleSaveSubject,
    createClassFromSubject,
  } = useData()

  return (
    <section className="split-grid">
      <form className="panel" onSubmit={handleSaveSubject}>
        <h3>{editingSubjectId ? 'Edit Subject' : 'Add Subject'}</h3>
        <input
          placeholder="Code"
          value={subjectForm.code}
          onChange={(event) => setSubjectForm({ ...subjectForm, code: event.target.value })}
        />
        <input
          placeholder="Title"
          value={subjectForm.title}
          onChange={(event) => setSubjectForm({ ...subjectForm, title: event.target.value })}
        />
        <input
          type="number"
          min="1"
          max="6"
          value={subjectForm.units}
          onChange={(event) => setSubjectForm({ ...subjectForm, units: Number(event.target.value) })}
        />
        <button type="submit">Save Subject</button>
      </form>

      <div className="panel data-card">
        <div className="card-heading">
          <h3>Subject and Class Management</h3>
          <span className="chip">Create sections, assign instructors and students</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Units</th>
              <th>Classes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td>
                  {subject.code}
                  <small>{subject.title}</small>
                </td>
                <td>{subject.units}</td>
                <td>{classes.filter((classItem) => classItem.subjectId === subject.id).length}</td>
                <td>
                  <div className="table-actions">
                    <button type="button" onClick={() => createClassFromSubject(subject)}>
                      Create Class
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubjectId(subject.id)
                        setSubjectForm(subject)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubjects((current) => current.filter((item) => item.id !== subject.id))}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
export default SubjectManagement
