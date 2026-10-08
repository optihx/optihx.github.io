/* ==========================================================
   AETHEL SPIRE — le guide (tier list, équipes, runes, classes, donjons)
   Toutes les données sont dans data-aethel.js.
   ========================================================== */
(function(){
  var D = window.AETHEL; if(!D) return;
  var C = D.classes, H = {}, J = window.JEU || {heros: [], elements: {}, univers: {}, classes: {}};
  var CLMAP = {tank: 'tank', healer: 'healer', dps_phys: 'phys', dps_mag: 'mage', dps_range: 'portee', assassin: 'assassin'};
  var JH = {}; J.heros.forEach(function(j){ JH[j.id] = j; });
  D.heros.forEach(function(h){ var j = JH[h.id]; if(j){ h.cl = CLMAP[j.cl] || h.cl; h.ra = j.ra; h.j = j; } H[h.id] = h; });
  /* héros du jeu absents de la tier list : ajoutés sans tier */
  J.heros.forEach(function(j){ if(!H[j.id]){ var h = {id: j.id, nom: j.nom, cl: CLMAP[j.cl], ra: j.ra, t: '', j: j}; D.heros.push(h); H[j.id] = h; } });
  var TC = {S: 'var(--S)', A: 'var(--A)', B: 'var(--B)', C: 'var(--C)'};
  var ORDRE_CL = ['tank', 'healer', 'phys', 'mage', 'portee', 'assassin'];

  var ICO = {
    bouclier: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
    soin: '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/><path d="M12 10v5M9.5 12.5h5"/>',
    epee: '<path d="M14.5 4H20v5.5L10 19.5 4.5 14z"/><path d="M7 17l-3 3M5.5 12.5l6 6"/>',
    orbe: '<circle cx="12" cy="10" r="6"/><path d="M8 20h8M12 16v4M9.5 8.5a3 3 0 0 1 3-2"/>',
    arc: '<path d="M6 3c6 3 6 15 0 18"/><path d="M6 3v18M4 12h15M16 9l3 3-3 3"/>',
    dague: '<path d="M13 4l7-1-1 7-9 9-6-6z"/><path d="M8 13l3 3M5 19l-2 2"/>',
    etoile: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
    cible: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8"/>'
  };
  function svg(n, cl){ return '<svg viewBox="0 0 24 24"' + (cl ? ' class="' + cl + '"' : '') + ' aria-hidden="true">' + ICO[n] + '</svg>'; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function init(nom){ var m = nom.replace(/\./g, '').split(/[\s-]+/).filter(Boolean); return (m.length > 1 ? m[0][0] + m[m.length - 1][0] : nom.slice(0, 2)).toUpperCase(); }
  var TETES = D.heros.map(function(h){ return h.id; });
  function av(h, t, lead){
    var c = C[h.cl], img = TETES.indexOf(h.id) > -1;
    return '<span class="av' + (img ? ' tete' : '') + '" style="--c:' + c.coul + ';' + (h.ra ? '--r:var(--' + h.ra + ');' : '') + (t ? '--t:' + t + 'px' : '') + '" aria-hidden="true">' + (img ? '<img src="img/heros/' + h.id + '.webp" alt="" loading="lazy" width="160" height="160">' : init(h.nom)) + (lead ? '<span class="lead">LEAD</span>' : '') + '</span>';
  }
  function pCl(id){ var c = C[id]; return '<span class="cl" style="--c:' + c.coul + '">' + svg(c.ico) + esc(c.nom) + '</span>'; }
  function pRa(ra){ return ra ? '<span class="ra" style="--r:var(--' + ra + ')">' + ra + '</span>' : ''; }
  var COURT = {jinwoo: 'Jinwoo', law: 'Law', zoro: 'Zoro', ace: 'Ace', khun: 'Khun', thomas: 'Thomas', hancock: 'Hancock', yoo: 'Yoo Jinho', luffy: 'Luffy'};
  function court(h){ return COURT[h.id] || h.nom.split(' ')[0]; }
  function $(s, r){ return (r || document).querySelector(s); }

  /* ---------- Tier list ---------- */
  var fCl = '', fRa = '';
  function rendreTier(){
    var v = $('#v-tier');
    var h = '<h2>Tier list <small>' + D.heros.length + ' héros</small></h2>' +
      '<p class="intro">Classement d\'après les simulations (dégâts en Arène + réussite à l\'étage 9) et l\'utilité en équipe. Touche un héros pour voir ses runes et ses équipes.</p>' +
      '<div class="filtres" role="group" aria-label="Filtrer">' +
        '<button type="button" class="filtre" data-fcl="" aria-pressed="' + (fCl === '') + '">Toutes les classes</button>' +
        ORDRE_CL.map(function(k){ var c = C[k]; return '<button type="button" class="filtre" data-fcl="' + k + '" style="--c:' + c.coul + '" aria-pressed="' + (fCl === k) + '">' + svg(c.ico) + c.nom + '</button>'; }).join('') +
        '<span class="sep" aria-hidden="true"></span>' +
        ['UR', 'SSR', 'SR'].map(function(r){ return '<button type="button" class="filtre" data-fra="' + r + '" style="--c:var(--' + r + ')" aria-pressed="' + (fRa === r) + '">' + r + '</button>'; }).join('') +
      '</div>';
    var total = 0;
    ['S', 'A', 'B', 'C'].forEach(function(t){
      var L = D.heros.filter(function(x){ return x.t === t && (!fCl || x.cl === fCl) && (!fRa || x.ra === fRa); });
      total += L.length;
      var gros = t === 'S' || t === 'A';
      h += '<div class="tier" style="--tc:' + TC[t] + '"' + (L.length ? '' : ' hidden') + '><div class="t-lettre"><b>' + t + '</b><small>' + D.tiers[t] + '</small></div>' +
        (gros ? '<div class="t-heros">' + L.map(function(x){
          return '<button type="button" class="hc" data-h="' + x.id + '" style="--c:' + C[x.cl].coul + '">' + av(x) + '<span class="txt"><b>' + esc(x.nom) + '</b><span class="meta">' + pCl(x.cl) + pRa(x.ra) + '</span><p>' + esc(x.n) + '</p></span></button>';
        }).join('') + '</div>'
        : '<div class="t-mini">' + L.map(function(x){ return '<button type="button" class="hm" data-h="' + x.id + '" style="--c:' + C[x.cl].coul + '">' + av(x) + esc(x.nom) + '</button>'; }).join('') + '</div>') +
        '</div>';
    });
    if(!total) h += '<p class="aucun">Aucun héros avec ces filtres.</p>';
    h += '<div class="conseil">' + svg('etoile') + '<p><b>Pour monter un héros :</b> donne-lui du rang (doublons), puis du niveau (Essence d\'EXP), puis des runes.</p></div>';
    v.innerHTML = h;
  }

  /* ---------- Équipes ---------- */
  var tri = 'donjon', MAXA = Math.max.apply(null, D.equipes.map(function(e){ return e.arene; }));
  function k(n){ return n >= 1000 ? (n / 1000).toFixed(2).replace('.', ',').replace(/0$/, '') + ' M' : n + 'k'; }
  function rendreEquipes(){
    var L = D.equipes.slice().sort(tri === 'arene' ? function(a, b){ return b.arene - a.arene; } : function(a, b){ return b.d10[0] - a.d10[0] || b.d9[0] - a.d9[0]; });
    var h = '<h2>Meilleures équipes <small>niveau 40, runes « best »</small></h2>' +
      '<p class="intro">Le 1ᵉʳ héros est le chef (LEAD). Arène = dégâts en 90 s · D9 / D10 = % de victoires aux étages 9 et 10 du donjon.</p>' +
      '<div class="tri" role="group" aria-label="Trier"><button type="button" data-tri="donjon" aria-pressed="' + (tri === 'donjon') + '">Pour le donjon</button><button type="button" data-tri="arene" aria-pressed="' + (tri === 'arene') + '">Pour l\'Arène</button></div>' +
      '<div class="legende"><span><i></i>Runes « best »</span><span><i class="b"></i>Runes « basic »</span></div><div class="eqs">';
    L.forEach(function(e){
      var top = e.top === tri;
      h += '<article class="eq carte' + (top ? ' top' : '') + '" id="eq-' + e.l + '"><div class="eq-l">' + e.l + '</div>' +
        '<div class="eq-m">' + e.m.map(function(id, i){ var x = H[id]; return '<button type="button" data-h="' + id + '" title="' + esc(x.nom) + ' · ' + C[x.cl].nom + '">' + av(x, 0, i === 0) + esc(court(x)) + '</button>'; }).join('') + '</div>' +
        '<div class="eq-role">' + (top ? '<span class="tag">' + (tri === 'arene' ? 'Meilleure Arène sûre' : 'Meilleure pour le donjon') + '</span>' : '') + '<b>' + esc(e.role) + '</b></div>' +
        '<div class="eq-s">' +
          '<div class="st"><span>Arène</span><span class="jauge"><i style="width:' + (e.arene / MAXA * 100).toFixed(1) + '%;--g:linear-gradient(90deg,var(--or2),var(--or))"></i></span><b>' + k(e.arene) + '</b></div>' +
          ['d9', 'd10'].map(function(d){ return '<div class="st"><span>' + d.toUpperCase() + '</span><span class="jauge"><i style="width:' + e[d][0] + '%"></i><i class="basic" style="width:' + e[d][1] + '%"></i></span><b>' + e[d][0] + ' % <small>/ ' + e[d][1] + '</small></b></div>'; }).join('') +
        '</div></article>';
    });
    h += '</div><h2>Conseils</h2><div class="conseils">' + D.conseils.map(function(c){ return '<div class="cs carte"><b>' + c[0] + '</b><p>' + c[1] + '</p></div>'; }).join('') + '</div>';
    $('#v-equipes').innerHTML = h;
  }

  /* ---------- Runes ---------- */
  var rCl = 'tank';
  function plateau(r, coul){
    var fixe = {1: 'ATQ', 3: 'DÉF', 5: 'PV'}, choix = {2: r.e2, 4: r.e4, 6: r.e6};
    var s = '<svg viewBox="0 0 260 260" role="img" aria-label="Les 6 emplacements de runes"><circle cx="130" cy="130" r="88" fill="none" stroke="rgba(150,180,255,.18)" stroke-dasharray="3 7"/>' +
      '<circle cx="130" cy="130" r="30" fill="' + coul + '" opacity=".14"/><circle cx="130" cy="130" r="30" fill="none" stroke="' + coul + '" stroke-opacity=".6"/>';
    for(var i = 1; i <= 6; i++){
      var a = (-90 + (i - 1) * 60) * Math.PI / 180, x = 130 + Math.cos(a) * 88, y = 130 + Math.sin(a) * 88, on = !!choix[i];
      var pts = []; for(var j = 0; j < 6; j++){ var b = (j * 60 + 30) * Math.PI / 180; pts.push((x + Math.cos(b) * 30).toFixed(1) + ',' + (y + Math.sin(b) * 30).toFixed(1)); }
      s += '<polygon points="' + pts.join(' ') + '" fill="' + (on ? coul : '#1a2756') + '" fill-opacity="' + (on ? '.22' : '1') + '" stroke="' + (on ? coul : 'rgba(150,180,255,.25)') + '" stroke-width="1.5"/>' +
        '<text x="' + x.toFixed(1) + '" y="' + (y - 6).toFixed(1) + '" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="13" fill="' + (on ? '#fff' : '#7f8fb8') + '">' + i + '</text>' +
        '<text x="' + x.toFixed(1) + '" y="' + (y + 11).toFixed(1) + '" text-anchor="middle" font-family="Figtree" font-weight="700" font-size="' + (on ? 11 : 10) + '" fill="' + (on ? coul : '#7f8fb8') + '">' + esc(on ? choix[i] : fixe[i]) + '</text>';
    }
    return s + '<text x="130" y="134" text-anchor="middle" font-family="Figtree" font-weight="800" font-size="10" letter-spacing="1.5" fill="#cfe0ff">RUNES</text></svg>';
  }
  function rendreRunes(){
    var c = C[rCl], r = D.runes[rCl];
    var h = '<h2>Les meilleures runes par classe</h2>' +
      '<p class="intro">Les emplacements 1, 3 et 5 ont une stat fixe (ATQ, DÉF, PV plats). Tu choisis les emplacements <b>2, 4 et 6</b>.</p>' +
      '<div class="cl-tabs" role="group" aria-label="Classe">' + ORDRE_CL.map(function(kk){ var x = C[kk]; return '<button type="button" data-rcl="' + kk + '" style="--c:' + x.coul + '" aria-pressed="' + (kk === rCl) + '">' + svg(x.ico) + x.nom + '</button>'; }).join('') + '</div>' +
      '<div class="rune-grille" style="--c:' + c.coul + '"><div class="plateau carte">' + plateau(r, c.coul) + '</div>' +
      '<div class="rb carte">' +
        '<div><h3>Sets (dans l\'ordre)</h3><div class="sets">' + r.sets.map(function(s, i){ return (i ? '<span class="plus">+</span>' : '') + '<span class="set">' + esc(s) + '</span>'; }).join('') + '</div></div>' +
        '<div><h3>Stat principale</h3><div class="emps">' + [2, 4, 6].map(function(n){ return '<div class="emp"><small>Emp. ' + n + '</small><b>' + esc(r['e' + n]) + '</b></div>'; }).join('') + '</div></div>' +
        '<div><h3>Sous-stats à viser</h3><div class="sous-st">' + r.sous.map(function(s, i){ return '<span class="puce"><span class="n">' + (i + 1) + '</span>' + esc(s) + '</span>'; }).join('') + '</div></div>' +
        '<div class="obj">' + svg('cible') + '<span><b>Objectif ' + esc(c.nom) + ' :</b> ' + esc(c.objectif) + '</span></div>' +
      '</div></div>' +
      '<div class="deux"><div><h2>Sets d\'équipe <small>pour tous les alliés</small></h2><ul class="liste carte">' + D.setsEquipe.map(function(s){ return '<li><b>' + s[0] + '</b><span class="v">' + s[1] + '</span></li>'; }).join('') +
      '<li><span></span><span>Excellents sur le healer ou le tank.</span></li></ul></div>' +
      '<div><h2>Sets à effet</h2><ul class="liste carte">' + D.setsEffet.map(function(s){ return '<li><b>' + s[0] + '</b><span>' + s[1] + '</span></li>'; }).join('') + '</ul></div></div>' +
      '<h2>Priorités</h2><ol class="prio">' + D.priorites.map(function(p){ return '<li>' + p + '</li>'; }).join('') + '</ol>';
    $('#v-runes').innerHTML = h;
  }

  /* ---------- Classes ---------- */
  function rendreClasses(){
    var h = '<h2>Les 6 classes <small>ce que les runes améliorent</small></h2><div class="classes">' +
      ORDRE_CL.map(function(kk){ var c = C[kk];
        return '<article class="cc2 carte" style="--c:' + c.coul + '"><h3>' + svg(c.ico) + c.nom + '</h3><p>' + esc(c.passif) + '</p>' +
          '<dl><dt>Stats</dt><dd>' + esc(c.stats) + '</dd><dt>Objectif</dt><dd>' + esc(c.objectif) + '</dd></dl>' +
          '<button type="button" class="lien" data-voir-runes="' + kk + '">Voir ses runes →</button></article>';
      }).join('') + '</div>' +
      '<h2>Synergies d\'équipe <small>écran d\'équipe</small></h2><div class="syn">' + D.synergies.map(function(s){ return '<div class="sy carte"><b>' + s[0] + '</b><small>' + s[1] + '</small><span class="v">' + s[2] + '</span></div>'; }).join('') + '</div>' +
      '<p class="note">Le <b>1ᵉʳ héros</b> de l\'équipe est le chef : son talent Lead (badge LEAD) s\'applique.</p>' +
      '<h2>Éléments</h2><div class="els">' + D.elements.map(function(e){ return '<div class="el carte" style="--e:' + e[1] + '"><i aria-hidden="true"></i><span><b>' + e[0] + '</b><small>' + e[2] + '</small></span></div>'; }).join('') + '</div>' +
      '<p class="note">Un tank Ténèbres (Hatz, Agil, Igris) aide toute l\'équipe à frapper plus fort.</p>';
    $('#v-classes').innerHTML = h;
  }

  /* ---------- Donjons ---------- */
  function rendreDonjons(){
    var h = '<h2>Donjons de runes <small>étages 6 à 10</small></h2>' +
      '<p class="intro">Étages 1 à 5 : faciles. À partir de l\'étage 6, les ennemis gagnent beaucoup de PV, d\'ATQ et de DÉF.</p>' +
      '<div class="escalier">' + D.etages.map(function(e, i){
        return '<div class="marche carte' + (e[0] === 10 ? ' boss' : '') + '" style="--i:' + i + '"><span class="e"><small>Étage</small>' + e[0] + '</span><span class="n">Niveau ' + e[1] + '</span><p>' + esc(e[2]) + '</p></div>';
      }).join('') + '</div>' +
      '<h2>Étage 10 : résultats simulés <small>équipe « Tank + Healer + 2 DPS » solide</small></h2><div class="res">' +
      D.resultats10.map(function(r){ return '<div class="r10 carte" style="--k:' + (r[2] ? '#5fe0a0' : '#ff6b8b') + '"><span class="pc">' + (r[2] ? '~' : '') + r[0] + ' %</span><p>de victoires ' + esc(r[1]) + '</p></div>'; }).join('') + '</div>' +
      '<p class="note">Les étages hauts rapportent plus de runes, de meilleure rareté, et davantage de ★6.</p>' +
      '<h2>Pour monter un héros</h2><div class="monter">' +
        '<div class="mt carte"><b>Rang</b><small>Avec les doublons du héros.</small></div>' +
        '<div class="mt carte"><b>Niveau</b><small>Avec l\'Essence d\'EXP.</small></div>' +
        '<div class="mt carte"><b>Runes</b><small>Les bons sets de sa classe (onglet Runes).</small></div>' +
      '</div>';

    $('#v-donjons').innerHTML = h;
  }

  /* ---------- Outils « jeu » ---------- */
  function elP(id){ var e = J.elements[id]; return e ? '<span class="pe" style="--e:' + e.coul + '"><i></i>' + esc(e.nom) + '</span>' : ''; }
  function uniP(id){ var u = J.univers[id]; return u ? '<span class="pu" style="--u:' + u.coul + '">' + esc(u.nom) + '</span>' : ''; }
  function nb(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  /* le Lead du chef s'applique-t-il à ce héros ? */
  function touche(L, j){ return !!L && (L.s === 'all' || (L.s === 'uni' ? j.uni === L.u : j.el === L.e)); }
  function synergies(ids){
    var cl = ids.map(function(id){ return H[id].j.cl; });
    var n = function(c){ return cl.filter(function(x){ return x === c; }).length; };
    var dps = cl.filter(function(c){ return /^dps_|assassin/.test(c); }).length, nbCl = {}; cl.forEach(function(c){ nbCl[c] = 1; });
    return [
      {nom: 'Trinité', ok: !!(n('tank') && n('healer') && dps), txt: 'Tank + Healer + DPS', bonus: 'PV +8 % · DÉF +8 %', b: {pv: 8, def: 8},
       manque: [n('tank') ? '' : 'un Tank', n('healer') ? '' : 'un Healer', dps ? '' : 'un DPS'].filter(Boolean)},
      {nom: 'Assaut', ok: dps >= 3, txt: '3 DPS ou plus', bonus: 'ATQ +10 %', b: {atq: 10}, manque: dps >= 3 ? [] : [(3 - dps) + ' DPS de plus']},
      {nom: 'Équipe variée', ok: Object.keys(nbCl).length >= 4, txt: '4 classes différentes', bonus: 'VIT +8 %', b: {vit: 8}, manque: Object.keys(nbCl).length >= 4 ? [] : [(4 - Object.keys(nbCl).length) + ' classe(s) différente(s) de plus']}
    ];
  }
  var LST = {atkP: 'atq', defP: 'def', hpP: 'pv', spdP: 'vit'};
  function statsEquipe(ids){
    var L = ids.length && H[ids[0]].j.lead, syn = synergies(ids).filter(function(s){ return s.ok; });
    return ids.map(function(id){
      var j = H[id].j, pct = {pv: 0, atq: 0, def: 0, vit: 0}, flat = {cr: 0, cd: 0, res: 0};
      if(touche(L, j)) L.p.forEach(function(p){ if(LST[p[0]]) pct[LST[p[0]]] += p[1]; else flat[p[0]] += p[1]; });
      syn.forEach(function(s){ Object.keys(s.b).forEach(function(k){ pct[k] += s.b[k]; }); });
      var t = {pv: j.st.pv * (1 + pct.pv / 100), atq: j.st.atq * (1 + pct.atq / 100), def: j.st.def * (1 + pct.def / 100), vit: j.st.vit * (1 + pct.vit / 100),
        cr: Math.min(100, j.st.cr + flat.cr), cd: j.st.cd + flat.cd, res: Math.min(100, j.st.res + flat.res)};
      t.puiss = t.pv / 10 + t.atq * 1.2 + t.def + t.vit * 2 + t.cr * 2 + t.cd * 0.6;
      return {id: id, t: t, lead: touche(L, j)};
    });
  }

  /* ---------- Fiche héros ---------- */
  var fond = $('#fiche'), avant = null;
  function fiche(id){
    var x = H[id], c = C[x.cl], r = D.runes[x.cl], j = x.j;
    var eqs = D.equipes.filter(function(e){ return e.m.indexOf(id) > -1; });
    avant = document.activeElement;
    fond.innerHTML = '<div class="fiche" role="dialog" aria-modal="true" aria-labelledby="f-nom" style="--c:' + c.coul + ';--tc:' + (TC[x.t] || 'var(--C)') + '"><button type="button" class="f-x" aria-label="Fermer">×</button>' +
      '<div class="f-haut">' + (j ? '<div class="f-art" style="--e:' + J.elements[j.el].coul + '"><img src="img/heros/corps/' + id + '.webp" alt="" loading="lazy"></div>' : '') +
      '<div class="f-id"><h3 id="f-nom">' + esc(x.nom) + '</h3>' + (j ? '<p class="f-titre">' + esc(j.titre) + '</p>' : '') +
      '<div class="meta">' + pCl(x.cl) + pRa(x.ra) + (x.t ? '<span class="f-tier">Tier ' + x.t + '</span>' : '') + '</div>' +
      (j ? '<div class="meta">' + uniP(j.uni) + elP(j.el) + '</div>' +
        '<dl class="f-st"><div><dt>PV</dt><dd>' + nb(j.st.pv) + '</dd></div><div><dt>ATQ</dt><dd>' + nb(j.st.atq) + '</dd></div><div><dt>DÉF</dt><dd>' + nb(j.st.def) + '</dd></div><div><dt>VIT</dt><dd>' + j.st.vit + '</dd></div></dl><p class="f-niv">Niveau 40, sans runes.</p>' : '') +
      '<button type="button" class="b-ajout" data-ajout="' + id + '">+ Ajouter à mon équipe</button></div></div>' +
      (x.n ? '<p>' + esc(x.n) + '</p>' : '') +
      (j ? '<h4>Talent de chef (Lead)</h4><p class="' + (j.lead ? 'f-lead' : 'f-sans') + '">' + (j.lead ? '<b>' + esc(j.lead.txt) + '</b>' : 'Aucun talent de chef : évite de le mettre en 1ᵉʳ.') + '</p>' +
        '<h4>Compétences</h4><ol class="f-comp">' + j.comp.map(function(k, i){ return '<li><b>' + esc(k.n) + '</b><span class="f-cd">' + (i ? 'Recharge ' + k.cd + ' tours' : 'Attaque de base') + '</span><p>' + esc(k.d.replace(/\s*(Aucun temps de recharge|Recharge : \d+ tours)\.$/, '')) + '</p></li>'; }).join('') + '</ol>' : '') +
      '<h4>Passif de classe</h4><p>' + esc(c.passif) + '</p>' +
      '<h4>Runes conseillées</h4><p><b>' + r.sets.map(esc).join(' + ') + '</b><br>Emp. 2 : ' + esc(r.e2) + ' · Emp. 4 : ' + esc(r.e4) + ' · Emp. 6 : ' + esc(r.e6) + '<br>Objectif : ' + esc(c.objectif) + '</p>' +
      (eqs.length ? '<h4>Dans les équipes conseillées</h4><div class="f-eqs">' + eqs.map(function(e){ return '<button type="button" data-aller-eq="' + e.l + '"><span class="eq-l">' + e.l + '</span>' + (e.m[0] === id ? 'Chef · ' : '') + esc(e.role.split(/[.:(]/)[0]) + '</button>'; }).join('') + '</div>' : '') +
      '</div>';
    fond.hidden = false;
    fond.querySelector('.f-x').focus();
  }
  function fermer(){ fond.hidden = true; fond.innerHTML = ''; if(avant && avant.focus) avant.focus(); }
  fond.addEventListener('click', function(e){
    if(e.target === fond || e.target.closest('.f-x')) return fermer();
    var b = e.target.closest('[data-aller-eq]');
    if(b){ var l = b.dataset.allerEq; fermer(); montrer('equipes'); var el = document.getElementById('eq-' + l); if(el){ el.scrollIntoView({behavior: 'smooth', block: 'center'}); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); } return; }
    if((b = e.target.closest('[data-ajout]'))){ fermer(); ajouter(b.dataset.ajout, true); }
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !fond.hidden) fermer(); });

  /* ---------- Héros (catalogue) ---------- */
  var hf = {q: '', cl: '', el: '', uni: '', ra: ''};
  function norm(s){ return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function filtrer(f){
    var q = norm(f.q);
    return D.heros.filter(function(h){ var j = h.j || {};
      return (!f.cl || h.cl === f.cl) && (!f.el || j.el === f.el) && (!f.uni || j.uni === f.uni) && (!f.ra || h.ra === f.ra) && (!q || norm(h.nom).indexOf(q) > -1 || norm(j.titre || '').indexOf(q) > -1);
    }).sort(function(a, b){ return 'URSSRSR'.indexOf(a.ra) - 'URSSRSR'.indexOf(b.ra) || a.nom.localeCompare(b.nom); });
  }
  function barreFiltres(f, pre){
    var sel = function(k, lab, opts){ return '<select data-' + pre + '="' + k + '" aria-label="' + lab + '"><option value="">' + lab + '</option>' + opts.map(function(o){ return '<option value="' + o[0] + '"' + (f[k] === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; };
    return '<div class="hfiltres"><input type="search" data-' + pre + '="q" value="' + esc(f.q) + '" placeholder="Chercher un héros…" aria-label="Chercher un héros" autocomplete="off">' +
      sel('cl', 'Toutes les classes', ORDRE_CL.map(function(k){ return [k, C[k].nom]; })) +
      sel('el', 'Tous les éléments', Object.keys(J.elements).map(function(k){ return [k, J.elements[k].nom]; })) +
      sel('uni', 'Tous les univers', Object.keys(J.univers).map(function(k){ return [k, J.univers[k].nom]; })) +
      sel('ra', 'Toutes raretés', [['UR', 'UR'], ['SSR', 'SSR'], ['SR', 'SR']]) + '</div>';
  }
  function carteHeros(h, attr){
    var j = h.j || {}, e = J.elements[j.el] || {coul: '#5ec8ff'};
    return '<button type="button" class="hcard" ' + attr + ' style="--e:' + e.coul + ';--r:var(--' + h.ra + ')"><span class="hc-art"><img src="img/heros/corps/' + h.id + '.webp" alt="" loading="lazy"></span>' +
      '<span class="hc-ra">' + h.ra + '</span>' + (j.lead ? '<span class="hc-lead" title="A un talent de chef">★</span>' : '') +
      '<span class="hc-nom">' + esc(court(h)) + '</span><span class="hc-cl" style="--c:' + C[h.cl].coul + '">' + svg(C[h.cl].ico) + esc(C[h.cl].nom) + '</span></button>';
  }
  function rendreHeros(){
    var L = filtrer(hf);
    $('#v-heros').innerHTML = '<h2>Les héros <small>' + L.length + ' / ' + D.heros.length + '</small></h2>' +
      '<p class="intro">Touche un héros pour voir ses compétences, son talent de chef et ses stats. ★ = a un talent de chef.</p>' + barreFiltres(hf, 'hf') +
      (L.length ? '<div class="hgrille">' + L.map(function(h){ return carteHeros(h, 'data-h="' + h.id + '"'); }).join('') + '</div>' : '<p class="aucun">Aucun héros avec ces filtres.</p>');
  }
  function majFiltre(e, f, rendre){
    var k = e.target.dataset.hf || e.target.dataset.pf; if(!k) return false;
    f[k] = e.target.value; rendre();
    if(k === 'q'){ var i = e.target.closest('.vue').querySelector('[data-' + (e.target.dataset.hf ? 'hf' : 'pf') + '="q"]'); if(i){ i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
    return true;
  }
  $('#v-heros').addEventListener('input', function(e){ majFiltre(e, hf, rendreHeros); });

  /* ---------- Mon équipe (créateur) ---------- */
  var KEQ = 'optih-aethel-equipes', NEQ = 5, ME;
  try { ME = JSON.parse(localStorage.getItem(KEQ) || 'null'); } catch(e){ ME = null; }
  if(!ME || !Array.isArray(ME.t)) ME = {cur: 0, t: []};
  for(var qi = 0; qi < NEQ; qi++){ if(!Array.isArray(ME.t[qi])) ME.t[qi] = []; ME.t[qi] = ME.t[qi].filter(function(id){ return H[id]; }).slice(0, 4); }
  var lienEq = new URLSearchParams(location.search).get('equipe');
  if(lienEq){ ME.t[ME.cur] = lienEq.split(',').filter(function(id, i, a){ return H[id] && a.indexOf(id) === i; }).slice(0, 4); }
  function sauver(){ try { localStorage.setItem(KEQ, JSON.stringify(ME)); } catch(e){} }
  var pf = {q: '', cl: '', el: '', uni: '', ra: ''};
  function eq(){ return ME.t[ME.cur]; }
  function ajouter(id, aller){
    var t = eq();
    if(t.indexOf(id) > -1){ t.splice(t.indexOf(id), 1); }
    else if(t.length < 4){ t.push(id); }
    else { message('L\'équipe est pleine (4 héros). Retire quelqu\'un d\'abord.'); }
    sauver(); rendreEquipe();
    if(aller){ montrer('equipe', true); scrollTo({top: $('.entete').offsetHeight - 4, behavior: 'smooth'}); }
  }
  var msgT;
  function message(t){ var m = $('#eq-msg'); if(!m) return; m.textContent = t; m.hidden = false; clearTimeout(msgT); msgT = setTimeout(function(){ m.hidden = true; }, 2600); }
  function meilleurChef(ids){
    var best = null;
    ids.forEach(function(id){ var L = H[id].j.lead; if(!L) return;
      var n = ids.filter(function(o){ return touche(L, H[o].j); }).length, sc = n * L.p.reduce(function(s, p){ return s + p[1]; }, 0);
      if(!best || sc > best.sc) best = {id: id, sc: sc, n: n}; });
    return best;
  }
  function rendreEquipe(){
    var t = eq(), L = t.length ? H[t[0]].j.lead : null, S = statsEquipe(t), syn = synergies(t);
    var h = '<h2>Mon équipe <small>4 héros · le 1ᵉʳ est le chef</small></h2>' +
      '<p class="intro">Choisis tes héros dans la liste en dessous. Le héros en <b>1ᵉʳ</b> est le <b>chef</b> : son talent (Lead) s\'applique à l\'équipe. Tes équipes sont gardées sur cet appareil.</p>' +
      '<div class="eq-onglets" role="tablist" aria-label="Mes équipes">' + ME.t.map(function(x, i){ return '<button type="button" role="tab" data-eqi="' + i + '" aria-selected="' + (i === ME.cur) + '">Équipe ' + (i + 1) + '<small>' + x.length + '/4</small></button>'; }).join('') + '</div>' +
      '<div class="mon-eq"><div class="slots">';
    for(var i = 0; i < 4; i++){
      var id = t[i], x = id && H[id];
      if(!x){ h += '<div class="slot vide' + (i === 0 ? ' chef' : '') + '">' + (i === 0 ? '<span class="s-chef">Chef</span>' : '') + '<span class="s-plus">+</span><small>' + (i === 0 ? 'Le chef d\'équipe' : 'Héros ' + (i + 1)) + '</small></div>'; continue; }
      var st = S[i].t, j = x.j;
      h += '<div class="slot' + (i === 0 ? ' chef' : '') + '" style="--e:' + J.elements[j.el].coul + ';--c:' + C[x.cl].coul + '">' + (i === 0 ? '<span class="s-chef">Chef</span>' : '') +
        '<button type="button" class="s-x" data-retire="' + id + '" aria-label="Retirer ' + esc(x.nom) + '">×</button>' +
        '<button type="button" class="s-art" data-h="' + id + '"><img src="img/heros/corps/' + id + '.webp" alt="' + esc(x.nom) + '"></button>' +
        '<b>' + esc(court(x)) + '</b><span class="s-meta">' + pCl(x.cl) + '</span><span class="s-meta">' + elP(j.el) + pRa(x.ra) + '</span>' +
        (t.length && i > 0 ? '<span class="s-lead ' + (S[i].lead ? 'ok' : 'non') + '">' + (S[i].lead ? '✓ Bonus du chef' : (L ? '✗ Pas de bonus du chef' : '')) + '</span>' : '') +
        '<span class="s-st">' + nb(st.pv) + ' PV · ' + nb(st.atq) + ' ATQ<br>' + nb(st.def) + ' DÉF · ' + Math.round(st.vit) + ' VIT</span>' +
        '<span class="s-act">' + (i > 0 ? '<button type="button" data-chef="' + id + '">★ Chef</button>' : '') +
        (i > 0 ? '<button type="button" data-g="' + i + '" aria-label="Déplacer à gauche">◀</button>' : '') + (i < t.length - 1 ? '<button type="button" data-d="' + i + '" aria-label="Déplacer à droite">▶</button>' : '') + '</span></div>';
    }
    h += '</div><aside class="analyse carte">';
    if(!t.length){ h += '<p class="a-vide">Ajoute des héros pour voir le talent du chef, les synergies et les stats de l\'équipe.</p>'; }
    else {
      var chef = H[t[0]], mc = meilleurChef(t);
      h += '<h3>Talent du chef · ' + esc(chef.nom) + '</h3>' +
        (L ? '<p class="a-lead"><b>' + esc(L.txt) + '</b><br><small>' + S.filter(function(s){ return s.lead; }).length + ' héros sur ' + t.length + ' en profitent.</small></p>'
           : '<p class="a-warn">' + esc(chef.nom) + ' n\'a pas de talent de chef : l\'équipe ne reçoit aucun bonus.</p>');
      if(mc && mc.id !== t[0] && (!L || mc.sc > S.filter(function(s){ return s.lead; }).length * L.p.reduce(function(a, p){ return a + p[1]; }, 0)))
        h += '<p class="a-conseil">Conseil : mets <b>' + esc(H[mc.id].nom) + '</b> en chef (' + esc(H[mc.id].j.lead.txt) + '). <button type="button" data-chef="' + mc.id + '">Le mettre chef</button></p>';
      h += '<h3>Synergies</h3><ul class="a-syn">' + syn.map(function(s){ return '<li class="' + (s.ok ? 'ok' : '') + '"><b>' + s.nom + '</b><span>' + s.txt + ' → ' + s.bonus + '</span>' + (s.ok ? '<em>Active</em>' : '<small>Il manque ' + s.manque.join(', ') + '</small>') + '</li>'; }).join('') + '</ul>';
      var els = {}, unis = {}; t.forEach(function(id){ els[H[id].j.el] = 1; unis[H[id].j.uni] = 1; });
      var fort = Object.keys(els).map(function(e){ return J.elements[e].bat; }).filter(function(e, i, a){ return e && a.indexOf(e) === i; });
      h += '<h3>Éléments et univers</h3><p class="a-chips">' + Object.keys(els).map(elP).join('') + '</p>' +
        '<p class="a-fort">Fort contre : ' + (fort.length ? fort.map(elP).join('') : '—') + '</p><p class="a-chips">' + Object.keys(unis).map(uniP).join('') + '</p>';
      var P = S.reduce(function(s, x){ return s + x.t.puiss; }, 0);
      h += '<h3>Puissance de l\'équipe</h3><p class="a-p"><b>' + nb(P) + '</b><small>niveau 40, sans runes, chef et synergies compris</small></p>';
    }
    h += '<div class="a-act"><button type="button" class="b-sec2" data-lien>Copier le lien de l\'équipe</button><button type="button" class="b-sec2" data-vider>Vider</button>' +
      '<select data-conseil aria-label="Charger une équipe conseillée"><option value="">Charger une équipe conseillée…</option>' + D.equipes.map(function(e){ return '<option value="' + e.l + '">' + e.l + ' · ' + e.m.map(function(id){ return court(H[id]); }).join(', ') + '</option>'; }).join('') + '</select></div>' +
      '<p class="eq-msg" id="eq-msg" hidden></p></aside></div>' +
      '<h2>Choisir les héros <small>touche pour ajouter ou retirer</small></h2>' + barreFiltres(pf, 'pf');
    var Lp = filtrer(pf);
    h += Lp.length ? '<div class="hgrille petit">' + Lp.map(function(x){ var k = t.indexOf(x.id); return carteHeros(x, 'data-pick="' + x.id + '"' + (k > -1 ? ' aria-pressed="true" data-pos="' + (k === 0 ? 'Chef' : k + 1) + '"' : ' aria-pressed="false"')); }).join('') + '</div>' : '<p class="aucun">Aucun héros avec ces filtres.</p>';
    $('#v-equipe').innerHTML = h;
  }
  var ve = $('#v-equipe');
  ve.addEventListener('input', function(e){ majFiltre(e, pf, rendreEquipe); });
  ve.addEventListener('change', function(e){
    if(e.target.matches('[data-conseil]') && e.target.value){ var q = D.equipes.filter(function(x){ return x.l === e.target.value; })[0]; ME.t[ME.cur] = q.m.slice(); sauver(); rendreEquipe(); message('Équipe ' + q.l + ' chargée.'); }
  });
  ve.addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b || !ve.contains(b)) return;
    var t = eq(), d = b.dataset;
    if(d.pick){ return ajouter(d.pick); }
    if(d.eqi != null){ ME.cur = +d.eqi; sauver(); return rendreEquipe(); }
    if(d.retire){ t.splice(t.indexOf(d.retire), 1); sauver(); return rendreEquipe(); }
    if(d.chef){ t.splice(t.indexOf(d.chef), 1); t.unshift(d.chef); sauver(); rendreEquipe(); return message(H[d.chef].nom + ' est maintenant le chef.'); }
    if(d.g != null){ var i = +d.g, x = t[i]; t[i] = t[i - 1]; t[i - 1] = x; sauver(); return rendreEquipe(); }
    if(d.d != null){ var k = +d.d, y = t[k]; t[k] = t[k + 1]; t[k + 1] = y; sauver(); return rendreEquipe(); }
    if(d.vider != null){ ME.t[ME.cur] = []; sauver(); return rendreEquipe(); }
    if(d.lien != null){
      var u = location.origin + location.pathname + '?equipe=' + t.join(',') + '#equipe';
      if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(u).then(function(){ message('Lien copié : envoie-le à un ami !'); }, function(){ message(u); });
      else message(u);
    }
  });

  /* ---------- Onglets ---------- */
  /* ---------- Codes cadeaux ---------- */
  var KCODES = 'optih-aethel-codes', faits = {};
  try { (JSON.parse(localStorage.getItem(KCODES) || '[]') || []).forEach(function(c){ faits[c] = 1; }); } catch(e){}
  function rendreCodes(){
    var L = D.codes || [];
    $('#v-codes').innerHTML = '<h2>Codes cadeaux <small>' + L.length + ' codes</small></h2>' +
      '<p class="intro">Copie un code d\'un clic et colle-le dans le jeu. Coche « Utilisé » pour t\'en souvenir.</p>' +
      '<div class="codes">' + L.map(function(c){
        var u = !!faits[c[0]];
        return '<div class="code carte' + (u ? ' utilise' : '') + '"><code>' + esc(c[0]) + '</code><p>' + esc(c[1]) + '</p>' +
          '<div class="code-act"><button type="button" class="b-copie" data-copie="' + esc(c[0]) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg><span>Copier</span></button>' +
          '<label class="vu"><input type="checkbox" data-vu="' + esc(c[0]) + '"' + (u ? ' checked' : '') + '>Utilisé</label></div></div>';
      }).join('') + '</div>';
  }
  function copier(txt, b){
    var ok = function(){ var sp = b.querySelector('span'); sp.textContent = 'Copié !'; b.classList.add('ok'); setTimeout(function(){ sp.textContent = 'Copier'; b.classList.remove('ok'); }, 1500); };
    if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, ok);
    else { var t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch(e){} t.remove(); ok(); }
  }
  $('#v-codes').addEventListener('click', function(e){ var b = e.target.closest('[data-copie]'); if(b) copier(b.dataset.copie, b); });
  $('#v-codes').addEventListener('change', function(e){
    var c = e.target.dataset.vu; if(!c) return;
    if(e.target.checked) faits[c] = 1; else delete faits[c];
    try { localStorage.setItem(KCODES, JSON.stringify(Object.keys(faits))); } catch(er){}
    e.target.closest('.code').classList.toggle('utilise', e.target.checked);
  });

  var VUES = ['equipe', 'heros', 'tier', 'equipes', 'runes', 'classes', 'donjons', 'codes'];
  function montrer(v, pousser){
    if(VUES.indexOf(v) < 0) v = 'equipe';
    VUES.forEach(function(x){ $('#v-' + x).hidden = x !== v; });
    [].forEach.call(document.querySelectorAll('.as-tabs [data-v]'), function(b){ b.setAttribute('aria-selected', b.dataset.v === v); });
    if(pousser) history.replaceState(null, '', '#' + v);
  }
  $('.as-tabs').addEventListener('click', function(e){ var b = e.target.closest('[data-v]'); if(b){ montrer(b.dataset.v, true); var o = $('.as-tabs'); if(o.getBoundingClientRect().top < 60) scrollTo({top: $('.entete').offsetHeight - 4, behavior: 'smooth'}); } });

  document.querySelector('main').addEventListener('click', function(e){
    var b;
    if((b = e.target.closest('[data-h]'))) return fiche(b.dataset.h);
    if((b = e.target.closest('[data-fcl]'))){ fCl = b.dataset.fcl; return rendreTier(); }
    if((b = e.target.closest('[data-fra]'))){ fRa = fRa === b.dataset.fra ? '' : b.dataset.fra; return rendreTier(); }
    if((b = e.target.closest('[data-tri]'))){ tri = b.dataset.tri; return rendreEquipes(); }
    if((b = e.target.closest('[data-rcl]'))){ rCl = b.dataset.rcl; return rendreRunes(); }
    if((b = e.target.closest('[data-voir-runes]'))){ rCl = b.dataset.voirRunes; rendreRunes(); montrer('runes', true); scrollTo({top: $('.entete').offsetHeight - 4, behavior: 'smooth'}); }
  });

  rendreEquipe(); rendreHeros(); rendreTier(); rendreEquipes(); rendreRunes(); rendreClasses(); rendreDonjons(); rendreCodes();
  $('#maj').textContent = 'Guide mis à jour le ' + D.maj + '.';
  montrer(location.hash.slice(1));
  addEventListener('hashchange', function(){ montrer(location.hash.slice(1)); });
})();
