import React from 'react';
import { formatBytes } from '../../utils/formatters';
import { XPShieldIcon, XPHardDriveIcon } from './XPIcons';

export default function XPStatusBar({
  fileCount = 0,
  selectedCount = 0,
  totalBytes = 0,
  storageUsed = 0,
  storageLimit = 524288000,
  hoveredFileName = null
}) {
  return (
    <footer className="xp-statusbar select-none">
      {/* Primary Status Pane */}
      <div className="xp-status-pane flex-1 truncate">
        {hoveredFileName ? (
          <span className="font-semibold text-blue-900">{hoveredFileName}</span>
        ) : selectedCount > 0 ? (
          <span>{selectedCount} object(s) selected</span>
        ) : (
          <span>{fileCount} object(s) in folder</span>
        )}
      </div>

      {/* Total size / selected pane */}
      <div className="xp-status-pane hidden sm:block">
        <span>{formatBytes(totalBytes)}</span>
      </div>

      {/* Storage Limit Pane */}
      <div className="xp-status-pane hidden md:flex items-center gap-1">
        <XPHardDriveIcon className="w-3.5 h-3.5" />
        <span>{formatBytes(storageUsed)} / {formatBytes(storageLimit)}</span>
      </div>

      {/* Safe Mode Protected Pane */}
      <div className="xp-status-pane flex items-center gap-1 text-emerald-800 font-bold">
        <XPShieldIcon className="w-3 h-3 text-emerald-600" />
        <span className="text-[10px]">Protected</span>
      </div>
    </footer>
  );
}
