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
    name: 'CS201_Algorithm_Analysis_Report.pdf',
    category: 'documents',
    type: 'PDF',
    size: '2.4 MB',
    date: '2 hours ago',
    starred: true,
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60',
    icon: FileText
  },
  {
    id: 2,
    name: 'Circuit_Oscilloscope_Waveform.png',
    category: 'images',
    type: 'IMG',
    size: '1.1 MB',
    date: 'Yesterday',
    starred: true,
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
    icon: ImageIcon
  },
  {
    id: 3,
    name: 'Embedded_Robotics_Firmware.cpp',
    category: 'code',
    type: 'CODE',
    size: '48 KB',
    date: '3 days ago',
    starred: false,
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60',
    icon: FileCode
  },
  {
    id: 4,
    name: 'Final_Semester_Project_Archive.zip',
    category: 'archives',
    type: 'ZIP',
    size: '8.9 MB',
    date: 'Oct 2, 2026',
    starred: false,
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900/60',
    icon: FolderArchive
  }
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
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
      q: "Why does CloudVault deliberately not require an email or phone number?",
      a: "Shared university computer laboratories are public environments. Requiring Gmail or Microsoft accounts exposes personal data, email inboxes, search history, and browser autofill passwords to other students. CloudVault provides a completely isolated, academic-only storage vault."
    },
    {
      q: "How do I reset my password if I don't have an email on file?",
      a: "When you create your account, CloudVault generates 5 cryptographically secure one-time recovery codes (e.g. 8K4P-X92M). If you forget your password, simply enter your username and any unused recovery code to immediately set a new password."
    },
    {
      q: "Can other students or computers in the lab access my files?",
      a: "No. Every user's files are strictly isolated with database-level ownership checks ({ _id: fileId, userId: req.user._id }). Furthermore, sessions are protected by HTTP-only cookies, and our anti-cache headers prevent shared browsers from saving local copies of downloaded files."
    },
    {
      q: "What happens when I reach my 500 MiB storage limit?",
      a: "The 500 MiB storage quota is a logical limit. You can easily delete old coursework or archives to reclaim space immediately. University administrators also have the capability to adjust individual student quotas if special research projects require more capacity."
    },
    {
      q: "Is CloudVault really ₹0/month to operate?",
      a: "Yes! CloudVault is specifically designed around free-tier cloud infrastructure: MongoDB Atlas Free M0 (512 MB metadata), Cloudflare R2 (10 GB object storage with ₹0 egress bandwidth fees), and Vercel/Render free tiers."
    }
  ];

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
                  <span>Lab PC Safe Mode</span>
                </div>
                <div className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  142 MiB / 500 MiB (28%)
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
            {/* The Risky Way */}
            <div className={`p-6 rounded-2xl backdrop-blur-xl border space-y-4 shadow-lg ${
              isDark 
                ? 'bg-rose-950/25 border-rose-900/50 shadow-rose-950/20 text-slate-300' 
                : 'bg-rose-50/90 border-rose-200 text-slate-700 shadow-rose-100'
            }`}>
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-base">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3>The Risky Way: Gmail &amp; Google Drive on Lab PCs</h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Forgotten Sessions:</strong> Students frequently forget to log out when class ends, exposing personal email and Drive to whoever sits down next.</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Browser Autofill Leaks:</strong> Public browsers prompt to save your master password, personal phone number, and autofill credentials.</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Aggressive Disk Caching:</strong> Public PC browsers store submitted exams and private PDFs in workstation disk caches indefinitely.</span>
                </li>
              </ul>
            </div>

            {/* The CloudVault Way */}
            <div className={`p-6 rounded-2xl backdrop-blur-xl border space-y-4 shadow-lg ${
              isDark 
                ? 'bg-emerald-950/25 border-emerald-900/50 shadow-emerald-950/20 text-slate-300' 
                : 'bg-emerald-50/90 border-emerald-200 text-slate-700 shadow-emerald-100'
            }`}>
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h3>The CloudVault Way: Zero-Trace Academic Storage</h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Zero Personal Identifiers:</strong> Only a Username and Password. No personal Gmail, phone number, or social media profile touched.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Tokenless Session Security:</strong> State is protected with server-issued HTTP-only cookies. No tokens in <code className="text-xs bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">localStorage</code>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Mandatory Anti-Cache Headers:</strong> Strict <code className="text-xs bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">Cache-Control: no-store</code> stops shared PCs from storing your files.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Signout Hygiene Checklist:</strong> Automatic reminder modal upon signing out prompts you to purge the local <code className="text-xs bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">Downloads</code> folder.</span>
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
