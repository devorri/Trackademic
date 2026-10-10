import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../hooks/useAuth'
import { Settings, Save, Calendar, Check, Sliders, Shield, Bell } from 'lucide-react'

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useData()
  const { activeUser, setActiveUser } = useAuth()

  // Local form states
  const [schoolYear, setSchoolYear] = useState(settings.schoolYear)
  const [semester, setSemester] = useState(settings.semester)
  const [passingGrade, setPassingGrade] = useState(settings.passingGrade)
  const [prelimWeight, setPrelimWeight] = useState(settings.prelimWeight)
  const [midtermWeight, setMidtermWeight] = useState(settings.midtermWeight)
  const [finalWeight, setFinalWeight] = useState(settings.finalWeight)
  const [quizWeight, setQuizWeight] = useState(settings.quizWeight)
  const [assignmentWeight, setAssignmentWeight] = useState(settings.assignmentWeight)
  const [activityWeight, setActivityWeight] = useState(settings.activityWeight)
  const [examWeight, setExamWeight] = useState(settings.examWeight)
  const [automatedRiskAlerts, setAutomatedRiskAlerts] = useState(settings.automatedRiskAlerts)

  // Account settings
  const [adminName, setAdminName] = useState(activeUser?.name || 'Administrator')
  const [adminEmail, setAdminEmail] = useState(activeUser?.email || 'admin@example.com')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [savedNotice, setSavedNotice] = useState(false)

  function handleSaveAll(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword && newPassword !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    updateSettings({
      schoolYear,
      semester,
      passingGrade: Number(passingGrade),
      prelimWeight: Number(prelimWeight),
      midtermWeight: Number(midtermWeight),
      finalWeight: Number(finalWeight),
      quizWeight: Number(quizWeight),
      assignmentWeight: Number(assignmentWeight),
      activityWeight: Number(activityWeight),
      examWeight: Number(examWeight),
      automatedRiskAlerts,
    })

    if (activeUser) {
      setActiveUser({
        ...activeUser,
        name: adminName,
        email: adminEmail,
      })
    }

    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 3000)
  }

  return (
    <form onSubmit={handleSaveAll} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Header */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          borderRadius: '16px',
          padding: '1.5rem 1.8rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a' }}>
            <Settings size={22} color="#2563eb" /> System & Academic Settings
          </h3>
          <span className="chip" style={{ marginTop: '0.3rem' }}>
            Configure active academic periods, computation formulas, and system preferences
          </span>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.4rem', fontWeight: 700 }}
        >
          <Save size={16} /> Save Configuration
        </button>
      </div>

      {savedNotice && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '12px',
            padding: '1rem 1.4rem',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
          }}
        >
          <Check size={18} /> Settings have been successfully saved and applied system-wide!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* 1. Academic Calendar (School Year & Semester) */}
        <section className="panel" style={{ padding: '1.6rem', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)' }}>
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontSize: '1.1rem' }}>
            <Calendar size={18} color="#2563eb" /> Academic Period Settings
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '0.3rem' }}>
                Active School Year *
              </label>
              <select
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '0.3rem' }}>
                Active Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
              >
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="Summer Term">Summer Term</option>
              </select>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.9rem', borderRadius: '10px', fontSize: '0.85rem', color: '#1e40af' }}>
              💡 All new classes and generated reports will default to <strong>{schoolYear} ({semester})</strong>.
            </div>
          </div>
        </section>

        {/* 2. Grading Settings */}
        <section className="panel" style={{ padding: '1.6rem', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)' }}>
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontSize: '1.1rem' }}>
            <Sliders size={18} color="#16a34a" /> Grading Settings & Formula
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '0.3rem' }}>
                Passing Grade Threshold (%)
              </label>
              <input
                type="number"
                min="60"
                max="85"
                value={passingGrade}
                onChange={(e) => setPassingGrade(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#334155', fontWeight: 600, marginBottom: '0.2rem' }}>Prelim %</label>
                <input
                  type="number"
                  value={prelimWeight}
                  onChange={(e) => setPrelimWeight(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#334155', fontWeight: 600, marginBottom: '0.2rem' }}>Midterm %</label>
                <input
                  type="number"
                  value={midtermWeight}
                  onChange={(e) => setMidtermWeight(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#334155', fontWeight: 600, marginBottom: '0.2rem' }}>Final %</label>
                <input
                  type="number"
                  value={finalWeight}
                  onChange={(e) => setFinalWeight(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#334155', fontWeight: 600, marginBottom: '0.2rem' }}>Quiz %</label>
                <input
                  type="number"
                  value={quizWeight}
                  onChange={(e) => setQuizWeight(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#334155', fontWeight: 600, marginBottom: '0.2rem' }}>Assign %</label>
                <input
                  type="number"
                  value={assignmentWeight}
                  onChange={(e) => setAssignmentWeight(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#334155', fontWeight: 600, marginBottom: '0.2rem' }}>Activity %</label>
                <input
                  type="number"
                  value={activityWeight}
                  onChange={(e) => setActivityWeight(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#334155', fontWeight: 600, marginBottom: '0.2rem' }}>Exam %</label>
                <input
                  type="number"
                  value={examWeight}
                  onChange={(e) => setExamWeight(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Account Settings */}
        <section className="panel" style={{ padding: '1.6rem', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)' }}>
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontSize: '1.1rem' }}>
            <Shield size={18} color="#7c3aed" /> Account Settings
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '0.3rem' }}>Admin Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '0.3rem' }}>Email Address</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '0.3rem' }}>New Password</label>
                <input
                  type="password"
                  placeholder="Optional"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '0.3rem' }}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Optional"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. System Preferences */}
        <section className="panel" style={{ padding: '1.6rem', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)' }}>
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontSize: '1.1rem' }}>
            <Bell size={18} color="#d97706" /> System Preferences
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={automatedRiskAlerts}
                onChange={(e) => setAutomatedRiskAlerts(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <div>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.92rem' }}>
                  Automated At-Risk Notifications
                </strong>
                <small style={{ color: '#475569' }}>
                  Automatically notify instructors and students when grade projections drop below passing.
                </small>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
              <div>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.92rem' }}>
                  Auto-compute Grade Sheet Totals
                </strong>
                <small style={{ color: '#475569' }}>
                  Recalculate Prelim, Midterm, and Final weighted averages immediately upon score entry.
                </small>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
              <div>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.92rem' }}>
                  Enable Real-time Activity Logging
                </strong>
                <small style={{ color: '#475569' }}>
                  Save every grade modification and user update to the Activity Logs feed.
                </small>
              </div>
            </label>
          </div>
        </section>
      </div>
    </form>
  )
}

export default AdminSettings
