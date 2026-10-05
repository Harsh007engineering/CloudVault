import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '', compact = false }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center p-1 rounded-full bg-slate-200/70 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700 text-xs font-medium transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-500/40 select-none ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle color theme"
    >
      {/* Light Option */}
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-200 ${
          !isDark
            ? 'bg-white text-slate-900 shadow-sm font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500 fill-amber-500/20' : 'text-slate-400'}`} />
        {!compact && <span className="text-[11px]">Light</span>}
      </span>

      {/* Dark Option */}
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-200 ${
          isDark
            ? 'bg-slate-900 text-white shadow-sm font-semibold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400 fill-cyan-400/20' : 'text-slate-400'}`} />
        {!compact && <span className="text-[11px]">Dark</span>}
      </span>
    </button>
  );
}
