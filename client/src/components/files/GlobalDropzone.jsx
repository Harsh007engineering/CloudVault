import React, { useState, useEffect } from 'react';
import { UploadCloud, Shield } from 'lucide-react';

export default function GlobalDropzone({ onFilesDropped }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  useEffect(() => {
    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter((prev) => prev + 1);
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setIsDragging(false);
          return 0;
        }
        return next;
      });
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragCounter(0);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFilesDropped(e.dataTransfer.files);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onFilesDropped]);

  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in pointer-events-none select-none">
      <div className="w-full max-w-2xl p-12 rounded-3xl border-2 border-dashed border-brand-400 bg-brand-950/30 text-white flex flex-col items-center justify-center text-center shadow-2xl shadow-brand-500/20 animate-scale-in">
        <div className="w-20 h-20 rounded-2xl bg-brand-500/20 border border-brand-400/40 text-brand-300 flex items-center justify-center mb-6 animate-bounce">
          <UploadCloud className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
          Drop Files to Upload
        </h3>
        <p className="text-sm text-brand-100/80 max-w-md leading-relaxed">
          Release your files anywhere to securely upload them directly to your private CloudVault
        </p>
        <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs text-brand-200 border border-white/15">
          <Shield className="w-3.5 h-3.5" />
          <span>Encrypted with safe unguessable object keys</span>
        </div>
      </div>
    </div>
  );
}
