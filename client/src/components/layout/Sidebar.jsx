import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Folder, 
  Clock, 
  Star, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Presentation, 
  FileCode, 
  FileArchive, 
  ShieldCheck, 
  KeyRound, 
  Settings, 
  UploadCloud, 
  Cloud, 
  HardDrive,
  X,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/useTheme';
import { useAuth } from '../../context/AuthContext';
import { formatBytes } from '../../utils/formatters';

export default function Sidebar({
  selectedCategory = 'all',
  onSelectCategory,
  onSelectRecent,
  onOpenUpload,
  onOpenRecoveryCodes,
  isOpen = false,
  onClose
}) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard';

  const totalLimit = user?.storageLimit || 524288000;
  const totalUsed = user?.storageUsed || 0;
  const percentUsed = Math.min(100, Math.round((totalUsed / totalLimit) * 100));

  const mainNav = [
    { id: 'all', label: 'My Files', icon: Folder, onClick: () => onSelectCategory && onSelectCategory('all') },
    { id: 'recent', label: 'Recent', icon: Clock, onClick: () => onSelectRecent && onSelectRecent() },
    { id: 'starred', label: 'Starred', icon: Star, onClick: () => onSelectCategory && onSelectCategory('starred') }
  ];

  const fileTypeNav = [
    { id: 'document', label: 'Documents', icon: FileText, color: 'text-blue-500' },
    { id: 'image', label: 'Images', icon: ImageIcon, color: 'text-purple-500' },
    { id: 'spreadsheet', label: 'Sheets', icon: FileSpreadsheet, color: 'text-emerald-500' },
    { id: 'presentation', label: 'Slides', icon: Presentation, color: 'text-amber-500' },
    { id: 'code', label: 'Code', icon: FileCode, color: 'text-cyan-500' },
    { id: 'archive', label: 'Archives', icon: FileArchive, color: 'text-orange-500' }
  ];

  const systemNav = [
    { to: '/security', label: 'Security Center', icon: ShieldCheck, isRoute: true },
    { 
      label: 'Recovery Codes', 
      icon: KeyRound, 
      isAction: true, 
      onClick: () => {
        if (onOpenRecoveryCodes) {
          onOpenRecoveryCodes();
        }
      } 
    },
    { to: '/settings', label: 'Settings', icon: Settings, isRoute: true }
  ];

  const content = (
    <div className="flex flex-col h-full justify-between p-4 select-none">
      <div className="space-y-6">
        {/* Brand / Logo (Header on Mobile) */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-500/25 text-white transition-all group-hover:scale-105">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Cloud<span className="text-brand-500">Vault</span>
              </span>
              <span className={`ml-2 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                isDark ? 'bg-slate-800 text-slate-400 border-slate-700/60' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                Lab
              </span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          {onClose && (
            <button
              onClick={onClose}
              className={`lg:hidden p-1.5 rounded-xl border transition-colors ${
                isDark 
                  ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' 
                  : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Primary Action Button: + Upload */}
        {onOpenUpload && (
          <div className="px-1">
            <button
              onClick={() => {
                onOpenUpload();
                if (onClose) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 transition-all active:translate-y-0.5 group"
            >
              <UploadCloud className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              <span>+ Upload Coursework</span>
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
          {/* MAIN */}
          <div>
            <div className={`px-2.5 text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Main
            </div>
            <div className="space-y-0.5">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = isDashboard && selectedCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!isDashboard) {
                        window.location.href = '/dashboard';
                        return;
                      }
                      item.onClick();
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? isDark
                          ? 'bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30'
                          : 'bg-brand-50 text-brand-700 font-semibold border border-brand-200 shadow-sm'
                        : isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FILE TYPES */}
          <div>
            <div className={`px-2.5 text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              File Types
            </div>
            <div className="space-y-0.5">
              {fileTypeNav.map((item) => {
                const Icon = item.icon;
                const isActive = isDashboard && selectedCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!isDashboard) {
                        window.location.href = '/dashboard';
                        return;
                      }
                      if (onSelectCategory) onSelectCategory(item.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? isDark
                          ? 'bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30'
                          : 'bg-brand-50 text-brand-700 font-semibold border border-brand-200 shadow-sm'
                        : isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${item.color || ''}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SYSTEM */}
          <div>
            <div className={`px-2.5 text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              System
            </div>
            <div className="space-y-0.5">
              {systemNav.map((item) => {
                const Icon = item.icon;
                const isActive = item.to && location.pathname === item.to;

                if (item.isRoute) {
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => {
                        if (onClose) onClose();
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? isDark
                            ? 'bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30'
                            : 'bg-brand-50 text-brand-700 font-semibold border border-brand-200 shadow-sm'
                          : isDark
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : ''}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Storage Compact Card */}
      <div className={`mt-4 p-3 rounded-2xl border transition-all ${
        isDark ? 'bg-slate-900/80 border-slate-800/80' : 'bg-slate-50 border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <HardDrive className={`w-3.5 h-3.5 ${isDark ? 'text-brand-400' : 'text-brand-600'}`} />
            <span className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Storage</span>
          </div>
          <span className={`text-[11px] font-mono font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {percentUsed}%
          </span>
        </div>

        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentUsed > 90 ? 'bg-rose-500' : percentUsed > 75 ? 'bg-amber-500' : 'bg-brand-500'
            }`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
          <span>{formatBytes(totalUsed)}</span>
          <span>{formatBytes(totalLimit)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (Visible on lg and above) */}
      <aside className={`hidden lg:flex flex-col w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r transition-colors z-20 ${
        isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white/80 border-slate-200/90'
      }`}>
        {content}
      </aside>

      {/* Mobile Drawer (Slide in overlay on smaller screens) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in transition-opacity"
          />
          {/* Drawer Content */}
          <div className={`relative w-72 max-w-[85vw] h-full shadow-2xl border-r z-10 animate-slide-in flex flex-col ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
