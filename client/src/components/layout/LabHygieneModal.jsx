import React from 'react';
import { ShieldAlert, Trash2, LogOut, X, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

export default function LabHygieneModal({ isOpen, onClose, onConfirmLogout }) {
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
              <span>Log Off CloudVault</span>
            </div>
            <div className="xp-window-controls">
              <button
                type="button"
                onClick={onClose}
                className="xp-btn-control xp-btn-close"
                title="Cancel"
              >
                ✕
              </button>
            </div>
          </div>

          {/* XP Dialog Header */}
          <div className="p-3 bg-gradient-to-r from-[#003c74] via-[#124b8f] to-[#003c74] text-white flex items-center justify-between border-b border-[#0a2f85]">
            <div>
              <div className="text-sm font-bold">Log Off CloudVault</div>
              <div className="text-[10px] text-blue-200">Public Laboratory Workstation Check</div>
            </div>
            <span className="text-2xl">⏻</span>
          </div>

          {/* XP Content */}
          <div className="p-4 bg-[#ece9d8] text-[11px] text-slate-900 space-y-3">
            <p className="leading-normal">
              Your CloudVault session will be terminated immediately and authentication cookies cleared from this browser.
            </p>

            <div className="p-2.5 bg-[#ffffe1] border border-[#d4d0c8] space-y-1.5 text-[10px]">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <span>⚠️</span>
                <span>Before leaving this shared PC:</span>
              </div>
              <div className="pl-3 space-y-1 text-slate-700">
                <div>• Delete downloaded files from <b>Downloads</b></div>
                <div>• Empty the Windows <b>Recycle Bin</b></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#d4d0c8]">
              <button
                type="button"
                onClick={onConfirmLogout}
                className="xp-button px-4 py-1.5 font-bold text-xs text-red-900 hover:bg-red-50 flex items-center gap-1"
              >
                <span>⏻</span>
                <span><u>L</u>og Off</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="xp-button px-4 py-1.5 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
