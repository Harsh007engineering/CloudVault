import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileText, Check, AlertCircle, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { formatBytes } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function FileUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const { user, updateStorage } = useAuth();
  const { success, error: toastError } = useToast();
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
        toastError(`Adding "${file.name}" would exceed your remaining storage limit (${formatBytes(remainingQuota)})`);
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

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setProgress(20);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      setProgress(50);
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(Math.min(95, percent));
          }
        }
      });

      setProgress(100);
      if (res.success) {
        success(`Successfully uploaded ${res.data.files.length} file(s)`);
        updateStorage(res.data.storageUsed, res.data.storageLimit);
        onUploadSuccess();
        onClose();
      }
    } catch (err) {
      toastError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const totalSelectedSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Files</h3>
              <p className="text-xs text-slate-500">
                Available space: {formatBytes(remainingQuota)} remaining
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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
              ? 'border-brand-500 bg-brand-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-slate-50'
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
          <div className="mx-auto w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">
            Drag & drop files here, or <span className="text-brand-600 underline">Browse</span>
          </h4>
          <p className="text-xs text-slate-500 mt-1.5">
            PDF, DOCX, TXT, PPT, XLS, Images, ZIP
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">
            Maximum 25 MiB per file
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="truncate font-medium text-slate-800">{file.name}</span>
                  <span className="text-slate-400 shrink-0 font-mono">({formatBytes(file.size)})</span>
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
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Uploading to secure cloud...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
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
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUploadSubmit}
              disabled={selectedFiles.length === 0 || uploading}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
            >
              {uploading ? 'Uploading...' : `Upload (${selectedFiles.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
