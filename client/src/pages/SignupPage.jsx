import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, Lock, User, ArrowRight, Check, AlertCircle, Shield, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';
import RecoveryCodesModal from '../components/modals/RecoveryCodesModal';
import ThemeToggle from '../components/common/ThemeToggle';
import AmbientBackground from '../components/common/AmbientBackground';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const { signup } = useAuth();
  const { isDark, isXP } = useTheme();
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

  // Windows XP Professional Account Setup Wizard
  if (isXP) {
    return (
      <div className="min-h-screen bg-[#004e98] flex flex-col justify-center items-center p-4 relative font-sans select-none">
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

        <div className="xp-window-dialog w-full max-w-xl animate-scale-in">
          {/* XP Titlebar */}
          <div className="xp-titlebar">
            <div className="xp-titlebar-text">
              <span className="text-sm">⚙️</span>
              <span>CloudVault Account Setup Wizard</span>
            </div>
            <div className="xp-window-controls">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="xp-btn-control xp-btn-close"
                title="Cancel"
              >
                ✕
              </button>
            </div>
          </div>

          {/* XP Wizard Body: Left Sidebar + Right Form */}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row min-h-[360px] bg-[#ece9d8]">
              {/* Left Wizard Banner */}
              <div className="sm:w-44 bg-gradient-to-b from-[#003c74] via-[#165096] to-[#002850] p-4 text-white flex flex-col justify-between border-r border-[#0a2f85]">
                <div>
                  <div className="text-3xl mb-3">☁️</div>
                  <div className="text-sm font-bold leading-tight">Welcome to the CloudVault Setup Wizard</div>
                  <div className="text-[10px] text-blue-200 mt-2">
                    Create your private academic cloud storage for university computer labs.
                  </div>
                </div>

                <div className="text-[9px] text-blue-300 border-t border-blue-800 pt-2">
                  500 MiB Academic Tier
                </div>
              </div>

              {/* Right Wizard Content */}
              <div className="flex-1 p-5 text-[11px] text-slate-900 space-y-3">
                <div className="border-b border-slate-300 pb-2">
                  <div className="font-bold text-sm text-blue-950">Student Account Credentials</div>
                  <div className="text-[10px] text-slate-600">
                    No email address or phone number is required. Your privacy is guaranteed.
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2 bg-red-100 border border-red-500 text-red-900 text-[11px] flex items-center gap-1.5">
                    <span>❌</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-2.5">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      <u>U</u>sername (3–30 characters):
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. harsh_cs2026"
                      className="xp-input w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      <u>P</u>assword (minimum 8 characters):
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="xp-input w-full text-xs"
                    />
                    {password && (
                      <div className="mt-1 flex items-center gap-2 text-[10px]">
                        <span className="text-slate-600">Strength:</span>
                        <span className="font-bold text-blue-900">{strength.label}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      <u>C</u>onfirm Password:
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="xp-input w-full text-xs"
                    />
                  </div>
                </div>

                <div className="p-2 bg-white border border-[#7f9db9] text-[10px] text-slate-700 flex items-start gap-2">
                  <span>🔑</span>
                  <div>
                    <strong>Emergency Recovery:</strong> You will be issued 5 cryptographic recovery codes upon completing this wizard. Keep them safe.
                  </div>
                </div>
              </div>
            </div>

            {/* XP Wizard Button Row */}
            <div className="flex items-center justify-between p-3 bg-[#ece9d8] border-t border-slate-300">
              <Link
                to="/login"
                className="text-blue-800 hover:underline text-[11px]"
              >
                Already have an account? Log on
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="xp-btn min-w-[75px]"
                >
                  &lt; Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="xp-btn xp-btn-primary min-w-[85px]"
                >
                  {submitting ? 'Creating...' : 'Next &gt;'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="xp-btn min-w-[75px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors selection:bg-brand-500 selection:text-white`}>
      {/* Ambient Lighting & Mesh Canvas */}
      <AmbientBackground isDark={isDark} />

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

        <div className="mt-3 flex items-center justify-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-sm ${
            isDark 
              ? 'bg-brand-950/60 text-brand-300 border-brand-800/60' 
              : 'bg-brand-50 text-brand-700 border-brand-200 shadow-sm'
          }`}>
            Campus Edition
          </span>
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            &bull; Safe for Shared Lab PCs
          </span>
        </div>

        <h2 className={`mt-2 text-center text-2xl sm:text-3xl font-extrabold tracking-tight ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Create your CloudVault
        </h2>
        <p className={`mt-1 text-center text-xs ${
          isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
        }`}>
          500 MiB private academic storage &bull; No email &bull; No phone &bull; No OAuth
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className={`py-8 px-6 sm:px-10 rounded-3xl border backdrop-blur-2xl transition-all ${
          isDark 
            ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/50 ring-1 ring-white/5' 
            : 'bg-white/90 border-slate-200/90 shadow-2xl shadow-indigo-500/5 ring-1 ring-slate-900/5'
        }`}>
          {/* Recovery Code Explainer Banner Before Signup */}
          <div className={`mb-5 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs border ${
            isDark 
              ? 'bg-brand-950/40 border-brand-800/60 text-brand-200' 
              : 'bg-brand-50 border-brand-200 text-brand-800'
          }`}>
            <KeyRound className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold block mb-0.5">Your recovery codes are your backup key.</span>
              Because CloudVault requires no email, you will be given 5 cryptographic recovery codes immediately after signup.
            </div>
          </div>

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
                  className={`block w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${
                    isDark 
                      ? 'bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50' 
                      : 'bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300/90 text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 shadow-sm'
                  }`}
                />
              </div>
              <span className={`text-[11px] mt-1 block ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                3–30 characters (letters, numbers, underscore, hyphen)
              </span>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
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
                  className={`block w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${
                    isDark 
                      ? 'bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50' 
                      : 'bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300/90 text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 shadow-sm'
                  }`}
                />
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${
                    isDark ? 'bg-slate-800' : 'bg-slate-200'
                  }`}>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Password Strength</span>
                    <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{strength.label}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
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
                  className={`block w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${
                    isDark 
                      ? 'bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50' 
                      : 'bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300/90 text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 shadow-sm'
                  }`}
                />
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs border ${
              isDark 
                ? 'bg-brand-950/40 border-brand-800/60 text-brand-200' 
                : 'bg-gradient-to-r from-brand-50 to-indigo-50 border-brand-200 text-brand-900 shadow-sm'
            }`}>
              <KeyRound className={`w-4 h-4 shrink-0 mt-0.5 ${
                isDark ? 'text-brand-400' : 'text-brand-600'
              }`} />
              <span className="leading-relaxed">
                You will receive <strong>5 cryptographic recovery codes</strong> upon registration. Save them safely!
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-brand-600/25 hover:shadow-brand-500/35 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:translate-y-0.5"
            >
              <span>{submitting ? 'Generating Vault & Codes...' : 'Create Account & Get Codes'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className={`mt-6 pt-5 border-t text-center ${
            isDark ? 'border-slate-800' : 'border-slate-200/80'
          }`}>
            <p className={`text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-brand-600 hover:text-brand-500 hover:underline"
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
