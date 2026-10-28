import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../context/DataContext'
import { formatCourseSection, normalizeCourseSection } from '../../utils/helpers'
import { User, Mail, BookOpen, Key, Edit, Check, Hash, Calendar, GraduationCap } from 'lucide-react'

export const StudentProfile: React.FC = () => {
  const { activeUser, setActiveUser } = useAuth()
  const { students, setStudents } = useData()

  // Find linked student record or default to first student
  const studentData = students.find((s) => s.email === activeUser?.email || s.name === activeUser?.name) || students[0]

  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPass, setIsChangingPass] = useState(false)

  const [name, setName] = useState(activeUser?.name || studentData?.name || 'Juan Dela Cruz')
  const [studentId, setStudentId] = useState(studentData?.student_no || studentData?.studentNo || '2026-001')
  const [program, setProgram] = useState('CIT')
  const [year, setYear] = useState('2nd Year')
  const [section, setSection] = useState(formatCourseSection(studentData?.course, studentData?.section_label))
  const [email, setEmail] = useState(activeUser?.email || studentData?.email || 'student@example.com')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (activeUser) {
      setActiveUser({
        ...activeUser,
        name,
        email,
      })
    }

    const normalized = normalizeCourseSection('CIT', section)

    if (studentData) {
      setStudents((current) =>
        current.map((s) =>
          s.id === studentData.id
            ? {
                ...s,
                name,
                student_no: studentId,
                studentNo: studentId,
                course: normalized.course,
                section_label: normalized.section_label,
                email,
              }
            : s,
        ),
      )
    }

    setProgram(normalized.course)
    setSection(formatCourseSection(normalized.course, normalized.section_label))
    setIsEditing(false)
    setNotice('Student profile information successfully saved!')
    setTimeout(() => setNotice(null), 3000)
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    setNewPassword('')
    setConfirmPassword('')
    setIsChangingPass(false)
    setNotice('Password successfully changed!')
    setTimeout(() => setNotice(null), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', maxWidth: '750px', margin: '0 auto' }}>
      {notice && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '1rem 1.4rem',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
          }}
        >
          <Check size={18} /> {notice}
        </div>
      )}

      {/* Main Profile Card */}
      <section
        style={{
          padding: '2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', marginBottom: '1.8rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #059669, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.8rem',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.25)',
            }}
          >
            {name.charAt(0)}
          </div>

          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#15803d',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
              }}
            >
              My Profile
            </span>
            <h3 style={{ margin: '0.4rem 0 0.2rem 0', fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>
              {name}
            </h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>Student ID: {studentId} • {email}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.8rem' }}>
          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <User size={15} color="#2563eb" /> Name
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>
              {name}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Hash size={15} color="#059669" /> Student ID
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>
              {studentId}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <GraduationCap size={15} color="#7c3aed" /> Course
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.3rem' }}>
              {program}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Calendar size={15} color="#d97706" /> Year
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#b45309', marginTop: '0.3rem' }}>
              {year}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <BookOpen size={15} color="#db2777" /> Course & Section
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#be185d', marginTop: '0.3rem' }}>
              {section}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Mail size={15} color="#0284c7" /> Email
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0369a1', marginTop: '0.3rem' }}>
              {email}
            </div>
          </div>
        </div>

        {/* Action Buttons: Edit Profile, Change Password */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setIsEditing(true)
              setIsChangingPass(false)
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.2rem', fontWeight: 700, borderRadius: '10px' }}
          >
            <Edit size={16} /> Edit Profile
          </button>

          <button
            type="button"
            onClick={() => {
              setIsChangingPass(true)
              setIsEditing(false)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.2rem',
              background: '#f8fafc',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            <Key size={16} color="#475569" /> Change Password
          </button>
        </div>
      </section>

      {/* Edit Profile Form */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          style={{
            padding: '2rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          }}
        >
          <h4 style={{ margin: '0 0 1.2rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>
            Edit Student Profile
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '10px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Student ID *
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '10px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Year *
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '10px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Course & Section *
                </label>
                <select
                  value={section === 'CIT B' ? 'CIT B' : 'CIT A'}
                  onChange={(e) => setSection(e.target.value as 'CIT A' | 'CIT B')}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '10px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  <option value="CIT A">CIT A</option>
                  <option value="CIT B">CIT B</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', fontWeight: 600, marginBottom: '0.35rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.4rem', fontWeight: 700, borderRadius: '10px' }}>
                Save Profile
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1.5px solid #cbd5e1',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Change Password Form */}
      {isChangingPass && (
        <form
          onSubmit={handleChangePassword}
          style={{
            padding: '2rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          }}
        >
          <h4 style={{ margin: '0 0 1.2rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>
            Change Account Password
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', fontWeight: 600, marginBottom: '0.35rem' }}>
                New Password *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', fontWeight: 600, marginBottom: '0.35rem' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.4rem', fontWeight: 700, borderRadius: '10px' }}>
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPass(false)}
                style={{
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1.5px solid #cbd5e1',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default StudentProfile
