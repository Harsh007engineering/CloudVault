import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, KeyRound, Lock, User, ArrowRight, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ThemeToggle from '../components/common/ThemeToggle';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Username, 2: Recovery Code, 3: New Password, 4: Done
  const [username, setUsername] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { success } = useToast();
  const navigate = useNavigate();

  // Step 1: Submit Username
  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setErrorMsg('');
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { username: username.trim() });
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to proceed');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify Recovery Code
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!recoveryCode.trim()) return;

    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/verify-recovery-code', {
        username: username.trim(),
        recoveryCode: recoveryCode.trim()
      });
      if (res.success && res.data?.valid) {
        setStep(3);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or already used recovery code');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3: Reset Password
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password', {
        username: username.trim(),
        recoveryCode: recoveryCode.trim(),
        newPassword,
        confirmPassword
      });

      if (res.success) {
        success('Password successfully reset! You can now log in.');
        setStep(4);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/20 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

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
          Reset Password
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500 dark:text-slate-400">
          Restore account access using one of your 5 recovery codes
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="glass-card py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Progress Indicator */}
          {step < 4 && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className={step >= 1 ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-600'}>
                1. Username
              </span>
              <span className="text-slate-300 dark:text-slate-700">&rarr;</span>
              <span className={step >= 2 ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-600'}>
                2. Recovery Code
              </span>
              <span className="text-slate-300 dark:text-slate-700">&rarr;</span>
              <span className={step >= 3 ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-600'}>
                3. New Password
              </span>
            </div>
          )}

          {/* Step 1: Username */}
          {step === 1 && (
            <form className="space-y-4" onSubmit={handleUsernameSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Enter Your Username
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
                    placeholder="e.g. harsh_student"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !username.trim()}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-brand-600/25 hover:shadow-brand-500/35 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span>{submitting ? 'Checking...' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          )}

          {/* Step 2: Recovery Code */}
          {step === 2 && (
            <form className="space-y-4" onSubmit={handleCodeSubmit}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Recovery Code for <span className="text-brand-600 dark:text-brand-400 font-bold">{username}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 underline"
                  >
                    Change user
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                    placeholder="e.g. 8K4P-X92M"
                    className="block w-full pl-10 pr-3.5 py-2.5 font-mono tracking-wider bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 uppercase transition-all"
                  />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Any unused code from your 5 recovery codes will work.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting || !recoveryCode.trim()}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-brand-600/25 hover:shadow-brand-500/35 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span>{submitting ? 'Verifying Code...' : 'Verify Recovery Code'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form className="space-y-4" onSubmit={handlePasswordReset}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password
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
                    placeholder="Confirm new password"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-brand-600/25 hover:shadow-brand-500/35 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{submitting ? 'Resetting Password...' : 'Reset Password & Proceed'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl mx-auto flex items-center justify-center shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Password Reset Complete</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Your password has been successfully updated and the used recovery code has been invalidated.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-600/25 transition-all"
              >
                Sign In With New Password
              </Link>
            </div>
          )}

          {/* Lost Recovery Codes Callout */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Lost your recovery codes?</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Contact your university lab administrator. An administrator can issue a secure temporary password.
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                &larr; Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
