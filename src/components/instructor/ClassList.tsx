import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../hooks/useAuth';
import { getSubjectTitle, formatCourseSection, isTermEncoded } from '../../utils/helpers';
import {
  BookOpen,
  Clock,
  MapPin,
  Users,
  X,
  Calculator,
  UserX,
  UserCheck,
  UserPlus
} from 'lucide-react';
import type { ClassRecord } from '../../utils/types';

export const ClassList: React.FC = () => {
  const {
    classes,
    subjects,
    students,
    detailedGradingSheets,
    setSelectedClassId,
    setActiveSection,
    toggleStudentDropOut,
    updateClass
  } = useData();
  const { activeUser } = useAuth();

  const [activeViewingClassId, setActiveViewingClassId] = useState<string | null>(null);
  const [studentToEnrollId, setStudentToEnrollId] = useState<string>('');

  // Filter STRICTLY for the logged-in instructor's assigned classes (never fallback to all classes!)
  const instructorClasses = useMemo(() => {
    if (!activeUser) return [];
    return classes.filter(
      (c) =>
        c.instructor_id === activeUser.id ||
        c.instructor?.id === activeUser.id ||
        c.instructor?.profile_id === activeUser.id ||
        (activeUser.email &&
          c.instructor?.email &&
          c.instructor.email.toLowerCase() === activeUser.email.toLowerCase())
    );
  }, [classes, activeUser]);

  const activeViewingClass: ClassRecord | null = useMemo(
    () => instructorClasses.find((c) => c.id === activeViewingClassId) || null,
    [instructorClasses, activeViewingClassId]
  );

  const classStudents = useMemo(() => {
    if (!activeViewingClass) return [];
    const ids = activeViewingClass.studentIds || activeViewingClass.student_ids || [];
    return students.filter((s) => ids.includes(s.id));
  }, [activeViewingClass, students]);

  const unEnrolledStudents = useMemo(() => {
    if (!activeViewingClass) return [];
    const ids = activeViewingClass.studentIds || activeViewingClass.student_ids || [];
    return students.filter((s) => !ids.includes(s.id) && s.status !== 'dropped');
  }, [activeViewingClass, students]);

  const classSheets = useMemo(() => {
    if (!activeViewingClass) return [];
    return detailedGradingSheets[activeViewingClass.id] || [];
  }, [activeViewingClass, detailedGradingSheets]);

  const encodedClassSheets = useMemo(
    () => classSheets.filter((s) => s.overallGrade > 0),
    [classSheets]
  );

  const classAvg =
    encodedClassSheets.length > 0
      ? Math.round(
          encodedClassSheets.reduce((acc, s) => acc + Math.round(s.overallGrade), 0) /
            encodedClassSheets.length
        )
      : null;

  const handleEnrollStudentInClass = async () => {
    if (!activeViewingClass || !studentToEnrollId) return;
    const existingIds = activeViewingClass.studentIds || activeViewingClass.student_ids || [];
    if (existingIds.includes(studentToEnrollId)) return;
    await updateClass(activeViewingClass.id, {
      studentIds: [...existingIds, studentToEnrollId]
    });
    setStudentToEnrollId('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Header */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          borderRadius: '16px',
          padding: '1.6rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#1d4ed8',
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px'
            }}
          >
            Teaching Assignments ({instructorClasses.length})
          </span>
          <h3
            style={{
              margin: '0.5rem 0 0.25rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '1.5rem',
              color: '#0f172a',
              fontWeight: 800
            }}
          >
            <BookOpen size={22} color="#2563eb" /> My Assigned Classes &amp; Schedules
          </h3>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
            Displaying only the subject classes assigned to <strong>{activeUser?.name}</strong> by the Administrator.
          </p>
        </div>
      </div>

      {/* Empty State if no classes assigned */}
      {instructorClasses.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            color: '#64748b'
          }}
        >
          <BookOpen size={42} style={{ margin: '0 auto 12px', opacity: 0.45, color: '#2563eb' }} />
          <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#0f172a' }}>
            No Classes Assigned Yet
          </h4>
          <p style={{ margin: 0, fontSize: '0.92rem' }}>
            When the Administrator assigns a subject and section to your account, it will appear here automatically.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.4rem'
          }}
        >
          {instructorClasses.map((cls) => {
            const subjectTitle = getSubjectTitle(subjects, cls.subject_id);
            const enrolledCount = (cls.studentIds || cls.student_ids || []).length;
            const sheets = detailedGradingSheets[cls.id] || [];
            const isSubmitted = sheets.some((s) => s.submittedToAdmin);

            return (
              <div
                key={cls.id}
                style={{
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        color: '#1d4ed8',
                        background: '#eff6ff',
                        border: '1px solid #dbeafe',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.6rem',
                        borderRadius: '999px'
                      }}
                    >
                      {formatCourseSection(cls.section?.name || '')}
                    </span>
                    {isSubmitted && (
                      <span
                        style={{
                          color: '#15803d',
                          background: '#dcfce7',
                          border: '1px solid #86efac',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px'
                        }}
                      >
                        Submitted to Admin
                      </span>
                    )}
                  </div>

                  <h4
                    style={{
                      margin: '0.7rem 0 0.4rem 0',
                      fontSize: '1.25rem',
                      color: '#0f172a',
                      fontWeight: 800
                    }}
                  >
                    {cls.subject?.code ? `${cls.subject.code} — ` : ''}
                    {subjectTitle}
                  </h4>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                      margin: '1rem 0 1.4rem 0',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '1rem',
                      borderRadius: '12px'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        fontSize: '0.88rem',
                        color: '#334155',
                        fontWeight: 500
                      }}
                    >
                      <Clock size={16} color="#059669" />
                      <span>{cls.schedule || 'TBA'}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        fontSize: '0.88rem',
                        color: '#334155',
                        fontWeight: 500
                      }}
                    >
                      <MapPin size={16} color="#7c3aed" />
                      <span>{cls.room || 'TBA'}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        fontSize: '0.88rem',
                        color: '#334155',
                        fontWeight: 500
                      }}
                    >
                      <Users size={16} color="#d97706" />
                      <span>{enrolledCount} Enrolled Students</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setActiveViewingClassId(cls.id)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 1rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: 700,
                      borderRadius: '10px'
                    }}
                  >
                    View Class &amp; Roster
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setActiveSection('gradebook');
                    }}
                    style={{
                      padding: '0.65rem 1rem',
                      cursor: 'pointer',
                      background: '#f8fafc',
                      color: '#0f172a',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontWeight: 700
                    }}
                  >
                    <Calculator size={16} color="#2563eb" /> Gradebook
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* "View Class" Interactive Details Modal */}
      {activeViewingClass && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
          onClick={() => setActiveViewingClassId(null)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '20px',
              maxWidth: '1040px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.4rem'
              }}
            >
              <div>
                <span
                  style={{
                    color: '#1d4ed8',
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  Assigned Class Roster &amp; Grades
                </span>
                <h3
                  style={{
                    margin: '0.5rem 0 0.2rem 0',
                    fontSize: '1.5rem',
                    color: '#0f172a',
                    fontWeight: 800
                  }}
                >
                  {getSubjectTitle(subjects, activeViewingClass.subject_id)} —{' '}
                  {formatCourseSection(activeViewingClass.section?.name || '')}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    color: '#475569',
                    fontSize: '0.9rem',
                    marginTop: '0.3rem',
                    fontWeight: 500
                  }}
                >
                  <span>Schedule: {activeViewingClass.schedule || 'TBA'}</span>
                  <span>Room: {activeViewingClass.room || 'TBA'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveViewingClassId(null)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Class Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '1.4rem'
              }}
            >
              <div
                style={{
                  background: '#eff6ff',
                  padding: '1.2rem',
                  borderRadius: '14px',
                  border: '1px solid #bfdbfe'
                }}
              >
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: '#1e40af',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}
                >
                  Class Average (Rounded)
                </span>
                <div
                  style={{
                    fontSize: '1.9rem',
                    fontWeight: 800,
                    color: '#1d4ed8',
                    marginTop: '0.2rem'
                  }}
                >
                  {classAvg !== null ? `${classAvg}%` : '—'}
                </div>
                <small style={{ color: '#3b82f6', fontWeight: 500 }}>
                  {encodedClassSheets.length > 0
                    ? `Across ${encodedClassSheets.length} graded student(s)`
                    : 'No grades encoded yet'}
                </small>
              </div>

              <div
                style={{
                  background: '#f0fdf4',
                  padding: '1.2rem',
                  borderRadius: '14px',
                  border: '1px solid #bbf7d0'
                }}
              >
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: '#166534',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}
                >
                  Total Enrolled
                </span>
                <div
                  style={{
                    fontSize: '1.9rem',
                    fontWeight: 800,
                    color: '#15803d',
                    marginTop: '0.2rem'
                  }}
                >
                  {classStudents.length} Students
                </div>
                <small style={{ color: '#16a34a', fontWeight: 500 }}>
                  {classStudents.filter((s) => s.status !== 'dropped').length} Active ·{' '}
                  {classStudents.filter((s) => s.status === 'dropped').length} Dropped
                </small>
              </div>

              <div
                style={{
                  background: '#fef2f2',
                  padding: '1.2rem',
                  borderRadius: '14px',
                  border: '1px solid #fecaca'
                }}
              >
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: '#991b1b',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}
                >
                  At-Risk Flagged
                </span>
                <div
                  style={{
                    fontSize: '1.9rem',
                    fontWeight: 800,
                    color: '#b91c1c',
                    marginTop: '0.2rem'
                  }}
                >
                  {encodedClassSheets.filter((s) => Math.round(s.overallGrade) < 75).length}
                </div>
                <small style={{ color: '#dc2626', fontWeight: 500 }}>Below 75% passing mark</small>
              </div>
            </div>

            {/* Quick Enroll Student Bar */}
            {unEnrolledStudents.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  padding: '0.9rem 1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  marginBottom: '1.2rem'
                }}
              >
                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                  Enroll Existing Student:
                </strong>
                <select
                  value={studentToEnrollId}
                  onChange={(e) => setStudentToEnrollId(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="">Select a student to add to this class...</option>
                  {unEnrolledStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.student_no || st.studentNo}) —{' '}
                      {formatCourseSection(st.course, st.section_label)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!studentToEnrollId}
                  onClick={handleEnrollStudentInClass}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: studentToEnrollId ? 'pointer' : 'not-allowed',
                    opacity: studentToEnrollId ? 1 : 0.6
                  }}
                >
                  <UserPlus size={14} />
                  Enroll in Class
                </button>
              </div>
            )}

            {/* Student Roster & Grades Table */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.8rem',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.12rem', fontWeight: 800 }}>
                    Enrolled Students &amp; Cumulative Term Grades (Prelim → Final)
                  </h4>
                  <small style={{ color: '#64748b' }}>
                    Formula: Attendance 10% + Quiz 20% + Activity 20% + Participation 10% + Exam 40% | Cumulative: 40% Prev + 60% Current Raw
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setSelectedClassId(activeViewingClass.id);
                    setActiveViewingClassId(null);
                    setActiveSection('gradebook');
                  }}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.84rem', fontWeight: 700 }}
                >
                  Open Class Gradebook
                </button>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <table style={{ margin: 0, fontSize: '0.84rem', width: '100%' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Student</th>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Course &amp; Section</th>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Prelim</th>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Midterm</th>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Pre-Final</th>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Final</th>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Rounded Avg</th>
                      <th style={{ color: '#1e293b', fontWeight: 700 }}>Status / Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', color: '#64748b', padding: '1.8rem' }}>
                          No students enrolled in this class yet.
                        </td>
                      </tr>
                    ) : (
                      classStudents.map((stu) => {
                        const sheet = classSheets.find((gs) => gs.studentId === stu.id);
                        const hasP = sheet ? isTermEncoded(sheet.prelim) : false;
                        const hasM = sheet ? isTermEncoded(sheet.midterm) : false;
                        const hasPF = sheet ? isTermEncoded(sheet.prefinal) : false;
                        const hasF = sheet ? isTermEncoded(sheet.final) : false;
                        const hasAny = hasP || hasM || hasPF || hasF;
                        const overall =
                          hasAny && sheet && sheet.overallGrade > 0
                            ? Math.round(sheet.overallGrade)
                            : null;
                        const isDropped = stu.status === 'dropped';

                        return (
                          <tr
                            key={stu.id}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              opacity: isDropped ? 0.68 : 1
                            }}
                          >
                            <td>
                              <strong style={{ color: '#0f172a' }}>{stu.name}</strong>
                              <small style={{ color: '#64748b', display: 'block' }}>
                                {stu.student_no || stu.studentNo}
                              </small>
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '999px',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  fontWeight: 700,
                                  fontSize: '0.75rem'
                                }}
                              >
                                {formatCourseSection(stu.course, stu.section_label)}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>
                              {hasP && sheet ? `${Math.round(sheet.prelim.termGrade)}%` : '—'}
                            </td>
                            <td style={{ fontWeight: 600 }}>
                              {hasM && sheet ? `${Math.round(sheet.midterm.termGrade)}%` : '—'}
                            </td>
                            <td style={{ fontWeight: 600 }}>
                              {hasPF && sheet?.prefinal ? `${Math.round(sheet.prefinal.termGrade)}%` : '—'}
                            </td>
                            <td style={{ fontWeight: 600 }}>
                              {hasF && sheet ? `${Math.round(sheet.final.termGrade)}%` : '—'}
                            </td>
                            <td>
                              <strong style={{ color: '#1d4ed8', fontSize: '0.96rem' }}>
                                {overall !== null ? `${overall}%` : '—'}
                              </strong>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '999px',
                                    fontSize: '0.73rem',
                                    fontWeight: 700,
                                    background: isDropped
                                      ? '#fee2e2'
                                      : overall === null
                                      ? '#f1f5f9'
                                      : overall >= 75
                                      ? '#dcfce7'
                                      : '#fee2e2',
                                    color: isDropped
                                      ? '#b91c1c'
                                      : overall === null
                                      ? '#64748b'
                                      : overall >= 75
                                      ? '#15803d'
                                      : '#b91c1c'
                                  }}
                                >
                                  {isDropped
                                    ? 'Dropped Out'
                                    : overall === null
                                    ? 'Not Encoded'
                                    : overall >= 75
                                    ? 'Passing'
                                    : 'At Risk'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleStudentDropOut(stu.id)}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.73rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: isDropped ? '#dcfce7' : '#fee2e2',
                                    color: isDropped ? '#15803d' : '#b91c1c',
                                    border: isDropped ? '1px solid #86efac' : '1px solid #fecaca'
                                  }}
                                >
                                  {isDropped ? <UserCheck size={12} /> : <UserX size={12} />}
                                  {isDropped ? 'Reactivate' : 'Drop Out'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassList;
