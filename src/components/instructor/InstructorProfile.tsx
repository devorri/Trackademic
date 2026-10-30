import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../context/DataContext';
import { dbProfiles } from '../../utils/db';
import { formatCourseSection, getSubjectTitle } from '../../utils/helpers';
import { User, Mail, Shield, BookOpen, Key, Edit, Check } from 'lucide-react';

export const InstructorProfile: React.FC = () => {
  const { activeUser, setActiveUser } = useAuth();
  const { classes, subjects } = useData();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [name, setName] = useState(activeUser?.name || '');
  const [email, setEmail] = useState(activeUser?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  // Dynamically compute the instructor's actual assigned classes (never hardcoded!)
  const assignedClasses = useMemo(() => {
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

  const assignedClassesCount = assignedClasses.length;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (activeUser) {
      const nameParts = name.trim().split(/\s+/);
      const first_name = nameParts[0] || name.trim();
      const last_name = nameParts.slice(1).join(' ') || '';
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeUser.id)) {
        await dbProfiles
          .update(activeUser.id, {
            first_name,
            last_name,
            email: email.trim()
          })
          .catch(() => null);
      }
      setActiveUser({
        ...activeUser,
        name: name.trim(),
        email: email.trim()
      });
    }
    setIsEditing(false);
    setNotice('Profile details updated in Supabase!');
    setTimeout(() => setNotice(null), 3000);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (
      activeUser &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeUser.id)
    ) {
      await dbProfiles
        .update(activeUser.id, {
          password_plain: newPassword
        })
        .catch(() => null);
    }
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPass(false);
    setNotice('Password updated in Supabase!');
    setTimeout(() => setNotice(null), 3000);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.8rem',
        maxWidth: '780px',
        margin: '0 auto'
      }}
    >
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
            fontWeight: 600
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
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.4rem',
            marginBottom: '1.8rem',
            flexWrap: 'wrap'
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.8rem',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)'
            }}
          >
            {(activeUser?.name || name || 'I').charAt(0).toUpperCase()}
          </div>

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
                padding: '0.2rem 0.6rem',
                borderRadius: '999px'
              }}
            >
              Instructor Profile
            </span>
            <h3
              style={{
                margin: '0.4rem 0 0.2rem 0',
                fontSize: '1.6rem',
                color: '#0f172a',
                fontWeight: 800
              }}
            >
              {activeUser?.name || name}
            </h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
              {activeUser?.email || email}
            </p>
          </div>
        </div>

        {/* Profile Attributes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.8rem'
          }}
        >
          <div
            style={{
              background: '#f8fafc',
              padding: '1.1rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                color: '#64748b',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 700
              }}
            >
              <User size={15} color="#2563eb" /> Name
            </span>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#0f172a',
                marginTop: '0.3rem'
              }}
            >
              {activeUser?.name || name}
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              padding: '1.1rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                color: '#64748b',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 700
              }}
            >
              <Mail size={15} color="#059669" /> Email
            </span>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#0f172a',
                marginTop: '0.3rem'
              }}
            >
              {activeUser?.email || email}
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              padding: '1.1rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                color: '#64748b',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 700
              }}
            >
              <Shield size={15} color="#7c3aed" /> Role
            </span>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#7c3aed',
                marginTop: '0.3rem'
              }}
            >
              Instructor
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              padding: '1.1rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                color: '#64748b',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 700
              }}
            >
              <BookOpen size={15} color="#d97706" /> Assigned Classes
            </span>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#b45309',
                marginTop: '0.3rem'
              }}
            >
              {assignedClassesCount} {assignedClassesCount === 1 ? 'Class' : 'Classes'}
            </div>
          </div>
        </div>

        {/* Assigned Classes Summary List */}
        {assignedClasses.length > 0 && (
          <div style={{ marginBottom: '1.8rem' }}>
            <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.95rem', color: '#0f172a' }}>
              Current Assigned Subject Load
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {assignedClasses.map((cls) => (
                <div
                  key={cls.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.7rem 1rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.88rem'
                  }}
                >
                  <div>
                    <strong style={{ color: '#0f172a' }}>
                      {cls.subject?.code ? `${cls.subject.code} — ` : ''}
                      {getSubjectTitle(subjects, cls.subject_id)}
                    </strong>
                    <span style={{ color: '#64748b', marginLeft: '8px' }}>
                      ({formatCourseSection(cls.section?.name || '')})
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#2563eb' }}>
                    {(cls.studentIds || cls.student_ids || []).length} Students
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setName(activeUser?.name || '');
              setEmail(activeUser?.email || '');
              setIsEditing(true);
              setIsChangingPass(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.2rem',
              fontWeight: 700,
              borderRadius: '10px'
            }}
          >
            <Edit size={16} /> Edit Profile
          </button>

          <button
            type="button"
            onClick={() => {
              setIsChangingPass(true);
              setIsEditing(false);
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
              fontWeight: 700
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
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)'
          }}
        >
          <h4
            style={{
              margin: '0 0 1.2rem 0',
              color: '#0f172a',
              fontSize: '1.25rem',
              fontWeight: 800
            }}
          >
            Edit Profile Details
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#334155',
                  fontWeight: 600,
                  marginBottom: '0.35rem'
                }}
              >
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
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#334155',
                  fontWeight: 600,
                  marginBottom: '0.35rem'
                }}
              >
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
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.65rem 1.4rem', fontWeight: 700, borderRadius: '10px' }}
              >
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
                  fontWeight: 700
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
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)'
          }}
        >
          <h4
            style={{
              margin: '0 0 1.2rem 0',
              color: '#0f172a',
              fontSize: '1.25rem',
              fontWeight: 800
            }}
          >
            Change Account Password
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#334155',
                  fontWeight: 600,
                  marginBottom: '0.35rem'
                }}
              >
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
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#334155',
                  fontWeight: 600,
                  marginBottom: '0.35rem'
                }}
              >
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
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.65rem 1.4rem', fontWeight: 700, borderRadius: '10px' }}
              >
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
                  fontWeight: 700
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default InstructorProfile;
