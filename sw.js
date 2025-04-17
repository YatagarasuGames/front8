const CACHE_NAME = 'smart-todo-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/notifications.js',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/manifest.json'
];


self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Кэш открыт');
                return cache.addAll(urlsToCache);
            })
            .catch(function(err) {
                console.error('Ошибка кэширования:', err);
            })
    );
});


self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cache) {
                    if (cache !== CACHE_NAME) {
                        console.log('Удаление старого кэша:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                
                return fetch(event.request)
                    .then(function(response) {
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(function() {
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});


self.addEventListener('push', event => {
    console.log('[Service Worker] Push Received');
    
    const payload = event.data?.json() || {
      title: 'Напоминание',
      body: 'У вас есть невыполненные задачи',
      icon: '/icons/icon-192.png'
    };
  
    event.waitUntil(
      self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        vibrate: [200, 100, 200],
        data: { url: '/' }
      }).then(() => {
        console.log('[Service Worker] Notification shown successfully');
      }).catch(err => {
        console.error('[Service Worker] Notification error:', err);
      })
    );
  });


self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] Notification click');
    event.notification.close();
    
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(clientList => {
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  });