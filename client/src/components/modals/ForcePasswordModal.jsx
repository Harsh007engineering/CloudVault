import React, { useState } from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/useTheme';

export default function ForcePasswordModal({ isOpen }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const { refreshUser } = useAuth();
  const { success, error: toastError } = useToast();
  const { isDark, isXP } = useTheme();

  if (!isOpen) return null;

  if (isXP) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in font-sans select-none">
        <div className="xp-window-dialog w-full max-w-sm animate-scale-in">
          {/* XP Titlebar */}
          <div className="xp-titlebar">
            <div className="xp-titlebar-text">
              <span className="text-sm">🔑</span>
              <span>Change Password</span>
            </div>
          </div>

          {/* XP Dialog Header */}
          <div className="p-3 bg-gradient-to-r from-[#003c74] via-[#124b8f] to-[#003c74] text-white flex items-center justify-between border-b border-[#0a2f85]">
            <div>
              <div className="text-sm font-bold">Password Expired</div>
              <div className="text-[10px] text-blue-200">Security requirement</div>
            </div>
            <span className="text-2xl">🔐</span>
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-[#ece9d8] text-[11px] text-slate-900 space-y-3">
            <p className="leading-normal">
              You have logged on with a temporary password. You must enter a new permanent password to access your vault files.
            </p>

            <div className="space-y-2">
              <div>
                <label className="block font-bold mb-1"><u>N</u>ew Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="xp-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1"><u>C</u>onfirm New Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Re-enter password"
                  className="xp-input w-full text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#d4d0c8]">
              <button
                type="submit"
                disabled={saving}
                className="xp-button px-4 py-1.5 font-bold text-xs"
              >
                {saving ? 'Updating...' : 'OK'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toastError('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/auth/change-password', {
        newPassword,
        confirmPassword
      });

      if (res.success) {
        success('Password updated successfully! Welcome to your vault.');
        await refreshUser();
      }
    } catch (err) {
      toastError(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 border transition-all animate-scale-in backdrop-blur-2xl ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200 shadow-slate-300/50'
      }`}>
        <div className={`flex items-center gap-3 pb-3 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className={`p-2.5 rounded-2xl ${
            isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Change Temporary Password</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Security requirement</p>
          </div>
        </div>

        <div className={`mt-4 p-3.5 rounded-2xl border text-xs leading-relaxed ${
          isDark ? 'bg-amber-950/30 border-amber-900/60 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          You have logged in with a temporary password generated by your administrator. You must set a permanent private password to access your vault files.
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none transition-all ${
                isDark 
                  ? 'bg-slate-800/90 border border-slate-700 text-white focus:ring-2 focus:ring-brand-500/50' 
                  : 'bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 focus:ring-4 focus:ring-brand-500/15 shadow-sm'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Re-enter new password"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none transition-all ${
                isDark 
                  ? 'bg-slate-800/90 border border-slate-700 text-white focus:ring-2 focus:ring-brand-500/50' 
                  : 'bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 focus:ring-4 focus:ring-brand-500/15 shadow-sm'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 active:translate-y-0.5"
          >
            <Lock className="w-4 h-4" />
            {saving ? 'Updating Password...' : 'Save & Enter CloudVault'}
          </button>
        </form>
      </div>
    </div>
  );
}
