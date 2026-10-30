import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Users,
  Search
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCourseSection, isTermEncoded } from '../../utils/helpers';

export const AdminPredictiveAnalytics: React.FC = () => {
  const { students, classes, detailedGrades } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Compute real student performance across all enrolled classes (zero fake/benchmark rows)
  const studentAnalyticsList = useMemo(() => {
    return students.map((student) => {
      const enrolledClasses = classes.filter(
        (c) =>
          (c.studentIds || c.student_ids || []).includes(student.id) ||
          c.students?.some((s) => s.id === student.id),
      );

      let prelimSum = 0;
      let prelimCount = 0;
      let midtermSum = 0;
      let midtermCount = 0;
      let prefinalSum = 0;
      let prefinalCount = 0;
      let finalSum = 0;
      let finalCount = 0;
      let currentSum = 0;
      let currentCount = 0;
      let predictedSum = 0;
      let predictedCount = 0;

      enrolledClasses.forEach((cls) => {
        const sheets = detailedGrades[cls.id] || [];
        const sheet = sheets.find((s) => s.studentId === student.id);
        if (!sheet) return;

        if (isTermEncoded(sheet.prelim)) {
          prelimSum += Math.round(sheet.prelim.termGrade);
          prelimCount++;
        }
        if (isTermEncoded(sheet.midterm)) {
          midtermSum += Math.round(sheet.midterm.termGrade);
          midtermCount++;
        }
        if (isTermEncoded(sheet.prefinal) && sheet.prefinal) {
          prefinalSum += Math.round(sheet.prefinal.termGrade);
          prefinalCount++;
        }
        if (isTermEncoded(sheet.final)) {
          finalSum += Math.round(sheet.final.termGrade);
          finalCount++;
        }
        if (sheet.overallGrade > 0) {
          currentSum += Math.round(sheet.overallGrade);
          currentCount++;
          predictedSum += Math.round(sheet.predictedFinal || sheet.overallGrade);
          predictedCount++;
        }
      });

      const hasEncoded = currentCount > 0;
      const currentGrade = hasEncoded ? Math.round(currentSum / currentCount) : null;
      const predictedGrade = predictedCount > 0 ? Math.round(predictedSum / predictedCount) : null;

      let status: 'High Performing' | 'On Track' | 'At Risk' | 'Not Encoded' = 'Not Encoded';
      let trend = 'Pending Grades';
      if (currentGrade !== null) {
        if (currentGrade >= 85) {
          status = 'High Performing';
          trend = 'Excelling';
        } else if (currentGrade >= 75) {
          status = 'On Track';
          trend = 'Stable';
        } else {
          status = 'At Risk';
          trend = 'Needs Intervention';
        }
      }

      return {
        id: student.id,
        studentNo: student.student_no || student.id,
        name: student.name,
        course: formatCourseSection(student.course),
        year: student.year,
        studentStatus: student.status || 'active',
        prelim: prelimCount > 0 ? Math.round(prelimSum / prelimCount) : null,
        midterm: midtermCount > 0 ? Math.round(midtermSum / midtermCount) : null,
        prefinal: prefinalCount > 0 ? Math.round(prefinalSum / prefinalCount) : null,
        final: finalCount > 0 ? Math.round(finalSum / finalCount) : null,
        currentGrade,
        predictedGrade,
        status,
        trend
      };
    });
  }, [students, classes, detailedGrades]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return studentAnalyticsList.filter((s) => {
      const matchesSearch =
        !q ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.course || '').toLowerCase().includes(q) ||
        (s.studentNo || '').toLowerCase().includes(q);
      const matchesFilter = filterStatus === 'All' || s.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [studentAnalyticsList, searchQuery, filterStatus]);

  const totalAnalyzed = studentAnalyticsList.filter((s) => s.currentGrade !== null).length;
  const totalAtRisk = studentAnalyticsList.filter((s) => s.status === 'At Risk').length;
  const totalOnTrack = studentAnalyticsList.filter((s) => s.status === 'On Track').length;
  const totalHigh = studentAnalyticsList.filter((s) => s.status === 'High Performing').length;

  return (
    <section className="content-section">
      <div className="section-header">
        <div>
          <h1>Predictive Analytics Overview</h1>
          <p className="section-subtitle">
            Real-time academic forecasting based strictly on actual encoded student grades.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <article className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
            <Users size={18} />
          </div>
          <div>
            <p className="stat-label">Graded Students Analyzed</p>
            <p className="stat-value">{totalAnalyzed}</p>
            <p className="stat-sub">Out of {students.length} registered students</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626' }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="stat-label">At Risk Students</p>
            <p className="stat-value">{totalAtRisk}</p>
            <p className="stat-sub">Average below 75%</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="stat-label">On Track</p>
            <p className="stat-value">{totalOnTrack}</p>
            <p className="stat-sub">Maintaining 75% – 84%</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#16a34a' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <p className="stat-label">High Performing</p>
            <p className="stat-value">{totalHigh}</p>
            <p className="stat-sub">Average 85% and above</p>
          </div>
        </article>
      </div>

      {/* Student Prediction List */}
      <article className="panel" style={{ marginTop: '24px' }}>
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2>Student Performance Predictions</h2>
            <p>All grades are rounded to whole numbers from real encoded class records.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
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
                type="search"
                className="search-input"
                placeholder="Search student or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', width: '240px' }}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#0f172a',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <option value="All">All Statuses</option>
              <option value="At Risk">At Risk</option>
              <option value="On Track">On Track</option>
              <option value="High Performing">High Performing</option>
              <option value="Not Encoded">Not Encoded</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Course &amp; Section</th>
                <th>Prelim</th>
                <th>Midterm</th>
                <th>Pre-Final</th>
                <th>Current Avg</th>
                <th>Predicted Final</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <strong style={{ color: '#0f172a', display: 'block' }}>{student.name}</strong>
                    <small style={{ color: '#64748b' }}>ID: {student.studentNo}</small>
                  </td>
                  <td>{student.course}</td>
                  <td>{student.prelim !== null ? `${student.prelim}%` : '—'}</td>
                  <td>{student.midterm !== null ? `${student.midterm}%` : '—'}</td>
                  <td>{student.prefinal !== null ? `${student.prefinal}%` : '—'}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>
                      {student.currentGrade !== null ? `${student.currentGrade}%` : '—'}
                    </strong>
                  </td>
                  <td>
                    <strong
                      style={{
                        color:
                          student.predictedGrade === null
                            ? '#64748b'
                            : student.predictedGrade >= 85
                            ? '#15803d'
                            : student.predictedGrade >= 75
                            ? '#1d4ed8'
                            : '#b91c1c'
                      }}
                    >
                      {student.predictedGrade !== null ? `${student.predictedGrade}%` : '—'}
                    </strong>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background:
                          student.status === 'High Performing'
                            ? '#dcfce7'
                            : student.status === 'On Track'
                            ? '#eff6ff'
                            : student.status === 'At Risk'
                            ? '#fee2e2'
                            : '#f1f5f9',
                        color:
                          student.status === 'High Performing'
                            ? '#15803d'
                            : student.status === 'On Track'
                            ? '#1d4ed8'
                            : student.status === 'At Risk'
                            ? '#b91c1c'
                            : '#64748b'
                      }}
                    >
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-cell">
                    No students match the selected filter criteria.
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

export default AdminPredictiveAnalytics;
