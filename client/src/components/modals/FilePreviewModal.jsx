import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Trash2, 
  Star, 
  Edit3, 
  Copy, 
  Check, 
  Eye, 
  FileText, 
  Calendar, 
  HardDrive, 
  FileCode,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { formatBytes, formatDate, getFileTypeMeta } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/useTheme';
import { getFileDownloadUrl } from '../../services/api';

export default function FilePreviewModal({ 
  file, 
  isOpen, 
  onClose, 
  onToggleStar, 
  onRenameRequest, 
  onDeleteRequest 
}) {
  const { success, error: toastError } = useToast();
  const { isDark, isXP } = useTheme();
  const [textContent, setTextContent] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const ext = file?.originalName ? file.originalName.slice(file.originalName.lastIndexOf('.')).toLowerCase() : '';
  const meta = file ? getFileTypeMeta(file.originalName, file.mimeType) : null;
  const isImage = meta?.category === 'image';
  const isPdf = meta?.type === 'PDF' || ext === '.pdf';
  const isCode = meta?.category === 'code' || ['.py', '.java', '.cpp', '.c', '.cs', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.sql', '.sh', '.md'].includes(ext);
  const isText = meta?.type === 'TXT' || file?.mimeType?.includes('text') || file?.mimeType?.includes('json') || isCode;

  const fileUrl = file ? getFileDownloadUrl(file._id, true) : '';

  useEffect(() => {
    if (isOpen && file && isText) {
      setTextLoading(true);
      fetch(fileUrl)
        .then((res) => res.text())
        .then((text) => {
          setTextContent(text);
          setTextLoading(false);
        })
        .catch(() => {
          setTextContent('Failed to load text preview.');
          setTextLoading(false);
        });
    } else {
      setTextContent(null);
      setZoomLevel(1);
      setIsFullscreen(false);
    }
  }, [isOpen, file, isText, fileUrl]);

  if (!isOpen || !file) return null;

  const handleCopyText = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      success('File content copied to clipboard');
    }
  };

  const handleDownload = () => {
    window.location.href = getFileDownloadUrl(file._id);
  };

  const textLines = textContent ? textContent.split('\n') : [];

  if (isXP) {
    const viewerTitle = isImage 
      ? `Windows Picture and Fax Viewer - ${file.originalName}`
      : isCode
        ? `${file.originalName} - Notepad`
        : `CloudVault Document Viewer - ${file.originalName}`;

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50" 
        role="dialog" 
        aria-modal="true" 
        aria-label={`Preview: ${file.originalName}`}
      >
        <div className={`xp-window-dialog flex flex-col overflow-hidden w-full ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'max-w-4xl h-[85vh]'} select-none animate-scale-in`}>
          {/* XP Titlebar */}
          <div className="xp-titlebar">
            <div className="xp-titlebar-text">
              <span>{viewerTitle}</span>
            </div>
            <div className="xp-window-controls">
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="xp-btn-control xp-btn-max"
                title={isFullscreen ? "Restore" : "Maximize"}
              >
                <span>{isFullscreen ? "❐" : "□"}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="xp-btn-control xp-btn-close"
                title="Close"
              >
                <span>✕</span>
              </button>
            </div>
          </div>

          {/* XP Toolbar */}
          <div className="xp-toolbar">
            <button
              type="button"
              onClick={handleDownload}
              className="xp-toolbar-btn"
              title="Download to PC"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Download</span>
            </button>

            {isImage && (
              <>
                <div className="xp-toolbar-divider" />
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))}
                  className="xp-toolbar-btn"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-slate-700" />
                  <span>Zoom Out</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="xp-toolbar-btn"
                  title="Actual Size"
                >
                  <span>100%</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                  className="xp-toolbar-btn"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-slate-700" />
                  <span>Zoom In</span>
                </button>
              </>
            )}

            {isText && textContent && (
              <>
                <div className="xp-toolbar-divider" />
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="xp-toolbar-btn"
                  title="Copy text"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-700" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </>
            )}

            <div className="xp-toolbar-divider" />
            <button
              type="button"
              onClick={() => onToggleStar && onToggleStar(file)}
              className="xp-toolbar-btn"
              title="Toggle Star"
            >
              <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-500'}`} />
              <span>{file.isStarred ? 'Starred' : 'Star'}</span>
            </button>

            {onDeleteRequest && (
              <button
                type="button"
                onClick={() => { onClose(); onDeleteRequest(file); }}
                className="xp-toolbar-btn text-red-700 ml-auto"
                title="Delete file"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* XP Content Canvas */}
          <div className="flex-1 bg-white p-2 overflow-auto flex items-center justify-center border-t border-[#7f9db9] relative">
            {isImage && (
              <div className="w-full h-full flex items-center justify-center overflow-auto">
                <img
                  src={fileUrl}
                  alt={file.originalName}
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                  className="max-h-full object-contain transition-transform"
                />
              </div>
            )}

            {isPdf && (
              <iframe
                src={`${fileUrl}#toolbar=1`}
                title={file.originalName}
                className="w-full h-full border-0"
              />
            )}

            {isText && (
              textLoading ? (
                <div className="flex items-center gap-2 text-slate-600 font-mono text-xs">
                  <span>Loading text...</span>
                </div>
              ) : (
                <div className="w-full h-full font-mono text-xs text-black whitespace-pre overflow-auto p-3 bg-white border border-[#7f9db9]">
                  {textContent}
                </div>
              )
            )}

            {!isImage && !isPdf && !isText && (
              <div className="text-center p-6 space-y-3">
                <div className="text-4xl">📄</div>
                <div className="font-bold text-slate-800">{file.originalName}</div>
                <div className="text-xs text-slate-600">No preview available for this file type.</div>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="xp-btn xp-btn-primary"
                >
                  Download File ({formatBytes(file.size)})
                </button>
              </div>
            )}
          </div>

          {/* XP Status Bar */}
          <div className="xp-statusbar">
            <div className="xp-status-pane flex-1 truncate">
              <span>{file.originalName}</span>
            </div>
            <div className="xp-status-pane">
              <span>{formatBytes(file.size)}</span>
            </div>
            <div className="xp-status-pane">
              <span>{meta.category.toUpperCase()}</span>
            </div>
            <div className="xp-status-pane text-emerald-800 font-bold">
              <span>🔒 Lab Safe</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-3 sm:p-6'} bg-slate-950/80 backdrop-blur-md animate-fade-in`} role="dialog" aria-modal="true" aria-label={`Preview: ${file.originalName}`}>
      <div className={`shadow-2xl border flex flex-col md:flex-row overflow-hidden transition-all backdrop-blur-2xl ${
        isFullscreen ? 'w-screen h-screen rounded-none border-0' : 'rounded-3xl max-w-5xl w-full h-[85vh] animate-scale-in'
      } ${isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200 shadow-slate-300/50'}`}>
        
        {/* Main Preview Container */}
        <div className="flex-1 bg-slate-950 flex flex-col min-h-0 relative">
          {/* Preview Header Controls */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${meta.badge}`}>
                {meta.type}
              </span>
              <span className="font-semibold truncate text-slate-200">{file.originalName}</span>
              <span className="hidden sm:inline-block text-[11px] text-slate-500 font-mono">
                ({formatBytes(file.size)})
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isImage && (
                <>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="text-[11px] font-mono text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800"
                    title="Reset Zoom to 100%"
                  >
                    {Math.round(zoomLevel * 100)}%
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </>
              )}

              {isText && textContent && (
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}

              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              <button
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview Viewport */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-3 sm:p-4 relative">
            {isImage ? (
              <div className="max-w-full max-h-full flex items-center justify-center overflow-auto select-none">
                <img
                  src={fileUrl}
                  alt={file.originalName}
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                  className="max-h-[72vh] object-contain rounded-lg transition-transform duration-150 shadow-2xl"
                />
              </div>
            ) : isPdf ? (
              <iframe
                src={`${fileUrl}#toolbar=1`}
                title={file.originalName}
                className="w-full h-full rounded-lg bg-white border-0"
              />
            ) : isText ? (
              textLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                  Loading code preview...
                </div>
              ) : (
                <div className="w-full h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl">
                  {/* Code Viewer Titlebar */}
                  <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs select-none">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FileCode className="w-3.5 h-3.5 text-brand-400" />
                      <span className="font-mono text-slate-300 font-semibold">{file.originalName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-500">{textLines.length} lines</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-brand-300 border border-slate-700">
                        {ext.replace('.', '').toUpperCase() || 'TXT'}
                      </span>
                    </div>
                  </div>

                  {/* Code Body with Synchronized Line Numbers */}
                  <div className="flex-1 flex overflow-auto font-mono text-xs">
                    {/* Line Numbers Column */}
                    <div className="select-none py-3 px-3.5 text-right text-slate-600 bg-slate-950 border-r border-slate-800/80 font-mono text-[11px] leading-5 shrink-0">
                      {textLines.map((_, i) => (
                        <div key={i} className="leading-5 h-5">{i + 1}</div>
                      ))}
                    </div>
                    {/* Code / Text Contents */}
                    <pre className="flex-1 p-3 overflow-auto text-slate-200 leading-5 whitespace-pre font-mono text-xs select-text">
                      {textContent}
                    </pre>
                  </div>
                </div>
              )
            ) : (
              /* Non-previewable fallback */
              <div className="text-center p-8 max-w-sm">
                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${meta.color}`}>
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Preview not directly available
                </h4>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  This file type cannot be previewed inside the browser. Download it to view on your workstation.
                </p>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all active:translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  Download File ({formatBytes(file.size)})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Inspector & Metadata Sidebar */}
        <div className={`w-full md:w-80 border-t md:border-t-0 md:border-l flex flex-col justify-between shrink-0 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="p-5 overflow-y-auto">
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>File Inspector</h3>
              <button
                onClick={onClose}
                className={`hidden md:flex p-1 rounded-lg ${
                  isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* File info list */}
            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className={`font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Filename</span>
                <span className={`font-semibold break-all block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{file.originalName}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80 shadow-sm'
                }`}>
                  <span className={`font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Size</span>
                  <span className={`font-bold font-mono mt-0.5 block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{formatBytes(file.size)}</span>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/80 shadow-sm'
                }`}>
                  <span className={`font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Type</span>
                  <span className={`font-bold mt-0.5 block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{meta.type}</span>
                </div>
              </div>

              <div>
                <span className={`font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>MIME Type</span>
                <span className={`font-mono px-2.5 py-1 rounded-lg border block text-[11px] ${
                  isDark ? 'text-slate-300 bg-slate-800/60 border-slate-700' : 'text-slate-700 bg-slate-50 border-slate-200'
                }`}>
                  {file.mimeType}
                </span>
              </div>

              <div>
                <span className={`font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Uploaded On</span>
                <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(file.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className={`p-5 border-t space-y-2 ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/70'
          }`}>
            <button
              onClick={() => onToggleStar(file)}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                file.isStarred
                  ? isDark 
                    ? 'bg-amber-950/40 border-amber-900/60 text-amber-300 hover:bg-amber-900/60'
                    : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 shadow-sm'
                  : isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
              <span>{file.isStarred ? 'Starred in Vault' : 'Add to Starred'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              Download File
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onRenameRequest(file);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-semibold transition-colors ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Rename
              </button>

              <button
                onClick={() => {
                  onClose();
                  onDeleteRequest(file);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-semibold transition-colors ${
                  isDark ? 'bg-rose-950/40 border-rose-900/60 text-rose-300 hover:bg-rose-900/60' : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 shadow-sm'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
