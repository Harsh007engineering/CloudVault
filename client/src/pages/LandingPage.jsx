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
  ExternalLink,
  Search,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';
import ThemeToggle from '../components/common/ThemeToggle';
import AmbientBackground from '../components/common/AmbientBackground';

// Mock files for interactive live vault demo
const DEMO_FILES = [
  {
    id: 1,
    name: 'DBMS_Assignment_3.sql',
    category: 'code',
    type: 'SQL',
    size: '34 KB',
    date: '1 hour ago',
    starred: true,
    badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/60',
    icon: FileCode
  },
  {
    id: 2,
    name: 'ML_Lab_Experiment_4.py',
    category: 'code',
    type: 'PY',
    size: '128 KB',
    date: '3 hours ago',
    starred: true,
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60',
    icon: FileCode
  },
  {
    id: 3,
    name: 'Physics_Lab_Manual.pdf',
    category: 'documents',
    type: 'PDF',
    size: '3.8 MB',
    date: 'Yesterday',
    starred: false,
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60',
    icon: FileText
  },
  {
    id: 4,
    name: 'Operating_Systems_Notes.docx',
    category: 'documents',
    type: 'DOCX',
    size: '1.4 MB',
    date: '2 days ago',
    starred: false,
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/60',
    icon: FileText
  }
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { isDark, isXP } = useTheme();
  const [health, setHealth] = useState(null);
  const [demoFilter, setDemoFilter] = useState('all');
  const [demoSearch, setDemoSearch] = useState('');
  const [demoFilesList, setDemoFilesList] = useState(DEMO_FILES);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    api.get('/health')
      .then((res) => {
        if (res.success) setHealth(res.data);
      })
      .catch(() => {});
  }, []);

  const toggleDemoStar = (id) => {
    setDemoFilesList(prev => prev.map(f => f.id === id ? { ...f, starred: !f.starred } : f));
  };

  const filteredDemoFiles = demoFilesList.filter(f => {
    const matchesFilter = 
      demoFilter === 'all' ? true :
      demoFilter === 'starred' ? f.starred :
      demoFilter === f.category;
    const matchesSearch = f.name.toLowerCase().includes(demoSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const faqs = [
    {
      q: "Why not just use Google Drive?",
      a: "Shared university computer laboratories are public environments. Logging into personal Google accounts exposes your personal email inbox, Google Drive files, YouTube history, and private photos. Public lab browsers frequently prompt to save passwords, and students routinely forget to log out when class ends. CloudVault provides a private, isolated workspace specifically for coursework with zero personal account exposure."
    },
    {
      q: "What if I forget my password without an email?",
      a: "When you create your CloudVault account, you are issued 5 cryptographic, single-use recovery codes (e.g. 8K4P-X92M). Store these safely (in a password manager, notes app, or printed). If you ever forget your password, simply enter your username and any unused recovery code to instantly set a new password. You can also regenerate fresh recovery codes at any time from your Security Center."
    },
    {
      q: "Can the lab admin or other students see my files?",
      a: "No. Every student's vault is strictly segregated at the database query level ({ _id: fileId, userId: req.user._id }). Other students cannot access your files even if they sit at the same workstation. Files stored on our Cloudflare R2 object storage use unique cryptographically random keys and are only accessible through authenticated, signed session requests."
    },
    {
      q: "What happens when I graduate or leave the lab?",
      a: "You can download all your coursework or specific files at any time with one click. When you no longer need your vault, you can delete individual files or close your account permanently. CloudVault does not hold on to stale files or sell your academic data."
    },
    {
      q: "Is 500 MiB enough storage?",
      a: "Yes! 500 MiB is designed specifically for active coursework—including lab manuals, PDF reports, code repositories (.py, .cpp, .java), slide decks, and spreadsheets. A typical code file is under 50 KB and a lab PDF is ~2 MB, meaning 500 MiB comfortably holds hundreds of assignments. CloudVault is not meant for storing 4K movies or personal photo libraries."
    },
    {
      q: "Why do I need to clear the downloads folder on a lab PC?",
      a: "When you download a file to a shared PC, Windows or Linux saves it locally to C:\\Users\\LabUser\\Downloads or Desktop. Even if you log out of CloudVault, that downloaded copy remains on the public hard drive until wiped. CloudVault includes built-in in-browser previews so you rarely even need to download files, plus an automatic sign-out hygiene reminder to purge local temp files."
    },
    {
      q: "Does CloudVault work on restricted college Wi-Fi or firewall networks?",
      a: "Yes. CloudVault communicates over standard HTTPS (port 443). It does not require custom ports, WebRTC, P2P networking, or VPN connections that are typically blocked by university firewalls and IT proxies."
    },
    {
      q: "Can I access my vault from my phone or hostel room laptop?",
      a: "Absolutely. CloudVault is a fully responsive web application. You can view your lab manuals from your phone while walking to class, upload an assignment from your laptop in your hostel, and then open and present it seamlessly from the lab PC projector."
    },
    {
      q: "Is CloudVault really ₹0/month free to use?",
      a: "Yes, 100% free. CloudVault is engineered with zero-cost modern cloud architecture: MongoDB Atlas free tier for metadata, Cloudflare R2 for zero-egress object storage, and Vercel/Render for frontend/backend hosting. There are no credit cards, hidden trials, or subscriptions."
    }
  ];

  // Windows XP Professional Welcome & Tour Experience
  if (isXP) {
    return (
      <div className="min-h-screen bg-[#004e98] p-2 sm:p-4 flex flex-col font-sans select-none">
        {/* Top IE Information Bar */}
        {!bannerDismissed && (
          <div className="bg-[#ffffe1] border-b border-[#808080] px-3 py-1 text-[11px] font-sans text-black flex items-center justify-between shadow-sm mb-2 select-none">
            <div className="flex items-center gap-2">
              <span className="text-xs">🛡️</span>
              <span>
                <strong>Shared Lab PC Notice:</strong> CloudVault uses HTTP-only session cookies. No personal Google accounts, phone numbers, or passwords left on public browsers.
              </span>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="xp-button px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:text-black ml-2"
              title="Dismiss notice"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Bar with Brand & Theme Toggle */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2 text-white text-xs font-bold">
            <span className="text-base">☁️</span>
            <span>CloudVault Professional — Academic Cloud Storage</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Main Welcome Window */}
        <div className="xp-window flex-1 flex flex-col shadow-2xl overflow-hidden max-w-6xl w-full mx-auto">
          {/* XP Titlebar */}
          <div className="xp-titlebar">
            <div className="xp-titlebar-text">
              <span className="text-sm">☁️</span>
              <span>Welcome to CloudVault Professional - [Tour and Overview]</span>
            </div>
            <div className="xp-window-controls">
              <button
                type="button"
                className="xp-btn-control xp-btn-close"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* XP Menu Bar */}
          <div className="bg-[#ece9d8] border-b border-[#7f9db9] px-2 py-0.5 flex items-center gap-3 text-xs">
            <Link to={isAuthenticated ? "/dashboard" : "/login"} className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5">
              <u>F</u>ile
            </Link>
            <button type="button" className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5">
              <u>E</u>dit
            </button>
            <button type="button" className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5">
              <u>V</u>iew
            </button>
            <button type="button" className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5">
              <u>T</u>ools
            </button>
            <button type="button" className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5">
              <u>H</u>elp
            </button>
          </div>

          {/* XP Address Bar */}
          <div className="bg-[#ece9d8] border-b border-[#7f9db9] px-2 py-1 flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-bold">Address:</span>
            <div className="xp-input flex-1 px-2 py-0.5 text-xs bg-white flex items-center gap-1 font-mono">
              <span>🌐</span>
              <span>https://cloudvault.local/welcome</span>
            </div>
            <button
              type="button"
              className="xp-button px-2 py-0.5 text-xs font-bold text-emerald-800"
            >
              Go
            </button>
          </div>

          {/* Main Two-Column Layout */}
          <div className="flex-1 flex overflow-hidden bg-white">
            {/* Left Luna Task Pane */}
            <div className="hidden md:flex w-64 bg-[#6375d6] p-2 flex-col gap-2.5 text-white font-sans text-xs overflow-y-auto select-none">
              {/* Task Section 1 */}
              <div className="bg-white rounded-t-sm overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-[#215dc6] to-[#3a75e3] px-2.5 py-1 font-bold text-white flex items-center justify-between text-xs">
                  <span>Getting Started</span>
                  <span className="text-[10px]">▼</span>
                </div>
                <div className="p-2 space-y-1 text-slate-800 text-[11px] bg-[#d3e5fa]">
                  {isAuthenticated ? (
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-1.5 p-1 hover:underline text-blue-900 font-bold"
                    >
                      <span>📁</span>
                      <span>Open My Vault</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center gap-1.5 p-1 hover:underline text-blue-900 font-bold"
                      >
                        <span>🔑</span>
                        <span>Log On to CloudVault</span>
                      </Link>
                      <Link
                        to="/signup"
                        className="flex items-center gap-1.5 p-1 hover:underline text-blue-900"
                      >
                        <span>📝</span>
                        <span>Account Setup Wizard</span>
                      </Link>
                    </>
                  )}
                  <a
                    href="#demo-section"
                    className="flex items-center gap-1.5 p-1 hover:underline text-blue-900"
                  >
                    <span>📂</span>
                    <span>Explore Virtual Vault</span>
                  </a>
                </div>
              </div>

              {/* Task Section 2 */}
              <div className="bg-white rounded-t-sm overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-[#215dc6] to-[#3a75e3] px-2.5 py-1 font-bold text-white flex items-center justify-between text-xs">
                  <span>Lab Computer Security</span>
                  <span className="text-[10px]">▼</span>
                </div>
                <div className="p-2 space-y-1.5 text-slate-800 text-[11px] bg-[#d3e5fa]">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span>🛡️</span>
                    <span>Lab PC Safe Mode: <b>ACTIVE</b></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span>🍪</span>
                    <span>HTTP-Only Cookies: <b>ENABLED</b></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span>🔑</span>
                    <span>Recovery Codes: <b>5 CRYPTO</b></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span>💾</span>
                    <span>Quota: <b>500 MiB Free</b></span>
                  </div>
                </div>
              </div>

              {/* Task Section 3 */}
              <div className="bg-white rounded-t-sm overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-[#215dc6] to-[#3a75e3] px-2.5 py-1 font-bold text-white flex items-center justify-between text-xs">
                  <span>System Telemetry</span>
                  <span className="text-[10px]">▼</span>
                </div>
                <div className="p-2 space-y-1 text-slate-800 text-[11px] bg-[#d3e5fa]">
                  <div className="flex items-center gap-1 text-slate-700">
                    <span>🟢</span>
                    <span>API Server: <b>{health?.status || 'Online'}</b></span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700">
                    <span>☁️</span>
                    <span>Storage: <b>Cloudflare R2</b></span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700">
                    <span>🗄️</span>
                    <span>Database: <b>MongoDB Atlas</b></span>
                  </div>
                </div>
              </div>

              {/* Task Section 4 */}
              <div className="bg-white rounded-t-sm overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-[#215dc6] to-[#3a75e3] px-2.5 py-1 font-bold text-white flex items-center justify-between text-xs">
                  <span>Display Theme</span>
                  <span className="text-[10px]">▼</span>
                </div>
                <div className="p-2 flex justify-center bg-[#d3e5fa]">
                  <ThemeToggle />
                </div>
              </div>
            </div>

            {/* Right Pane: Content */}
            <div className="flex-1 bg-white p-3 sm:p-5 overflow-y-auto space-y-6 text-slate-900 font-sans">
              {/* Luna Welcome Header Banner */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-[#003c74] via-[#124b8f] to-[#003c74] text-white border border-[#0a2f85] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight">
                    Welcome to CloudVault Professional
                  </div>
                  <div className="text-xs text-blue-200 mt-1 max-w-xl">
                    Private academic cloud storage engineered specifically for university shared computer laboratories. No personal accounts, no phone numbers, zero trace left on public workstations.
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  {isAuthenticated ? (
                    <Link
                      to="/dashboard"
                      className="xp-button font-bold text-xs px-4 py-2 flex items-center gap-1.5 shadow"
                    >
                      <span>📁</span>
                      <span>Go to My Vault</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="xp-button font-bold text-xs px-4 py-2 flex items-center gap-1.5 shadow"
                      >
                        <span>🔑</span>
                        <span>Log On...</span>
                      </Link>
                      <Link
                        to="/signup"
                        className="xp-button font-bold text-xs px-4 py-2 flex items-center gap-1.5 bg-[#e3e8f8] shadow"
                      >
                        <span>📝</span>
                        <span>Account Wizard...</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* 4 Feature Callouts in Sunken Panels */}
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 mb-2 border-b border-slate-200">
                  Core Security Architecture
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="xp-sunken p-3 bg-[#f9f8f4] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <span>🛡️</span>
                      <span>Zero Trace on Shared PCs</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      No Google, Microsoft, or Apple account logins. Browser autofill, saved passwords, and history are never populated.
                    </p>
                  </div>

                  <div className="xp-sunken p-3 bg-[#f9f8f4] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <span>⚡</span>
                      <span>500 MiB Free Academic Quota</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Cloudflare R2 zero-egress object storage with instant upload/download speeds for PDFs, code files, slides, and sheets.
                    </p>
                  </div>

                  <div className="xp-sunken p-3 bg-[#f9f8f4] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <span>📑</span>
                      <span>In-Browser File Previews</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Inspect PDF lab manuals, Python scripts, SQL files, and images directly in the browser without downloading copies to public hard drives.
                    </p>
                  </div>

                  <div className="xp-sunken p-3 bg-[#f9f8f4] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <span>🔑</span>
                      <span>Cryptographic Recovery Codes</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      5 single-use emergency recovery codes issued upon registration. Reset passwords without requiring a personal email inbox or phone number.
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Live Vault Demo */}
              <div id="demo-section">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 mb-2 border-b border-slate-200 flex items-center justify-between">
                  <span>Interactive Vault Explorer Demo</span>
                  <span className="text-[10px] text-slate-500 lowercase">live simulation</span>
                </div>

                {/* Filter and Search Bar */}
                <div className="p-1.5 bg-[#ece9d8] border border-[#7f9db9] flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDemoFilter('all')}
                      className={`xp-button px-2 py-0.5 text-xs ${demoFilter === 'all' ? 'font-bold bg-[#d4d0c8]' : ''}`}
                    >
                      All Files
                    </button>
                    <button
                      onClick={() => setDemoFilter('starred')}
                      className={`xp-button px-2 py-0.5 text-xs ${demoFilter === 'starred' ? 'font-bold bg-[#d4d0c8]' : ''}`}
                    >
                      ★ Starred
                    </button>
                    <button
                      onClick={() => setDemoFilter('documents')}
                      className={`xp-button px-2 py-0.5 text-xs ${demoFilter === 'documents' ? 'font-bold bg-[#d4d0c8]' : ''}`}
                    >
                      📄 Documents
                    </button>
                    <button
                      onClick={() => setDemoFilter('code')}
                      className={`xp-button px-2 py-0.5 text-xs ${demoFilter === 'code' ? 'font-bold bg-[#d4d0c8]' : ''}`}
                    >
                      💻 Code
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-slate-600 font-bold">Search:</span>
                    <input
                      type="text"
                      value={demoSearch}
                      onChange={(e) => setDemoSearch(e.target.value)}
                      placeholder="Filter files..."
                      className="xp-input px-2 py-0.5 text-xs w-36 sm:w-48"
                    />
                  </div>
                </div>

                {/* Beveled Demo Table */}
                <div className="overflow-x-auto border border-[#7f9db9]">
                  <table className="xp-table w-full text-left text-xs">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left">Name</th>
                        <th className="px-2 py-1 text-left">Type</th>
                        <th className="px-2 py-1 text-right">Size</th>
                        <th className="px-2 py-1 text-left">Date Modified</th>
                        <th className="px-2 py-1 text-center">Favorite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDemoFiles.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-slate-500">
                            No files match the demo search query.
                          </td>
                        </tr>
                      ) : (
                        filteredDemoFiles.map((file) => {
                          const Icon = file.icon;
                          return (
                            <tr key={file.id} className="hover:bg-[#e8f1ff] border-b border-slate-100">
                              <td className="px-2 py-1.5 font-bold text-slate-900">
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span>{file.name}</span>
                                </div>
                              </td>
                              <td className="px-2 py-1.5 text-slate-600 uppercase font-mono text-[11px]">
                                {file.type}
                              </td>
                              <td className="px-2 py-1.5 font-mono text-right text-slate-700">
                                {file.size}
                              </td>
                              <td className="px-2 py-1.5 text-slate-600">
                                {file.date}
                              </td>
                              <td className="px-2 py-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleDemoStar(file.id)}
                                  className="text-amber-500 hover:scale-110 transition-transform text-sm"
                                  title="Toggle star"
                                >
                                  {file.starred ? '★' : '☆'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Comparison Table */}
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 mb-2 border-b border-slate-200">
                  CloudVault vs Personal Drives on Lab PCs
                </div>
                <div className="overflow-x-auto border border-[#7f9db9]">
                  <table className="xp-table w-full text-left text-xs">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left">Security Feature</th>
                        <th className="px-2 py-1 text-left">CloudVault Professional</th>
                        <th className="px-2 py-1 text-left">Personal Google Drive / OneDrive</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="px-2 py-1.5 font-bold">Public PC Safe Mode</td>
                        <td className="px-2 py-1.5 text-emerald-800 font-bold bg-emerald-50/50">
                          ✓ Native HTTP-only sessions
                        </td>
                        <td className="px-2 py-1.5 text-rose-800">
                          ✕ Account remains logged in on public PC
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="px-2 py-1.5 font-bold">Email / Phone Requirement</td>
                        <td className="px-2 py-1.5 text-emerald-800 font-bold bg-emerald-50/50">
                          ✓ None (Private Username)
                        </td>
                        <td className="px-2 py-1.5 text-rose-800">
                          ✕ Personal email, phone, and 2FA linked
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="px-2 py-1.5 font-bold">Account Recovery</td>
                        <td className="px-2 py-1.5 text-emerald-800 font-bold bg-emerald-50/50">
                          ✓ Single-use cryptographic codes
                        </td>
                        <td className="px-2 py-1.5 text-rose-800">
                          ✕ Exposes personal email or SMS OTP
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="px-2 py-1.5 font-bold">In-Browser File Previews</td>
                        <td className="px-2 py-1.5 text-emerald-800 font-bold bg-emerald-50/50">
                          ✓ Built-in (PDF, Code, Images)
                        </td>
                        <td className="px-2 py-1.5 text-slate-700">
                          ⚠️ Frequently prompts to download locally
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1.5 font-bold">Pricing for Students</td>
                        <td className="px-2 py-1.5 text-emerald-800 font-bold bg-emerald-50/50">
                          ✓ ₹0 / 100% Free forever
                        </td>
                        <td className="px-2 py-1.5 text-slate-700">
                          ⚠️ Aggressive storage subscription upsells
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Frequently Asked Questions */}
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 mb-2 border-b border-slate-200">
                  Help &amp; Support Topics (FAQ)
                </div>
                <div className="space-y-1.5">
                  {faqs.map((faq, i) => {
                    const isOpen = expandedFaq === i;
                    return (
                      <div key={i} className="border border-[#7f9db9] bg-[#f9f8f4]">
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(isOpen ? null : i)}
                          className="w-full px-2.5 py-1.5 text-left text-xs font-bold text-slate-900 flex items-center justify-between hover:bg-[#ece9d8]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-blue-800 font-bold">{isOpen ? '[-]' : '[+]'}</span>
                            <span>{faq.q}</span>
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-3 py-2 text-[11px] text-slate-700 bg-[#ffffe1] border-t border-[#d4d0c8] leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="p-4 bg-[#ece9d8] border border-[#7f9db9] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    Ready to secure your lab coursework?
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Create your private vault in 30 seconds. No email required.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/signup"
                    className="xp-button font-bold text-xs px-4 py-1.5"
                  >
                    📝 Create Free Vault
                  </Link>
                  <Link
                    to="/login"
                    className="xp-button text-xs px-3 py-1.5"
                  >
                    🔑 Log On
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* XP Status Bar */}
          <div className="xp-statusbar">
            <div className="xp-status-pane flex-1">
              Ready
            </div>
            <div className="xp-status-pane">
              Zone: Trusted Lab Workstation
            </div>
            <div className="xp-status-pane">
              Object Store: Cloudflare R2
            </div>
            <div className="xp-status-pane">
              CloudVault Professional v2.4.0
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col transition-colors selection:bg-brand-500 selection:text-white relative`}>
      {/* Ambient Lighting & Mesh Canvas */}
      <AmbientBackground isDark={isDark} />

      {/* 1. Shared Lab Computer Safety Notice with Dismiss Cross Option */}
      {!bannerDismissed && (
        <div className={`relative z-50 px-4 py-2 text-xs font-medium flex items-center justify-between border-b backdrop-blur-md transition-all ${
          isDark 
            ? 'bg-amber-950/40 border-amber-900/60 text-amber-200' 
            : 'bg-amber-500/10 border-amber-200/80 text-amber-900'
        }`}>
          <div className="flex-1 flex items-center justify-center gap-2 text-center">
            <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Shared Lab PC Notice:</strong> CloudVault uses HTTP-only session cookies. No personal Google accounts, phone numbers, or passwords left on public browsers.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className={`p-1 rounded-md transition-colors shrink-0 ml-2 ${
              isDark 
                ? 'text-amber-300 hover:text-white hover:bg-amber-500/20' 
                : 'text-amber-700 hover:text-amber-950 hover:bg-amber-500/20'
            }`}
            title="Dismiss notice"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Glassmorphic Floating Navigation Bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-2xl border-b transition-colors shadow-sm ${
        isDark 
          ? 'bg-slate-950/75 border-slate-800/80 text-white' 
          : 'bg-white/85 border-slate-200/80 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-500/25 text-white transition-transform group-hover:scale-105">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  CloudVault
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border backdrop-blur-sm ${
                  isDark 
                    ? 'bg-brand-950/60 text-brand-400 border-brand-900/60' 
                    : 'bg-brand-50 text-brand-600 border-brand-200'
                }`}>
                  Campus Edition
                </span>
              </div>
            </div>
          </Link>

          {/* Quick Nav Links (Desktop) */}
          <nav className={`hidden md:flex items-center gap-6 text-sm font-medium ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            <a href="#demo" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Interactive Demo
            </a>
            <a href="#lab-security" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Lab PC Security
            </a>
            <a href="#how-it-works" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              How It Works
            </a>
            <a href="#faq" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Controls: Segmented Theme Switcher & Auth CTA */}
          <div className="flex items-center gap-3">
            {/* Tactile Segmented Theme Toggle with Explicit Light/Dark Buttons */}
            <ThemeToggle />

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow flex items-center gap-1.5"
              >
                <span>Open Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors backdrop-blur-sm ${
                    isDark 
                      ? 'text-slate-300 hover:text-white hover:bg-slate-900/80' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 flex items-center gap-1.5"
                >
                  <span>Create Vault</span>
                  <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className={`relative z-10 pt-14 pb-16 sm:pt-24 sm:pb-24 border-b overflow-hidden ${
        isDark ? 'border-slate-800/60' : 'border-slate-200/80'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md border text-xs font-medium shadow-sm ${
            isDark 
              ? 'bg-slate-900/70 border-slate-800/80 text-slate-300' 
              : 'bg-white/80 border-slate-200/90 text-slate-700'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Zero Google / OAuth Exposure on Public Computers</span>
          </div>

          {/* Main Title */}
          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Private academic cloud storage for{' '}
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              shared computer labs.
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Store, retrieve, and submit coursework from any laboratory computer without ever logging into personal Gmail, Google Drive, or Microsoft accounts on public workstations.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/35 flex items-center justify-center gap-2 text-sm"
            >
              <span>Create Free Vault (No Email Needed)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className={`w-full sm:w-auto px-6 py-3.5 rounded-xl backdrop-blur-md border font-semibold transition-all shadow-sm flex items-center justify-center gap-2 text-sm ${
                isDark 
                  ? 'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white' 
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <span>Sign In to Existing Vault</span>
            </Link>
          </div>

          {/* Value Prop Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
            <div className={`flex items-center gap-1.5 backdrop-blur-sm px-2.5 py-1 rounded-full border ${
              isDark 
                ? 'bg-slate-900/40 border-slate-800/60 text-slate-300' 
                : 'bg-white/80 border-slate-200/80 text-slate-700 shadow-sm'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Username &amp; Password only</span>
            </div>
            <div className={`flex items-center gap-1.5 backdrop-blur-sm px-2.5 py-1 rounded-full border ${
              isDark 
                ? 'bg-slate-900/40 border-slate-800/60 text-slate-300' 
                : 'bg-white/80 border-slate-200/80 text-slate-700 shadow-sm'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>5 Recovery Codes included</span>
            </div>
            <div className={`flex items-center gap-1.5 backdrop-blur-sm px-2.5 py-1 rounded-full border ${
              isDark 
                ? 'bg-slate-900/40 border-slate-800/60 text-slate-300' 
                : 'bg-white/80 border-slate-200/80 text-slate-700 shadow-sm'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>500 MiB free quota</span>
            </div>
            <div className={`flex items-center gap-1.5 backdrop-blur-sm px-2.5 py-1 rounded-full border ${
              isDark 
                ? 'bg-slate-900/40 border-slate-800/60 text-slate-300' 
                : 'bg-white/80 border-slate-200/80 text-slate-700 shadow-sm'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Automatic lab signout hygiene</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Live Vault Simulator with Translucent Glassmorphism */}
      <section id="demo" className={`py-16 sm:py-20 relative z-10 border-b ${
        isDark ? 'border-slate-800/60' : 'border-slate-200/80'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-200/80 dark:border-brand-800/60 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try The Live Vault Interface</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Experience the fast, uncluttered student workspace
            </h2>
            <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Test the live interactive dashboard below. Filter categories, search files, or toggle stars.
            </p>
          </div>

          {/* Interactive Frosted Glass Vault Card */}
          <div className={`backdrop-blur-2xl rounded-2xl border shadow-2xl overflow-hidden ${
            isDark 
              ? 'bg-slate-900/60 border-slate-800/80 shadow-black/60' 
              : 'bg-white/90 border-slate-200/90 shadow-slate-200/70'
          }`}>
            {/* Window Header */}
            <div className={`px-4 py-3 backdrop-blur-md border-b flex flex-wrap items-center justify-between gap-3 ${
              isDark 
                ? 'bg-slate-950/70 border-slate-800/70' 
                : 'bg-slate-100/90 border-slate-200/80'
            }`}>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className={`text-xs font-medium font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  CloudVault Session &bull; <span className="text-brand-600 dark:text-brand-400 font-semibold">harsh_student</span>
                </div>
              </div>

              {/* Status & Quota */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>🛡 Lab PC Safe Mode: Protected</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className={`font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    142 MiB / 500 MiB (28.4%)
                  </span>
                  <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div className="bg-brand-500 h-full w-[28.4%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Filter Toolbar */}
            <div className={`p-4 border-b backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isDark 
                ? 'bg-slate-900/40 border-slate-800/60' 
                : 'bg-white/80 border-slate-200/70'
            }`}>
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { key: 'all', label: 'All Files' },
                  { key: 'starred', label: 'Starred' },
                  { key: 'documents', label: 'Documents' },
                  { key: 'images', label: 'Images' },
                  { key: 'code', label: 'Code' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setDemoFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                      demoFilter === tab.key
                        ? 'bg-brand-600 text-white shadow-sm'
                        : isDark
                          ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter coursework..."
                  value={demoSearch}
                  onChange={(e) => setDemoSearch(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 backdrop-blur-sm ${
                    isDark 
                      ? 'bg-slate-950/70 border-slate-800/80 text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* File List */}
            <div className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
              {filteredDemoFiles.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No files match your search filter.
                </div>
              ) : (
                filteredDemoFiles.map(file => {
                  const Icon = file.icon;
                  return (
                    <div 
                      key={file.id}
                      className={`p-3.5 sm:px-5 flex items-center justify-between gap-4 transition-colors ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleDemoStar(file.id)}
                          className="text-slate-300 dark:text-slate-600 hover:text-amber-400 transition-colors shrink-0"
                          title="Toggle Star"
                        >
                          <Star className={`w-4 h-4 ${file.starred ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>
                        <div className={`p-2 rounded-lg shrink-0 border ${
                          isDark 
                            ? 'bg-slate-800/70 text-slate-300 border-slate-700/50' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs sm:text-sm font-semibold truncate ${
                            isDark ? 'text-slate-100' : 'text-slate-900'
                          }`}>
                            {file.name}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${file.badgeColor}`}>
                              {file.type}
                            </span>
                            <span>{file.size}</span>
                            <span>&bull;</span>
                            <span>{file.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          className={`p-1.5 rounded-lg text-slate-400 transition-colors ${
                            isDark 
                              ? 'hover:text-slate-200 hover:bg-slate-800/80' 
                              : 'hover:text-slate-800 hover:bg-slate-100'
                          }`}
                          title="In-Browser Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className={`p-1.5 rounded-lg text-slate-400 hover:text-brand-600 transition-colors ${
                            isDark 
                              ? 'hover:bg-brand-950/40' 
                              : 'hover:bg-brand-50'
                          }`}
                          title="Download to PC"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Storage Distribution Bar Footer */}
            <div className={`p-4 backdrop-blur-md border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
              isDark 
                ? 'bg-slate-950/70 border-slate-800/70 text-slate-300' 
                : 'bg-slate-50/90 border-slate-200/80 text-slate-700'
            }`}>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="font-medium">142 MiB of 500 MiB logical quota used (Cloudflare R2)</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Documents
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Images
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Code
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Shared Lab Problem vs. CloudVault Solution */}
      <section id="lab-security" className={`py-16 sm:py-20 relative z-10 border-b ${
        isDark ? 'border-slate-800/60' : 'border-slate-200/80'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Why shared lab computers need CloudVault
            </h2>
            <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Logging into personal Gmail, Google Drive, or Microsoft accounts on public university PCs introduces severe security and privacy vulnerabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Risky Traditional Way */}
            <div className={`p-6 sm:p-7 rounded-2xl backdrop-blur-xl border space-y-4 shadow-lg ${
              isDark 
                ? 'bg-rose-950/25 border-rose-900/50 shadow-rose-950/20 text-slate-300' 
                : 'bg-rose-50/90 border-rose-200 text-slate-700 shadow-rose-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-base">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h3>Traditional Lab PC Workflow</h3>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  High Risk
                </span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Log into personal Gmail / Google Drive on a shared public machine</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Public browser dialog prompts: <em>&ldquo;Save password &amp; sync autofill?&rdquo;</em></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>2FA prompt sent to phone (which often has zero mobile reception in basement labs!)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Download coursework and reports directly onto the shared public desktop</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Forget to log out before rushing to the next lecture</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Next student who sits down has full access to your personal photos, emails, and cloud drive</strong></span>
                </li>
              </ul>
            </div>

            {/* The CloudVault Way */}
            <div className={`p-6 sm:p-7 rounded-2xl backdrop-blur-xl border space-y-4 shadow-lg ${
              isDark 
                ? 'bg-emerald-950/25 border-emerald-900/50 shadow-emerald-950/20 text-slate-300' 
                : 'bg-emerald-50/90 border-emerald-200 text-slate-700 shadow-emerald-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <h3>CloudVault Workflow</h3>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Protected &amp; Safe
                </span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Log in with just username + password in under 5 seconds</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>No personal email, phone number, or Google identity touched</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Preview PDFs, lab code, and experiment results directly in-browser</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Download only the exact coursework file needed for your lab submission</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Click &ldquo;Sign Out&rdquo; &mdash; HTTP-only session cookie is instantly destroyed and browser cache is purged</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Next student sees absolutely nothing &mdash; zero history, zero tokens, zero trace</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Four Core Architectural Pillars */}
      <section className={`py-16 sm:py-20 relative z-10 border-b ${
        isDark ? 'border-slate-800/60' : 'border-slate-200/80'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Built on Modern Security Engineering
            </h2>
            <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Every design decision prioritizes student privacy, cryptographic safety, and ₹0 free-tier sustainability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1 */}
            <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-md hover:-translate-y-1 hover:border-brand-500/40 transition-all duration-300 space-y-3 ${
              isDark 
                ? 'bg-slate-900/60 border-slate-800/80 shadow-black/40 text-slate-300' 
                : 'bg-white/80 border-slate-200/90 shadow-slate-200/50 text-slate-600'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200/50 dark:border-brand-800/50">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Zero Personal Data
              </h3>
              <p className="text-xs leading-relaxed">
                No phone, no email, no Google OAuth. University students can open and close their session without linking personal identity.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-md hover:-translate-y-1 hover:border-purple-500/40 transition-all duration-300 space-y-3 ${
              isDark 
                ? 'bg-slate-900/60 border-slate-800/80 shadow-black/40 text-slate-300' 
                : 'bg-white/80 border-slate-200/90 shadow-slate-200/50 text-slate-600'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/50 dark:border-purple-800/50">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                5 Recovery Codes
              </h3>
              <p className="text-xs leading-relaxed">
                Cryptographically random one-time recovery codes. Stored only as SHA-256 hashes in MongoDB. Once used, a code can never be reused.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-md hover:-translate-y-1 hover:border-cyan-500/40 transition-all duration-300 space-y-3 ${
              isDark 
                ? 'bg-slate-900/60 border-slate-800/80 shadow-black/40 text-slate-300' 
                : 'bg-white/80 border-slate-200/90 shadow-slate-200/50 text-slate-600'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-200/50 dark:border-cyan-800/50">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Cloudflare R2 Storage
              </h3>
              <p className="text-xs leading-relaxed">
                Fast S3-compatible binary storage with 0 egress bandwidth fees. Logical 500 MiB quota allocated on-demand, not pre-allocated.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-md hover:-translate-y-1 hover:border-amber-500/40 transition-all duration-300 space-y-3 ${
              isDark 
                ? 'bg-slate-900/60 border-slate-800/80 shadow-black/40 text-slate-300' 
                : 'bg-white/80 border-slate-200/90 shadow-slate-200/50 text-slate-600'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/50">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                In-App File Previews
              </h3>
              <p className="text-xs leading-relaxed">
                Inspect PDFs, lab images, source code, and text directly in your browser without downloading files to the public PC's desktop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How It Works (3 Steps) */}
      <section id="how-it-works" className={`py-16 sm:py-20 relative z-10 border-b ${
        isDark ? 'border-slate-800/60' : 'border-slate-200/80'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              How a student uses CloudVault in the lab
            </h2>
            <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Three simple steps for safe, zero-trace academic computing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl backdrop-blur-xl border space-y-3 relative shadow-md ${
              isDark 
                ? 'bg-slate-900/60 border-slate-800/80 shadow-black/30' 
                : 'bg-white/85 border-slate-200/90 shadow-slate-200/40'
            }`}>
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-brand-500/30">
                1
              </div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Enter Vault in 5 Seconds
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Sit down at any lab workstation, navigate to CloudVault, and enter your username and password. No two-factor SMS or Gmail prompt on the public screen.
              </p>
            </div>

            <div className={`p-6 rounded-2xl backdrop-blur-xl border space-y-3 relative shadow-md ${
              isDark 
                ? 'bg-slate-900/60 border-slate-800/80 shadow-black/30' 
                : 'bg-white/85 border-slate-200/90 shadow-slate-200/40'
            }`}>
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-brand-500/30">
                2
              </div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Work with Coursework
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Download the lab report template, view sample outputs in the browser, or drop newly completed project code right into your vault.
              </p>
            </div>

            <div className={`p-6 rounded-2xl backdrop-blur-xl border space-y-3 relative shadow-md ${
              isDark 
                ? 'bg-slate-900/60 border-slate-800/80 shadow-black/30' 
                : 'bg-white/85 border-slate-200/90 shadow-slate-200/40'
            }`}>
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-brand-500/30">
                3
              </div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Clean Exit &amp; Hygiene
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Click Sign Out. The server immediately destroys your session cookie. Follow the lab hygiene checklist to delete temporary files from the PC.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section id="faq" className={`py-16 sm:py-20 relative z-10 border-b ${
        isDark ? 'border-slate-800/60' : 'border-slate-200/80'
      }`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Frequently Asked Questions
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Clear answers regarding student safety, recovery codes, and quotas.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div 
                  key={idx}
                  className={`rounded-xl border backdrop-blur-xl overflow-hidden shadow-sm transition-colors ${
                    isDark 
                      ? 'bg-slate-900/50 border-slate-800/80' 
                      : 'bg-white/85 border-slate-200/90 shadow-slate-100'
                  }`}
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className={`w-full p-4 text-left font-semibold text-sm flex items-center justify-between gap-4 transition-colors ${
                      isDark 
                        ? 'text-white hover:bg-slate-800/60' 
                        : 'text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{faq.q}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className={`p-4 pt-1 text-xs sm:text-sm leading-relaxed border-t ${
                      isDark 
                        ? 'text-slate-300 border-slate-800/60' 
                        : 'text-slate-600 border-slate-100'
                    }`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Live System Health Bar */}
      {health && (
        <div className={`relative z-10 backdrop-blur-md border-b py-3 px-4 text-center ${
          isDark 
            ? 'bg-slate-950/60 border-slate-800/60 text-slate-400' 
            : 'bg-white/80 border-slate-200/70 text-slate-600'
        }`}>
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              API Status: Online &amp; Operational
            </span>
            <span>&bull;</span>
            <span>Database: <strong className={isDark ? 'text-slate-300' : 'text-slate-800'}>{health.database}</strong></span>
            <span>&bull;</span>
            <span>Storage Provider: <strong className={isDark ? 'text-slate-300' : 'text-slate-800'}>{health.storageProvider === 'r2' ? 'Cloudflare R2' : 'Local Storage'}</strong></span>
            <span>&bull;</span>
            <span>Default Quota: <strong className={isDark ? 'text-slate-300' : 'text-slate-800'}>{health.limits?.defaultQuotaMiB} MiB</strong></span>
          </div>
        </div>
      )}

      {/* 10. Glassmorphic Footer */}
      <footer className={`relative z-10 py-8 backdrop-blur-2xl text-xs border-t ${
        isDark 
          ? 'bg-slate-950/70 border-slate-800/60 text-slate-400' 
          : 'bg-white/85 border-slate-200/80 text-slate-600 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-brand-600" />
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>CloudVault</span>
            <span>&bull;</span>
            <span>Private University Lab Cloud Storage</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Harsh007engineering/CloudVault"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors flex items-center gap-1 ${
                isDark ? 'hover:text-white' : 'hover:text-slate-950'
              }`}
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <Link to="/login" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}>
              Sign In
            </Link>
            <Link to="/signup" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}>
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
