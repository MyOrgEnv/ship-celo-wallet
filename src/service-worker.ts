// Service Worker for PWA functionality
const CACHE_NAME = 'celo-wallet-v1';
const STATIC_CACHE = 'celo-wallet-static-v1';
const DYNAMIC_CACHE = 'celo-wallet-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  // Add other static assets as needed
];

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('Service Worker: Installing');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('Service Worker: Activating');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/') || url.hostname.includes('celo')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2)$/)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Default: network-first for HTML, cache-first for others
  if (request.destination === 'document') {
    event.respondWith(networkFirstStrategy(request));
  } else {
    event.respondWith(cacheFirstStrategy(request));
  }
});

// Background sync for failed transactions
self.addEventListener('sync', (event: ExtendableEvent) => {
  console.log('Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'background-transaction-sync') {
    event.waitUntil(syncPendingTransactions());
  }
});

// Push notifications
self.addEventListener('push', (event: PushEvent) => {
  console.log('Service Worker: Push received', event);

  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Celo Wallet', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('Service Worker: Notification clicked', event);
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'view-transaction' && data?.transactionId) {
    event.waitUntil(
      clients.openWindow(`/transaction/${data.transactionId}`)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Cache-first strategy
async function cacheFirstStrategy(request: Request): Promise<Response> {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    // Return offline fallback if available
    return caches.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

// Network-first strategy
async function networkFirstStrategy(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Network-first strategy failed:', error);
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline fallback
    return caches.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

// Sync pending transactions
async function syncPendingTransactions(): Promise<void> {
  console.log('Service Worker: Syncing pending transactions');

  try {
    // Get pending transactions from IndexedDB or similar
    const pendingTransactions = await getPendingTransactions();

    for (const transaction of pendingTransactions) {
      try {
        // Attempt to resend transaction
        const result = await resendTransaction(transaction);

        if (result.success) {
          // Mark as completed
          await markTransactionComplete(transaction.id);
          // Send notification
          await self.registration.showNotification('Transaction Confirmed', {
            body: `Transaction ${transaction.id} has been confirmed`,
            icon: '/icons/icon-192x192.png',
          });
        }
      } catch (error) {
        console.error('Failed to sync transaction:', transaction.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Placeholder functions - implement based on your transaction system
async function getPendingTransactions(): Promise<any[]> {
  // Implement: Get pending transactions from storage
  return [];
}

async function resendTransaction(transaction: any): Promise<{ success: boolean }> {
  // Implement: Resend transaction logic
  return { success: true };
}

async function markTransactionComplete(id: string): Promise<void> {
  // Implement: Mark transaction as complete
}

// Export for TypeScript
export {};