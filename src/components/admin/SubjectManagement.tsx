import React, { useState } from 'react'
import { useData, blankSubject } from '../../context/DataContext'
import ClassManagement from './ClassManagement'

export const SubjectManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
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

  function handleCancelEdit() {
    setEditingSubjectId(null)
    setSubjectForm(blankSubject)
  }

  const filteredSubjects = subjects.filter((s) =>
    [s.code, s.title, String(s.units)]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section className="split-grid">
        <form className="panel" onSubmit={handleSaveSubject}>
          <h3>{editingSubjectId ? 'Edit Subject Details' : 'Add New Subject'}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Subject Code *</label>
              <input
                placeholder="e.g. CS101"
                value={subjectForm.code}
                onChange={(event) => setSubjectForm({ ...subjectForm, code: event.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Subject Title *</label>
              <input
                placeholder="e.g. Intro to Computer Science"
                value={subjectForm.title}
                onChange={(event) => setSubjectForm({ ...subjectForm, title: event.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Units *</label>
              <input
                type="number"
                min="1"
                max="6"
                placeholder="Units"
                value={subjectForm.units}
                onChange={(event) => setSubjectForm({ ...subjectForm, units: Number(event.target.value) })}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {editingSubjectId ? 'Save Changes' : '+ Add Subject'}
              </button>
              {editingSubjectId && (
                <button type="button" onClick={handleCancelEdit} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="panel data-card">
          <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Subject Catalog</h3>
              <span className="chip">{subjects.length} Total Curriculum Subjects</span>
            </div>
            <input
              placeholder="🔍 Search code, title..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              style={{ maxWidth: '220px' }}
            />
          </div>
          <table>
            <thead>
              <tr>
                <th>Subject Code & Title</th>
                <th>Units</th>
                <th>Active Classes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: '1.5rem' }}>
                    {subjects.length === 0 ? 'No subjects in curriculum yet.' : `No subjects match "${searchTerm}"`}
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>
                      <strong>{subject.code}</strong>
                      <small>{subject.title}</small>
                    </td>
                    <td><span className="chip">{subject.units} Units</span></td>
                    <td>{classes.filter((classItem) => classItem.subjectId === subject.id).length} Active Class(es)</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => createClassFromSubject(subject)}>
                          + Quick Class
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
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}
                          onClick={() => {
                            if (confirm(`Delete subject "${subject.code}" (${subject.title})?`)) {
                              setSubjects((current) => current.filter((item) => item.id !== subject.id))
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Class Creation & Instructor Assignment Section */}
      <ClassManagement />
    </div>
  )
}
export default SubjectManagement

