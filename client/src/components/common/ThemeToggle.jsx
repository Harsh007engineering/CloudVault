import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

export default function ThemeToggle({ className = '', compact = false }) {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full text-xs font-medium shadow-sm transition-all select-none ${
        isDark 
          ? 'bg-slate-900/90 border border-slate-800 text-slate-300' 
          : 'bg-slate-200/90 border border-slate-300/90 text-slate-700'
      } ${className}`}
      role="group"
      aria-label="Theme switcher"
    >
      {/* Light Option Button */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 focus:outline-none ${
          !isDark
            ? 'bg-white text-slate-900 shadow-sm font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
        title="Switch to Light Theme"
      >
        <Sun className={`w-3.5 h-3.5 transition-colors ${!isDark ? 'text-amber-500 fill-amber-500/20' : 'text-slate-400'}`} />
        {!compact && <span className="text-[11px]">Light</span>}
      </button>

      {/* Dark Option Button */}
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 focus:outline-none ${
          isDark
            ? 'bg-slate-950 text-white shadow-sm font-bold border border-slate-800'
            : 'text-slate-600 hover:text-slate-950'
        }`}
        title="Switch to Dark Theme"
      >
        <Moon className={`w-3.5 h-3.5 transition-colors ${isDark ? 'text-cyan-400 fill-cyan-400/20' : 'text-slate-500'}`} />
        {!compact && <span className="text-[11px]">Dark</span>}
      </button>
    </div>
  );
}
