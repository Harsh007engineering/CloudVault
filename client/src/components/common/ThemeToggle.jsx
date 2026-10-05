import React from 'react';
import { Sun, Moon, LayoutGrid } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

export default function ThemeToggle({ className = '', compact = false }) {
  const { theme, setTheme, isDark, isXP } = useTheme();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full text-xs font-medium shadow-sm transition-all select-none ${
        isXP
          ? 'bg-[#ece9d8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#7f9db9] border-b-[#7f9db9] rounded-md text-slate-800'
          : isDark 
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
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full transition-all duration-200 focus:outline-none ${
          isXP ? 'rounded-sm py-0.5' : ''
        } ${
          theme === 'light'
            ? 'bg-white text-slate-900 shadow-sm font-bold'
            : isXP
              ? 'text-slate-800 hover:bg-[#d6dff7]'
              : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Switch to Light Theme"
      >
        <Sun className={`w-3.5 h-3.5 transition-colors ${theme === 'light' ? 'text-amber-500 fill-amber-500/20' : 'text-slate-400'}`} />
        {!compact && <span className="text-[11px]">Light</span>}
      </button>

      {/* Dark Option Button */}
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full transition-all duration-200 focus:outline-none ${
          isXP ? 'rounded-sm py-0.5' : ''
        } ${
          theme === 'dark'
            ? 'bg-slate-950 text-white shadow-sm font-bold border border-slate-800'
            : isXP
              ? 'text-slate-800 hover:bg-[#d6dff7]'
              : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Switch to Dark Theme"
      >
        <Moon className={`w-3.5 h-3.5 transition-colors ${theme === 'dark' ? 'text-cyan-400 fill-cyan-400/20' : 'text-slate-500'}`} />
        {!compact && <span className="text-[11px]">Dark</span>}
      </button>

      {/* XP Option Button */}
      <button
        type="button"
        onClick={() => setTheme('xp')}
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 transition-all duration-200 focus:outline-none ${
          isXP
            ? 'bg-gradient-to-b from-[#225ad7] to-[#1242ab] text-white font-bold shadow-sm rounded-sm border border-[#0a2f85]'
            : isDark
              ? 'rounded-full text-slate-400 hover:text-cyan-300'
              : 'rounded-full text-slate-600 hover:text-blue-600'
        }`}
        title="Switch to Windows XP Professional Theme"
      >
        <span className="text-xs">🪟</span>
        {!compact && <span className="text-[11px]">XP</span>}
      </button>
    </div>
  );
}
