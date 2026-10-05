import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function XPMenuBar({
  onOpenUpload,
  onDownloadSelected,
  onDeleteSelected,
  onSelectAll,
  onClearSelection,
  onRefresh,
  onLogout,
  onSortChange,
  onShowAbout,
  onToggleViewMode,
  viewMode = 'list'
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuBarRef = useRef(null);
  const navigate = useNavigate();

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMenuClick = (menuName) => {
    setActiveMenu(prev => prev === menuName ? null : menuName);
  };

  const handleMenuHover = (menuName) => {
    if (activeMenu) {
      setActiveMenu(menuName);
    }
  };

  const executeAction = (action) => {
    setActiveMenu(null);
    if (action) action();
  };

  return (
    <div className="xp-menubar relative" ref={menuBarRef}>
      {/* File Menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('file')}
          onMouseEnter={() => handleMenuHover('file')}
          className={`xp-menu-item ${activeMenu === 'file' ? 'active' : ''}`}
        >
          <u>F</u>ile
        </button>
        {activeMenu === 'file' && (
          <div className="xp-dropdown-menu left-0 top-full">
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(onOpenUpload)}
            >
              <span>Upload Coursework...</span>
            </div>
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(onDownloadSelected)}
            >
              <span>Download Selected</span>
            </div>
            <div
              className="xp-dropdown-item text-red-700"
              onClick={() => executeAction(onDeleteSelected)}
            >
              <span>Delete Selected</span>
            </div>
            <div className="xp-dropdown-separator" />
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(() => navigate('/security'))}
            >
              <span>Security Center...</span>
            </div>
            <div className="xp-dropdown-separator" />
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(onLogout)}
            >
              <span>Log Off Student...</span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('edit')}
          onMouseEnter={() => handleMenuHover('edit')}
          className={`xp-menu-item ${activeMenu === 'edit' ? 'active' : ''}`}
        >
          <u>E</u>dit
        </button>
        {activeMenu === 'edit' && (
          <div className="xp-dropdown-menu left-0 top-full">
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(onSelectAll)}
            >
              <span>Select All</span>
            </div>
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(onClearSelection)}
            >
              <span>Clear Selection</span>
            </div>
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('view')}
          onMouseEnter={() => handleMenuHover('view')}
          className={`xp-menu-item ${activeMenu === 'view' ? 'active' : ''}`}
        >
          <u>V</u>iew
        </button>
        {activeMenu === 'view' && (
          <div className="xp-dropdown-menu left-0 top-full">
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(() => onToggleViewMode && onToggleViewMode('list'))}
            >
              <span>{viewMode === 'list' ? '✓ ' : '   '}Details View</span>
            </div>
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(() => onToggleViewMode && onToggleViewMode('grid'))}
            >
              <span>{viewMode === 'grid' ? '✓ ' : '   '}Tiles View</span>
            </div>
            <div className="xp-dropdown-separator" />
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(onRefresh)}
            >
              <span>Refresh (F5)</span>
            </div>
            <div className="xp-dropdown-separator" />
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(() => onSortChange && onSortChange('name_asc'))}
            >
              <span>Arrange by Name</span>
            </div>
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(() => onSortChange && onSortChange('size_desc'))}
            >
              <span>Arrange by Size</span>
            </div>
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(() => onSortChange && onSortChange('date_desc'))}
            >
              <span>Arrange by Date Modified</span>
            </div>
          </div>
        )}
      </div>

      {/* Tools Menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('tools')}
          onMouseEnter={() => handleMenuHover('tools')}
          className={`xp-menu-item ${activeMenu === 'tools' ? 'active' : ''}`}
        >
          <u>T</u>ools
        </button>
        {activeMenu === 'tools' && (
          <div className="xp-dropdown-menu left-0 top-full">
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(() => navigate('/security'))}
            >
              <span>Security Center</span>
            </div>
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(() => navigate('/settings'))}
            >
              <span>Folder Options / Settings...</span>
            </div>
          </div>
        )}
      </div>

      {/* Help Menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleMenuClick('help')}
          onMouseEnter={() => handleMenuHover('help')}
          className={`xp-menu-item ${activeMenu === 'help' ? 'active' : ''}`}
        >
          <u>H</u>elp
        </button>
        {activeMenu === 'help' && (
          <div className="xp-dropdown-menu left-0 top-full">
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(() => navigate('/'))}
            >
              <span>Help and Support Center</span>
            </div>
            <div className="xp-dropdown-separator" />
            <div
              className="xp-dropdown-item"
              onClick={() => executeAction(onShowAbout)}
            >
              <span>About CloudVault Professional...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
