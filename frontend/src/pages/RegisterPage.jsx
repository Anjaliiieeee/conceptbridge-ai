import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Lock, Mail, User, ArrowRight, AlertCircle, Loader2, Code2, Gauge } from 'lucide-react';

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('Python');
  const [preferredDifficulty, setPreferredDifficulty] = useState('Beginner');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        preferred_language: preferredLanguage,
        preferred_difficulty: preferredDifficulty,
      });
      onNavigate('dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. An account with this email may already exist.';
      setError(msg);
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
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '28px' }}
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
        maxWidth: '480px',
        padding: '36px',
        border: '1px solid var(--border-medium)',
      }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            Create Student Account
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Start diagnosing conceptual gaps and building production skills.
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
              <span>Full Name</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Jane Developer"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Email Address</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Password (6+ chars)</span>
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

          {/* Preferences */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>Target Language</span>
              </label>
              <select
                className="form-select"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
              >
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Java">Java</option>
                <option value="SQL">SQL</option>
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>Starting Level</span>
              </label>
              <select
                className="form-select"
                value={preferredDifficulty}
                onChange={(e) => setPreferredDifficulty(e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginBottom: '20px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                Create Account & Get Started <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <span
            onClick={() => onNavigate('login')}
            style={{ color: 'var(--primary-light)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sign in here
          </span>
        </div>
      </div>
    </div>
  );
};
