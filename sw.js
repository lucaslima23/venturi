// Define o nome do cache e a versão. Mude a versão para forçar uma atualização.
const CACHE_NAME = 'tev-calculator-v1';

// Lista de todos os arquivos que o Service Worker deve cachear
const urlsToCache = [
  '',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'images/icon-192x192.png',
  'images/icon-512x512.png'
];

// O evento 'install' é disparado quando o Service Worker é instalado
self.addEventListener('install', event => {
  // O Service Worker espera até que o cache seja aberto e todos os arquivos sejam adicionados
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto com sucesso');
        return cache.addAll(urlsToCache);
      })
  );
});

// O evento 'activate' é disparado quando o Service Worker é ativado
self.addEventListener('activate', event => {
  // Remove caches antigos que não correspondem ao CACHE_NAME atual
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('tev-calculator-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// O evento 'fetch' é disparado sempre que a página faz uma requisição
self.addEventListener('fetch', event => {
  // Responde com o arquivo do cache se ele existir. Caso contrário, busca na rede.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna o arquivo do cache se ele for encontrado
        if (response) {
          return response;
        }

        // Caso contrário, busca o arquivo na rede
        return fetch(event.request);
      })
  );

});
