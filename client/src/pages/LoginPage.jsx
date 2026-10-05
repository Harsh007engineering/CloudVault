import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ThemeToggle from '../components/common/ThemeToggle';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const { success } = useToast();
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Public Computer Banner */}
      <div className="max-w-md w-full mx-auto mb-6 px-4 relative z-10">
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 backdrop-blur-sm shadow-sm">
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
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign in to CloudVault
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500 dark:text-slate-400">
          Access your academic files with your Username &amp; Password
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
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
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-brand-600/25 hover:shadow-brand-500/35 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              New student at the lab?{' '}
              <Link
                to="/signup"
                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Create your free vault
              </Link>
            </p>
          </div>
        </div>

        {/* Lab PC Footer reminder */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-6">
          CloudVault runs directly in this browser session. Close window when finished.
        </p>
      </div>
    </div>
  );
}
