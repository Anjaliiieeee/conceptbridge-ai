import React from 'react';
import { Navbar } from '../components/Navbar';
import {
  Sparkles,
  Terminal,
  ArrowRight,
  Brain,
  Target,
  CheckCircle2,
  Zap,
  Compass,
  Code2,
  TrendingUp,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const LandingPage = ({ onNavigate }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onNavigate={onNavigate} currentPage="landing" />

      {/* Hero Section */}
      <section style={{
        padding: '80px 0 60px 0',
        position: 'relative',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            color: 'var(--primary-light)',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '24px',
          }}>
            <Sparkles size={15} /> NEXT-GEN AI PEDAGOGICAL PLATFORM
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            color: '#ffffff',
          }}>
            Bridge the Gap Between <br />
            <span className="text-gradient">Knowing and Doing</span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: '740px',
            margin: '0 auto 36px auto',
          }}>
            Students frequently memorize syntax and theory but struggle to apply concepts in real-world scenarios.
            ConceptBridge AI identifies your precise conceptual misunderstandings through practical challenges and generates targeted exercises to build true mastery.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('register')}
              className="btn btn-primary"
              style={{ padding: '14px 30px', fontSize: '1rem', borderRadius: '12px' }}
            >
              Start Learning Free <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="btn btn-secondary"
              style={{ padding: '14px 26px', fontSize: '1rem', borderRadius: '12px' }}
            >
              Live Demo Sign In
            </button>
          </div>

          {/* Supported Languages Ribbon */}
          <div style={{
            marginTop: '50px',
            padding: '16px 24px',
            borderRadius: '16px',
            background: 'rgba(14, 22, 40, 0.6)',
            border: '1px solid var(--border-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Supported Tracks:
            </span>
            {['Python', 'JavaScript', 'Java', 'SQL', 'HTML5', 'CSS3'].map((lang) => (
              <span key={lang} style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code2 size={15} color="var(--accent-blue)" /> {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Feature Demo Preview */}
      <section style={{ padding: '40px 0 80px 0' }}>
        <div className="container">
          <div className="glass-card" style={{
            padding: '32px',
            maxWidth: '1000px',
            margin: '0 auto',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge badge-intermediate">Python • OOP</span>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                  Fintech Wallet: Encapsulation & Negative Balance Invariant
                </span>
              </div>
              <span className="badge badge-status-correct">AI Diagnostic Ready</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#090d16', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Student Common Attempt
                </div>
                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#f87171', overflowX: 'auto' }}>
{`class Wallet:
    def __init__(self, bal):
        self.balance = bal  # Exposed!
    def debit(self, amt):
        self.balance -= amt # No bound check`}
                </pre>
              </div>

              <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  ConceptBridge AI Diagnostic
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  <strong>Identified Conceptual Gap:</strong> Failure to encapsulate internal state. Direct attribute exposure enables balance tampering without invariant validation.
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-blue)' }}>
                  → Generated Follow-Up Challenge: Protecting Invariants with Python Properties
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '60px 0', background: 'rgba(14, 22, 40, 0.4)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              How ConceptBridge AI Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              A closed-loop diagnostic methodology designed to convert theoretical memory into production intuition.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              {
                step: '01',
                title: 'Select Technical Topic',
                desc: 'Pick your language and concept—from Loops and OOP to SQL queries and REST APIs.',
                icon: Compass,
              },
              {
                step: '02',
                title: 'Solve Practical Challenge',
                desc: 'Receive real-world scenarios (fintech, e-commerce, telemetry) rather than synthetic trivia.',
                icon: Terminal,
              },
              {
                step: '03',
                title: 'AI Evaluates Core Gaps',
                desc: 'AI analyzes structural mistakes to pinpoint the exact misconception behind the error.',
                icon: Brain,
              },
              {
                step: '04',
                title: 'Bridge With Follow-Ups',
                desc: 'Receive personalized challenges crafted specifically to reinforce your diagnosed weakness.',
                icon: Target,
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-light)',
                    }}>
                      <Icon size={20} />
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--border-medium)', fontFamily: 'var(--font-mono)' }}>
                      {step.step}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              Engineered for Real-World Competence
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Features built for developers who want to pass technical interviews and write reliable software.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {[
              {
                title: 'Diagnostic Conceptual Gap Detection',
                desc: 'Detects the root conceptual misunderstanding (e.g. confusion over mutability or boundary conditions) rather than just flagging syntax.',
                icon: Brain,
                color: '#8b5cf6',
              },
              {
                title: 'Safe Static Structural Evaluation',
                desc: 'Evaluates logic securely without executing arbitrary student code on the host server, ensuring high availability and safety.',
                icon: ShieldCheck,
                color: '#10b981',
              },
              {
                title: 'Personalized Remediation Loops',
                desc: 'Dynamic generation of follow-up problems tailored specifically to bridge the exact gap identified in past attempts.',
                icon: Target,
                color: '#38bdf8',
              },
              {
                title: 'Holistic Mastery Metrics',
                desc: 'Exponential moving average mastery scores, learning streak tracking, and concept categorization (Mastered vs Critical Gap).',
                icon: TrendingUp,
                color: '#f59e0b',
              },
              {
                title: 'Production-Grade Architecture',
                desc: 'FastAPI backend, SQLAlchemy ORM, clean repository & service patterns, JWT security, and Dockerized deployment ready.',
                icon: Cpu,
                color: '#ec4899',
              },
              {
                title: 'Zero-Config Intelligent Fallback',
                desc: 'Runs out-of-the-box with an internal pedagogical engine or connects seamlessly with your OpenAI API key.',
                icon: Zap,
                color: '#06b6d4',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="glass-card" style={{ padding: '24px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `${feature.color}15`,
                    border: `1px solid ${feature.color}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: feature.color,
                    marginBottom: '16px',
                  }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        padding: '36px 0',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(7, 11, 20, 0.9)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={18} color="var(--primary-light)" />
            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>ConceptBridge AI</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>• Bridge the Gap Between Knowing and Doing</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} ConceptBridge AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
