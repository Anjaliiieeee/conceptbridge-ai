import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { progressAPI, challengesAPI } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { ProgressChart } from '../components/ProgressChart';
import {
  CheckCircle2,
  Flame,
  Award,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Code2,
  Clock,
  Compass,
  Loader2,
  RefreshCw
} from 'lucide-react';

export const DashboardPage = ({ onNavigate, onSelectChallenge, onStartTargetedPractice }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [curatedChallenges, setCuratedChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [progRes, chalRes] = await Promise.all([
        progressAPI.getSummary(),
        challengesAPI.getChallenges({ limit: 4 }),
      ]);
      setSummary(progRes.data);
      setCuratedChallenges(chalRes.data);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError('Failed to load current metrics. Please verify backend status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <Loader2 size={36} className="animate-spin" color="var(--primary-light)" />
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Loading learning analytics...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '32px',
        padding: '24px 28px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(14, 22, 40, 0.8) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
            <Sparkles size={14} /> ACTIVE STUDENT PROFILE • {user?.preferred_language || 'Python'} TRACK
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
            Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            {summary?.weak_concepts?.length > 0
              ? `You have ${summary.weak_concepts.length} conceptual areas flagged for targeted remediation.`
              : 'You are on track! Keep solving practical scenarios to maintain your streak.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => onNavigate('practice')}
            className="btn btn-primary"
            style={{ padding: '12px 22px', fontSize: '0.92rem' }}
          >
            Practice New Challenge <ArrowRight size={16} />
          </button>
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary"
            title="Refresh Data"
            style={{ padding: '12px' }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          padding: '14px',
          color: '#fca5a5',
          marginBottom: '24px',
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      {/* 4 Core Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <MetricCard
          title="Challenges Solved"
          value={summary?.total_challenges_completed || 0}
          subtitle={`${summary?.total_attempts || 0} total submissions logged`}
          icon={CheckCircle2}
          color="#10b981"
          accentBg="rgba(16, 185, 129, 0.15)"
        />

        <MetricCard
          title="Average Mastery"
          value={`${summary?.average_score || 0}%`}
          subtitle="Across all evaluated code solutions"
          icon={TrendingUp}
          color="#6366f1"
          accentBg="rgba(99, 102, 241, 0.15)"
        />

        <MetricCard
          title="Learning Streak"
          value={`${summary?.learning_streak || 0} Days`}
          subtitle="Continuous consecutive days active"
          icon={Flame}
          color="#f59e0b"
          accentBg="rgba(245, 158, 11, 0.15)"
        />

        <MetricCard
          title="Concepts Mastered"
          value={summary?.concepts_mastered || 0}
          subtitle="Scored 80%+ on application tests"
          icon={Award}
          color="#a855f7"
          accentBg="rgba(168, 85, 247, 0.15)"
        />
      </div>

      {/* Main Grid: Learning Curve & Weak/Strong Concepts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
      }}>
        {/* Progress Learning Curve */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Learning Progress Curve</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Performance trajectory across your latest evaluations
              </p>
            </div>
            <button
              onClick={() => onNavigate('progress')}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Full Analytics
            </button>
          </div>

          <ProgressChart data={summary?.learning_curve || []} height={200} />
        </div>

        {/* Identified Weak Concepts (Conceptual Gaps) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#f59e0b" /> Conceptual Gaps to Bridge
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Areas where repeated mistakes or boundary errors were detected
              </p>
            </div>
          </div>

          {summary?.weak_concepts?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {summary.weak_concepts.map((concept) => (
                <div
                  key={concept.concept_id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>
                        {concept.concept_name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ({concept.subject_name})
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '2px' }}>
                      Status: {concept.status} • Mastery: {concept.mastery_score}%
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onStartTargetedPractice) {
                        onStartTargetedPractice(concept.subject_name, concept.concept_name);
                      } else {
                        onNavigate('practice');
                      }
                    }}
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#d97706' }}
                  >
                    Bridge Gap
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '30px 20px',
              textAlign: 'center',
              border: '1px dashed var(--border-subtle)',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              fontSize: '0.88rem',
            }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 10px auto' }} />
              <div>No critical conceptual gaps detected!</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Your foundational implementations meet requirements.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Next Challenges */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              Recommended Practice Challenges
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Handpicked to reinforce your weak areas or push into advanced concepts
            </p>
          </div>
          <button
            onClick={() => onNavigate('practice')}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem' }}
          >
            Explore Catalog
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {curatedChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="glass-card glass-card-interactive"
              onClick={() => onSelectChallenge(challenge.id)}
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className={`badge badge-${challenge.difficulty.toLowerCase()}`}>
                    {challenge.difficulty}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                    {challenge.subject_name || 'Code'} • {challenge.concept_name || 'Concept'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px', lineHeight: 1.3 }}>
                  {challenge.title}
                </h3>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {challenge.real_world_scenario || challenge.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Practical Exercise
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--primary-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Solve Now <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Learning Activity Timeline */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
          Recent Learning Activity
        </h3>

        {summary?.recent_activities?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {summary.recent_activities.slice(0, 5).map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: act.score !== null ? (act.score >= 75 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)') : 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: act.score !== null ? (act.score >= 75 ? '#34d399' : '#fbbf24') : 'var(--primary-light)',
                  }}>
                    <Code2 size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
                      {act.activity_description}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(act.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {act.score !== null && (
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: act.score >= 75 ? '#34d399' : '#fbbf24',
                    background: act.score >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}>
                    {act.score}%
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
            No recent activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
