import React, { useState } from 'react';
import XPTitleBar from './XPTitleBar';

export default function XPWindow({
  title = "CloudVault",
  icon,
  onClose,
  onMinimize,
  onMaximize,
  menuBar,
  toolbar,
  addressBar,
  statusBar,
  children,
  className = "",
  style = {}
}) {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMaximizeToggle = () => {
    setIsMaximized(!isMaximized);
    if (onMaximize) onMaximize(!isMaximized);
  };

  return (
    <div 
      className={`xp-window ${isMaximized ? 'fixed inset-0 z-40 rounded-none border-0' : 'w-full max-w-7xl mx-auto my-3'} ${className}`}
      style={style}
    >
      {/* Title Bar */}
      <XPTitleBar
        title={title}
        icon={icon}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={handleMaximizeToggle}
        isMaximized={isMaximized}
      />

      {/* Menu Bar (Optional) */}
      {menuBar}

      {/* Toolbar (Optional) */}
      {toolbar}

      {/* Address Bar (Optional) */}
      {addressBar}

      {/* Window Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white overflow-hidden relative">
        {children}
      </div>

      {/* Status Bar (Optional) */}
      {statusBar}
    </div>
  );
}
