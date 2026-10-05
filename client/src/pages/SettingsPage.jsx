import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import XPTitleBar from '../components/xp/XPTitleBar';
import { XPComputerIcon, XPHardDriveIcon, XPShieldIcon, XPKeyIcon } from '../components/xp/XPIcons';
import ThemeToggle from '../components/common/ThemeToggle';

export default function SettingsPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const { isDark, isXP, theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [xpTab, setXpTab] = useState('general');

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

  // Windows XP Professional System Properties Dialog
  if (isXP) {
    return (
      <div className="min-h-screen bg-[#004e98] flex flex-col justify-center items-center p-4 relative font-sans select-none">
        {/* Recovery Codes Presentation Modal */}
        {newCodes && (
          <RecoveryCodesModal
            codes={newCodes}
            onClose={() => setNewCodes(null)}
            isRegeneration={true}
          />
        )}

        {/* Top right theme toggle */}
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        <div className="xp-window-dialog w-full max-w-lg select-none animate-scale-in">
          {/* XP Titlebar */}
          <XPTitleBar
            title="System Properties - CloudVault Professional"
            icon={XPComputerIcon}
            onClose={() => navigate('/dashboard')}
          />

          {/* XP Tab Header */}
          <div className="xp-tabs-header pt-2 px-2 bg-[#ece9d8]">
            <button
              type="button"
              onClick={() => setXpTab('general')}
              className={`xp-tab ${xpTab === 'general' ? 'active' : ''}`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setXpTab('appearance')}
              className={`xp-tab ${xpTab === 'appearance' ? 'active' : ''}`}
            >
              Appearance
            </button>
            <button
              type="button"
              onClick={() => setXpTab('security')}
              className={`xp-tab ${xpTab === 'security' ? 'active' : ''}`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setXpTab('recovery')}
              className={`xp-tab ${xpTab === 'recovery' ? 'active' : ''}`}
            >
              Recovery Codes
            </button>
            <button
              type="button"
              onClick={() => setXpTab('storage')}
              className={`xp-tab ${xpTab === 'storage' ? 'active' : ''}`}
            >
              Storage
            </button>
          </div>

          {/* XP Tab Body */}
          <div className="p-4 bg-[#ece9d8] border-t border-white text-[11px] text-slate-900 min-h-[310px]">
            {/* 1. GENERAL TAB */}
            {xpTab === 'general' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-300">
                  <XPComputerIcon className="w-10 h-10 shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-blue-950">CloudVault Professional</div>
                    <div className="text-[10px] text-slate-600">Academic University Edition</div>
                    <div className="text-[10px] text-slate-600">Service Pack 2 (Build 2600.academic)</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-800">Student Identity:</div>
                  <div className="bg-white border border-[#7f9db9] p-3 space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Username:</span>
                      <span className="font-bold text-blue-900">{user?.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Role:</span>
                      <span className="capitalize">{user?.role || 'student'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Registered:</span>
                      <span>{formatDate(user?.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Storage Quota:</span>
                      <span>{formatBytes(user?.storageLimit || 524288000)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-[10px]">
                  🛡️ <strong>Laboratory Safe Mode:</strong> No persistent login tokens are retained in browser cache.
                </div>
              </div>
            )}

            {/* 2. APPEARANCE TAB */}
            {xpTab === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <div className="font-bold text-slate-800 mb-1">Select Desktop Theme &amp; Color Scheme:</div>
                  <p className="text-[10px] text-slate-600 mb-3">
                    Switching between modern SaaS and nostalgic Windows XP Professional takes effect instantly.
                  </p>
                </div>

                <div className="bg-white border border-[#7f9db9] p-3 space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-[#e8f0fe] rounded">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === 'light'}
                      onChange={() => setTheme('light')}
                      className="accent-blue-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900">☀ Windows Light Mode</span>
                      <span className="block text-[10px] text-slate-500">Clean, crisp modern light interface</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-[#e8f0fe] rounded">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === 'dark'}
                      onChange={() => setTheme('dark')}
                      className="accent-blue-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900">🌙 CloudVault Dark Mode (Campus Night)</span>
                      <span className="block text-[10px] text-slate-500">Deep obsidian and navy developer theme</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-[#e8f0fe] rounded">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === 'xp'}
                      onChange={() => setTheme('xp')}
                      className="accent-blue-600"
                    />
                    <div>
                      <span className="font-bold text-blue-900">🪟 Windows XP Professional (Luna Blue)</span>
                      <span className="block text-[10px] text-slate-500">Authentic Luna blue title bars, bevels, and Explorer interface</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* 3. PASSWORD TAB */}
            {xpTab === 'security' && (
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div className="font-bold text-slate-800">Change Account Password:</div>
                
                <div className="space-y-2 max-w-sm">
                  <div>
                    <label className="block text-slate-700 mb-0.5">Current Password:</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="xp-input w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-0.5">New Password (8+ chars):</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="xp-input w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-0.5">Confirm New Password:</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="xp-input w-full text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="xp-btn xp-btn-primary mt-2"
                  >
                    {changingPassword ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}

            {/* 4. RECOVERY CODES TAB */}
            {xpTab === 'recovery' && (
              <div className="space-y-3">
                <div className="font-bold text-slate-800">Single-Use Cryptographic Recovery Codes:</div>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Because CloudVault collects no email addresses, your recovery codes are your emergency key.
                  Generating new codes will <strong>immediately invalidate all previously issued codes</strong>.
                </p>

                {!showRegenConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowRegenConfirm(true)}
                    className="xp-btn"
                  >
                    Generate 5 New Recovery Codes...
                  </button>
                ) : (
                  <form onSubmit={handleRegenerateCodes} className="bg-white border border-[#7f9db9] p-3 space-y-2 max-w-sm">
                    <div className="text-[10px] text-amber-900 font-bold">
                      Enter current password to confirm regeneration:
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Current password"
                      value={regenPassword}
                      onChange={(e) => setRegenPassword(e.target.value)}
                      className="xp-input w-full text-xs"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={regenerating || !regenPassword}
                        className="xp-btn xp-btn-primary"
                      >
                        {regenerating ? 'Generating...' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRegenConfirm(false)}
                        className="xp-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* 5. STORAGE TAB */}
            {xpTab === 'storage' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-300">
                  <XPHardDriveIcon className="w-10 h-10 shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-blue-950">Local Cloud Drive (C:)</div>
                    <div className="text-[10px] text-slate-600">Type: Cloudflare R2 Virtual Drive</div>
                    <div className="text-[10px] text-slate-600">File System: CloudVault Object Store</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700">Used Space:</span>
                    <span className="font-mono font-bold">{formatBytes(user?.storageUsed || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700">Free Space:</span>
                    <span className="font-mono">{formatBytes(Math.max(0, (user?.storageLimit || 524288000) - (user?.storageUsed || 0)))}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-slate-300 pt-1 font-bold">
                    <span>Capacity:</span>
                    <span className="font-mono">{formatBytes(user?.storageLimit || 524288000)}</span>
                  </div>

                  <div className="pt-2">
                    <div className="xp-progress-track">
                      <div 
                        className="xp-progress-fill"
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-600 mt-1 font-bold">
                      {percentUsed}% Quota Utilized
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-2 p-3 bg-[#ece9d8] border-t border-slate-300">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="xp-btn xp-btn-primary min-w-[75px]"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="xp-btn min-w-[75px]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled
              className="xp-btn min-w-[75px] opacity-60"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  }

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
