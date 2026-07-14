import React from 'react'
import { useData, blankUser } from '../../context/DataContext'
import type { Role, UserStatus } from '../../utils/types'

export const UserManagement: React.FC = () => {
  const {
    users,
    setUsers,
    userForm,
    setUserForm,
    editingUserId,
    setEditingUserId,
    handleSaveUser,
  } = useData()

  return (
    <section className="split-grid">
      <form className="panel" onSubmit={handleSaveUser}>
        <div className="card-heading">
          <h3>{editingUserId ? 'Edit User' : 'Add User'}</h3>
          {editingUserId && (
            <button
              type="button"
              onClick={() => {
                setEditingUserId(null)
                setUserForm(blankUser)
              }}
            >
              Cancel
            </button>
          )}
        </div>
        <input
          placeholder="Full name"
          value={userForm.name}
          onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
        />
        <input
          placeholder="Email"
          value={userForm.email}
          onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
        />
        <select
          value={userForm.role}
          onChange={(event) => setUserForm({ ...userForm, role: event.target.value as Role })}
        >
          <option>Administrator</option>
          <option>Instructor</option>
          <option>Student</option>
        </select>
        <select
          value={userForm.status}
          onChange={(event) => setUserForm({ ...userForm, status: event.target.value as UserStatus })}
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <button type="submit">Save User</button>
      </form>

      <div className="panel data-card">
        <div className="card-heading">
          <h3>User Management</h3>
          <span className="chip">Add, edit, delete, assign roles, activate users</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.name}
                  <small>{user.email}</small>
                </td>
                <td>{user.role}</td>
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
                      onClick={() => setUsers((current) => current.filter((item) => item.id !== user.id))}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
export default UserManagement
