import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useData, blankUser } from '../../context/DataContext'
import type { Role, UserStatus } from '../../utils/types'

export const UserManagement: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const {
    users,
    setUsers,
    userForm,
    setUserForm,
    editingUserId,
    setEditingUserId,
    handleSaveUser,
  } = useData()

  function handleCancelEdit() {
    setEditingUserId(null)
    setUserForm(blankUser)
  }

  const staffUsers = users.filter((u) => u.role !== 'student')

  const filteredUsers = staffUsers.filter((u) =>
    [u.name, u.email, u.role, u.status]
      .join(' ')
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  )

  return (
    <section className="split-grid">
      <form className="panel" onSubmit={handleSaveUser}>
        <h3>{editingUserId ? 'Edit Instructor Account' : 'Add New Instructor'}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Full Name *</label>
            <input
              placeholder="e.g. Marco Reyes"
              value={userForm.name}
              onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Email Address *</label>
            <input
              type="email"
              placeholder="e.g. instructor@sandigan.edu.ph"
              value={userForm.email}
              onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Account Password *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Set account password for login"
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
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>System Role *</label>
              <select
                value={userForm.role}
                onChange={(event) => setUserForm({ ...userForm, role: event.target.value as Role })}
              >
                <option value="instructor">Instructor</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Account Status *</label>
              <select
                value={userForm.status}
                onChange={(event) => setUserForm({ ...userForm, status: event.target.value as UserStatus })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              {editingUserId ? 'Save Account Changes' : '+ Save Instructor Account'}
            </button>
            {editingUserId && (
              <button type="button" onClick={handleCancelEdit} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="panel data-card">
        <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Instructor & Staff Directory</h3>
            <span className="chip">{staffUsers.length} Total Accounts</span>
          </div>
          <input
            placeholder="🔍 Search name, email, role..."
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            style={{ maxWidth: '240px' }}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Name & Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: '1.5rem' }}>
                  No instructor accounts found matching "{userSearch}"
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </td>
                  <td>
                    <span
                      className="chip"
                      style={{
                        background:
                          user.role === 'administrator'
                            ? 'rgba(168,85,247,0.15)'
                            : 'rgba(59,130,246,0.15)',
                        color:
                          user.role === 'administrator'
                            ? '#c084fc'
                            : '#60a5fa',
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`pill ${user.status.toLowerCase()}`}>{user.status}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUserId(user.id)
                          setUserForm(user)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}
                        onClick={() => {
                          if (confirm(`Delete account for ${user.name} (${user.email})?`)) {
                            setUsers((current) => current.filter((item) => item.id !== user.id))
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
export default UserManagement

