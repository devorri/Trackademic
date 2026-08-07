import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { blankStudent } from '../../context/DataContext'

export const StudentManagement: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const {
    studentForm,
    setStudentForm,
    editingStudentId,
    setEditingStudentId,
    searchTerm,
    setSearchTerm,
    filteredStudents,
    students,
    handleSaveStudent,
    deleteStudent,
  } = useData()

  function handleCancelEdit() {
    setEditingStudentId(null)
    setStudentForm(blankStudent)
  }

  return (
    <section className="split-grid">
      <form className="panel" onSubmit={handleSaveStudent}>
        <h3>{editingStudentId ? 'Edit Student Profile' : 'Add New Student'}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Full Name *</label>
            <input
              placeholder="e.g. Juan Cruz"
              value={studentForm.name}
              onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Student Number *</label>
            <input
              placeholder="e.g. SC-2026-088"
              value={studentForm.studentNo}
              onChange={(event) => setStudentForm({ ...studentForm, studentNo: event.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Email Address *</label>
            <input
              type="email"
              placeholder="e.g. juan@sandigan.edu.ph"
              value={studentForm.email}
              onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Account Password *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Set password for student account"
                value={studentForm.password || ''}
                onChange={(event) => setStudentForm({ ...studentForm, password: event.target.value })}
                required
                style={{ width: '100%', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Course *</label>
              <input
                placeholder="e.g. BSIT"
                value={studentForm.course}
                onChange={(event) => setStudentForm({ ...studentForm, course: event.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Section *</label>
              <input
                placeholder="e.g. 1A"
                value={studentForm.section_label}
                onChange={(event) => setStudentForm({ ...studentForm, section_label: event.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              {editingStudentId ? 'Save Changes' : '+ Add Student'}
            </button>
            {editingStudentId && (
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
            <h3>Student Directory</h3>
            <span className="chip">{students.length} Total Enrolled Students</span>
          </div>
          <input
            placeholder="🔍 Search student name, no, course..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={{ maxWidth: '240px' }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Student Name & No.</th>
              <th>Course & Section</th>
              <th>Email Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: '1.5rem' }}>
                  No student records match "{searchTerm}"
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <strong>{student.name}</strong>
                    <small>{student.student_no || student.studentNo}</small>
                  </td>
                  <td>
                    <span className="chip" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                      {student.course} {student.section_label}
                    </span>
                  </td>
                  <td>{student.email}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStudentId(student.id)
                          setStudentForm(student)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete student "${student.name}" (${student.studentNo})? This will also remove them from all enrolled classes.`)) {
                            deleteStudent(student.id)
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
  )
}
export default StudentManagement

