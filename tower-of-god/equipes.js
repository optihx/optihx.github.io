/* ==========================================================
   Tower of God : New World — « Mes équipes » : créateur de team 3-2.
   3 places devant, 2 derrière. Analyse : placement, éléments, dégâts.
   Les équipes sont gardées dans le navigateur ; un lien permet de les partager.
   ========================================================== */
(function(){
  var P = window.TOG_PERSOS || [];
  var root = document.getElementById('tog-team');
  if(!root || !P.length) return;
  var COUL = {rouge:'#ff6b6b', vert:'#5fd38d', bleu:'#5aa8ff', jaune:'#f5d547', violet:'#b596ff'};
  var NOM = {rouge:'Rouge', vert:'Vert', bleu:'Bleu', jaune:'Jaune', violet:'Violet'};
  var BAT = {rouge:['vert'], vert:['bleu'], bleu:['rouge'], jaune:['violet'], violet:['jaune']};   // X bat ...
  var AVANT = {Tank:1, Guerrier:1}, ARRIERE = {Distance:1, Mage:1, Support:1};
  var VAL = ['Peu utile','Très faible','Faible','Moyenne','Haute','Très haute','Indispensable'];
  var EQ = ['Aventure', 'Arène', 'Boss'];
  var KEY = 'optih-tog-equipes';
  var by = {}; P.forEach(function(p){ by[p.id] = p; });
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function norm(s){ return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function img(p){ return 'img/persos/' + p.id + '.webp'; }

  var st; try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){ st = null; }
  if(!st || !Array.isArray(st.t)) st = {cur: 0, t: [[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null]]};
  var lien = new URLSearchParams(location.search).get('tog');
  if(lien){ var l = lien.split(',').map(function(x){ return by[+x] ? +x : null; }).slice(0, 5); while(l.length < 5) l.push(null); st.t[st.cur] = l; }
  function team(){ return st.t[st.cur]; }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(e){} }
  var f = {c:'', r:'', q:'', mien:false};
  // « Mes persos » : les persos que le visiteur possède (gardés sur son appareil)
  var KEY_MES = 'optih-tog-mes-persos', mes = {}, mode = 'team';
  try { (JSON.parse(localStorage.getItem(KEY_MES) || '[]') || []).forEach(function(id){ if(by[id]) mes[id] = 1; }); } catch(e){}
  function saveMes(){ try { localStorage.setItem(KEY_MES, JSON.stringify(Object.keys(mes).map(Number))); } catch(e){} }
  function nbMes(){ return Object.keys(mes).length; }
  if(nbMes()) f.mien = true;

  /* ---------- Analyse ---------- */
  function analyse(t){
    var ms = t.map(function(id){ return id != null ? by[id] : null; });
    var n = ms.filter(Boolean).length, items = [];
    ms.forEach(function(p, i){
      if(!p) return;
      if(i < 3 && ARRIERE[p.r]) items.push(['warn', p.n + ' (' + p.r + ') est devant : il sera plus à l\'aise derrière.']);
      if(i >= 3 && AVANT[p.r]) items.push(['warn', p.n + ' (' + p.r + ') est derrière : un ' + p.r.toLowerCase() + ' se place devant.']);
    });
    var front = ms.slice(0, 3).filter(Boolean);
    if(n >= 3 && !front.some(function(p){ return p.r === 'Tank'; })) items.push(['tip', 'Pas de tank devant : ta ligne avant risque de tomber vite.']);
    if(n >= 3 && !ms.some(function(p){ return p && p.r === 'Support'; })) items.push(['tip', 'Pas de support : un soigneur ou un buff aide à tenir les longs combats.']);
    var cols = {}; ms.forEach(function(p){ if(p) cols[p.c] = (cols[p.c] || 0) + 1; });
    var forts = {}, faibles = {};
    Object.keys(cols).forEach(function(c){
      BAT[c].forEach(function(x){ forts[x] = 1; });
      Object.keys(BAT).forEach(function(y){ if(BAT[y].indexOf(c) > -1) faibles[y] = 1; });
    });
    var phy = ms.filter(function(p){ return p && p.d === 'phy'; }).length, mag = ms.filter(function(p){ return p && p.d === 'mag'; }).length;
    var vals = ms.filter(Boolean).map(function(p){ return p.v; });
    var moy = vals.length ? vals.reduce(function(a, b){ return a + b; }, 0) / vals.length : 0;
    var place = ms.filter(function(p, i){ return p && (i < 3 ? !ARRIERE[p.r] : !AVANT[p.r]); }).length;
    // note sur 10 : valeur des persos (6 pts) + placement (3 pts) + rôles clés (1 pt)
    var note = n ? Math.round(((moy / 6) * 6 + (place / Math.max(n, 1)) * 3 + ((front.some(function(p){ return p.r === 'Tank'; }) ? .5 : 0) + (ms.some(function(p){ return p && p.r === 'Support'; }) ? .5 : 0))) * 2) / 2 : 0;
    if(n === 5 && !items.some(function(x){ return x[0] === 'warn'; })) items.unshift(['ok', 'Placement parfait : chacun est à sa ligne.']);
    return {n:n, cols:cols, forts:Object.keys(forts), faibles:Object.keys(faibles), phy:phy, mag:mag, moy:moy, note:note, items:items, boss:ms.filter(function(p){ return p && p.b; }).length};
  }

  /* ---------- Rendu ---------- */
  function chip(c){ return '<span class="el" style="--e:' + COUL[c] + '">' + NOM[c] + '</span>'; }
  function slot(id, i){
    var p = id != null ? by[id] : null;
    if(!p) return '<button type="button" class="tt-slot vide" data-slot="' + i + '"><span>+</span><small>' + (i < 3 ? 'Devant' : 'Derrière') + '</small></button>';
    return '<button type="button" class="tt-slot" data-slot="' + i + '" style="--e:' + COUL[p.c] + '" title="Retirer ' + esc(p.n) + '"><img src="' + img(p) + '" alt="" width="128" height="128"><strong>' + esc(p.n) + '</strong><small>' + esc(p.r) + ' · ' + esc(p.ra) + '</small><i aria-hidden="true">×</i></button>';
  }
  function resume(k, v){ try { var s = JSON.stringify(v); if(localStorage.getItem(k) !== s) localStorage.setItem(k, s); } catch(e){} } /* résumé pour la carte de joueur (accueil) */
  function render(){
    var t = team(), a = analyse(t);
    resume('optih-resume-tog', {eq: EQ[st.cur], t: t.map(function(id){ var p = id != null ? by[id] : null; return p ? [p.id, COUL[p.c], p.n] : null; }), note: a.n === 5 ? a.note : null});
    root.querySelector('#tt-tabs').innerHTML = EQ.map(function(n, i){
      var c = st.t[i].filter(function(x){ return x != null; }).length;
      return '<button type="button" role="tab" aria-selected="' + (i === st.cur) + '" data-eq="' + i + '">' + n + '<small>' + c + '/5</small></button>';
    }).join('');
    root.querySelector('#tt-form').innerHTML =
      '<div class="tt-ligne"><span class="tt-lab">Devant</span>' + t.slice(0, 3).map(function(id, i){ return slot(id, i); }).join('') + '</div>' +
      '<div class="tt-ligne arriere"><span class="tt-lab">Derrière</span>' + t.slice(3).map(function(id, i){ return slot(id, i + 3); }).join('') + '</div>';
    var verdict = !a.n ? 'Team vide' : a.n < 5 ? 'Encore ' + (5 - a.n) + ' place' + (5 - a.n > 1 ? 's' : '') : a.note >= 8 ? 'Très bonne team' : a.note >= 6 ? 'Bonne team' : a.note >= 4 ? 'Team correcte' : 'Team à revoir';
    root.querySelector('#tt-res').innerHTML =
      '<div class="tt-note"><b>' + (a.n === 5 ? String(a.note).replace('.', ',') : '–') + '</b><small>/10</small><span>' + verdict + '</span></div>' +
      (a.n ? '<dl class="tt-carac">' +
        '<div><dt>Éléments</dt><dd>' + Object.keys(a.cols).map(function(c){ return chip(c) + (a.cols[c] > 1 ? '<em>×' + a.cols[c] + '</em>' : ''); }).join(' ') + '</dd></div>' +
        '<div><dt>Fort contre</dt><dd>' + (a.forts.map(chip).join(' ') || '—') + '</dd></div>' +
        '<div><dt>Attention à</dt><dd>' + (a.faibles.map(chip).join(' ') || '—') + '</dd></div>' +
        '<div><dt>Dégâts</dt><dd>Physiques ' + a.phy + ' · Magiques ' + a.mag + '</dd></div>' +
        '<div><dt>Valeur moyenne</dt><dd>' + VAL[Math.round(a.moy)] + (a.boss ? ' · ' + a.boss + ' bon' + (a.boss > 1 ? 's' : '') + ' contre les boss' : '') + '</dd></div>' +
      '</dl>' : '') +
      (a.items.length ? '<ul class="tt-list">' + a.items.map(function(x){ return '<li class="' + x[0] + '">' + esc(x[1]) + '</li>'; }).join('') + '</ul>' : '') +
      '<p class="tt-how">Note : valeur des persos selon Conowen (6 pts), placement devant / derrière (3 pts), un tank et un support (1 pt). Un repère, pas une règle.</p>';
    var l = P.filter(function(p){ return (mode === 'mes' || !f.mien || mes[p.id]) && (!f.c || p.c === f.c) && (!f.r || p.r === f.r) && (!f.q || norm(p.n + ' ' + p.t).indexOf(f.q) > -1); });
    var plein = t.indexOf(null) < 0;
    root.querySelector('#tt-pick').innerHTML = l.map(function(p){
      var pos = t.indexOf(p.id);
      var cl = mode === 'mes' ? (mes[p.id] ? ' a' : ' pas') : (pos > -1 ? ' pris' : '');
      return '<li><button type="button" class="tt-p' + cl + '" data-id="' + p.id + '" style="--e:' + COUL[p.c] + '"' + (mode === 'mes' ? ' aria-pressed="' + !!mes[p.id] + '"' : '') + ' title="' + esc(p.n + (p.t ? ' [' + p.t + ']' : '') + ' · ' + p.r + ' · ' + p.ra) + '">' +
        (mes[p.id] ? '<span class="tt-ok" aria-label="Je l\'ai">✓</span>' : '') +
        '<img src="' + img(p) + '" alt="" loading="lazy" width="128" height="128"><span class="tt-ra">' + esc(p.ra) + '</span><span class="tt-n">' + esc(p.n) + '</span><span class="tt-t">' + esc(p.t) + '</span></button></li>';
    }).join('') || '<li class="tt-rien">Aucun perso trouvé.</li>';
    root.querySelector('#tt-pick').classList.toggle('plein', plein && mode === 'team');
    root.querySelector('#tt-pick').classList.toggle('coche', mode === 'mes');
    var n = nbMes(), bm = root.querySelector('#tt-mes');
    bm.querySelector('[data-mode="team"]').setAttribute('aria-pressed', mode === 'team');
    bm.querySelector('[data-mode="mes"]').setAttribute('aria-pressed', mode === 'mes');
    bm.querySelector('[data-mode="mes"] small').textContent = n + ' / ' + P.length;
    var fm = bm.querySelector('#tt-mien'); fm.checked = f.mien; fm.disabled = !n || mode === 'mes';
    root.querySelector('#tt-aide-mes').hidden = mode !== 'mes';
  }

  /* ---------- Mes persos ---------- */
  var bmes = document.createElement('div');
  bmes.className = 'tt-mes'; bmes.id = 'tt-mes';
  bmes.innerHTML = '<div class="tt-fg" role="group" aria-label="Que fait un clic sur un perso ?">' +
      '<button type="button" data-mode="team" aria-pressed="true">Composer ma team</button>' +
      '<button type="button" data-mode="mes" aria-pressed="false">Cocher mes persos <small></small></button></div>' +
    '<label class="tt-mien"><input type="checkbox" id="tt-mien"><span>Seulement mes persos</span></label>';
  root.querySelector('.tt-tools').insertAdjacentElement('beforebegin', bmes);
  var aideMes = document.createElement('p');
  aideMes.className = 'tt-aide tt-aide-mes'; aideMes.id = 'tt-aide-mes'; aideMes.hidden = true;
  aideMes.innerHTML = '<b>Mode « Mes persos » :</b> clique sur les persos que tu as pour les cocher ✓. Ta liste reste enregistrée sur ton appareil. Reviens ensuite sur « Composer ma team ».';
  root.querySelector('#tt-pick').insertAdjacentElement('beforebegin', aideMes);
  bmes.addEventListener('click', function(e){
    var b = e.target.closest('[data-mode]'); if(!b) return;
    mode = b.dataset.mode;
    if(mode === 'team' && nbMes()) f.mien = true;
    render();
  });
  bmes.querySelector('#tt-mien').addEventListener('change', function(){ f.mien = this.checked; render(); });

  /* ---------- Filtres ---------- */
  var fb = root.querySelector('#tt-filtres');
  fb.innerHTML = '<div class="tt-fg">' + ['', 'rouge', 'vert', 'bleu', 'jaune', 'violet'].map(function(c){
    return '<button type="button" data-fc="' + c + '" aria-pressed="' + (c === '') + '">' + (c ? '<i style="--e:' + COUL[c] + '"></i>' + NOM[c] : 'Toutes') + '</button>';
  }).join('') + '</div><div class="tt-fg">' + ['', 'Tank', 'Guerrier', 'Assassin', 'Distance', 'Mage', 'Support'].map(function(r){
    return '<button type="button" data-fr="' + r + '" aria-pressed="' + (r === '') + '">' + (r || 'Tous') + '</button>';
  }).join('') + '</div>';
  fb.addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return;
    if(b.dataset.fc != null){ f.c = b.dataset.fc; [].forEach.call(fb.querySelectorAll('[data-fc]'), function(x){ x.setAttribute('aria-pressed', x === b); }); }
    if(b.dataset.fr != null){ f.r = b.dataset.fr; [].forEach.call(fb.querySelectorAll('[data-fr]'), function(x){ x.setAttribute('aria-pressed', x === b); }); }
    render();
  });
  root.querySelector('#tt-search').addEventListener('input', function(){ f.q = norm(this.value.trim()); render(); });

  /* ---------- Actions ---------- */
  root.addEventListener('click', function(e){
    var b;
    if((b = e.target.closest('[data-eq]'))){ st.cur = +b.dataset.eq; save(); return render(); }
    if((b = e.target.closest('.tt-slot:not(.vide)'))){ team()[+b.dataset.slot] = null; save(); return render(); }
    if((b = e.target.closest('.tt-p'))){
      var id = +b.dataset.id, t = team(), pos = t.indexOf(id);
      if(mode === 'mes'){ if(mes[id]) delete mes[id]; else mes[id] = 1; saveMes(); return render(); }
      if(pos > -1) t[pos] = null;
      else {
        var p = by[id], ordre = AVANT[p.r] ? [0,1,2,3,4] : ARRIERE[p.r] ? [3,4,0,1,2] : [0,1,2,3,4];   // place selon le rôle
        var libre = ordre.filter(function(i){ return t[i] == null; })[0];
        if(libre == null){ var tf = root.querySelector('#tt-form'); tf.classList.remove('flash'); void tf.offsetWidth; tf.classList.add('flash'); return; }
        t[libre] = id;
      }
      save(); return render();
    }
    if((b = e.target.closest('#tt-vider'))){ st.t[st.cur] = [null,null,null,null,null]; save(); return render(); }
    if((b = e.target.closest('#tt-partager'))){
      var url = location.origin + location.pathname + '?tog=' + team().map(function(x){ return x == null ? '' : x; }).join(',') + '#equipes';
      var a = analyse(team());
      if(a.n >= 3 && window.TogImage){ window.TogImage.ouvrir(team(), by, a, EQ[st.cur], url); return; }
      if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(function(){ b.textContent = 'Lien copié !'; setTimeout(function(){ b.textContent = 'Partager'; }, 1800); });
      else prompt('Copie ce lien :', url);
    }
  });
  render();
})();
