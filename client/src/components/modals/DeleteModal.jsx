import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/useTheme';
import { formatBytes } from '../../utils/formatters';

export default function DeleteModal({ file, isOpen, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const { updateStorage } = useAuth();
  const { success, error: toastError } = useToast();
  const { isDark, isXP } = useTheme();

  if (!isOpen || !file) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await api.delete(`/files/${file._id}`);
      if (res.success) {
        success(`"${file.originalName}" permanently deleted`);
        updateStorage(res.data.storageUsed, res.data.storageLimit);
        onDeleted(file._id);
        onClose();
      }
    } catch (err) {
      toastError(err.message || 'Failed to delete file');
    } finally {
      setDeleting(false);
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
              <span>Confirm File Delete</span>
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

          <div className="p-4 bg-[#ece9d8] text-[11px] text-slate-900 flex items-start gap-3">
            <div className="text-2xl mt-0.5">⚠️</div>
            <div className="space-y-2">
              <p>
                Are you sure you want to permanently delete <strong>"{file.originalName}"</strong> ({formatBytes(file.size)})?
              </p>
              <p className="text-[10px] text-slate-600">
                This will remove the file from cloud storage and reclaim your academic quota immediately.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-3 bg-[#ece9d8] border-t border-slate-300">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="xp-btn xp-btn-primary min-w-[70px]"
            >
              {deleting ? 'Deleting...' : 'Yes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="xp-btn min-w-[70px]"
            >
              No
            </button>
          </div>
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
              isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Delete File?</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Permanent action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className={`p-1.5 rounded-xl ${
              isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Are you sure you want to permanently delete{' '}
            <strong className={`break-all font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>"{file.originalName}"</strong>{' '}
            ({formatBytes(file.size)})?
          </p>
          <div className={`mt-3 p-3 rounded-xl text-xs border ${
            isDark ? 'bg-rose-950/40 border-rose-900/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            This file will be permanently removed from cloud storage. Your storage quota will be reclaimed immediately.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors ${
              isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 active:translate-y-0.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
