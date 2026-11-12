import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Terminal, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      onNavigate('dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      // First try logging into default demo account
      try {
        await login('demo@conceptbridge.ai', 'Demo1234!');
        onNavigate('dashboard');
      } catch {
        // If not created yet, register it dynamically
        await authAPI.register({
          full_name: 'Demo Student',
          email: 'demo@conceptbridge.ai',
          password: 'Demo1234!',
          preferred_language: 'Python',
          preferred_difficulty: 'Beginner',
        });
        await login('demo@conceptbridge.ai', 'Demo1234!');
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo initialization failed. Please use standard registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Brand Header */}
      <div
        onClick={() => onNavigate('landing')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '32px' }}
      >
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
        }}>
          <Terminal size={22} color="#ffffff" />
        </div>
        <div>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#ffffff' }}>ConceptBridge</span>
          <span style={{ color: 'var(--accent-blue)', fontWeight: 800, fontSize: '1.4rem' }}> AI</span>
        </div>
      </div>

      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px',
        border: '1px solid var(--border-medium)',
      }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Sign in to continue bridging your conceptual gaps.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '20px',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span>Email Address</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">
              <span>Password</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginBottom: '14px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginBottom: '20px' }}
          >
            Instant Demo Account (1-Click)
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <span
            onClick={() => onNavigate('register')}
            style={{ color: 'var(--primary-light)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Register here
          </span>
        </div>
      </div>
    </div>
  );
};
