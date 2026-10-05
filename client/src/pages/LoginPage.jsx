import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/useTheme';
import ThemeToggle from '../components/common/ThemeToggle';
import AmbientBackground from '../components/common/AmbientBackground';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const { success } = useToast();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      await login(username.trim(), password);
      success('Welcome back to CloudVault!');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors selection:bg-brand-500 selection:text-white`}>
      {/* Ambient Lighting & Mesh Canvas */}
      <AmbientBackground isDark={isDark} />

      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Public Computer Banner */}
      <div className="max-w-md w-full mx-auto mb-5 px-4 relative z-10">
        <div className={`border rounded-2xl p-3.5 flex items-start gap-3 text-xs backdrop-blur-md transition-all shadow-sm ${
          isDark 
            ? 'bg-amber-950/40 border-amber-900/60 text-amber-200' 
            : 'bg-amber-500/10 border-amber-200/80 text-amber-900 shadow-amber-500/5'
        }`}>
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Lab PC Safe:</strong> Zero credentials stored in browser localStorage. Sign out before leaving your workstation.
          </span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white transition-transform group-hover:scale-105">
              <Cloud className="w-7 h-7" />
            </div>
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-sm ${
            isDark 
              ? 'bg-brand-950/60 text-brand-300 border-brand-800/60' 
              : 'bg-brand-50 text-brand-700 border-brand-200 shadow-sm'
          }`}>
            Campus Edition
          </span>
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            &bull; Private University Storage
          </span>
        </div>

        <h2 className={`mt-2 text-center text-2xl sm:text-3xl font-extrabold tracking-tight ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Sign in to CloudVault
        </h2>
        <p className={`mt-1 text-center text-xs ${
          isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
        }`}>
          Access your academic files with your Username &amp; Password
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className={`py-8 px-6 sm:px-10 rounded-3xl border backdrop-blur-2xl transition-all ${
          isDark 
            ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/50 ring-1 ring-white/5' 
            : 'bg-white/90 border-slate-200/90 shadow-2xl shadow-indigo-500/5 ring-1 ring-slate-900/5'
        }`}>
          {errorMsg && (
            <div className={`mb-5 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs border ${
              isDark 
                ? 'bg-rose-950/40 border-rose-900/60 text-rose-300' 
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. harsh_student"
                  className={`block w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${
                    isDark 
                      ? 'bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50' 
                      : 'bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300/90 text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 shadow-sm'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-semibold ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-600 hover:text-brand-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`block w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${
                    isDark 
                      ? 'bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50' 
                      : 'bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300/90 text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 shadow-sm'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-brand-600/25 hover:shadow-brand-500/35 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:translate-y-0.5"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className={`mt-6 pt-5 border-t text-center ${
            isDark ? 'border-slate-800' : 'border-slate-200/80'
          }`}>
            <p className={`text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              New student at the lab?{' '}
              <Link
                to="/signup"
                className="font-semibold text-brand-600 hover:text-brand-500 hover:underline"
              >
                Create your free vault
              </Link>
            </p>
          </div>
        </div>

        {/* Lab PC Footer reminder */}
        <p className={`text-center text-[11px] mt-6 ${
          isDark ? 'text-slate-500' : 'text-slate-500'
        }`}>
          CloudVault runs directly in this browser session. Close window when finished.
        </p>
      </div>
    </div>
  );
}
