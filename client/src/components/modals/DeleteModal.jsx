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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete File?</h3>
              <p className="text-xs text-slate-500">Permanent action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900 break-all font-semibold">"{file.originalName}"</strong>{' '}
            ({formatBytes(file.size)})?
          </p>
          <div className="mt-3 p-3 bg-rose-50/70 border border-rose-200/60 rounded-xl text-xs text-rose-700">
            This file will be permanently removed from cloud storage. This action cannot be undone.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
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
