import React, { useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Check,
  Filter,
  Calculator,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AdminNotifications: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    setActiveSection
  } = useData();

  const [filterType, setFilterType] = useState<'all' | 'grades' | 'unread'>('all');

  const adminNotifications = useMemo(() => {
    return notifications
      .filter((n) => n.role === 'administrator' || n.role === 'all' || n.category === 'grades')
      .filter((n) => {
        if (filterType === 'unread') return !n.is_read;
        if (filterType === 'grades') return n.category === 'grades';
        return true;
      });
  }, [notifications, filterType]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (n) => (n.role === 'administrator' || n.role === 'all' || n.category === 'grades') && !n.is_read
      ).length,
    [notifications]
  );

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <section className="content-section">
      <div className="section-header">
        <div>
          <h1>Admin Notifications</h1>
          <p className="section-subtitle">
            Real-time alerts when instructors input and submit class grades to the Administrator.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1'
            }}
          >
            <Filter size={16} style={{ color: '#475569' }} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'grades' | 'unread')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0f172a',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Notifications</option>
              <option value="grades">Grade Submissions Only</option>
              <option value="unread">Unread Only ({unreadCount})</option>
            </select>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="secondary-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <Check size={16} />
              Mark All Read
            </button>
          )}

          {adminNotifications.length > 0 && (
            <button
              type="button"
              onClick={clearAllNotifications}
              className="danger-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <Trash2 size={16} />
              Clear All
            </button>
          )}
        </div>
      </div>

      <article className="panel">
        <div className="panel-header">
          <div>
            <h2>Instructor Grade Submissions &amp; System Feed</h2>
            <p>
              Showing {adminNotifications.length} notification{adminNotifications.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          {adminNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
              <Bell size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '1.05rem' }}>
                No notifications yet
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                When an instructor encodes and submits grades in their Gradebook, you will be notified here immediately.
              </p>
            </div>
          ) : (
            adminNotifications.map((notification) => {
              const isGradeSubmission = notification.category === 'grades';
              return (
                <div
                  key={notification.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: notification.is_read ? '#f8fafc' : '#eff6ff',
                    border: notification.is_read
                      ? '1px solid #e2e8f0'
                      : '1.5px solid #93c5fd',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ marginTop: '2px' }}>
                      {isGradeSubmission ? (
                        <FileSpreadsheet size={20} style={{ color: '#2563eb' }} />
                      ) : (
                        <CheckCircle2 size={20} style={{ color: '#16a34a' }} />
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: '0.96rem',
                            color: '#0f172a',
                            fontWeight: notification.is_read ? 600 : 700
                          }}
                        >
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <span
                            style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px'
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          margin: '6px 0 10px 0',
                          fontSize: '0.88rem',
                          color: '#334155',
                          lineHeight: 1.5
                        }}
                      >
                        {notification.message}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          {formatTime(notification.created_at || notification.timestamp || '')}
                        </span>
                        {isGradeSubmission && (
                          <button
                            type="button"
                            onClick={() => {
                              markNotificationAsRead(notification.id);
                              setActiveSection('grades');
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Calculator size={13} />
                            View Submitted Grades
                            <ExternalLink size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {!notification.is_read && (
                      <button
                        type="button"
                        onClick={() => markNotificationAsRead(notification.id)}
                        title="Mark as read"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#2563eb',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Check size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete notification"
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#dc2626',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </article>
    </section>
  );
};

export default AdminNotifications;
