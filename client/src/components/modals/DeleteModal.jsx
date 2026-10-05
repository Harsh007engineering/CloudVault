import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatBytes } from '../../utils/formatters';

export default function DeleteModal({ file, isOpen, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const { updateStorage } = useAuth();
  const { success, error: toastError } = useToast();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200/80 dark:border-slate-800 transition-colors animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete File?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Permanent action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900 dark:text-white break-all font-semibold">"{file.originalName}"</strong>{' '}
            ({formatBytes(file.size)})?
          </p>
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            This file will be permanently removed from cloud storage. Your storage quota will be reclaimed immediately.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
