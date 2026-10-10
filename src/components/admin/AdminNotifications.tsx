import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { Bell, CheckCheck, UserCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react'

export const AdminNotifications: React.FC = () => {
  const { notifications, markNotificationRead, setNotifications } = useData()
  const [filter, setFilter] = useState<'all' | 'unread' | 'risk' | 'grades'>('all')

  const adminNotifications = notifications.filter(
    (n) => n.role === 'administrator' || n.role === 'all',
  )

  const filteredNotifications = adminNotifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'risk') return n.category === 'risk'
    if (filter === 'grades') return n.category === 'grades'
    return true
  })

  function handleMarkAllAsRead() {
    setNotifications((prev) =>
      prev.map((n) => (n.role === 'administrator' || n.role === 'all' ? { ...n, read: true } : n)),
    )
  }

  function getIcon(category?: string) {
    switch (category) {
      case 'user':
        return <UserCheck size={18} color="#60a5fa" />
      case 'risk':
        return <AlertTriangle size={18} color="#ef4444" />
      case 'grades':
        return <CheckCircle2 size={18} color="#34d399" />
      case 'report':
        return <FileText size={18} color="#a78bfa" />
      default:
        return <Bell size={18} color="#fbbf24" />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      <section className="panel data-card" style={{ padding: '1.8rem' }}>
        <div
          className="card-heading"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Bell size={22} color="#60a5fa" /> System Notifications
            </h3>
            <span className="chip" style={{ marginTop: '0.3rem' }}>
              Real-time updates across user registrations, grade submissions, and risk alerts
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleMarkAllAsRead}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <CheckCheck size={16} /> Mark All as Read
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            style={{
              cursor: 'pointer',
              background: filter === 'all' ? '#2563eb' : '#f1f5f9',
              color: filter === 'all' ? '#ffffff' : '#475569',
              border: filter === 'all' ? '1px solid #2563eb' : '1px solid #cbd5e1',
              fontWeight: 700,
            }}
          >
            All ({adminNotifications.length})
          </button>
          <button
            type="button"
            className={`chip ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
            style={{
              cursor: 'pointer',
              background: filter === 'unread' ? '#4f46e5' : '#f1f5f9',
              color: filter === 'unread' ? '#ffffff' : '#475569',
              border: filter === 'unread' ? '1px solid #4f46e5' : '1px solid #cbd5e1',
              fontWeight: 700,
            }}
          >
            Unread ({adminNotifications.filter((n) => !n.read).length})
          </button>
          <button
            type="button"
            className={`chip ${filter === 'risk' ? 'active' : ''}`}
            onClick={() => setFilter('risk')}
            style={{
              cursor: 'pointer',
              background: filter === 'risk' ? '#dc2626' : '#fef2f2',
              color: filter === 'risk' ? '#ffffff' : '#b91c1c',
              border: filter === 'risk' ? '1px solid #dc2626' : '1px solid #fecaca',
              fontWeight: 700,
            }}
          >
            ⚠️ At-Risk Alerts
          </button>
          <button
            type="button"
            className={`chip ${filter === 'grades' ? 'active' : ''}`}
            onClick={() => setFilter('grades')}
            style={{
              cursor: 'pointer',
              background: filter === 'grades' ? '#16a34a' : '#f0fdf4',
              color: filter === 'grades' ? '#ffffff' : '#15803d',
              border: filter === 'grades' ? '1px solid #16a34a' : '1px solid #bbf7d0',
              fontWeight: 700,
            }}
          >
            📝 Grade Updates
          </button>
        </div>

        {/* Notification Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.4rem' }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
              No notifications found in this category.
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  background: notif.read ? '#ffffff' : '#f0f7ff',
                  border: notif.read ? '1px solid #e2e8f0' : '1.5px solid #bfdbfe',
                  boxShadow: notif.read ? '0 1px 3px rgba(15, 23, 42, 0.02)' : '0 2px 8px rgba(37, 99, 235, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#ffffff',
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
                    <strong style={{ fontSize: '1rem', color: notif.read ? '#334155' : '#0f172a', fontWeight: notif.read ? 600 : 800 }}>
                      {notif.title}
                    </strong>
                    <small style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>{notif.timestamp}</small>
                  </div>
                  <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.45 }}>
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
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default AdminNotifications
