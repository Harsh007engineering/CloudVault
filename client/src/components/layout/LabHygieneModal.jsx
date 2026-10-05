import React from 'react';
import { ShieldAlert, Trash2, LogOut, X, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

export default function LabHygieneModal({ isOpen, onClose, onConfirmLogout }) {
  const { isDark } = useTheme();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className={`rounded-3xl shadow-2xl max-w-md w-full p-6 border transition-all animate-scale-in backdrop-blur-2xl ${
        isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200 shadow-slate-300/50'
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
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Public Lab Computer Check</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Leaving this workstation?</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Your CloudVault session will be terminated immediately and all authentication cookies purged from this computer.
          </p>

          <div className={`p-3.5 rounded-2xl space-y-2 text-xs border ${
            isDark ? 'bg-amber-950/30 border-amber-900/60 text-amber-200' : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <div className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>Before leaving this public PC:</div>
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
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors ${
              isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmLogout}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/20 transition-all active:translate-y-0.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
