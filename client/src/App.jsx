import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

// Route Guard: Requires Active Authentication
function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
          Verifying secure session...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Route Guard: Requires Administrator Role
function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          Checking admin permissions...
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Route Guard: Redirect already logged-in users to Dashboard
function PublicOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
          Loading...
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <LoginPage />
                </PublicOnly>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnly>
                  <SignupPage />
                </PublicOnly>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnly>
                  <ForgotPasswordPage />
                </PublicOnly>
              }
            />

            {/* Protected Student Routes */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <SettingsPage />
                </RequireAuth>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
}
