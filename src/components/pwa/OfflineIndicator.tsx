import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, CloudCheck } from 'lucide-react';
import { useOnlineStatus } from '../../pwa/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (showReconnected) {
    return (
      <div
        id="pwa-reconnected-indicator"
        className="fixed bottom-16 sm:bottom-6 left-4 z-40 flex items-center gap-2.5 rounded-xl bg-emerald-600/95 text-white px-3.5 py-2 text-xs font-semibold shadow-lg backdrop-blur border border-emerald-500/40 animate-in fade-in slide-in-from-bottom-3 duration-300"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-200" />
        <Wifi className="w-3.5 h-3.5 text-emerald-100" />
        <span>Back online — All data synced</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div
        id="pwa-offline-indicator"
        className="fixed bottom-16 sm:bottom-6 left-4 z-40 flex items-center gap-2.5 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-amber-300 px-3.5 py-2 text-xs font-semibold shadow-xl backdrop-blur border border-amber-500/30 animate-in fade-in slide-in-from-bottom-3 duration-300"
      >
        <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        <WifiOff className="w-3.5 h-3.5 text-amber-400" />
        <span>Offline Mode — Cached tasks available</span>
      </div>
    );
  }

  return null;
};
