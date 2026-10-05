import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cloud, 
  Shield, 
  Database, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  KeyRound, 
  Server, 
  Eye,
  FileText,
  FileCode,
  Image as ImageIcon,
  FolderArchive,
  Star,
  Download,
  Trash2,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.get('/health')
      .then((res) => {
        if (res.success) setHealth(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glowing orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 dark:opacity-25 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl transform -translate-x-1/2" />
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl transform translate-x-1/2" />
      </div>

      {/* Top Banner for Shared Lab Computers */}
      <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 backdrop-blur-sm relative z-10">
        <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>
          <strong>Shared Lab PC Notice:</strong> CloudVault leaves zero tokens or credentials in browser storage. No Google account exposure.
        </span>
      </div>

      {/* Navbar */}
      <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-500/25 text-white transition-transform group-hover:scale-105">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Cloud<span className="text-brand-500 dark:text-brand-400">Vault</span>
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
              Academic Cloud Storage
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-4">
          <ThemeToggle />

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl shadow-md shadow-brand-600/20 hover:shadow-brand-600/30 transition-all flex items-center gap-1.5"
            >
              Open Vault
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-xl shadow-md shadow-brand-600/25 hover:shadow-brand-500/35 transition-all flex items-center gap-1.5"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-20 relative z-10">
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            Built for Shared University Lab Workstations &bull; 500 MiB Free Per Student
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            Academic file storage. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 dark:from-brand-400 dark:via-indigo-400 dark:to-cyan-300">
              Zero Google or personal logins required.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop logging into Gmail, Google Drive, or Microsoft on public computer labs. Store your lab reports, code archives, slides, and coursework safely with just a <strong>Username and Password</strong>.
          </p>

          {/* Call to Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-brand-600/30 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2 group text-sm"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-card text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Sign In to Existing Vault</span>
            </Link>
          </div>

          {/* Quick trust metrics */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No Email or Phone Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Cryptographic Recovery Codes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Anti-Browser-Cache Defense</span>
            </div>
          </div>
        </div>

        {/* Realistic Interactive Vault Preview Mockup */}
        <div className="mt-14 relative group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-500/20 via-purple-500/20 to-cyan-500/20 blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="relative rounded-2xl glass-panel shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
            {/* Window titlebar */}
            <div className="px-4 py-3 bg-slate-100/70 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
                  CloudVault — harsh_student &bull; 142 MiB / 500 MiB
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Lab PC Safe Mode</span>
              </div>
            </div>

            {/* Mock files table / cards */}
            <div className="p-4 sm:p-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Mock Card 1 */}
                <div className="glass-card p-3.5 rounded-xl flex items-start gap-3 border border-slate-200/60 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        Lab_Report_Final_EE101.pdf
                      </span>
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">2.4 MB &bull; PDF Document</div>
                  </div>
                </div>

                {/* Mock Card 2 */}
                <div className="glass-card p-3.5 rounded-xl flex items-start gap-3 border border-slate-200/60 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        Circuit_Oscilloscope.png
                      </span>
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">1.1 MB &bull; Image</div>
                  </div>
                </div>

                {/* Mock Card 3 */}
                <div className="glass-card p-3.5 rounded-xl flex items-start gap-3 border border-slate-200/60 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FolderArchive className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        Project_Source_Code.zip
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">8.9 MB &bull; Archive</div>
                  </div>
                </div>
              </div>

              {/* Mock Storage Distribution */}
              <div className="glass-card p-3 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-brand-500" />
                  <span className="font-medium">Quota Used: 142 MiB of 500 MiB (28%)</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Cloudflare R2 Object Store</span>
                  <span>&bull;</span>
                  <span className="text-emerald-500 font-semibold">₹0 Free Tier</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Bento Grid */}
        <div className="mt-20 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Engineered for Shared Lab Security
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Built from scratch around university computer lab workflows where dozens of students share identical PCs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Zero Personal Data
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Sign up with only a Username and Password. No personal Gmail, Microsoft login, phone numbers, or OAuth tokens ever touched on public computers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                5 Cryptographic Recovery Codes
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Since we never ask for your email or phone, you receive 5 mathematical one-time recovery codes to safely reset your password if ever forgotten.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Anti-Cache & Tokenless Auth
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                No JWT tokens in localStorage. Strict HTTP-only cookies and aggressive Cache-Control headers ensure the shared lab PC browser cannot save your files.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                In-App File Previews
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Inspect PDFs, images, source code, and documents directly in your browser without having to download them to the public PC's desktop.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                500 MiB Free Per Student
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Logical quota management. Files are stored on high-speed S3-compatible Cloudflare R2 object storage with 0 egress bandwidth fees.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Lab PC Hygiene Checklist
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Whenever you sign out, CloudVault provides a checklist reminding you to clear any downloaded reports from the workstation's Downloads folder.
              </p>
            </div>
          </div>
        </div>

        {/* System Health / Transparency Card */}
        {health && (
          <div className="mt-14 glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                System Status: Online &amp; Operational
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400">
              <span>DB: <strong className="text-slate-700 dark:text-slate-300">Connected</strong></span>
              <span>Storage: <strong className="text-slate-700 dark:text-slate-300 capitalize">{health.storageProvider} Provider</strong></span>
              <span>Default Quota: <strong className="text-slate-700 dark:text-slate-300">{health.limits?.defaultQuotaMiB} MiB</strong></span>
              <span>Max File Size: <strong className="text-slate-700 dark:text-slate-300">{health.limits?.maxFileSizeMiB} MiB</strong></span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 relative z-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-brand-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">CloudVault Academic</span>
            <span>&bull;</span>
            <span>Zero-Cost University Lab Architecture</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-slate-900 dark:hover:text-white transition-colors">Create Account</Link>
            <Link to="/forgot-password" className="hover:text-slate-900 dark:hover:text-white transition-colors">Recovery Codes</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
