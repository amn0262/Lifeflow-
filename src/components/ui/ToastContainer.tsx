import React from 'react';
import { useApp } from '../../store/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 end-4 z-50 flex flex-col gap-2 max-w-[calc(100vw-2rem)] sm:max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : isError
                ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                : isWarning
                ? 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                : 'bg-white/95 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
            }`}
            role="alert"
          >
            <div className="flex-shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              {isWarning && <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              {!isSuccess && !isError && !isWarning && (
                <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>

            <div className="flex-1 text-sm">
              <h5 className="font-semibold leading-snug">{toast.title}</h5>
              {toast.message && (
                <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 opacity-60 hover:opacity-100 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-opacity"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
