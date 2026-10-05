import React, { useState } from 'react';
import { Shield, KeyRound, Lock, HardDrive, User, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import LabReminderBanner from '../components/layout/LabReminderBanner';
import RecoveryCodesModal from '../components/modals/RecoveryCodesModal';
import AmbientBackground from '../components/common/AmbientBackground';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/useTheme';
import { formatBytes, formatDate } from '../utils/formatters';

export default function SettingsPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const { isDark } = useTheme();

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Recovery code regeneration state
  const [regenPassword, setRegenPassword] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [newCodes, setNewCodes] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toastError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      if (res.success) {
        success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toastError(err.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRegenerateCodes = async (e) => {
    e.preventDefault();
    if (!regenPassword) return;

    setRegenerating(true);
    try {
      const res = await api.post('/auth/regenerate-recovery-codes', {
        currentPassword: regenPassword
      });
      if (res.success && res.data?.recoveryCodes) {
        setNewCodes(res.data.recoveryCodes);
        setShowRegenConfirm(false);
        setRegenPassword('');
        success('5 new recovery codes generated');
      }
    } catch (err) {
      toastError(err.message || 'Failed to regenerate recovery codes');
    } finally {
      setRegenerating(false);
    }
  };

  const percentUsed = user?.storageLimit 
    ? Math.min(100, Math.round((user.storageUsed / user.storageLimit) * 100)) 
    : 0;

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } flex flex-col transition-colors relative selection:bg-brand-500 selection:text-white`}>
      <AmbientBackground isDark={isDark} />
      <LabReminderBanner />
      <Navbar />

      {/* Recovery Codes Presentation Modal when regenerated */}
      {newCodes && (
        <RecoveryCodesModal
          codes={newCodes}
          onClose={() => setNewCodes(null)}
          isRegeneration={true}
        />
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
        <h1 className={`text-2xl font-extrabold tracking-tight mb-2 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Account &amp; Security Settings
        </h1>
        <p className={`text-xs mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Manage your student credentials, recovery codes, and quota details
        </p>

        <div className="space-y-6">
          {/* Account Overview Card */}
          <div className={`rounded-3xl p-6 backdrop-blur-xl border transition-all ${
            isDark 
              ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/40 ring-1 ring-white/5' 
              : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5'
          }`}>
            <div className={`flex items-center gap-3 pb-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className={`p-2.5 rounded-2xl ${
                isDark ? 'bg-brand-500/20 text-brand-400' : 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm'
              }`}>
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Student Profile</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Identifier and membership status</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50/80 border-slate-200/80 shadow-sm'
              }`}>
                <span className={`block font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Username</span>
                <span className={`text-sm font-bold mt-0.5 block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{user?.username}</span>
              </div>
              <div className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50/80 border-slate-200/80 shadow-sm'
              }`}>
                <span className={`block font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Role</span>
                <span className={`text-sm font-bold mt-0.5 block capitalize ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{user?.role}</span>
              </div>
              <div className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50/80 border-slate-200/80 shadow-sm'
              }`}>
                <span className={`block font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Registered Since</span>
                <span className={`text-sm font-bold mt-0.5 block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Storage Information Card */}
          <div className={`rounded-3xl p-6 backdrop-blur-xl border transition-all ${
            isDark 
              ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/40 ring-1 ring-white/5' 
              : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5'
          }`}>
            <div className={`flex items-center gap-3 pb-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className={`p-2.5 rounded-2xl ${
                isDark ? 'bg-brand-500/20 text-brand-400' : 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm'
              }`}>
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Storage Information</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Logical academic cloud quota</p>
              </div>
            </div>

            <div className="mt-4">
              <div className={`flex justify-between text-xs font-semibold mb-2 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <span>{formatBytes(user?.storageUsed || 0)} used</span>
                <span>{formatBytes(user?.storageLimit || 524288000)} total limit</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
                isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-slate-100 border-slate-200/90'
              }`}>
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(percentUsed, 1)}%` }}
                />
              </div>
              <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {formatBytes(Math.max(0, (user?.storageLimit || 524288000) - (user?.storageUsed || 0)))} remaining. Need a higher quota for coursework? Request your lab administrator.
              </p>
            </div>
          </div>

          {/* Change Password Card */}
          <div className={`rounded-3xl p-6 backdrop-blur-xl border transition-all ${
            isDark 
              ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/40 ring-1 ring-white/5' 
              : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5'
          }`}>
            <div className={`flex items-center gap-3 pb-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className={`p-2.5 rounded-2xl ${
                isDark ? 'bg-brand-500/20 text-brand-400' : 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm'
              }`}>
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Change Password</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Update your vault access password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4 max-w-md">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl transition-all focus:outline-none ${
                    isDark 
                      ? 'bg-slate-800/90 border border-slate-700 text-white focus:ring-2 focus:ring-brand-500/50' 
                      : 'bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 focus:ring-4 focus:ring-brand-500/15 shadow-sm'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  New Password (8+ characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl transition-all focus:outline-none ${
                    isDark 
                      ? 'bg-slate-800/90 border border-slate-700 text-white focus:ring-2 focus:ring-brand-500/50' 
                      : 'bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 focus:ring-4 focus:ring-brand-500/15 shadow-sm'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl transition-all focus:outline-none ${
                    isDark 
                      ? 'bg-slate-800/90 border border-slate-700 text-white focus:ring-2 focus:ring-brand-500/50' 
                      : 'bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 focus:ring-4 focus:ring-brand-500/15 shadow-sm'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-brand-600/20 transition-all active:translate-y-0.5"
              >
                {changingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Recovery Codes Card */}
          <div className={`rounded-3xl p-6 backdrop-blur-xl border transition-all ${
            isDark 
              ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/40 ring-1 ring-white/5' 
              : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5'
          }`}>
            <div className={`flex items-center gap-3 pb-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className={`p-2.5 rounded-2xl ${
                isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600 border border-amber-200 shadow-sm'
              }`}>
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Recovery Codes</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Single-use emergency password reset credentials</p>
              </div>
            </div>

            <div className="mt-4">
              <p className={`text-xs leading-relaxed max-w-xl ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                If you have used your previous recovery codes or suspect they were compromised, you can generate 5 new codes.
                Generating new codes will <strong>immediately invalidate all existing codes</strong>.
              </p>

              {!showRegenConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowRegenConfirm(true)}
                  className={`mt-4 px-4 py-2.5 border rounded-xl text-xs font-semibold transition-all ${
                    isDark 
                      ? 'border-slate-700 text-slate-200 hover:bg-slate-800' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
                  }`}
                >
                  Generate New Recovery Codes
                </button>
              ) : (
                <form onSubmit={handleRegenerateCodes} className={`mt-4 p-4 rounded-2xl max-w-md border ${
                  isDark ? 'bg-amber-950/30 border-amber-900/60' : 'bg-amber-50/80 border-amber-200 shadow-sm'
                }`}>
                  <div className={`flex items-start gap-2.5 text-xs mb-3 ${
                    isDark ? 'text-amber-200' : 'text-amber-900'
                  }`}>
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Enter your current password to invalidate old codes and generate 5 new codes:
                    </span>
                  </div>

                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={regenPassword}
                    onChange={(e) => setRegenPassword(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl focus:outline-none mb-3 ${
                      isDark 
                        ? 'bg-slate-900 border border-amber-800 text-white focus:ring-2 focus:ring-amber-500' 
                        : 'bg-white border border-amber-300 text-slate-900 focus:ring-4 focus:ring-amber-500/20 shadow-sm'
                    }`}
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={regenerating || !regenPassword}
                      className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors"
                    >
                      {regenerating ? 'Generating...' : 'Confirm & Generate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRegenConfirm(false)}
                      className={`text-xs font-medium px-3 py-2 rounded-xl transition-colors ${
                        isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200/60'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
