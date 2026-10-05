import React from 'react';
import { ShieldAlert, Trash2, LogOut, X, CheckCircle2 } from 'lucide-react';

export default function LabHygieneModal({ isOpen, onClose, onConfirmLogout }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200/80 dark:border-slate-800 transition-colors animate-scale-in">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Public Lab Computer Check</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Leaving this workstation?</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Your CloudVault session will be terminated immediately and all authentication cookies purged from this computer.
          </p>

          <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 rounded-2xl space-y-2 text-xs text-amber-950 dark:text-amber-200">
            <div className="font-semibold text-amber-900 dark:text-amber-300">Before leaving this public PC:</div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>Did you download coursework files to this PC? Delete them from the <strong>Downloads</strong> folder.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>Empty the Windows <strong>Recycle Bin</strong>.</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmLogout}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
