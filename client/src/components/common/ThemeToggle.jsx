import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '', compact = false }) {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 text-xs font-medium shadow-sm transition-all select-none ${className}`}
      role="group"
      aria-label="Theme switcher"
    >
      {/* Light Option Button */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 focus:outline-none ${
          !isDark
            ? 'bg-white text-slate-900 shadow-sm font-semibold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
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
            ? 'bg-slate-950 text-white shadow-sm font-semibold border border-slate-800'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
        title="Switch to Dark Theme"
      >
        <Moon className={`w-3.5 h-3.5 transition-colors ${isDark ? 'text-cyan-400 fill-cyan-400/20' : 'text-slate-400'}`} />
        {!compact && <span className="text-[11px]">Dark</span>}
      </button>
    </div>
  );
}
