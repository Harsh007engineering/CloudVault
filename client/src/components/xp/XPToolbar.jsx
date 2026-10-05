import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  Search, 
  Upload, 
  Trash2, 
  RefreshCw, 
  LayoutGrid, 
  List, 
  ShieldCheck 
} from 'lucide-react';
import { XPFolderIcon } from './XPIcons';

export default function XPToolbar({
  onBack,
  onForward,
  onUp,
  onOpenUpload,
  onDeleteSelected,
  selectedCount = 0,
  onRefresh,
  isRefreshing = false,
  onFocusSearch,
  viewMode = 'list',
  onToggleViewMode
}) {
  return (
    <div className="xp-toolbar">
      {/* Navigation Buttons */}
      <button
        type="button"
        onClick={onBack}
        className="xp-toolbar-btn"
        title="Back"
      >
        <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm">
          <ArrowLeft className="w-3.5 h-3.5" />
        </div>
        <span className="hidden sm:inline">Back</span>
      </button>

      <button
        type="button"
        onClick={onForward}
        className="xp-toolbar-btn opacity-60"
        title="Forward"
        disabled
      >
        <div className="w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center text-white">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </button>

      <button
        type="button"
        onClick={onUp}
        className="xp-toolbar-btn"
        title="Up to root"
      >
        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white">
          <ArrowUp className="w-3.5 h-3.5" />
        </div>
      </button>

      <div className="xp-toolbar-divider" />

      {/* Search */}
      <button
        type="button"
        onClick={onFocusSearch}
        className="xp-toolbar-btn"
        title="Search files"
      >
        <Search className="w-4 h-4 text-blue-700" />
        <span>Search</span>
      </button>

      {/* Folders / View toggle */}
      <button
        type="button"
        onClick={() => onToggleViewMode && onToggleViewMode(viewMode === 'list' ? 'grid' : 'list')}
        className="xp-toolbar-btn"
        title={viewMode === 'list' ? "Switch to Tiles View" : "Switch to Details View"}
      >
        {viewMode === 'list' ? (
          <>
            <LayoutGrid className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Tiles</span>
          </>
        ) : (
          <>
            <List className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Details</span>
          </>
        )}
      </button>

      <div className="xp-toolbar-divider" />

      {/* Primary Upload Action */}
      <button
        type="button"
        onClick={onOpenUpload}
        className="xp-toolbar-btn font-bold text-blue-900"
        title="Upload coursework to vault"
      >
        <Upload className="w-4 h-4 text-blue-700" />
        <span>Upload</span>
      </button>

      {/* Delete Action (Active when files selected) */}
      <button
        type="button"
        onClick={onDeleteSelected}
        disabled={selectedCount === 0}
        className={`xp-toolbar-btn ${selectedCount === 0 ? 'opacity-40 cursor-not-allowed' : 'text-red-700'}`}
        title="Delete selected file(s)"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
        <span className="hidden sm:inline">Delete {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
      </button>

      {/* Refresh */}
      <button
        type="button"
        onClick={onRefresh}
        className="xp-toolbar-btn"
        title="Refresh files list"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-slate-700 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>

      <div className="xp-toolbar-divider" />

      {/* Lab PC Safe Mode Badge */}
      <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 text-[10px] text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 rounded">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Lab Safe Mode: Active</span>
      </div>
    </div>
  );
}
