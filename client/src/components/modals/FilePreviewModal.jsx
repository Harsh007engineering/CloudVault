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
  const { isDark } = useTheme();
  const [textContent, setTextContent] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const meta = file ? getFileTypeMeta(file.originalName, file.mimeType) : null;
  const isImage = meta?.category === 'image';
  const isPdf = meta?.type === 'PDF';
  const isText = meta?.type === 'TXT' || file?.mimeType?.includes('text') || file?.mimeType?.includes('json');

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className={`rounded-3xl shadow-2xl max-w-5xl w-full h-[85vh] border flex flex-col md:flex-row overflow-hidden animate-scale-in backdrop-blur-2xl ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-slate-300/50'
      }`}>
        {/* Main Preview Container */}
        <div className="flex-1 bg-slate-900 flex flex-col min-h-0 relative">
          {/* Preview Header Controls */}
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${meta.badge}`}>
                {meta.type}
              </span>
              <span className="font-medium truncate text-slate-200">{file.originalName}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isImage && (
                <>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono text-slate-400 px-1">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
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
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview Viewport */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative select-none">
            {isImage ? (
              <div className="max-w-full max-h-full flex items-center justify-center overflow-auto">
                <img
                  src={fileUrl}
                  alt={file.originalName}
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                  className="max-h-[70vh] object-contain rounded-lg transition-transform duration-150 shadow-2xl"
                />
              </div>
            ) : isPdf ? (
              <iframe
                src={`${fileUrl}#toolbar=0`}
                title={file.originalName}
                className="w-full h-full rounded-lg bg-white border-0"
              />
            ) : isText ? (
              textLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                  Loading text preview...
                </div>
              ) : (
                <pre className="w-full h-full p-4 overflow-auto font-mono text-xs text-slate-200 bg-slate-950/80 rounded-xl leading-relaxed whitespace-pre-wrap select-text">
                  {textContent}
                </pre>
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
