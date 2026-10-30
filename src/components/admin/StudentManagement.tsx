import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Edit3,
  Trash2,
  Eye,
  X,
  GraduationCap,
  Search,
  UserX,
  UserCheck,
  Filter
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCourseSection, getLetterGrade, isTermEncoded } from '../../utils/helpers';
import type { StudentRecord } from '../../utils/types';

export const StudentManagement: React.FC = () => {
  const {
    students,
    studentForm,
    setStudentForm,
    editingStudentId,
    handleSaveStudent,
    handleEditStudent,
    handleDeleteStudent,
    toggleStudentDropOut,
    resetStudentForm,
    studentQuery,
    setStudentQuery,
    classes,
    sections,
    detailedGrades
  } = useData();
  const { activeRole } = useAuth();

  const [viewingStudent, setViewingStudent] = useState<StudentRecord | null>(null);
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Collect all distinct Course & Section options dynamically from sections, classes, and students
  const courseSectionSuggestions = useMemo(() => {
    const set = new Set<string>(['CIT A', 'CIT B', 'BSIT 1A', 'BSIT 2A', 'BSIT 3A', 'BSIT 4A']);
    sections.forEach((sec) => {
      const val = formatCourseSection(sec.course ? `${sec.course} ${sec.name}` : sec.name);
      if (val) set.add(val);
    });
    classes.forEach((cls) => {
      const val = formatCourseSection(cls.section?.name || cls.section_id || '');
      if (val) set.add(val);
    });
    students.forEach((stu) => {
      const val = formatCourseSection(stu.course);
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  }, [sections, classes, students]);

  const distinctStudentSections = useMemo(() => {
    const set = new Set<string>();
    students.forEach((stu) => {
      const val = formatCourseSection(stu.course);
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  }, [students]);

  const filteredDirectoryStudents = useMemo(() => {
    const query = studentQuery.trim().toLowerCase();
    return students.filter((student) => {
      const sec = formatCourseSection(student.course);
      if (sectionFilter !== 'ALL' && sec.toLowerCase() !== sectionFilter.toLowerCase()) {
        return false;
      }
      const status = student.status || 'active';
      if (statusFilter !== 'ALL' && status !== statusFilter) {
        return false;
      }
      if (!query) return true;
      return (
        (student.name || '').toLowerCase().includes(query) ||
        (student.email || '').toLowerCase().includes(query) ||
        (student.course || '').toLowerCase().includes(query) ||
        String(student.year || student.year_level || '').toLowerCase().includes(query) ||
        (student.student_no || '').toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query)
      );
    });
  }, [students, studentQuery, sectionFilter, statusFilter]);

  return (
    <section className="content-section">
      <div className="section-header">
        <div>
          <h1>Student Management</h1>
          <p className="section-subtitle">
            Register students with any Course &amp; Section, search the directory, and manage active or dropped-out status.
          </p>
        </div>
      </div>

      {/* Add / Edit Student Form */}
      <article className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">
          <div>
            <h2>{editingStudentId ? 'Update Student Information' : 'Add New Student'}</h2>
            <p>Course &amp; Section is searchable and accepts any program/section (e.g. BSIT 1A, CIT A, BSCS 2B).</p>
          </div>
          {editingStudentId && (
            <button
              type="button"
              className="secondary-btn"
              onClick={resetStudentForm}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <X size={15} />
              Cancel Edit
            </button>
          )}
        </div>

        <form className="entity-form" onSubmit={handleSaveStudent}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', width: '100%' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                Student Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Juan Dela Cruz"
                value={studentForm.name}
                onChange={(e) => setStudentForm((cur) => ({ ...cur, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                Email Address *
              </label>
              <input
                type="email"
                placeholder="e.g. juan@trackademic.edu"
                value={studentForm.email}
                onChange={(e) => setStudentForm((cur) => ({ ...cur, email: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                Course &amp; Section (Searchable / Type Any) *
              </label>
              <input
                type="text"
                list="student-course-sections-datalist"
                placeholder="Type or search Course & Section (e.g. BSIT 1A, CIT A)"
                value={studentForm.course}
                onChange={(e) => setStudentForm((cur) => ({ ...cur, course: e.target.value }))}
                required
              />
              <datalist id="student-course-sections-datalist">
                {courseSectionSuggestions.map((sec) => (
                  <option key={sec} value={sec} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                Year Level *
              </label>
              <select
                value={studentForm.year}
                onChange={(e) => setStudentForm((cur) => ({ ...cur, year: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a',
                  fontSize: '0.95rem'
                }}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                Enrollment Status *
              </label>
              <select
                value={studentForm.status || 'active'}
                onChange={(e) =>
                  setStudentForm((cur) => ({
                    ...cur,
                    status: e.target.value as 'active' | 'dropped' | 'inactive'
                  }))
                }
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a',
                  fontSize: '0.95rem'
                }}
              >
                <option value="active">Active</option>
                <option value="dropped">Dropped Out</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                Account Password {editingStudentId ? '(Leave blank to keep)' : '*'}
              </label>
              <input
                type="password"
                placeholder="Password"
                value={studentForm.password}
                onChange={(e) => setStudentForm((cur) => ({ ...cur, password: e.target.value }))}
                required={!editingStudentId}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                Confirm Password {editingStudentId ? '(Leave blank to keep)' : '*'}
              </label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={studentForm.confirmPassword}
                onChange={(e) => setStudentForm((cur) => ({ ...cur, confirmPassword: e.target.value }))}
                required={!editingStudentId}
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="submit" className="primary-btn">
              <UserPlus size={16} />
              <span>{editingStudentId ? 'Update Student' : 'Add Student'}</span>
            </button>
          </div>
        </form>
      </article>

      {/* Student Directory Table */}
      <article className="panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2>Student Directory</h2>
            <p>
              Showing <strong>{filteredDirectoryStudents.length}</strong> of <strong>{students.length}</strong> registered students
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: '250px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }}
              />
              <input
                className="search-input"
                type="search"
                placeholder="Search name, ID, email, course & section..."
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                style={{ paddingLeft: '36px', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={15} style={{ color: '#64748b' }} />
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <option value="ALL">All Course &amp; Sections</option>
                {distinctStudentSections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="dropped">Dropped Out Only</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Course &amp; Section</th>
                <th>Year Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDirectoryStudents.map((student) => {
                const isDropped = student.status === 'dropped';
                return (
                  <tr key={student.id} style={{ opacity: isDropped ? 0.72 : 1 }}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{student.student_no || student.id}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{student.name}</td>
                    <td>{student.email}</td>
                    <td>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          fontWeight: 700,
                          fontSize: '0.78rem'
                        }}
                      >
                        {formatCourseSection(student.course)}
                      </span>
                    </td>
                    <td>
                      {typeof student.year === 'number'
                        ? `${student.year}${student.year === 1 ? 'st' : student.year === 2 ? 'nd' : student.year === 3 ? 'rd' : 'th'} Year`
                        : student.year}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isDropped ? '#fee2e2' : '#dcfce7',
                          color: isDropped ? '#b91c1c' : '#15803d'
                        }}
                      >
                        {isDropped ? 'Dropped Out' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() => setViewingStudent(student)}
                          title="View Enrolled Classes & Grades"
                        >
                          <Eye size={14} />
                          <span>View Records</span>
                        </button>
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className={isDropped ? 'ghost-btn' : 'danger-btn'}
                          onClick={() => toggleStudentDropOut(student.id)}
                          title={
                            isDropped
                              ? 'Reactivate this student'
                              : 'Mark student as Dropped Out and notify instructors'
                          }
                          style={
                            isDropped
                              ? {
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  border: '1px solid #86efac'
                                }
                              : undefined
                          }
                        >
                          {isDropped ? <UserCheck size={14} /> : <UserX size={14} />}
                          <span>{isDropped ? 'Reactivate' : 'Drop Out'}</span>
                        </button>
                        {activeRole === 'administrator' && (
                          <button
                            type="button"
                            className="danger-btn"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDirectoryStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    No students match your current search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      {/* View Student Academic Records Modal */}
      {viewingStudent && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            className="modal-content"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '92%',
              maxWidth: '940px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #cbd5e1',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
            }}
          >
            <div
              className="modal-header"
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                  <GraduationCap size={20} style={{ color: '#2563eb' }} />
                  Academic Records: {viewingStudent.name}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  ID: {viewingStudent.student_no || viewingStudent.id} | Course &amp; Section:{' '}
                  {formatCourseSection(viewingStudent.course)} | Status:{' '}
                  <strong>{viewingStudent.status === 'dropped' ? 'Dropped Out' : 'Active'}</strong>
                </p>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '24px', overflowY: 'auto' }}>
              {(() => {
                const enrolledClasses = classes.filter(
                  (c) =>
                    c.student_ids?.includes(viewingStudent.id) ||
                    c.students?.some((s) => s.id === viewingStudent.id)
                );

                if (enrolledClasses.length === 0) {
                  return (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#64748b',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px dashed #cbd5e1'
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '1rem' }}>
                        This student is not currently enrolled in any subject classes.
                      </p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {enrolledClasses.map((cls) => {
                      const classSheets = detailedGrades[cls.id] || [];
                      const sheet = classSheets.find((s) => s.studentId === viewingStudent.id);
                      const hasPrelim = sheet ? isTermEncoded(sheet.prelim) : false;
                      const hasMidterm = sheet ? isTermEncoded(sheet.midterm) : false;
                      const hasPrefinal = sheet ? isTermEncoded(sheet.prefinal) : false;
                      const hasFinal = sheet ? isTermEncoded(sheet.final) : false;
                      const hasAny = hasPrelim || hasMidterm || hasPrefinal || hasFinal;
                      const roundedOverall =
                        hasAny && sheet && sheet.overallGrade > 0 ? Math.round(sheet.overallGrade) : null;

                      return (
                        <div
                          key={cls.id}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              padding: '16px 20px',
                              background: '#ffffff',
                              borderBottom: '1px solid #e2e8f0',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}
                          >
                            <div>
                              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
                                {cls.subject?.code} — {cls.subject?.title}
                              </h3>
                              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#475569' }}>
                                Section: {formatCourseSection(cls.section?.name || '')} | Instructor:{' '}
                                {cls.instructor?.name || 'TBA'}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                                  Rounded Overall Grade
                                </span>
                                <strong
                                  style={{
                                    fontSize: '1.15rem',
                                    color:
                                      roundedOverall === null
                                        ? '#64748b'
                                        : roundedOverall >= 75
                                        ? '#15803d'
                                        : '#b91c1c'
                                  }}
                                >
                                  {roundedOverall !== null
                                    ? `${roundedOverall}% (${getLetterGrade(roundedOverall)})`
                                    : 'Not Encoded'}
                                </strong>
                              </div>
                            </div>
                          </div>

                          <div style={{ padding: '16px 20px' }}>
                            {!sheet || !hasAny ? (
                              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', fontStyle: 'italic' }}>
                                No grades have been encoded for this student in this subject yet.
                              </p>
                            ) : (
                              <div className="table-wrap" style={{ margin: 0 }}>
                                <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                  <thead>
                                    <tr>
                                      <th>Grading Period</th>
                                      <th>Attendance (10%)</th>
                                      <th>Quizzes (20%)</th>
                                      <th>Activity (20%)</th>
                                      <th>Participation (10%)</th>
                                      <th>Exam (40%)</th>
                                      <th>Raw Grade</th>
                                      <th>Cumulative Rounded</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(
                                      [
                                        { key: 'prelim', label: 'Prelim', data: sheet.prelim, active: hasPrelim },
                                        { key: 'midterm', label: 'Midterm', data: sheet.midterm, active: hasMidterm },
                                        {
                                          key: 'prefinal',
                                          label: 'Pre-Final',
                                          data: sheet.prefinal,
                                          active: hasPrefinal
                                        },
                                        { key: 'final', label: 'Final', data: sheet.final, active: hasFinal }
                                      ] as const
                                    ).map((row) => (
                                      <tr key={row.key}>
                                        <td style={{ fontWeight: 600 }}>{row.label}</td>
                                        <td>{row.active && row.data ? row.data.attendance : '—'}</td>
                                        <td>
                                          {row.active && row.data
                                            ? Math.round(row.data.quiz ?? ((row.data.quiz1 || 0) + (row.data.quiz2 || 0)) / 2)
                                            : '—'}
                                        </td>
                                        <td>
                                          {row.active && row.data
                                            ? Math.round(row.data.activity ?? ((row.data.act1 || 0) + (row.data.act2 || 0) + (row.data.act3 || 0)) / 3)
                                            : '—'}
                                        </td>
                                        <td>{row.active && row.data ? row.data.participation : '—'}</td>
                                        <td>{row.active && row.data ? row.data.exam : '—'}</td>
                                        <td>{row.active && row.data ? `${Math.round(row.data.rawGrade || 0)}%` : '—'}</td>
                                        <td style={{ fontWeight: 700, color: '#1d4ed8' }}>
                                          {row.active && row.data ? `${Math.round(row.data.termGrade)}%` : '—'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div
              className="modal-footer"
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <button
                onClick={() => setViewingStudent(null)}
                className="primary-btn"
                style={{ padding: '8px 20px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentManagement;
