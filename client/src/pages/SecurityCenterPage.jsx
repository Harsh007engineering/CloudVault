import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  HardDrive, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  DownloadCloud, 
  Layers, 
  FileCheck, 
  Clock, 
  Terminal,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import AmbientBackground from '../components/common/AmbientBackground';
import RecoveryCodesModal from '../components/modals/RecoveryCodesModal';
import { formatBytes, formatDate } from '../utils/formatters';

export default function SecurityCenterPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { success, error: toastError } = useToast();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Recovery codes regeneration state
  const [regenPassword, setRegenPassword] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [newCodes, setNewCodes] = useState(null);

  const handleRegenerateCodes = async (e) => {
    e.preventDefault();
    if (!regenPassword) return;

    setRegenerating(true);
    try {
      const res = await api.post('/auth/regenerate-recovery-codes', {
        currentPassword: regenPassword
      });
      if (res.success && res.data?.recoveryCodes) {
        setNewCodes(res.data.recoveryCodes);
        setShowRegenConfirm(false);
        setRegenPassword('');
        success('5 new cryptographic recovery codes generated.');
      }
    } catch (err) {
      toastError(err.message || 'Failed to regenerate recovery codes');
    } finally {
      setRegenerating(false);
    }
  };

  const recoveryCodesRemaining = typeof user?.recoveryCodesRemaining === 'number' 
    ? user.recoveryCodesRemaining 
    : 5;

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } flex flex-col antialiased transition-colors relative selection:bg-brand-500 selection:text-white`}>
      <AmbientBackground isDark={isDark} />
      
      {/* Navbar with mobile drawer toggle */}
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />

      {/* Recovery Codes Presentation Modal */}
      {newCodes && (
        <RecoveryCodesModal
          codes={newCodes}
          isOpen={true}
          onClose={() => setNewCodes(null)}
          isRegeneration={true}
        />
      )}

      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          onOpenRecoveryCodes={() => setShowRegenConfirm(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 relative z-10 min-w-0">
          {/* Header */}
          <div className={`pb-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-200/90'}`}>
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-2xl ${
                isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-2xl font-extrabold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Security Center
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-sm ${
                    isDark 
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                  }`}>
                    Lab Safe Active
                  </span>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Verification of session protection, cache security, and cryptographic account recovery for shared university lab PCs.
                </p>
              </div>
            </div>
          </div>

          {/* Real Security Status Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Lab PC Safe Mode Status Card */}
            <div className={`rounded-3xl p-6 backdrop-blur-xl border transition-all ${
              isDark 
                ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/40 ring-1 ring-white/5' 
                : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5'
            }`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-500/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🛡</span>
                  <div>
                    <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Lab PC Safe Mode
                    </h3>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Active protections on this shared computer
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Enabled
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      No Persistent Credentials
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Session keys are transmitted via HTTP-only cookies (<code className="font-mono text-[10px]">cv.sid</code>) and never saved to localStorage or exposed to third-party scripts.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Cache Protection Hardening
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      API responses and downloads enforce <code className="font-mono text-[10px]">Cache-Control: no-store, private</code>, preventing subsequent lab students from retrieving cached coursework.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Zero Personal Account Attachment
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No personal Gmail, Microsoft accounts, or phone numbers required. Your personal life remains completely unlinked from university hardware.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Download Cleanup Reminder
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Automatic sign-out hygiene prompts remind you to empty the lab PC's public <code className="font-mono text-[10px]">Downloads</code> folder before leaving the workstation.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Account Protection Card */}
            <div className={`rounded-3xl p-6 backdrop-blur-xl border transition-all ${
              isDark 
                ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/40 ring-1 ring-white/5' 
                : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5'
            }`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-500/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🔐</span>
                  <div>
                    <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Account Protection
                    </h3>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Identity and credential parameters
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  Protected
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-500/10">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Student Username</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {user?.username}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-500/10">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Password Encryption</span>
                  <span className="flex items-center gap-1.5 font-medium text-emerald-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Salted Bcrypt Hash (Active)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-500/10">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Assigned Role</span>
                  <span className="capitalize font-semibold text-brand-500">{user?.role || 'user'}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Allocated Quota</span>
                  <span className="font-mono font-semibold">
                    {formatBytes(user?.storageLimit || 524288000)} (Academic Tier)
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Cryptographic Recovery Codes Card */}
            <div className={`rounded-3xl p-6 backdrop-blur-xl border transition-all md:col-span-2 ${
              isDark 
                ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/40 ring-1 ring-white/5' 
                : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-500/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🔑</span>
                  <div>
                    <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Recovery Codes (Backup Key)
                    </h3>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Single-use cryptographic keys used to regain account access if you forget your password
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    recoveryCodesRemaining > 0 
                      ? 'bg-brand-500/10 text-brand-400 border-brand-500/30' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {recoveryCodesRemaining} remaining
                  </span>

                  <button
                    onClick={() => setShowRegenConfirm((prev) => !prev)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:translate-y-0.5"
                  >
                    Regenerate 5 New Codes
                  </button>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Because CloudVault is intentionally designed with <strong>no email collection</strong>, recovery codes are the only cryptographic mechanism to reset your password if forgotten. Keep them saved in your personal physical notebook or private password manager.
              </p>

              {/* Password prompt for code regeneration */}
              {showRegenConfirm && (
                <form onSubmit={handleRegenerateCodes} className={`mt-5 p-4 rounded-2xl border animate-scale-in ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`text-xs font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Confirm Password to Regenerate Codes
                  </h4>
                  <p className={`text-[11px] mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Generating 5 new codes will immediately invalidate all previously issued recovery codes.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={regenPassword}
                      onChange={(e) => setRegenPassword(e.target.value)}
                      required
                      className={`flex-1 rounded-xl px-3.5 py-2 text-xs border focus:outline-none ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-brand-500' 
                          : 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-brand-500'
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={regenerating}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow transition-all"
                      >
                        {regenerating ? 'Generating...' : 'Confirm & Generate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRegenConfirm(false);
                          setRegenPassword('');
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                          isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* 4. Session Security Details Card */}
            <div className={`rounded-3xl p-6 backdrop-blur-xl border transition-all md:col-span-2 ${
              isDark 
                ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/40 ring-1 ring-white/5' 
                : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5'
            }`}>
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-500/10 mb-4">
                <span className="text-xl">💻</span>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Active Session Architecture
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    How your connection to this laboratory workstation is isolated
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950/40 border-slate-800/70' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="font-bold mb-1 flex items-center gap-1.5 text-brand-500">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Cookie Type</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 dark:text-slate-300">
                    HTTP-Only, SameSite
                  </div>
                  <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Inaccessible to JavaScript; protected against XSS session theft.
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950/40 border-slate-800/70' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="font-bold mb-1 flex items-center gap-1.5 text-emerald-500">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Session Storage</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 dark:text-slate-300">
                    Server MongoDB Store
                  </div>
                  <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Session state lives on server; destroyed immediately on logout.
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950/40 border-slate-800/70' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="font-bold mb-1 flex items-center gap-1.5 text-purple-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Session Lifecycle</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 dark:text-slate-300">
                    Rolling TTL Expiry
                  </div>
                  <div className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Automatically terminates when inactive, protecting unattended lab terminals.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
