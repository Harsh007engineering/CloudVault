import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Cloud, LogOut, Settings, ShieldCheck, HardDrive, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatBytes } from '../../utils/formatters';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const percentUsed = user?.storageLimit 
    ? Math.min(100, Math.round((user.storageUsed / user.storageLimit) * 100)) 
    : 0;

  return (
    <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-md shadow-brand-500/20 text-white transition-transform group-hover:scale-105">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Cloud<span className="text-brand-600">Vault</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                Student Cloud
              </span>
            </div>
          </Link>

          {/* User Controls & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Storage quick status pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs">
              <HardDrive className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium text-slate-700">
                {formatBytes(user?.storageUsed || 0)} / {formatBytes(user?.storageLimit || 524288000)}
              </span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden ml-1">
                <div
                  className={`h-full rounded-full ${
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
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* Settings Link */}
            <Link
              to="/settings"
              className={`p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
                location.pathname === '/settings' ? 'bg-slate-100 text-brand-600' : ''
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* Current user badge */}
            <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold uppercase">
                {user?.username ? user.username.substring(0, 2) : 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-700">
                {user?.username}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg transition-colors"
              title="Log out and clear session"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
