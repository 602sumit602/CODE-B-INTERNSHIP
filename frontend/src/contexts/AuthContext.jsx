import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/dataService';

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    window.location.href = '/login';
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (token) {
      inactivityTimerRef.current = setTimeout(() => {
        alert('You have been logged out due to inactivity.');
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [token, logout]);

  // Inactivity tracking
  useEffect(() => {
    if (!token) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => resetInactivityTimer();

    events.forEach((evt) => window.addEventListener(evt, handleActivity));
    resetInactivityTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [token, resetInactivityTimer]);

  // Verify profile on mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error('Session expired or invalid token', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data?.success) {
      const data = res.data.data;
      setToken(data.token);
      localStorage.setItem('token', data.token);

      const userObj = {
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        status: data.status,
        phone: data.phone,
        department: data.department,
      };
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      return userObj;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (registerData) => {
    const res = await authService.register(registerData);
    if (res.data?.success) {
      const data = res.data.data;
      setToken(data.token);
      localStorage.setItem('token', data.token);

      const userObj = {
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        status: data.status,
        phone: data.phone,
        department: data.department,
      };
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      return userObj;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isSalesPerson = user?.role === 'SALES_PERSON';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated,
        isAdmin,
        isSalesPerson,
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
