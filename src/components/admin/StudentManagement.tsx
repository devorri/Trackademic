import React, { useState } from 'react'
import { Eye, EyeOff, Search, Plus, User, FileText, X } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { blankStudent } from '../../context/DataContext'
import type { Student } from '../../utils/types'

export const StudentManagement: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [selectedStudentForRecord, setSelectedStudentForRecord] = useState<Student | null>(null)

  const {
    studentForm,
    setStudentForm,
    editingStudentId,
    setEditingStudentId,
    searchTerm,
    setSearchTerm,
    filteredStudents,
    students,
    allComputedRows,
    handleSaveStudent,
    deleteStudent,
  } = useData()

  function handleCancelEdit() {
    setEditingStudentId(null)
    setStudentForm(blankStudent)
  }

  // Find enrolled records for selected student
  const studentRecords = selectedStudentForRecord
    ? allComputedRows.filter(
        (r) =>
          r.student?.id === selectedStudentForRecord.id ||
          r.student?.student_no === selectedStudentForRecord.student_no ||
          r.student?.studentNo === selectedStudentForRecord.studentNo ||
          r.student?.email === selectedStudentForRecord.email,
      )
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      <section className="split-grid">
        {/* Add/Edit Student Form */}
        <form className="panel" onSubmit={handleSaveStudent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16,185,129,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
              }}
            >
              {editingStudentId ? <User size={18} /> : <Plus size={18} />}
            </div>
            <h3 style={{ margin: 0 }}>{editingStudentId ? 'Edit Student Profile' : 'Add New Student'}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>
                Student Name *
              </label>
              <input
                placeholder="e.g. Kissy S. / Liam"
                value={studentForm.name || ''}
                onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>
                Student ID *
              </label>
              <input
                placeholder="e.g. 2026-001"
                value={studentForm.studentNo || studentForm.student_no || ''}
                onChange={(event) =>
                  setStudentForm({ ...studentForm, studentNo: event.target.value, student_no: event.target.value })
                }
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>
                  Year Level *
                </label>
                <select
                  value={studentForm.year_level || 4}
                  onChange={(event) => setStudentForm({ ...studentForm, year_level: Number(event.target.value) })}
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>
                  Course & Section *
                </label>
                <input
                  placeholder="e.g. BSIT-4A"
                  value={studentForm.section_label || 'BSIT-4A'}
                  onChange={(event) => setStudentForm({ ...studentForm, section_label: event.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. kissy.student@example.com"
                value={studentForm.email || ''}
                onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>
                Portal Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Set password for student account"
                  value={studentForm.password || ''}
                  onChange={(event) => setStudentForm({ ...studentForm, password: event.target.value })}
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

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {editingStudentId ? 'Save Changes' : '+ Add Student'}
              </button>
              {editingStudentId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Student Directory Table with Search */}
        <div className="panel data-card">
          <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Student Directory</h3>
              <span className="chip" style={{ marginTop: '0.3rem' }}>
                {students.length} Total Enrolled Students
              </span>
            </div>
            <div style={{ position: 'relative', width: '260px' }}>
              <input
                placeholder="🔍 Search name, ID, course..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                style={{ width: '100%', paddingLeft: '2.2rem' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Student & ID</th>
                  <th>Year</th>
                  <th>Course & Section</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: '1.8rem' }}>
                      No student records match "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const studentIdDisplay = student.student_no || student.studentNo || '2026-001'
                    const yearDisplay =
                      student.year_level === 1
                        ? '1st Year'
                        : student.year_level === 2
                        ? '2nd Year'
                        : student.year_level === 3
                        ? '3rd Year'
                        : '4th Year'

                    return (
                      <tr key={student.id}>
                        <td>
                          <strong>{student.name}</strong>
                          <small>ID: {studentIdDisplay}</small>
                        </td>
                        <td>
                          <span className="chip" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            {yearDisplay}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#60a5fa' }}>
                            {student.course} {student.section_label || '4A'}
                          </strong>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '0.2rem 0.65rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                            }}
                          >
                            Active
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForRecord(student)}
                              style={{
                                background: 'rgba(59,130,246,0.15)',
                                color: '#60a5fa',
                                padding: '0.35rem 0.7rem',
                                fontSize: '0.8rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                            >
                              <FileText size={13} /> View Records
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStudentId(student.id)
                                setStudentForm({
                                  ...blankStudent,
                                  ...student,
                                  studentNo: studentIdDisplay,
                                  student_no: studentIdDisplay,
                                })
                              }}
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                                padding: '0.35rem 0.7rem',
                                fontSize: '0.8rem',
                              }}
                              onClick={() => {
                                if (
                                  confirm(
                                    `Delete student "${student.name}" (${studentIdDisplay})? This will remove all their enrollments.`,
                                  )
                                ) {
                                  deleteStudent(student.id)
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* View Records Modal */}
      {selectedStudentForRecord && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setSelectedStudentForRecord(null)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              maxWidth: '750px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
              <div>
                <span className="chip" style={{ color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', fontWeight: 700 }}>
                  Official Student Academic Record
                </span>
                <h3 style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>
                  {selectedStudentForRecord.name}
                </h3>
                <small style={{ color: '#475569', fontSize: '0.88rem' }}>
                  Student ID: <strong style={{ color: '#0f172a' }}>{selectedStudentForRecord.student_no || selectedStudentForRecord.studentNo}</strong> • Course & Section:{' '}
                  <strong style={{ color: '#0f172a' }}>{selectedStudentForRecord.course} {selectedStudentForRecord.section_label}</strong>
                </small>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForRecord(null)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.8rem 0', color: '#0f172a', fontWeight: 700, fontSize: '1.05rem' }}>Enrolled Classes & Term Grades:</h4>
              {studentRecords.length === 0 ? (
                <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                  No grade records encoded yet for this student.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Prelim</th>
                        <th>Midterm</th>
                        <th>Final</th>
                        <th>Average</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentRecords.map((item, idx) => {
                        const isFail = item.computed.status === 'Bound to Fail'
                        const isRisk = item.computed.status === 'At Risk'

                        return (
                          <tr key={idx}>
                            <td>
                              <strong style={{ color: '#0f172a' }}>{item.classItem?.subject?.title || 'Subject'}</strong>
                              <small style={{ color: '#64748b' }}>{item.classItem?.section?.name}</small>
                            </td>
                            <td style={{ color: '#0f172a' }}>{item.computed.preliminary}%</td>
                            <td style={{ color: '#0f172a' }}>{item.computed.midterm}%</td>
                            <td style={{ color: '#0f172a' }}>{item.computed.final}%</td>
                            <td>
                              <strong style={{ color: '#2563eb', fontWeight: 800 }}>{item.computed.overall}%</strong>
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: '999px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  background: isFail
                                    ? '#fee2e2'
                                    : isRisk
                                    ? '#fef3c7'
                                    : '#dcfce7',
                                  color: isFail ? '#b91c1c' : isRisk ? '#b45309' : '#15803d',
                                  border: isFail
                                    ? '1px solid #fecaca'
                                    : isRisk
                                    ? '1px solid #fde68a'
                                    : '1px solid #bbf7d0',
                                }}
                              >
                                {item.computed.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentManagement
