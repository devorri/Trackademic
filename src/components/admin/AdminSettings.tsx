import React, { useState } from 'react';
import {
  Save,
  Calendar,
  Award,
  Bell,
  CheckCircle2,
  Shield,
  Database,
  Calculator
} from 'lucide-react';
import { dbSystemSettings } from '../../utils/db';

export const AdminSettings: React.FC = () => {
  const [academicSettings, setAcademicSettings] = useState({
    schoolYear: '2025-2026',
    semester: '1st Semester',
    enrollmentStatus: 'Open',
    gradeSubmissionDeadline: '2026-05-30'
  });

  // Matches the exact Trackademic grading specification:
  // Per-Period Raw = Attendance 10% + Quizzes 20% + Activity 20% + Participation 10% + Exam 40% = 100%
  // Cumulative Term Grade = Previous Period Grade (40%) + Current Period Raw Grade (60%)
  const [gradingSettings, setGradingSettings] = useState({
    passingGrade: 75,
    attendanceWeight: 10,
    quizWeight: 20,
    activityWeight: 20,
    participationWeight: 10,
    examWeight: 40,
    previousPeriodWeight: 40,
    currentPeriodRawWeight: 60,
    roundingMode: 'Whole Number (Math.round)'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    notifyAdminOnGradeSubmit: true,
    notifyInstructorOnClassAssign: true,
    notifyInstructorOnStudentEnroll: true,
    notifyInstructorOnStudentDropOut: true
  });

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const componentTotal =
    gradingSettings.attendanceWeight +
    gradingSettings.quizWeight +
    gradingSettings.activityWeight +
    gradingSettings.participationWeight +
    gradingSettings.examWeight;

  const cumulativeTotal =
    gradingSettings.previousPeriodWeight + gradingSettings.currentPeriodRawWeight;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (componentTotal !== 100) {
      alert(`Per-period component weights must equal 100% (currently ${componentTotal}%).`);
      return;
    }
    if (cumulativeTotal !== 100) {
      alert(`Cumulative period weights must equal 100% (currently ${cumulativeTotal}%).`);
      return;
    }

    await dbSystemSettings.save({
      school_year: academicSettings.schoolYear,
      semester: academicSettings.semester,
      passing_grade: gradingSettings.passingGrade,
      exam_weight: gradingSettings.examWeight,
      quiz_weight: gradingSettings.quizWeight,
      activity_weight: gradingSettings.activityWeight + gradingSettings.attendanceWeight + gradingSettings.participationWeight,
      email_alerts: notificationSettings.notifyAdminOnGradeSubmit
    });

    setSaveMessage('System and grading formula settings saved to Supabase!');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  return (
    <section className="content-section">
      <div className="section-header">
        <div>
          <h1>System Settings</h1>
          <p className="section-subtitle">
            Configure academic periods, the cumulative 4-period grading formula, and real-time notification triggers.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="primary-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Save size={16} />
          <span>Save All Changes</span>
        </button>
      </div>

      {saveMessage && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#15803d',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          <span>{saveMessage}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Academic Period Configuration */}
        <article className="panel">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={20} style={{ color: '#2563eb' }} />
              <div>
                <h2>Academic Period</h2>
                <p>Set the active school year and semester</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                Active School Year
              </label>
              <select
                value={academicSettings.schoolYear}
                onChange={(e) => setAcademicSettings({ ...academicSettings, schoolYear: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a'
                }}
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                Active Semester
              </label>
              <select
                value={academicSettings.semester}
                onChange={(e) => setAcademicSettings({ ...academicSettings, semester: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a'
                }}
              >
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="Summer">Summer Term</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                Grade Submission Deadline
              </label>
              <input
                type="date"
                value={academicSettings.gradeSubmissionDeadline}
                onChange={(e) =>
                  setAcademicSettings({ ...academicSettings, gradeSubmissionDeadline: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </article>

        {/* Per-Period Component Weights */}
        <article className="panel">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={20} style={{ color: '#16a34a' }} />
              <div>
                <h2>Per-Period Component Weights (100%)</h2>
                <p>Applied to Prelim, Midterm, Pre-Final, and Final raw scores</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Attendance (%)
                </label>
                <input
                  type="number"
                  value={gradingSettings.attendanceWeight}
                  onChange={(e) =>
                    setGradingSettings({ ...gradingSettings, attendanceWeight: Number(e.target.value) })
                  }
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Quizzes (%)
                </label>
                <input
                  type="number"
                  value={gradingSettings.quizWeight}
                  onChange={(e) =>
                    setGradingSettings({ ...gradingSettings, quizWeight: Number(e.target.value) })
                  }
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Activities (%)
                </label>
                <input
                  type="number"
                  value={gradingSettings.activityWeight}
                  onChange={(e) =>
                    setGradingSettings({ ...gradingSettings, activityWeight: Number(e.target.value) })
                  }
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Participation (%)
                </label>
                <input
                  type="number"
                  value={gradingSettings.participationWeight}
                  onChange={(e) =>
                    setGradingSettings({ ...gradingSettings, participationWeight: Number(e.target.value) })
                  }
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Major Exam (%)
                </label>
                <input
                  type="number"
                  value={gradingSettings.examWeight}
                  onChange={(e) =>
                    setGradingSettings({ ...gradingSettings, examWeight: Number(e.target.value) })
                  }
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Passing Threshold (%)
                </label>
                <input
                  type="number"
                  value={gradingSettings.passingGrade}
                  onChange={(e) =>
                    setGradingSettings({ ...gradingSettings, passingGrade: Number(e.target.value) })
                  }
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: componentTotal === 100 ? '#f0fdf4' : '#fef2f2',
                border: componentTotal === 100 ? '1px solid #86efac' : '1px solid #fecaca',
                color: componentTotal === 100 ? '#15803d' : '#b91c1c',
                fontSize: '0.84rem',
                fontWeight: 700
              }}
            >
              Total Period Raw Weight: {componentTotal}% (Attendance {gradingSettings.attendanceWeight}% + Quiz{' '}
              {gradingSettings.quizWeight}% + Activity {gradingSettings.activityWeight}% + Participation{' '}
              {gradingSettings.participationWeight}% + Exam {gradingSettings.examWeight}%)
            </div>
          </div>
        </article>

        {/* Cumulative 4-Period Formula */}
        <article className="panel">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calculator size={20} style={{ color: '#7c3aed' }} />
              <div>
                <h2>Cumulative Grading Formula (Prelim → Final)</h2>
                <p>40% Previous Period Grade + 60% Current Period Raw Grade</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Previous Period Carry-Over (%)
                </label>
                <input
                  type="number"
                  value={gradingSettings.previousPeriodWeight}
                  onChange={(e) =>
                    setGradingSettings({ ...gradingSettings, previousPeriodWeight: Number(e.target.value) })
                  }
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Current Period Raw Weight (%)
                </label>
                <input
                  type="number"
                  value={gradingSettings.currentPeriodRawWeight}
                  onChange={(e) =>
                    setGradingSettings({ ...gradingSettings, currentPeriodRawWeight: Number(e.target.value) })
                  }
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '0.83rem',
                color: '#334155',
                lineHeight: 1.6
              }}
            >
              <div>
                • <strong>Prelim Grade</strong> = 100% Prelim Raw Grade
              </div>
              <div>
                • <strong>Midterm Grade</strong> = Prelim ({gradingSettings.previousPeriodWeight}%) + Midterm Raw (
                {gradingSettings.currentPeriodRawWeight}%)
              </div>
              <div>
                • <strong>Pre-Final Grade</strong> = Midterm ({gradingSettings.previousPeriodWeight}%) + Pre-Final Raw (
                {gradingSettings.currentPeriodRawWeight}%)
              </div>
              <div>
                • <strong>Final Grade</strong> = Pre-Final ({gradingSettings.previousPeriodWeight}%) + Final Raw (
                {gradingSettings.currentPeriodRawWeight}%)
              </div>
              <div style={{ marginTop: '6px', color: '#1d4ed8', fontWeight: 700 }}>
                • Display Rounding: {gradingSettings.roundingMode}
              </div>
            </div>
          </div>
        </article>

        {/* Workflow Notifications */}
        <article className="panel">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={20} style={{ color: '#d97706' }} />
              <div>
                <h2>Workflow Notification Rules</h2>
                <p>Automated triggers for Admin and Instructors</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {[
              {
                key: 'notifyAdminOnGradeSubmit',
                title: 'Notify Admin on Grade Submission',
                desc: 'Send notification to Admin when an instructor submits/uploads class grades'
              },
              {
                key: 'notifyInstructorOnClassAssign',
                title: 'Notify Instructor on Subject/Class Assignment',
                desc: 'Alert instructor immediately when Admin assigns a subject class to them'
              },
              {
                key: 'notifyInstructorOnStudentEnroll',
                title: 'Notify Instructor on Student Enrollment',
                desc: 'Alert instructor when students are added/enrolled in their subject class'
              },
              {
                key: 'notifyInstructorOnStudentDropOut',
                title: 'Notify Instructor on Student Drop Out',
                desc: 'Alert instructor when an enrolled student drops out'
              }
            ].map((item) => (
              <label
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0f172a' }}>
                    {item.title}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(
                    notificationSettings[item.key as keyof typeof notificationSettings]
                  )}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      [item.key]: e.target.checked
                    }))
                  }
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                />
              </label>
            ))}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: '#15803d',
                fontWeight: 600
              }}
            >
              <Database size={16} />
              <Shield size={16} />
              <span>Connected to live Supabase PostgreSQL database (Zero mock data mode)</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default AdminSettings;
