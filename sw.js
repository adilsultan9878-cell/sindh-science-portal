/* Offline support. On the first visit the phone keeps a copy of the app, the fonts and every
   chapter file, so lessons, quizzes and games open later without internet.
   When you change CSS or JS, raise VERSION here and the ?v= number in index.html to the same value. */
var VERSION = '20261101b';
var CACHE = 'ssp-' + VERSION;
var SHELL = [
  '/',
  '/css/style.css?v=' + VERSION,
  '/js/config.js?v=' + VERSION,
  '/js/ui-text.js?v=' + VERSION,
  '/js/diagrams.js?v=' + VERSION,
  '/js/classroom.js?v=' + VERSION,
  '/js/app.js?v=' + VERSION,
  '/fonts/noto-naskh-arabic-arabic-400-normal.woff2',
  '/fonts/noto-naskh-arabic-arabic-700-normal.woff2',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/data/catalog.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(SHELL).then(function () {
      return cache.match('/data/catalog.json').then(function (r) { return r.json(); });
    }).then(function (cat) {
      var files = [];
      cat.classes.forEach(function (c) {
        if (c.active) c.subjects.forEach(function (s) {
          if (s.active) (s.chapters || []).forEach(function (id) {
            files.push('/data/class-' + c.id + '/' + s.id + '/' + id + '.json');
            files.push('/img/' + id + '.webp');
            files.push('/img/exp/' + id + '.svg');
          });
        });
      });
      // One missing chapter file or picture must not stop the rest from being saved.
      return Promise.all(files.map(function (f) { return cache.add(f).catch(function () {}); }));
    });
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('ssp-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Pages: try the internet first (so updates show at once), but fall back to the saved copy
// when offline or when the connection takes longer than 4 seconds.
function page(request) {
  var network = fetch(request).then(function (res) {
    if (res.ok) {
      var copy = res.clone();
      caches.open(CACHE).then(function (cache) { cache.put('/', copy); });
    }
    return res;
  });
  return new Promise(function (resolve) {
    var done = false;
    function finish(res) { if (!done && res) { done = true; resolve(res); } }
    var timer = setTimeout(function () { caches.match('/').then(finish); }, 4000);
    network.then(function (res) { clearTimeout(timer); finish(res); }).catch(function () {
      clearTimeout(timer);
      caches.match('/').then(function (hit) { finish(hit || Response.error()); });
    });
  });
}

// Files: use the saved copy at once; chapter files are refreshed in the background.
// Word sounds are asked for whole (the browser asks for parts), so they can be saved for offline use.
function file(event) {
  var request = event.request;
  var whole = new URL(request.url).pathname.indexOf('/audio/') === 0 ? request.url : request;
  return caches.match(request).then(function (hit) {
    var network = fetch(whole).then(function (res) {
      if (res.status === 200) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
      }
      return res;
    });
    if (hit) {
      if (new URL(request.url).pathname.indexOf('/data/') === 0) event.waitUntil(network.catch(function () {}));
      return hit;
    }
    return network;
  });
}

self.addEventListener('fetch', function (event) {
  var request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return; // the database is always asked directly
  if (url.pathname.indexOf('/admin') === 0) return;                            // the staff panel always needs internet
  if (/^\/(videos|lesson-videos|class)(\/|$)/.test(url.pathname)) return;               // videos are large and stream in parts
  if (/^\/paper(\/|$)/.test(url.pathname)) return;                                // the teachers' question paper page is its own page
  if (request.headers.get('range')) return;                                        // audio played in parts cannot be cached
  event.respondWith(request.mode === 'navigate' ? page(request) : file(event));
});
