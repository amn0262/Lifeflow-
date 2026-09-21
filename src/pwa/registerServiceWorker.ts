import { registerSW } from 'virtual:pwa-register';

export interface SWRegistrationCallbacks {
  onOfflineReady?: () => void;
  onNeedRefresh?: () => void;
}

export function initServiceWorker(callbacks?: SWRegistrationCallbacks) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  try {
    const updateSW = registerSW({
      immediate: true,
      onOfflineReady() {
        console.info('[LifeFlow PWA] App assets precached. Offline capability active.');
        callbacks?.onOfflineReady?.();
      },
      onNeedRefresh() {
        console.info('[LifeFlow PWA] New update available.');
        callbacks?.onNeedRefresh?.();
      },
      onRegisterError(error: any) {
        console.warn('[LifeFlow PWA] Service worker registration encountered error:', error);
      },
    });

    return updateSW;
  } catch (err) {
    console.warn('[LifeFlow PWA] Failed to initialize service worker:', err);
    return () => {};
  }
}
