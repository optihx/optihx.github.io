/* ==========================================================
   opti'H ✗ — version application (téléphone et ordinateur)
   - enregistre le service worker (sw.js) : le site s'installe
     comme une appli et reste lisible sans connexion ;
   - bouton « Installer l'appli » (élément [data-installer]) ;
   - barre d'onglets en bas de l'écran sur téléphone
     (générée depuis assets/js/jeux.js, rien à toucher).
   ========================================================== */
(function () {
  var me = document.currentScript && document.currentScript.src;
  var ROOT = me ? new URL("../../", me).href : "/";
  var html = document.documentElement;
  var standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (standalone) html.classList.add("en-appli");

  /* ---------- Synchro entre appareils (code secret) ---------- */
  (function () { var sc = document.createElement("script"); sc.src = ROOT + "assets/js/sync.js"; document.head.appendChild(sc); })();

  /* ---------- Service worker ---------- */
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    addEventListener("load", function () { navigator.serviceWorker.register(ROOT + "sw.js").catch(function () {}); });
  }

  /* ---------- Bouton « Installer l'appli » ---------- */
  var invite = null;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function boutons() { return document.querySelectorAll("[data-installer]"); }
  function montrer(oui) { Array.prototype.forEach.call(boutons(), function (b) { b.hidden = !oui; }); }
  montrer(false);
  addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); invite = e; if (!standalone) montrer(true); });
  addEventListener("appinstalled", function () { invite = null; montrer(false); });
  if (ios && !standalone) montrer(true);
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-installer]"); if (!b) return;
    if (invite) { invite.prompt(); invite.userChoice.then(function () { invite = null; montrer(false); }); return; }
    aide(b);
  });
  function aide(b) {
    var old = document.getElementById("aide-install"); if (old) { old.remove(); return; }
    var d = document.createElement("div");
    d.id = "aide-install"; d.className = "aide-install"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Installer l'appli");
    d.innerHTML = ios
      ? "<p><b>Sur iPhone / iPad</b> : touche le bouton <b>Partager</b> de Safari (le carré avec une flèche), puis <b>Sur l'écran d'accueil</b>.</p><button type=\"button\">OK</button>"
      : "<p>Dans Chrome ou Edge : menu <b>⋮</b> → <b>Installer opti'H</b> (ou l'icône d'installation dans la barre d'adresse).</p><button type=\"button\">OK</button>";
    document.body.appendChild(d);
    d.querySelector("button").addEventListener("click", function () { d.remove(); });
    d.querySelector("button").focus();
  }

  /* ---------- Mode clair / sombre (pages qui ont une place [data-theme-slot]) ---------- */
  var slot = document.querySelector("[data-theme-slot]");
  if (slot) {
    var defaut = html.getAttribute("data-theme-defaut") || "clair";
    var actuel = function () { return html.getAttribute("data-theme") || defaut; };
    var bt = document.createElement("button");
    bt.type = "button"; bt.className = "theme-btn";
    var LUNE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
    var SOLEIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    var maj = function () {
      var sombre = actuel() === "sombre";
      bt.innerHTML = (sombre ? SOLEIL : LUNE) + "<span>" + (sombre ? "Clair" : "Sombre") + "</span>";
      bt.setAttribute("aria-label", sombre ? "Passer en mode clair" : "Passer en mode sombre");
      bt.setAttribute("aria-pressed", sombre ? "true" : "false");
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) { if (!meta.dataset.orig) meta.dataset.orig = meta.content; meta.content = actuel() === defaut ? meta.dataset.orig : (sombre ? "#111419" : "#f4f2fb"); }
    };
    bt.addEventListener("click", function () {
      var t = actuel() === "sombre" ? "clair" : "sombre";
      html.setAttribute("data-theme", t);
      try { localStorage.setItem("optih-theme", t); } catch (e) {}
      maj();
    });
    slot.appendChild(bt); maj();
  }

  /* ---------- Bouton « retour en haut » ---------- */
  var haut = document.createElement("button");
  haut.type = "button"; haut.className = "haut"; haut.setAttribute("aria-label", "Retour en haut de la page"); haut.title = "Retour en haut";
  haut.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
  haut.addEventListener("click", function () { scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); });
  document.body.appendChild(haut);
  var vu = false;
  function majHaut() { var v = scrollY > Math.max(500, innerHeight * 0.8); if (v !== vu) { vu = v; haut.classList.toggle("visible", v); } }
  addEventListener("scroll", majHaut, { passive: true }); majHaut();

  /* ---------- Barre d'onglets (téléphone) ---------- */
  var JEUX = window.JEUX || [];
  if (!document.body.hasAttribute("data-sans-onglets") && JEUX.length) {
    var moi = document.body.getAttribute("data-jeu") || "";
    var surHub = !moi;
    function esc(s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    var nav = document.createElement("nav");
    nav.className = "onglets"; nav.setAttribute("aria-label", "Navigation de l'appli");
    nav.innerHTML = '<a href="' + ROOT + 'index.html"' + (surHub ? ' aria-current="page"' : "") + ' style="--c:#ffcf8a">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M5 20V6h3v14M10 20V4h3v16M15 20l2-13 3 .6-2 12.4"/></svg><span>Étagère</span></a>' +
      JEUX.map(function (j) {
        var ext = /^https?:/.test(j.lien);
        var href = ext ? j.lien : ROOT + j.lien;
        var court = j.court || j.nom;
        return '<a href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + (j.lien === moi ? ' aria-current="page"' : "") + ' style="--c:' + esc(j.couleur) + '">' +
          '<i aria-hidden="true">' + esc(court.slice(0, 1)) + "</i><span>" + esc(court) + "</span></a>";
      }).join("");
    document.body.appendChild(nav);
    html.classList.add("avec-onglets");
  }
})();
