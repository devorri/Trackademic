import React from 'react'
import { useData } from '../../context/DataContext'
import { Bell, CheckCircle2, TrendingUp, FileText } from 'lucide-react'

export const StudentNotifications: React.FC = () => {
  const { notifications, markNotificationRead } = useData()

  const studentNotifications = notifications.filter(
    (n) => n.role === 'student' || n.role === 'all',
  )

  function getIcon(category?: string) {
    switch (category) {
      case 'grades':
        return <CheckCircle2 size={18} color="#059669" />
      case 'system':
        return <TrendingUp size={18} color="#2563eb" />
      case 'report':
        return <FileText size={18} color="#7c3aed" />
      default:
        return <Bell size={18} color="#d97706" />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      <section
        style={{
          padding: '2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                borderRadius: '999px',
              }}
            >
              Notifications & Alerts
            </span>
            <h3 style={{ margin: '0.5rem 0 0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>
              <Bell size={22} color="#2563eb" /> Student Notifications
            </h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
              Grade releases, prediction updates, and official academic notices
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '1.6rem' }}>
          {studentNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1.2rem',
                borderRadius: '12px',
                background: notif.read ? '#ffffff' : '#eff6ff',
                border: notif.read ? '1px solid #e2e8f0' : '1.5px solid #bfdbfe',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: notif.read ? 'none' : '0 2px 8px rgba(37, 99, 235, 0.06)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: notif.read ? '#f8fafc' : '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getIcon(notif.category)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '1rem', color: notif.read ? '#1e293b' : '#0f172a', fontWeight: notif.read ? 600 : 800 }}>
                    {notif.title}
                  </strong>
                  <small style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>{notif.timestamp}</small>
                </div>
                <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.88rem', color: notif.read ? '#64748b' : '#334155', lineHeight: 1.45 }}>
                  {notif.message}
                </p>
              </div>

              {!notif.read && (
                <span
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    marginTop: '0.5rem',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default StudentNotifications
