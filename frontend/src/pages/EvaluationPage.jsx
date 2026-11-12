import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Brain,
  ListOrdered,
  Check,
  Compass,
  Code2
} from 'lucide-react';

export const EvaluationPage = ({
  evaluation,
  onRetry,
  onGenerateFollowup,
  onBackToDashboard
}) => {
  // Fire celebratory confetti on mastery
  useEffect(() => {
    if (evaluation && evaluation.score >= 75) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#38bdf8', '#10b981', '#a855f7'],
      });
    }
  }, [evaluation]);

  if (!evaluation) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h2 style={{ color: '#fff', marginBottom: '16px' }}>No Evaluation Data Available</h2>
        <button onClick={onBackToDashboard} className="btn btn-primary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Parse mistakes if string
  let parsedMistakes = [];
  try {
    if (Array.isArray(evaluation.mistakes)) {
      parsedMistakes = evaluation.mistakes;
    } else if (typeof evaluation.mistakes === 'string') {
      if (evaluation.mistakes.startsWith('[')) {
        parsedMistakes = JSON.parse(evaluation.mistakes);
      } else {
        parsedMistakes = [evaluation.mistakes];
      }
    }
  } catch {
    parsedMistakes = [String(evaluation.mistakes)];
  }

  const isMastered = evaluation.score >= 75;
  const isPartial = evaluation.score >= 50 && evaluation.score < 75;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Score Hero Card */}
      <div className="glass-card" style={{
        padding: '36px',
        borderRadius: 'var(--radius-xl)',
        border: `1px solid ${isMastered ? 'rgba(16, 185, 129, 0.4)' : isPartial ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
        background: isMastered
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(14, 22, 40, 0.9) 100%)'
          : isPartial
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(14, 22, 40, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(14, 22, 40, 0.9) 100%)',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className={`badge badge-${isMastered ? 'status-correct' : isPartial ? 'intermediate' : 'status-incorrect'}`}>
                {isMastered ? 'Concept Mastered' : isPartial ? 'Partially Correct' : 'Revision Required'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {evaluation.subject_name || 'Code'} • {evaluation.concept_name || 'Concept'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Evaluation Report: {evaluation.challenge_title || 'Practical Challenge'}
            </h1>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '650px', lineHeight: 1.6 }}>
              {evaluation.explanation}
            </p>
          </div>

          {/* Big Score Meter */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'var(--bg-main)',
            border: `4px solid ${isMastered ? '#10b981' : isPartial ? '#f59e0b' : '#ef4444'}`,
            boxShadow: `0 0 25px ${isMastered ? 'rgba(16, 185, 129, 0.3)' : isPartial ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            flexShrink: 0,
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
              {evaluation.score}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Out of 100
            </div>
          </div>
        </div>
      </div>

      {/* Identified Conceptual Gap (Primary Highlight) */}
      <div style={{
        padding: '24px 28px',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)',
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'rgba(99, 102, 241, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-light)',
          flexShrink: 0
        }}>
          <Brain size={22} />
        </div>

        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            DIAGNOSED CONCEPTUAL GAP
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            {evaluation.conceptual_gap || 'Minor implementation boundary edge case.'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {evaluation.suggested_improvement}
          </p>
        </div>
      </div>

      {/* Detailed Analysis Breakdown: Mistakes & Recommended Approach */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
      }}>
        {/* Specific Mistakes */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
            <AlertTriangle size={16} /> SPECIFIC MISSTEPS IDENTIFIED
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {parsedMistakes.map((mistake, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.18)',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                }}
              >
                <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{mistake}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Correct Engineering Approach */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
            <CheckCircle2 size={16} /> RECOMMENDED ARCHITECTURAL PATTERN
          </div>

          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            background: '#090d16',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            color: '#a7f3d0',
            overflowX: 'auto',
            maxHeight: '260px',
            lineHeight: 1.5,
          }}>
            {evaluation.correct_approach || '# Review expected implementation reference'}
          </pre>
        </div>
      </div>

      {/* Your Submitted Answer Snapshot */}
      {evaluation.submitted_answer && (
        <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Your Submitted Solution
          </div>
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            background: '#090d16',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            color: '#cbd5e1',
            overflowX: 'auto',
            maxHeight: '160px',
          }}>
            {evaluation.submitted_answer}
          </pre>
        </div>
      )}

      {/* Action Footer Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBackToDashboard}
            className="btn btn-secondary"
            style={{ padding: '12px 20px', fontSize: '0.9rem' }}
          >
            Dashboard
          </button>
          <button
            onClick={onRetry}
            className="btn btn-secondary"
            style={{ padding: '12px 20px', fontSize: '0.9rem' }}
          >
            <RotateCcw size={15} /> Retry This Challenge
          </button>
        </div>

        <button
          onClick={() => onGenerateFollowup(evaluation.conceptual_gap)}
          className="btn btn-primary"
          style={{ padding: '12px 24px', fontSize: '0.92rem' }}
        >
          <Sparkles size={16} /> Bridge Gap: Generate Follow-Up Challenge <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
