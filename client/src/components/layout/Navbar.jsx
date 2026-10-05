import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Cloud, LogOut, Settings, ShieldCheck, HardDrive, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatBytes } from '../../utils/formatters';
import LabHygieneModal from './LabHygieneModal';
import ThemeToggle from '../common/ThemeToggle';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
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

  return (
    <>
      <LabHygieneModal
        isOpen={showHygieneModal}
        onClose={() => setShowHygieneModal(false)}
        onConfirmLogout={handleConfirmedLogout}
      />

      <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-500/20 text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-brand-500/30">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
                  Cloud<span className="text-brand-500 dark:text-brand-400">Vault</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                  Student Cloud
                </span>
              </div>
            </Link>

            {/* User Controls & Actions */}
            <div className="flex items-center gap-2 sm:gap-3.5">
              {/* Storage quick status pill */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl text-xs backdrop-blur-sm transition-colors">
                <HardDrive className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">
                  {formatBytes(user?.storageUsed || 0)} / {formatBytes(user?.storageLimit || 524288000)}
                </span>
                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ml-1">
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
                      : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {/* Settings Link */}
              <Link
                to="/settings"
                className={`p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition-colors ${
                  location.pathname === '/settings' ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400' : ''
                }`}
                title="Account & Security Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>

              {/* Dark/Light Mode Toggle */}
              <ThemeToggle />

              {/* Current user badge */}
              <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-slate-200 dark:sm:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500/20 to-indigo-500/20 dark:from-brand-900/40 dark:to-indigo-900/40 border border-brand-300/40 dark:border-brand-500/30 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-bold uppercase shadow-sm">
                  {user?.username ? user.username.substring(0, 2) : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                    {user?.username}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize block leading-tight">
                    {user?.role || 'student'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => setShowHygieneModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-white dark:hover:text-white bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 dark:hover:bg-rose-600 px-3 py-2 rounded-xl border border-rose-200/80 dark:border-rose-900/50 hover:border-transparent transition-all shadow-sm group"
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
