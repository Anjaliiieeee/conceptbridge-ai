import React, { useState, useEffect } from 'react';
import { challengesAPI } from '../services/api';
import { CodeEditor } from '../components/CodeEditor';
import {
  Terminal,
  Sparkles,
  ShieldCheck,
  Send,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Info
} from 'lucide-react';

export const ChallengePage = ({ challengeId, onBack, onEvaluated }) => {
  const [challenge, setChallenge] = useState(null);
  const [studentCode, setStudentCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch challenge detail
  useEffect(() => {
    const fetchChallenge = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await challengesAPI.getChallengeById(challengeId);
        setChallenge(res.data);

        // Provide intelligent starter code based on subject & concept
        const lang = res.data.subject_name?.toLowerCase() || 'python';
        let starter = '# Write your technical solution below\n\n';
        if (lang.includes('python')) {
          starter = `# Subject: ${res.data.subject_name} • Concept: ${res.data.concept_name}\n# Implement the solution fulfilling all requirements:\n\ndef solution(*args, **kwargs):\n    # TODO: Implement your logic here\n    pass\n`;
        } else if (lang.includes('javascript')) {
          starter = `// Subject: ${res.data.subject_name} • Concept: ${res.data.concept_name}\nfunction solution(...args) {\n    // TODO: Implement your logic here\n}\n`;
        } else if (lang.includes('sql')) {
          starter = `-- Subject: SQL • Concept: ${res.data.concept_name}\n-- Write your query below:\nSELECT \n    \nFROM \nWHERE \n;`;
        }
        setStudentCode(starter);
      } catch (err) {
        console.error('Failed to load challenge:', err);
        setError('Failed to load challenge details. Please return to the catalog.');
      } finally {
        setIsLoading(false);
      }
    };

    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId]);

  const handleSubmit = async () => {
    if (!studentCode.trim() || studentCode.trim().length < 5) {
      setError('Please provide your solution before submitting for evaluation.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await challengesAPI.submitAnswer(challengeId, {
        challenge_id: challengeId,
        submitted_answer: studentCode,
      });
      // Route directly to AI evaluation page with submission result!
      onEvaluated(res.data);
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err.response?.data?.message || 'Failed to evaluate answer. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (challenge) {
      const lang = challenge.subject_name?.toLowerCase() || 'python';
      let starter = '# Write your technical solution below\n\n';
      if (lang.includes('python')) {
        starter = `def solution(*args, **kwargs):\n    pass\n`;
      } else if (lang.includes('javascript')) {
        starter = `function solution(...args) {\n    \n}\n`;
      } else if (lang.includes('sql')) {
        starter = `SELECT * FROM table_name;\n`;
      }
      setStudentCode(starter);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <Loader2 size={36} className="animate-spin" color="var(--primary-light)" />
        <div style={{ color: 'var(--text-secondary)' }}>Loading practical challenge...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ color: '#fff', marginBottom: '12px' }}>Challenge Not Found</h2>
        <button onClick={onBack} className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Challenges
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Top Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={onBack}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>

      {/* Challenge Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
        padding: '24px 28px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span className={`badge badge-${challenge.difficulty.toLowerCase()}`}>
              {challenge.difficulty}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
              {challenge.subject_name || 'Code'} • {challenge.concept_name || 'Concept'}
            </span>
            {challenge.is_ai_generated && (
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> AI Tailored
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
            {challenge.title}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '0.78rem',
            color: 'var(--success)',
            background: 'var(--success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '6px 12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <ShieldCheck size={16} /> Zero Server Execution Safe
          </span>
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

      {/* Main Grid: Problem Specification on Left, Code Editor on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 1fr) minmax(400px, 1.2fr)',
        gap: '24px',
        alignItems: 'start',
      }}>
        {/* Left Column: Requirements & Scenario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Real World Scenario */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '10px' }}>
              <BookOpen size={16} /> REAL-WORLD PRODUCTION SCENARIO
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {challenge.real_world_scenario || challenge.description}
            </p>
          </div>

          {/* Core Requirements */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Functional Requirements
            </div>
            <div style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}>
              {challenge.requirements}
            </div>
          </div>

          {/* Sample Input / Output Examples */}
          {challenge.examples && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                Examples & Schema
              </div>
              <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                background: '#090d16',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                color: '#93c5fd',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
              }}>
                {challenge.examples}
              </pre>
            </div>
          )}

          {/* Evaluation Criteria Note */}
          <div style={{
            padding: '14px 18px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}>
            <Info size={18} color="var(--primary-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong style={{ color: '#ffffff' }}>Evaluation Standard: </strong>
              {challenge.evaluation_criteria || 'Correct application of technical concept, boundary edge cases, and clean return values.'}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Submission */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CodeEditor
            value={studentCode}
            onChange={setStudentCode}
            language={challenge.subject_name?.toLowerCase() || 'python'}
            onReset={handleReset}
          />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Ready to submit? AI will evaluate logic and diagnose conceptual gaps.
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.92rem' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Evaluating Answer...
                </>
              ) : (
                <>
                  <Send size={16} /> Submit Solution for AI Evaluation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
