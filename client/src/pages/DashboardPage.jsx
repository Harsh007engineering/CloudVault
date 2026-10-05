import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  Search, 
  ArrowUpDown, 
  Download, 
  Edit3, 
  Trash2, 
  FileText, 
  HardDrive, 
  RefreshCw, 
  LayoutGrid, 
  List as ListIcon, 
  FolderPlus, 
  AlertCircle,
  Star,
  Eye,
  CheckSquare,
  Square,
  Sparkles,
  Command,
  X,
  MoreVertical,
  Info,
  FileCode,
  Folder
} from 'lucide-react';
import api, { getFileDownloadUrl } from '../services/api';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import LabReminderBanner from '../components/layout/LabReminderBanner';
import FileUploadModal from '../components/modals/FileUploadModal';
import RenameModal from '../components/modals/RenameModal';
import DeleteModal from '../components/modals/DeleteModal';
import ForcePasswordModal from '../components/modals/ForcePasswordModal';
import FilePreviewModal from '../components/modals/FilePreviewModal';
import GlobalDropzone from '../components/files/GlobalDropzone';
import BatchActionBar from '../components/files/BatchActionBar';
import StorageBreakdownWidget from '../components/storage/StorageBreakdownWidget';
import AmbientBackground from '../components/common/AmbientBackground';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/useTheme';
import { formatBytes, formatDate, getFileTypeMeta } from '../utils/formatters';

