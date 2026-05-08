// Mudamos a versão para v2. Toda vez que você alterar o seu código no futuro, 
// mude este número (v3, v4) para forçar os navegadores dos usuários a atualizarem.
const CACHE_NAME = 'pokedex-v2'; 

const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/script.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// INSTALAÇÃO: Faz o download dos arquivos novos
self.addEventListener('install', event => {
  self.skipWaiting(); // Força o Service Worker novo a assumir o controle imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ATIVAÇÃO: Limpa os caches de versões antigas (ex: apaga o v1 e mantém o v2)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Limpando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => clients.claim()) // Assume o controle de todas as abas abertas
  );
});

// FETCH: Intercepta as requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});