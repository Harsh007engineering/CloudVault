import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileText, Check, AlertCircle, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { formatBytes } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/useTheme';

export default function FileUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const { user, updateStorage } = useAuth();
  const { success, error: toastError } = useToast();
  const { isDark } = useTheme();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const maxFileSize = 26214400; // 25 MiB
  const remainingQuota = user ? Math.max(0, user.storageLimit - user.storageUsed) : 0;

  const handleFiles = (fileList) => {
    const valid = [];
    let currentTotal = selectedFiles.reduce((acc, f) => acc + f.size, 0);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Check size
      if (file.size > maxFileSize) {
        toastError(`"${file.name}" exceeds maximum allowed file size of 25 MiB`);
        continue;
      }

      // Check quota
      if (currentTotal + file.size > remainingQuota) {
        toastError(`Upload exceeds your remaining ${formatBytes(remainingQuota)} storage.`);
        break;
      }

      currentTotal += file.size;
      valid.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...valid]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeSelectedFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setProgress(10);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            const overall = Math.round(((i + fileProgress / 100) / selectedFiles.length) * 100);
            setProgress(overall);
          }
        });

        if (res.success && res.data) {
          updateStorage(res.data.storageUsed, res.data.storageLimit);
        }
      }

      success(`Successfully uploaded ${selectedFiles.length} file(s)`);
      setSelectedFiles([]);
      if (onUploadSuccess) onUploadSuccess();
      onClose();
    } catch (err) {
      toastError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const totalSelectedSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
      <div className={`rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border transition-all animate-scale-in backdrop-blur-2xl ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200 shadow-slate-300/50'
      }`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-brand-500/20 text-brand-400' : 'bg-brand-50 text-brand-600 border border-brand-200'
            }`}>
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 id="upload-modal-title" className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Upload Files</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Available space: {formatBytes(remainingQuota)} remaining
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className={`p-1.5 rounded-xl ${
              isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 scale-[1.01]'
              : isDark
                ? 'border-slate-700 hover:border-brand-400 bg-slate-950/40 hover:bg-slate-800/50'
                : 'border-slate-300 hover:border-brand-400 bg-slate-50/80 hover:bg-slate-50 shadow-sm'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
          />
          <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm ${
            isDark ? 'bg-brand-950/80 text-brand-400 border border-brand-800/60' : 'bg-brand-50 text-brand-600 border border-brand-200'
          }`}>
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            Drop files here to upload <span className="text-brand-600 font-semibold underline">or Browse Files</span>
          </h4>
          <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            PDF, DOCX, Code (.py, .java, .cpp, .js), PPT, XLS, Images, ZIP
          </p>
          <div className={`mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full border ${
            isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-600 bg-white border-slate-200 shadow-sm'
          }`}>
            Maximum 25 MiB per file
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className={`mt-4 max-h-48 overflow-y-auto divide-y rounded-2xl border ${
            isDark ? 'divide-slate-800 border-slate-800' : 'divide-slate-100 border-slate-200/90'
          }`}>
            {selectedFiles.map((file, idx) => (
              <div key={idx} className={`p-2.5 flex items-center justify-between text-xs ${
                isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
              }`}>
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className={`truncate font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{file.name}</span>
                  <span className={`shrink-0 font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({formatBytes(file.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelectedFile(idx);
                  }}
                  disabled={uploading}
                  className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-4">
            <div className={`flex justify-between text-xs font-semibold mb-1 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <span>Uploading to secure vault...</span>
              <span>{progress}%</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}>
              <div
                className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className={`mt-5 pt-3 border-t flex items-center justify-between ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {selectedFiles.length > 0 ? (
              <span>
                {selectedFiles.length} file(s) selected ({formatBytes(totalSelectedSize)})
              </span>
            ) : (
              <span>No files chosen</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-colors ${
                isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUploadSubmit}
              disabled={selectedFiles.length === 0 || uploading}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition-all flex items-center gap-1.5 active:translate-y-0.5"
            >
              {uploading ? 'Uploading...' : `Upload (${selectedFiles.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
