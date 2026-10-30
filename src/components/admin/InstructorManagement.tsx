import React, { useState } from 'react';
import { Eye, EyeOff, Search, Plus, BookOpen, User } from 'lucide-react';
import { useData, blankUser } from '../../context/DataContext';
import { dbProfiles } from '../../utils/db';
import { formatCourseSection } from '../../utils/helpers';
import type { Role, UserStatus } from '../../utils/types';

export const InstructorManagement: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [instructorSearch, setInstructorSearch] = useState('');
  const [viewingInstructorId, setViewingInstructorId] = useState<string | null>(null);

  const {
    users,
    setUsers,
    classes,
    userForm,
    setUserForm,
    editingUserId,
    setEditingUserId,
    handleSaveUser
  } = useData();

  function handleCancelEdit() {
    setEditingUserId(null);
    setUserForm(blankUser);
  }

  const instructorUsers = users.filter((u) => u.role === 'instructor');

  const filteredInstructors = instructorUsers.filter((u) =>
    [u.name, u.email, u.status]
      .join(' ')
      .toLowerCase()
      .includes(instructorSearch.toLowerCase())
  );

  const getInstructorAssignedClasses = (inst: { id: string; email?: string }) =>
    classes.filter(
      (c) =>
        c.instructor_id === inst.id ||
        c.instructor?.id === inst.id ||
        c.instructor?.profile_id === inst.id ||
        (inst.email &&
          c.instructor?.email &&
          c.instructor.email.toLowerCase() === inst.email.toLowerCase())
    );

  const viewingInstructor = users.find((u) => u.id === viewingInstructorId);
  const instructorAssignedClasses = viewingInstructor
    ? getInstructorAssignedClasses(viewingInstructor)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      <section className="split-grid">
        {/* Add/Edit Instructor Form */}
        <form className="panel" onSubmit={handleSaveUser}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(59,130,246,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}
            >
              {editingUserId ? <User size={18} /> : <Plus size={18} />}
            </div>
            <h3 style={{ margin: 0, color: '#0f172a' }}>
              {editingUserId ? 'Edit Instructor Details' : 'Add New Instructor'}
            </h3>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9rem',
              marginTop: '0.8rem'
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  color: '#334155',
                  fontWeight: 600,
                  marginBottom: '0.3rem'
                }}
              >
                Full Name *
              </label>
              <input
                placeholder="e.g. Kissy Labad"
                value={userForm.name}
                onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  color: '#334155',
                  fontWeight: 600,
                  marginBottom: '0.3rem'
                }}
              >
                Email Address *
              </label>
              <input
                type="email"
                placeholder="e.g. instructor@trackademic.edu"
                value={userForm.email}
                onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  color: '#334155',
                  fontWeight: 600,
                  marginBottom: '0.3rem'
                }}
              >
                Account Password {editingUserId ? '(Leave blank to keep)' : '*'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Set account password"
                  value={userForm.password || ''}
                  onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
                  required={!editingUserId}
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
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    color: '#334155',
                    fontWeight: 600,
                    marginBottom: '0.3rem'
                  }}
                >
                  Role *
                </label>
                <select
                  value={userForm.role}
                  onChange={(event) =>
                    setUserForm({ ...userForm, role: event.target.value as Role })
                  }
                >
                  <option value="instructor">Instructor</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    color: '#334155',
                    fontWeight: 600,
                    marginBottom: '0.3rem'
                  }}
                >
                  Status *
                </label>
                <select
                  value={userForm.status}
                  onChange={(event) =>
                    setUserForm({ ...userForm, status: event.target.value as UserStatus })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {editingUserId ? 'Save Instructor Changes' : '+ Add Instructor'}
              </button>
              {editingUserId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Instructors Directory Table */}
        <div className="panel data-card">
          <div
            className="card-heading"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: '#0f172a' }}>Instructor Directory</h3>
              <span className="chip" style={{ marginTop: '0.3rem' }}>
                {instructorUsers.length} Registered Instructors
              </span>
            </div>
            <div style={{ position: 'relative', width: '240px' }}>
              <input
                placeholder="Search instructor name or email..."
                value={instructorSearch}
                onChange={(event) => setInstructorSearch(event.target.value)}
                style={{ width: '100%', paddingLeft: '2rem' }}
              />
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '0.7rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Instructor Name &amp; Email</th>
                  <th>Assigned Classes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstructors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: 'center', color: '#64748b', padding: '1.8rem' }}
                    >
                      No instructors found matching "{instructorSearch}"
                    </td>
                  </tr>
                ) : (
                  filteredInstructors.map((inst) => {
                    const assigned = getInstructorAssignedClasses(inst);

                    return (
                      <tr key={inst.id}>
                        <td>
                          <strong style={{ color: '#0f172a', display: 'block' }}>
                            {inst.name}
                          </strong>
                          <small style={{ color: '#64748b' }}>{inst.email}</small>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setViewingInstructorId(inst.id)}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              padding: '0.3rem 0.7rem',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <BookOpen size={14} />
                            {assigned.length} class{assigned.length === 1 ? '' : 'es'}
                          </button>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: inst.status === 'active' ? '#dcfce7' : '#fee2e2',
                              color: inst.status === 'active' ? '#15803d' : '#b91c1c'
                            }}
                          >
                            {inst.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              onClick={() => setViewingInstructorId(inst.id)}
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                            >
                              View Info
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUserId(inst.id);
                                setUserForm(inst);
                              }}
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              style={{
                                backgroundColor: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                padding: '0.3rem 0.6rem',
                                fontSize: '0.8rem'
                              }}
                              onClick={async () => {
                                if (confirm(`Delete instructor account for ${inst.name}?`)) {
                                  if (
                                    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                                      inst.id
                                    )
                                  ) {
                                    await dbProfiles.delete(inst.id).catch(() => null);
                                  }
                                  setUsers((current) =>
                                    current.filter((item) => item.id !== inst.id)
                                  );
                                }
                              }}
                            >
                              Delete
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
      </section>

      {/* View Instructor Modal */}
      {viewingInstructor && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
          onClick={() => setViewingInstructorId(null)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.2rem'
              }}
            >
              <div>
                <span
                  className="chip"
                  style={{
                    color: '#1d4ed8',
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    fontWeight: 700
                  }}
                >
                  Instructor Information
                </span>
                <h3
                  style={{
                    margin: '0.5rem 0 0.1rem 0',
                    fontSize: '1.5rem',
                    color: '#0f172a',
                    fontWeight: 800
                  }}
                >
                  {viewingInstructor.name}
                </h3>
                <small style={{ color: '#475569', fontSize: '0.88rem' }}>
                  {viewingInstructor.email}
                </small>
              </div>
              <button
                type="button"
                onClick={() => setViewingInstructorId(null)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Close
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '1rem',
                  borderRadius: '12px'
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Status
                </span>
                <div
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#16a34a',
                    textTransform: 'capitalize',
                    marginTop: '0.2rem'
                  }}
                >
                  {viewingInstructor.status}
                </div>
              </div>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '1rem',
                  borderRadius: '12px'
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Assigned Classes
                </span>
                <div
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#2563eb',
                    marginTop: '0.2rem'
                  }}
                >
                  {instructorAssignedClasses.length} Active Class(es)
                </div>
              </div>
            </div>

            <div>
              <h4
                style={{
                  margin: '0 0 0.8rem 0',
                  color: '#0f172a',
                  fontSize: '1.05rem',
                  fontWeight: 700
                }}
              >
                Assigned Classes &amp; Schedules:
              </h4>
              {instructorAssignedClasses.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  This instructor is currently not assigned to any active classes.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {instructorAssignedClasses.map((cls) => (
                    <div
                      key={cls.id}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.9rem 1.1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            color: '#0f172a',
                            display: 'block',
                            fontSize: '0.98rem'
                          }}
                        >
                          {cls.subject?.code ? `${cls.subject.code} — ` : ''}
                          {cls.subject?.title || 'Subject'}
                        </strong>
                        <small style={{ color: '#475569', fontSize: '0.85rem' }}>
                          Section: {formatCourseSection(cls.section?.name || '')} •{' '}
                          {cls.schedule || 'TBA'} • {cls.room || 'TBA'}
                        </small>
                      </div>
                      <span
                        className="chip"
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #dbeafe',
                          fontWeight: 600
                        }}
                      >
                        {(cls.studentIds || cls.student_ids || []).length} students
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorManagement;
