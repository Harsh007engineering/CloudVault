import React from 'react';
import { Download, Trash2, X, CheckSquare } from 'lucide-react';

export default function BatchActionBar({ 
  selectedCount, 
  onDownloadBatch, 
  onDeleteBatch, 
  onClearSelection 
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/90 text-white border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700 text-xs font-semibold">
          <CheckSquare className="w-4 h-4 text-brand-400" />
          <span>{selectedCount} selected</span>
        </div>

        <button
          onClick={onDownloadBatch}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-colors"
          title="Download each selected file"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>

        <button
          onClick={onDeleteBatch}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 transition-colors"
          title="Delete selected files"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete ({selectedCount})</span>
        </button>

        <button
          onClick={onClearSelection}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
