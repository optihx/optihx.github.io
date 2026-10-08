/* ==========================================================
   opti'H ✗ — MA CARTE DE JOUEUR (accueil → Boîte à outils, ou index.html#carte)
   Une image 1600 × 900 qui résume tous les jeux.
   Elle se remplit toute seule avec ce que le visiteur a mis sur le site :
   - BDO : bdo/data-gear.js
   - WuWa, ToG, Clash of Clans, Palworld : un petit résumé enregistré par chaque page
     (clés optih-resume-…), donc il faut avoir ouvert la page du jeu au moins une fois.
   ========================================================== */
(function(){
  var W = 1600, H = 900, CHOIX = 'optih-carte-choix';
  var JEUX = [
    ['bdo', 'Black Desert Online', '#ff5a47', 'bdo/index.html'],
    ['wuwa', 'Wuthering Waves', '#f4c64f', 'wuthering-waves/index.html#equipe'],
    ['tog', 'Tower of God', '#b596ff', 'tower-of-god/index.html#equipes'],
    ['coc', 'Clash of Clans', '#f2b33d', 'clash-of-clans/index.html'],
    ['pal', 'Palworld', '#3fd0b4', 'palworld/index.html']
  ];
  var CORPS = '"Figtree", system-ui, sans-serif', GROS = '"Big Shoulders Display", system-ui, sans-serif';
  var ROM = {I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9, X:10};

  function lire(k){ try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch(e){ return null; } }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function script(src){ return new Promise(function(ok){ var s = document.createElement('script'); s.src = src; s.onload = s.onerror = function(){ ok(); }; document.head.appendChild(s); }); }
  function virgule(n){ return String(n).replace('.', ','); }

  /* ---------- Données de chaque jeu (null = rien à montrer) ---------- */
  function donnees(){
    var d = {};
    var G = window.GEAR;
    if(G && G.persos && G.persos.length) d.bdo = G;
    var w = lire('optih-resume-wuwa'); if(w && w.t && w.t.length) d.wuwa = w;
    var t = lire('optih-resume-tog'); if(t && t.t && t.t.some(Boolean)) d.tog = t;
    var c = lire('optih-resume-coc'); if(c && c.length) d.coc = c;
    var p = lire('optih-resume-pal');
    if(!p){ var st = lire('optih-pal'); if(st && st.pris){ var k = Object.keys(st.pris); if(k.length) p = {n: k.length, total: 288, ic: k.slice(-5)}; } }
    if(p && p.n) d.pal = p;
    return d;
  }

  /* ---------- Dessin ---------- */
  var P, x;
  function tuile(r, coul){
    x.save();
    x.fillStyle = 'rgba(255,255,255,.035)'; P.rond(x, r.x, r.y, r.w, r.h, 22); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.09)'; x.lineWidth = 1.5; P.rond(x, r.x + .5, r.y + .5, r.w - 1, r.h - 1, 22); x.stroke();
    P.rond(x, r.x, r.y, r.w, r.h, 22); x.clip(); x.fillStyle = coul; x.fillRect(r.x, r.y, 4, r.h);
    x.restore();
  }
  function espace(px){ if('letterSpacing' in x) x.letterSpacing = px + 'px'; }
  function etiquette(r, txt, coul, sous){
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    espace(3); x.font = '700 15px ' + CORPS; x.fillStyle = coul; x.fillText(txt.toUpperCase(), r.x + 24, r.y + 38); espace(0);
    if(sous){ x.font = '500 17px ' + CORPS; x.fillStyle = '#aab3c5'; x.fillText(P.coupe(x, sous, r.w - 150), r.x + 24, r.y + 64); }
  }
  function note(r, n, coul){
    if(n == null) return;
    x.textAlign = 'right'; x.textBaseline = 'alphabetic';
    x.font = '500 17px ' + CORPS; x.fillStyle = '#aab3c5'; x.fillText('/10', r.x + r.w - 22, r.y + 52);
    var lw = x.measureText('/10').width;
    x.font = '700 40px "Chakra Petch", ' + CORPS; x.fillStyle = coul; x.fillText(virgule(n), r.x + r.w - 26 - lw, r.y + 52);
    x.textAlign = 'left';
  }
  function cadre(im, X, Y, w, h, rad, bord, fy){
    x.save(); P.rond(x, X, Y, w, h, rad); x.fillStyle = '#17133a'; x.fill(); x.clip();
    if(im) P.couvre(x, im, X, Y, w, h, fy); x.restore();
    x.strokeStyle = bord; x.lineWidth = 2.5; P.rond(x, X + 1, Y + 1, w - 2, h - 2, rad); x.stroke();
  }
  function rondImg(im, cx, cy, R, bord){
    x.save(); x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.fillStyle = '#17133a'; x.fill(); x.clip();
    if(im) P.couvre(x, im, cx - R, cy - R, R * 2, R * 2, .15); x.restore();
    x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.strokeStyle = bord; x.lineWidth = 3.5; x.stroke();
  }
  function barre(X, Y, w, h, pct, coul){
    x.fillStyle = 'rgba(255,255,255,.12)'; P.rond(x, X, Y, w, h, h / 2); x.fill();
    if(pct > 0){ x.fillStyle = coul; P.rond(x, X, Y, Math.max(h, w * Math.min(1, pct)), h, h / 2); x.fill(); }
  }

  var DESSIN = {
    bdo: async function(r, G, coul){
      var p = G.persos[0], fond = await P.charger('bdo/' + p.img.replace('-mini', ''));
      x.save(); P.rond(x, r.x, r.y, r.w, r.h, 22); x.clip();
      x.fillStyle = '#171210'; x.fillRect(r.x, r.y, r.w, r.h);
      if(fond) P.couvre(x, fond, r.x, r.y, r.w, r.h, .15);
      var g = x.createLinearGradient(0, r.y, 0, r.y + r.h); g.addColorStop(0, 'rgba(14,11,9,.15)'); g.addColorStop(.45, 'rgba(14,11,9,.35)'); g.addColorStop(.72, 'rgba(14,11,9,.9)'); g.addColorStop(1, 'rgba(14,11,9,.96)');
      x.fillStyle = g; x.fillRect(r.x, r.y, r.w, r.h);
      x.fillStyle = coul; x.fillRect(r.x, r.y, 4, r.h);
      x.restore();
      x.strokeStyle = 'rgba(202,162,90,.35)'; x.lineWidth = 1.5; P.rond(x, r.x + .5, r.y + .5, r.w - 1, r.h - 1, 22); x.stroke();
      etiquette(r, 'Black Desert Online', coul);
      var L = Math.min(r.w - 52, 520), X = r.x + 26, bas = r.y + r.h - 26;
      // objectif
      var A = G.accessoires || [], cible = ROM[G.niveauEkleta || 'IV'] || 4;
      var pts = A.reduce(function(s, a){ return s + (a.type === 'ekleta' ? ((ROM[a.niv] || 0) >= cible ? 11 : 10) : (ROM[a.niv] || 0)); }, 0);
      var pct = A.length ? Math.round(pts / (A.length * 11) * 100) : 0;
      barre(X, bas - 10, L, 10, pct / 100, coul);
      x.font = '700 18px ' + CORPS; x.fillStyle = '#efe3cc'; x.fillText(P.coupe(x, 'Objectif ' + (G.objectif || ''), L - 70), X, bas - 24);
      x.textAlign = 'right'; x.fillText(pct + ' %', X + L, bas - 24); x.textAlign = 'left';
      // stats
      var S = [['GEAR SCORE', Math.max(p.ap, p.aap) + p.dp, '#caa25a'], ['AP', p.ap], ['AP ÉVEIL', p.aap], ['DP', p.dp]];
      var bw = (L - 30) / 4, by = bas - 140;
      S.forEach(function(s, i){
        var bx = X + i * (bw + 10);
        x.fillStyle = 'rgba(0,0,0,.45)'; P.rond(x, bx, by, bw, 82, 12); x.fill();
        x.strokeStyle = 'rgba(202,162,90,.35)'; x.lineWidth = 1; P.rond(x, bx + .5, by + .5, bw - 1, 81, 12); x.stroke();
        x.textAlign = 'center';
        x.font = '400 13px "Cinzel", serif'; x.fillStyle = '#b4a58b'; x.fillText(s[0], bx + bw / 2, by + 24);
        x.font = '700 36px "Cinzel", serif'; x.fillStyle = s[2] || '#efe3cc'; x.fillText(String(s[1]), bx + bw / 2, by + 66);
      });
      x.textAlign = 'left';
      // nom
      var tag = G.persos.slice(1).map(function(t){ return t.nom; });
      x.font = '500 20px ' + CORPS; x.fillStyle = '#b4a58b';
      x.fillText(P.coupe(x, 'Main' + (tag.length ? ' · gear tag ' + tag.join(', ') : ''), L), X, by - 22);
      x.font = '700 64px "Cinzel", serif'; x.fillStyle = '#efe3cc'; x.fillText(P.coupe(x, p.nom.toUpperCase(), L), X, by - 54);
    },

    wuwa: async function(r, d, coul){
      tuile(r, coul); etiquette(r, 'Wuthering Waves', coul, 'Ma team'); note(r, d.note, coul);
      var ims = await Promise.all(d.t.map(function(m){ return P.charger('wuthering-waves/img/res/' + m[0] + '.webp'); }));
      var h = r.h - 106, w = Math.round(h * .58), gap = 14;
      if(3 * w + 2 * gap > r.w - 48){ w = Math.floor((r.w - 48 - 2 * gap) / 3); h = Math.round(w / .58); }
      d.t.forEach(function(m, i){ cadre(ims[i], r.x + 24 + i * (w + gap), r.y + 84, w, h, 12, m[1], .1); });
    },

    tog: async function(r, d, coul){
      var n = d.t.filter(Boolean).length;
      tuile(r, coul); etiquette(r, 'Tower of God', coul, 'Équipe ' + d.eq + (d.note != null ? '' : ' · ' + n + '/5'));
      note(r, d.note, coul);
      var ims = await Promise.all(d.t.map(function(m){ return m ? P.charger('tower-of-god/img/persos/' + m[0] + '.webp') : null; }));
      var R = Math.max(26, Math.min(110, ((r.h - 100) / 2 - 8) / 2, (r.w - 48 - 20) / 6)), dx = 2 * R + 12, y1 = r.y + 84 + R, y2 = y1 + 2 * R + 10;
      var cercle = function(m, im, cx, cy){
        if(m) rondImg(im, cx, cy, R, m[1]);
        else { x.setLineDash([5, 5]); x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 2; x.stroke(); x.setLineDash([]); }
      };
      for(var i = 0; i < 3; i++) cercle(d.t[i], ims[i], r.x + 24 + R + i * dx, y1);
      for(var j = 0; j < 2; j++) cercle(d.t[3 + j], ims[3 + j], r.x + 24 + R + dx / 2 + j * dx, y2);
    },

    coc: async function(r, d, coul){
      tuile(r, coul); etiquette(r, 'Clash of Clans', coul, d.length > 1 ? d.length + ' comptes' : '');
      var L = d.slice(0, 3), top = r.y + (d.length > 1 ? 84 : 62), dispo = r.y + r.h - 22 - top;
      var rh = Math.min(92, (dispo - (L.length - 1) * 10) / L.length);
      var ims = await Promise.all(L.map(function(c){ return P.charger('clash-of-clans/img/hdv/' + c.th + '.webp'); }));
      L.forEach(function(c, i){
        var y = top + i * (rh + 10), X = r.x + 22, w = r.w - 44;
        x.fillStyle = 'rgba(255,255,255,.05)'; P.rond(x, X, y, w, rh, 14); x.fill();
        var t = rh - 16;
        if(ims[i]){ var k = Math.min(t / ims[i].width, t / ims[i].height); x.drawImage(ims[i], X + 10 + (t - ims[i].width * k) / 2, y + 8 + (t - ims[i].height * k) / 2, ims[i].width * k, ims[i].height * k); }
        x.textAlign = 'right'; x.font = '400 32px "Lilita One", ' + CORPS; x.fillStyle = coul; x.fillText(c.pct + '%', X + w - 16, y + rh / 2 + 12);
        var pw = x.measureText(c.pct + '%').width;
        x.textAlign = 'left';
        x.font = '400 23px "Lilita One", ' + CORPS; x.fillStyle = '#fff'; x.fillText(P.coupe(x, c.nom, w - t - 60 - pw), X + t + 26, y + rh / 2 - 2);
        var etat = 'HDV ' + c.th + ' · ' + (c.ouv ? c.ouv + ' ouvrier' + (c.ouv > 1 ? 's' : '') + ' occupé' + (c.ouv > 1 ? 's' : '') : 'ouvriers libres') + (c.lab ? '' : ' · labo libre');
        x.font = '500 15px ' + CORPS; x.fillStyle = '#aab3c5'; x.fillText(P.coupe(x, etat, w - t - 60 - pw), X + t + 26, y + rh / 2 + 22);
      });
      if(d.length > 3){ x.textAlign = 'right'; x.font = '600 15px ' + CORPS; x.fillStyle = '#aab3c5'; x.fillText('+ ' + (d.length - 3) + ' autre' + (d.length > 4 ? 's' : ''), r.x + r.w - 26, r.y + 38); x.textAlign = 'left'; }
    },

    pal: async function(r, d, coul){
      tuile(r, coul); etiquette(r, 'Palworld', coul);
      var X = r.x + 24, w = r.w - 48, y = r.y + 118;
      x.font = '400 64px "Lilita One", ' + CORPS; x.fillStyle = '#fff'; x.fillText(String(d.n), X, y);
      var nw = x.measureText(String(d.n)).width;
      x.font = '600 20px ' + CORPS; x.fillStyle = '#aab3c5'; x.fillText('/ ' + (d.total || 288) + ' Pals capturés', X + nw + 12, y - 4);
      barre(X, y + 22, w, 10, d.n / (d.total || 288), coul);
      var ims = await Promise.all((d.ic || []).map(function(c){ return P.charger('palworld/img/pals/' + c + '.webp'); }));
      var s = Math.min(110, r.y + r.h - (y + 52) - 22, (w - 4 * 8) / 5);
      ims.forEach(function(im, i){
        var bx = X + i * (s + 8), byy = y + 52;
        x.fillStyle = 'rgba(255,255,255,.07)'; P.rond(x, bx, byy, s, s, 14); x.fill();
        if(im) x.drawImage(im, bx + 4, byy + 4, s - 8, s - 8);
      });
    }
  };

  /* Placement des tuiles selon les jeux choisis */
  function placer(ids){
    var Z = {x: 56, y: 138, w: 1488, h: 698}, G = 20, out = {};
    var reste = ids.slice();
    if(reste[0] === 'bdo'){
      if(reste.length === 1){ out.bdo = Z; return out; }
      out.bdo = {x: Z.x, y: Z.y, w: 560, h: Z.h};
      Z = {x: Z.x + 580, y: Z.y, w: Z.w - 580, h: Z.h};
      reste.shift();
    }
    var n = reste.length;
    var lignes = n <= 1 ? [n] : n === 2 ? [1, 1] : n === 3 ? [2, 1] : [2, 2];
    var rh = (Z.h - (lignes.length - 1) * G) / lignes.length, k = 0;
    lignes.forEach(function(nb, li){
      var cw = (Z.w - (nb - 1) * G) / nb;
      for(var i = 0; i < nb; i++) out[reste[k++]] = {x: Z.x + i * (cw + G), y: Z.y + li * (rh + G), w: cw, h: rh};
    });
    return out;
  }

  async function dessiner(ids, d){
    await P.polices(['800 64px "Big Shoulders Display"', '700 64px "Cinzel"', '400 13px "Cinzel"', '700 15px "Figtree"', '500 17px "Figtree"', '600 20px "Figtree"', '400 32px "Lilita One"', '700 40px "Chakra Petch"']);
    var c = document.createElement('canvas'); c.width = W; c.height = H; x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#1a2133'); g.addColorStop(1, '#10141f');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    var l = x.createRadialGradient(W * .55, -100, 50, W * .55, -100, 900); l.addColorStop(0, 'rgba(255,207,138,.08)'); l.addColorStop(1, 'rgba(255,207,138,0)');
    x.fillStyle = l; x.fillRect(0, 0, W, H);

    // en-tête
    var logo = await P.charger('assets/img/logo-oph.png'), lx = 56;
    if(logo){ var lh = 66, lw = logo.width / logo.height * lh; x.drawImage(logo, 56, 42, lw, lh); lx = 56 + lw + 18; }
    x.textBaseline = 'alphabetic'; x.textAlign = 'left';
    espace(1); x.font = '800 60px ' + GROS; x.fillStyle = '#f1efe6'; x.fillText("OPTI'H ✗", lx, 88); espace(0);
    x.font = '500 20px ' + CORPS; x.fillStyle = '#aab3c5'; x.fillText('Carte de joueur', lx + 2, 114);
    var badge = ids.length + ' JEU' + (ids.length > 1 ? 'X' : '');
    espace(2); x.font = '700 20px ' + GROS; var bw = x.measureText(badge).width + 44;
    x.strokeStyle = 'rgba(255,207,138,.7)'; x.lineWidth = 1.5; P.rond(x, W - 56 - bw, 58, bw, 40, 20); x.stroke();
    x.fillStyle = '#ffcf8a'; x.textAlign = 'center'; x.fillText(badge, W - 56 - bw / 2, 85); x.textAlign = 'left'; espace(0);

    var pos = placer(ids);
    for(var i = 0; i < ids.length; i++){
      var j = JEUX.filter(function(q){ return q[0] === ids[i]; })[0];
      x.save(); await DESSIN[ids[i]](pos[ids[i]], d[ids[i]], j[2]); x.restore();
    }

    // pied
    espace(2); x.font = '700 17px ' + GROS; x.fillStyle = 'rgba(241,239,230,.75)';
    x.fillText('OPTIHX.NETLIFY.APP', 56, H - 30);
    var date = new Date().toLocaleDateString('fr-FR', {day: 'numeric', month: 'short', year: 'numeric'}).toUpperCase();
    x.textAlign = 'right'; x.fillText('MIS À JOUR LE ' + date, W - 56, H - 30); x.textAlign = 'left'; espace(0);
    return c;
  }

  /* ---------- Fenêtre de choix ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.cj-pan .cj-liste{list-style:none;margin:0 0 4px;padding:0;display:grid;gap:6px}' +
    '.cj-pan label{display:flex;gap:10px;align-items:center;padding:10px 12px;border:1px solid rgba(255,255,255,.1);border-radius:10px;cursor:pointer;transition:border-color .2s,background .2s}' +
    '.cj-pan label:has(input:checked){border-color:var(--c);background:rgba(255,255,255,.04)}' +
    '.cj-pan label.off{cursor:default;opacity:.6}' +
    '.cj-pan input{flex:none;width:18px;height:18px;margin:0;accent-color:#ffcf8a}' +
    '.cj-pan i{flex:none;width:10px;height:10px;border-radius:50%;background:var(--c)}' +
    '.cj-pan small a{color:#ffcf8a}';
  document.head.appendChild(css);

  var pan = null;
  async function preparer(){
    if(!window.PartageImage) await script('assets/js/partage-image.js');
    if(!window.GEAR) await script('bdo/data-gear.js');
    P = window.PartageImage;
  }
  async function ouvrir(){
    await preparer();
    if(pan) pan.remove();
    var d = donnees(), choix = lire(CHOIX) || JEUX.map(function(j){ return j[0]; });
    pan = document.createElement('div');
    pan.className = 'notif-pan cj-pan'; pan.setAttribute('role', 'dialog'); pan.setAttribute('aria-labelledby', 'cj-titre');
    pan.innerHTML = '<button type="button" class="notif-x" aria-label="Fermer">×</button><h2 id="cj-titre">Ma carte de joueur</h2>' +
      '<p>Une image qui résume tes jeux. Coche ceux à afficher.</p><ul class="cj-liste">' +
      JEUX.map(function(j){
        var ok = !!d[j[0]];
        return '<li><label style="--c:' + j[2] + '"' + (ok ? '' : ' class="off"') + '><input type="checkbox" value="' + j[0] + '"' + (ok && choix.indexOf(j[0]) > -1 ? ' checked' : '') + (ok ? '' : ' disabled') + '><i></i><span><b>' + esc(j[1]) + '</b>' +
          (ok ? '' : '<small>Rien encore : <a href="' + j[3] + '">ouvre la page du jeu</a> une fois.</small>') + '</span></label></li>';
      }).join('') + '</ul>' +
      '<div class="notif-act"><button type="button" data-cj="go">Créer l\'image</button></div><p class="notif-etat"></p>';
    document.body.appendChild(pan);
    pan.querySelector('[data-cj="go"]').focus();
    pan.addEventListener('click', function(e){
      if(e.target.closest('.notif-x')) return fermer();
      if(!e.target.closest('[data-cj="go"]')) return;
      var ids = [].map.call(pan.querySelectorAll('input:checked'), function(i){ return i.value; });
      if(!ids.length){ pan.querySelector('.notif-etat').textContent = 'Coche au moins un jeu.'; pan.querySelector('.notif-etat').className = 'notif-etat err'; return; }
      try { localStorage.setItem(CHOIX, JSON.stringify(ids)); } catch(er){}
      fermer();
      P.ouvrir({ titre: 'Ma carte de joueur', fichier: 'carte-joueur-optih', url: location.origin + location.pathname,
        alt: 'Carte de joueur opti\'H ✗', dessiner: function(){ return dessiner(ids, d); } });
    });
  }
  function fermer(){ if(pan){ pan.remove(); pan = null; } if(location.hash === '#carte') history.replaceState(null, '', location.pathname + location.search); }
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && pan) fermer(); });
  document.addEventListener('click', function(e){ if(pan && !pan.contains(e.target) && !e.target.closest('a[href$="#carte"]')) fermer(); });

  window.CarteJoueur = { ouvrir: ouvrir, dessiner: function(ids){ return preparer().then(function(){ return dessiner(ids, donnees()); }); } };
  if(location.hash === '#carte') ouvrir();
  addEventListener('hashchange', function(){ if(location.hash === '#carte') ouvrir(); });
})();
