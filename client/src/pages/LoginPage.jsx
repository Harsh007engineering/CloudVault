import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, Lock, User, ArrowRight, ShieldCheck, AlertCircle, KeyRound, HardDrive } from 'lucide-react';
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
    } flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative transition-colors selection:bg-brand-500 selection:text-white`}>
      <AmbientBackground isDark={isDark} />

      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl w-full mx-auto relative z-10">
        {/* Public Computer Notice Pill */}
        <div className="mb-6 max-w-lg mx-auto lg:max-w-none">
          <div className={`border rounded-2xl p-3 flex items-center gap-2.5 text-xs backdrop-blur-md transition-all shadow-sm ${
            isDark 
              ? 'bg-amber-950/40 border-amber-900/60 text-amber-200' 
              : 'bg-amber-500/10 border-amber-200/80 text-amber-900 shadow-amber-500/5'
          }`}>
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Lab PC Safe Mode:</strong> No persistent credentials left in browser. Session is destroyed upon sign out.
            </span>
          </div>
        </div>

        {/* 2-Column Container */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 rounded-3xl border overflow-hidden backdrop-blur-2xl transition-all ${
          isDark 
            ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/50 ring-1 ring-white/5' 
            : 'bg-white/95 border-slate-200/90 shadow-2xl shadow-indigo-500/5 ring-1 ring-slate-900/5'
        }`}>
          {/* LEFT COLUMN: Value Proposition & Security Badges */}
          <div className={`lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r ${
            isDark 
              ? 'bg-gradient-to-br from-slate-900/90 to-brand-950/30 border-slate-800' 
              : 'bg-gradient-to-br from-brand-50/60 via-slate-50 to-indigo-50/40 border-slate-200/80'
          }`}>
            <div>
              <Link to="/" className="inline-flex items-center gap-2.5 group mb-8">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white transition-transform group-hover:scale-105">
                  <Cloud className="w-5 h-5" />
                </div>
                <span className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Cloud<span className="text-brand-500">Vault</span>
                </span>
              </Link>

              <div className="inline-block mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-sm ${
                  isDark 
                    ? 'bg-brand-950/60 text-brand-300 border-brand-800/60' 
                    : 'bg-brand-50 text-brand-700 border-brand-200 shadow-sm'
                }`}>
                  Campus Edition
                </span>
              </div>

              <h2 className={`text-2xl font-extrabold tracking-tight leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Your files. <br />Your vault.
              </h2>
              <p className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                No Gmail. No OAuth. No personal account required. Designed specifically for university computer laboratories.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="mt-8 space-y-3 pt-6 border-t border-slate-500/10">
              <div className="flex items-center gap-2.5 text-xs">
                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-slate-800 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  🔒 Privacy-first architecture
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-slate-800 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                  <KeyRound className="w-4 h-4" />
                </div>
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  🔑 Single-use recovery codes
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                  <HardDrive className="w-4 h-4" />
                </div>
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  ☁ 500 MiB free academic storage
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sign In Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
            <div>
              <h3 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Sign in to CloudVault
              </h3>
              <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Enter your student username and password to open your vault
              </p>

              {errorMsg && (
                <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label 
                    htmlFor="username" 
                    className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    Student Username
                  </label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. hr_007"
                      className={`block w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-all ${
                        isDark 
                          ? 'bg-slate-950/60 border-slate-700/80 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20' 
                          : 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder-slate-400 hover:bg-white focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label 
                      htmlFor="password" 
                      className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`block w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-all ${
                        isDark 
                          ? 'bg-slate-950/60 border-slate-700/80 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20' 
                          : 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder-slate-400 hover:bg-white focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 shadow-lg shadow-brand-600/25 transition-all active:translate-y-0.5 group"
                >
                  <span>{submitting ? 'Verifying Session...' : 'Sign In to Vault'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>

              <div className={`mt-6 pt-5 text-center border-t text-xs ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  New student in the lab?{' '}
                </span>
                <Link
                  to="/signup"
                  className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Create your free vault &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
