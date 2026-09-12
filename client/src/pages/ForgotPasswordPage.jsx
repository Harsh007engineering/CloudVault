import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, KeyRound, Lock, User, ArrowRight, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white">
              <Cloud className="w-6 h-6" />
            </div>
          </Link>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Reset Password
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Use one of your 5 one-time recovery codes to restore account access
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80 sm:px-10">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Progress Indicator */}
          {step < 4 && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 text-xs">
              <span className={step >= 1 ? 'font-bold text-brand-600' : 'text-slate-400'}>1. Username</span>
              <span className="text-slate-300">&rarr;</span>
              <span className={step >= 2 ? 'font-bold text-brand-600' : 'text-slate-400'}>2. Recovery Code</span>
              <span className="text-slate-300">&rarr;</span>
              <span className={step >= 3 ? 'font-bold text-brand-600' : 'text-slate-400'}>3. New Password</span>
            </div>
          )}

          {/* Step 1: Username */}
          {step === 1 && (
            <form className="space-y-4" onSubmit={handleUsernameSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    placeholder="e.g. harsh123"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !username.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-600/20 transition-all"
              >
                {submitting ? 'Checking...' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 2: Recovery Code */}
          {step === 2 && (
            <form className="space-y-4" onSubmit={handleCodeSubmit}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Recovery Code for <span className="text-brand-600">{username}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 underline"
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
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm font-mono tracking-wider bg-slate-50/50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 uppercase"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Any unused code from your set of 5 will work.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting || !recoveryCode.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-600/20 transition-all"
              >
                {submitting ? 'Verifying...' : 'Verify Recovery Code'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form className="space-y-4" onSubmit={handlePasswordReset}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-600/20 transition-all"
              >
                {submitting ? 'Resetting Password...' : 'Reset Password & Proceed'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Password Reset Complete</h3>
              <p className="text-xs text-slate-600">
                Your password has been successfully updated and the used recovery code has been invalidated.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md transition-all"
              >
                Sign In With New Password
              </Link>
            </div>
          )}

          {/* Lost Recovery Codes Callout */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700">Lost your recovery codes?</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Contact your university lab administrator. An administrator can issue a secure temporary password.
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
