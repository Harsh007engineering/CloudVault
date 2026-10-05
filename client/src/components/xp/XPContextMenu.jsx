import React, { useEffect, useRef } from 'react';
import { Download, Edit3, Trash2, Eye, Star, Info } from 'lucide-react';

export default function XPContextMenu({
  x,
  y,
  file,
  onClose,
  onPreview,
  onDownload,
  onRename,
  onToggleStar,
  onDelete,
  onProperties
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!file) return null;

  // Prevent overflowing viewport
  const style = {
    top: Math.min(y, window.innerHeight - 220),
    left: Math.min(x, window.innerWidth - 180),
    position: 'fixed'
  };

  return (
    <div 
      ref={menuRef}
      style={style}
      className="xp-context-menu select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="xp-context-menu-item font-bold"
        onClick={() => { onClose(); onPreview(file); }}
      >
        <Eye className="w-3.5 h-3.5 text-blue-700" />
        <span><u>O</u>pen / Preview</span>
      </div>

      <div 
        className="xp-context-menu-item"
        onClick={() => { onClose(); onDownload(file); }}
      >
        <Download className="w-3.5 h-3.5 text-slate-700" />
        <span><u>D</u>ownload</span>
      </div>

      <div className="xp-dropdown-separator" />

      <div 
        className="xp-context-menu-item"
        onClick={() => { onClose(); onRename(file); }}
      >
        <Edit3 className="w-3.5 h-3.5 text-slate-700" />
        <span>Rena<u>m</u>e</span>
      </div>

      <div 
        className="xp-context-menu-item"
        onClick={() => { onClose(); onToggleStar(file); }}
      >
        <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-500'}`} />
        <span>{file.isStarred ? 'Unstar' : 'Add to Starred'}</span>
      </div>

      <div 
        className="xp-context-menu-item text-red-700"
        onClick={() => { onClose(); onDelete(file); }}
      >
        <Trash2 className="w-3.5 h-3.5 text-red-600" />
        <span><u>D</u>elete</span>
      </div>

      <div className="xp-dropdown-separator" />

      <div 
        className="xp-context-menu-item"
        onClick={() => { onClose(); onProperties && onProperties(file); }}
      >
        <Info className="w-3.5 h-3.5 text-blue-600" />
        <span>P<u>r</u>operties</span>
      </div>
    </div>
  );
}
