import React from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  FileCode, 
  FileArchive, 
  Image as ImageIcon, 
  File as FileGeneric 
} from 'lucide-react';

/**
 * Formats bytes into human-readable size string (B, KiB, MiB, GiB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats ISO date string into readable academic format
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Determines file icon, badge color, and category from filename and mimeType
 */
export function getFileTypeMeta(filename = '', mimeType = '') {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();

  if (['.pdf'].includes(ext) || mimeType.includes('pdf')) {
    return {
      type: 'PDF',
      category: 'document',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      badge: 'bg-rose-100 text-rose-700',
      icon: FileText
    };
  }

  if (['.doc', '.docx'].includes(ext) || mimeType.includes('word')) {
    return {
      type: 'DOCX',
      category: 'document',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
      icon: FileText
    };
  }

  if (['.xls', '.xlsx'].includes(ext) || mimeType.includes('sheet') || mimeType.includes('excel')) {
    return {
      type: 'SHEET',
      category: 'spreadsheet',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700',
      icon: FileSpreadsheet
    };
  }

  if (['.ppt', '.pptx'].includes(ext) || mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    return {
      type: 'PPT',
      category: 'presentation',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      icon: Presentation
    };
  }

  if (['.jpg', '.jpeg', '.png'].includes(ext) || mimeType.startsWith('image/')) {
    return {
      type: 'IMG',
      category: 'image',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      badge: 'bg-purple-100 text-purple-700',
      icon: ImageIcon
    };
  }

  if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext) || mimeType.includes('zip')) {
    return {
      type: 'ZIP',
      category: 'archive',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      badge: 'bg-orange-100 text-orange-700',
      icon: FileArchive
    };
  }

  if (['.txt'].includes(ext) || mimeType.includes('plain')) {
    return {
      type: 'TXT',
      category: 'document',
      color: 'text-slate-600 bg-slate-100 border-slate-200',
      badge: 'bg-slate-200 text-slate-700',
      icon: FileText
    };
  }

  return {
    type: ext ? ext.replace('.', '').toUpperCase() : 'FILE',
    category: 'other',
    color: 'text-slate-600 bg-slate-100 border-slate-200',
    badge: 'bg-slate-200 text-slate-700',
    icon: FileGeneric
  };
}
