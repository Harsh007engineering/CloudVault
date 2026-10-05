import React from 'react';
import { XPFolderIcon } from './XPIcons';

export default function XPTitleBar({
  title = "CloudVault - Academic Cloud Storage",
  icon: Icon = XPFolderIcon,
  onMinimize,
  onMaximize,
  onClose,
  isMaximized = false,
  isActive = true,
  className = ""
}) {
  return (
    <div className={`xp-titlebar ${!isActive ? 'opacity-85' : ''} ${className}`}>
      {/* Title & Icon */}
      <div className="xp-titlebar-text">
        {typeof Icon === 'function' ? (
          <Icon className="w-4 h-4 shrink-0" />
        ) : (
          Icon
        )}
        <span>{title}</span>
      </div>

      {/* Control Buttons */}
      <div className="xp-window-controls">
        {onMinimize && (
          <button
            type="button"
            onClick={onMinimize}
            className="xp-btn-control xp-btn-min"
            title="Minimize"
            aria-label="Minimize"
          >
            <span className="font-bold -mt-1">_</span>
          </button>
        )}
        {onMaximize && (
          <button
            type="button"
            onClick={onMaximize}
            className="xp-btn-control xp-btn-max"
            title={isMaximized ? "Restore Down" : "Maximize"}
            aria-label={isMaximized ? "Restore Down" : "Maximize"}
          >
            <span>{isMaximized ? "❐" : "□"}</span>
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="xp-btn-control xp-btn-close"
            title="Close"
            aria-label="Close"
          >
            <span>✕</span>
          </button>
        )}
      </div>
    </div>
  );
}
