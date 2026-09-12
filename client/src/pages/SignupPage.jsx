import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, Lock, User, ArrowRight, Check, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RecoveryCodesModal from '../components/modals/RecoveryCodesModal';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

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
        // Show modal with the 5 one-time recovery codes
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Recovery Codes Presentation Modal */}
      {recoveryCodes && (
        <RecoveryCodesModal
          codes={recoveryCodes}
          onClose={handleModalClose}
        />
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white">
              <Cloud className="w-6 h-6" />
            </div>
          </Link>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Create Your CloudVault
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          500 MiB free academic storage. No email, phone, or OAuth needed.
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="3–30 chars (letters, numbers, _)"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Allowed: letters, numbers, underscores, hyphens (no spaces)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
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
                  placeholder="At least 8 characters (12+ encouraged)"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  placeholder="Re-enter password"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2 text-[11px] text-slate-600">
              <Shield className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span>
                Upon account creation, you will receive <strong>5 cryptographic recovery codes</strong> to save.
              </span>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-600/20 transition-all"
              >
                {submitting ? 'Creating Vault...' : 'Create Account & Get Codes'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
