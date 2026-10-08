/* Wuthering Waves — planificateur de matériaux (données : data-materiaux.js).
   Ascensions + compétences + nœuds bonus, du niveau actuel au niveau visé. */
(function(){
  var M = window.MATERIAUX, R = window.RESONATEURS || [];
  var box = document.getElementById('mat');
  if(!M || !box) return;
  var PO = window.POSSEDES || {a:function(){return false;}, vide:function(){return true;}};
  var EL = {Aero:'#2f9e80',Fusion:'#d9573f',Glacio:'#3a93cf',Electro:'#8d5ccf',Spectro:'#b8932a',Havoc:'#a8436f'};
  var PALIERS = ['20', '40', '50', '60', '70', '80', '90'];
  var COMP = ['Attaque normale', 'Compétence', 'Libération', 'Circuit Forte', "Compétence d'Intro"];
  var KEY = 'optih-wuwa-mat';
  var by = {}; R.forEach(function(r){ by[r.s] = r; });
  var st; try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){ st = null; }
  st = st || {s: 'lupa', p: {}};
  st.liste = st.liste || []; st.ok = st.ok || {};
  var farm = document.getElementById('farm');
  function plan(s){ return st.p[s] || (st.p[s] = {a0: 0, a1: 6, c0: [1,1,1,1,1], c1: [10,10,10,10,10], noeuds: true}); }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(e){} }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function fmt(n){ return Math.round(n).toLocaleString('fr-FR'); }
  function sel(attr, val, opts){ return '<select ' + attr + '>' + opts.map(function(o){ return '<option value="' + o[0] + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; }

  function calcul(s){
    var d = M.persos[s], p = plan(s), tot = {};
    function add(l){ (l || []).forEach(function(x){ tot[x[0]] = (tot[x[0]] || 0) + x[1]; }); }
    for(var a = p.a0; a < p.a1; a++) add(d.br[a] && d.br[a][1]);
    if(d.sk) for(var c = 0; c < 5; c++) for(var lv = p.c0[c]; lv < p.c1[c]; lv++) add(d.sk[lv]);
    if(p.noeuds) d.tree.forEach(add);
    return tot;
  }

  function render(){
    var l = R.filter(function(r){ return M.persos[r.s]; });
    if(!M.persos[st.s]) st.s = l[0].s;
    var r = by[st.s], p = plan(st.s);
    function opt(r){ return [r.s, r.n]; }
    var persoSel = PO.vide() ? sel('data-m="s"', st.s, l.map(opt)) :
      '<select data-m="s"><optgroup label="Mes persos">' + l.filter(function(x){ return PO.a(x.s); }).map(function(x){ return '<option value="' + x.s + '"' + (x.s === st.s ? ' selected' : '') + '>' + esc(x.n) + '</option>'; }).join('') +
      '</optgroup><optgroup label="Les autres">' + l.filter(function(x){ return !PO.a(x.s); }).map(function(x){ return '<option value="' + x.s + '"' + (x.s === st.s ? ' selected' : '') + '>' + esc(x.n) + '</option>'; }).join('') + '</optgroup></select>';
    var niv = PALIERS.map(function(x, i){ return [i, i === 0 ? 'Niveau 1 à 20' : i === 6 ? 'Niveau 90 (max)' : 'Niveau max ' + x]; });
    var lv10 = [1,2,3,4,5,6,7,8,9,10].map(function(n){ return [n, n]; });
    var tot = calcul(st.s);
    var ids = Object.keys(tot).filter(function(k){ return k !== '2'; }).sort(function(a, b){ return (M.items[b].q - M.items[a].q) || (tot[b] - tot[a]); });
    box.innerHTML =
      '<div class="mt-form">' +
        '<div class="mt-perso" style="--c:' + EL[r.el] + '"><img src="img/res/' + r.img + '.webp" alt=""><label><span class="lab">Perso</span>' + persoSel + '</label></div>' +
        (farm ? '<button type="button" class="mt-ajout' + (st.liste.indexOf(st.s) > -1 ? ' dedans' : '') + '" data-m="liste">' + (st.liste.indexOf(st.s) > -1 ? '✓ Dans ma liste de farm · retirer' : '+ Ajouter ' + esc(r.n) + ' à ma liste de farm') + '</button>' : '') +
        '<div class="mt-row"><span class="lab">Niveau</span><div class="mt-pair">' + sel('data-m="a0"', p.a0, niv) + '<span aria-hidden="true">→</span>' + sel('data-m="a1"', p.a1, niv) + '</div></div>' +
        '<div class="mt-row"><span class="lab">Compétences</span><div class="mt-comp">' + COMP.map(function(n, i){
          return '<div><span>' + n + '</span><div class="mt-pair">' + sel('data-m="c0" data-i="' + i + '"', p.c0[i], lv10) + '<span aria-hidden="true">→</span>' + sel('data-m="c1" data-i="' + i + '"', p.c1[i], lv10) + '</div></div>';
        }).join('') + '<button type="button" class="mt-all" data-m="tout10">Tout au niveau 10</button></div></div>' +
        '<label class="dg-soin mt-noeuds"><input type="checkbox" data-m="noeuds"' + (p.noeuds ? ' checked' : '') + '> Débloquer aussi les nœuds bonus (stats et passifs)</label>' +
      '</div>' +
      '<div class="mt-res"><div class="mt-cred"><img src="img/mat/2.webp" alt=""><span class="lab">Crédits coquille</span><b>' + fmt(tot[2] || 0) + '</b></div>' +
        (ids.length ? '<ul class="mt-list">' + ids.map(function(k){
          var it = M.items[k];
          return '<li class="q' + it.q + '"><img src="img/mat/' + k + '.webp" alt="" loading="lazy" width="64" height="64"><span>' + esc(it.n) + '</span><b>× ' + fmt(tot[k]) + '</b></li>';
        }).join('') + '</ul>' : '<p class="mt-vide">Rien à farmer pour ces niveaux.</p>') +
        '<p class="mt-note">Pas compté : l\'EXP de niveau (potions de résonance) et les armes.</p></div>';
  }
  box.addEventListener('change', function(e){
    var t = e.target, k = t.dataset.m; if(!k) return;
    var p = plan(st.s);
    if(k === 's') st.s = t.value;
    else if(k === 'noeuds') p.noeuds = t.checked;
    else if(k === 'a0' || k === 'a1'){ p[k] = +t.value; if(p.a1 < p.a0){ if(k === 'a0') p.a1 = p.a0; else p.a0 = p.a1; } }
    else { p[k][+t.dataset.i] = +t.value; var i = +t.dataset.i; if(p.c1[i] < p.c0[i]){ if(k === 'c0') p.c1[i] = p.c0[i]; else p.c0[i] = p.c1[i]; } }
    save(); render();
  });
  box.addEventListener('click', function(e){
    if(e.target.dataset.m === 'tout10'){ plan(st.s).c1 = [10,10,10,10,10]; save(); render(); }
    if(e.target.dataset.m === 'liste'){ var i = st.liste.indexOf(st.s); if(i > -1) st.liste.splice(i, 1); else st.liste.push(st.s); save(); render(); }
  });
  /* ---------- Ma liste de farm : plusieurs persos, matériaux additionnés + échos slot par slot ---------- */
  function renderFarm(){
    if(!farm) return;
    var L = st.liste.filter(function(s){ return by[s] && M.persos[s]; });
    if(!L.length){
      farm.innerHTML = '<p class="fm-vide">Ta liste est vide. Choisis un perso au-dessus, règle ses niveaux, puis clique sur « + Ajouter à ma liste de farm ». Tu peux en ajouter autant que tu veux.</p>';
      return;
    }
    var tot = {};
    L.forEach(function(s){ var t = calcul(s); Object.keys(t).forEach(function(k){ tot[k] = (tot[k] || 0) + t[k]; }); });
    var ids = Object.keys(tot).filter(function(k){ return k !== '2'; }).sort(function(a, b){ return (M.items[b].q - M.items[a].q) || (tot[b] - tot[a]); });
    var nbMat = ids.length, okMat = ids.filter(function(k){ return st.ok['m' + k]; }).length;
    var nbEcho = 0, okEcho = 0;
    var echos = L.map(function(s){
      var r = by[s], slots = r.cost || [];
      return '<article class="fm-perso" style="--c:' + EL[r.el] + '"><header><img src="img/res/' + r.img + '.webp" alt="" width="44" height="44"><div><strong>' + esc(r.n) + '</strong>' +
        '<span>Set : <b>' + esc(r.set) + '</b>' + (r.setAlt && r.setAlt.length ? ' <em>(ou ' + r.setAlt.map(esc).join(', ') + ')</em>' : '') + '</span></div>' +
        '<button type="button" class="fm-x" data-retirer="' + s + '" title="Retirer ' + esc(r.n) + ' de la liste" aria-label="Retirer ' + esc(r.n) + '">×</button></header>' +
        '<ul class="fm-slots">' + slots.map(function(x, i){
          var k = 'e' + s + i, ok = !!st.ok[k]; nbEcho++; if(ok) okEcho++;
          var quoi = i === 0 && x[0] === 4 && r.echo ? esc(r.echo) : 'Un écho ' + x[0] + ' coût' + (x[0] > 1 ? 's' : '') + ' du set';
          return '<li class="' + (ok ? 'ok' : '') + '"><label><input type="checkbox" data-ok="' + k + '"' + (ok ? ' checked' : '') + '><span class="fm-c c' + x[0] + '">' + x[0] + '</span>' +
            '<span class="fm-e"><b>' + quoi + '</b><small>Stat principale : ' + esc(x[1]) + '</small></span></label></li>';
        }).join('') + '</ul>' +
        (function(){
          var ES = window.ECHOS_SETS || {}, k = String(r.set || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''), e = ES[k];
          if(!e) return '';
          function l(t, a){ return a && a.length ? '<li><span class="fm-c c' + t + '">' + t + '</span><span>' + a.map(esc).join(' · ') + '</span></li>' : ''; }
          return '<details class="fm-ou"><summary>Quels échos chasser pour le set ' + esc(r.set) + ' ?</summary><ul>' + l(3, e.c3) + l(1, e.c1) + '</ul></details>';
        })() +
        (r.subs && r.subs.length ? '<p class="fm-subs"><span>Substats à chercher :</span> ' + r.subs.slice(0, 4).map(esc).join(' · ') + '</p>' : '') + '</article>';
    }).join('');
    var cred = L.reduce(function(a, s){ return a + (calcul(s)[2] || 0); }, 0);
    farm.innerHTML =
      '<div class="fm-tete"><div class="fm-chips">' + L.map(function(s){ var r = by[s]; return '<span class="fm-chip" style="--c:' + EL[r.el] + '"><img src="img/res/' + r.img + '.webp" alt="">' + esc(r.n) + '</span>'; }).join('') + '</div>' +
      '<button type="button" class="fm-raz" data-raz="1">Tout décocher</button></div>' +
      '<div class="fm-cols">' +
        '<section class="fm-bloc"><h4>Matériaux <small>' + okMat + ' / ' + nbMat + '</small></h4>' +
          '<div class="mt-cred"><img src="img/mat/2.webp" alt=""><span class="lab">Crédits coquille</span><b>' + fmt(cred) + '</b></div>' +
          '<ul class="fm-mats">' + ids.map(function(k){
            var it = M.items[k], ok = !!st.ok['m' + k];
            return '<li class="q' + it.q + (ok ? ' ok' : '') + '"><label><input type="checkbox" data-ok="m' + k + '"' + (ok ? ' checked' : '') + '><img src="img/mat/' + k + '.webp" alt="" loading="lazy" width="64" height="64"><span>' + esc(it.n) + '</span><b>× ' + fmt(tot[k]) + '</b></label></li>';
          }).join('') + '</ul><p class="mt-note">Les niveaux de chaque perso sont ceux réglés au-dessus.</p></section>' +
        '<section class="fm-bloc"><h4>Échos à farmer <small>' + okEcho + ' / ' + nbEcho + '</small></h4>' + echos + '</section>' +
      '</div>';
  }
  farm && farm.addEventListener('change', function(e){
    var k = e.target.dataset.ok; if(!k) return;
    if(e.target.checked) st.ok[k] = 1; else delete st.ok[k];
    save(); renderFarm();
    var r = farm.querySelector('[data-ok="' + k + '"]'); if(r) r.focus();
  });
  farm && farm.addEventListener('click', function(e){
    var b = e.target.closest('[data-retirer]');
    if(b){ st.liste = st.liste.filter(function(x){ return x !== b.dataset.retirer; }); save(); render(); return; }
    if(e.target.dataset.raz){ st.ok = {}; save(); renderFarm(); }
  });
  var render0 = render;
  render = function(){ render0(); renderFarm(); };
  document.addEventListener('possedes', function(){ render(); });
  render();
})();
