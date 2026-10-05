import React, { useState, useEffect } from 'react';
import { Edit2, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/useTheme';

export default function RenameModal({ file, isOpen, onClose, onRenamed }) {
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();
  const { isDark, isXP } = useTheme();

  useEffect(() => {
    if (file) {
      setNewName(file.originalName);
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSaving(true);
    try {
      const res = await api.patch(`/files/${file._id}`, { newName: newName.trim() });
      if (res.success) {
        success(`Renamed file to "${res.data.file.originalName}"`);
        onRenamed(res.data.file);
        onClose();
      }
    } catch (err) {
      toastError(err.message || 'Failed to rename file');
    } finally {
      setSaving(false);
    }
  };

  if (isXP) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
        <div 
          role="dialog"
          aria-modal="true"
          className="xp-window-dialog w-full max-w-sm select-none animate-scale-in"
        >
          <div className="xp-titlebar">
            <div className="xp-titlebar-text">
              <span>Rename File</span>
            </div>
            <div className="xp-window-controls">
              <button
                type="button"
                onClick={onClose}
                className="xp-btn-control xp-btn-close"
              >
                ✕
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-4 bg-[#ece9d8] text-[11px] text-slate-900 space-y-3">
              <label className="block text-slate-700">
                Enter new filename:
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                autoFocus
                className="xp-input w-full bg-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 p-3 bg-[#ece9d8] border-t border-slate-300">
              <button
                type="submit"
                disabled={saving || !newName.trim() || newName === file.originalName}
                className="xp-btn xp-btn-primary min-w-[70px]"
              >
                {saving ? 'Saving...' : 'OK'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="xp-btn min-w-[70px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className={`rounded-3xl shadow-2xl max-w-md w-full p-6 border transition-all animate-scale-in backdrop-blur-2xl ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200 shadow-slate-300/50'
      }`}>
        <div className={`flex items-center justify-between pb-3 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl ${
              isDark ? 'bg-brand-500/20 text-brand-400' : 'bg-brand-50 text-brand-600 border border-brand-200'
            }`}>
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Rename File</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Update file title in your vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className={`p-1.5 rounded-xl ${
              isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <label className={`block text-xs font-semibold mb-1.5 ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Filename
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            autoFocus
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none transition-all ${
              isDark 
                ? 'bg-slate-800/90 border border-slate-700 text-white focus:ring-2 focus:ring-brand-500/50' 
                : 'bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 focus:ring-4 focus:ring-brand-500/15 shadow-sm'
            }`}
          />

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors ${
                isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !newName.trim() || newName === file.originalName}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition-all active:translate-y-0.5"
            >
              {saving ? 'Saving...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
