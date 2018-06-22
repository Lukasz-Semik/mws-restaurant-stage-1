importScripts('/js/idb.js');

const dbPromise = idb.open('restaurants-db', 2);

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
          '/js/main.js',
          '/js/restaurant_info.js',
          '/js/utils.js',
          '/js/idb.js',
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

const readIdbData = (storeName, keyName) => dbPromise.then(function(db) {
  var tx = db.transaction(storeName);
  var restaurantsStore = tx.objectStore(storeName);
    return restaurantsStore.get(keyName);
  });

self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-new-reviews') {
    event.waitUntil(readIdbData('sync-reviews', 'sync-review')
      .then(review => {
        return fetch('http://localhost:1337/reviews/', {
          body: JSON.stringify(review),
          method: 'POST',
          mode: 'cors',
        }).then(data => console.log('fetvhed'))
        .catch(err => console.log(err));
      })
    );
  }
});
