/* opti'H ✗ — script commun des pages jeux (galerie, menus, autres jeux).
   Rien à modifier ici pour ajouter un jeu : tout se règle dans jeux.js. */
(function () {
  var COLS = 6, LETTRES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var JEUX = window.JEUX || [];
  var ROOT = document.body.getAttribute("data-root") || "";
  var ICO_FLECHE = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ---------- Placement des secteurs sur la grille ---------- */
  function placer(jeux) {
    var occupe = {}, out = [];
    function libre(c, r, w, h) {
      if (c + w > COLS) return false;
      for (var y = r; y < r + h; y++) for (var x = c; x < c + w; x++) if (occupe[x + "," + y]) return false;
      return true;
    }
    function prendre(c, r, w, h) { for (var y = r; y < r + h; y++) for (var x = c; x < c + w; x++) occupe[x + "," + y] = 1; }
    function taille(j) { var t = (j.taille || "1x1").split("x"); return [Math.min(+t[0] || 1, COLS), +t[1] || 1]; }
    jeux.forEach(function (j, i) { out[i] = { jeu: j, w: taille(j)[0], h: taille(j)[1] }; });
    // 1) positions choisies
    out.forEach(function (p) {
      var m = /^([A-Za-z])(\d+)$/.exec(p.jeu.position || "");
      if (!m) return;
      var c = LETTRES.indexOf(m[1].toUpperCase()), r = +m[2] - 1;
      if (c >= 0 && libre(c, r, p.w, p.h)) { p.c = c; p.r = r; prendre(c, r, p.w, p.h); }
    });
    // 2) le reste : première place libre
    out.forEach(function (p) {
      if (p.c !== undefined) return;
      for (var r = 0; r < 200; r++) for (var c = 0; c < COLS; c++) {
        if (libre(c, r, p.w, p.h)) { p.c = c; p.r = r; prendre(c, r, p.w, p.h); return; }
      }
    });
    out.forEach(function (p) {
      var a = LETTRES[p.c] + (p.r + 1), b = LETTRES[p.c + p.w - 1] + (p.r + p.h);
      p.coord = a === b ? a : a + "–" + b;
      p.court = a;
    });
    return out;
  }
  var PLAN = placer(JEUX);
  function lien(j) { return /^https?:/.test(j.lien) ? j.lien : ROOT + j.lien; }
  function esc(s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function externe(j) { return /^https?:/.test(j.lien) ? ' target="_blank" rel="noopener"' : ""; }

  /* ---------- Hub : dessine la carte ---------- */
  var secteurs = document.getElementById("sectors");
  if (secteurs) {
    var lignes = 4;
    PLAN.forEach(function (p) { lignes = Math.max(lignes, p.r + p.h); });
    secteurs.innerHTML = PLAN.map(function (p) {
      var j = p.jeu;
      return '<a class="sector s-' + p.w + "x" + p.h + '" href="' + esc(lien(j)) + '"' + externe(j) +
        ' style="--c:' + esc(j.couleur) + ";grid-column:" + (p.c + 1) + " / span " + p.w + ";grid-row:" + (p.r + 1) + " / span " + p.h + '"' +
        ' data-coord="' + p.coord + '">' +
        (j.image ? '<img src="' + esc(ROOT + j.image) + '" alt="" loading="lazy">' : "") +
        '<span class="coord">' + p.coord + "</span>" +
        '<div class="label"><h2>' + esc(j.nom) + "</h2>" + (j.texte ? "<p>" + esc(j.texte) + "</p>" : "") +
        '<span class="go">' + esc(j.action || "Entrer") + ICO_FLECHE + "</span></div></a>";
    }).join("");
    secteurs.style.gridTemplateRows = "repeat(" + lignes + ", var(--row))";
    var axeY = document.querySelector(".axis-y");
    if (axeY) {
      axeY.style.gridTemplateRows = "repeat(" + lignes + ", 1fr)";
      axeY.innerHTML = Array.from({ length: lignes }, function (_, i) { return "<span>" + (i + 1) + "</span>"; }).join("");
    }
    var readout = document.getElementById("readout");
    Array.prototype.forEach.call(secteurs.querySelectorAll(".sector"), function (s) {
      function on() { relief.hot(s); if (readout) readout.innerHTML = "Secteur <b>" + s.dataset.coord + "</b> — " + esc(s.querySelector("h2").textContent); }
      function off() { relief.hot(null); if (readout) readout.textContent = "Survole un secteur"; }
      s.addEventListener("mouseenter", on); s.addEventListener("focus", on);
      s.addEventListener("mouseleave", off); s.addEventListener("blur", off);
    });
    var chart = document.querySelector(".chart");
    if (chart && readout) chart.addEventListener("mousemove", function (e) {
      if (relief.isHot()) return;
      var r = chart.getBoundingClientRect();
      readout.innerHTML = "X <b>" + ((e.clientX - r.left) / r.width).toFixed(2) + "</b> · Y <b>" + ((e.clientY - r.top) / r.height).toFixed(2) + "</b>";
    });
  }

  /* ---------- Index des secteurs (hub + secteurs voisins) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-index]"), function (ul) {
    var moi = document.body.getAttribute("data-jeu");
    ul.innerHTML = PLAN.map(function (p, i) { p.n = i + 1; return p; }).filter(function (p) { return p.jeu.lien !== moi; }).map(function (p) {
      var j = p.jeu;
      return '<li><a href="' + esc(lien(j)) + '"' + externe(j) + ' style="--c:' + esc(j.couleur) + '"><span class="k">' + (p.n < 10 ? "0" : "") + p.n + "</span>" + esc(j.nom) + '<span class="t">' + esc(j.type) + "</span></a></li>";
    }).join("");
  });
  // Coordonnée de la page jeu courante
  var moi = document.body.getAttribute("data-jeu");
  if (moi) PLAN.forEach(function (p) {
    if (p.jeu.lien === moi) Array.prototype.forEach.call(document.querySelectorAll("[data-coord-auto]"), function (el) { el.textContent = "Secteur " + p.coord; });
  });

  /* ---------- Relief : lignes de niveau générées ---------- */
  var relief = (function () {
    var cv = document.querySelector("canvas.relief");
    var api = { hot: function () {}, isHot: function () { return false; } };
    if (!cv || !cv.getContext) return api;
    var ctx = cv.getContext("2d"), W, H, field, cols, rows, cell, actif = null;
    var seed = +(cv.getAttribute("data-seed") || 7);
    var niveaux = +(cv.getAttribute("data-levels") || 14);
    function rnd(i, j) { var s = Math.sin(i * 127.1 + j * 311.7 + seed) * 43758.5453; return s - Math.floor(s); }
    function noise(x, y) {
      var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
      var a = rnd(i, j), b = rnd(i + 1, j), c = rnd(i, j + 1), d = rnd(i + 1, j + 1);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    function fbm(x, y) { var t = 0, a = .55, f = 1; for (var o = 0; o < 4; o++) { t += a * noise(x * f, y * f); f *= 2.03; a *= .5; } return t; }
    function build() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight; if (!W || !H) return;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = W < 700 ? 14 : 10; cols = Math.ceil(W / cell) + 1; rows = Math.ceil(H / cell) + 1;
      field = new Float32Array(cols * rows);
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) field[j * cols + i] = fbm(i * cell / 260, j * cell / 260);
      draw();
    }
    function draw() {
      if (!field) return;
      ctx.clearRect(0, 0, W, H);
      var hot = null;
      if (actif) {
        var r = cv.getBoundingClientRect(), b = actif.getBoundingClientRect();
        hot = { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2, rad: Math.max(b.width, b.height) * .62, c: getComputedStyle(actif).getPropertyValue("--c").trim() };
      }
      var accent = getComputedStyle(cv).getPropertyValue("--c").trim();
      var teinte = cv.hasAttribute("data-tint") && accent;
      var T = { 1: [[3, 2]], 2: [[2, 1]], 3: [[3, 1]], 4: [[0, 1]], 5: [[3, 0], [2, 1]], 6: [[0, 2]], 7: [[3, 0]], 8: [[3, 0]], 9: [[0, 2]], 10: [[3, 2], [0, 1]], 11: [[0, 1]], 12: [[3, 1]], 13: [[2, 1]], 14: [[3, 2]] };
      for (var l = 1; l < niveaux; l++) {
        var t = l / niveaux * 1.05, base = [], lit = [];
        for (var j = 0; j < rows - 1; j++) for (var i = 0; i < cols - 1; i++) {
          var a = field[j * cols + i], b2 = field[j * cols + i + 1], c = field[(j + 1) * cols + i + 1], d = field[(j + 1) * cols + i];
          var k = (a > t ? 8 : 0) | (b2 > t ? 4 : 0) | (c > t ? 2 : 0) | (d > t ? 1 : 0);
          if (k === 0 || k === 15) continue;
          var x = i * cell, y = j * cell;
          var P = [[x + cell * (t - a) / (b2 - a), y], [x + cell, y + cell * (t - b2) / (c - b2)], [x + cell * (t - d) / (c - d), y + cell], [x, y + cell * (t - a) / (d - a)]];
          T[k].forEach(function (s) {
            var p0 = P[s[0]], p1 = P[s[1]];
            if (hot) { var mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2; if (Math.hypot(mx - hot.x, my - hot.y) < hot.rad) { lit.push([p0, p1]); return; } }
            base.push([p0, p1]);
          });
        }
        var major = l % 4 === 0;
        ctx.lineWidth = major ? 1.2 : .7;
        ctx.strokeStyle = major ? "rgba(170,196,255,.30)" : "rgba(150,180,255,.16)";
        if (teinte && major) { ctx.strokeStyle = accent; ctx.globalAlpha = .35; }
        ctx.beginPath(); base.forEach(function (s) { ctx.moveTo(s[0][0], s[0][1]); ctx.lineTo(s[1][0], s[1][1]); }); ctx.stroke();
        ctx.globalAlpha = 1;
        if (lit.length) {
          ctx.strokeStyle = hot.c; ctx.globalAlpha = major ? .9 : .55; ctx.lineWidth = major ? 1.6 : 1;
          ctx.beginPath(); lit.forEach(function (s) { ctx.moveTo(s[0][0], s[0][1]); ctx.lineTo(s[1][0], s[1][1]); }); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    var raf = 0;
    api.hot = function (el) { actif = el; cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
    api.isHot = function () { return !!actif; };
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    build();
    return api;
  })();

  /* ---------- Menu de la fiche : section active ---------- */
  var liens = document.querySelectorAll("[data-spy] a");
  if (liens.length && "IntersectionObserver" in window) {
    var parId = {};
    Array.prototype.forEach.call(liens, function (a) { parId[a.getAttribute("href").slice(1)] = a; });
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && parId[e.target.id]) {
          Array.prototype.forEach.call(liens, function (a) { a.classList.remove("on"); });
          parId[e.target.id].classList.add("on");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(parId).forEach(function (id) { var s = document.getElementById(id); if (s) obs.observe(s); });
  }

  /* ---------- Apparition au défilement ---------- */
  var rv = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("vu"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    Array.prototype.forEach.call(rv, function (el) { io.observe(el); });
  } else Array.prototype.forEach.call(rv, function (el) { el.classList.add("vu"); });

  /* ---------- Visionneuse d'images ---------- */
  var boutons = Array.prototype.slice.call(document.querySelectorAll(".gallery [data-full]"));
  if (boutons.length) {
    var box = document.createElement("div");
    box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Image agrandie");
    box.innerHTML = '<img alt="">' +
      '<button class="lb-close" aria-label="Fermer"><svg class="ico" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
      '<button class="lb-prev" aria-label="Image précédente"><svg class="ico" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<button class="lb-next" aria-label="Image suivante"><svg class="ico" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button>' +
      '<div class="lb-count"></div>';
    document.body.appendChild(box);
    var img = box.querySelector("img"), cpt = box.querySelector(".lb-count"), n = 0;
    function voir(i) { n = (i + boutons.length) % boutons.length; img.src = boutons[n].getAttribute("data-full"); img.alt = boutons[n].querySelector("img").alt; cpt.textContent = (n + 1) + " / " + boutons.length; }
    function ouvrir(i) { voir(i); box.classList.add("open"); document.body.style.overflow = "hidden"; box.querySelector(".lb-close").focus(); }
    function fermer() { box.classList.remove("open"); document.body.style.overflow = ""; boutons[n].focus(); }
    boutons.forEach(function (b, i) { b.addEventListener("click", function () { ouvrir(i); }); });
    box.querySelector(".lb-close").addEventListener("click", fermer);
    box.querySelector(".lb-prev").addEventListener("click", function () { voir(n - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { voir(n + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) fermer(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") fermer();
      if (e.key === "ArrowLeft") voir(n - 1);
      if (e.key === "ArrowRight") voir(n + 1);
    });
    var x0 = null;
    box.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) voir(n + (dx < 0 ? 1 : -1)); x0 = null; });
  }

  /* ---------- Codes cadeaux (données : assets/js/codes.js) ---------- */
  var CODES = window.CODES;
  Array.prototype.forEach.call(document.querySelectorAll("[data-codes]"), function (box) {
    var g = CODES && CODES.jeux[box.getAttribute("data-codes")];
    if (!g) { box.hidden = true; return; }
    var CLE = "optih-codes-utilises", vus = {};
    try { vus = JSON.parse(localStorage.getItem(CLE) || "{}") || {}; } catch (e) {}
    var ICO_COPIE = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>';
    box.innerHTML = '<ul class="codes-list">' + g.codes.map(function (k) {
      var id = "cc-" + k.c;
      return '<li class="cc' + (vus[k.c] ? " utilise" : "") + '">' +
        '<div class="cc-main"><code>' + esc(k.c) + "</code>" +
        '<span class="cc-etat ' + (k.etat === "actif" ? "ok" : "test") + '">' + (k.etat === "actif" ? "Actif" : "À tester") + "</span>" +
        (k.fin ? '<span class="cc-fin">' + esc(k.fin) + "</span>" : "") + "</div>" +
        '<p class="cc-r">' + esc(k.r) + "</p>" +
        '<div class="cc-actions"><button type="button" class="cc-copy" data-c="' + esc(k.c) + '">' + ICO_COPIE + "<span>Copier</span></button>" +
        (k.lien ? '<a class="cc-lien" href="' + esc(k.lien) + '" target="_blank" rel="noopener">Activer' + ICO_FLECHE + "</a>" : "") +
        '<label class="cc-vu"><input type="checkbox" data-c="' + esc(k.c) + '"' + (vus[k.c] ? " checked" : "") + "> Déjà utilisé</label></div></li>";
    }).join("") + "</ul>" +
      '<p class="codes-ou"><b>Où l\'entrer :</b> ' + esc(g.ou) + "</p>" +
      '<p class="codes-note">' + (g.info ? esc(g.info) + " " : "") + "Liste vérifiée le " + esc(CODES.verif) + ".</p>";
    box.addEventListener("click", function (e) {
      var b = e.target.closest(".cc-copy"); if (!b) return;
      var c = b.getAttribute("data-c"), lab = b.querySelector("span");
      function ok() { lab.textContent = "Copié !"; b.classList.add("ok"); setTimeout(function () { lab.textContent = "Copier"; b.classList.remove("ok"); }, 1600); }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(c).then(ok, function () { secours(c); ok(); });
      else { secours(c); ok(); }
    });
    function secours(c) { var t = document.createElement("textarea"); t.value = c; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(t); }
    box.addEventListener("change", function (e) {
      var i = e.target; if (!i.matches("input[data-c]")) return;
      var c = i.getAttribute("data-c");
      if (i.checked) vus[c] = 1; else delete vus[c];
      i.closest(".cc").classList.toggle("utilise", i.checked);
      try { localStorage.setItem(CLE, JSON.stringify(vus)); } catch (e2) {}
    });
  });
})();
