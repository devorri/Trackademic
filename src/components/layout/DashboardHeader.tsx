import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../context/DataContext'
import { roleNavItems } from '../../utils/constants'

export const DashboardHeader: React.FC = () => {
  const { activeUser } = useAuth()
  const { activeSection } = useData()

  if (!activeUser) return null

  const currentLabel = roleNavItems[activeUser.role].find((item) => item.id === activeSection)?.label

  return (
    <header className="dashboard-header">
      <div>
        <p className="eyebrow">{activeUser.role} Dashboard</p>
        <h2>{currentLabel}</h2>
      </div>
    </header>
  )
}
