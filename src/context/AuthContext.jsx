import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getProfile();
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token, user: loggedInUser } = response.data;
    localStorage.setItem('token', token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    const { token, user: createdUser } = response.data;
    localStorage.setItem('token', token);
    setUser(createdUser);
    return createdUser;
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) await authService.logout(token);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
