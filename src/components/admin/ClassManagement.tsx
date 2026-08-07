import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import type { ClassRecord } from '../../utils/types'
import { getSubjectTitle } from '../../utils/helpers'
import { dbInstructors, dbSections } from '../../utils/db'
import { Plus, User, MapPin, Clock, Users, BookOpen, Pencil, Trash2 } from 'lucide-react'

export const ClassManagement: React.FC = () => {
  const {
    classes,
    subjects,
    instructors,
    students,
    createClass,
    updateClass,
    deleteClass,
    setSelectedClassId,
    setActiveSection,
  } = useData()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [classSearch, setClassSearch] = useState('')

  const [formSubjectId, setFormSubjectId] = useState<string>(subjects[0]?.id || '')
  const [formSection, setFormSection] = useState('')
  const [formInstructorId, setFormInstructorId] = useState<string>(instructors[0]?.id || '')
  const [formRoom, setFormRoom] = useState('')
  const [formSchedule, setFormSchedule] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  function handleOpenCreateModal() {
    setEditingClassId(null)
    setFormSubjectId(subjects[0]?.id || '')
    setFormSection('')
    setFormInstructorId(instructors[0]?.id || '')
    setFormRoom('Room 201')
    setFormSchedule('MWF 9:00 AM - 10:30 AM')
    setSelectedStudentIds(students.map((s) => s.id))
    setIsModalOpen(true)
  }

  function handleOpenEditModal(cls: ClassRecord) {
    setEditingClassId(cls.id)
    setFormSubjectId(cls.subject_id || '')
    setFormSection(cls.section?.name || '')
    setFormInstructorId(cls.instructor_id || '')
    setFormRoom(cls.room || '')
    setFormSchedule(cls.schedule || '')
    setSelectedStudentIds(cls.studentIds || [])
    setIsModalOpen(true)
  }

  function handleToggleStudent(studentId: string) {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    )
  }

  function handleSelectAllStudents() {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(students.map((s) => s.id))
    }
  }

  async function handleSubmitClass(e: React.FormEvent) {
    e.preventDefault()
    if (!formSubjectId || !formSection || !formInstructorId) {
      alert('Please fill out Subject, Section, and Instructor.')
      return
    }

    try {
      const existingInstructor = await dbInstructors.getByProfileId(formInstructorId)
      const instructor = existingInstructor ?? await dbInstructors.create({
        profile_id: formInstructorId,
        employee_no: `EMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        department: undefined,
      })

      if (editingClassId) {
        await updateClass(editingClassId, {
          subject_id: formSubjectId,
          instructor_id: instructor.id,
          room: formRoom || 'TBA',
          schedule: formSchedule || 'TBA',
          studentIds: selectedStudentIds,
        })
      } else {
        const section = await dbSections.create({
          name: formSection,
          school_year: new Date().getFullYear().toString(),
          semester: '1',
        })
        await createClass({
          subject_id: formSubjectId,
          section_id: section.id,
          instructor_id: instructor.id,
          room: formRoom || 'TBA',
          schedule: formSchedule || 'TBA',
          studentIds: selectedStudentIds,
        })
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error submitting class:', error)
      alert('Failed to save class')
    }
  }

  const filteredClasses = classes.filter((cls) => {
    const subjectTitle = getSubjectTitle(subjects, cls.subject_id)
    const subjectObj = subjects.find((s) => s.id === cls.subject_id)
    const instructorName = instructors.find((i) => i.id === cls.instructor_id)?.name || ''
    return [subjectTitle, subjectObj?.code || '', cls.room || '', cls.schedule || '', instructorName]
      .join(' ')
      .toLowerCase()
      .includes(classSearch.toLowerCase())
  })

  return (
    <div className="class-management-container">
      <div className="panel data-card">
        <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3>Class Creation & Instructor Assignment</h3>
            <span className="chip">Assign subjects to instructors, set schedules, & enroll students</span>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <input
              placeholder="Search class, section, instructor..."
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              style={{ maxWidth: '240px' }}
            />
            <button type="button" className="btn-primary" onClick={handleOpenCreateModal} style={{ padding: '0.6rem 1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={16} /> Create New Class
            </button>
          </div>
        </div>

        {filteredClasses.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ margin: 0, fontSize: '1rem' }}>
              {classes.length === 0
                ? 'No active classes created yet. Click "+ Create New Class" to assign an instructor and section.'
                : `No classes found matching "${classSearch}"`}
            </p>
          </div>
        ) : (
          <div className="classes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem', marginTop: '1.5rem' }}>
            {filteredClasses.map((cls) => {
              const subjectTitle = getSubjectTitle(subjects, cls.subject_id)
              const subjectObj = subjects.find((s) => s.id === cls.subject_id)
              const instructorName = instructors.find((i) => i.id === cls.instructor_id)?.name || 'Unassigned'
              return (
                <div key={cls.id} className="class-card panel" style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.4rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.6))', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <span className="chip" style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', padding: '0.2rem 0.6rem', borderRadius: '6px', letterSpacing: '0.3px' }}>
                          {subjectObj?.code || 'SUBJECT'}
                        </span>
                        <h4 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.1rem', color: '#f1f5f9', fontWeight: 600, lineHeight: 1.3 }}>{subjectTitle}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Section <strong style={{ color: '#cbd5e1' }}>{cls.section?.name || 'N/A'}</strong></p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', margin: '0.8rem 0 1.2rem 0', padding: '0.9rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.84rem', color: '#cbd5e1' }}>
                        <User size={14} style={{ color: '#60a5fa', flexShrink: 0 }} />
                        <span><strong style={{ color: '#e2e8f0' }}>Instructor:</strong> {instructorName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.84rem', color: '#cbd5e1' }}>
                        <MapPin size={14} style={{ color: '#a78bfa', flexShrink: 0 }} />
                        <span><strong style={{ color: '#e2e8f0' }}>Room:</strong> {cls.room}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.84rem', color: '#cbd5e1' }}>
                        <Clock size={14} style={{ color: '#34d399', flexShrink: 0 }} />
                        <span><strong style={{ color: '#e2e8f0' }}>Schedule:</strong> {cls.schedule}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.84rem', color: '#cbd5e1' }}>
                        <Users size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
                        <span><strong style={{ color: '#e2e8f0' }}>Enrolled:</strong> <span className="chip" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>{cls.studentIds?.length || 0} Students</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="table-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      style={{ flex: 1, padding: '0.5rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
                      onClick={() => {
                        setSelectedClassId(cls.id)
                        setActiveSection('gradebook')
                      }}
                    >
                      <BookOpen size={14} /> Gradebook
                    </button>
                    <button
                      type="button"
                      style={{ padding: '0.5rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem' }}
                      onClick={() => handleOpenEditModal(cls)}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      style={{ padding: '0.5rem 0.8rem', cursor: 'pointer', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem' }}
                      onClick={() => {
                        if (confirm(`Delete class ${subjectObj?.code} (${cls.section})?`)) {
                          deleteClass(cls.id)
                        }
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="modal-card panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              background: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: '1.3rem', color: '#f8fafc', marginBottom: '1.2rem' }}>
              {editingClassId ? 'Edit Class & Instructor Assignment' : 'Create New Class & Assign Instructor'}
            </h3>
            
            <form onSubmit={handleSubmitClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.82rem', color: '#94a3b8' }}>Select Subject *</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.title} ({sub.units} units)
                    </option>
                  ))}
                  {subjects.length === 0 && <option value="">No subjects created yet</option>}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.82rem', color: '#94a3b8' }}>Assign Instructor *</label>
                  <select
                    value={formInstructorId}
                    onChange={(e) => setFormInstructorId(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }}
                  >
                    <option value="">Select an instructor</option>
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.email})
                      </option>
                    ))}
                    {instructors.length === 0 && <option value="">No instructors available</option>}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.82rem', color: '#94a3b8' }}>Section Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. BSIT 2A"
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.82rem', color: '#94a3b8' }}>Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g. MWF 9:00 AM - 10:30 AM"
                    value={formSchedule}
                    onChange={(e) => setFormSchedule(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.82rem', color: '#94a3b8' }}>Room / Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 302"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Enroll Students ({selectedStudentIds.length} selected)</label>
                  {students.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllStudents}
                      style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '10px', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#0f172a' }}>
                  {students.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>No students registered yet. Add students in Student Management first.</span>
                  ) : (
                    students.map((st) => (
                      <label key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', cursor: 'pointer', color: '#e2e8f0' }}>
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(st.id)}
                          onChange={() => handleToggleStudent(st.id)}
                        />
                        <span>
                          <strong>{st.name}</strong> ({st.student_no || st.studentNo}) - {st.course} {st.section_label}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.65rem 1.3rem', borderRadius: '10px', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#f8fafc', border: 'none', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', cursor: 'pointer' }}
                >
                  {editingClassId ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassManagement
