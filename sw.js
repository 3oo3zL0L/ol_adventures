// Offline-cache. Verhoog VERSION bij elke release.
const VERSION = 'sk-v4';
const CORE = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest',
  'js/app.js', 'js/art.js', 'js/sfx.js', 'js/speech.js', 'js/brain.js', 'js/games.js',
  'js/story/h1.js', 'js/story/h2.js', 'js/story/h3.js', 'js/story/h4.js', 'js/story/h5.js', 'icons/icon.svg', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Netwerk met 3 s timeout; bij traag of geen netwerk de cache.
  const net = fetch(req);
  const slow = new Promise((resolve) => setTimeout(resolve, 3000))
    .then(() => caches.match(req, { ignoreSearch: true }))
    .then((hit) => hit || net);
  e.respondWith(Promise.race([net.then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return res;
  }), slow]).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
});
