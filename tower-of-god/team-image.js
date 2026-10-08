/* ==========================================================
   Tower of God : New World — « Partager » : belle image de la team 3-2
   (1600 × 900 : formation devant / derrière, note sur 10, éléments).
   La fenêtre de partage est dans assets/js/partage-image.js.
   ========================================================== */
window.TogImage = (function(){
  var COUL = {rouge:'#ff6b6b', vert:'#5fd38d', bleu:'#5aa8ff', jaune:'#f5d547', violet:'#b596ff'};
  var NOM = {rouge:'Rouge', vert:'Vert', bleu:'Bleu', jaune:'Jaune', violet:'Violet'};
  var W = 1600, H = 900, TITRE = '"Unbounded", system-ui, sans-serif', CORPS = '"Figtree", system-ui, sans-serif';
  var P = window.PartageImage;

  function verdict(n){ return n >= 8 ? 'Très bonne team' : n >= 6 ? 'Bonne team' : n >= 4 ? 'Team correcte' : 'Team à revoir'; }

  /* t : les 5 ids (3 devant, 2 derrière), by : persos par id, a : analyse, nomEq : Aventure / Arène / Boss */
  async function dessiner(t, by, a, nomEq){
    await P.polices(['700 54px "Unbounded"', '600 22px "Unbounded"', '400 20px "Figtree"', '700 22px "Figtree"']);
    var ms = t.map(function(id){ return id != null ? by[id] : null; });
    var fond = await P.charger('img/hero.webp'), logo = await P.charger('../assets/img/logo-oph.png');
    var ims = await Promise.all(ms.map(function(p){ return p ? P.charger('img/persos/' + p.id + '.webp') : null; }));

    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    x.fillStyle = '#0c0a1b'; x.fillRect(0, 0, W, H);
    if(fond){
      if('filter' in x) x.filter = 'blur(6px) saturate(1.1)';
      x.globalAlpha = .55; P.couvre(x, fond, -20, -20, W + 40, H + 40, .4); x.globalAlpha = 1;
      if('filter' in x) x.filter = 'none';
    }
    var g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(12,10,27,.55)'); g.addColorStop(.62, 'rgba(12,10,27,.7)'); g.addColorStop(1, 'rgba(12,10,27,.95)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    var lueur = x.createRadialGradient(540, 520, 40, 540, 520, 560); lueur.addColorStop(0, 'rgba(82,195,255,.18)'); lueur.addColorStop(1, 'rgba(82,195,255,0)');
    x.fillStyle = lueur; x.fillRect(0, 0, W, H);

    // en-tête
    x.textBaseline = 'top';
    x.font = '600 18px ' + TITRE; x.fillStyle = '#52c3ff';
    x.fillText('TOWER OF GOD : NEW WORLD · MES ÉQUIPES', 64, 52);
    x.font = '700 54px ' + TITRE; x.fillStyle = '#eeeaff';
    x.fillText('Équipe ' + nomEq, 64, 84);

    // formation 3-2
    var carte = function(p, im, cx, cy){
      var col = p ? COUL[p.c] : 'rgba(255,255,255,.2)', R = 74;
      x.save();
      x.fillStyle = 'rgba(255,255,255,.05)'; P.rond(x, cx - 112, cy - 98, 224, 290, 22); x.fill();
      x.strokeStyle = 'rgba(180,170,255,.18)'; x.lineWidth = 1.5; P.rond(x, cx - 112, cy - 98, 224, 290, 22); x.stroke();
      if(p){
        x.shadowColor = col; x.shadowBlur = 26;
        x.beginPath(); x.arc(cx, cy, R + 5, 0, Math.PI * 2); x.fillStyle = col; x.fill(); x.shadowBlur = 0;
        x.save(); x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.clip();
        x.fillStyle = '#17133a'; x.fillRect(cx - R, cy - R, R * 2, R * 2);
        if(im) P.couvre(x, im, cx - R, cy - R, R * 2, R * 2, .15);
        x.restore();
        x.textAlign = 'center'; x.textBaseline = 'alphabetic';
        x.font = '700 24px ' + CORPS; x.fillStyle = '#fff'; x.fillText(P.coupe(x, p.n, 204), cx, cy + R + 44);
        x.font = '400 17px ' + CORPS; x.fillStyle = '#aaa3d2'; x.fillText(P.coupe(x, p.t || '', 204), cx, cy + R + 68);
        x.font = '600 15px ' + TITRE; x.fillStyle = col; x.fillText((p.r + ' · ' + NOM[p.c]).toUpperCase(), cx, cy + R + 98);
        // rareté
        x.font = '700 14px ' + CORPS; var rw = x.measureText(p.ra).width + 18;
        x.fillStyle = '#f0c86b'; P.rond(x, cx + R - rw + 14, cy - R - 8, rw, 24, 12); x.fill();
        x.fillStyle = '#1a1206'; x.fillText(p.ra, cx + R - rw / 2 + 14, cy - R + 9);
      } else {
        x.setLineDash([6, 6]); x.strokeStyle = 'rgba(255,255,255,.3)'; x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.stroke(); x.setLineDash([]);
      }
      x.restore();
    };
    var cy1 = 310, cy2 = 640, xs1 = [292, 540, 788], xs2 = [416, 664];
    x.textAlign = 'left'; x.textBaseline = 'middle'; x.font = '600 14px ' + TITRE; x.fillStyle = '#aaa3d2';
    x.save(); x.translate(84, cy1 + 46); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillText('DEVANT', 0, 0); x.restore();
    x.save(); x.translate(84, cy2 + 46); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillText('DERRIÈRE', 0, 0); x.restore();
    for(var i = 0; i < 3; i++) carte(ms[i], ims[i], xs1[i], cy1);
    for(var j = 0; j < 2; j++) carte(ms[3 + j], ims[3 + j], xs2[j], cy2);

    // colonne de droite : note + caractéristiques
    var rx = 1040, rw2 = 496;
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillStyle = 'rgba(23,19,58,.78)'; P.rond(x, rx, 190, rw2, 640, 24); x.fill();
    x.strokeStyle = 'rgba(180,170,255,.2)'; x.lineWidth = 1.5; P.rond(x, rx, 190, rw2, 640, 24); x.stroke();
    var note = a.n === 5 ? String(a.note).replace('.', ',') : '–';
    x.font = '700 96px ' + TITRE; x.fillStyle = '#eeeaff'; x.fillText(note, rx + 40, 316);
    var nw = x.measureText(note).width;
    x.font = '600 28px ' + TITRE; x.fillStyle = '#aaa3d2'; x.fillText('/10', rx + 50 + nw, 316);
    x.font = '700 26px ' + CORPS; x.fillStyle = '#52c3ff'; x.fillText(a.n === 5 ? verdict(a.note) : 'Team incomplète', rx + 42, 362);
    // barre
    x.fillStyle = 'rgba(255,255,255,.1)'; P.rond(x, rx + 42, 388, rw2 - 84, 10, 5); x.fill();
    if(a.n === 5){ var gb = x.createLinearGradient(rx + 42, 0, rx + rw2 - 42, 0); gb.addColorStop(0, '#52c3ff'); gb.addColorStop(1, '#b596ff'); x.fillStyle = gb; P.rond(x, rx + 42, 388, (rw2 - 84) * a.note / 10, 10, 5); x.fill(); }

    var ligne = function(lab, y, puces, texte){
      x.font = '600 14px ' + TITRE; x.fillStyle = '#aaa3d2'; x.fillText(lab.toUpperCase(), rx + 42, y);
      var px = rx + 42, py = y + 18;
      if(puces && puces.length){
        puces.forEach(function(p){
          x.font = '700 18px ' + CORPS; var w = x.measureText(p[0]).width + 40;
          if(px + w > rx + rw2 - 40){ px = rx + 42; py += 42; }
          x.fillStyle = 'rgba(255,255,255,.06)'; P.rond(x, px, py, w, 34, 17); x.fill();
          x.beginPath(); x.arc(px + 17, py + 17, 6, 0, Math.PI * 2); x.fillStyle = p[1]; x.fill();
          x.fillStyle = '#eeeaff'; x.textBaseline = 'middle'; x.fillText(p[0], px + 30, py + 18); x.textBaseline = 'alphabetic';
          px += w + 8;
        });
      } else { x.font = '700 20px ' + CORPS; x.fillStyle = '#eeeaff'; x.fillText(texte || '—', rx + 42, y + 42); }
    };
    var els = Object.keys(a.cols).map(function(cc){ return [NOM[cc] + (a.cols[cc] > 1 ? ' ×' + a.cols[cc] : ''), COUL[cc]]; });
    ligne('Éléments', 452, els);
    ligne('Fort contre', 554, a.forts.map(function(cc){ return [NOM[cc], COUL[cc]]; }), '—');
    ligne('Attention à', 656, a.faibles.map(function(cc){ return [NOM[cc], COUL[cc]]; }), '—');
    ligne('Dégâts', 758, null, 'Physiques ' + a.phy + ' · Magiques ' + a.mag);

    // signature
    x.font = '600 17px ' + TITRE; x.fillStyle = 'rgba(238,234,255,.75)';
    var sig = "OPTI'H ✗ · optihx.netlify.app", sw = x.measureText(sig).width;
    x.fillText(sig, W - 64 - sw, H - 30);
    if(logo){ var lh = 30, lw = logo.width / logo.height * lh; x.globalAlpha = .85; x.drawImage(logo, W - 76 - sw - lw, H - 30 - lh + 6, lw, lh); x.globalAlpha = 1; }
    return c;
  }

  function ouvrir(t, by, a, nomEq, url){
    return P.ouvrir({
      titre: 'Partager mon équipe', url: url,
      fichier: 'team-tog-' + nomEq.toLowerCase().replace(/[^a-z]/g, ''),
      alt: 'Image de mon équipe ' + nomEq,
      dessiner: function(){ return dessiner(t, by, a, nomEq); }
    });
  }
  return { dessiner: dessiner, ouvrir: ouvrir };
})();
