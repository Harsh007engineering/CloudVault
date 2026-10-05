import React from 'react';
import { Download, Trash2, X, CheckSquare } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

export default function BatchActionBar({ 
  selectedCount, 
  onDownloadBatch, 
  onDeleteBatch, 
  onClearSelection 
}) {
  const { isDark } = useTheme();
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-2xl border transition-all ${
        isDark 
          ? 'bg-slate-900/90 text-white border-slate-700/80 shadow-black/50' 
          : 'bg-white/95 text-slate-900 border-slate-200/90 shadow-slate-300/50 ring-1 ring-slate-900/5'
      }`}>
        <div className={`flex items-center gap-2 pr-3 border-r text-xs font-semibold ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <CheckSquare className="w-4 h-4 text-brand-600" />
          <span>{selectedCount} selected</span>
        </div>

        <button
          onClick={onDownloadBatch}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            isDark 
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
          }`}
          title="Download each selected file"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>

        <button
          onClick={onDeleteBatch}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
            isDark 
              ? 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/30 text-rose-300 hover:text-rose-200' 
              : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
          }`}
          title="Delete selected files"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete ({selectedCount})</span>
        </button>

        <button
          onClick={onClearSelection}
          className={`p-1 rounded-lg transition-colors ml-1 ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
          }`}
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
