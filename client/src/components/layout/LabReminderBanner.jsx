import React, { useState } from 'react';
import { Shield, X } from 'lucide-react';

export default function LabReminderBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 flex-1 text-center">
        <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>
          <strong>Shared Lab PC Notice:</strong> Remember to log out when finished. No personal credentials or tokens are saved on this computer.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-700 dark:text-amber-300 hover:text-amber-950 dark:hover:text-white p-1 rounded-md hover:bg-amber-500/20 transition-colors"
        title="Dismiss reminder"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
