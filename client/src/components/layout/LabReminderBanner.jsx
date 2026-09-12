import React, { useState } from 'react';
import { Shield, X } from 'lucide-react';

export default function LabReminderBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 flex-1 text-center">
        <Shield className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Using a public university computer?</strong> Remember to log out when you're finished. No personal credentials are saved on this PC.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-700 hover:text-amber-950 p-1 rounded-md hover:bg-amber-500/20 transition-colors"
        title="Dismiss reminder"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
