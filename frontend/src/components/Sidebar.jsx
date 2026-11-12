import React from 'react';
import {
  LayoutDashboard,
  Code2,
  LineChart,
  UserCheck,
  Sparkles,
  Flame,
  LogOut,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'practice', label: 'Practice & Challenges', icon: Code2 },
    { id: 'progress', label: 'Learning Progress', icon: LineChart },
    { id: 'profile', label: 'Profile & Settings', icon: UserCheck },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      minHeight: 'calc(100vh - 70px)',
      position: 'sticky',
      top: '70px',
    }}>
      <div>
        {/* Navigation Section */}
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '14px', paddingLeft: '12px' }}>
          Navigation
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.92rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} color={isActive ? 'var(--primary-light)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={15} color="var(--primary-light)" />}
              </button>
            );
          })}
        </nav>

        {/* Quick Practice Banner */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(56, 189, 248, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
            <Sparkles size={14} /> AI DIAGNOSTIC
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>
            Bridge Conceptual Gaps
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
            Generate problems focused on recurring misconceptions.
          </p>
          <button
            onClick={() => onNavigate('practice')}
            className="btn btn-primary"
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem' }}
          >
            Start Practice
          </button>
        </div>
      </div>

      {/* User Status Bottom Bar */}
      <div style={{
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.full_name || 'Student'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Flame size={12} color="#f59e0b" /> {user?.preferred_language || 'Python'}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
