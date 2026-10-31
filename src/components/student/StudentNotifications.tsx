import React, { useMemo } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../hooks/useAuth'
import {
  Bell,
  CheckCircle2,
  TrendingUp,
  FileText,
  Check,
  AlertTriangle,
  Clock,
} from 'lucide-react'

export const StudentNotifications: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsAsRead, students } = useData()
  const { activeUser } = useAuth()

  const currentStudent = useMemo(() => {
    if (!activeUser) return null
    return (
      students.find(
        (s) =>
          s.profile_id === activeUser.id ||
          s.id === activeUser.id ||
          (activeUser.email && s.email?.toLowerCase() === activeUser.email.toLowerCase()),
      ) || null
    )
  }, [students, activeUser])

  const studentNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (n.role !== 'student' && n.role !== 'all') return false
      if (!n.user_id) return true
      if (activeUser && (n.user_id === activeUser.id || n.user_id === activeUser.profile_id)) return true
      if (currentStudent && (n.user_id === currentStudent.id || n.user_id === currentStudent.profile_id)) return true
      return false
    })
  }, [notifications, activeUser, currentStudent])

  const unreadCount = useMemo(
    () => studentNotifications.filter((n) => !n.read && !n.is_read).length,
    [studentNotifications],
  )

  function getIcon(category?: string) {
    switch (category) {
      case 'grades':
        return <CheckCircle2 size={18} color="#059669" />
      case 'risk':
        return <AlertTriangle size={18} color="#dc2626" />
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
              Notifications &amp; Alerts
            </span>
            <h3 style={{ margin: '0.5rem 0 0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>
              <Bell size={22} color="#2563eb" /> Student Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: '#ef4444',
                    color: '#ffffff',
                  }}
                >
                  {unreadCount} New
                </span>
              )}
            </h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
              Grade releases, prediction updates, and official academic notices
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Check size={14} color="#16a34a" /> Mark All as Read
            </button>
          )}
        </div>

        {studentNotifications.length === 0 ? (
          <div
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              color: '#64748b',
              background: '#f8fafc',
              borderRadius: '14px',
              border: '1.5px dashed #cbd5e1',
              marginTop: '1.6rem',
            }}
          >
            <Bell size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#1e293b' }}>
              No Notifications Yet
            </p>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.88rem', color: '#64748b' }}>
              You will receive real-time notifications here when your instructors update your scores, release grades, or submit official records.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '1.6rem' }}>
            {studentNotifications.map((notif) => {
              const isUnread = !notif.read && !notif.is_read
              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.2rem',
                    borderRadius: '12px',
                    background: isUnread ? '#eff6ff' : '#ffffff',
                    border: isUnread ? '1.5px solid #93c5fd' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isUnread ? '0 4px 12px rgba(37, 99, 235, 0.08)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: isUnread ? '#dbeafe' : '#f8fafc',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getIcon(notif.category)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <strong style={{ fontSize: '1rem', color: isUnread ? '#0f172a' : '#334155', fontWeight: isUnread ? 800 : 600 }}>
                        {notif.title}
                      </strong>
                      <small style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {notif.timestamp}
                      </small>
                    </div>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', color: isUnread ? '#1e293b' : '#64748b', lineHeight: 1.5 }}>
                      {notif.message}
                    </p>
                  </div>

                  {isUnread && (
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#2563eb',
                        marginTop: '0.5rem',
                        flexShrink: 0,
                      }}
                      title="Unread notification"
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default StudentNotifications
