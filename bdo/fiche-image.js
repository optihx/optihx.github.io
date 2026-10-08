/* ==========================================================
   BDO — « Partager ma fiche » : belle image du perso choisi
   (portrait, GS, AP / AP d'éveil / DP, objectif Ekleta, gear tag).
   Données : data-gear.js · fenêtre de partage : assets/js/partage-image.js
   ========================================================== */
(function(){
  var G = window.GEAR, P = window.PartageImage, box = document.getElementById('gear-list');
  if(!G || !P || !box) return;
  var W = 1600, H = 900, TITRE = '"Cinzel", Georgia, serif', CORPS = '"Alegreya Sans", system-ui, sans-serif';
  var OR = '#caa25a', OR2 = '#8a6c35', ENCRE = '#efe3cc', DOUX = '#b4a58b', SANG = '#c2382c';
  var ROM = {I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9, X:10};

  function choisi(){
    var b = document.querySelector('.roster button[aria-selected="true"]') || document.querySelector('.roster button');
    var nom = b ? b.dataset.name : (G.persos[0] && G.persos[0].nom);
    var p = G.persos.filter(function(x){ return x.nom === nom; })[0] || G.persos[0];
    return { p: p, img: b ? b.dataset.img : 'img/maegu1.webp', role: b ? b.dataset.role : '' };
  }
  function losange(x, cx, cy, r, plein, coul){
    x.beginPath(); x.moveTo(cx, cy - r); x.lineTo(cx + r, cy); x.lineTo(cx, cy + r); x.lineTo(cx - r, cy); x.closePath();
    if(plein){ x.fillStyle = coul; x.fill(); } else { x.strokeStyle = OR2; x.lineWidth = 1.5; x.stroke(); }
  }
  function filet(x, x0, x1, y){
    var g = x.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(202,162,90,0)'); g.addColorStop(.2, OR); g.addColorStop(.8, OR); g.addColorStop(1, 'rgba(202,162,90,0)');
    x.fillStyle = g; x.fillRect(x0, y, x1 - x0, 1.5);
  }

  async function dessiner(){
    var c0 = choisi(), p = c0.p;
    await P.polices(['700 80px "Cinzel"', '400 24px "Cinzel"', '400 22px "Alegreya Sans"', '700 22px "Alegreya Sans"']);
    var fond = await P.charger('img/hero.webp'), portrait = await P.charger(c0.img), logo = await P.charger('../assets/img/logo-oph.png');
    var tags = G.persos.filter(function(x){ return x !== p; });
    var minis = await Promise.all(tags.map(function(t){ return P.charger(t.img); }));

    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    x.fillStyle = '#0e0b09'; x.fillRect(0, 0, W, H);
    if(fond){ if('filter' in x) x.filter = 'blur(8px)'; x.globalAlpha = .45; P.couvre(x, fond, -20, -20, W + 40, H + 40, .45); x.globalAlpha = 1; if('filter' in x) x.filter = 'none'; }
    var g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(14,11,9,.55)'); g.addColorStop(.4, 'rgba(14,11,9,.85)'); g.addColorStop(1, 'rgba(14,11,9,.95)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);

    // portrait encadré
    var px = 70, py = 70, pw = 590, ph = 760;
    if(portrait){
      x.save(); x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 40; x.fillStyle = '#171210'; x.fillRect(px, py, pw, ph); x.restore();
      P.couvre(x, portrait, px, py, pw, ph, .2);
      var gp = x.createLinearGradient(0, py + ph * .6, 0, py + ph); gp.addColorStop(0, 'rgba(14,11,9,0)'); gp.addColorStop(1, 'rgba(14,11,9,.85)');
      x.fillStyle = gp; x.fillRect(px, py, pw, ph);
    }
    x.strokeStyle = OR2; x.lineWidth = 2; x.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
    x.strokeStyle = 'rgba(202,162,90,.35)'; x.lineWidth = 1; x.strokeRect(px + 10.5, py + 10.5, pw - 21, ph - 21);
    [[px, py], [px + pw, py], [px, py + ph], [px + pw, py + ph]].forEach(function(k){ losange(x, k[0], k[1], 9, true, OR); });

    // colonne de droite
    var rx = 730, rr = W - 70;
    x.textBaseline = 'alphabetic';
    x.font = '400 20px ' + TITRE; x.fillStyle = SANG; x.fillText('BLACK DESERT ONLINE', rx, 112);
    x.font = '700 92px ' + TITRE; x.fillStyle = ENCRE; x.fillText(p.nom, rx, 204);
    x.font = '400 26px ' + CORPS; x.fillStyle = DOUX; x.fillText(c0.role || '', rx, 246);
    // GS
    var gs = Math.max(p.ap, p.aap) + p.dp;
    x.textAlign = 'right';
    x.font = '700 92px ' + TITRE; x.fillStyle = OR; x.fillText(String(gs), rr, 204);
    x.font = '400 22px ' + TITRE; x.fillStyle = DOUX; x.fillText('GEAR SCORE', rr, 246);
    x.textAlign = 'left';
    filet(x, rx, rr, 280);
    // AP / AP éveil / DP
    var stats = [['AP', p.ap], ['AP ÉVEIL', p.aap], ['DP', p.dp]], sw = (rr - rx - 32) / 3;
    stats.forEach(function(s, i){
      var bx = rx + i * (sw + 16);
      x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(bx, 306, sw, 104);
      x.strokeStyle = 'rgba(202,162,90,.3)'; x.lineWidth = 1; x.strokeRect(bx + .5, 306.5, sw - 1, 103);
      x.textAlign = 'center';
      x.font = '400 17px ' + TITRE; x.fillStyle = DOUX; x.fillText(s[0], bx + sw / 2, 342);
      x.font = '700 44px ' + TITRE; x.fillStyle = ENCRE; x.fillText(String(s[1]), bx + sw / 2, 392);
      x.textAlign = 'left';
    });

    // objectif
    var A = G.accessoires || [], cible = ROM[G.niveauEkleta || 'IV'] || 4;
    function ek(a){ return a.type === 'ekleta'; }
    function fini(a){ return ek(a) && (ROM[a.niv] || 0) >= cible; }
    var pts = A.reduce(function(s, a){ return s + (ek(a) ? (fini(a) ? 11 : 10) : (ROM[a.niv] || 0)); }, 0), pct = A.length ? Math.round(pts / (A.length * 11) * 100) : 0;
    x.font = '400 17px ' + TITRE; x.fillStyle = SANG; x.fillText('OBJECTIF', rx, 460);
    x.font = '700 30px ' + TITRE; x.fillStyle = ENCRE; x.fillText(G.objectif || '', rx, 498);
    x.textAlign = 'right'; x.font = '700 34px ' + TITRE; x.fillStyle = OR; x.fillText(pct + ' %', rr, 498); x.textAlign = 'left';
    x.fillStyle = 'rgba(202,162,90,.14)'; x.fillRect(rx, 516, rr - rx, 8);
    var gb = x.createLinearGradient(rx, 0, rr, 0); gb.addColorStop(0, OR2); gb.addColorStop(1, OR); x.fillStyle = gb; x.fillRect(rx, 516, (rr - rx) * pct / 100, 8);
    A.forEach(function(a, i){
      var col = i % 2, row = Math.floor(i / 2), cw = (rr - rx - 16) / 2, bx = rx + col * (cw + 16), by = 546 + row * 64;
      var f = fini(a);
      x.fillStyle = f ? 'rgba(202,162,90,.1)' : 'rgba(0,0,0,.25)'; x.fillRect(bx, by, cw, 54);
      x.strokeStyle = f ? 'rgba(202,162,90,.55)' : 'rgba(202,162,90,.2)'; x.strokeRect(bx + .5, by + .5, cw - 1, 53);
      x.font = '400 14px ' + TITRE; x.fillStyle = DOUX; x.fillText(a.place.toUpperCase(), bx + 14, by + 22);
      x.font = '700 17px ' + CORPS; x.fillStyle = ENCRE;
      x.fillText(P.coupe(x, (a.niv ? a.niv + ' ' : '') + a.nom, cw - 146), bx + 14, by + 44);
      var n = ek(a) ? 10 : (ROM[a.niv] || 0);
      for(var k = 0; k < 10; k++) losange(x, bx + cw - 118 + k * 11.5, by + 27, 4.6, k < n, f ? '#e8c77a' : OR);
    });

    // gear tag
    var ty = 760;
    x.font = '400 17px ' + TITRE; x.fillStyle = DOUX; x.fillText('GEAR TAG', rx, ty + 30);
    var tx = rx + 128;
    tags.forEach(function(t, i){
      var m = minis[i];
      if(m){ x.save(); x.beginPath(); x.rect(tx, ty, 44, 44); x.clip(); P.couvre(x, m, tx, ty, 44, 44); x.restore(); x.strokeStyle = OR2; x.strokeRect(tx + .5, ty + .5, 43, 43); }
      x.font = '700 22px ' + CORPS; x.fillStyle = ENCRE; x.fillText(t.nom, tx + 56, ty + 30);
      tx += 56 + x.measureText(t.nom).width + 34;
    });
    x.font = '400 18px ' + CORPS; x.fillStyle = DOUX; x.fillText('même stuff', tx - 8, ty + 30);

    // signature
    x.font = '400 17px ' + TITRE; x.fillStyle = 'rgba(239,227,204,.7)';
    var sig = "OPTI'H ✗ · optihx.netlify.app", sgw = x.measureText(sig).width;
    x.textAlign = 'left'; x.fillText(sig, W - 70 - sgw, H - 30);
    if(logo){ var lh = 30, lw = logo.width / logo.height * lh; x.globalAlpha = .85; x.drawImage(logo, W - 82 - sgw - lw, H - 30 - lh + 6, lw, lh); x.globalAlpha = 1; }
    return c;
  }

  // bouton sous le suivi du gear
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'g-partage';
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>Partager ma fiche en image';
  box.insertAdjacentElement('afterend', btn);
  btn.addEventListener('click', function(){
    var p = choisi().p;
    P.ouvrir({ titre: 'Partager ma fiche', fichier: 'fiche-bdo-' + p.nom.toLowerCase(), url: location.origin + location.pathname + '#gear',
      alt: 'Fiche Black Desert de ' + p.nom, dessiner: dessiner });
  });
})();
