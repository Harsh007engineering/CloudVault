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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isRegeneration ? 'New Recovery Codes' : 'Save Your Recovery Codes'}
            </h3>
            <p className="text-xs text-slate-500">Essential for resetting your account password</p>
          </div>
        </div>

        {/* Strong Warning Callout */}
        <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">These codes will only be shown once.</span> CloudVault does not require an email or phone number. These 5 cryptographic codes are the <span className="underline">only way</span> to reset your password if forgotten.
          </div>
        </div>

        {/* Code Display Grid */}
        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="grid grid-cols-1 gap-2">
            {codes.map((code, index) => (
              <div
                key={index}
                className="flex items-center justify-between font-mono text-sm tracking-widest bg-white border border-slate-200/80 px-4 py-2 rounded-lg text-slate-800"
              >
                <span className="text-slate-400 text-xs select-none">#{index + 1}</span>
                <span className="font-bold">{code}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons: Copy and Download */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard' : 'Copy All Codes'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download as .txt
          </button>
        </div>

        {/* Checkbox Acknowledgment */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <span>I have safely saved these 5 recovery codes and understand they cannot be shown again.</span>
          </label>

          <button
            type="button"
            disabled={!confirmed}
            onClick={onClose}
            className="mt-4 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
          >
            Continue to CloudVault
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
