import { useState, useEffect } from 'react';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function usePWA(): PWAState & {
  updateApp: () => void;
  requestNotificationPermission: () => Promise<NotificationPermission>;
} {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    updateAvailable: false,
    registration: null,
  });

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setState(prev => ({
        ...prev,
        isInstalled: isStandalone || isInWebAppiOS,
      }));
    };

    // Check for service worker updates
    const checkForUpdates = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          setState(prev => ({ ...prev, registration }));

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setState(prev => ({ ...prev, updateAvailable: true }));
                }
              });
            }
          });
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      }
    };

    // Check installability
    const checkInstallable = () => {
      // Check if the app can be installed
      setState(prev => ({
        ...prev,
        isInstallable: !prev.isInstalled && 'onbeforeinstallprompt' in window,
      }));
    };

    // Listen for online/offline status
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));

    // Initialize
    checkInstalled();
    checkForUpdates();
    checkInstallable();

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateApp = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  };

  return {
    ...state,
    updateApp,
    requestNotificationPermission,
  };
}