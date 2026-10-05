import React, { useState, useEffect } from 'react';
import { Edit2, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function RenameModal({ file, isOpen, onClose, onRenamed }) {
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200/80 dark:border-slate-800 transition-colors animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-2xl">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Rename File</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update file title in your vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Filename
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            autoFocus
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
          />

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !newName.trim() || newName === file.originalName}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition-all"
            >
              {saving ? 'Saving...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
