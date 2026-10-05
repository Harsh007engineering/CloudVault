import React, { useState } from 'react';
import { Shield, KeyRound, Lock, HardDrive, User, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import LabReminderBanner from '../components/layout/LabReminderBanner';
import RecoveryCodesModal from '../components/modals/RecoveryCodesModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatBytes, formatDate } from '../utils/formatters';

export default function SettingsPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Account &amp; Security Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-8">
          Manage your student credentials, recovery codes, and quota details
        </p>

        <div className="space-y-6">
          {/* Account Overview Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-2xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Profile</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Identifier and membership status</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Username</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{user?.username}</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Role</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block capitalize">{user?.role}</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Registered Since</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Storage Information Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-2xl">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Storage Information</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Logical academic cloud quota</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>{formatBytes(user?.storageUsed || 0)} used</span>
                <span>{formatBytes(user?.storageLimit || 524288000)} total limit</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(percentUsed, 1)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {formatBytes(Math.max(0, (user?.storageLimit || 524288000) - (user?.storageUsed || 0)))} remaining. Need a higher quota for coursework? Request your lab administrator.
              </p>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-2xl">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Password</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update your vault access password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password (8+ characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-brand-600/20 transition-all"
              >
                {changingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Recovery Codes Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recovery Codes</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Single-use emergency password reset credentials</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                If you have used your previous recovery codes or suspect they were compromised, you can generate 5 new codes.
                Generating new codes will <strong>immediately invalidate all existing codes</strong>.
              </p>

              {!showRegenConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowRegenConfirm(true)}
                  className="mt-4 px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
                >
                  Generate New Recovery Codes
                </button>
              ) : (
                <form onSubmit={handleRegenerateCodes} className="mt-4 p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl max-w-md">
                  <div className="flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
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
                    className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3"
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
                      className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 px-3 py-2 rounded-xl transition-colors"
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
