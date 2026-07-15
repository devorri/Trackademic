import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../context/DataContext'
import { roleNavItems } from '../../utils/constants'

export const Sidebar: React.FC = () => {
  const { activeUser, handleLogout } = useAuth()
  const { activeSection, setActiveSection } = useData()

  if (!activeUser) return null

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/trackademic-logo.png" alt="Trackademic logo" />
        <div className="brand-name-stack">
          <strong>
            <span className="brand-name-strong">Track</span>
            <span className="brand-name-blue">ademic</span>
          </strong>
          <span className="brand-role-pill">{activeUser.role}</span>
        </div>
      </div>
      <nav className="sidebar-nav" aria-label="Dashboard sections">
        {roleNavItems[activeUser.role].map((item) => (
          <button
            className={activeSection === item.id ? 'active-nav' : ''}
            type="button"
            key={item.id}
            onClick={() => setActiveSection(item.id)}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-user">
        <strong>{activeUser.name}</strong>
        <span>{activeUser.email}</span>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  )
}
