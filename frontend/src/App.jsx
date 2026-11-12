import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PracticePage } from './pages/PracticePage';
import { ChallengePage } from './pages/ChallengePage';
import { EvaluationPage } from './pages/EvaluationPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { challengesAPI } from './services/api';

const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);

  // Preselection state for targeted gap practice
  const [targetSubject, setTargetSubject] = useState(null);
  const [targetConcept, setTargetConcept] = useState(null);

  // Navigation handler
  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectChallenge = (challengeId) => {
    setSelectedChallengeId(challengeId);
    setCurrentPage('challenge');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEvaluated = (evaluationData) => {
    setCurrentEvaluation(evaluationData);
    setCurrentPage('evaluation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartTargetedPractice = (subjectName, conceptName) => {
    setTargetSubject(subjectName);
    setTargetConcept(conceptName);
    setCurrentPage('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateFollowup = async (conceptualGap) => {
    try {
      const payload = {
        subject_name: currentEvaluation?.subject_name || user?.preferred_language || 'Python',
        concept_name: currentEvaluation?.concept_name || 'Loops',
        difficulty: 'Beginner',
        focus_weak_areas: true,
      };
      const res = await challengesAPI.generateChallenge(payload);
      handleSelectChallenge(res.data.id);
    } catch (err) {
      console.error('Failed to generate follow-up challenge:', err);
      // Fallback: navigate to practice
      setCurrentPage('practice');
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--text-secondary)',
      }}>
        Loading ConceptBridge AI...
      </div>
    );
  }

  // Routing Logic
  // 1. Unauthenticated or public routes
  if (currentPage === 'landing') {
    return <LandingPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'login') {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'register') {
    return <RegisterPage onNavigate={handleNavigate} />;
  }

  // 2. Protected Routes (require auth)
  if (!isAuthenticated) {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  let pageComponent = null;

  switch (currentPage) {
    case 'dashboard':
      pageComponent = (
        <DashboardPage
          onNavigate={handleNavigate}
          onSelectChallenge={handleSelectChallenge}
          onStartTargetedPractice={handleStartTargetedPractice}
        />
      );
      break;

    case 'practice':
      pageComponent = (
        <PracticePage
          onSelectChallenge={handleSelectChallenge}
          initialSubject={targetSubject}
          initialConcept={targetConcept}
        />
      );
      break;

    case 'challenge':
      pageComponent = (
        <ChallengePage
          challengeId={selectedChallengeId}
          onBack={() => handleNavigate('practice')}
          onEvaluated={handleEvaluated}
        />
      );
      break;

    case 'evaluation':
      pageComponent = (
        <EvaluationPage
          evaluation={currentEvaluation}
          onRetry={() => {
            if (currentEvaluation?.challenge_id) {
              handleSelectChallenge(currentEvaluation.challenge_id);
            } else {
              handleNavigate('practice');
            }
          }}
          onGenerateFollowup={handleGenerateFollowup}
          onBackToDashboard={() => handleNavigate('dashboard')}
        />
      );
      break;

    case 'progress':
      pageComponent = (
        <ProgressPage
          onNavigate={handleNavigate}
          onStartTargetedPractice={handleStartTargetedPractice}
        />
      );
      break;

    case 'profile':
      pageComponent = <ProfilePage onNavigate={handleNavigate} />;
      break;

    default:
      pageComponent = (
        <DashboardPage
          onNavigate={handleNavigate}
          onSelectChallenge={handleSelectChallenge}
          onStartTargetedPractice={handleStartTargetedPractice}
        />
      );
      break;
  }

  return (
    <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {pageComponent}
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
