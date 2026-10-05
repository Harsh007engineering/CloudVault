import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Cloud, LogOut, Settings, ShieldCheck, HardDrive, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/useTheme';
import { formatBytes } from '../../utils/formatters';
import LabHygieneModal from './LabHygieneModal';
import ThemeToggle from '../common/ThemeToggle';

export default function Navbar({ onToggleMobileSidebar }) {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, isXP } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showHygieneModal, setShowHygieneModal] = useState(false);

  const handleConfirmedLogout = async () => {
    setShowHygieneModal(false);
    await logout();
    navigate('/login');
  };

  const percentUsed = user?.storageLimit 
    ? Math.min(100, Math.round((user.storageUsed / user.storageLimit) * 100)) 
    : 0;

  // Windows XP Navigation Bar
  if (isXP) {
    return (
      <>
        <LabHygieneModal
          isOpen={showHygieneModal}
          onClose={() => setShowHygieneModal(false)}
          onConfirmLogout={handleConfirmedLogout}
        />
        <nav className="bg-[#ece9d8] border-b-2 border-[#0055ea] text-black font-sans text-xs px-3 py-1.5 flex items-center justify-between select-none shadow-md sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Start Button */}
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#388e3c] to-[#4caf50] hover:from-[#2e7d32] hover:to-[#388e3c] text-white font-bold rounded-r-xl shadow-inner border border-[#1b5e20] active:scale-95 transition-transform"
            >
              <span className="text-sm">☁️</span>
              <span className="tracking-wide text-xs">start</span>
            </Link>

            {/* Quick Navigation Buttons */}
            <div className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`xp-button px-2.5 py-1 text-xs flex items-center gap-1 ${
                  location.pathname === '/dashboard' ? 'font-bold bg-[#d4d0c8]' : ''
                }`}
              >
                <span>📁</span>
                <span className="hidden sm:inline">My Vault</span>
              </Link>
              <Link
                to="/security"
                className={`xp-button px-2.5 py-1 text-xs flex items-center gap-1 ${
                  location.pathname === '/security' ? 'font-bold bg-[#d4d0c8]' : ''
                }`}
              >
                <span>🛡️</span>
                <span className="hidden sm:inline">Security</span>
              </Link>
              <Link
                to="/settings"
                className={`xp-button px-2.5 py-1 text-xs flex items-center gap-1 ${
                  location.pathname === '/settings' ? 'font-bold bg-[#d4d0c8]' : ''
                }`}
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">Settings</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`xp-button px-2.5 py-1 text-xs flex items-center gap-1 ${
                    location.pathname === '/admin' ? 'font-bold bg-[#d4d0c8]' : ''
                  }`}
                >
                  <span>🖥️</span>
                  <span className="hidden sm:inline">Management</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Lab PC Safe Indicator */}
            <div
              className="hidden md:flex items-center gap-1 px-2 py-0.5 border border-[#7f9db9] bg-white text-[11px] font-sans"
              title="Lab PC Safe Mode: Active"
            >
              <span className="text-xs">🛡️</span>
              <span className="text-emerald-800 font-bold">Lab Safe</span>
            </div>

            {/* Storage Quota */}
            <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 border border-[#7f9db9] bg-white text-[11px] font-mono">
              <span>💾</span>
              <span>{formatBytes(user?.storageUsed || 0)} / {formatBytes(user?.storageLimit || 524288000)}</span>
            </div>

            {/* User Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 border border-[#7f9db9] bg-white text-[11px]">
              <span>👤</span>
              <span className="font-bold">{user?.username || 'User'}</span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Log Off Button */}
            <button
              onClick={() => setShowHygieneModal(true)}
              className="xp-button px-2.5 py-1 text-xs font-bold text-red-900 flex items-center gap-1 hover:bg-red-50"
              title="Log Off CloudVault"
            >
              <span>⏻</span>
              <span className="hidden sm:inline">Log Off</span>
            </button>
          </div>
        </nav>
      </>
    );
  }

  return (
    <>
      <LabHygieneModal
        isOpen={showHygieneModal}
        onClose={() => setShowHygieneModal(false)}
        onConfirmLogout={handleConfirmedLogout}
      />

      <nav className={`sticky top-0 z-30 backdrop-blur-2xl border-b transition-colors shadow-sm ${
        isDark 
          ? 'bg-slate-950/80 border-slate-800/80 text-white' 
          : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Brand + Mobile Menu Button */}
            <div className="flex items-center gap-3">
              {onToggleMobileSidebar && (
                <button
                  onClick={onToggleMobileSidebar}
                  className={`lg:hidden p-2 rounded-xl border transition-colors ${
                    isDark 
                      ? 'border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' 
                      : 'border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="w-4 h-4" />
                </button>
              )}

              {/* Logo */}
              <Link to="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-500/20 text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-brand-500/30">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-lg font-bold tracking-tight transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Cloud<span className="text-brand-500">Vault</span>
                  </span>
                  <span className={`hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                    isDark 
                      ? 'bg-slate-800/90 text-slate-400 border-slate-700/60' 
                      : 'bg-slate-100 text-slate-600 border-slate-200 shadow-sm'
                  }`}>
                    Student Cloud
                  </span>
                </div>
              </Link>
            </div>

            {/* User Controls & Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3.5">
              {/* Lab PC Safe Mode Status Indicator (Responsive on all screen widths) */}
              <Link
                to="/security"
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-sm transition-all group ${
                  isDark 
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 shadow-sm'
                }`}
                title="Lab PC Safe Mode Active: Session stored in HTTP-only cookies, browser cache disabled"
                aria-label="Lab PC Safe Mode: Protected"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="hidden xl:inline">🛡 Lab PC Safe Mode:</span>
                <span className="font-bold text-[11px] sm:text-xs">Protected</span>
              </Link>

              {/* Storage quick status pill */}
              <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs backdrop-blur-sm transition-colors ${
                isDark 
                  ? 'bg-slate-900/60 border-slate-700/60 text-slate-300' 
                  : 'bg-slate-100/90 border-slate-200 text-slate-800 shadow-sm'
              }`}>
                <HardDrive className={`w-3.5 h-3.5 ${isDark ? 'text-brand-400' : 'text-brand-600'}`} />
                <span className="font-medium font-mono">
                  {formatBytes(user?.storageUsed || 0)} / {formatBytes(user?.storageLimit || 524288000)}
                </span>
                <div className={`w-16 h-1.5 rounded-full overflow-hidden ml-1 ${
                  isDark ? 'bg-slate-800' : 'bg-slate-200'
                }`}>
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      percentUsed > 90 ? 'bg-rose-500' : percentUsed > 75 ? 'bg-amber-500' : 'bg-brand-500'
                    }`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
              </div>

              {/* Admin Link if admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm ${
                    location.pathname === '/admin'
                      ? 'bg-purple-600 text-white shadow-purple-600/20'
                      : isDark
                        ? 'text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60'
                        : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {/* Settings Link */}
              <Link
                to="/settings"
                className={`p-2 rounded-xl border transition-colors ${
                  location.pathname === '/settings' 
                    ? isDark 
                      ? 'bg-slate-800 text-brand-400 border-slate-700' 
                      : 'bg-slate-100 text-brand-600 border-slate-300'
                    : isDark 
                      ? 'text-slate-300 hover:text-white hover:bg-slate-850 border-transparent hover:border-slate-800' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent hover:border-slate-200'
                }`}
                title="Account & Security Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>

              {/* Dark/Light Mode Segmented Toggle */}
              <ThemeToggle />

              {/* Current user badge */}
              <div className={`flex items-center gap-2 pl-2 sm:border-l ${
                isDark ? 'sm:border-slate-800' : 'sm:border-slate-200'
              }`}>
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold uppercase shadow-sm ${
                  isDark 
                    ? 'bg-brand-900/40 border-brand-500/30 text-brand-300' 
                    : 'bg-brand-50 border-brand-200 text-brand-700'
                }`}>
                  {user?.username ? user.username.substring(0, 2) : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className={`text-xs font-semibold block leading-tight ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    {user?.username}
                  </span>
                  <span className={`text-[10px] capitalize block leading-tight ${
                    isDark ? 'text-slate-500' : 'text-slate-500'
                  }`}>
                    {user?.role || 'student'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => setShowHygieneModal(true)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all shadow-sm group ${
                  isDark 
                    ? 'text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-600 border-rose-900/50' 
                    : 'text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border-rose-200'
                }`}
                title="Sign out securely"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
