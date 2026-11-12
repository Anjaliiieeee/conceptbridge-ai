import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('conceptbridge_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('conceptbridge_token');
      const storedUser = localStorage.getItem('conceptbridge_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await authAPI.getMe();
          setUser(res.data);
          localStorage.setItem('conceptbridge_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session verification failed, clearing credentials:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('conceptbridge_token', access_token);
    localStorage.setItem('conceptbridge_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (payload) => {
    const res = await authAPI.register(payload);
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('conceptbridge_token', access_token);
    localStorage.setItem('conceptbridge_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('conceptbridge_token');
    localStorage.removeItem('conceptbridge_user');
  };

  const updateUserState = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('conceptbridge_user', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
