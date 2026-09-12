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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Rename File</h3>
              <p className="text-xs text-slate-500">Update file title in your vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Filename</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            autoFocus
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
          />

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !newName.trim() || newName === file.originalName}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition-all"
            >
              {saving ? 'Saving...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
