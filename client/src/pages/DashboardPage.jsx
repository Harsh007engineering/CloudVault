import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  X
} from 'lucide-react';
import api, { getFileDownloadUrl } from '../services/api';
import Navbar from '../components/layout/Navbar';
import LabReminderBanner from '../components/layout/LabReminderBanner';
import FileUploadModal from '../components/modals/FileUploadModal';
import RenameModal from '../components/modals/RenameModal';
import DeleteModal from '../components/modals/DeleteModal';
import ForcePasswordModal from '../components/modals/ForcePasswordModal';
import FilePreviewModal from '../components/modals/FilePreviewModal';
import GlobalDropzone from '../components/files/GlobalDropzone';
import BatchActionBar from '../components/files/BatchActionBar';
import StorageBreakdownWidget from '../components/storage/StorageBreakdownWidget';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatBytes, formatDate, getFileTypeMeta } from '../utils/formatters';

export default function DashboardPage() {
  const { user, updateStorage } = useAuth();
  const { success, error: toastError } = useToast();

  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'starred', 'document', 'image', 'spreadsheet', 'presentation', 'archive'
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Multi-select state
  const [selectedFileIds, setSelectedFileIds] = useState([]);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [fileToPreview, setFileToPreview] = useState(null);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  const searchInputRef = useRef(null);

  // Fetch files and storage stats
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const [filesRes, statsRes] = await Promise.all([
        api.get('/files', {
          params: {
            search: searchQuery || undefined,
            sort: sortOption,
            starred: selectedCategory === 'starred' ? 'true' : undefined
          }
        }),
        api.get('/files/stats')
      ]);

      if (filesRes.success) {
        setFiles(filesRes.data.files);
        updateStorage(filesRes.data.storageUsed, filesRes.data.storageLimit);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      toastError(err.message || 'Failed to fetch vault files');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortOption, selectedCategory, updateStorage, toastError]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors">
      {/* Global Window Drag & Drop Overlay */}
      <GlobalDropzone onFilesDropped={handleFilesDropped} />

      {/* Lab Security Reminder Banner */}
      <LabReminderBanner />

      {/* Modern Top Navbar */}
      <Navbar />

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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Academic Cloud Vault
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/80">
                Encrypted &amp; Private
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Store, preview, and organize your coursework securely across university computers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchFiles}
              disabled={loading}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
              title="Refresh files"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-600 dark:text-brand-400' : ''}`} />
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/25 transition-all flex items-center gap-2 group"
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
              { id: 'archive', label: 'Archives' }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === tab.id
                      ? 'bg-slate-900 dark:bg-brand-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {TabIcon && (
                    <TabIcon className={`w-3.5 h-3.5 ${selectedCategory === tab.id ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
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
                className="w-full pl-9 pr-12 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 shadow-sm transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                  /
                </kbd>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 shadow-sm cursor-pointer"
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
            <div className="hidden sm:flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="List view"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
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
          {loading && files.length === 0 ? (
            /* Skeleton Loading State */
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-4 divide-y divide-slate-100 dark:divide-slate-800">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="py-3 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                    <div className="space-y-1.5">
                      <div className="h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
                    </div>
                  </div>
                  <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            /* Premium Empty State */
            <div className="bg-white dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-14 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500 mb-4 shadow-sm">
                {selectedCategory === 'starred' ? (
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                ) : (
                  <FolderPlus className="w-8 h-8 text-brand-500" />
                )}
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {searchQuery
                  ? 'No matching files found'
                  : selectedCategory === 'starred'
                  ? 'No starred files yet'
                  : 'Your academic vault is empty'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                {searchQuery
                  ? `No files matched "${searchQuery}". Press Esc to clear search.`
                  : selectedCategory === 'starred'
                  ? 'Click the star icon on any document or assignment to keep it pinned here for quick access.'
                  : 'Drag & drop your files anywhere onto this page or click below to upload.'}
              </p>
              {!searchQuery && selectedCategory !== 'starred' && (
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload First File
                </button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            /* Table / List View */
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-10">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title={allSelected ? 'Deselect all' : 'Select all'}
                        >
                          {allSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
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
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredFiles.map((file) => {
                      const meta = getFileTypeMeta(file.originalName, file.mimeType);
                      const Icon = meta.icon;
                      const isSelected = selectedFileIds.includes(file._id);

                      return (
                        <tr
                          key={file._id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group ${
                            isSelected ? 'bg-brand-50/40 dark:bg-brand-950/30' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => handleSelectToggle(file._id)}
                              className="p-1 rounded text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleStar(file)}
                                className="p-1 text-slate-300 dark:text-slate-600 hover:text-amber-400 dark:hover:text-amber-400 transition-colors"
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
                              <span
                                className="font-semibold text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 truncate max-w-xs sm:max-w-md cursor-pointer select-none"
                                onClick={() => setFileToPreview(file)}
                                title={file.originalName}
                              >
                                {file.originalName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${meta.badge}`}>
                              {meta.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                            {formatBytes(file.size)}
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                            {formatDate(file.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setFileToPreview(file)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Quick Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownload(file)}
                                className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-lg transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setFileToRename(file)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                                title="Rename"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setFileToDelete(file)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

                return (
                  <div
                    key={file._id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                      isSelected 
                        ? 'border-brand-500 ring-2 ring-brand-500/20 dark:ring-brand-500/30' 
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectToggle(file._id)}
                            className="p-1 rounded text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
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
                            className="p-1 text-slate-300 dark:text-slate-600 hover:text-amber-400 transition-colors"
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
                        className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
                        onClick={() => setFileToPreview(file)}
                        title={file.originalName}
                      >
                        {file.originalName}
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                        {formatBytes(file.size)} &bull; {formatDate(file.createdAt)}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setFileToPreview(file)}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setFileToRename(file)}
                          className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded transition-colors"
                          title="Rename"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
  );
}
