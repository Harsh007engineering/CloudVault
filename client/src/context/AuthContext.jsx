import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on page load
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data?.user) {
        setUser({
          ...res.data.user,
          forcePasswordChange: res.data.forcePasswordChange
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 is expected if not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.success && res.data?.user) {
      setUser({
        ...res.data.user,
        forcePasswordChange: res.data.forcePasswordChange
      });
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const signup = async (username, password, confirmPassword) => {
    const res = await api.post('/auth/signup', { username, password, confirmPassword });
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      return res.data; // Includes plaintext recoveryCodes to display ONCE!
    }
    throw new Error(res.message || 'Signup failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const updateStorage = (used, limit) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        storageUsed: used !== undefined ? used : prev.storageUsed,
        storageLimit: limit !== undefined ? limit : prev.storageLimit
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        updateStorage,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
