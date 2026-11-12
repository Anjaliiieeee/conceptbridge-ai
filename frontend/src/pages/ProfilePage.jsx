import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import {
  User,
  Mail,
  Lock,
  Code2,
  Gauge,
  Award,
  CheckCircle2,
  Flame,
  LogOut,
  Save,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';

export const ProfilePage = ({ onNavigate }) => {
  const { user, logout, updateUserState } = useAuth();
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('Python');
  const [preferredDifficulty, setPreferredDifficulty] = useState('Beginner');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileAPI.getProfile();
        setProfile(res.data);
        setFullName(res.data.full_name);
        setPreferredLanguage(res.data.preferred_language || 'Python');
        setPreferredDifficulty(res.data.preferred_difficulty || 'Beginner');
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    const payload = {
      full_name: fullName,
      preferred_language: preferredLanguage,
      preferred_difficulty: preferredDifficulty,
    };

    if (newPassword) {
      if (!currentPassword) {
        setMessage({ type: 'error', text: 'Current password is required to update your password.' });
        setIsSaving(false);
        return;
      }
      payload.current_password = currentPassword;
      payload.new_password = newPassword;
    }

    try {
      const res = await profileAPI.updateProfile(payload);
      updateUserState(res.data);
      setMessage({ type: 'success', text: 'Profile preferences updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile settings.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <Loader2 size={36} className="animate-spin" color="var(--primary-light)" />
        <div style={{ color: 'var(--text-secondary)' }}>Loading student profile...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
          Student Profile & Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Manage your learning track preferences, credentials, and track records.
        </p>
      </div>

      {message.text && (
        <div style={{
          background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: '10px',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: message.type === 'success' ? '#34d399' : '#fca5a5',
          fontSize: '0.9rem',
          marginBottom: '24px',
        }}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="glass-card" style={{
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.6rem',
            fontWeight: 800,
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
          }}>
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'S'}
          </div>

          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
              {profile?.full_name}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {profile?.email}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '2026'}
            </div>
          </div>
        </div>

        {/* Quick Stats Pill Group */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ padding: '10px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>
              {profile?.total_submissions || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Submissions</div>
          </div>

          <div style={{ padding: '10px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6366f1' }}>
              {profile?.average_score || 0}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Avg Score</div>
          </div>

          <div style={{ padding: '10px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b' }}>
              {profile?.current_streak || 0}d
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Streak</div>
          </div>
        </div>
      </div>

      {/* Profile Settings Form */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '20px' }}>
          Learning Preferences & Account Details
        </h3>

        <form onSubmit={handleUpdateProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>Full Name</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>Registered Email</span>
              </label>
              <input
                type="email"
                className="form-input"
                value={profile?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>Preferred Language Track</span>
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
                <span>Target Difficulty Baseline</span>
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

          {/* Change Password Sub-section */}
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '28px',
          }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="var(--primary-light)" /> Change Password (Optional)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  <span>Current Password</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Leave empty to keep unchanged"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  <span>New Password</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="New password (6+ chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.92rem' }}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Preferences
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Logout Action */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Sign Out</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Safely end your active session on this device.
          </div>
        </div>
        <button
          onClick={logout}
          className="btn btn-danger"
          style={{ padding: '10px 20px', fontSize: '0.88rem' }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
};
