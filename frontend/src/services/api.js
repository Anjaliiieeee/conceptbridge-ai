import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('conceptbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiration handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and on a protected action, clear stored token
      const isAuthRoute = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('conceptbridge_token');
        localStorage.removeItem('conceptbridge_user');
      }
    }
    return Promise.reject(error);
  }
);

// Service API bundles
export const authAPI = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const subjectsAPI = {
  getSubjects: () => api.get('/subjects'),
  getConceptsForSubject: (subjectId) => api.get(`/subjects/${subjectId}/concepts`),
};

export const challengesAPI = {
  getChallenges: (params) => api.get('/challenges', { params }),
  getChallengeById: (id) => api.get(`/challenges/${id}`),
  generateChallenge: (payload) => api.post('/challenges/generate', payload),
  submitAnswer: (challengeId, payload) => api.post(`/challenges/${challengeId}/submit`, payload),
};

export const evaluationsAPI = {
  getEvaluationById: (submissionId) => api.get(`/evaluations/${submissionId}`),
};

export const progressAPI = {
  getSummary: () => api.get('/progress'),
  getConceptMasteries: () => api.get('/progress/concepts'),
  getHistory: () => api.get('/progress/history'),
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (payload) => api.put('/profile', payload),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
