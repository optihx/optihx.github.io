/* ==========================================================
   Palworld — Paldeck (Pals capturés, enregistrés sur l'appareil) et reproduction.
   Règles de reproduction (comme le jeu) :
   1. quelques couples donnent un enfant selon qui est le mâle ;
   2. les combinaisons spéciales passent avant tout ;
   3. deux Pals identiques donnent le même Pal ;
   4. sinon : rang de l'enfant = (rang A + rang B + 1) / 2 arrondi en dessous,
      et on prend le Pal le plus proche (à égalité, le rang le plus haut).
   Données : data-pal.js.
   ========================================================== */
(function(){
  var D = window.PAL_DATA, boxD = document.getElementById('pal-deck'), boxR = document.getElementById('pal-repro');
  if(!D || !boxD) return;
  var EL = {neutre:['Neutre','#c9c3b4'], feu:['Feu','#ff7a45'], eau:['Eau','#4aa8ff'], plante:['Plante','#5fcf6b'], elec:['Électrique','#f5d547'], glace:['Glace','#8fe3ff'], terre:['Terre','#c99257'], tenebres:['Ténèbres','#a780ff'], dragon:['Dragon','#e65fa7']};
  var WK = {feu:'Allumage', eau:'Arrosage', plant:'Plantation', elec:'Électricité', art:'Artisanat', cueil:'Cueillette', bois:'Bûcheronnage', mine:'Minage', medoc:'Médicaments', froid:'Refroidissement', trans:'Transport', elev:'Élevage'};
  var P = D.pals.map(function(p){ return {c: p[0], n: p[1], d: p[2], e: p[3], r: p[4], rr: !!p[5], w: p[6], ig: !!p[7]}; });
  var by = {}; P.forEach(function(p){ by[p.c] = p; });
  var KEY = 'optih-pal';
  var st; try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){ st = null; }
  st = st || {pris: {}, el: '', manque: false, a: 'SheepBall', b: 'PinkCat', cible: '', mesP: false};
  st.base = st.base || [];
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(e){} }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function norm(s){ return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  /* ---------- Moteur de reproduction ---------- */
  var uniques = {}, dir = D.directionnels || {};
  D.uniques.forEach(function(u){ var k = u[0] < u[1] ? u[0] + '|' + u[1] : u[1] + '|' + u[0]; if(!dir[k]) uniques[k] = u[2]; });
  var eligibles = P.filter(function(p){ return p.rr; }).sort(function(a, b){ return a.r - b.r; });
  function proche(t){
    var best = null, bd = Infinity;
    eligibles.forEach(function(p){ var d = Math.abs(p.r - t); if(d < bd || (d === bd && p.r > best.r)){ best = p; bd = d; } });
    return best;
  }
  function enfant(a, b){
    var k = a < b ? a + '|' + b : b + '|' + a;
    if(dir[k]) return {list: dir[k].map(function(x){ return by[x[2]]; }).filter(Boolean), dir: dir[k]};
    if(uniques[k]) return {list: [by[uniques[k]]].filter(Boolean), special: true};
    if(a === b) return {list: [by[a]]};
    return {list: [proche(Math.floor((by[a].r + by[b].r + 1) / 2))]};
  }
  var parents = P.filter(function(p){ return !p.ig; });
  var cache = null;
  function toutesPaires(){
    if(cache) return cache;
    cache = {};
    for(var i = 0; i < parents.length; i++) for(var j = i; j < parents.length; j++){
      var a = parents[i].c, b = parents[j].c, r = enfant(a, b);
      r.list.forEach(function(p){ if(!p) return; (cache[p.c] = cache[p.c] || []).push([a, b]); });
    }
    return cache;
  }

  /* Chemin de reproduction en plusieurs générations à partir des Pals capturés */
  function chemin(cible){
    var tab = toutesPaires(), have = {};
    P.forEach(function(p){ if(st.pris[p.c] && !p.ig) have[p.c] = {g: 0}; });
    if(!Object.keys(have).length) return {vide: true};
    if(st.pris[cible]) return {deja: true};
    for(var g = 1; g <= 6 && !have[cible]; g++){
      var neuf = {};
      Object.keys(tab).forEach(function(c){
        if(have[c] || neuf[c]) return;
        var L = tab[c];
        for(var i = 0; i < L.length; i++){ var x = L[i]; if(x[0] !== c && x[1] !== c && have[x[0]] && have[x[1]]){ neuf[c] = {g: g, a: x[0], b: x[1]}; break; } }
      });
      if(!Object.keys(neuf).length) break;
      Object.keys(neuf).forEach(function(c){ have[c] = neuf[c]; });
    }
    if(!have[cible]) return {non: true};
    var etapes = [], vus = {};
    (function aller(c){ var h = have[c]; if(!h || !h.g || vus[c]) return; vus[c] = 1; aller(h.a); aller(h.b); etapes.push([h.a, h.b, c]); })(cible);
    return {etapes: etapes};
  }

  /* ---------- Paldeck ---------- */
  function puces(p){ return '<span class="pc-el">' + p.e.map(function(e){ return '<span style="--e:' + EL[e][1] + '"><i></i>' + EL[e][0] + '</span>'; }).join('') + '</span>'; }
  function travaux(p){ return p.w.slice().sort(function(a, b){ return b[1] - a[1]; }).slice(0, 3).map(function(w){ return WK[w[0]] + ' ' + w[1]; }).join(' · '); }
  var q = '', limite = 120;
  function resume(k, v){ try { var s = JSON.stringify(v); if(localStorage.getItem(k) !== s) localStorage.setItem(k, s); } catch(e){} } /* résumé pour la carte de joueur (accueil) */
  function resumePal(nb){ resume('optih-resume-pal', {n: nb, total: P.length, ic: Object.keys(st.pris).filter(function(c){ return P.some(function(p){ return p.c === c; }); }).slice(-5)}); }
  function rendreDeck(){
    var nb = P.filter(function(p){ return st.pris[p.c]; }).length, pct = nb / P.length * 100;
    resumePal(nb);
    var L = P.filter(function(p){ return (!st.el || p.e.indexOf(st.el) > -1) && (!st.manque || !st.pris[p.c]) && (!q || norm(p.n).indexOf(q) > -1 || p.d === q); });
    var html = '<div class="prog"><strong>' + nb + ' <small>/ ' + P.length + ' capturés</small></strong><div class="barre-p" role="img" aria-label="' + Math.round(pct) + ' %"><b style="width:' + pct.toFixed(1) + '%"></b></div></div>' +
      '<div class="outils-pal"><input type="search" class="recherche" id="pal-q" placeholder="Chercher un Pal ou un n°…" value="' + esc(q) + '" autocomplete="off" aria-label="Chercher un Pal">' +
      '<label class="bascule"><input type="checkbox" id="pal-manque"' + (st.manque ? ' checked' : '') + '>Seulement ceux qui me manquent</label></div>' +
      '<div class="elems">' + [''].concat(Object.keys(EL)).map(function(e){ return '<button type="button" data-el="' + e + '" aria-pressed="' + (st.el === e) + '"' + (e ? ' style="--e:' + EL[e][1] + '"' : '') + '>' + (e ? '<i></i>' + EL[e][0] : 'Tous') + '</button>'; }).join('') + '</div>' +
      '<ul class="deck" id="pal-liste">' + L.slice(0, limite).map(function(p){
        var ok = !!st.pris[p.c];
        return '<li><button type="button" class="pc' + (ok ? ' pris' : '') + '" data-pal="' + p.c + '" aria-pressed="' + ok + '"><span class="pc-img"><img src="img/pals/' + p.c + '.webp" alt="" loading="lazy" width="54" height="54"></span><span class="pc-n">N° ' + esc(p.d) + '</span><b>' + esc(p.n) + '</b>' + puces(p) + '<span class="pc-w">' + travaux(p) + '</span><span class="pc-ok" aria-hidden="true">✓</span></button></li>';
      }).join('') + '</ul>' +
      (L.length > limite ? '<button type="button" class="b-sec plus" data-plus="1">Voir les ' + (L.length - limite) + ' autres</button>' : '') +
      (!L.length ? '<div class="vide"><b>Aucun Pal ici</b><span>' + (st.manque ? 'Tu les as tous dans ce filtre !' : 'Essaie un autre nom.') + '</span></div>' : '');
    var f = document.activeElement && document.activeElement.id;
    boxD.innerHTML = html;
    if(f === 'pal-q'){ var i = document.getElementById('pal-q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  }
  boxD.addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return;
    if(b.dataset.pal){ var c = b.dataset.pal; if(st.pris[c]) delete st.pris[c]; else st.pris[c] = 1; save();
      if(st.manque) return rendreDeck();
      b.classList.toggle('pris', !!st.pris[c]); b.setAttribute('aria-pressed', !!st.pris[c]);
      var nb = P.filter(function(p){ return st.pris[p.c]; }).length; resumePal(nb);
      boxD.querySelector('.prog strong').innerHTML = nb + ' <small>/ ' + P.length + ' capturés</small>'; boxD.querySelector('.barre-p b').style.width = (nb / P.length * 100).toFixed(1) + '%';
      return; }
    if(b.dataset.el != null){ st.el = b.dataset.el; save(); limite = 120; rendreDeck(); }
    if(b.dataset.plus){ limite += 400; rendreDeck(); }
  });
  boxD.addEventListener('input', function(e){ if(e.target.id === 'pal-q'){ q = norm(e.target.value.trim()); limite = 120; rendreDeck(); } });
  boxD.addEventListener('change', function(e){ if(e.target.id === 'pal-manque'){ st.manque = e.target.checked; save(); rendreDeck(); } });

  function mi(c){ return '<img src="img/pals/' + c + '.webp" alt="" loading="lazy">'; }
  /* ---------- Reproduction ---------- */
  var tri = P.slice().sort(function(a, b){ return a.n.localeCompare(b.n, 'fr'); });
  function options(val, avecVide, seulParents){
    return (avecVide ? '<option value="">Choisis un Pal…</option>' : '') + tri.filter(function(p){ return !seulParents || !p.ig; }).map(function(p){ return '<option value="' + p.c + '"' + (p.c === val ? ' selected' : '') + '>' + esc(p.n) + ' (n° ' + esc(p.d) + ')' + (st.pris[p.c] ? ' ✓' : '') + '</option>'; }).join('');
  }
  function rendreRepro(){
    var r = st.a && st.b && by[st.a] && by[st.b] ? enfant(st.a, st.b) : null;
    var res = '';
    if(r && r.list.length){
      res = '<div class="enfant"><span class="eg">=</span><div>' + r.list.map(function(p, i){
        return '<div class="e-un"><img src="img/pals/' + p.c + '.webp" alt=""><div><b>' + esc(p.n) + '</b><small>N° ' + esc(p.d) + ' · ' + p.e.map(function(e){ return EL[e][0]; }).join(' / ') + (r.dir ? ' · si ' + esc(by[r.dir[i][0]].n) + ' est le mâle' : r.special ? ' · combinaison spéciale' : '') + (st.pris[p.c] ? ' · déjà capturé ✓' : '') + '</small></div></div>';
      }).join('') + '</div></div>';
    }
    var paires = '';
    if(st.cible && by[st.cible]){
      var L = (toutesPaires()[st.cible] || []).filter(function(x){ return x[0] !== st.cible && x[1] !== st.cible; });
      if(st.mesP) L = L.filter(function(x){ return st.pris[x[0]] && st.pris[x[1]]; });
      L.sort(function(x, y){ return ((st.pris[y[0]] ? 1 : 0) + (st.pris[y[1]] ? 1 : 0)) - ((st.pris[x[0]] ? 1 : 0) + (st.pris[x[1]] ? 1 : 0)); });
      paires = L.length ? '<ul class="paires">' + L.slice(0, 150).map(function(x){
        var n = (st.pris[x[0]] ? 1 : 0) + (st.pris[x[1]] ? 1 : 0);
        return '<li>' + mi(x[0]) + esc(by[x[0]].n) + ' <span>+</span> ' + mi(x[1]) + esc(by[x[1]].n) + (n ? '<em>' + (n === 2 ? 'je les ai' : 'j\'en ai 1') + '</em>' : '') + '</li>';
      }).join('') + '</ul>' + (L.length > 150 ? '<p class="note">… et ' + (L.length - 150) + ' autres couples.</p>' : '')
      : '<p class="note">' + (st.mesP ? 'Aucun couple avec tes Pals capturés. Décoche la case pour tout voir.' : 'Ce Pal ne s\'obtient pas par reproduction (ou seulement avec lui-même).') + '</p>';
    }
    var ch = '';
    if(st.cible && by[st.cible]){
      var r2 = chemin(st.cible);
      ch = '<div class="chemin"><h4>Le chemin depuis mes Pals</h4>' + (r2.vide ? '<p class="note">Coche d\'abord tes Pals capturés dans le Paldeck : je te trouverai le chemin.</p>' :
        r2.deja ? '<p class="note">Tu l\'as déjà capturé ✓</p>' : r2.non ? '<p class="note">Pas de chemin avec tes Pals actuels : un bébé est toujours « entre » ses deux parents, il te faut donc capturer au moins un Pal plus rare que celui-ci (ou un des couples spéciaux).</p>' :
        '<ol>' + r2.etapes.map(function(e, i){ return '<li><span class="ce-n">' + (i + 1) + '</span>' + mi(e[0]) + esc(by[e[0]].n) + ' <span>+</span> ' + mi(e[1]) + esc(by[e[1]].n) + ' <span>→</span> ' + mi(e[2]) + '<b>' + esc(by[e[2]].n) + '</b></li>'; }).join('') + '</ol>' +
        '<p class="note">' + r2.etapes.length + ' reproduction' + (r2.etapes.length > 1 ? 's' : '') + ' à faire, dans cet ordre.</p>') + '</div>';
    }
    boxR.innerHTML = '<div class="repro">' +
      '<section class="bloc"><h3>Quel bébé ?</h3><p>Choisis deux parents.</p>' +
        '<div class="parents"><label class="champ"><span>Parent 1</span><select id="pal-a">' + options(st.a, false, true) + '</select></label><span class="plus-s" aria-hidden="true">+</span>' +
        '<label class="champ"><span>Parent 2</span><select id="pal-b">' + options(st.b, false, true) + '</select></label></div>' + res + '</section>' +
      '<section class="bloc"><h3>Comment l\'obtenir ?</h3><p>Choisis le Pal que tu veux : voici les couples qui le donnent.</p>' +
        '<label class="champ"><span>Je veux</span><select id="pal-cible">' + options(st.cible, true) + '</select></label>' +
        ch + '<label class="bascule" style="margin-top:12px"><input type="checkbox" id="pal-mes"' + (st.mesP ? ' checked' : '') + '>Seulement avec mes Pals capturés</label>' + paires + '</section>' +
    '</div>';
  }
  boxR.addEventListener('change', function(e){
    var t = e.target;
    if(t.id === 'pal-a') st.a = t.value;
    if(t.id === 'pal-b') st.b = t.value;
    if(t.id === 'pal-cible') st.cible = t.value;
    if(t.id === 'pal-mes') st.mesP = t.checked;
    save(); rendreRepro();
    var n = document.getElementById(t.id); if(n) n.focus();
  });

  /* ---------- Ma base : travaux couverts ---------- */
  var boxB = document.getElementById('pal-base');
  function rendreBase(){
    if(!boxB) return;
    var B = st.base.filter(function(c){ return by[c]; }), cov = {};
    Object.keys(WK).forEach(function(w){ cov[w] = {max: 0, nb: 0}; });
    B.forEach(function(c){ by[c].w.forEach(function(x){ var k = cov[x[0]]; if(!k) return; k.nb++; k.max = Math.max(k.max, x[1]); }); });
    var vivier = P.filter(function(p){ return st.pris[p.c]; }); if(!vivier.length) vivier = P;
    function meilleurs(w){
      return vivier.filter(function(p){ return B.indexOf(p.c) < 0; }).map(function(p){ var x = p.w.filter(function(y){ return y[0] === w; })[0]; return x ? [p, x[1]] : null; })
        .filter(Boolean).sort(function(a, b){ return b[1] - a[1]; }).slice(0, 3);
    }
    boxB.innerHTML = '<div class="base">' +
      '<section class="bloc"><h3>Les Pals de ma base</h3><p>Ajoute les Pals qui travaillent dans ta base (' + B.length + ').</p>' +
        '<div class="ajout-base"><label class="champ"><span class="sr-only">Pal à ajouter</span><select id="pal-ajout">' + options('', true) + '</select></label><button type="button" class="b-prim" data-base-ajout="1">Ajouter</button></div>' +
        (B.length ? '<ul class="base-l">' + B.map(function(c){ var p = by[c]; return '<li>' + mi(c) + '<span><b>' + esc(p.n) + '</b><small>' + travaux(p) + '</small></span><button type="button" class="b-mini" data-base-suppr="' + c + '" aria-label="Retirer ' + esc(p.n) + '">×</button></li>'; }).join('') + '</ul>' : '<p class="note">Aucun Pal pour l\'instant.</p>') +
      '</section>' +
      '<section class="bloc"><h3>Travaux couverts</h3><p>Le meilleur niveau de ta base pour chaque travail.' + (vivier === P ? ' Coche tes Pals dans le Paldeck pour des conseils avec ce que tu as.' : '') + '</p><ul class="trav">' +
        Object.keys(WK).map(function(w){
          var k = cov[w], sug = k.max < 3 ? meilleurs(w) : [];
          return '<li class="niv' + k.max + '"><div class="trav-h"><b>' + WK[w] + '</b><span class="trav-n">' + (k.max ? 'niv. ' + k.max + (k.nb > 1 ? ' · ' + k.nb + ' Pals' : '') : 'personne') + '</span></div>' +
            (sug.length ? '<div class="trav-s">' + (k.max ? 'Pour faire mieux : ' : 'À ajouter : ') + sug.map(function(x){ return '<button type="button" data-base-plus="' + x[0].c + '" title="Ajouter à ma base">' + mi(x[0].c) + esc(x[0].n) + ' <em>' + x[1] + '</em></button>'; }).join('') + '</div>' : '') + '</li>';
        }).join('') + '</ul></section></div>';
  }
  if(boxB){
    boxB.addEventListener('click', function(e){
      var b = e.target.closest('button'); if(!b) return;
      if(b.dataset.baseAjout){ var v = document.getElementById('pal-ajout').value; if(v && st.base.indexOf(v) < 0){ st.base.push(v); save(); rendreBase(); } }
      if(b.dataset.baseSuppr){ st.base = st.base.filter(function(c){ return c !== b.dataset.baseSuppr; }); save(); rendreBase(); }
      if(b.dataset.basePlus && st.base.indexOf(b.dataset.basePlus) < 0){ st.base.push(b.dataset.basePlus); save(); rendreBase(); }
    });
  }

  /* ---------- Sous-onglets ---------- */
  var sousBtns = [].slice.call(document.querySelectorAll('#p-pal .sous [data-sous]'));
  function montrer(id){
    sousBtns.forEach(function(b){ var on = b.dataset.sous === id; b.setAttribute('aria-selected', on); document.getElementById(b.dataset.sous).hidden = !on; });
    if(id === 'pal-repro') rendreRepro(); else if(id === 'pal-base') rendreBase(); else rendreDeck();
  }
  sousBtns.forEach(function(b){ b.addEventListener('click', function(){ montrer(b.dataset.sous); }); });
  window.PAL_MONTRER = montrer;
  if(/^#pal-(repro|base)$/.test(location.hash)) montrer(location.hash.slice(1)); else rendreDeck();
  addEventListener('hashchange', function(){ if(/^#pal-(repro|base|deck)$/.test(location.hash)) montrer(location.hash.slice(1)); });
})();
