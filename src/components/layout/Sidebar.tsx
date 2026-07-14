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
        <img src="/trackademic-logo.jpg" alt="Trackademic Web-Based Class Record System" />
        <strong>Trackademic</strong>
        <span>{activeUser.role}</span>
      </div>
      <nav className="sidebar-nav" aria-label="Dashboard sections">
        {roleNavItems[activeUser.role].map((item) => (
          <button
            className={activeSection === item.id ? 'active-nav' : ''}
            type="button"
            key={item.id}
            onClick={() => setActiveSection(item.id)}
          >
            {item.label}
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
