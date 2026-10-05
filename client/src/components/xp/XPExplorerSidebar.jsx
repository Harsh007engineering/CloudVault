import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, 
  Download, 
  Trash2, 
  Star, 
  Clock, 
  Settings, 
  ShieldCheck, 
  KeyRound, 
  HardDrive,
  Folder,
  FileText,
  FileCode,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  Presentation
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';
import { XPFolderIcon, XPHardDriveIcon, XPShieldIcon, XPKeyIcon } from './XPIcons';

export default function XPExplorerSidebar({
  selectedCategory = 'all',
  onSelectCategory,
  onOpenUpload,
  onDownloadSelected,
  onDeleteSelected,
  selectedCount = 0,
  user,
  stats
}) {
  const navigate = useNavigate();
  const [tasksOpen, setTasksOpen] = useState(true);
  const [fileTypesOpen, setFileTypesOpen] = useState(true);
  const [placesOpen, setPlacesOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const totalLimit = user?.storageLimit || 524288000;
  const totalUsed = user?.storageUsed || 0;
  const percentUsed = Math.min(100, Math.round((totalUsed / totalLimit) * 100));

  return (
    <aside className="xp-task-pane w-64 shrink-0 flex flex-col gap-2 select-none border-r border-[#ffffff]">
      {/* 1. FILE AND FOLDER TASKS */}
      <div className="xp-task-box">
        <div 
          className="xp-task-box-header"
          onClick={() => setTasksOpen(!tasksOpen)}
        >
          <span>File and Folder Tasks</span>
          <span className="text-[10px] opacity-80">{tasksOpen ? '▲' : '▼'}</span>
        </div>
        {tasksOpen && (
          <div className="xp-task-box-content space-y-1">
            <div 
              className="xp-task-link"
              onClick={onOpenUpload}
            >
              <Upload className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span className="font-bold text-blue-900">Upload a file</span>
            </div>
            
            <div 
              className={`xp-task-link ${selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={selectedCount > 0 ? onDownloadSelected : undefined}
            >
              <Download className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>Download selected {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
            </div>

            <div 
              className={`xp-task-link ${selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : 'text-red-700'}`}
              onClick={selectedCount > 0 ? onDeleteSelected : undefined}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>Delete selected</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. FILE TYPES */}
      <div className="xp-task-box">
        <div 
          className="xp-task-box-header"
          onClick={() => setFileTypesOpen(!fileTypesOpen)}
        >
          <span>Coursework Types</span>
          <span className="text-[10px] opacity-80">{fileTypesOpen ? '▲' : '▼'}</span>
        </div>
        {fileTypesOpen && (
          <div className="xp-task-box-content space-y-0.5">
            {[
              { id: 'all', label: 'All Coursework Files', icon: XPFolderIcon },
              { id: 'document', label: 'Documents & Reports', icon: FileText, color: 'text-blue-700' },
              { id: 'code', label: 'Source Code Files', icon: FileCode, color: 'text-cyan-700' },
              { id: 'image', label: 'Lab Images & Diagrams', icon: ImageIcon, color: 'text-purple-700' },
              { id: 'spreadsheet', label: 'Spreadsheets & Data', icon: FileSpreadsheet, color: 'text-emerald-700' },
              { id: 'presentation', label: 'Presentation Slides', icon: Presentation, color: 'text-amber-700' },
              { id: 'archive', label: 'Archives & Packages', icon: FileArchive, color: 'text-orange-700' }
            ].map(item => {
              const Icon = item.icon;
              const isSelected = selectedCategory === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectCategory && onSelectCategory(item.id)}
                  className={`xp-task-link px-1 rounded ${isSelected ? 'bg-blue-600 text-white font-bold' : ''}`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : item.color || 'text-amber-600'}`} />
                  <span className={`truncate ${isSelected ? 'text-white' : ''}`}>{item.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. OTHER PLACES */}
      <div className="xp-task-box">
        <div 
          className="xp-task-box-header"
          onClick={() => setPlacesOpen(!placesOpen)}
        >
          <span>Other Places</span>
          <span className="text-[10px] opacity-80">{placesOpen ? '▲' : '▼'}</span>
        </div>
        {placesOpen && (
          <div className="xp-task-box-content space-y-1">
            <div 
              className={`xp-task-link ${selectedCategory === 'starred' ? 'bg-blue-600 text-white font-bold px-1 rounded' : ''}`}
              onClick={() => onSelectCategory && onSelectCategory('starred')}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Starred Files</span>
            </div>

            <div 
              className="xp-task-link"
              onClick={() => navigate('/security')}
            >
              <XPShieldIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Security Center</span>
            </div>

            <div 
              className="xp-task-link"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-3.5 h-3.5 text-slate-700 shrink-0" />
              <span>Control Panel</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. DETAILS / STORAGE */}
      <div className="xp-task-box">
        <div 
          className="xp-task-box-header"
          onClick={() => setDetailsOpen(!detailsOpen)}
        >
          <span>Vault Details</span>
          <span className="text-[10px] opacity-80">{detailsOpen ? '▲' : '▼'}</span>
        </div>
        {detailsOpen && (
          <div className="xp-task-box-content text-[11px] space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-blue-900">
              <XPHardDriveIcon className="w-4 h-4 shrink-0" />
              <span>Academic Storage (C:)</span>
            </div>
            
            <div className="text-[10px] text-slate-700">
              <div>Used: <strong>{formatBytes(totalUsed)}</strong></div>
              <div>Free: <strong>{formatBytes(Math.max(0, totalLimit - totalUsed))}</strong></div>
              <div>Capacity: <strong>{formatBytes(totalLimit)}</strong></div>
            </div>

            {/* Classic XP Green Segmented Meter */}
            <div className="xp-progress-track">
              <div 
                className="xp-progress-fill"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <div className="text-right text-[9px] text-slate-600 font-mono font-bold">
              {percentUsed}% Quota Used
            </div>

            <div className="pt-1 border-t border-slate-300 text-[10px] text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Lab PC Safe Mode: On</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
