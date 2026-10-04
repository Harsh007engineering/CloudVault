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

export default function FilePreviewModal({ 
  file, 
  isOpen, 
  onClose, 
  onToggleStar, 
  onRenameRequest, 
  onDeleteRequest 
}) {
  const { success, error: toastError } = useToast();
  const [textContent, setTextContent] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const meta = file ? getFileTypeMeta(file.originalName, file.mimeType) : null;
  const isImage = meta?.category === 'image';
  const isPdf = meta?.type === 'PDF';
  const isText = meta?.type === 'TXT' || file?.mimeType?.includes('text') || file?.mimeType?.includes('json');

  const fileUrl = file ? `/api/files/${file._id}/download?inline=true` : '';

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
    window.location.href = `/api/files/${file._id}/download`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[85vh] border border-slate-200/80 flex flex-col md:flex-row overflow-hidden animate-scale-in">
        {/* Main Preview Container */}
        <div className="flex-1 bg-slate-900 flex flex-col min-h-0 relative">
          {/* Preview Header Controls */}
          <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-white text-xs">
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
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview Render Body */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            {isImage ? (
              <div className="overflow-auto max-h-full flex items-center justify-center">
                <img
                  src={fileUrl}
                  alt={file.originalName}
                  className="rounded-lg shadow-lg object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>
            ) : isPdf ? (
              <iframe
                src={fileUrl}
                title={file.originalName}
                className="w-full h-full rounded-lg border-0 bg-white"
              />
            ) : isText ? (
              textLoading ? (
                <div className="text-slate-400 text-xs flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading file text...</span>
                </div>
              ) : (
                <pre className="w-full h-full p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-auto rounded-lg border border-slate-800 leading-relaxed select-text">
                  {textContent}
                </pre>
              )
            ) : (
              <div className="text-center p-8 text-slate-400 max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Preview not supported in-browser
                </h4>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Download this {meta.type} file to open it in your desktop application.
                </p>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Inspector & Metadata Sidebar */}
        <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-between shrink-0">
          <div className="p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">File Inspector</h3>
              <button
                onClick={onClose}
                className="hidden md:flex p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* File info list */}
            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block mb-1">Filename</span>
                <span className="font-semibold text-slate-800 break-all block">{file.originalName}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-slate-400 font-medium block">Size</span>
                  <span className="font-bold text-slate-800 font-mono mt-0.5 block">{formatBytes(file.size)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-slate-400 font-medium block">Type</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{meta.type}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1">MIME Type</span>
                <span className="font-mono text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 block text-[11px]">
                  {file.mimeType}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1">Uploaded On</span>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(file.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-2">
            <button
              onClick={() => onToggleStar(file)}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                file.isStarred
                  ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
              <span>{file.isStarred ? 'Starred in Vault' : 'Add to Starred'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-600/20 transition-all"
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
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Rename
              </button>

              <button
                onClick={() => {
                  onClose();
                  onDeleteRequest(file);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-50 border border-rose-200/80 hover:bg-rose-100 rounded-xl text-xs font-semibold text-rose-700 transition-colors"
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
