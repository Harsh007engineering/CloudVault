import React, { useState } from 'react';
import { Shield, X } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

export default function LabReminderBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { isDark, isXP } = useTheme();

  if (dismissed) return null;

  if (isXP) {
    return (
      <div className="bg-[#ffffe1] border-b border-[#808080] px-3 py-1 text-[11px] font-sans text-black flex items-center justify-between shadow-sm relative z-40 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs">🛡️</span>
          <span>
            <strong>Security Notice:</strong> Remember to log off when finished. CloudVault uses HTTP-only session cookies and does not cache files on this computer.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="xp-button px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:text-black ml-2"
          title="Dismiss reminder"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className={`border-b px-4 py-2 text-xs font-medium flex items-center justify-between transition-all backdrop-blur-md relative z-40 ${
      isDark 
        ? 'bg-amber-950/40 border-amber-900/60 text-amber-200' 
        : 'bg-amber-500/10 border-amber-200/80 text-amber-900'
    }`}>
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 flex-1 text-center">
        <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>
          <strong>Shared Lab PC Notice:</strong> Remember to log out when finished. No personal credentials or tokens are saved on this computer.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className={`p-1 rounded-md transition-colors ${
          isDark 
            ? 'text-amber-300 hover:text-white hover:bg-amber-500/20' 
            : 'text-amber-700 hover:text-amber-950 hover:bg-amber-500/20'
        }`}
        title="Dismiss reminder"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
