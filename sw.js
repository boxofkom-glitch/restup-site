// Service worker minimal : rend l'appli installable en plein écran. Aucune donnée n'est mise en cache
// (les données client restent toujours celles du réseau : pas de risque d'affichage périmé ou partagé).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* réseau direct */ });
