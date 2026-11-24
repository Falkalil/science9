// يعمل الكتاب دون إنترنت: كلُّ ملفٍّ يُحفظ في الذاكرة المؤقتة ويُقدَّم منها
const CACHE = 'sci9-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './play.css', './fonts/tajawal.css', './js/app.js', './js/data.js', './js/kit.js', './js/lesson.js', './js/nafes.js', './js/practice.js', './js/play.js', './js/sims9.js', './js/vlab.js', './js/assist.js', './js/assistant.js', './js/lessons9.js', './js/models4.js', './js/models6a.js', './js/models9.js', './js/three.module.min.js', './js/addons/controls/OrbitControls.js', './js/offline.js', './precache.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(CORE.map(u => c.add(u)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => {
    if (res && res.ok && new URL(r.url).origin === location.origin) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => r.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
