/* ==========================================================
   Wuthering Waves — « Ma team » : compose ta team de 3,
   vois ses caractéristiques et un indice d'entente sur 10.
   L'indice s'appuie sur les équipes conseillées de chaque perso
   (data-resonateurs.js) + les rôles couverts (DPS, soins, soutien).
   La team est gardée dans le navigateur.
   ========================================================== */
(function(){
  var R = window.RESONATEURS || [];
  var root = document.getElementById('equipe');
  if(!root || !R.length) return;

  var EL = {Aero:'#2f9e80',Fusion:'#d9573f',Glacio:'#3a93cf',Electro:'#8d5ccf',Spectro:'#b8932a',Havoc:'#a8436f'};
  var MA_TEAM = ['changli','lupa','shorekeeper'];
  var KEY = 'optih-wuwa-team';
  var by = {}; R.forEach(function(r){ by[r.s] = r; });

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function norm(s){ return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''); }
  function img(r){ return 'img/res/' + r.img + '.webp'; }
  function has(r, role){ return r.ro.indexOf(role) > -1; }
  function list(names){ return names.length < 2 ? names.join('') : names.slice(0,-1).join(', ') + ' et ' + names[names.length-1]; }

  /* Persos « passe-partout » : présents dans les équipes d'au moins 6 autres persos */
  var freq = {};
  R.forEach(function(r){ r.t.forEach(function(t){ t.m.forEach(function(m){ if(m.s && m.s !== r.s){ freq[m.s] = freq[m.s] || {}; freq[m.s][r.s] = 1; } }); }); });
  function flexible(s){ return freq[s] && Object.keys(freq[s]).length >= 6; }

  /* Deux persos sont-ils dans une même équipe conseillée ? */
  function together(a, b){
    function inTeams(x, y){ return x.t.some(function(t){ return t.m.some(function(m){ return m.s === y.s; }); }); }
    return inTeams(a, b) || inTeams(b, a);
  }
  function pairInfo(a, b){
    if(together(a, b)) return {pts:2, k:'ok', txt: a.n + ' et ' + b.n + ' sont dans une équipe conseillée.'};
    var f = flexible(a.s) ? a : flexible(b.s) ? b : null;
    if(f) return {pts:1, k:'mid', txt: f.n + ' va avec presque tout le monde.'};
    if(a.el === b.el) return {pts:.75, k:'mid', txt: a.n + ' et ' + b.n + ' partagent l\'élément ' + a.el + '.'};
    return {pts:0, k:'no', txt: a.n + ' et ' + b.n + ' ne sont dans aucune équipe conseillée.'};
  }
  function exactTeam(ms){
    if(ms.length < 3) return null;
    var ids = ms.map(function(r){ return r.s; }).sort().join();
    for(var i = 0; i < ms.length; i++){
      var t = ms[i].t.filter(function(t){ return t.m.map(function(m){ return m.s; }).sort().join() === ids; })[0];
      if(t) return {who: ms[i], t: t};
    }
    return null;
  }

  function evaluate(ids){
    var ms = ids.filter(Boolean).map(function(s){ return by[s]; });
    var pairs = [];
    for(var i = 0; i < ms.length; i++) for(var j = i + 1; j < ms.length; j++) pairs.push({a:ms[i], b:ms[j], p:pairInfo(ms[i], ms[j])});
    var syn = pairs.reduce(function(n, x){ return n + x.p.pts; }, 0);
    var dps = ms.filter(function(r){ return has(r,'DPS principal'); });
    var heal = ms.filter(function(r){ return has(r,'Soigneur'); });
    var shield = ms.filter(function(r){ return has(r,'Bouclier'); });
    var help = ms.filter(function(r){ return has(r,'Support') || has(r,'Buffeur') || has(r,'Sous-DPS'); });
    var roles = (dps.length ? 1.5 : 0) + (heal.length ? 1.5 : shield.length ? 1 : 0) + (help.filter(function(r){ return dps.length !== 1 || r !== dps[0]; }).length ? 1 : 0);
    var exact = exactTeam(ms);
    var score = Math.min(10, syn + roles);
    if(exact) score = Math.max(score, 9.5);
    score = Math.round(score * 2) / 2;
    return {ms:ms, pairs:pairs, dps:dps, heal:heal, shield:shield, help:help, exact:exact, score:score};
  }

  /* ---------- État ---------- */
  var team;
  try { team = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){ team = null; }
  if(!Array.isArray(team) || team.length !== 3) team = MA_TEAM.slice();
  /* team reçue par un lien partagé (?team=a,b,c) */
  var lien = new URLSearchParams(location.search).get('team');
  if(lien){ var t = lien.split(',').slice(0, 3); while(t.length < 3) t.push(null); team = t; }
  team = team.map(function(s){ return s && by[s] ? s : null; });
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(team)); } catch(e){} }

  var $ = function(sel){ return root.querySelector(sel); };
  var slotsBox = $('#eq-slots'), sumBox = $('#eq-resume'), pick = $('#eq-pick'), ideas = $('#eq-idees');
  var fEl = '', fQ = '';
  var PO = window.POSSEDES || {a:function(){return true;}, vide:function(){return true;}};
  var fMes = !PO.vide();
  function aMoi(s){ return PO.vide() || PO.a(s); }

  /* ---------- Emplacements ---------- */
  function renderSlots(){
    slotsBox.innerHTML = team.map(function(s, i){
      var r = s && by[s];
      if(!r) return '<li class="eq-slot vide"><span class="eq-num">0' + (i+1) + '</span><span class="eq-plus" aria-hidden="true">+</span><span class="eq-hint">Choisis un perso<br>dans la liste</span></li>';
      var w = r.wp[0] ? r.wp[0][0] : '—';
      return '<li class="eq-slot" style="--c:' + EL[r.el] + '">' +
        '<span class="eq-num">0' + (i+1) + '</span>' +
        '<button type="button" class="eq-remove" data-i="' + i + '" aria-label="Retirer ' + esc(r.n) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<span class="eq-pic"><img src="' + img(r) + '" alt="" width="300" height="412"></span>' +
        '<span class="eq-info"><strong>' + esc(r.n) + '</strong>' +
          '<span class="eq-tags"><span class="eq-el"><i></i>' + esc(r.el) + '</span><span>' + esc(r.ro.join(' · ')) + '</span></span>' +
          '<dl class="eq-stats">' +
            '<div><dt>Set</dt><dd>' + esc(r.set || '—') + '</dd></div>' +
            '<div><dt>Écho</dt><dd>' + esc(r.echo || 'Au choix') + '</dd></div>' +
            '<div><dt>Arme</dt><dd>' + esc(w) + '</dd></div>' +
          '</dl>' +
          '<a class="eq-fiche" href="#fiche-' + r.s + '">Voir la fiche</a></span></li>';
    }).join('');
  }

  /* ---------- Résumé + indice ---------- */
  function resume(k, v){ try { var s = JSON.stringify(v); if(localStorage.getItem(k) !== s) localStorage.setItem(k, s); } catch(e){} } /* résumé pour la carte de joueur (accueil) */
  function renderSummary(){
    var ev = evaluate(team), n = ev.ms.length;
    resume('optih-resume-wuwa', {t: ev.ms.map(function(r){ return [r.img, EL[r.el], r.n]; }), note: n === 3 ? ev.score : null});
    var verdict, cls, sub;
    if(!n){ verdict = 'Team vide'; cls = 'v-none'; sub = 'Choisis 3 persos dans la liste.'; }
    else if(n < 3){ verdict = 'Team incomplète'; cls = 'v-none'; sub = 'Encore ' + (3 - n) + ' perso' + (3 - n > 1 ? 's' : '') + ' à placer.'; }
    else if(ev.score >= 8){ verdict = 'Excellente entente'; cls = 'v-top'; sub = 'Rôles couverts et persos qui vont bien ensemble.'; }
    else if(ev.score >= 6){ verdict = 'Bonne entente'; cls = 'v-good'; sub = 'Ça tourne bien, il y a juste un détail à revoir.'; }
    else if(ev.score >= 4){ verdict = 'Entente moyenne'; cls = 'v-ok'; sub = 'Jouable, mais un rôle ou une synergie manque.'; }
    else { verdict = 'Team à revoir'; cls = 'v-bad'; sub = 'Ces persos ne se complètent pas vraiment.'; }

    var items = [];
    if(ev.exact) items.push(['ok', 'Équipe conseillée telle quelle pour ' + ev.exact.who.n + ' (« ' + ev.exact.t.l + ' »).']);
    if(n){
      if(ev.dps.length) items.push(['ok', 'DPS principal : ' + list(ev.dps.map(function(r){ return r.n; })) + '.']);
      else items.push(['warn', 'Pas de DPS principal : la team risque de manquer de dégâts.']);
      if(ev.heal.length) items.push(['ok', 'Soins : ' + list(ev.heal.map(function(r){ return r.n; })) + '.']);
      else if(ev.shield.length) items.push(['ok', 'Pas de soigneur, mais ' + list(ev.shield.map(function(r){ return r.n; })) + ' protège avec un bouclier.']);
      else if(n === 3) items.push(['warn', 'Personne ne soigne : pense à Shorekeeper, Verina ou Baizhi.']);
      if(ev.dps.length >= 3) items.push(['tip', '3 persos « DPS principal » : en quick swap ça passe, mais un vrai support aiderait.']);
    }
    var pairs = ev.pairs.map(function(x){
      var ico = x.p.k === 'ok' ? '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : x.p.k === 'mid' ? '<svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>';
      return '<li class="p-' + x.p.k + '"><span class="pi">' + ico + '</span><span class="pav"><img src="' + img(x.a) + '" alt=""><img src="' + img(x.b) + '" alt=""></span><span>' + esc(x.p.txt) + '</span></li>';
    }).join('');

    var els = {}; ev.ms.forEach(function(r){ els[r.el] = (els[r.el] || 0) + 1; });
    var elHTML = Object.keys(els).map(function(e){ return '<span class="eq-el" style="--c:' + EL[e] + '"><i></i>' + e + (els[e] > 1 ? ' ×' + els[e] : '') + '</span>'; }).join('');
    var pct = n ? ev.score * 10 : 0;

    sumBox.innerHTML =
      '<div class="eq-score ' + cls + '"><div class="eq-note"><b>' + (n === 3 ? String(ev.score).replace('.', ',') : '–') + '</b><small>/10</small></div>' +
        '<div><p class="eq-verdict">' + verdict + '</p><p class="eq-sub">' + sub + '</p></div></div>' +
      '<div class="eq-bar" role="img" aria-label="Indice ' + (n === 3 ? ev.score : 0) + ' sur 10"><i style="width:' + (n === 3 ? pct : 0) + '%"></i></div>' +
      (n ? '<div class="eq-carac">' +
        '<div><span class="lab">Rôles</span><span class="eq-roles"><span>DPS ' + ev.dps.length + '</span><span>Soutien ' + ev.help.filter(function(r){ return !has(r,'DPS principal'); }).length + '</span><span>Soins ' + ev.heal.length + '</span></span></div>' +
        '<div><span class="lab">Éléments</span><span class="eq-els">' + elHTML + '</span></div></div>' : '') +
      (pairs ? '<p class="lab eq-lab">Entente deux par deux</p><ul class="eq-pairs">' + pairs + '</ul>' : '') +
      (items.length ? '<ul class="eq-list">' + items.map(function(x){ return '<li class="' + x[0] + '">' + esc(x[1]) + '</li>'; }).join('') + '</ul>' : '') +
      '<p class="eq-how">L\'indice sur 10 vient des équipes conseillées pour chaque perso (6 points) et des rôles couverts : un DPS, des soins, un soutien (4 points). C\'est un repère, pas une règle : tes niveaux et tes échos comptent aussi.</p>';
  }

  /* ---------- Idées pour compléter ---------- */
  function renderIdeas(){
    var free = team.indexOf(null);
    var cur = team.filter(Boolean);
    if(free < 0 || !cur.length){ ideas.innerHTML = ''; ideas.hidden = true; return; }
    var best = R.filter(function(r){ return cur.indexOf(r.s) < 0 && aMoi(r.s); }).map(function(r){
      var t = team.slice(); t[free] = r.s; return {r:r, sc:evaluate(t).score + (evaluate(t).exact ? .5 : 0)};
    }).sort(function(a, b){ return b.sc - a.sc; }).slice(0, 5);
    ideas.hidden = false;
    ideas.innerHTML = '<span class="lab">Idées pour compléter' + (PO.vide() ? '' : ' (parmi tes persos)') + '</span><div class="eq-idea-row">' + best.map(function(x){
      return '<button type="button" class="eq-idea" data-s="' + x.r.s + '" style="--c:' + EL[x.r.el] + '"><img src="' + img(x.r) + '" alt=""><span>' + esc(x.r.n) + '</span></button>';
    }).join('') + '</div>';
  }

  /* ---------- Liste des persos ---------- */
  var chips = $('#eq-filtres');
  var mesBtn = document.createElement('button');
  mesBtn.type = 'button'; mesBtn.className = 'f-chip eq-mes'; mesBtn.textContent = 'Mes persos';
  chips.parentNode.insertBefore(mesBtn, chips);
  function majMes(){ mesBtn.setAttribute('aria-pressed', fMes ? 'true' : 'false'); mesBtn.hidden = PO.vide(); if(PO.vide()) fMes = false; }
  mesBtn.addEventListener('click', function(){ fMes = !fMes; majMes(); renderPick(); });
  document.addEventListener('possedes', function(){ if(!PO.vide() && !mesBtn.dataset.vu){ fMes = true; } mesBtn.dataset.vu = 1; majMes(); renderIdeas(); renderPick(); });
  majMes();
  chips.innerHTML = '<button type="button" class="f-chip" data-el="" aria-pressed="true">Tous</button>' + Object.keys(EL).sort().map(function(e){
    return '<button type="button" class="f-chip" data-el="' + e + '" aria-pressed="false"><i style="--c:' + EL[e] + '"></i>' + e + '</button>';
  }).join('');
  chips.addEventListener('click', function(e){
    var b = e.target.closest('.f-chip'); if(!b) return;
    fEl = b.dataset.el;
    [].forEach.call(chips.children, function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    renderPick();
  });
  $('#eq-search').addEventListener('input', function(){ fQ = norm(this.value.trim()); renderPick(); });

  function renderPick(){
    var full = team.indexOf(null) < 0;
    var l = R.filter(function(r){ return (!fEl || r.el === fEl) && (!fQ || norm(r.n).indexOf(fQ) > -1) && (!fMes || PO.a(r.s) || team.indexOf(r.s) > -1); });
    pick.innerHTML = l.map(function(r){
      var i = team.indexOf(r.s);
      return '<li><button type="button" class="eq-p' + (i > -1 ? ' pris' : '') + '" data-s="' + r.s + '" style="--c:' + EL[r.el] + '"' +
        (i > -1 ? ' aria-pressed="true" title="Retirer ' + esc(r.n) + '"' : (full ? ' title="Team complète : retire d\'abord un perso"' : ' title="Ajouter ' + esc(r.n) + '"')) + '>' +
        '<img src="' + img(r) + '" alt="" loading="lazy" width="300" height="412">' + (i > -1 ? '<b>' + (i+1) + '</b>' : '') +
        '<span>' + esc(r.n) + '</span></button></li>';
    }).join('') || '<li class="eq-rien">' + (fMes ? 'Aucun de tes persos ne correspond. Coche tes persos dans l\'onglet Résonateurs (« Je l\'ai »).' : 'Aucun perso trouvé.') + '</li>';
    pick.classList.toggle('plein', full);
  }

  function add(s){
    var i = team.indexOf(s);
    if(i > -1){ team[i] = null; }
    else { var f = team.indexOf(null); if(f < 0){ flash(); return; } team[f] = s; }
    update();
  }
  function flash(){ slotsBox.classList.remove('flash'); void slotsBox.offsetWidth; slotsBox.classList.add('flash'); }
  function update(){ save(); renderSlots(); renderSummary(); renderIdeas(); renderPick(); }

  pick.addEventListener('click', function(e){ var b = e.target.closest('.eq-p'); if(b) add(b.dataset.s); });
  ideas.addEventListener('click', function(e){ var b = e.target.closest('.eq-idea'); if(b) add(b.dataset.s); });
  slotsBox.addEventListener('click', function(e){ var b = e.target.closest('.eq-remove'); if(b){ team[+b.dataset.i] = null; update(); } });

  /* Teams toutes prêtes */
  $('#eq-presets').addEventListener('click', function(e){
    var b = e.target.closest('button[data-ids]'); if(!b) return;
    if(b.dataset.ids === '') team = [null, null, null];
    else team = b.dataset.ids.split(',');
    update();
  });

  /* Partager : lien qui ouvre cette team (Ma team et Dégâts) */
  var bp = document.getElementById('eq-partager');
  if(bp) bp.addEventListener('click', function(){
    var url = location.origin + location.pathname + '?team=' + team.map(function(s){ return s || ''; }).join(',') + '#equipe';
    function ok(){ bp.textContent = 'Lien copié !'; setTimeout(function(){ bp.textContent = 'Partager ma team'; }, 1800); }
    var ev = evaluate(team);
    if(ev.ms.length === 3 && window.TeamImage){ window.TeamImage.ouvrir(ev.ms, ev, url); return; }
    if(navigator.share && matchMedia('(pointer:coarse)').matches){ navigator.share({title:'Ma team Wuthering Waves', url:url}).catch(function(){}); return; }
    if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(ok, function(){ prompt('Copie ce lien :', url); });
    else prompt('Copie ce lien :', url);
  });

  update();
})();
