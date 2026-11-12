import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Terminal, User, LogOut, ArrowRight, BookOpen } from 'lucide-react';

export const Navbar = ({ onNavigate, currentPage }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(7, 11, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '14px 0',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <div
          onClick={() => onNavigate('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
          }}>
            <Terminal size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                ConceptBridge
              </span>
              <span style={{
                background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.05em'
              }}>AI</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Knowing to Doing
            </div>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`btn ${currentPage === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('practice')}
                className={`btn ${currentPage === 'practice' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Practice
              </button>
              <button
                onClick={() => onNavigate('progress')}
                className={`btn ${currentPage === 'progress' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Progress
              </button>

              <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)' }} />

              <div
                onClick={() => onNavigate('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: currentPage === 'profile' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: currentPage === 'profile' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent'
                }}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-light)',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}>
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.full_name?.split(' ')[0] || 'Student'}
                </span>
              </div>

              <button
                onClick={logout}
                className="btn btn-secondary"
                title="Log Out"
                style={{ padding: '8px 12px' }}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('login')}
                className="btn btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Get Started <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
