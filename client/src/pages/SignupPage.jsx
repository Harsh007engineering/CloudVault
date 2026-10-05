import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, Lock, User, ArrowRight, Check, AlertCircle, Shield, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RecoveryCodesModal from '../components/modals/RecoveryCodesModal';
import ThemeToggle from '../components/common/ThemeToggle';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500', width: '33%' };
    if (score <= 4) return { score: 2, label: 'Good', color: 'bg-amber-500', width: '66%' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await signup(username.trim(), password, confirmPassword);
      if (res.recoveryCodes) {
        setRecoveryCodes(res.recoveryCodes);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors">
      {/* Recovery Codes Presentation Modal */}
      {recoveryCodes && (
        <RecoveryCodesModal
          codes={recoveryCodes}
          onClose={handleModalClose}
        />
      )}

      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
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
          Create Your CloudVault
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500 dark:text-slate-400">
          500 MiB free academic storage &bull; No email, phone, or OAuth needed
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
                Choose Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cs_student_2026"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                3–30 characters (letters, numbers, underscore, hyphen)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Set Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Password Strength</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{strength.label}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to confirm"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="p-3 bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/60 rounded-xl flex items-start gap-2.5 text-xs text-brand-900 dark:text-brand-200">
              <KeyRound className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <span>
                You will receive <strong>5 cryptographic recovery codes</strong> upon registration. Save them safely!
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-brand-600/25 hover:shadow-brand-500/35 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span>{submitting ? 'Generating Vault & Codes...' : 'Create Account & Get Codes'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
