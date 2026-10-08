/* ==========================================================
   Wuthering Waves — « Partager ma team » : fabrique une belle image de la team
   (1600 × 900, splash arts des 3 persos, indice d'entente, set et écho principal)
   La fenêtre de partage est dans assets/js/partage-image.js.
   Tout est dessiné dans le navigateur, rien n'est envoyé sur internet.
   ========================================================== */
window.TeamImage = (function(){
  var EL = {Aero:'#2f9e80',Fusion:'#d9573f',Glacio:'#3a93cf',Electro:'#8d5ccf',Spectro:'#b8932a',Havoc:'#a8436f'};
  var W = 1600, H = 900, TITRE = '"Chakra Petch", system-ui, sans-serif', CORPS = '"Figtree", system-ui, sans-serif';

  function charger(src){
    return new Promise(function(ok){ var i = new Image(); i.onload = function(){ ok(i); }; i.onerror = function(){ ok(null); }; i.src = src; });
  }
  function verdict(sc){ return sc >= 8 ? 'Excellente entente' : sc >= 6 ? 'Bonne entente' : sc >= 4 ? 'Entente moyenne' : 'Team à revoir'; }
  function coupe(ctx, txt, max){
    if(ctx.measureText(txt).width <= max) return txt;
    while(txt.length > 1 && ctx.measureText(txt + '…').width > max) txt = txt.slice(0, -1);
    return txt + '…';
  }
  function rond(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  /* ms : les 3 persos (objets de data-resonateurs.js), ev : résultat de l'indice */
  async function dessiner(ms, ev){
    try { await Promise.all(['700 64px "Chakra Petch"', '600 26px "Chakra Petch"', '400 22px "Figtree"', '700 22px "Figtree"'].map(function(f){ return document.fonts.load(f); })); } catch(e){}
    var imgs = await Promise.all(ms.map(function(r){ return charger('img/res/' + r.img + '-splash.webp'); }));
    var portraits = await Promise.all(ms.map(function(r){ return charger('img/res/' + r.img + '.webp'); }));
    var logo = await charger('../assets/img/logo-oph.png');

    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    x.fillStyle = '#0b0d12'; x.fillRect(0, 0, W, H);

    var pw = W / 3;
    ms.forEach(function(r, i){
      var im = imgs[i], x0 = i * pw, col = EL[r.el] || '#c99a2e';
      x.save(); x.beginPath(); x.rect(x0, 0, pw, H); x.clip();
      // fond couleur de l'élément
      var g0 = x.createLinearGradient(x0, 0, x0, H); g0.addColorStop(0, col); g0.addColorStop(1, '#0b0d12');
      x.globalAlpha = .55; x.fillStyle = g0; x.fillRect(x0, 0, pw, H); x.globalAlpha = 1;
      if(im){
        // splash en fond, flouté et assombri : l'ambiance du perso
        var s = Math.max(H / im.height, pw / im.width) * 1.08, iw = im.width * s, ih = im.height * s;
        if('filter' in x) x.filter = 'blur(10px) saturate(1.15)';
        x.globalAlpha = .7; x.drawImage(im, x0 + (pw - iw) / 2, (H - ih) / 2, iw, ih); x.globalAlpha = 1;
        if('filter' in x) x.filter = 'none';
      }
      x.fillStyle = 'rgba(11,13,18,.28)'; x.fillRect(x0, 0, pw, H);
      // portrait net au centre, encadré à la couleur de l'élément
      var pt = portraits[i];
      if(pt){
        var ph = 470, pwd = 343, px = x0 + (pw - pwd) / 2, py = 118;
        // recadrage « cover » : même cadre pour tous les persos, on garde le haut (le visage)
        var k = Math.max(pwd / pt.width, ph / pt.height), sw = pwd / k, sh = ph / k, sx = (pt.width - sw) / 2, sy = 0;
        x.save(); x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 40; x.shadowOffsetY = 18;
        x.fillStyle = '#0b0d12'; x.fillRect(px, py, pwd, ph); x.restore();
        x.drawImage(pt, sx, sy, sw, sh, px, py, pwd, ph);
        x.strokeStyle = col; x.lineWidth = 3; x.strokeRect(px + 1.5, py + 1.5, pwd - 3, ph - 3);
        x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 1; x.strokeRect(px + 8.5, py + 8.5, pwd - 17, ph - 17);
      }
      // dégradés pour la lisibilité
      var g = x.createLinearGradient(0, H * .6, 0, H); g.addColorStop(0, 'rgba(11,13,18,0)'); g.addColorStop(.4, 'rgba(11,13,18,.85)'); g.addColorStop(1, 'rgba(11,13,18,.97)');
      x.fillStyle = g; x.fillRect(x0, 0, pw, H);
      var gt = x.createLinearGradient(0, 0, 0, 170); gt.addColorStop(0, 'rgba(11,13,18,.75)'); gt.addColorStop(1, 'rgba(11,13,18,0)');
      x.fillStyle = gt; x.fillRect(x0, 0, pw, 170);
      x.restore();

      // texte du perso
      var tx = x0 + 34, base = H - 66;
      x.fillStyle = col; x.fillRect(tx, base - 214, 54, 5);
      x.font = '600 21px ' + TITRE; x.fillStyle = 'rgba(255,255,255,.78)'; x.textBaseline = 'alphabetic';
      x.fillText((r.el + ' · ' + r.w).toUpperCase(), tx, base - 176);
      x.font = '700 58px ' + TITRE; x.fillStyle = '#fff';
      x.fillText(coupe(x, r.n.toUpperCase(), pw - 68), tx, base - 118);
      x.font = '400 20px ' + CORPS; x.fillStyle = 'rgba(255,255,255,.62)';
      x.fillText('Set', tx, base - 74);
      x.fillText('Écho', tx, base - 40);
      x.font = '700 21px ' + CORPS; x.fillStyle = '#fff';
      x.fillText(coupe(x, r.set || '—', pw - 140), tx + 64, base - 74);
      x.fillText(coupe(x, r.echo || 'à confirmer', pw - 140), tx + 64, base - 40);
      x.font = '400 19px ' + CORPS; x.fillStyle = 'rgba(255,255,255,.6)';
      x.fillText(coupe(x, (r.ro || []).join(' · '), pw - 68), tx, base - 6);
      // séparation
      if(i) { x.fillStyle = 'rgba(255,255,255,.14)'; x.fillRect(x0, 0, 1, H); }
    });

    // bandeau du haut : titre + indice
    x.font = '600 22px ' + TITRE; x.fillStyle = 'rgba(255,255,255,.75)'; x.textBaseline = 'top';
    x.fillText('WUTHERING WAVES · MA TEAM', 40, 40);
    var sc = String(ev.score).replace('.', ','), lab = verdict(ev.score);
    x.font = '700 44px ' + TITRE; var w1 = x.measureText(sc).width;
    x.font = '600 22px ' + TITRE; var w2 = x.measureText('/10').width, w3 = x.measureText(lab.toUpperCase()).width;
    var bw = 36 + w1 + 6 + w2 + 22 + w3 + 30, bx = W - 40 - bw, by = 28;
    x.fillStyle = 'rgba(11,13,18,.72)'; rond(x, bx, by, bw, 66, 33); x.fill();
    x.strokeStyle = ev.score >= 8 ? '#e2b95a' : 'rgba(255,255,255,.25)'; x.lineWidth = 2; rond(x, bx, by, bw, 66, 33); x.stroke();
    x.textBaseline = 'middle';
    x.font = '700 44px ' + TITRE; x.fillStyle = '#e2b95a'; x.fillText(sc, bx + 30, by + 35);
    x.font = '600 22px ' + TITRE; x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText('/10', bx + 30 + w1 + 6, by + 40);
    x.fillStyle = '#fff'; x.fillText(lab.toUpperCase(), bx + 30 + w1 + 6 + w2 + 22, by + 36);

    // signature en bas à droite
    x.textBaseline = 'alphabetic'; x.font = '600 20px ' + TITRE; x.fillStyle = 'rgba(255,255,255,.72)';
    var sig = "OPTI'H ✗ · optihx.netlify.app", sw = x.measureText(sig).width;
    x.fillText(sig, W - 40 - sw, H - 26);
    if(logo){ var lh = 34, lw = logo.width / logo.height * lh; x.globalAlpha = .85; x.drawImage(logo, W - 52 - sw - lw, H - 26 - lh + 6, lw, lh); x.globalAlpha = 1; }
    return c;
  }

  function ouvrir(ms, ev, url){
    return window.PartageImage.ouvrir({
      titre: 'Partager ma team', url: url,
      fichier: 'team-wuwa-' + ms.map(function(r){ return r.s; }).join('-'),
      alt: 'Image de la team ' + ms.map(function(r){ return r.n; }).join(', '),
      dessiner: function(){ return dessiner(ms, ev); }
    });
  }
  return { dessiner: dessiner, ouvrir: ouvrir };
})();
