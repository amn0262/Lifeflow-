import React, { useState } from 'react';
import { Download, Smartphone, Share2, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../pwa/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  // Chromium / Android / Edge Desktop install button
  if (isInstallable) {
    if (compact) {
      return (
        <button
          id="btn-pwa-install-compact"
          onClick={handleInstallClick}
          disabled={installing}
          title="Install LifeFlow as an offline-ready App"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Install</span>
        </button>
      );
    }

    return (
      <button
        id="btn-pwa-install-full"
        onClick={handleInstallClick}
        disabled={installing}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div
            id="modal-ios-pwa-guide"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    LF
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Install LifeFlow</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Add to iPhone / iPad Home Screen</p>
                  </div>
                </div>
                <button
                  id="btn-close-ios-guide"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px]">
                    1
                  </span>
                  <div>
                    Tap the <strong className="text-slate-900 dark:text-white inline-flex items-center gap-1">Share <Share2 className="w-3 h-3 inline" /></strong> icon in Safari's bottom toolbar.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px]">
                    2
                  </span>
                  <div>
                    Scroll down and select <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px]">
                    3
                  </span>
                  <div>
                    Tap <strong className="text-slate-900 dark:text-white">Add</strong> in top right. You can now access LifeFlow anytime offline!
                  </div>
                </div>
              </div>

              <button
                id="btn-dismiss-ios-guide"
                onClick={() => setShowIOSGuide(false)}
                className="w-full mt-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
