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
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
      badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
      icon: FileText
    };
  }

  if (['.doc', '.docx'].includes(ext) || mimeType.includes('word')) {
    return {
      type: 'DOCX',
      category: 'document',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60',
      badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      icon: FileText
    };
  }

  if (['.xls', '.xlsx'].includes(ext) || mimeType.includes('sheet') || mimeType.includes('excel')) {
    return {
      type: 'SHEET',
      category: 'spreadsheet',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60',
      badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
      icon: FileSpreadsheet
    };
  }

  if (['.ppt', '.pptx'].includes(ext) || mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    return {
      type: 'PPT',
      category: 'presentation',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
      badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
      icon: Presentation
    };
  }

  if (['.jpg', '.jpeg', '.png'].includes(ext) || mimeType.startsWith('image/')) {
    return {
      type: 'IMG',
      category: 'image',
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60',
      badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
      icon: ImageIcon
    };
  }

  if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext) || mimeType.includes('zip')) {
    return {
      type: 'ZIP',
      category: 'archive',
      color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/60',
      badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
      icon: FileArchive
    };
  }

  if (['.txt'].includes(ext) || mimeType.includes('plain')) {
    return {
      type: 'TXT',
      category: 'document',
      color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      badge: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200',
      icon: FileText
    };
  }

  return {
    type: ext ? ext.replace('.', '').toUpperCase() : 'FILE',
    category: 'other',
    color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    badge: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200',
    icon: FileGeneric
  };
}
