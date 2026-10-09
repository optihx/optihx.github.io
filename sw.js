/* ==========================================================
   opti'H ✗ — service worker (version application)
   Garde le site en mémoire pour qu'il s'ouvre vite et reste lisible
   sans connexion.
   Les pages, CSS et JS sont toujours repris en ligne quand il y a du réseau :
   tes modifications s'affichent directement.
   Si tu remplaces une IMAGE en gardant le même nom, ou si tu ajoutes une
   page à garder hors ligne, change le numéro de VERSION ci-dessous
   (ex. "optih-v1" → "optih-v2").
   ========================================================== */
var VERSION = "optih-v32";
var COEUR = [
  "./", "index.html", "offline.html", "manifest.webmanifest",
  "assets/fonts/fonts.css", "assets/css/base.css", "assets/css/app.css",
  "assets/js/jeux.js", "assets/js/outils.js", "assets/js/saison.js", "assets/js/notifs.js", "assets/js/carte-joueur.js", "assets/js/sync.js", "assets/js/carte.js", "assets/js/codes.js", "assets/js/app.js",
  "assets/img/logo-oph.png", "assets/app/icon-192.png",
  "bdo/index.html", "bdo/style.css",
  "wuthering-waves/index.html", "wuthering-waves/style.css",
  "wuthering-waves/data-resonateurs.js", "wuthering-waves/data-tier.js",
  "wuthering-waves/catalogue.js", "wuthering-waves/equipe.js", "wuthering-waves/team-image.js", "wuthering-waves/tier.js",
  "wuthering-waves/data-degats.js", "wuthering-waves/degats.js", "wuthering-waves/onglets.js", "wuthering-waves/possedes.js",
  "wuthering-waves/data-materiaux.js", "wuthering-waves/data-echos.js", "wuthering-waves/materiaux.js", "wuthering-waves/data-calendrier.js", "wuthering-waves/calendrier.js", "wuthering-waves/tirages.js", "wuthering-waves/echos.js", "wuthering-waves/musique.js", "wuthering-waves/resets.js",
  "bdo/data-gear.js", "bdo/gear.js", "bdo/fiche-image.js", "bdo/data-taches.js", "bdo/taches.js", "tower-of-god/data-persos.js", "tower-of-god/equipes.js", "tower-of-god/team-image.js", "assets/js/partage-image.js",
  "tower-of-god/index.html", "tower-of-god/style.css",
  "clash-of-clans/index.html", "clash-of-clans/style.css", "clash-of-clans/coc.js", "clash-of-clans/data-coc.js",
  "palworld/index.html", "palworld/style.css", "palworld/pal.js", "palworld/data-pal.js"
];
var MAX_IMAGES = 400;

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(COEUR.map(function (u) { return c.add(new Request(u, { cache: "reload" })).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("optih-") === 0 && k !== VERSION && k !== VERSION + "-img"; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function rangerImage(req, res) {
  caches.open(VERSION + "-img").then(function (c) {
    c.put(req, res);
    c.keys().then(function (k) { if (k.length > MAX_IMAGES) for (var i = 0; i < k.length - MAX_IMAGES; i++) c.delete(k[i]); });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return; // sites externes (YouTube, Garmoth…) : pas touché

  // Pages : le réseau d'abord (pour avoir la dernière version), sinon la copie, sinon la page hors-ligne
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (res) {
      var copie = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copie); });
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match("offline.html"); });
    }));
    return;
  }

  // Images : la copie d'abord (rapide et économe en data), sinon le réseau
  if (req.destination === "image") {
    e.respondWith(caches.match(req).then(function (r) {
      return r || fetch(req).then(function (res) { if (res.ok) rangerImage(req, res.clone()); return res; });
    }));
    return;
  }

  // CSS, JS, polices, données : le réseau d'abord (tes modifs s'affichent tout de suite), la copie si pas de connexion
  e.respondWith(fetch(req).then(function (res) {
    if (res.ok) { var copie = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copie); }); }
    return res;
  }).catch(function () { return caches.match(req, { ignoreSearch: true }); }));
});

/* Notifications (envoyées par Netlify, même quand le site est fermé) */
self.addEventListener("push", function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { titre: "opti'H ✗", texte: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.titre || "opti'H ✗", {
    body: d.texte || "", tag: d.tag || undefined, data: { url: d.url || "index.html" },
    icon: "assets/app/icon-192.png", badge: "assets/app/icon-96.png", lang: "fr"
  }));
});
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var url = new URL((e.notification.data && e.notification.data.url) || "index.html", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (l) {
    for (var i = 0; i < l.length; i++) { if (l[i].url.split("#")[0] === url.split("#")[0] && "focus" in l[i]) { l[i].navigate(url); return l[i].focus(); } }
    return self.clients.openWindow(url);
  }));
});
