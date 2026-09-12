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
  RefreshCw,
  HardDrive
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-200/30 flex flex-col">
      {/* Top Banner for Shared Lab Computers */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
        <Shield className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Using a shared university laboratory computer? CloudVault leaves zero login traces or persistent tokens on this workstation.</span>
      </div>

      {/* Navbar */}
      <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Cloud<span className="text-brand-600">Vault</span>
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Academic Cloud Storage
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl shadow-sm shadow-brand-600/20 transition-colors flex items-center gap-1.5"
            >
              Go to My Vault
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-200/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl shadow-sm shadow-brand-600/20 transition-colors flex items-center gap-1.5"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            Built for Shared University Lab PCs &bull; 500 MiB Free Per Student
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Academic file storage. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
              Zero Google or personal logins required.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stop logging into Gmail, Google Drive, or personal accounts on public lab workstations. Store your lab reports, code archives, and assignments securely with just a <strong>Username and Password</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/signup"}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-brand-600/25 transition-all text-sm flex items-center gap-2"
            >
              {isAuthenticated ? "Open My Vault" : "Create Account in 5 Seconds"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold px-6 py-3.5 rounded-xl transition-all text-sm shadow-sm"
            >
              Sign In to Existing Vault
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Only Username & Password</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              No email addresses, phone numbers, Google OAuth, or Microsoft logins. Nothing links your personal identity to public workstations.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Cryptographic Recovery Codes</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Receive 5 random one-time cryptographic recovery codes upon signup. If you ever forget your password, restore access instantly without email.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Lab Computer Hardened</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Strict HTTP-only cookies, no tokens in localStorage, automatic cache-busting on file streams, and instant session termination on logout.
            </p>
          </div>
        </div>

        {/* Storage Architecture Callout */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">S3 / Cloudflare R2 Cloud Architecture</h4>
                <p className="text-xs text-slate-500">
                  Logical 500 MiB quota per student &bull; Abstracted object storage &bull; ₹0/month free-tier architecture
                </p>
              </div>
            </div>

            {health && (
              <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-semibold border border-emerald-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>System Online ({health.storageProvider.toUpperCase()})</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 border-t border-slate-200/70 text-center text-xs text-slate-400">
        CloudVault &bull; University Academic Cloud Storage &bull; Designed for Shared Lab Workstations
      </footer>
    </div>
  );
}
