import React, { useState, useEffect } from 'react';
import { subjectsAPI, challengesAPI } from '../services/api';
import {
  Sparkles,
  Terminal,
  Code2,
  Filter,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Flame,
  Search,
  Target
} from 'lucide-react';

export const PracticePage = ({ onSelectChallenge, initialSubject, initialConcept }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || 'Python');
  const [concepts, setConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(initialConcept || '');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [focusWeakAreas, setFocusWeakAreas] = useState(false);

  const [challenges, setChallenges] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch subjects and concepts catalog
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await subjectsAPI.getSubjects();
        setSubjects(res.data);

        // Find concepts for initial subject
        const match = res.data.find(s => s.subject_name.toLowerCase() === selectedSubject.toLowerCase()) || res.data[0];
        if (match) {
          setSelectedSubject(match.subject_name);
          setConcepts(match.concepts || []);
          if (!selectedConcept && match.concepts?.length > 0) {
            setSelectedConcept(match.concepts[0].concept_name);
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
        setError('Could not connect to backend catalog.');
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    fetchMetadata();
  }, []);

  // Update concepts when selectedSubject changes
  const handleSubjectChange = (subjectName) => {
    setSelectedSubject(subjectName);
    const match = subjects.find(s => s.subject_name === subjectName);
    if (match) {
      setConcepts(match.concepts || []);
      setSelectedConcept(match.concepts?.[0]?.concept_name || '');
    }
  };

  // Fetch challenges for current subject/concept
  const fetchChallenges = async () => {
    try {
      const matchSubj = subjects.find(s => s.subject_name === selectedSubject);
      const params = {};
      if (matchSubj) params.subject_id = matchSubj.id;
      const res = await challengesAPI.getChallenges(params);
      setChallenges(res.data);
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    }
  };

  useEffect(() => {
    if (subjects.length > 0) {
      fetchChallenges();
    }
  }, [selectedSubject, subjects]);

  // Handle AI challenge generation
  const handleGenerateChallenge = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const payload = {
        subject_name: selectedSubject,
        concept_name: selectedConcept,
        difficulty: difficulty,
        focus_weak_areas: focusWeakAreas,
      };
      const res = await challengesAPI.generateChallenge(payload);
      // Immediately open the newly generated challenge!
      onSelectChallenge(res.data.id);
    } catch (err) {
      console.error('Challenge generation error:', err);
      setError(err.response?.data?.message || 'Failed to generate challenge. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredChallenges = challenges.filter(c => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        (c.concept_name && c.concept_name.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
          Practice & Challenge Generator
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Select technical parameters to generate personalized scenarios or practice curated industry challenges.
        </p>
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

      {/* Generator Control Card */}
      <div className="glass-card" style={{
        padding: '28px',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        marginBottom: '40px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '20px' }}>
          <Sparkles size={16} /> CONFIGURE PRACTICAL SCENARIO
        </div>

        {/* Step 1: Programming Language Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label className="form-label" style={{ marginBottom: '10px' }}>
            <span>1. Select Programming Language / Track</span>
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['Python', 'JavaScript', 'Java', 'SQL', 'HTML', 'CSS'].map((lang) => {
              const isSelected = selectedSubject.toLowerCase() === lang.toLowerCase();
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleSubjectChange(lang)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: isSelected ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Code2 size={16} color={isSelected ? '#ffffff' : 'var(--text-muted)'} />
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Concept Selector & Difficulty */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '8px' }}>
              <span>2. Technical Concept</span>
            </label>
            <select
              className="form-select"
              value={selectedConcept}
              onChange={(e) => setSelectedConcept(e.target.value)}
            >
              {concepts.map((c) => (
                <option key={c.id} value={c.concept_name}>
                  {c.concept_name} ({c.difficulty_level})
                </option>
              ))}
              {/* Fallback default concepts if subject has none */}
              {concepts.length === 0 && (
                <>
                  <option value="Variables">Variables & Data Types</option>
                  <option value="Loops">Loops & Iterations</option>
                  <option value="Functions">Functions & Scoping</option>
                  <option value="OOP">Object Oriented Programming</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: '8px' }}>
              <span>3. Target Difficulty</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
                const isSelected = difficulty === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      color: isSelected ? 'var(--primary-light)' : 'var(--text-muted)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Focus on Weak Areas Option */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'rgba(245, 158, 11, 0.06)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '10px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Target size={20} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                Target Identified Conceptual Gaps
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Directs the AI engine to generate scenario boundaries targeting your diagnosed misunderstandings.
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={focusWeakAreas}
            onChange={(e) => setFocusWeakAreas(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px' }}>
          <button
            type="button"
            onClick={handleGenerateChallenge}
            disabled={isGenerating}
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '0.95rem', borderRadius: '10px' }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Generating AI Scenario...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Generate Practical Challenge <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Catalog of Challenges */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              Available {selectedSubject} Challenges
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Choose a scenario below or solve the AI-generated problem above
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', paddingRight: '12px', fontSize: '0.85rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        {filteredChallenges.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {filteredChallenges.map((ch) => (
              <div
                key={ch.id}
                className="glass-card glass-card-interactive"
                onClick={() => onSelectChallenge(ch.id)}
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className={`badge badge-${ch.difficulty.toLowerCase()}`}>
                      {ch.difficulty}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                      {ch.concept_name || 'Core'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '10px', lineHeight: 1.3 }}>
                    {ch.title}
                  </h3>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ch.real_world_scenario || ch.description}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '14px',
                }}>
                  <span style={{ fontSize: '0.75rem', color: ch.is_ai_generated ? 'var(--primary-light)' : 'var(--text-muted)' }}>
                    {ch.is_ai_generated ? '⚡ AI Tailored' : '📦 Curated Module'}
                  </span>
                  <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                    Solve Challenge <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '12px',
            color: 'var(--text-secondary)',
          }}>
            <Code2 size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
              No challenges found matching your search.
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Click "Generate Practical Challenge" above to instantly create a new problem!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
