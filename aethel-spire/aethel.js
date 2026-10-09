/* ==========================================================
   AETHEL SPIRE — le guide du joueur
   Héros : data-jeu.js (window.JEU) · Guide : data-guide.js (window.GUIDE)
   ========================================================== */
(function(){
  var J = window.JEU, G = window.GUIDE; if(!J || !G) return;
  var H = {}; J.heros.forEach(function(h){ H[h.id] = h; });
  var SETS = {}; J.sets.forEach(function(s){ SETS[s.id] = s; });
  var ORDRE_CL = G.ordreClasses;
  var CL = {
    tank: {coul: '#4aa3ff', ico: 'bouclier'}, healer: {coul: '#4fd18b', ico: 'soin'}, dps_phys: {coul: '#ff6a5f', ico: 'epee'},
    dps_mag: {coul: '#a77bff', ico: 'orbe'}, dps_range: {coul: '#38c6e0', ico: 'arc'}, assassin: {coul: '#f2b33d', ico: 'dague'}
  };
  ORDRE_CL.forEach(function(k){ CL[k].nom = G.nomsClasses[k]; });

  var ICO = {
    bouclier: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
    soin: '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/><path d="M12 10v5M9.5 12.5h5"/>',
    epee: '<path d="M14.5 4H20v5.5L10 19.5 4.5 14z"/><path d="M7 17l-3 3M5.5 12.5l6 6"/>',
    orbe: '<circle cx="12" cy="10" r="6"/><path d="M8 20h8M12 16v4M9.5 8.5a3 3 0 0 1 3-2"/>',
    arc: '<path d="M6 3c6 3 6 15 0 18"/><path d="M6 3v18M4 12h15M16 9l3 3-3 3"/>',
    dague: '<path d="M13 4l7-1-1 7-9 9-6-6z"/><path d="M8 13l3 3M5 19l-2 2"/>',
    etoile: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>'
  };
  function svg(n){ return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICO[n] + '</svg>'; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function nb(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function norm(s){ return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function $(s, r){ return (r || document).querySelector(s); }
  var COURT = {jinwoo: 'Jinwoo', law: 'Law', zoro: 'Zoro', ace: 'Ace', khun: 'Khun', thomas: 'Thomas', hancock: 'Hancock', yoo: 'Yoo Jinho', luffy: 'Luffy',
    mihawk: 'Mihawk', marco: 'Marco', evankhell: 'Evankhell', yuhansung: 'Yu Han Sung', limtaegyu: 'Lim Tae-Gyu', chopper: 'Chopper'};
  var POS = {laure: '100% 50%', esil: '76% 0%', mihawk: '42% 20%', sachi: '30% 0%', marco: '35% 0%', quant: '35% 0%'};
  function court(h){ return COURT[h.id] || h.nom.split(' ')[0]; }
  function pCl(k){ var c = CL[k]; return '<span class="cl" style="--c:' + c.coul + '">' + svg(c.ico) + esc(c.nom) + '</span>'; }
  function pRa(ra){ return ra ? '<span class="ra" style="--r:var(--' + ra + ')">' + ra + '</span>' : ''; }
  function pEl(id){ var e = J.elements[id]; return e ? '<span class="pe" style="--e:' + e.coul + '"><i></i>' + esc(e.nom) + '</span>' : ''; }
  function pUni(id){ var u = J.univers[id]; return u ? '<span class="pu" style="--u:' + u.coul + '">' + esc(u.nom) + '</span>' : ''; }
  function tete(h, t, chef){
    return '<span class="av tete" style="--c:' + CL[h.cl].coul + ';--r:var(--' + h.ra + ');' + (t ? '--t:' + t + 'px' : '') + '" aria-hidden="true"><img src="img/heros/' + h.id + '.webp" alt="" loading="lazy" width="160" height="160">' + (chef ? '<span class="lead">CHEF</span>' : '') + '</span>';
  }
  function faibleContre(el){ return Object.keys(J.elements).filter(function(k){ return J.elements[k].bat === el; }); }
  var LBL = {hp: 'PV', atk: 'ATQ', def: 'DÉF', spd: 'VIT', cr: 'Taux Crit', cd: 'Dég. Crit', res: 'RÉS'};
  function bonusTxt(b){ return Object.keys(b).map(function(k){ return LBL[k] + ' +' + b[k] + (k === 'res' ? '' : ' %'); }).join(' · '); }
  function liensDe(id){ return ((G.liens && G.liens.liste) || []).filter(function(l){ return l[1].indexOf(id) > -1; }); }
  function setChip(id){ var s = SETS[id]; return s ? '<span class="setc" style="--s:' + s.c + '" title="' + esc(s.d) + '"><i>' + s.e + '</i>' + esc(s.nom) + '</span>' : ''; }
  function ouSet(id){ for(var i = 0; i < G.farmSets.length; i++) if(G.farmSets[i][2].indexOf(id) > -1) return G.farmSets[i]; return null; }

  /* ---------- règles d'équipe ---------- */
  function touche(L, h){ return !!L && (L.s === 'all' || (L.s === 'uni' ? h.uni === L.u : h.el === L.e)); }
  function synergies(ids){
    var cl = ids.map(function(id){ return H[id].cl; });
    var n = function(c){ return cl.filter(function(x){ return x === c; }).length; };
    var dps = cl.filter(function(c){ return /^dps_|assassin/.test(c); }).length, nbCl = {}; cl.forEach(function(c){ nbCl[c] = 1; });
    var div = Object.keys(nbCl).length;
    return [
      {nom: 'Trinité', ok: !!(n('tank') && n('healer') && dps), txt: 'Tank + Healer + DPS', bonus: 'PV +8 % · DÉF +8 %', b: {pv: 8, def: 8},
       manque: [n('tank') ? '' : 'un Tank', n('healer') ? '' : 'un Healer', dps ? '' : 'un DPS'].filter(Boolean)},
      {nom: 'Assaut', ok: dps >= 3, txt: '3 DPS ou plus', bonus: 'ATQ +10 %', b: {atq: 10}, manque: dps >= 3 ? [] : [(3 - dps) + ' DPS de plus']},
      {nom: 'Équipe variée', ok: div >= 4, txt: '4 classes différentes', bonus: 'VIT +8 %', b: {vit: 8}, manque: div >= 4 ? [] : [(4 - div) + ' classe(s) différente(s) de plus']}
    ];
  }
  var LST = {atkP: 'atq', defP: 'def', hpP: 'pv', spdP: 'vit'};
  function statsEquipe(ids){
    var L = ids.length && H[ids[0]].lead, syn = synergies(ids).filter(function(s){ return s.ok; });
    return ids.map(function(id){
      var j = H[id], pct = {pv: 0, atq: 0, def: 0, vit: 0}, flat = {cr: 0, cd: 0, res: 0};
      if(touche(L, j)) L.p.forEach(function(p){ if(LST[p[0]]) pct[LST[p[0]]] += p[1]; else if(p[0] in flat) flat[p[0]] += p[1]; });
      syn.forEach(function(s){ Object.keys(s.b).forEach(function(k){ pct[k] += s.b[k]; }); });
      var t = {pv: j.st.pv * (1 + pct.pv / 100), atq: j.st.atq * (1 + pct.atq / 100), def: j.st.def * (1 + pct.def / 100), vit: j.st.vit * (1 + pct.vit / 100),
        cr: Math.min(100, j.st.cr + flat.cr), cd: j.st.cd + flat.cd, res: Math.min(100, j.st.res + flat.res)};
      t.puiss = t.pv / 10 + t.atq * 1.2 + t.def + t.vit * 2 + t.cr * 2 + t.cd * 0.6;
      return {id: id, t: t, lead: touche(L, j)};
    });
  }

  /* ---------- liste de héros ---------- */
  function filtrer(f){
    var q = norm(f.q);
    return J.heros.filter(function(h){
      return (!f.cl || h.cl === f.cl) && (!f.el || h.el === f.el) && (!f.uni || h.uni === f.uni) && (!f.ra || h.ra === f.ra) && (!q || norm(h.nom).indexOf(q) > -1 || norm(h.titre || '').indexOf(q) > -1);
    }).sort(function(a, b){ return ['UR', 'SSR', 'SR'].indexOf(a.ra) - ['UR', 'SSR', 'SR'].indexOf(b.ra) || a.nom.localeCompare(b.nom); });
  }
  function barreFiltres(f, pre){
    var sel = function(k, lab, opts){ return '<select data-' + pre + '="' + k + '" aria-label="' + lab + '"><option value="">' + lab + '</option>' + opts.map(function(o){ return '<option value="' + o[0] + '"' + (f[k] === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; };
    return '<div class="hfiltres"><input type="search" data-' + pre + '="q" value="' + esc(f.q) + '" placeholder="Chercher un héros…" aria-label="Chercher un héros" autocomplete="off">' +
      sel('cl', 'Toutes les classes', ORDRE_CL.map(function(k){ return [k, CL[k].nom]; })) +
      sel('el', 'Tous les éléments', Object.keys(J.elements).map(function(k){ return [k, J.elements[k].nom]; })) +
      sel('uni', 'Tous les univers', Object.keys(J.univers).map(function(k){ return [k, J.univers[k].nom]; })) +
      sel('ra', 'Toutes raretés', [['UR', 'UR'], ['SSR', 'SSR'], ['SR', 'SR']]) + '</div>';
  }
  function carteHeros(h, attr){
    var e = J.elements[h.el] || {coul: '#5ec8ff'};
    return '<button type="button" class="hcard" ' + attr + ' style="--e:' + e.coul + ';--r:var(--' + h.ra + ')"><span class="hc-art"><img src="img/heros/corps/' + h.id + '.webp" alt="" loading="lazy"' + (POS[h.id] ? ' style="object-position:' + POS[h.id] + '"' : '') + '></span>' +
      '<span class="hc-ra">' + h.ra + '</span>' + (h.lead ? '<span class="hc-lead" title="A un talent de chef">★</span>' : '') +
      '<span class="hc-nom">' + esc(court(h)) + '</span><span class="hc-cl" style="--c:' + CL[h.cl].coul + '">' + svg(CL[h.cl].ico) + esc(CL[h.cl].nom) + '</span></button>';
  }
  function majFiltre(e, f, rendre){
    var k = e.target.dataset.hf || e.target.dataset.pf; if(!k) return false;
    f[k] = e.target.value; rendre();
    if(k === 'q'){ var i = e.target.closest('.vue').querySelector('[data-' + (e.target.dataset.hf ? 'hf' : 'pf') + '="q"]'); if(i){ i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
    return true;
  }

  /* toutes les équipes conseillées, à plat */
  var EQS = []; G.equipes.forEach(function(c, ci){ c.liste.forEach(function(e){ e.ci = ci; EQS.push(e); }); });
  function eqParNom(n){ return EQS.filter(function(e){ return e.nom === n; })[0]; }

  /* ---------- Fiche héros ---------- */
  var fond = $('#fiche'), avant = null;
  function fiche(id){
    var h = H[id], c = CL[h.cl], b = G.builds[h.cl], el = J.elements[h.el];
    var eqs = EQS.filter(function(e){ return e.m.indexOf(id) > -1; });
    avant = document.activeElement;
    fond.innerHTML = '<div class="fiche" role="dialog" aria-modal="true" aria-labelledby="f-nom" style="--c:' + c.coul + '"><button type="button" class="f-x" aria-label="Fermer">×</button>' +
      '<div class="f-haut"><div class="f-art" style="--e:' + el.coul + '"><img src="img/heros/corps/' + id + '.webp" alt="" loading="lazy"></div>' +
      '<div class="f-id"><h3 id="f-nom">' + esc(h.nom) + '</h3><p class="f-titre">' + esc(h.titre) + '</p>' +
      '<div class="meta">' + pCl(h.cl) + pRa(h.ra) + '</div><div class="meta">' + pUni(h.uni) + pEl(h.el) + '</div>' +
      '<dl class="f-st"><div><dt>PV</dt><dd>' + nb(h.st.pv) + '</dd></div><div><dt>ATQ</dt><dd>' + nb(h.st.atq) + '</dd></div><div><dt>DÉF</dt><dd>' + nb(h.st.def) + '</dd></div><div><dt>VIT</dt><dd>' + h.st.vit + '</dd></div></dl><p class="f-niv">Niveau 40, sans runes (jusqu\'au niveau 60 avec l\'Éveil forcé).</p>' +
      '<button type="button" class="b-ajout" data-ajout="' + id + '">+ Ajouter à mon équipe</button></div></div>' +
      '<h4>Talent de chef</h4><p class="' + (h.lead ? 'f-lead' : 'f-sans') + '">' + (h.lead ? '<b>' + esc(h.lead.txt) + '</b>' : 'Pas de talent de chef : ne le mets pas en 1ʳᵉ place.') + '</p>' +
      '<h4>Élément</h4><p class="f-elem">Fort contre : ' + (el.bat ? pEl(el.bat) : '—') + ' <span class="f-ou">·</span> Faible contre : ' + (faibleContre(h.el).map(pEl).join('') || '—') + '</p>' +
      '<h4>Runes conseillées</h4><div class="f-runes"><p><b>' + esc(b.best) + '</b> <span class="f-ou">ou</span> ' + esc(b.alt[0]) + '</p>' +
        '<p class="f-emp">Emp. 2 : <b>' + esc(b.e2[0]) + '</b> · Emp. 4 : <b>' + esc(b.e4[0]) + '</b> · Emp. 6 : <b>' + esc(b.e6[0]) + '</b></p>' +
        '<p class="f-sous">Sous-stats : ' + b.sous.map(esc).join(' › ') + '</p>' +
        '<button type="button" class="lien" data-voir-runes="' + h.cl + '">Tout le build ' + esc(c.nom) + ' →</button></div>' +
      '<h4>Compétences</h4><ol class="f-comp">' + h.comp.map(function(k, i){ return '<li><b>' + esc(k.n) + '</b><span class="f-cd">' + (i ? 'Recharge ' + k.cd + ' tours' : 'Attaque de base') + '</span><p>' + esc(k.d.replace(/\s*(Aucun temps de recharge|Recharge : \d+ tours)\.$/, '')) + '</p></li>'; }).join('') + '</ol>' +
      (liensDe(id).length ? '<h4>Liens de héros</h4><div class="f-liens">' + liensDe(id).map(function(l){ return '<div class="f-lien"><b>' + esc(l[0]) + '</b><span class="bonus">' + bonusTxt(l[2]) + '</span><span class="f-lien-m">' + l[1].map(function(m){ return H[m] ? '<button type="button" data-h="' + m + '" title="' + esc(H[m].nom) + '">' + tete(H[m], 30) + '</button>' : ''; }).join('') + '</span></div>'; }).join('') + '</div><p class="f-niv">Bonus permanent quand tu possèdes tous les héros du lien.</p>' : '') +
      (eqs.length ? '<h4>Dans les équipes conseillées</h4><div class="f-eqs">' + eqs.map(function(e){ return '<button type="button" data-charger="' + esc(e.nom) + '">' + (e.m[0] === id ? '<span class="f-chef">Chef</span>' : '') + esc(e.nom) + '</button>'; }).join('') + '</div>' : '') +
      '</div>';
    fond.hidden = false;
    fond.querySelector('.f-x').focus();
  }
  function fermer(){ fond.hidden = true; fond.innerHTML = ''; if(avant && avant.focus) avant.focus(); }
  fond.addEventListener('click', function(e){
    if(e.target === fond || e.target.closest('.f-x')) return fermer();
    var b;
    if((b = e.target.closest('[data-charger]'))){ fermer(); return charger(b.dataset.charger); }
    if((b = e.target.closest('[data-ajout]'))){ fermer(); return ajouter(b.dataset.ajout, true); }
    if((b = e.target.closest('[data-h]'))){ return fiche(b.dataset.h); }
    if((b = e.target.closest('[data-voir-runes]'))){ fermer(); voirRunes(b.dataset.voirRunes); }
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !fond.hidden) fermer(); });

  /* ---------- Héros ---------- */
  var hf = {q: '', cl: '', el: '', uni: '', ra: ''};
  function rendreHeros(){
    var L = filtrer(hf);
    $('#v-heros').innerHTML = '<h2>Les héros <small>' + L.length + ' / ' + J.heros.length + '</small></h2>' +
      '<p class="intro">Touche un héros pour voir ses compétences, son talent de chef et ses runes. ★ = a un talent de chef.</p>' + barreFiltres(hf, 'hf') +
      (L.length ? '<div class="hgrille">' + L.map(function(h){ return carteHeros(h, 'data-h="' + h.id + '"'); }).join('') + '</div>' : '<p class="aucun">Aucun héros avec ces filtres.</p>');
  }
  $('#v-heros').addEventListener('input', function(e){ majFiltre(e, hf, rendreHeros); });

  /* ---------- Mon équipe ---------- */
  var KEQ = 'optih-aethel-equipes', NEQ = 5, ME;
  try { ME = JSON.parse(localStorage.getItem(KEQ) || 'null'); } catch(e){ ME = null; }
  if(!ME || !Array.isArray(ME.t)) ME = {cur: 0, t: []};
  if(!(ME.cur >= 0 && ME.cur < NEQ)) ME.cur = 0;
  for(var qi = 0; qi < NEQ; qi++){ if(!Array.isArray(ME.t[qi])) ME.t[qi] = []; ME.t[qi] = ME.t[qi].filter(function(id){ return H[id]; }).slice(0, 4); }
  var lienEq = new URLSearchParams(location.search).get('equipe');
  if(lienEq){ ME.t[ME.cur] = lienEq.split(',').filter(function(id, i, a){ return H[id] && a.indexOf(id) === i; }).slice(0, 4); }
  function sauver(){ try { localStorage.setItem(KEQ, JSON.stringify(ME)); } catch(e){} }
  var pf = {q: '', cl: '', el: '', uni: '', ra: ''};
  function eq(){ return ME.t[ME.cur]; }
  function haut(){ scrollTo({top: $('.entete').offsetHeight - 4, behavior: 'smooth'}); }
  function ajouter(id, aller){
    var t = eq();
    if(t.indexOf(id) > -1) t.splice(t.indexOf(id), 1);
    else if(t.length < 4) t.push(id);
    else message('L\'équipe est pleine (4 héros). Retire quelqu\'un d\'abord.');
    sauver(); rendreEquipe();
    if(aller){ montrer('equipe', true); haut(); }
  }
  function charger(nom){
    var q = eqParNom(nom); if(!q) return;
    ME.t[ME.cur] = q.m.slice(); sauver(); rendreEquipe(); montrer('equipe', true); haut();
    message('« ' + q.nom + ' » chargée dans l\'équipe ' + (ME.cur + 1) + '.');
  }
  var msgT;
  function message(t){ var m = $('#eq-msg'); if(!m) return; m.textContent = t; m.hidden = false; clearTimeout(msgT); msgT = setTimeout(function(){ m.hidden = true; }, 2800); }
  function meilleurChef(ids){
    var best = null;
    ids.forEach(function(id){ var L = H[id].lead; if(!L) return;
      var n = ids.filter(function(o){ return touche(L, H[o]); }).length, sc = n * L.p.reduce(function(s, p){ return s + p[1]; }, 0);
      if(!best || sc > best.sc) best = {id: id, sc: sc, n: n}; });
    return best;
  }
  function rendreEquipe(){
    var t = eq(), L = t.length ? H[t[0]].lead : null, S = statsEquipe(t), syn = synergies(t);
    var h = '<h2>Mon équipe <small>4 héros · le 1ᵉʳ est le chef</small></h2>' +
      '<p class="intro">Choisis tes héros dans la liste en dessous. Le héros en <b>1ʳᵉ place</b> est le <b>chef</b> : son talent s\'applique à l\'équipe. Tes équipes restent gardées sur cet appareil.</p>' +
      '<div class="eq-onglets" role="tablist" aria-label="Mes équipes">' + ME.t.map(function(x, i){ return '<button type="button" role="tab" data-eqi="' + i + '" aria-selected="' + (i === ME.cur) + '">Équipe ' + (i + 1) + '<small>' + x.length + '/4</small></button>'; }).join('') + '</div>' +
      '<div class="mon-eq"><div class="slots">';
    for(var i = 0; i < 4; i++){
      var id = t[i], x = id && H[id];
      if(!x){ h += '<div class="slot vide' + (i === 0 ? ' chef' : '') + '">' + (i === 0 ? '<span class="s-chef">Chef</span>' : '') + '<span class="s-plus">+</span><small>' + (i === 0 ? 'Le chef d\'équipe' : 'Héros ' + (i + 1)) + '</small></div>'; continue; }
      var st = S[i].t;
      h += '<div class="slot' + (i === 0 ? ' chef' : '') + '" style="--e:' + J.elements[x.el].coul + ';--c:' + CL[x.cl].coul + '">' + (i === 0 ? '<span class="s-chef">Chef</span>' : '') +
        '<button type="button" class="s-x" data-retire="' + id + '" aria-label="Retirer ' + esc(x.nom) + '">×</button>' +
        '<button type="button" class="s-art" data-h="' + id + '"><img src="img/heros/corps/' + id + '.webp" alt="' + esc(x.nom) + '"></button>' +
        '<b>' + esc(court(x)) + '</b><span class="s-meta">' + pCl(x.cl) + '</span><span class="s-meta">' + pEl(x.el) + pRa(x.ra) + '</span>' +
        (i > 0 ? '<span class="s-lead ' + (S[i].lead ? 'ok' : 'non') + '">' + (S[i].lead ? '✓ Bonus du chef' : (L ? '✗ Pas de bonus du chef' : '')) + '</span>' : '') +
        '<span class="s-st">' + nb(st.pv) + ' PV · ' + nb(st.atq) + ' ATQ<br>' + nb(st.def) + ' DÉF · ' + Math.round(st.vit) + ' VIT</span>' +
        '<span class="s-act">' + (i > 0 ? '<button type="button" data-chef="' + id + '">★ Chef</button>' : '') +
        (i > 0 ? '<button type="button" data-g="' + i + '" aria-label="Déplacer à gauche">◀</button>' : '') + (i < t.length - 1 ? '<button type="button" data-d="' + i + '" aria-label="Déplacer à droite">▶</button>' : '') + '</span></div>';
    }
    h += '</div><aside class="analyse carte">';
    if(!t.length){ h += '<p class="a-vide">Ajoute des héros, ou charge une équipe conseillée, pour voir le talent du chef, les synergies et la puissance de l\'équipe.</p>'; }
    else {
      var chef = H[t[0]], mc = meilleurChef(t), nL = S.filter(function(s){ return s.lead; }).length;
      h += '<h3>Talent du chef · ' + esc(court(chef)) + '</h3>' +
        (L ? '<p class="a-lead"><b>' + esc(L.txt) + '</b><br><small>' + nL + ' héros sur ' + t.length + ' en profitent.</small></p>'
           : '<p class="a-warn">' + esc(court(chef)) + ' n\'a pas de talent de chef : l\'équipe ne reçoit aucun bonus.</p>');
      if(mc && mc.id !== t[0] && (!L || mc.sc > nL * L.p.reduce(function(a, p){ return a + p[1]; }, 0)))
        h += '<p class="a-conseil">Conseil : mets <b>' + esc(court(H[mc.id])) + '</b> en chef (' + esc(H[mc.id].lead.txt) + '). <button type="button" data-chef="' + mc.id + '">Le mettre chef</button></p>';
      h += '<h3>Synergies</h3><ul class="a-syn">' + syn.map(function(s){ return '<li class="' + (s.ok ? 'ok' : '') + '"><b>' + s.nom + '</b><span>' + s.txt + ' → ' + s.bonus + '</span>' + (s.ok ? '<em>Active</em>' : '<small>Il manque ' + s.manque.join(', ') + '</small>') + '</li>'; }).join('') + '</ul>';
      var els = {}; t.forEach(function(id){ els[H[id].el] = 1; });
      var fort = Object.keys(els).map(function(e){ return J.elements[e].bat; }).filter(function(e, k, a){ return e && a.indexOf(e) === k; });
      h += '<h3>Éléments</h3><p class="a-chips">' + Object.keys(els).map(pEl).join('') + '</p>' +
        '<p class="a-fort">Fort contre : ' + (fort.length ? fort.map(pEl).join('') : '—') + '</p>';
      var P = S.reduce(function(s, y){ return s + y.t.puiss; }, 0);
      h += '<h3>Puissance de l\'équipe</h3><p class="a-p"><b>' + nb(P) + '</b><small>niveau 40, sans runes, chef et synergies compris</small></p>';
    }
    h += '<div class="a-act"><select data-conseil aria-label="Charger une équipe conseillée"><option value="">Charger une équipe conseillée…</option>' +
        G.equipes.map(function(c){ return '<optgroup label="' + esc(c.cat) + '">' + c.liste.map(function(e){ return '<option value="' + esc(e.nom) + '">' + esc(e.nom) + ' · ' + e.m.map(function(m){ return court(H[m]); }).join(', ') + '</option>'; }).join('') + '</optgroup>'; }).join('') + '</select>' +
      '<button type="button" class="b-sec2" data-lien>Copier le lien</button><button type="button" class="b-sec2" data-vider>Vider</button></div>' +
      '<p class="eq-msg" id="eq-msg" hidden></p></aside></div>' +
      '<h2>Choisir les héros <small>touche pour ajouter ou retirer</small></h2>' + barreFiltres(pf, 'pf');
    var Lp = filtrer(pf);
    h += Lp.length ? '<div class="hgrille petit">' + Lp.map(function(y){ var k = t.indexOf(y.id); return carteHeros(y, 'data-pick="' + y.id + '"' + (k > -1 ? ' aria-pressed="true" data-pos="' + (k === 0 ? 'Chef' : k + 1) + '"' : ' aria-pressed="false"')); }).join('') + '</div>' : '<p class="aucun">Aucun héros avec ces filtres.</p>';
    $('#v-equipe').innerHTML = h;
  }
  var ve = $('#v-equipe');
  ve.addEventListener('input', function(e){ majFiltre(e, pf, rendreEquipe); });
  ve.addEventListener('change', function(e){ if(e.target.matches('[data-conseil]') && e.target.value) charger(e.target.value); });
  ve.addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b || !ve.contains(b)) return;
    var t = eq(), d = b.dataset;
    if(d.pick) return ajouter(d.pick);
    if(d.eqi != null){ ME.cur = +d.eqi; sauver(); return rendreEquipe(); }
    if(d.retire){ t.splice(t.indexOf(d.retire), 1); sauver(); return rendreEquipe(); }
    if(d.chef){ t.splice(t.indexOf(d.chef), 1); t.unshift(d.chef); sauver(); rendreEquipe(); return message(court(H[d.chef]) + ' est maintenant le chef.'); }
    if(d.g != null){ var i = +d.g, x = t[i]; t[i] = t[i - 1]; t[i - 1] = x; sauver(); return rendreEquipe(); }
    if(d.d != null){ var k = +d.d, y = t[k]; t[k] = t[k + 1]; t[k + 1] = y; sauver(); return rendreEquipe(); }
    if(d.vider != null){ ME.t[ME.cur] = []; sauver(); return rendreEquipe(); }
    if(d.lien != null){
      if(!t.length) return message('L\'équipe est vide.');
      var u = location.origin + location.pathname + '?equipe=' + t.join(',') + '#equipe';
      if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(u).then(function(){ message('Lien copié : envoie-le à un ami !'); }, function(){ message(u); });
      else message(u);
    }
  });

  /* ---------- Équipes conseillées ---------- */
  var catEq = 0;
  function rendreEquipes(){
    var c = G.equipes[catEq];
    var h = '<h2>Équipes conseillées <small>le 1ᵉʳ héros est le chef</small></h2>' +
      '<p class="intro">Touche « Charger » pour la mettre dans Mon équipe, ou un héros pour voir sa fiche.</p>' +
      '<div class="pilules" role="group" aria-label="Catégorie">' + G.equipes.map(function(x, i){ return '<button type="button" data-cat="' + i + '" aria-pressed="' + (i === catEq) + '">' + esc(x.cat) + '<small>' + x.liste.length + '</small></button>'; }).join('') + '</div>' +
      (c.sous ? '<p class="sous-cat">' + esc(c.sous) + '</p>' : '') +
      (catEq === 0 && G.farm10 ? '<div class="encart carte"><div><h3>' + esc(G.farm10.titre) + '</h3><p class="encart-n">' + esc(G.farm10.note) + '</p></div><ul>' + G.farm10.points.map(function(p){ return '<li>' + p + '</li>'; }).join('') + '</ul><p class="encart-n">' + esc(G.farm10.fin) + '</p></div>' : '') +
      '<div class="eqc-grille">' + c.liste.map(function(e){
        return '<article class="eqc carte"><div class="eqc-tete"><div><h3>' + esc(e.nom) + '</h3>' + (e.ou ? '<span class="eqc-ou">' + esc(e.ou) + '</span>' : '') + '</div>' +
          '<button type="button" class="b-charger" data-charger="' + esc(e.nom) + '">Charger</button></div>' +
          '<div class="eqc-m">' + e.m.map(function(id, i){ var x = H[id]; return '<button type="button" data-h="' + id + '" title="' + esc(x.nom) + ' · ' + CL[x.cl].nom + '">' + tete(x, 0, i === 0) + '<span>' + esc(court(x)) + '</span></button>'; }).join('') + '</div>' +
          '<p>' + esc(e.txt) + '</p></article>';
      }).join('') + '</div>';
    $('#v-equipes').innerHTML = h;
  }

  /* ---------- Runes ---------- */
  var rCl = 'tank';
  function plateau(b, coul){
    var fixe = {1: 'ATQ', 3: 'DÉF', 5: 'PV'}, choix = {2: b.e2[0], 4: b.e4[0], 6: b.e6[0]};
    var s = '<svg viewBox="0 0 260 260" role="img" aria-label="Les 6 emplacements de runes"><circle cx="130" cy="130" r="88" fill="none" stroke="rgba(150,180,255,.18)" stroke-dasharray="3 7"/>' +
      '<circle cx="130" cy="130" r="30" fill="' + coul + '" opacity=".14"/><circle cx="130" cy="130" r="30" fill="none" stroke="' + coul + '" stroke-opacity=".6"/>';
    for(var i = 1; i <= 6; i++){
      var a = (-90 + (i - 1) * 60) * Math.PI / 180, x = 130 + Math.cos(a) * 88, y = 130 + Math.sin(a) * 88, on = !!choix[i];
      var pts = []; for(var j = 0; j < 6; j++){ var bb = (j * 60 + 30) * Math.PI / 180; pts.push((x + Math.cos(bb) * 30).toFixed(1) + ',' + (y + Math.sin(bb) * 30).toFixed(1)); }
      s += '<polygon points="' + pts.join(' ') + '" fill="' + (on ? coul : '#1a2756') + '" fill-opacity="' + (on ? '.22' : '1') + '" stroke="' + (on ? coul : 'rgba(150,180,255,.25)') + '" stroke-width="1.5"/>' +
        '<text x="' + x.toFixed(1) + '" y="' + (y - 6).toFixed(1) + '" text-anchor="middle" font-family="Cinzel" font-weight="900" font-size="13" fill="' + (on ? '#fff' : '#7f8fb8') + '">' + i + '</text>' +
        '<text x="' + x.toFixed(1) + '" y="' + (y + 11).toFixed(1) + '" text-anchor="middle" font-family="Figtree" font-weight="700" font-size="' + (on ? 11 : 10) + '" fill="' + (on ? coul : '#7f8fb8') + '">' + esc(on ? choix[i] : fixe[i]) + '</text>';
    }
    return s + '<text x="130" y="134" text-anchor="middle" font-family="Figtree" font-weight="800" font-size="10" letter-spacing="1.5" fill="#cfe0ff">RUNES</text></svg>';
  }
  function voirRunes(k){ rCl = k; rendreRunes(); montrer('runes', true); haut(); }
  function rendreRunes(){
    var c = CL[rCl], b = G.builds[rCl];
    var mH = J.heros.filter(function(x){ return x.cl === rCl; }).sort(function(a, z){ return ['UR', 'SSR', 'SR'].indexOf(a.ra) - ['UR', 'SSR', 'SR'].indexOf(z.ra) || a.nom.localeCompare(z.nom); });
    var groupes = [
      ['Sets 4 pièces', J.sets.filter(function(s){ return s.n === 4; })],
      ['Sets 2 pièces', J.sets.filter(function(s){ return s.n === 2 && !/tous les alliés/.test(s.d); })],
      ['Sets d\'équipe', J.sets.filter(function(s){ return /tous les alliés/.test(s.d); })]
    ];
    var h = '<h2>Les runes par classe</h2>' +
      '<p class="intro">Les emplacements 1, 3 et 5 ont une stat fixe (ATQ, DÉF, PV). Tu choisis les emplacements <b>2, 4 et 6</b>.</p>' +
      '<div class="cl-tabs" role="group" aria-label="Classe">' + ORDRE_CL.map(function(k){ var x = CL[k]; return '<button type="button" data-rcl="' + k + '" style="--c:' + x.coul + '" aria-pressed="' + (k === rCl) + '">' + svg(x.ico) + x.nom + '</button>'; }).join('') + '</div>' +
      '<div class="rune-grille" style="--c:' + c.coul + '"><div class="plateau carte">' + plateau(b, c.coul) + '</div>' +
      '<div class="rb carte">' +
        '<p class="rb-role">' + esc(b.role) + '</p>' +
        '<div><h3>Meilleur build</h3><p class="rb-best">' + esc(b.best) + '</p><p class="rb-alt">Ou : ' + b.alt.map(esc).join(' · ') + '</p></div>' +
        '<div><h3>Stat principale</h3><div class="emps">' + [2, 4, 6].map(function(n){ var e = b['e' + n]; return '<div class="emp"><small>Emp. ' + n + '</small><b>' + esc(e[0]) + '</b>' + (e[1] ? '<small>ou ' + esc(e[1]) + '</small>' : '') + '</div>'; }).join('') + '</div></div>' +
        '<div><h3>Sous-stats à viser</h3><div class="sous-st">' + b.sous.map(function(s, i){ return '<span class="puce"><span class="n">' + (i + 1) + '</span>' + esc(s) + '</span>'; }).join('') + '</div></div>' +
        '<p class="rb-why"><b>Pourquoi ?</b> ' + esc(b.pourquoi) + '</p>' +
      '</div></div>' +
      '<div class="mini-hs"><span>Les ' + esc(c.nom) + ' :</span>' + mH.map(function(x){ return '<button type="button" class="mini-h" data-h="' + x.id + '">' + tete(x, 26) + esc(court(x)) + '</button>'; }).join('') + '</div>' +
      '<h2>Les ' + J.sets.length + ' sets <small>et où les farmer</small></h2><div class="sets-g">' +
      groupes.map(function(g){ return '<div class="sets-bloc carte"><h3>' + g[0] + '</h3><ul>' + g[1].map(function(s){ var o = ouSet(s.id); return '<li style="--s:' + s.c + '"><i>' + s.e + '</i><span><b>' + esc(s.nom) + '</b><small>' + esc(s.d) + '</small></span>' + (o ? '<em style="--e:' + J.elements[o[1]].coul + '">' + esc(o[0]) + '</em>' : '') + '</li>'; }).join('') + '</ul></div>'; }).join('') + '</div>' +
      '<h2>Les 4 donjons de runes</h2><div class="donjons">' + G.farmSets.map(function(d){ return '<div class="dj carte" style="--e:' + J.elements[d[1]].coul + '"><h3>' + esc(d[0]) + '</h3>' + pEl(d[1]) + '<div class="dj-s">' + d[2].map(setChip).join('') + '</div></div>'; }).join('') + '</div>' +
      (G.outilsRunes ? '<h2>Outils de runes <span class="neuf">Nouveau</span></h2><div class="bases deux">' + G.outilsRunes.map(function(o){ return '<div class="base carte"><b>' + esc(o[0]) + '</b><p>' + o[1] + '</p></div>'; }).join('') + '</div>' : '') +
      '<h2>Conseils</h2><ol class="prio">' + G.conseilsRunes.map(function(p){ return '<li>' + p + '</li>'; }).join('') + '</ol>';
    $('#v-runes').innerHTML = h;
  }

  /* ---------- Valeurs des runes ---------- */
  function table(tete, lignes, o){
    o = o || {}; var hi = o.hi || [];
    return '<div class="tab-wrap"><table class="tab"><thead><tr>' + tete.map(function(t, i){ return '<th' + (hi.indexOf(i) > -1 ? ' class="hi"' : '') + '>' + t + '</th>'; }).join('') + '</tr></thead><tbody>' +
      lignes.map(function(l){ return '<tr>' + l.map(function(v, i){ return (i ? '<td' : '<th scope="row"') + (hi.indexOf(i) > -1 ? ' class="hi"' : '') + '>' + esc(v) + (i ? '</td>' : '</th>'); }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function rendreValeurs(){
    var et = ['Stat'].concat(G.etoiles);
    var h = '<h2>Valeurs des runes <small>montées à +15</small></h2>' +
      '<div class="cats">' + G.categories.map(function(c){ return '<span style="--k:' + c[2] + '"><b>' + esc(c[1]) + '</b>' + esc(c[0]) + '</span>'; }).join('') + '</div>' +
      '<div class="val-g">' +
        '<section class="val"><h3>Stat principale <small>à +15</small></h3>' + table(et, G.principale, {hi: [1]}) + '</section>' +
        '<section class="val"><h3>Sous-stats <small>valeur d\'un jet · ★7 : maximum</small></h3>' + table(et, G.sousStats, {hi: [1]}) + '</section>' +
      '</div>' +
      '<div class="val-g">' +
        '<section class="val"><h3>Stats possibles par emplacement</h3><div class="empl">' + G.emplacements.map(function(e){ return '<div><span class="empl-n">' + e[0] + '</span><span>' + e[1].map(esc).join(' · ') + '</span></div>'; }).join('') + '</div></section>' +
        '<section class="val"><h3>Jets de sous-stats <small>selon la catégorie</small></h3>' + table(['Catégorie', 'Au départ', 'Ajoutées', 'Bonus', 'Max'], G.jets) + '</section>' +
      '</div>' +
      '<div class="val-g">' +
        '<section class="val"><h3>Maximum théorique d\'une sous-stat</h3>' + table(['Stat', '★6', '★5'], G.maxTheorique, {hi: [1]}) + '</section>' +
        '<section class="val"><h3>Plafonds et règles</h3><ul class="notes">' + G.plafonds.map(function(p){ return '<li>' + p + '</li>'; }).join('') + '</ul></section>' +
      '</div>';
    $('#v-valeurs').innerHTML = h;
  }

  /* ---------- Débuter ---------- */
  function rendreDebuter(){
    var cy = G.cycle;
    var h = '<h2>Les bases</h2><div class="bases">' + G.bases.map(function(b, i){ return '<div class="base carte"><span class="base-n">' + (i + 1) + '</span><b>' + esc(b[0]) + '</b><p>' + b[1] + '</p></div>'; }).join('') + '</div>' +
      '<h2>Le cycle des éléments</h2><div class="cycle carte">' +
        cy.map(function(e, i){ return '<span class="cyc">' + pEl(e) + '</span><span class="fl" aria-hidden="true">→</span>' + (i === cy.length - 1 ? '<span class="cyc">' + pEl(cy[0]) + '</span>' : ''); }).join('') +
        '<span class="cyc-sep" aria-hidden="true"></span><span class="cyc">' + pEl('light') + '</span><span class="fl" aria-hidden="true">⇄</span><span class="cyc">' + pEl('dark') + '</span>' +
        '<p>La flèche veut dire « bat ». Lumière et Ténèbres se battent l\'un l\'autre.</p></div>' +
      '<h2>Farmer</h2><div class="bases trois">' + G.farm.map(function(f){ return '<div class="base carte"><b>' + esc(f[0]) + '</b><p>' + f[1] + '</p></div>'; }).join('') + '</div>' +
      '<div class="routine">' +
        '<div class="carte"><h3>Chaque jour</h3><ul>' + G.quotidien.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="carte"><h3>Chaque semaine</h3><ul>' + G.hebdo.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="carte"><h3>Chaque mois</h3><p>' + esc(G.mensuel) + '</p></div>' +
      '</div>' +
      '<h2>Invocations</h2><div class="invoc"><div class="taux carte">' + G.invocations.map(function(r){ return '<div style="--k:' + r[2] + '"><b>' + r[1] + '</b><span>' + r[0] + '</span></div>'; }).join('') + '</div>' +
        '<div class="bases deux">' + G.banniere.map(function(b){ return '<div class="base carte"><b>' + esc(b[0]) + '</b><p>' + esc(b[1]) + '</p></div>'; }).join('') + '</div></div>' +
      '<p class="astuce">' + svg('etoile') + '<span>' + esc(G.astuceInvoc) + '</span></p>';
    $('#v-debuter').innerHTML = h;
  }

  /* ---------- Modes de jeu ---------- */
  function rendreModes(){
    var d = G.difficile, t = G.tours;
    var h = '<h2>Histoire · Mode Difficile <small>120 étages</small></h2><p class="intro">' + esc(d.acces) + '</p>' +
      '<div class="mode carte"><p>' + d.regle + '</p><dl class="gains">' + d.gains.map(function(g){ return '<div><dt>' + esc(g[0]) + '</dt><dd>' + esc(g[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<div class="niv">' + d.niveau.map(function(n){ return '<span><b>' + esc(n[0]) + '</b>' + esc(n[1]) + '</span>'; }).join('') + '</div></div>' +
      '<h2>Tours d\'univers <small>4 × 40 étages</small></h2><p class="intro">' + esc(t.acces) + '</p>' +
      '<div class="tours">' + t.liste.map(function(x){ var u = J.univers[x[1]]; var hs = J.heros.filter(function(z){ return z.uni === x[1]; }).length;
        return '<div class="tour carte" style="--u:' + u.coul + '"><b>' + esc(x[0]) + '</b>' + pUni(x[1]) + '<small>' + hs + ' héros peuvent entrer</small></div>'; }).join('') + '</div>' +
      '<div class="mode carte"><p>' + t.regle + '</p><p>' + t.note + '</p>' +
      '<ul class="paliers">' + t.paliers.map(function(p){ return '<li><span>' + esc(p[0]) + '</span><b>' + esc(p[1]) + '</b></li>'; }).join('') + '</ul>' +
      '<div class="niv">' + t.niveau.map(function(n){ return '<span><b>' + esc(n[0]) + '</b>' + esc(n[1]) + '</span>'; }).join('') + '</div></div>';
    var dh = G.donjonsHaut;
    if(dh) h += '<h2 id="arc">Donjons de runes · Légende et Arc-en-ciel <span class="neuf">Nouveau</span></h2>' +
      '<div class="mode carte"><p><b>Légende 1 à 3</b> — ' + dh.legende + '</p></div>' +
      '<div class="mode carte arc"><p><b>Arc-en-ciel 14, 15 et 16</b> — ' + dh.arc + '</p><p>' + dh.butin + '</p>' +
      '<div class="chances">' + dh.chances.map(function(c){ return '<div><span><b>' + esc(c[0]) + '</b><small>' + esc(c[1]) + '</small></span><span class="jauge7"><i style="width:' + c[2] + '%"></i></span><b class="pc7">' + c[2] + ' %</b></div>'; }).join('') + '</div>' +
      '<p class="f-niv">Chance d\'obtenir une ★7, pour chaque rune gagnée.</p></div>';
    $('#v-modes').innerHTML = h;
  }

  /* ---------- Esprits & liens ---------- */
  var fLien = '';
  function rendreEsprits(){
    var e = G.esprits, L = G.liens;
    var ev = G.eveil, h = '';
    if(ev) h += '<h2>Éveil forcé · niveau 60 <span class="neuf">Nouveau</span></h2>' +
      '<div class="etapes">' + ev.etapes.map(function(x){ return '<div class="base carte"><span class="base-n">' + x[0] + '</span><b>' + esc(x[1]) + '</b><p>' + x[2] + '</p></div>'; }).join('') + '</div>' +
      '<p class="astuce">' + svg('etoile') + '<span>' + ev.exemple + '</span></p>' +
      '<div class="mode carte" style="margin-top:10px"><p><b>Doublons</b> — ' + ev.doublons + '</p></div>';
    h += '<h2>Esprits gardiens <small>' + esc(e.acces) + '</small></h2><p class="intro">' + e.regle + '</p>' +
      '<div class="esprits">' + e.liste.map(function(x){
        return '<div class="esp carte" style="--k:' + x[2] + '"><div class="esp-t"><i aria-hidden="true"></i><span><b>' + esc(x[0]) + '</b><small>' + esc(x[1]) + '</small></span></div>' +
          '<p class="esp-par">' + esc(x[3]) + '</p><ul><li><span>Niv. 5</span>' + esc(x[4]) + '</li><li><span>Niv. 10</span>' + esc(x[5]) + '</li></ul></div>'; }).join('') + '</div>' +
      '<div class="bases deux"><div class="base carte"><b>Coût</b><p>' + e.cout + '</p></div><div class="base carte"><b>Poussière d\'esprit</b><p>' + esc(e.source) + '</p></div></div>' +
      '<h2>Liens de héros <small>' + L.liste.length + ' liens</small></h2><p class="intro">' + L.regle + '</p>' +
      '<div class="pilules" role="group" aria-label="Univers"><button type="button" data-flien="" aria-pressed="' + (fLien === '') + '">Tous</button>' +
        Object.keys(J.univers).map(function(k){ return '<button type="button" data-flien="' + k + '" aria-pressed="' + (fLien === k) + '">' + esc(J.univers[k].nom) + '</button>'; }).join('') + '</div>' +
      '<div class="liens">' + L.liste.filter(function(l){ return !fLien || H[l[1][0]].uni === fLien; }).map(function(l){
        return '<div class="lien-c carte"><div class="lien-h"><b>' + esc(l[0]) + '</b><span class="bonus">' + bonusTxt(l[2]) + '</span></div><div class="lien-m">' +
          l[1].map(function(m){ var x = H[m]; return x ? '<button type="button" data-h="' + m + '" title="' + esc(x.nom) + '">' + tete(x, 44) + '<span>' + esc(court(x)) + '</span></button>' : ''; }).join('') + '</div></div>'; }).join('') + '</div>' +
      '<p class="f-niv">' + esc(L.acces) + '</p>';
    $('#v-esprits').innerHTML = h;
  }

  /* ---------- Bandeau « Nouveau » ---------- */
  function rendreNouveau(){
    var n = G.nouveau, el = $('#nouveau'); if(!n || !el) return;
    el.innerHTML = '<span class="nv-t"><b>Nouveau</b> · mise à jour « ' + esc(n.nom) + ' »</span>' +
      n.points.map(function(p){ return '<button type="button" data-aller="' + p[0] + '" title="' + esc(p[2]) + '">' + esc(p[1]) + '</button>'; }).join('');
    el.hidden = false;
  }

  /* ---------- Codes ---------- */
  var KCODES = 'optih-aethel-codes', faits = {};
  try { (JSON.parse(localStorage.getItem(KCODES) || '[]') || []).forEach(function(c){ faits[c] = 1; }); } catch(e){}
  function rendreCodes(){
    var L = G.codes || [];
    $('#v-codes').innerHTML = '<h2>Codes cadeaux <small>' + L.length + ' codes</small></h2>' +
      '<p class="intro">Copie un code d\'un clic et colle-le dans le jeu. Coche « Utilisé » pour t\'en souvenir.</p>' +
      '<div class="codes">' + L.map(function(c){
        var u = !!faits[c[0]];
        return '<div class="code carte' + (u ? ' utilise' : '') + '"><div class="code-h"><code>' + esc(c[0]) + '</code>' + (c[2] ? '<span class="nouveau">' + esc(c[2]) + '</span>' : '') + '</div><p>' + esc(c[1]) + '</p>' +
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

  /* ---------- Onglets ---------- */
  var VUES = ['equipe', 'heros', 'equipes', 'runes', 'valeurs', 'modes', 'esprits', 'debuter', 'codes'];
  function montrer(v, pousser){
    if(VUES.indexOf(v) < 0) v = 'equipe';
    VUES.forEach(function(x){ $('#v-' + x).hidden = x !== v; });
    [].forEach.call(document.querySelectorAll('.as-tabs [data-v]'), function(b){ b.setAttribute('aria-selected', b.dataset.v === v); });
    if(pousser) history.replaceState(null, '', location.pathname + location.search + '#' + v);
  }
  $('.as-tabs').addEventListener('click', function(e){ var b = e.target.closest('[data-v]'); if(b){ montrer(b.dataset.v, true); if($('.as-tabs').getBoundingClientRect().top < 60) haut(); } });

  document.querySelector('main').addEventListener('click', function(e){
    var b;
    if((b = e.target.closest('[data-h]'))) return fiche(b.dataset.h);
    if((b = e.target.closest('[data-rcl]'))){ rCl = b.dataset.rcl; return rendreRunes(); }
    if((b = e.target.closest('[data-flien]'))){ fLien = b.dataset.flien; return rendreEsprits(); }
    if((b = e.target.closest('[data-aller]'))){ var v = b.dataset.aller; if(v === 'progres') v = 'esprits'; if(v === 'modes' && /Arc/.test(b.textContent)){ montrer('modes', true); var a7 = $('#arc'); if(a7) a7.scrollIntoView({behavior: 'smooth', block: 'start'}); return; } if(v === 'runes'){ montrer('runes', true); var o = $('#v-runes h2 .neuf'); if(o) o.closest('h2').scrollIntoView({behavior: 'smooth', block: 'start'}); return; } montrer(v, true); return haut(); }
    if((b = e.target.closest('[data-cat]'))){ catEq = +b.dataset.cat; return rendreEquipes(); }
    if((b = e.target.closest('#v-equipes [data-charger]'))) return charger(b.dataset.charger);
  });

  rendreEquipe(); rendreHeros(); rendreEquipes(); rendreRunes(); rendreValeurs(); rendreModes(); rendreEsprits(); rendreDebuter(); rendreCodes(); rendreNouveau();
  $('#maj').textContent = J.heros.length + ' héros · guide mis à jour le ' + G.maj + '.';
  montrer(location.hash.slice(1));
  addEventListener('hashchange', function(){ montrer(location.hash.slice(1)); });
})();
