/* ==========================================================
   opti'H ✗ — fenêtre « Partager en image » (commune à WuWa, ToG et BDO)
   Montre l'image créée par la page, puis : Partager · Télécharger · Copier l'image · Copier le lien.
   Tout se passe dans le navigateur : rien n'est envoyé sur internet.
   Utilisation : PartageImage.ouvrir({ titre, fichier, url, dessiner: async () => canvas })
   ========================================================== */
window.PartageImage = (function(){
  var css = document.createElement('style');
  css.textContent =
    '.pi-fond{position:fixed;inset:0;z-index:200;display:grid;place-items:center;padding:16px;background:rgba(8,10,14,.84);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:pi-in .25s ease}' +
    '@keyframes pi-in{from{opacity:0}}' +
    '.pi-boite{width:min(960px,100%);max-height:calc(100dvh - 32px);overflow:auto;padding:18px;border-radius:14px;background:#141a26;color:#f1efe6;border:1px solid rgba(255,255,255,.12);box-shadow:0 30px 80px -30px rgba(0,0,0,.8);font:15px/1.45 "Figtree",system-ui,sans-serif}' +
    '.pi-tete{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}' +
    '.pi-tete h3{margin:0;font:800 22px/1.1 "Big Shoulders Display","Figtree",system-ui;letter-spacing:.04em;text-transform:uppercase}' +
    '.pi-x{width:38px;height:38px;border:1px solid rgba(255,255,255,.18);border-radius:50%;background:transparent;color:#f1efe6;font-size:20px;cursor:pointer}' +
    '.pi-x:hover{background:rgba(255,255,255,.08)}' +
    '.pi-img{display:block;width:100%;height:auto;border-radius:8px;background:#0b0d12}' +
    '.pi-attente{display:grid;place-items:center;aspect-ratio:16/9;border-radius:8px;background:#0b0d12;color:#9aa3ae;font-size:14px}' +
    '.pi-act{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}' +
    '.pi-act button{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#f1efe6;font:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s}' +
    '.pi-act button:hover{background:rgba(255,255,255,.07)}' +
    '.pi-act button.prim{background:#ffcf8a;border-color:#ffcf8a;color:#1a1206}' +
    '.pi-act svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}' +
    '.pi-msg{min-height:1.4em;margin:10px 0 0;font-size:13.5px;color:#aab3c5}';
  document.head.appendChild(css);

  var ICO = {
    partager: '<path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
    dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    img: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    lien: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
  };
  function bouton(id, txt, prim){ return '<button type="button" data-pi="' + id + '"' + (prim ? ' class="prim"' : '') + '><svg viewBox="0 0 24 24" aria-hidden="true">' + ICO[id] + '</svg>' + txt + '</button>'; }

  /* Outils de dessin partagés */
  function charger(src){ return new Promise(function(ok){ var i = new Image(); i.onload = function(){ ok(i); }; i.onerror = function(){ ok(null); }; i.src = src; }); }
  function coupe(ctx, txt, max){ txt = String(txt || ''); if(ctx.measureText(txt).width <= max) return txt; while(txt.length > 1 && ctx.measureText(txt + '…').width > max) txt = txt.slice(0, -1); return txt + '…'; }
  function rond(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  async function polices(liste){ try { await Promise.all(liste.map(function(f){ return document.fonts.load(f); })); } catch(e){} }
  /* image « cover » dans un rectangle */
  function couvre(ctx, im, x, y, w, h, fy){
    var k = Math.max(w / im.width, h / im.height), sw = w / k, sh = h / k;
    ctx.drawImage(im, (im.width - sw) / 2, (im.height - sh) * (fy == null ? .5 : fy), sw, sh, x, y, w, h);
  }

  async function ouvrir(o){
    var avant = document.activeElement;
    var fond = document.createElement('div');
    fond.className = 'pi-fond';
    fond.innerHTML = '<div class="pi-boite" role="dialog" aria-modal="true" aria-labelledby="pi-titre"><div class="pi-tete"><h3 id="pi-titre">' + (o.titre || 'Partager') + '</h3><button type="button" class="pi-x" aria-label="Fermer">×</button></div>' +
      '<div class="pi-attente">Création de l\'image…</div><div class="pi-act"></div><p class="pi-msg" aria-live="polite"></p></div>';
    document.body.appendChild(fond);
    var msg = fond.querySelector('.pi-msg');
    function fermer(){ fond.remove(); document.removeEventListener('keydown', echap); if(avant && avant.focus) avant.focus(); }
    function echap(e){ if(e.key === 'Escape') fermer(); }
    document.addEventListener('keydown', echap);
    fond.addEventListener('click', function(e){ if(e.target === fond || e.target.closest('.pi-x')) fermer(); });
    fond.querySelector('.pi-x').focus();

    var canvas = await o.dessiner();
    var blob = await new Promise(function(ok){ canvas.toBlob(ok, 'image/png'); });
    var nom = (o.fichier || 'optih') + '.png';
    var fichier = new File([blob], nom, {type: 'image/png'});
    var lienImg = URL.createObjectURL(blob);
    var im = new Image(); im.className = 'pi-img'; im.alt = o.alt || o.titre || ''; im.src = lienImg;
    fond.querySelector('.pi-attente').replaceWith(im);

    var peutPartager = navigator.canShare && navigator.canShare({files: [fichier]});
    var peutCopier = navigator.clipboard && window.ClipboardItem && window.isSecureContext;
    fond.querySelector('.pi-act').innerHTML =
      (peutPartager ? bouton('partager', 'Partager l\'image', true) : '') +
      bouton('dl', 'Télécharger', !peutPartager) +
      (peutCopier ? bouton('img', 'Copier l\'image') : '') +
      (o.url ? bouton('lien', 'Copier le lien') : '');
    fond.querySelector('.pi-act').addEventListener('click', async function(e){
      var b = e.target.closest('[data-pi]'); if(!b) return;
      var k = b.dataset.pi;
      try {
        if(k === 'partager'){ await navigator.share({files: [fichier], title: o.titre || '', text: o.url || ''}); msg.textContent = ''; }
        if(k === 'dl'){ var a = document.createElement('a'); a.href = lienImg; a.download = nom; document.body.appendChild(a); a.click(); a.remove(); msg.textContent = 'Image enregistrée dans tes téléchargements.'; }
        if(k === 'img'){ await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]); msg.textContent = 'Image copiée : colle-la directement dans Discord (Ctrl + V).'; }
        if(k === 'lien'){ await navigator.clipboard.writeText(o.url); msg.textContent = 'Lien copié.'; }
      } catch(err){ if(err && err.name !== 'AbortError') msg.textContent = 'Ça n\'a pas marché sur ce navigateur, essaie « Télécharger ».'; }
    });
  }
  return { ouvrir: ouvrir, charger: charger, coupe: coupe, rond: rond, polices: polices, couvre: couvre };
})();
