import React from 'react'
import { useData } from '../../context/DataContext'

export const StudentManagement: React.FC = () => {
  const {
    setStudents,
    studentForm,
    setStudentForm,
    editingStudentId,
    setEditingStudentId,
    searchTerm,
    setSearchTerm,
    filteredStudents,
    handleSaveStudent,
  } = useData()

  return (
    <section className="split-grid">
      <form className="panel" onSubmit={handleSaveStudent}>
        <h3>{editingStudentId ? 'Edit Student' : 'Add Student'}</h3>
        <input
          placeholder="Student name"
          value={studentForm.name}
          onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })}
        />
        <input
          placeholder="Email"
          value={studentForm.email}
          onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })}
        />
        <input
          placeholder="Student number"
          value={studentForm.studentNo}
          onChange={(event) => setStudentForm({ ...studentForm, studentNo: event.target.value })}
        />
        <input
          placeholder="Course"
          value={studentForm.course}
          onChange={(event) => setStudentForm({ ...studentForm, course: event.target.value })}
        />
        <input
          placeholder="Section"
          value={studentForm.section}
          onChange={(event) => setStudentForm({ ...studentForm, section: event.target.value })}
        />
        <button type="submit">Save Student</button>
      </form>

      <div className="panel data-card">
        <div className="card-heading">
          <h3>Student Management</h3>
          <input
            placeholder="Search student"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Profile</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>
                  {student.name}
                  <small>{student.studentNo}</small>
                </td>
                <td>
                  {student.course} {student.section}
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
                      onClick={() => setStudents((current) => current.filter((item) => item.id !== student.id))}
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
export default StudentManagement
