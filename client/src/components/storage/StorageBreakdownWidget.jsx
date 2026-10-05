import React from 'react';
import { HardDrive, FileText, Image as ImageIcon, FileSpreadsheet, Presentation, FileArchive, HelpCircle } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export default function StorageBreakdownWidget({ stats, user }) {
  const totalLimit = user?.storageLimit || 524288000; // 500 MiB
  const totalUsed = user?.storageUsed || 0;
  const remaining = Math.max(0, totalLimit - totalUsed);

  const breakdown = stats?.breakdown || {
    documents: { bytes: 0, count: 0, label: 'Documents' },
    images: { bytes: 0, count: 0, label: 'Images' },
    spreadsheets: { bytes: 0, count: 0, label: 'Spreadsheets' },
    presentations: { bytes: 0, count: 0, label: 'Presentations' },
    archives: { bytes: 0, count: 0, label: 'Archives' },
    other: { bytes: 0, count: 0, label: 'Other' }
  };

  const getPercent = (bytes) => {
    if (!totalLimit || totalLimit === 0) return 0;
    return Math.max(0, Math.min(100, (bytes / totalLimit) * 100));
  };

  const categories = [
    { key: 'documents', label: 'Documents', color: 'bg-blue-500', dot: 'bg-blue-500', icon: FileText, ...breakdown.documents },
    { key: 'images', label: 'Images', color: 'bg-purple-500', dot: 'bg-purple-500', icon: ImageIcon, ...breakdown.images },
    { key: 'spreadsheets', label: 'Sheets', color: 'bg-emerald-500', dot: 'bg-emerald-500', icon: FileSpreadsheet, ...breakdown.spreadsheets },
    { key: 'presentations', label: 'Slides', color: 'bg-amber-500', dot: 'bg-amber-500', icon: Presentation, ...breakdown.presentations },
    { key: 'archives', label: 'Archives', color: 'bg-orange-500', dot: 'bg-orange-500', icon: FileArchive, ...breakdown.archives },
    { key: 'other', label: 'Other', color: 'bg-slate-400', dot: 'bg-slate-400', icon: HelpCircle, ...breakdown.other },
  ];

  const overallPercent = Math.min(100, Math.round((totalUsed / totalLimit) * 100));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <HardDrive className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Storage Breakdown</span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-white">{formatBytes(totalUsed)}</span> of{' '}
          <span className="font-bold text-slate-900 dark:text-white">{formatBytes(totalLimit)}</span> ({overallPercent}%)
        </div>
      </div>

      {/* Segmented Color Bar */}
      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex border border-slate-200/70 dark:border-slate-700/60 p-0.5">
        {categories.map((cat) => {
          const pct = getPercent(cat.bytes);
          if (pct <= 0) return null;
          return (
            <div
              key={cat.key}
              className={`h-full ${cat.color} first:rounded-l-full last:rounded-r-full transition-all duration-500`}
              style={{ width: `${pct}%` }}
              title={`${cat.label}: ${formatBytes(cat.bytes)} (${cat.count} files)`}
            />
          );
        })}
      </div>

      {/* Legend & Details */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        {categories.map((cat) => (
          <div key={cat.key} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${cat.dot} shrink-0`} />
            <div className="truncate">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">{cat.label}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px] block">{formatBytes(cat.bytes)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