export default function DashboardPage() {
  const { user, updateStorage } = useAuth();
  const { success, error: toastError } = useToast();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'starred', 'document', 'image', 'spreadsheet', 'presentation', 'code', 'archive'
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Sidebar mobile drawer & row dropdown states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeMenuFileId, setActiveMenuFileId] = useState(null);

  useEffect(() => {
    const handleCloseMenu = () => setActiveMenuFileId(null);
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, []);

  // Debounce search query to prevent rapid-fire requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Multi-select state
  const [selectedFileIds, setSelectedFileIds] = useState([]);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [fileToPreview, setFileToPreview] = useState(null);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  const searchInputRef = useRef(null);

  // Keep stable callback refs to isolate fetchFiles from context mutations
  const updateStorageRef = useRef(updateStorage);
  updateStorageRef.current = updateStorage;

  const toastErrorRef = useRef(toastError);
  toastErrorRef.current = toastError;

  // Fetch files and storage stats
  const fetchFiles = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }
    try {
      const [filesRes, statsRes] = await Promise.all([
        api.get('/files', {
          params: {
            search: debouncedSearch || undefined,
            sort: sortOption,
            starred: selectedCategory === 'starred' ? 'true' : undefined
          }
        }),
        api.get('/files/stats')
      ]);

      if (filesRes.success) {
        setFiles(filesRes.data.files);
        updateStorageRef.current?.(filesRes.data.storageUsed, filesRes.data.storageLimit);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      toastErrorRef.current?.(err.message || 'Failed to fetch vault files');
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  }, [debouncedSearch, sortOption, selectedCategory]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Global Keyboard Shortcuts (Ctrl+K or / for search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDownload = (file) => {
    window.location.href = getFileDownloadUrl(file._id);
  };

  const handleToggleStar = async (file) => {
    // Optimistic UI update
    setFiles((prev) =>
      prev.map((f) => (f._id === file._id ? { ...f, isStarred: !f.isStarred } : f))
    );
    if (fileToPreview && fileToPreview._id === file._id) {
      setFileToPreview((prev) => ({ ...prev, isStarred: !prev.isStarred }));
    }

    try {
      const res = await api.patch(`/files/${file._id}/star`);
      if (res.success) {
        success(res.message);
      }
    } catch (err) {
      // Revert on error
      setFiles((prev) =>
        prev.map((f) => (f._id === file._id ? { ...f, isStarred: file.isStarred } : f))
      );
      toastError('Failed to update star');
    }
  };

  const onFileRenamed = (updatedFile) => {
    setFiles((prev) => prev.map((f) => (f._id === updatedFile._id ? updatedFile : f)));
    if (fileToPreview && fileToPreview._id === updatedFile._id) {
      setFileToPreview(updatedFile);
    }
  };

  const onFileDeleted = (deletedId) => {
    setFiles((prev) => prev.filter((f) => f._id !== deletedId));
    setSelectedFileIds((prev) => prev.filter((id) => id !== deletedId));
    if (fileToPreview && fileToPreview._id === deletedId) {
      setFileToPreview(null);
    }
    // Refresh stats
    api.get('/files/stats').then((res) => res.success && setStats(res.data)).catch(() => {});
  };

  // Multi-select handlers
  const handleSelectToggle = (id) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFileIds.length === filteredFiles.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(filteredFiles.map((f) => f._id));
    }
  };

  // Batch download
  const handleDownloadBatch = () => {
    selectedFileIds.forEach((id, idx) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = getFileDownloadUrl(id);
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, idx * 400);
    });
    success(`Downloading ${selectedFileIds.length} files...`);
  };

  // Batch delete
  const handleBatchDelete = async () => {
    if (selectedFileIds.length === 0) return;
    if (!window.confirm(`Permanently delete all ${selectedFileIds.length} selected files?`)) return;

    setIsBatchDeleting(true);
    try {
      const res = await api.post('/files/batch-delete', { fileIds: selectedFileIds });
      if (res.success) {
        success(`Successfully deleted ${res.data.deletedCount} files.`);
        updateStorage(res.data.storageUsed, res.data.storageLimit);
        setFiles((prev) => prev.filter((f) => !selectedFileIds.includes(f._id)));
        setSelectedFileIds([]);
        // Refresh stats
        api.get('/files/stats').then((s) => s.success && setStats(s.data)).catch(() => {});
      }
    } catch (err) {
      toastError(err.message || 'Batch delete failed');
    } finally {
      setIsBatchDeleting(false);
    }
  };

  // Handle files dropped via GlobalDropzone
  const handleFilesDropped = () => {
    setIsUploadOpen(true);
  };

  // Filter files by category tabs
  const filteredFiles = files.filter((file) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'starred') return file.isStarred;
    const meta = getFileTypeMeta(file.originalName, file.mimeType);
    return meta.category === selectedCategory;
  });

  const allSelected = filteredFiles.length > 0 && selectedFileIds.length === filteredFiles.length;

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } flex flex-col antialiased transition-colors relative selection:bg-brand-500 selection:text-white`}>
      {/* Dynamic Ambient Background Canvas */}
      <AmbientBackground isDark={isDark} />

      {/* Global Window Drag & Drop Overlay */}
      <GlobalDropzone onFilesDropped={handleFilesDropped} />

      {/* Lab Security Reminder Banner */}
      <LabReminderBanner />

      {/* Modern Top Navbar */}
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />

      {/* Mandatory password change modal if flagged by admin */}
      <ForcePasswordModal isOpen={!!user?.forcePasswordChange} />

      {/* File Modals */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={fetchFiles}
      />

      <RenameModal
        file={fileToRename}
        isOpen={!!fileToRename}
        onClose={() => setFileToRename(null)}
        onRenamed={onFileRenamed}
      />

      <DeleteModal
        file={fileToDelete}
        isOpen={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onDeleted={onFileDeleted}
      />

      <FilePreviewModal
        file={fileToPreview}
        isOpen={!!fileToPreview}
        onClose={() => setFileToPreview(null)}
        onToggleStar={handleToggleStar}
        onRenameRequest={setFileToRename}
        onDeleteRequest={setFileToDelete}
      />

      {/* Floating Batch Action Bar */}
      <BatchActionBar
        selectedCount={selectedFileIds.length}
        onDownloadBatch={handleDownloadBatch}
        onDeleteBatch={handleBatchDelete}
        onClearSelection={() => setSelectedFileIds([])}
      />

      {/* Main Layout Container with Sidebar and Content */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onSelectRecent={() => {
            setSelectedCategory('all');
            setSortOption('date_desc');
          }}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenRecoveryCodes={() => navigate('/security')}
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 relative z-10 min-w-0">
        {/* Header Action Bar */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/90'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-2xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Academic Cloud Vault
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-sm ${
                isDark 
                  ? 'bg-brand-950/60 text-brand-300 border-brand-800/80' 
                  : 'bg-brand-50 text-brand-700 border-brand-200 shadow-sm'
              }`}>
                Encrypted &amp; Private
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Store, preview, and organize your coursework securely across university computers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchFiles(true)}
              disabled={isRefreshing}
              className={`p-2.5 rounded-xl border transition-colors shadow-sm disabled:opacity-50 ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' 
                  : 'bg-white/90 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Refresh files"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/25 transition-all flex items-center gap-2 group active:translate-y-0.5"
            >
              <UploadCloud className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              <span>Upload Coursework</span>
            </button>
          </div>
        </div>

        {/* Visual Storage Breakdown Analytics Widget */}
        <div className="mt-6">
          <StorageBreakdownWidget stats={stats} user={user} />
        </div>

        {/* Filter Navigation, Search Bar & View Modes */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Files' },
              { id: 'starred', label: 'Starred', icon: Star },
              { id: 'document', label: 'Documents' },
              { id: 'image', label: 'Images' },
              { id: 'spreadsheet', label: 'Sheets' },
              { id: 'presentation', label: 'Slides' },
              { id: 'code', label: 'Code', icon: FileCode },
              { id: 'archive', label: 'Archives' }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                      : isDark
                        ? 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'bg-white/90 border border-slate-200/90 text-slate-700 hover:bg-white hover:text-slate-900 shadow-sm'
                  }`}
                >
                  {TabIcon && (
                    <TabIcon className={`w-3.5 h-3.5 ${isSelected ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search and Sort Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search Input with Hotkey Tooltip */}
            <div className="relative flex-1 sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className={`w-full pl-9 pr-12 py-1.5 text-xs rounded-xl transition-all focus:outline-none ${
                  isDark 
                    ? 'bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 shadow-sm' 
                    : 'bg-white/95 border border-slate-300/90 text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 shadow-sm'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <kbd className={`hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono border rounded ${
                  isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-500 bg-slate-100 border-slate-200'
                }`}>
                  /
                </kbd>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className={`appearance-none rounded-xl px-3 py-1.5 pr-8 text-xs font-medium focus:outline-none shadow-sm cursor-pointer border ${
                  isDark 
                    ? 'bg-slate-900/90 border-slate-800 text-slate-200 focus:ring-2 focus:ring-brand-500/50' 
                    : 'bg-white/95 border-slate-300/90 text-slate-800 focus:ring-4 focus:ring-brand-500/15'
                }`}
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="name_asc">Name (A–Z)</option>
                <option value="name_desc">Name (Z–A)</option>
                <option value="size_desc">Largest First</option>
                <option value="size_asc">Smallest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className={`hidden sm:flex items-center rounded-xl p-0.5 shadow-sm border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white/90 border-slate-200/90'
            }`}>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? isDark 
                      ? 'bg-slate-800 text-brand-400' 
                      : 'bg-slate-100 text-brand-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="List view"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? isDark 
                      ? 'bg-slate-800 text-brand-400' 
                      : 'bg-slate-100 text-brand-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* File Content Area */}
        <div className="mt-6">
          {initialLoading ? (
            /* Skeleton Loading State (Initial Mount Only) */
            <div className={`border rounded-3xl shadow-sm p-4 divide-y ${
              isDark ? 'bg-slate-900/70 border-slate-800 divide-slate-800' : 'bg-white/90 border-slate-200/90 divide-slate-100'
            }`}>
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="py-3 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                    <div className="space-y-1.5">
                      <div className={`h-3 w-48 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                      <div className={`h-2 w-24 rounded ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`}></div>
                    </div>
                  </div>
                  <div className={`h-3 w-16 rounded ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`}></div>
                </div>
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            /* Premium Empty State */
            <div className={`border-2 border-dashed rounded-3xl p-14 text-center backdrop-blur-xl transition-all ${
              isDark 
                ? 'bg-slate-900/60 border-slate-800' 
                : 'bg-white/85 border-slate-300/80 shadow-xl shadow-slate-200/40'
            }`}>
              <div className={`w-16 h-16 border rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm ${
                isDark 
                  ? 'bg-slate-800 border-slate-700/80 text-slate-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                {searchQuery ? (
                  <Search className="w-8 h-8 text-slate-400" />
                ) : selectedCategory === 'starred' ? (
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-brand-500" />
                )}
              </div>
              <h3 className={`text-base font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {searchQuery
                  ? 'No matching files found'
                  : selectedCategory === 'starred'
                  ? 'No starred files yet'
                  : 'Your vault is empty'}
              </h3>
              <p className={`text-xs max-w-sm mx-auto mt-1 leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {searchQuery
                  ? `No files matched "${searchQuery}". Press Esc to clear search.`
                  : selectedCategory === 'starred'
                  ? 'Click the star icon on any document or assignment to keep it pinned here for quick access.'
                  : 'Upload your first assignment, project, or lab file.'}
              </p>
              {!searchQuery && selectedCategory !== 'starred' && (
                <div className="mt-5 space-y-3">
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all active:translate-y-0.5"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>+ Upload Files</span>
                  </button>
                  <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Your files are stored privately and are not associated with an email account.
                  </p>
                </div>
              )}
            </div>
          ) : viewMode === 'list' ? (
            /* Table / List View */
            <div className={`border rounded-3xl overflow-hidden backdrop-blur-xl transition-all ${
              isDark 
                ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/40 ring-1 ring-white/5' 
                : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/60 ring-1 ring-slate-900/5'
            }`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y text-left text-xs">
                  <thead className={`font-semibold uppercase tracking-wider ${
                    isDark ? 'bg-slate-950/60 text-slate-400 divide-slate-800' : 'bg-slate-50/90 text-slate-600 divide-slate-200'
                  }`}>
                    <tr>
                      <th className="py-3 px-4 w-10">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="p-1 rounded text-slate-400 hover:text-slate-600"
                          title={allSelected ? 'Deselect all' : 'Select all'}
                        >
                          {allSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Uploaded</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                    {filteredFiles.map((file) => {
                      const meta = getFileTypeMeta(file.originalName, file.mimeType);
                      const Icon = meta.icon;
                      const isSelected = selectedFileIds.includes(file._id);
                      const isMenuOpen = activeMenuFileId === file._id;

                      return (
                        <tr
                          key={file._id}
                          className={`transition-colors group ${
                            isSelected 
                              ? isDark ? 'bg-brand-950/30' : 'bg-brand-50/70' 
                              : isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => handleSelectToggle(file._id)}
                              className="p-1 rounded text-slate-400 hover:text-brand-600"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-brand-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleStar(file)}
                                className="p-1 text-slate-300 hover:text-amber-400 transition-colors shrink-0"
                                title={file.isStarred ? 'Unstar file' : 'Star file'}
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    file.isStarred ? 'fill-amber-400 text-amber-500' : ''
                                  }`}
                                />
                              </button>

                              <div className={`p-2 rounded-xl border ${meta.color} shrink-0`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span
                                  className={`font-semibold hover:text-brand-600 truncate block cursor-pointer select-none ${
                                    isDark ? 'text-slate-200' : 'text-slate-800'
                                  }`}
                                  onClick={() => setFileToPreview(file)}
                                  title={file.originalName}
                                >
                                  {file.originalName}
                                </span>
                                <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {meta.type} &bull; {formatBytes(file.size)} &bull; {formatDate(file.createdAt)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${meta.badge}`}>
                              {meta.type}
                            </span>
                          </td>
                          <td className={`py-3 px-4 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {formatBytes(file.size)}
                          </td>
                          <td className={`py-3 px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {formatDate(file.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1 relative">
                              <button
                                onClick={() => setFileToPreview(file)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                                title="Quick Preview"
                                aria-label="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownload(file)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isDark ? 'text-slate-400 hover:text-brand-400 hover:bg-brand-950/40' : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'
                                }`}
                                title="Download"
                                aria-label="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              {/* More Actions Dropdown Toggle */}
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuFileId(isMenuOpen ? null : file._id);
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isMenuOpen
                                      ? isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900'
                                      : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                  }`}
                                  title="More actions"
                                  aria-label="More actions"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {isMenuOpen && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className={`absolute right-0 top-full mt-1 w-44 rounded-2xl shadow-xl z-30 border backdrop-blur-xl py-1.5 text-left text-xs ${
                                      isDark 
                                        ? 'bg-slate-900/95 border-slate-700/80 text-slate-200 shadow-black/60' 
                                        : 'bg-white/95 border-slate-200/90 text-slate-700 shadow-slate-200/70'
                                    }`}
                                  >
                                    <button
                                      onClick={() => {
                                        setFileToPreview(file);
                                        setActiveMenuFileId(null);
                                      }}
                                      className={`w-full px-3 py-2 flex items-center gap-2.5 transition-colors ${
                                        isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Preview</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDownload(file);
                                        setActiveMenuFileId(null);
                                      }}
                                      className={`w-full px-3 py-2 flex items-center gap-2.5 transition-colors ${
                                        isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      <Download className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Download</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setFileToRename(file);
                                        setActiveMenuFileId(null);
                                      }}
                                      className={`w-full px-3 py-2 flex items-center gap-2.5 transition-colors ${
                                        isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Rename</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleToggleStar(file);
                                        setActiveMenuFileId(null);
                                      }}
                                      className={`w-full px-3 py-2 flex items-center gap-2.5 transition-colors ${
                                        isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                                      <span>{file.isStarred ? 'Unstar' : 'Star'}</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setFileToPreview(file);
                                        setActiveMenuFileId(null);
                                      }}
                                      className={`w-full px-3 py-2 flex items-center gap-2.5 transition-colors ${
                                        isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      <Info className="w-3.5 h-3.5 text-slate-400" />
                                      <span>File details</span>
                                    </button>
                                    <div className={`my-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />
                                    <button
                                      onClick={() => {
                                        setFileToDelete(file);
                                        setActiveMenuFileId(null);
                                      }}
                                      className="w-full px-3 py-2 flex items-center gap-2.5 text-rose-600 hover:bg-rose-500/10 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => {
                const meta = getFileTypeMeta(file.originalName, file.mimeType);
                const Icon = meta.icon;
                const isSelected = selectedFileIds.includes(file._id);
                const isMenuOpen = activeMenuFileId === file._id;

                return (
                  <div
                    key={file._id}
                    className={`rounded-3xl p-4 backdrop-blur-xl transition-all flex flex-col justify-between group border relative ${
                      isSelected 
                        ? 'border-brand-500 ring-2 ring-brand-500/20' 
                        : isDark
                          ? 'bg-slate-900/70 border-slate-800/80 shadow-md hover:shadow-xl hover:border-slate-700 ring-1 ring-white/5'
                          : 'bg-white/90 border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 ring-1 ring-slate-900/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectToggle(file._id)}
                            className="p-1 rounded text-slate-400 hover:text-brand-600"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-brand-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <div className={`p-2.5 rounded-xl border ${meta.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleStar(file)}
                            className="p-1 text-slate-300 hover:text-amber-400 transition-colors"
                            title={file.isStarred ? 'Unstar file' : 'Star file'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                file.isStarred ? 'fill-amber-400 text-amber-500' : ''
                              }`}
                            />
                          </button>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${meta.badge}`}>
                            {meta.type}
                          </span>
                        </div>
                      </div>

                      <h4
                        className={`text-xs font-bold truncate hover:text-brand-600 cursor-pointer ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                        onClick={() => setFileToPreview(file)}
                        title={file.originalName}
                      >
                        {file.originalName}
                      </h4>
                      <p className={`text-[11px] mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {meta.type} &bull; {formatBytes(file.size)} &bull; {formatDate(file.createdAt)}
                      </p>
                    </div>

                    <div className={`mt-4 pt-3 border-t flex items-center justify-between relative ${
                      isDark ? 'border-slate-800' : 'border-slate-100'
                    }`}>
                      <button
                        onClick={() => setFileToPreview(file)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownload(file)}
                          className={`p-1 rounded transition-colors ${
                            isDark ? 'text-slate-400 hover:text-brand-400' : 'text-slate-500 hover:text-brand-600'
                          }`}
                          title="Download"
                          aria-label="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuFileId(isMenuOpen ? null : file._id);
                            }}
                            className={`p-1 rounded transition-colors ${
                              isMenuOpen
                                ? isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900'
                                : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                            title="More actions"
                            aria-label="More actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute right-0 bottom-full mb-1 w-44 rounded-2xl shadow-xl z-30 border backdrop-blur-xl py-1.5 text-left text-xs ${
                                isDark 
                                  ? 'bg-slate-900/95 border-slate-700/80 text-slate-200 shadow-black/60' 
                                  : 'bg-white/95 border-slate-200/90 text-slate-700 shadow-slate-200/70'
                              }`}
                            >
                              <button
                                onClick={() => {
                                  setFileToPreview(file);
                                  setActiveMenuFileId(null);
                                }}
                                className={`w-full px-3 py-2 flex items-center gap-2.5 transition-colors ${
                                  isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleDownload(file);
                                  setActiveMenuFileId(null);
                                }}
                                className={`w-full px-3 py-2 flex items-center gap-2.5 transition-colors ${
                                  isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <Download className="w-3.5 h-3.5 text-slate-400" />
                                <span>Download</span>
                              </button>
                              <button
                                onClick={() => {
                                  setFileToRename(file);
                                  setActiveMenuFileId(null);
                                }}
                                className={`w-full px-3 py-2 flex items-center gap-2.5 transition-colors ${
                                  isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Rename</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleToggleStar(file);
                                  setActiveMenuFileId(null);
                                }}
                                className={`w-full px-3 py-2 flex items-center gap-2.5 transition-colors ${
                                  isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                                <span>{file.isStarred ? 'Unstar' : 'Star'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setFileToPreview(file);
                                  setActiveMenuFileId(null);
                                }}
                                className={`w-full px-3 py-2 flex items-center gap-2.5 transition-colors ${
                                  isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <Info className="w-3.5 h-3.5 text-slate-400" />
                                <span>File details</span>
                              </button>
                              <div className={`my-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />
                              <button
                                onClick={() => {
                                  setFileToDelete(file);
                                  setActiveMenuFileId(null);
                                }}
                                className="w-full px-3 py-2 flex items-center gap-2.5 text-rose-600 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}
