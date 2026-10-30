import React from 'react';
import {
  Users,
  BookOpen,
  UserCheck,
  TrendingUp,
  Eye,
  Calculator
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCourseSection } from '../../utils/helpers';

export const AdminOverview: React.FC = () => {
  const {
    students,
    subjects,
    instructors,
    classes,
    setActiveSection,
    allComputedRows
  } = useData();

  const encodedRows = allComputedRows.filter((r) => r.currentGrade > 0);
  const overallAvg =
    encodedRows.length > 0
      ? Math.round(encodedRows.reduce((acc, r) => acc + r.currentGrade, 0) / encodedRows.length)
      : 0;

  return (
    <section className="content-section">
      <div className="section-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="section-subtitle">
            Live institutional overview of students, instructors, subjects, and submitted grades.
          </p>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={() => setActiveSection('grades')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Calculator size={16} />
          <span>View All Subject Grades</span>
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <article className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
            <Users size={18} />
          </div>
          <div>
            <p className="stat-label">Total Students</p>
            <p className="stat-value">{students.length}</p>
            <p className="stat-sub">
              {students.filter((s) => s.status !== 'dropped').length} Active ·{' '}
              {students.filter((s) => s.status === 'dropped').length} Dropped
            </p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#16a34a' }}>
            <UserCheck size={18} />
          </div>
          <div>
            <p className="stat-label">Total Instructors</p>
            <p className="stat-value">{instructors.length}</p>
            <p className="stat-sub">Registered faculty accounts</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
            <BookOpen size={18} />
          </div>
          <div>
            <p className="stat-label">Total Subjects</p>
            <p className="stat-value">{subjects.length}</p>
            <p className="stat-sub">{classes.length} active class sections</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed' }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="stat-label">Average Performance</p>
            <p className="stat-value">{encodedRows.length > 0 ? `${overallAvg}%` : '—'}</p>
            <p className="stat-sub">Rounded across encoded classes</p>
          </div>
        </article>
      </div>

      {/* Recent Classes Overview */}
      <article className="panel" style={{ marginTop: '24px' }}>
        <div className="panel-header">
          <div>
            <h2>Active Classes &amp; Assigned Instructors</h2>
            <p>Click View Grades to inspect read-only student grades per subject and section</p>
          </div>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setActiveSection('classes')}
          >
            <span>Manage All Classes</span>
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Class Subject</th>
                <th>Course &amp; Section</th>
                <th>Assigned Instructor</th>
                <th>Enrolled Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.slice(0, 8).map((cls) => (
                <tr key={cls.id}>
                  <td>
                    <strong style={{ color: '#0f172a', display: 'block' }}>{cls.subject?.code}</strong>
                    <small style={{ color: '#475569' }}>{cls.subject?.title}</small>
                  </td>
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
                      {formatCourseSection(cls.section?.name || '')}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>
                    {cls.instructor?.name || 'Unassigned'}
                  </td>
                  <td>{cls.student_ids?.length || 0} students</td>
                  <td>
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => setActiveSection('grades')}
                    >
                      <Eye size={14} />
                      <span>View Grades</span>
                    </button>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    No classes created yet. Go to Classes to create and assign a subject class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};

export default AdminOverview;
