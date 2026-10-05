import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useTheme } from './useTheme';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  const { isXP } = useTheme();

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          if (isXP) {
            return (
              <div
                key={toast.id}
                className="pointer-events-auto xp-balloon animate-slide-up"
              >
                <div className="xp-balloon-header">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <span>
                      {toast.type === 'error' ? '❌' : toast.type === 'success' ? 'ℹ️' : 'ℹ️'}
                    </span>
                    CloudVault {toast.type === 'error' ? 'Alert' : toast.type === 'success' ? 'Completed' : 'Notification'}
                  </span>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-slate-800 hover:text-red-700 font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-[11px] leading-relaxed text-slate-900 font-normal">
                  {toast.message}
                </div>
              </div>
            );
          }

          let bg = 'bg-slate-900 text-white';
          let Icon = Info;
          let iconColor = 'text-sky-400';

          if (toast.type === 'success') {
            bg = 'bg-slate-900 border border-emerald-500/30 text-white';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-400';
          } else if (toast.type === 'error') {
            bg = 'bg-slate-900 border border-rose-500/30 text-white';
            Icon = AlertCircle;
            iconColor = 'text-rose-400';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl backdrop-blur-sm transition-all transform translate-y-0 ${bg}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
