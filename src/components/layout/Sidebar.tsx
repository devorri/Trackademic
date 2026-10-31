import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../context/DataContext';
import { roleNavItems } from '../../utils/constants';
import { LogOut } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeUser, handleLogout } = useAuth();
  const { activeSection, setActiveSection, notifications, students } = useData();

  if (!activeUser) return null;

  const currentStudent =
    activeUser.role === 'student'
      ? students.find(
          (s) =>
            s.profile_id === activeUser.id ||
            s.id === activeUser.id ||
            (activeUser.email && s.email?.toLowerCase() === activeUser.email.toLowerCase()),
        )
      : null;

  const unreadCount = notifications.filter((n) => {
    if (n.read || n.is_read) return false;
    if (n.role !== activeUser.role && n.role !== 'all') return false;
    if (!n.user_id) return true;
    if (n.user_id === activeUser.id || n.user_id === activeUser.profile_id) return true;
    if (
      currentStudent &&
      (n.user_id === currentStudent.id || n.user_id === currentStudent.profile_id)
    )
      return true;
    return false;
  }).length;

  const navItems = roleNavItems[activeUser.role] || [];

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
        {navItems.map((item) => {
          const isNotif = item.id === 'notifications';
          return (
            <button
              className={activeSection === item.id ? 'active-nav' : ''}
              type="button"
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <item.icon size={17} />
                <span>{item.label}</span>
              </div>

              {isNotif && unreadCount > 0 && (
                <span
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    lineHeight: 1
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-user">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <strong>{activeUser.name}</strong>
          <span>{activeUser.email}</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            marginTop: '0.8rem',
            width: '100%'
          }}
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
