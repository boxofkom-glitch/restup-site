// Service worker : rend l'appli installable et accélère le lancement (fichiers statiques uniquement).
// Les données (Supabase) ne sont jamais mises en cache : elles viennent toujours du réseau.
const CACHE = 'restup-static-v2';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || r.headers.get('range')) return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  const stable = /^\/(assets\/(clients|logo)|portail\/(icon|apple-touch|splash))/.test(u.pathname) && /\.(png|jpg|svg)$/.test(u.pathname);
  const versioned = /\.(js|css)$/.test(u.pathname) && u.search.indexOf('v=') !== -1;
  if (!stable && !versioned) return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(r);
    const net = fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
