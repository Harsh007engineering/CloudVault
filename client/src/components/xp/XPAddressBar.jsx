import React from 'react';
import { ArrowRight } from 'lucide-react';
import { XPFolderIcon } from './XPIcons';

export default function XPAddressBar({
  currentPath = "CloudVault:\\My Coursework",
  onNavigate
}) {
  return (
    <div className="xp-address-bar">
      <span className="text-[11px] text-slate-700 select-none"><u>A</u>ddress</span>
      <div className="xp-address-input">
        <XPFolderIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[11px] font-normal text-slate-900 select-all truncate">{currentPath}</span>
      </div>
      <button
        type="button"
        onClick={() => onNavigate && onNavigate()}
        className="flex items-center gap-1 px-2 py-0.5 text-[11px] bg-emerald-100 hover:bg-emerald-200 border border-emerald-600 rounded text-emerald-950 font-bold shadow-xs active:translate-y-0.5"
      >
        <div className="w-3 h-3 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px]">
          ➜
        </div>
        <span>Go</span>
      </button>
    </div>
  );
}
