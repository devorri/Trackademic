import React, { useState } from 'react'
import { useData, blankSubject } from '../../context/DataContext'
import ClassManagement from './ClassManagement'
import { FlaskConical, BookOpen } from 'lucide-react'

export const SubjectManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'lab' | 'lecture'>('all')

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

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch = [s.code, s.title, String(s.units)]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false

    if (filterType === 'lab') return Boolean(s.has_laboratory)
    if (filterType === 'lecture') return !s.has_laboratory
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section className="split-grid">
        <form className="panel" onSubmit={handleSaveSubject}>
          <h3>{editingSubjectId ? 'Edit Subject Details' : 'Add New Curriculum Subject'}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Subject Code *</label>
              <input
                placeholder="e.g. ICT 313330"
                value={subjectForm.code}
                onChange={(event) => setSubjectForm({ ...subjectForm, code: event.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Subject Title *</label>
              <input
                placeholder="e.g. Apply Object-Oriented Programming Language Skills"
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
                placeholder="Units (e.g. 5 for Lab, 3 for Lecture)"
                value={subjectForm.units}
                onChange={(event) => setSubjectForm({ ...subjectForm, units: Number(event.target.value) })}
                required
              />
            </div>

            {/* Has Laboratory Checkbox */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginTop: '0.3rem',
                padding: '0.75rem',
                background: subjectForm.has_laboratory ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                border: subjectForm.has_laboratory ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => setSubjectForm({ ...subjectForm, has_laboratory: !subjectForm.has_laboratory })}
            >
              <input
                type="checkbox"
                id="hasLaboratoryCheckbox"
                checked={Boolean(subjectForm.has_laboratory)}
                onChange={(e) => setSubjectForm({ ...subjectForm, has_laboratory: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor="hasLaboratoryCheckbox" style={{ fontSize: '0.88rem', color: '#f8fafc', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FlaskConical size={15} color="#60a5fa" /> With Laboratory Component (Includes Laboratory Exam)
              </label>
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
          <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div>
              <h3>Subject Catalog</h3>
              <span className="chip">{subjects.length} Total Curriculum Subjects</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* Filter Tabs */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', borderRadius: '6px' }}
              >
                <option value="all">All Subjects ({subjects.length})</option>
                <option value="lab">With Laboratory ({subjects.filter(s => s.has_laboratory).length})</option>
                <option value="lecture">Lecture-Only ({subjects.filter(s => !s.has_laboratory).length})</option>
              </select>
              <input
                placeholder="🔍 Search..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                style={{ maxWidth: '160px' }}
              />
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Subject Code & Title</th>
                <th>Units & Type</th>
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
                      <strong style={{ color: '#ffffff', display: 'block' }}>{subject.code}</strong>
                      <small style={{ color: '#94a3b8' }}>{subject.title}</small>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span className="chip">{subject.units} Units</span>
                        {subject.has_laboratory ? (
                          <span style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 800, background: 'rgba(59, 130, 246, 0.2)', padding: '0.15rem 0.45rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <FlaskConical size={11} /> With Lab
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, background: 'rgba(255, 255, 255, 0.05)', padding: '0.15rem 0.45rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <BookOpen size={11} /> Lecture
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{classes.filter((classItem) => classItem.subject_id === subject.id).length} Active Class(es)</td>
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
