import React from 'react';
import { ShieldAlert, Trash2, LogOut, X, CheckCircle2 } from 'lucide-react';

export default function LabHygieneModal({ isOpen, onClose, onConfirmLogout }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-scale-in">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Public Lab Computer Check</h3>
            <p className="text-xs text-slate-500">Leaving this workstation?</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Your CloudVault session will be completely terminated and all authentication cookies purged.
          </p>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2 text-xs text-amber-950">
            <div className="font-semibold text-amber-900">Before you leave this public PC:</div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>Did you download coursework files to this PC? Delete them from the <strong>Downloads</strong> folder.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>Empty the Windows <strong>Recycle Bin</strong>.</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
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
