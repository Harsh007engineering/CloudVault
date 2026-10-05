import React, { useState } from 'react';
import { KeyRound, Copy, Check, Download, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

export default function RecoveryCodesModal({ codes = [], onClose, isRegeneration = false }) {
  const { isDark } = useTheme();
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
      <div className={`rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 border transition-all backdrop-blur-2xl ${
        isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200 shadow-slate-300/50'
      }`}>
        <div className={`flex items-center gap-3 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className={`p-3 rounded-2xl ${
            isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}>
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isRegeneration ? 'New Recovery Codes' : 'Save Your Recovery Codes'}
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Essential for resetting your account password</p>
          </div>
        </div>

        {/* Strong Warning Callout */}
        <div className={`mt-4 p-3.5 rounded-2xl flex items-start gap-3 border ${
          isDark ? 'bg-amber-950/30 border-amber-900/60' : 'bg-amber-50 border-amber-200'
        }`}>
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className={`text-xs leading-relaxed ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
            <span className="font-semibold">These codes will only be shown once.</span> CloudVault never asks for email or phone. These 5 cryptographic codes are the <span className="underline font-semibold">only way</span> to reset your password if forgotten.
          </div>
        </div>

        {/* Code Display Grid */}
        <div className={`mt-4 rounded-2xl p-4 border ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="grid grid-cols-1 gap-2">
            {codes.map((code, index) => (
              <div
                key={index}
                className={`flex items-center justify-between font-mono text-sm tracking-widest px-4 py-2.5 rounded-xl border shadow-sm ${
                  isDark 
                    ? 'bg-slate-800/90 border-slate-700/80 text-white' 
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <span className={`text-xs select-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>#{index + 1}</span>
                <span className="font-bold text-brand-600">{code}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons: Copy and Download */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 border rounded-xl text-xs font-semibold transition-colors ${
              isDark 
                ? 'border-slate-700 text-slate-200 hover:bg-slate-800' 
                : 'border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Codes' : 'Copy All'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 border rounded-xl text-xs font-semibold transition-colors ${
              isDark 
                ? 'border-slate-700 text-slate-200 hover:bg-slate-800' 
                : 'border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Download .txt
          </button>
        </div>

        {/* Checkbox Acknowledgment */}
        <div className={`mt-5 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <label className={`flex items-start gap-2.5 cursor-pointer text-xs select-none ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
            />
            <span>I have safely saved these 5 recovery codes and understand they cannot be shown again.</span>
          </label>

          <button
            type="button"
            disabled={!confirmed}
            onClick={onClose}
            className="mt-4 w-full bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-brand-600/20 text-sm flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
          >
            <span>Continue to CloudVault</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
