const CACHE_NAME = 'dudu-timer-cache-v1.102';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  // Ajoutez ici tous les chemins de vos images et icônes
  './images/dudu-sport.png', 
  './images/icon-192.png',
  './images/icon-512.png'
];

// Installation du service worker : met en cache les fichiers nécessaires
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Récupération des ressources : si la ressource est en cache, on la sert
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - on retourne la réponse mise en cache
        if (response) {
          return response;
        }
        // Pas de hit, on récupère via le réseau
        return fetch(event.request);
      }
    )
  );
});