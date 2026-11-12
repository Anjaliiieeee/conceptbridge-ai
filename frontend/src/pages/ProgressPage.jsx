import React, { useState, useEffect } from 'react';
import { progressAPI } from '../services/api';
import { ProgressChart } from '../components/ProgressChart';
import { MetricCard } from '../components/MetricCard';
import {
  LineChart,
  Award,
  TrendingUp,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target,
  Loader2,
  RefreshCw,
  BookOpen
} from 'lucide-react';

export const ProgressPage = ({ onNavigate, onStartTargetedPractice }) => {
  const [summary, setSummary] = useState(null);
  const [masteries, setMasteries] = useState([]);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all'); // all | mastered | needs_practice
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [sumRes, mastRes, histRes] = await Promise.all([
        progressAPI.getSummary(),
        progressAPI.getConceptMasteries(),
        progressAPI.getHistory(),
      ]);
      setSummary(sumRes.data);
      setMasteries(mastRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to load progress analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <Loader2 size={36} className="animate-spin" color="var(--primary-light)" />
        <div style={{ color: 'var(--text-secondary)' }}>Compiling learning analytics...</div>
      </div>
    );
  }

  const filteredMasteries = masteries.filter((m) => {
    if (filter === 'mastered') return m.mastery_score >= 75;
    if (filter === 'needs_practice') return m.mastery_score < 75;
    return true;
  });

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
            Learning Progress & Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Track concept mastery trajectory, identify cognitive bottlenecks, and review your practice history.
          </p>
        </div>

        <button onClick={loadData} className="btn btn-secondary" style={{ padding: '10px 16px' }}>
          <RefreshCw size={15} /> Refresh Analytics
        </button>
      </div>

      {error && (
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          padding: '14px',
          color: '#fca5a5',
          marginBottom: '24px',
        }}>
          {error}
        </div>
      )}

      {/* Top 4 Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <MetricCard
          title="Overall Mastery"
          value={`${summary?.average_score || 0}%`}
          subtitle="Mean performance across all checks"
          icon={TrendingUp}
          color="#6366f1"
          accentBg="rgba(99, 102, 241, 0.15)"
        />

        <MetricCard
          title="Active Streak"
          value={`${summary?.learning_streak || 0} Days`}
          subtitle="Consecutive daily engagement"
          icon={Flame}
          color="#f59e0b"
          accentBg="rgba(245, 158, 11, 0.15)"
        />

        <MetricCard
          title="Mastered Concepts"
          value={summary?.concepts_mastered || 0}
          subtitle="Scoring >= 80% with proven execution"
          icon={Award}
          color="#10b981"
          accentBg="rgba(16, 185, 129, 0.15)"
        />

        <MetricCard
          title="Total Submissions"
          value={summary?.total_challenges_completed || 0}
          subtitle={`${summary?.total_attempts || 0} evaluated code solutions`}
          icon={CheckCircle2}
          color="#38bdf8"
          accentBg="rgba(56, 189, 248, 0.15)"
        />
      </div>

      {/* Chart Section */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
          Performance Trajectory Over Time
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Real-time score curve showing continuous improvement across problem submissions.
        </p>
        <ProgressChart data={summary?.learning_curve || []} height={240} />
      </div>

      {/* Concept Mastery Grid */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              Concept Mastery Matrix
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Breakdown of proficiency across technical topics
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'mastered', 'needs_practice'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.78rem', textTransform: 'capitalize' }}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredMasteries.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {filteredMasteries.map((m) => {
              const score = m.mastery_score;
              const isHigh = score >= 75;
              const isMedium = score >= 50 && score < 75;
              const color = isHigh ? '#10b981' : isMedium ? '#f59e0b' : '#ef4444';

              return (
                <div
                  key={m.id}
                  style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                        {m.concept_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {m.subject_name} • {m.total_attempts} attempts ({m.correct_attempts} correct)
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      color: color,
                    }}>
                      {score}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    marginBottom: '12px',
                  }}>
                    <div style={{
                      width: `${Math.min(100, Math.max(5, score))}%`,
                      height: '100%',
                      background: color,
                      borderRadius: '3px',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', color: isHigh ? '#34d399' : '#fca5a5' }}>
                      {isHigh ? 'Mastered' : isMedium ? 'Proficient' : 'Needs Practice'}
                    </span>
                    <button
                      onClick={() => onStartTargetedPractice(m.subject_name, m.concept_name)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                    >
                      Practice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No concepts match the selected filter.
          </div>
        )}
      </div>

      {/* Full Learning History Timeline */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
          Learning Activity History
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Complete log of challenges generated, evaluated submissions, and diagnostic events.
        </p>

        {history.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Clock size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.activity_description}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {item.score !== null && (
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: item.score >= 75 ? '#34d399' : '#fbbf24',
                    background: item.score >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}>
                    {item.score}%
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No activity history recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
