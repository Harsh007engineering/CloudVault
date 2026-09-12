import React, { useState, useEffect, useCallback } from 'react';
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
  AlertCircle 
} from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import LabReminderBanner from '../components/layout/LabReminderBanner';
import FileUploadModal from '../components/modals/FileUploadModal';
import RenameModal from '../components/modals/RenameModal';
import DeleteModal from '../components/modals/DeleteModal';
import ForcePasswordModal from '../components/modals/ForcePasswordModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatBytes, formatDate, getFileTypeMeta } from '../utils/formatters';

export default function DashboardPage() {
  const { user, updateStorage } = useAuth();
  const { success, error: toastError } = useToast();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/files', {
        params: {
          search: searchQuery || undefined,
          sort: sortOption
        }
      });
      if (res.success) {
        setFiles(res.data.files);
        updateStorage(res.data.storageUsed, res.data.storageLimit);
      }
    } catch (err) {
      toastError(err.message || 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortOption, updateStorage, toastError]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDownload = (file) => {
    // Directly navigate or trigger download from the authenticated endpoint
    window.location.href = `/api/files/${file._id}/download`;
  };

  const onFileRenamed = (updatedFile) => {
    setFiles((prev) => prev.map((f) => (f._id === updatedFile._id ? updatedFile : f)));
  };

  const onFileDeleted = (deletedId) => {
    setFiles((prev) => prev.filter((f) => f._id !== deletedId));
  };

  // Filter files by category tabs
  const filteredFiles = files.filter((file) => {
    if (selectedCategory === 'all') return true;
    const meta = getFileTypeMeta(file.originalName, file.mimeType);
    return meta.category === selectedCategory;
  });

  const percentUsed = user?.storageLimit 
    ? Math.min(100, Math.round((user.storageUsed / user.storageLimit) * 100)) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Public Computer Banner */}
      <LabReminderBanner />

      {/* Top Navbar */}
      <Navbar />

      {/* Mandatory password change modal if flagged by admin */}
      <ForcePasswordModal isOpen={!!user?.forcePasswordChange} />

      {/* Upload, Rename, Delete Modals */}
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header bar: Title, Storage summary, and Upload action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Academic Vault
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely stored in your personal private vault
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchFiles}
              disabled={loading}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
              title="Refresh files"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-600' : ''}`} />
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Files
            </button>
          </div>
        </div>

        {/* Storage Bar Widget */}
        <div className="mt-6 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <HardDrive className="w-4 h-4 text-brand-600" />
              <span>Storage Usage</span>
            </div>
            <div className="text-xs font-medium text-slate-500">
              <strong className="text-slate-900 font-bold">
                {formatBytes(user?.storageUsed || 0)}
              </strong>{' '}
              used of{' '}
              <strong className="text-slate-900 font-bold">
                {formatBytes(user?.storageLimit || 524288000)}
              </strong>{' '}
              ({percentUsed}%)
            </div>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentUsed > 90
                  ? 'bg-rose-500'
                  : percentUsed > 75
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-brand-500 to-brand-600'
              }`}
              style={{ width: `${Math.max(percentUsed, 1)}%` }}
            />
          </div>

          {percentUsed > 90 && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Vault is nearly full. Delete old assignments to reclaim space.</span>
            </div>
          )}
        </div>

        {/* Controls: Search, Sort, Category Filter, and View Mode */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Files' },
              { id: 'document', label: 'Documents' },
              { id: 'image', label: 'Images' },
              { id: 'spreadsheet', label: 'Sheets' },
              { id: 'presentation', label: 'Slides' },
              { id: 'archive', label: 'Archives' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 shadow-sm"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 shadow-sm cursor-pointer"
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
            <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-slate-100 text-brand-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="List view"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-100 text-brand-600' : 'text-slate-400 hover:text-slate-600'
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
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mb-2.5" />
              <span className="text-sm font-medium">Loading your files...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-3.5">
                <FolderPlus className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {searchQuery ? 'No matching files found' : 'No files in vault yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                {searchQuery
                  ? `No files matched "${searchQuery}". Try a different keyword.`
                  : 'Upload your lab assignments, code archives, or study materials to access them safely on any PC.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload First File
                </button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            /* Table / List View */
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Uploaded</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFiles.map((file) => {
                      const meta = getFileTypeMeta(file.originalName, file.mimeType);
                      const Icon = meta.icon;

                      return (
                        <tr key={file._id} className="hover:bg-slate-50/70 transition-colors group">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl border ${meta.color} shrink-0`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span
                                className="font-semibold text-slate-800 hover:text-brand-600 truncate max-w-xs sm:max-w-md cursor-pointer"
                                onClick={() => handleDownload(file)}
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
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {formatBytes(file.size)}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {formatDate(file.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleDownload(file)}
                                className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setFileToRename(file)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Rename"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setFileToDelete(file)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

                return (
                  <div
                    key={file._id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className={`p-2.5 rounded-xl border ${meta.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${meta.badge}`}>
                          {meta.type}
                        </span>
                      </div>

                      <h4
                        className="text-xs font-bold text-slate-800 truncate hover:text-brand-600 cursor-pointer"
                        onClick={() => handleDownload(file)}
                        title={file.originalName}
                      >
                        {file.originalName}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        {formatBytes(file.size)} &bull; {formatDate(file.createdAt)}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleDownload(file)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setFileToRename(file)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                          title="Rename"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
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
