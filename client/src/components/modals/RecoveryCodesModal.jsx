import React, { useState } from 'react';
import { KeyRound, Copy, Check, Download, AlertTriangle, ArrowRight } from 'lucide-react';

export default function RecoveryCodesModal({ codes = [], onClose, isRegeneration = false }) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = () => {
    const text = codes.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = `CLOUDVAULT ACCOUNT RECOVERY CODES\n` +
      `Generated: ${new Date().toISOString()}\n\n` +
      `Save these 5 one-time codes safely. They are the ONLY way to reset your password if you forget it.\n\n` +
      codes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      `\n\nEach code can only be used once.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudvault-recovery-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isRegeneration ? 'New Recovery Codes' : 'Save Your Recovery Codes'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Essential for resetting your account password</p>
          </div>
        </div>

        {/* Strong Warning Callout */}
        <div className="mt-4 p-3.5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <span className="font-semibold">These codes will only be shown once.</span> CloudVault never asks for email or phone. These 5 cryptographic codes are the <span className="underline font-semibold">only way</span> to reset your password if forgotten.
          </div>
        </div>

        {/* Code Display Grid */}
        <div className="mt-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
          <div className="grid grid-cols-1 gap-2">
            {codes.map((code, index) => (
              <div
                key={index}
                className="flex items-center justify-between font-mono text-sm tracking-widest bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 px-4 py-2.5 rounded-xl text-slate-900 dark:text-white shadow-sm"
              >
                <span className="text-slate-400 dark:text-slate-500 text-xs select-none">#{index + 1}</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">{code}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons: Copy and Download */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Codes' : 'Copy All'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download .txt
          </button>
        </div>

        {/* Checkbox Acknowledgment */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <span>I have safely saved these 5 recovery codes and understand they cannot be shown again.</span>
          </label>

          <button
            type="button"
            disabled={!confirmed}
            onClick={onClose}
            className="mt-4 w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-brand-600/20 text-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>Continue to CloudVault</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
