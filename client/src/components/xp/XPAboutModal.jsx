import React from 'react';
import XPTitleBar from './XPTitleBar';
import { XPComputerIcon, XPFolderIcon } from './XPIcons';
import { formatBytes } from '../../utils/formatters';

export default function XPAboutModal({
  isOpen = false,
  onClose,
  user
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="xp-about-title"
        className="xp-window-dialog w-full max-w-sm select-none animate-scale-in"
      >
        <XPTitleBar
          title="About CloudVault Professional"
          icon={XPComputerIcon}
          onClose={onClose}
        />

        <div className="p-4 bg-[#ece9d8] text-[11px] text-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white text-xl shadow">
              ☁
            </div>
            <div>
              <div className="text-base font-bold text-blue-950">CloudVault Professional</div>
              <div className="text-[10px] text-slate-600">Version 1.0 (Service Pack 2, Build 2600)</div>
              <div className="text-[10px] text-slate-600">Academic University Edition</div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-300 border-b border-white" />

          <p className="text-slate-700 leading-relaxed text-[11px]">
            CloudVault is protected by cryptographic isolation, HTTP-only session tokens, and zero personal account footprint on university shared computers.
          </p>

          <div className="space-y-1 text-[10px] text-slate-800 bg-white p-2.5 border border-[#7f9db9]">
            <div>This product is licensed to:</div>
            <div className="font-bold pl-2">{user?.username || 'Student'}</div>
            <div className="pl-2 text-slate-500">University Shared Computer Lab</div>
            <div className="pt-1 text-slate-600">
              Storage Available: <strong>{formatBytes(user?.storageLimit || 524288000)}</strong>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-3 bg-[#ece9d8] border-t border-slate-300">
          <button
            type="button"
            onClick={onClose}
            className="xp-btn xp-btn-primary min-w-[75px]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
