import React, { useState } from 'react';
import { formatBytes, formatDate, getFileTypeMeta } from '../../utils/formatters';
import XPTitleBar from './XPTitleBar';
import { 
  XPDocumentIcon, 
  XPPdfIcon, 
  XPImageIcon, 
  XPCodeIcon, 
  XPArchiveIcon, 
  XPFolderIcon 
} from './XPIcons';

export default function XPFilePropertiesModal({
  file,
  isOpen = false,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen || !file) return null;

  const meta = getFileTypeMeta(file.originalName, file.mimeType);

  const getFileIcon = () => {
    switch (meta.category) {
      case 'code': return XPCodeIcon;
      case 'image': return XPImageIcon;
      case 'archive': return XPArchiveIcon;
      case 'document':
        if (file.originalName.toLowerCase().endsWith('.pdf')) return XPPdfIcon;
        return XPDocumentIcon;
      default: return XPDocumentIcon;
    }
  };

  const IconComponent = getFileIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="xp-prop-title"
        className="xp-window-dialog w-full max-w-md select-none animate-scale-in"
      >
        <XPTitleBar
          title={`${file.originalName} Properties`}
          icon={IconComponent}
          onClose={onClose}
        />

        {/* Tab Header */}
        <div className="xp-tabs-header pt-2 px-2 bg-[#ece9d8]">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`xp-tab ${activeTab === 'general' ? 'active' : ''}`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`xp-tab ${activeTab === 'security' ? 'active' : ''}`}
          >
            Security
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`xp-tab ${activeTab === 'storage' ? 'active' : ''}`}
          >
            Cloud Storage
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 bg-[#ece9d8] border-t border-white text-[11px] text-slate-900 min-h-[300px]">
          {activeTab === 'general' && (
            <div className="space-y-3">
              {/* Header with Icon and Name */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-300">
                <IconComponent className="w-8 h-8 shrink-0" />
                <input
                  type="text"
                  readOnly
                  value={file.originalName}
                  className="xp-input flex-1 font-bold bg-white"
                />
              </div>

              {/* Metadata attributes */}
              <div className="space-y-1.5 pb-3 border-b border-slate-300">
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Type of file:</span>
                  <span className="col-span-2 font-medium">{meta.category.toUpperCase()} File ({file.mimeType || 'unknown'})</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Opens with:</span>
                  <span className="col-span-2 font-medium">CloudVault Academic Viewer</span>
                </div>
              </div>

              <div className="space-y-1.5 pb-3 border-b border-slate-300">
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Location:</span>
                  <span className="col-span-2 font-mono text-[10px] text-slate-800 break-all">
                    Cloudflare R2 / S3 Secure Object Store
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Size:</span>
                  <span className="col-span-2 font-mono">
                    {formatBytes(file.size)} ({file.size.toLocaleString()} bytes)
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Size on disk:</span>
                  <span className="col-span-2 font-mono">{formatBytes(file.size)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pb-3 border-b border-slate-300">
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Uploaded:</span>
                  <span className="col-span-2">{formatDate(file.createdAt)}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Last Modified:</span>
                  <span className="col-span-2">{formatDate(file.updatedAt || file.createdAt)}</span>
                </div>
              </div>

              {/* Attributes check boxes */}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-slate-600">Attributes:</span>
                <label className="flex items-center gap-1.5 cursor-default">
                  <input type="checkbox" defaultChecked readOnly className="accent-blue-600" />
                  <span>Archive</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-default">
                  <input type="checkbox" readOnly className="accent-blue-600" />
                  <span>Read-only</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-default">
                  <input type="checkbox" readOnly className="accent-blue-600" />
                  <span>Hidden</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-700">
                Group or user names:
              </div>
              <div className="bg-white border border-[#7f9db9] p-2 space-y-1">
                <div className="font-bold text-blue-900">STUDENTS\Authenticated User</div>
                <div className="text-slate-600">SYSTEM\CloudVault Service</div>
              </div>

              <div className="text-[11px] text-slate-700 font-bold">
                Permissions for Student:
              </div>
              <div className="bg-white border border-[#7f9db9] p-2 space-y-1 font-mono text-[10px]">
                <div className="flex justify-between"><span>Full Control</span><span className="text-emerald-700 font-bold">Allow</span></div>
                <div className="flex justify-between"><span>Modify</span><span className="text-emerald-700 font-bold">Allow</span></div>
                <div className="flex justify-between"><span>Read &amp; Execute</span><span className="text-emerald-700 font-bold">Allow</span></div>
                <div className="flex justify-between"><span>Write</span><span className="text-emerald-700 font-bold">Allow</span></div>
                <div className="flex justify-between"><span>Special Permissions</span><span className="text-emerald-700 font-bold">Allow</span></div>
              </div>

              <div className="p-2 bg-emerald-50 border border-emerald-300 text-emerald-900 text-[10px]">
                🔒 <strong>Lab Isolation Active:</strong> Other laboratory students on this PC cannot access this file object.
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3">
                <span className="text-slate-600">Storage Provider:</span>
                <span className="col-span-2 font-bold text-blue-900">Cloudflare R2 Object Store</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600">Storage Key:</span>
                <span className="col-span-2 font-mono text-[10px] break-all">{file.storageKey || 'users/vault/object'}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600">Egress Fee:</span>
                <span className="col-span-2 text-emerald-700 font-bold">$0.00 (Zero Egress Bandwidth)</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600">Cache Policy:</span>
                <span className="col-span-2 font-mono text-[10px]">no-store, must-revalidate</span>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Action Buttons */}
        <div className="flex items-center justify-end gap-2 p-3 bg-[#ece9d8] border-t border-slate-300">
          <button
            type="button"
            onClick={onClose}
            className="xp-btn xp-btn-primary min-w-[75px]"
          >
            OK
          </button>
          <button
            type="button"
            onClick={onClose}
            className="xp-btn min-w-[75px]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled
            className="xp-btn min-w-[75px] opacity-60"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
