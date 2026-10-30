import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../hooks/useAuth';
import {
  Bell,
  AlertTriangle,
  Clock,
  FileText,
  BookOpen,
  UserPlus,
  UserX,
  Check
} from 'lucide-react';

export const InstructorNotifications: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsAsRead,
    setActiveSection
  } = useData();
  const { activeUser } = useAuth();

  const instructorNotifications = useMemo(() => {
    return notifications.filter(
      (n) =>
        (n.role === 'instructor' || n.role === 'all') &&
        (!n.user_id || n.user_id === activeUser?.id)
    );
  }, [notifications, activeUser]);

  const unreadCount = useMemo(
    () => instructorNotifications.filter((n) => !n.read && !n.is_read).length,
    [instructorNotifications]
  );

  function getIcon(category?: string) {
    switch (category) {
      case 'class':
        return <BookOpen size={18} color="#2563eb" />;
      case 'enrollment':
        return <UserPlus size={18} color="#16a34a" />;
      case 'dropout':
        return <UserX size={18} color="#dc2626" />;
      case 'risk':
        return <AlertTriangle size={18} color="#dc2626" />;
      case 'grades':
        return <Clock size={18} color="#d97706" />;
      case 'report':
        return <FileText size={18} color="#2563eb" />;
      default:
        return <Bell size={18} color="#059669" />;
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
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
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
              Instructor Alerts &amp; Activity
            </span>
            <h3
              style={{
                margin: '0.5rem 0 0.25rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '1.5rem',
                color: '#0f172a',
                fontWeight: 800
              }}
            >
              <Bell size={22} color="#2563eb" /> Instructor Notifications
            </h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
              Real-time notifications for assigned subject classes, enrolled students, student drop-outs, and grade submissions.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              <Check size={15} />
              Mark All Read ({unreadCount})
            </button>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
            marginTop: '1.6rem'
          }}
        >
          {instructorNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <Bell size={38} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                No notifications yet. You will be alerted when a subject class is assigned to you, when students are enrolled, or when a student drops out.
              </p>
            </div>
          ) : (
            instructorNotifications.map((notif) => {
              const isRead = Boolean(notif.read || notif.is_read);
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
                    background: isRead ? '#ffffff' : '#eff6ff',
                    border: isRead ? '1px solid #e2e8f0' : '1.5px solid #93c5fd',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isRead ? 'none' : '0 2px 8px rgba(37, 99, 235, 0.06)'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: isRead ? '#f8fafc' : '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {getIcon(notif.category)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <strong
                        style={{
                          fontSize: '1rem',
                          color: '#0f172a',
                          fontWeight: isRead ? 600 : 800
                        }}
                      >
                        {notif.title}
                      </strong>
                      <small style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
                        {notif.timestamp}
                      </small>
                    </div>
                    <p
                      style={{
                        margin: '0.35rem 0 0.6rem 0',
                        fontSize: '0.88rem',
                        color: '#334155',
                        lineHeight: 1.45
                      }}
                    >
                      {notif.message}
                    </p>
                    {(notif.category === 'class' ||
                      notif.category === 'enrollment' ||
                      notif.category === 'dropout') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationRead(notif.id);
                          setActiveSection('classes');
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        View Assigned Classes
                      </button>
                    )}
                  </div>

                  {!isRead && (
                    <span
                      style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        background: '#2563eb',
                        marginTop: '0.5rem',
                        flexShrink: 0
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default InstructorNotifications;
