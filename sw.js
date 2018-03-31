self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ...', event);
  return self.clients.claim();
});

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open('static')
      .then(function(cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll([
          '/',
          '/index.html',
          '/restaurant.html',
          '/css/main.css',
          '/js/dbhelper.js',
          '/js/main.js',
          '/js/restaurant_info.js',
          '/js/view-switcher.js',
          'https://normalize-css.googlecode.com/svn/trunk/normalize.css',
          'https://use.fontawesome.com/releases/v5.0.8/js/solid.js',
          'https://use.fontawesome.com/releases/v5.0.8/js/fontawesome.js',
          'https://maps.googleapis.com/maps/api/js?key=AIzaSyDiXQDxeNsrICqtVZs-bjsowA5rnBnXpMU&libraries=places&callback=initMap',
        ]);
      })
  )
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request);
        }
      })
  );
});
