/* ==========================================================
   Clash of Clans — mes comptes (import de l'export du jeu), ouvriers / labo en cours,
   progression par HDV. Tout est enregistré sur l'appareil du visiteur.
   Données du jeu : data-coc.js.
   ========================================================== */
(function(){
  var D = window.COC_DATA, I = D && D.items;
  var boxC = document.getElementById('coc-comptes'), boxE = document.getElementById('coc-encours');
  if(!I || !boxC) return;
  var KEY = 'optih-coc';
  var st; try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){ st = null; }
  st = st || {comptes: [], ouvert: null, filtre: ''};
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(e){} synchro(); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function info(id){ return I[String(id)] || ['Élément ' + id, 'autre', null]; }

  var LIEU = {
    ouvrier: ['Ouvrier', '<path d="M4 20h16M6 20v-6l6-5 6 5v6M10 20v-4h4v4"/>'],
    labo: ['Labo', '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.5 15h9"/>'],
    animaux: ['Animaux', '<path d="M5 13c0-4 3-7 7-7s7 3 7 7-3 6-7 6-7-2-7-6z"/><circle cx="9.5" cy="12" r="1"/><circle cx="14.5" cy="12" r="1"/>'],
    bb: ['Base des ouvriers', '<path d="M3 20l4-9 5 4 4-8 5 13z"/>']
  };
  function lieu(id, cle){
    var c = info(id)[1];
    if(/2$/.test(cle) || c === 'bb') return 'bb';
    if(c === 'trp' || c === 'sort' || c === 'siege') return 'labo';
    if(c === 'pet') return 'animaux';
    return 'ouvrier';
  }
  function duree(ms){
    var m = Math.max(0, Math.round(ms / 6e4)), j = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mn = m % 60;
    return j ? j + ' j ' + h + ' h' : h ? h + ' h ' + (mn < 10 ? '0' : '') + mn : mn + ' min';
  }
  function quand(t){
    var d = new Date(t), auj = new Date(); var demain = new Date(auj); demain.setDate(auj.getDate() + 1);
    var h = d.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}).replace(':', ' h ');
    if(d.toDateString() === auj.toDateString()) return "aujourd'hui à " + h;
    if(d.toDateString() === demain.toDateString()) return 'demain à ' + h;
    return d.toLocaleDateString('fr-FR', {weekday: 'short', day: 'numeric', month: 'short'}).replace(/\./g, '') + ' à ' + h;
  }
  function ilya(t){ var j = Math.floor((Date.now() - t) / 864e5); return j <= 0 ? "aujourd'hui" : j === 1 ? 'hier' : 'il y a ' + j + ' jours'; }

  /* ---------- Lecture de l'export du jeu ---------- */
  var IGNORE = /^(decos|obstacles|skins|sceneries|house_parts|boosts|helpers|helper|clan|player|account)$/i;
  function lire(txt){
    txt = String(txt || '').trim();
    var a = txt.indexOf('{'), b = txt.lastIndexOf('}');
    if(a < 0 || b < a) throw new Error('Je ne trouve pas les données. Refais « Copier » dans le jeu.');
    var o = JSON.parse(txt.slice(a, b + 1));
    var ts = (+o.timestamp || +o.time || Math.floor(Date.now() / 1000)) * 1000;
    var niv = {}, encours = [], th = 0;
    Object.keys(o).forEach(function(k){
      var v = o[k];
      if(!Array.isArray(v) || IGNORE.test(k)) return;
      var bb = /2$/.test(k);
      v.forEach(function(e){
        if(!e || e.data == null || e.lvl == null) return;
        var id = String(e.data), lvl = +e.lvl || 0, cnt = +e.cnt || 1;
        if(id === '1000001' && !bb) th = Math.max(th, lvl);
        if(!bb){ niv[id] = niv[id] || {}; niv[id][lvl] = (niv[id][lvl] || 0) + cnt; }
        if(e.timer != null && +e.timer > 0){
          var n = 1;   // plusieurs bâtiments identiques peuvent être en amélioration
          for(var i = 0; i < n; i++) encours.push({id: id, lvl: lvl + 1, fin: ts + (+e.timer) * 1000, lieu: lieu(id, k)});
        }
      });
    });
    if(!th) throw new Error('Pas d\'hôtel de ville dans ces données : ce n\'est sans doute pas le bon texte.');
    return {tag: o.tag || ('#' + Math.random().toString(36).slice(2, 8).toUpperCase()), th: th, maj: ts, niv: niv, encours: encours};
  }

  /* ---------- Progression par catégorie pour l'HDV du compte ---------- */
  var CATS = [['Bâtiments', ['def', 'res', 'arm', 'piege', 'garde']], ['Murs', ['mur']], ['Héros', ['hero']], ['Labo', ['trp', 'sort', 'siege']], ['Animaux', ['pet']], ['Équipement', ['equip']]];
  function progression(c){
    var res = [], reste = [];
    CATS.forEach(function(cat){
      var fait = 0, total = 0;
      Object.keys(I).forEach(function(id){
        var it = I[id]; if(cat[1].indexOf(it[1]) < 0 || !it[2]) return;
        var max = it[2][c.th] || 0; if(!max) return;
        var nb = it[3] ? (it[3][c.th] || 0) : 1;
        var a = c.niv[id];
        if(!nb) return;
        if(it[1] === 'equip' && !a) return;       // équipement pas encore débloqué : on ne le compte pas
        var cur = 0, vus = 0;
        if(a) Object.keys(a).map(Number).sort(function(x, y){ return y - x; }).forEach(function(l){
          var k = Math.min(a[l], nb - vus); if(k <= 0) return; cur += Math.min(l, max) * k; vus += k;
        });
        fait += cur; total += max * nb;
        var pire = a ? Math.min.apply(null, Object.keys(a).map(Number)) : 0;
        if(vus < nb) pire = 0;
        if(pire < max && it[1] !== 'mur') reste.push([it[0], pire, max, cat[0], id]);
      });
      if(total) res.push([cat[0], fait / total]);
    });
    var glob = res.length ? res.reduce(function(s, x){ return s + x[1]; }, 0) / res.length : 0;
    return {cats: res, glob: glob, reste: reste};
  }
  /* ---------- Ce qu'il reste pour maxer l'HDV (temps et ressources) ---------- */
  var COUTS = D.couts || {};
  function resteMax(c){
    var r = {ouvrier: 0, labo: 0, animaux: 0, or: 0, el: 0, en: 0, oe: 0};
    Object.keys(I).forEach(function(id){
      var it = I[id], cat = it[1], cl = COUTS[id];
      if(!cl || !it[2] || ['def', 'res', 'arm', 'piege', 'garde', 'mur', 'hero', 'trp', 'sort', 'siege', 'pet'].indexOf(cat) < 0) return;
      var max = it[2][c.th] || 0; if(!max) return;
      var nb = it[3] ? (it[3][c.th] || 0) : 1; if(!nb) return;
      var a = c.niv[id] || {}, niv = [];
      Object.keys(a).map(Number).sort(function(x, y){ return y - x; }).forEach(function(l){ for(var k = 0; k < a[l] && niv.length < nb; k++) niv.push(l); });
      if(['trp', 'sort', 'siege', 'pet', 'hero'].indexOf(cat) > -1 && !niv.length) return;   // pas encore débloqué
      while(niv.length < nb) niv.push(0);
      var ou = cat === 'trp' || cat === 'sort' || cat === 'siege' ? 'labo' : cat === 'pet' ? 'animaux' : 'ouvrier';
      niv.forEach(function(l){
        cl.forEach(function(x){ if(x[0] > l && x[0] <= max){ r[ou] += x[1]; if(x[3]) r[x[3]] += x[2]; } });
      });
    });
    return r;
  }
  function gros(n){ return n >= 1e9 ? (n / 1e9).toFixed(1).replace('.', ',') + ' Md' : n >= 1e6 ? (n / 1e6).toFixed(n >= 1e8 ? 0 : 1).replace('.', ',') + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(Math.round(n)); }
  function jours(sec){ var j = sec / 86400; return j < 1 ? Math.round(sec / 3600) + ' h' : (j < 10 ? j.toFixed(1).replace('.', ',') : Math.round(j)) + ' j'; }
  function blocMax(c){
    var r = resteMax(c), n = nbOuvriers(c);
    if(!r.ouvrier && !r.labo && !r.animaux && !r.oe) return '<div class="maxe"><b>HDV ' + c.th + ' maxé ✓</b></div>';
    var res = [['or', 'Or'], ['el', 'Élixir'], ['en', 'Élixir noir'], ['oe', 'Murs (or ou élixir)']].filter(function(x){ return r[x[0]]; });
    return '<div class="maxe"><p class="note">Pour maxer l\'HDV ' + c.th + ' (sans boost) :</p><div class="maxe-t">' +
      '<div><span>Ouvriers</span><b>' + jours(r.ouvrier / n) + '</b><em>avec tes ' + n + ' ouvriers</em></div>' +
      '<div><span>Labo</span><b>' + jours(r.labo) + '</b><em>de recherche</em></div>' +
      (r.animaux ? '<div><span>Animaux</span><b>' + jours(r.animaux) + '</b><em>maison des animaux</em></div>' : '') +
      '</div>' + (res.length ? '<p class="maxe-r">' + res.map(function(x){ return '<span class="r-' + x[0] + '">' + x[1] + ' <b>' + gros(r[x[0]]) + '</b></span>'; }).join('') + '</p>' : '') + '</div>';
  }
  function nbOuvriers(c){
    var huttes = 0, a = c.niv['1000015']; if(a) Object.keys(a).forEach(function(l){ if(+l > 0) huttes += a[l]; });
    if(c.niv['1000064']) huttes += 1;   // cabane de B.O.B
    return huttes || 5;
  }

  /* ---------- Affichage : comptes ---------- */
  function anneau(p){
    var r = 26, L = 2 * Math.PI * r;
    return '<div class="anneau" title="Progression pour son HDV"><svg viewBox="0 0 62 62" aria-hidden="true"><circle class="f" cx="31" cy="31" r="' + r + '"/><circle class="v" cx="31" cy="31" r="' + r + '" stroke-dasharray="' + (L * p).toFixed(1) + ' ' + L.toFixed(1) + '"/></svg><b>' + Math.round(p * 100) + '%</b></div>';
  }
  function img(id, alt){ return '<img src="img/i/' + id + '.webp" alt="' + esc(alt || '') + '" loading="lazy" onerror="this.remove()">'; }
  function heros(c){
    var h = Object.keys(c.niv).filter(function(id){ return info(id)[1] === 'hero'; });
    if(!h.length) return '';
    return '<div class="herosr">' + h.map(function(id){
      var it = info(id), l = Math.max.apply(null, Object.keys(c.niv[id]).map(Number)), max = it[2] ? it[2][c.th] : 0;
      return '<span class="' + (max && l >= max ? 'max' : '') + '" title="' + esc(it[0]) + ' : niveau ' + l + (max ? ' / ' + max : '') + '">' + img(id) + l + '</span>';
    }).join('') + '</div>';
  }
  function resume(k, v){ try { var s = JSON.stringify(v); if(localStorage.getItem(k) !== s) localStorage.setItem(k, s); } catch(e){} } /* résumé pour la carte de joueur (accueil) */
  function rendreComptes(){
    var now0 = Date.now();
    resume('optih-resume-coc', st.comptes.map(function(c){ return {nom: c.nom, th: c.th, pct: Math.round(progression(c).glob * 100), ouv: c.encours.filter(function(e){ return e.lieu === 'ouvrier' && e.fin > now0; }).length, lab: c.encours.some(function(e){ return e.lieu === 'labo' && e.fin > now0; })}; }));
    if(!st.comptes.length){
      boxC.innerHTML = '<div class="vide"><b>Aucun compte pour l\'instant</b><span>Ajoute ton premier compte en 3 étapes : exporte les données dans le jeu et colle-les ici.</span><button type="button" class="b-prim" data-aller="coc-import">+ Ajouter un compte</button></div>';
      return;
    }
    var now = Date.now();
    boxC.innerHTML = '<div class="comptes">' + st.comptes.map(function(c, i){
      var p = progression(c), ouv = c.encours.filter(function(e){ return e.lieu === 'ouvrier' && e.fin > now; });
      var lab = c.encours.filter(function(e){ return e.lieu === 'labo' && e.fin > now; })[0];
      var pet = c.encours.filter(function(e){ return e.lieu === 'animaux' && e.fin > now; })[0];
      var proch = ouv.slice().sort(function(a, b){ return a.fin - b.fin; })[0];
      var ouvert = st.ouvert === c.tag;
      return '<article class="compte' + (ouvert ? ' actif' : '') + '">' +
        '<div class="c-tete"><div class="hdv-img"><img src="img/hdv/' + c.th + '.webp" alt="Hôtel de ville niveau ' + c.th + '"><b>HDV ' + c.th + '</b></div><div class="c-nom"><h3>' + esc(c.nom) + '</h3><span>' + esc(c.tag) + ' · mis à jour ' + ilya(c.maj) + '</span></div>' + anneau(p.glob) + '</div>' +
        heros(c) +
        '<div class="c-etat">' +
          '<div><span>Ouvriers</span><b>' + ouv.length + ' / ' + nbOuvriers(c) + ' occupés</b><em>' + (proch ? 'Libre dans ' + duree(proch.fin - now) : 'Tous libres !') + '</em></div>' +
          '<div><span>Labo</span><b>' + (lab ? esc(info(lab.id)[0]) : 'Libre') + '</b><em>' + (lab ? 'niv. ' + lab.lvl + ' · ' + duree(lab.fin - now) : (pet ? 'Animaux : ' + esc(info(pet.id)[0]) : 'Lance une recherche')) + '</em></div>' +
          (function(){ var r = ouvert ? {} : resteMax(c); return r.ouvrier ? '<div class="c-max"><span>Pour maxer l\'HDV ' + c.th + '</span><b>≈ ' + jours(r.ouvrier / nbOuvriers(c)) + ' d\'ouvriers</b><em>et ' + jours(r.labo) + ' de labo</em></div>' : ''; })() +
        '</div>' +
        (ouvert ? '<div class="c-detail">' + blocMax(c) + p.cats.map(function(x){ return '<div class="cat"><span>' + x[0] + '</span><i><b style="width:' + (x[1] * 100).toFixed(1) + '%"></b></i><em>' + Math.round(x[1] * 100) + '%</em></div>'; }).join('') +
          (p.reste.length ? '<p class="note">Pas encore au max pour l\'HDV ' + c.th + ' (' + p.reste.length + ') :</p><ul class="reste">' + p.reste.sort(function(a, b){ return (b[2] - b[1]) - (a[2] - a[1]); }).map(function(r){ return '<li><span class="rn">' + img(r[4]) + esc(r[0]) + '</span><span>' + r[1] + ' → ' + r[2] + '</span></li>'; }).join('') + '</ul>' : '<p class="note">Tout est au max pour cet HDV. Bravo !</p>') +
          '<div class="renommer"><input type="text" maxlength="30" value="' + esc(c.nom) + '" data-nom="' + i + '" aria-label="Nom du compte"><button type="button" class="b-mini" data-renommer="' + i + '">Renommer</button></div>' +
          '</div>' : '') +
        '<div class="c-actions"><button type="button" class="b-mini" data-ouvrir="' + esc(c.tag) + '">' + (ouvert ? 'Masquer le détail' : 'Voir le détail') + '</button>' +
          '<button type="button" class="b-mini" data-maj="' + i + '">Mettre à jour</button>' +
          '<button type="button" class="b-mini danger" data-suppr="' + i + '">Supprimer</button></div>' +
      '</article>';
    }).join('') + '</div>';
  }

  /* ---------- Affichage : en cours ---------- */
  function rendreEncours(){
    var now = Date.now(), L = [];
    st.comptes.forEach(function(c){ c.encours.forEach(function(e){ if(e.fin > now - 6 * 3600e3) L.push({c: c, e: e}); }); });
    L.sort(function(a, b){ return a.e.fin - b.e.fin; });
    var nbFinis = L.filter(function(x){ return x.e.fin <= now; }).length;
    var pas = document.getElementById('coc-nb'); if(pas){ pas.hidden = !nbFinis; pas.textContent = nbFinis; }
    if(!st.comptes.length){ boxE.innerHTML = '<div class="vide"><b>Rien à suivre</b><span>Ajoute un compte pour voir ses améliorations en cours.</span></div>'; return; }
    var lieux = ['', 'ouvrier', 'labo', 'animaux', 'bb'];
    var vus = L.filter(function(x){ return !st.filtre || x.e.lieu === st.filtre; });
    boxE.innerHTML = '<div class="filtres">' + lieux.map(function(l){ return '<button type="button" data-filtre="' + l + '" aria-pressed="' + (st.filtre === l) + '">' + (l ? LIEU[l][0] : 'Tout') + '</button>'; }).join('') + '</div>' +
      (vus.length ? '<ul class="timeline">' + vus.map(function(x){
        var e = x.e, fini = e.fin <= now, l = LIEU[e.lieu] || LIEU.ouvrier;
        return '<li class="tl' + (fini ? ' fini' : '') + '"><span class="tl-ico" title="' + l[0] + '">' + (info(e.id)[1] !== 'bb' ? img(e.id) : '<svg viewBox="0 0 24 24" aria-hidden="true">' + l[1] + '</svg>') + '</span>' +
          '<div><b>' + esc(info(e.id)[0]) + ' → niv. ' + e.lvl + '</b><small>' + (st.comptes.length > 1 ? '<span class="tl-cpt">' + esc(x.c.nom) + '</span>' : '') + l[0] + ' · ' + (fini ? 'terminé ' + quand(e.fin) : 'fini ' + quand(e.fin)) + '</small></div>' +
          '<div class="tl-t">' + (fini ? 'Terminé ✓' : duree(e.fin - now)) + '</div></li>';
      }).join('') + '</ul>' : '<div class="vide"><b>Rien en cours ici</b><span>Tes ouvriers se tournent les pouces 😄 Lance une amélioration, puis refais l\'export.</span></div>');
  }
  function rendre(){ rendreComptes(); rendreEncours(); }

  /* ---------- Import ---------- */
  var msg = document.getElementById('coc-msg'), zone = document.getElementById('coc-texte'), nomIn = document.getElementById('coc-nom');
  function dire(t, cl){ msg.textContent = t; msg.className = 'msg' + (cl ? ' ' + cl : ''); }
  document.getElementById('coc-coller').addEventListener('click', async function(){
    try { zone.value = await navigator.clipboard.readText(); dire('Collé ! Clique sur « Enregistrer le compte ».'); }
    catch(e){ dire('Ton navigateur ne me laisse pas lire le presse-papiers : colle dans le cadre (appui long → Coller).', 'err'); zone.focus(); }
  });
  document.getElementById('coc-ok').addEventListener('click', function(){
    var c;
    try { c = lire(zone.value); } catch(e){ dire(e.message && e.message.length < 140 ? e.message : 'Ces données ne sont pas lisibles. Refais « Copier » dans le jeu.', 'err'); return; }
    var i = st.comptes.findIndex(function(x){ return x.tag === c.tag; });
    var nom = nomIn.value.trim();
    if(i > -1){ c.nom = nom || st.comptes[i].nom; st.comptes[i] = c; }
    else { c.nom = nom || ('Compte ' + (st.comptes.length + 1)); st.comptes.push(c); }
    st.ouvert = c.tag; save(); rendre();
    zone.value = ''; nomIn.value = '';
    var n = c.encours.length;
    dire((i > -1 ? 'Compte mis à jour' : 'Compte ajouté') + ' : HDV ' + c.th + ', ' + n + ' amélioration' + (n > 1 ? 's' : '') + ' en cours.', 'ok');
    setTimeout(function(){ montrer('coc-comptes'); }, 900);
  });

  /* ---------- Actions ---------- */
  document.getElementById('p-coc').addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return;
    if(b.dataset.aller){ montrer(b.dataset.aller); }
    if(b.dataset.ouvrir != null){ st.ouvert = st.ouvert === b.dataset.ouvrir ? null : b.dataset.ouvrir; save(); rendreComptes(); }
    if(b.dataset.maj != null){ nomIn.value = st.comptes[+b.dataset.maj].nom; montrer('coc-import'); dire('Exporte ce compte dans le jeu puis colle les données.'); }
    if(b.dataset.suppr != null){
      if(b.dataset.sur){ st.comptes.splice(+b.dataset.suppr, 1); save(); rendre(); }
      else { b.dataset.sur = '1'; b.textContent = 'Sûr ? Re-clique'; setTimeout(function(){ if(b.isConnected){ delete b.dataset.sur; b.textContent = 'Supprimer'; } }, 3000); }
    }
    if(b.dataset.renommer != null){ var inp = boxC.querySelector('[data-nom="' + b.dataset.renommer + '"]'); var v = inp && inp.value.trim(); if(v){ st.comptes[+b.dataset.renommer].nom = v; save(); rendre(); } }
    if(b.dataset.filtre != null){ st.filtre = b.dataset.filtre; save(); rendreEncours(); }
  });

  /* ---------- Sous-onglets ---------- */
  var sousBtns = [].slice.call(document.querySelectorAll('#p-coc .sous [data-sous]'));
  function montrer(id){
    sousBtns.forEach(function(b){ var on = b.dataset.sous === id; b.setAttribute('aria-selected', on); document.getElementById(b.dataset.sous).hidden = !on; });
    if(id === 'coc-import') setTimeout(function(){ zone.focus(); }, 50);
  }
  sousBtns.forEach(function(b){ b.addEventListener('click', function(){ montrer(b.dataset.sous); }); });
  window.COC_MONTRER = montrer;
  function depuisAdresse(){ var h = location.hash.slice(1); if(/^coc-(encours|import|comptes|meta|equip)$/.test(h)) montrer(h); }
  depuisAdresse(); addEventListener('hashchange', depuisAdresse);

  /* ---------- Notifications « fin d'amélioration » (si activées sur l'accueil) ---------- */
  var envoi = null;
  function synchro(){
    var n; try { n = JSON.parse(localStorage.getItem('optih-notifs') || 'null'); } catch(e){ n = null; }
    if(!n || !n.endpoint || (n.sujets || []).indexOf('coc') < 0 || !window.fetch) return;
    clearTimeout(envoi);
    envoi = setTimeout(function(){
      var now = Date.now(), L = [];
      st.comptes.forEach(function(c){ c.encours.forEach(function(e){
        if(e.fin > now) L.push({t: e.fin, titre: 'Clash of Clans' + (st.comptes.length > 1 ? ' · ' + c.nom : ''), texte: info(e.id)[0] + ' niveau ' + e.lvl + ' est prêt !'});
      }); });
      fetch((/netlify\.app$/.test(location.hostname) ? '' : 'https://optihx.netlify.app') + '/api/coc', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({endpoint: n.endpoint, liste: L.slice(0, 120)})}).catch(function(){});
    }, 1200);
  }


  /* ---------- Compos Légende : accordéon ; chaque créateur = sa vidéo YouTube + SON armée ---------- */
  var boxM = document.getElementById('coc-meta'), mOuvert = 0, mVid = {}, mJoue = {};
  var TNM = {26:'Super barbare', 28:'Super sapeur', 55:'Gobelin furtif', 57:'Ballon-fusée', 63:'Dragon infernal', 76:'Molosse de glace', 80:'Super bouliste', 81:'Super dragon', 84:'Super gargouille', 147:'Super yéti'};
  function resetDans(){
    var n = new Date(), h = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 5);
    if(h <= n) h += 864e5;
    var f = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + 1, 0, 5)); /* dernier lundi du mois, 5 h UTC */
    while(f.getUTCDay() !== 1) f = new Date(f - 864e5);
    if(f <= n){ f = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + 2, 0, 5)); while(f.getUTCDay() !== 1) f = new Date(f - 864e5); }
    return {jour: h - n, saison: f - n};
  }
  function hm(ms){ var m = Math.max(0, Math.floor(ms / 6e4)), j = Math.floor(m / 1440), hh = Math.floor(m % 1440 / 60); return (j ? j + ' j ' : '') + hh + ' h ' + ('0' + (m % 60)).slice(-2); }
  function lot(u, re){ var m = u.match(re); return m ? m[1].split('-').map(function(p){ var a = p.split('x'); return [+a[0], +a[1]]; }) : []; }
  function armee(u){
    var tr = [], en = [], sp = [];
    lot(u, /u([0-9x-]+)/).forEach(function(x){ var it = I[String(4000000 + x[1])], nom = TNM[x[1]] || (it && it[0]); if(nom) (it && it[1] === 'siege' ? en : tr).push([nom, x[0]]); });
    lot(u, /s([0-9x-]+)$/).forEach(function(x){ var it = I[String(26000000 + x[1])]; if(it) sp.push([it[0].replace(/^Sort (de |d'|du )?/i, '').replace(/^./, function(c){ return c.toUpperCase(); }), x[0]]); });
    tr.sort(function(a, b){ return b[1] - a[1]; });
    function f(l){ return l.map(function(x){ return esc(x[0]) + ' ×' + x[1]; }).join(', '); }
    return '<dl class="marm"><dt>Troupes</dt><dd>' + f(tr) + '</dd>' + (sp.length ? '<dt>Sorts</dt><dd>' + f(sp) + '</dd>' : '') + (en.length ? '<dt>Engins</dt><dd>' + f(en) + '</dd>' : '') + '</dl>';
  }
  function video(v, i){
    if(mJoue[i] === v.y) return '<div class="mvid"><iframe src="https://www.youtube-nocookie.com/embed/' + v.y + '?autoplay=1&rel=0&playsinline=1" title="' + esc(v.t) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
    return '<button type="button" class="mvid" data-jouer="' + i + '" aria-label="Lire la vidéo de ' + esc(v.c) + '"><img src="https://i.ytimg.com/vi/' + v.y + '/hqdefault.jpg" alt="" loading="lazy"><span class="mplay"></span><span class="mcap"><b>' + esc(v.t) + '</b>' + esc(v.c) + ' · ' + esc(v.w) + ' vues</span></button>';
  }
  function rendreMeta(){
    var M = window.COC_META; if(!M) return;
    var r = resetDans(), dt = M.date.split('-');
    boxM.innerHTML = '<p class="mhaut">Légende 1 · relevé du ' + dt[2] + '/' + dt[1] + ' · ' + M.joueurs.toLocaleString('fr-FR') + ' joueurs<br>Reset du jour dans <b id="meta-j">' + hm(r.jour) + '</b> · fin de saison dans <b id="meta-s">' + hm(r.saison) + '</b></p><div class="macc">' +
      M.types.map(function(t, i){
        var on = i === mOuvert, k = mVid[i] || 0, v = t.v[k];
        return '<section class="mtype' + (on ? ' ouvert' : '') + '" id="mt-' + i + '"><button type="button" class="mligne" data-mtype="' + i + '" aria-expanded="' + on + '">' +
          (t.i || []).map(function(id){ return '<img class="mtete" src="img/i/' + (4000000 + id) + '.webp" alt="" width="40" height="40" loading="lazy">'; }).join('') +
          '<span class="mnom">' + esc(t.n) + '</span><span class="mpct">' + String(t.p).replace('.', ',') + ' %</span><i class="mchev" aria-hidden="true"></i></button>' +
          (on ? '<div class="mcorps">' + video(v, i) +
            '<div class="mcre" role="group" aria-label="Choisir un créateur">' + t.v.map(function(x, j){ return '<button type="button" data-mvid="' + i + ':' + j + '" aria-pressed="' + (j === k) + '">' + esc(x.c) + '</button>'; }).join('') + '</div>' +
            '<p class="msous">Armée de la vidéo de <b>' + esc(v.c) + '</b></p>' + armee(v.u) +
            '<div class="actions"><a class="b-prim" href="https://link.clashofclans.com/en?action=CopyArmy&army=' + esc(v.u) + '" target="_blank" rel="noopener">Copier dans le jeu</a><button type="button" class="b-sec" data-lien="' + esc(v.u) + '">Copier le lien</button></div></div>' : '') +
          '</section>';
      }).join('') + '</div><p class="note">Guides vidéo et armées relevés sur Ranked Warden (non officiel) ; vidéos YouTube de leurs créateurs. Le lien « Copier dans le jeu » contient aussi les héros, équipements et troupes du château de la vidéo.</p>';
  }
  boxM.addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return;
    if(b.dataset.mtype != null){ var i = +b.dataset.mtype; mOuvert = mOuvert === i ? -1 : i; rendreMeta(); var s = document.getElementById('mt-' + i); if(s && mOuvert === i && s.getBoundingClientRect().top < 60) s.scrollIntoView({block: 'start'}); }
    else if(b.dataset.mvid){ var p = b.dataset.mvid.split(':'); mVid[p[0]] = +p[1]; delete mJoue[p[0]]; rendreMeta(); }
    else if(b.dataset.jouer != null){ var t = window.COC_META.types[+b.dataset.jouer]; mJoue[b.dataset.jouer] = t.v[mVid[b.dataset.jouer] || 0].y; rendreMeta(); }
  });
  setInterval(function(){ var a = document.getElementById('meta-j'); if(a){ var r = resetDans(); a.textContent = hm(r.jour); document.getElementById('meta-s').textContent = hm(r.saison); } }, 30000);
  document.getElementById('p-coc').addEventListener('click', function(e){
    var b = e.target.closest('button[data-lien]'); if(!b) return;
    var u = 'https://link.clashofclans.com/en?action=CopyArmy&army=' + b.dataset.lien, t = b.textContent;
    function ok(){ b.textContent = 'Lien copié !'; setTimeout(function(){ b.textContent = t; }, 1800); }
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(ok, function(){ prompt('Copie ce lien :', u); });
    else prompt('Copie ce lien :', u);
  });
  rendreMeta();


  /* ---------- Équipements de héros (niveaux conseillés + combinaisons les plus jouées) ---------- */
  var boxQ = document.getElementById('coc-equip'), eqHero = 0;
  var TN = TNM;
  var PFX = {e: 90000000, p: 73000000, s: 26000000, t: 4000000};
  function ent(k, id){
    if(typeof id === 'string') return {nom: id, ico: ''};
    var full = PFX[k] + id, nom = (k === 't' && TN[id]) || info(full)[0];
    if(k === 's') nom = nom.replace(/^Sort d['e] ?(la |l')?/i, '').replace(/^./, function(m){ return m.toUpperCase(); });
    return {nom: nom, ico: '<img src="img/i/' + full + '.webp" alt="" loading="lazy" onerror="this.remove()">'};
  }
  function chipQ(k, id, pct){ var o = ent(k, id); return '<span class="qc">' + o.ico + '<i>' + esc(o.nom) + '</i>' + (pct != null ? '<b>' + String(pct).replace('.', ',') + ' %</b>' : '') + '</span>'; }
  function niveaux(l){ return '<ul class="qn">' + l.map(function(x){ var o = ent('e', x[0]); return '<li>' + o.ico + '<span>' + esc(o.nom) + '</span><b>niv. ' + x[1] + '</b></li>'; }).join('') + '</ul>'; }
  function rendreEquip(){
    var Q = window.COC_EQUIP; if(!Q) return;
    var H = Q[eqHero];
    boxQ.innerHTML = '<div class="qheros" role="group" aria-label="Choisir un héros">' + Q.map(function(x, i){
      return '<button type="button" data-hero="' + i + '" aria-pressed="' + (i === eqHero) + '"><img src="img/i/' + x.h + '.webp" alt="" loading="lazy"><span>' + esc(info(x.h)[0]) + '</span></button>'; }).join('') + '</div>' +
      '<div class="qcols"><section class="qbloc"><h3>Équipements épiques</h3>' + niveaux(H.ep) + '</section><section class="qbloc"><h3>Équipements communs</h3>' + niveaux(H.co) + '</section></div>' +
      '<p class="note">Niveau conseillé : le plus bas qui donne déjà l\'essentiel de l\'effet (au moins 40 % pour un épique, 50 % pour un commun). « niv. 1 » : inutile de le monter pour le meta.</p>' +
      '<h3 class="qtitre">Combinaisons les plus jouées</h3><div class="qcombos">' + H.c.map(function(r){
        return '<div class="qcombo"><div class="qeq">' + r.e.map(function(id){ return chipQ('e', id); }).join('') + '</div>' +
          '<div class="qlig"><em>Animal</em>' + r.p.map(function(x){ return chipQ('p', x[0], x[1]); }).join('') + '</div>' +
          (r.s.length ? '<div class="qlig"><em>Sorts</em>' + r.s.map(function(id){ return chipQ('s', id); }).join('') + '</div>' : '') +
          '<div class="qlig"><em>Armées</em>' + r.a.map(function(x){ return chipQ('t', x[0], x[1]); }).join('') + '</div></div>'; }).join('') + '</div>' +
      '<p class="note">Relevé du ' + esc(window.COC_EQUIP_DATE || '') + ' sur Ranked Warden (Legend League 1, équipements du meta). Les pourcentages indiquent la part des joueurs qui utilisent chaque animal ou armée avec cette combinaison.</p>';
  }
  boxQ.addEventListener('click', function(e){ var b = e.target.closest('button[data-hero]'); if(!b) return; eqHero = +b.dataset.hero; rendreEquip(); });
  rendreEquip();

  rendre(); synchro();
  function tic(){ rendreEncours(); var f = document.activeElement; if(!(f && boxC.contains(f) && f.tagName === 'INPUT')) rendreComptes(); }
  setInterval(tic, 30000);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) tic(); });
})();
