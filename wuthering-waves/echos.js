/* Wuthering Waves — « Noter un écho » : note sur 100 d'un écho selon les substats utiles au perso.
   Chaque substat compte selon sa valeur (par rapport au meilleur jet possible) et son importance
   pour le perso (ordre des substats conseillées dans sa fiche). */
(function(){
  var R = window.RESONATEURS || [];
  var box = document.getElementById('echo-note');
  if(!box || !R.length) return;
  // meilleur jet possible de chaque substat
  var SUBS = [
    ['tc', 'Taux CRIT %', 10.5], ['dc', 'Dgt CRIT %', 21], ['atqp', 'ATQ %', 11.6], ['atq', 'ATQ', 60],
    ['rec', "Recharge d'énergie %", 12.4], ['na', "Dgt d'attaque normale %", 11.6], ['lourde', "Dgt d'attaque lourde %", 11.6],
    ['comp', 'Dgt de compétence %', 11.6], ['lib', 'Dgt de libération %', 11.6],
    ['pvp', 'PV %', 11.6], ['pv', 'PV', 580], ['defp', 'DÉF %', 14.7], ['def', 'DÉF', 70]
  ];
  var MAX = {}; SUBS.forEach(function(x){ MAX[x[0]] = x[2]; });
  var KEY = 'optih-wuwa-echo';
  var st; try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){ st = null; }
  st = st || {s: 'lupa', l: [['tc', ''], ['dc', ''], ['atqp', ''], ['rec', ''], ['atq', '']]};
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(e){} }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  // importance des substats pour un perso, d'après l'ordre conseillé (ex. « Taux CRIT = Dgt CRIT », « ATQ % »)
  function poids(r){
    var w = {}, RANG = [1, .9, .75, .6, .45, .3];
    (r.subs || []).forEach(function(ligne, i){
      ligne.split(/\s*(?:=|≥|>|\/)\s*/).forEach(function(t){
        var k = /Taux CRIT/.test(t) ? 'tc' : /Dgt CRIT/.test(t) ? 'dc' : /^ATQ ?%/.test(t) ? 'atqp' : /^ATQ$/.test(t) ? 'atq' :
                /Recharge/.test(t) ? 'rec' : /normale/.test(t) ? 'na' : /lourde/.test(t) ? 'lourde' : /compétence/.test(t) ? 'comp' :
                /libération/.test(t) ? 'lib' : /^PV ?%/.test(t) ? 'pvp' : /^PV/.test(t) ? 'pv' : /^DÉF ?%/.test(t) ? 'defp' : /^DÉF/.test(t) ? 'def' : null;
        if(k && w[k] == null) w[k] = RANG[Math.min(i, RANG.length - 1)];
      });
    });
    // le critique est toujours précieux pour un perso qui fait des dégâts
    if(w.tc == null && w.dc != null) w.tc = w.dc; if(w.dc == null && w.tc != null) w.dc = w.tc;
    return w;
  }
  function note(r){
    var w = poids(r), tot = 0;
    st.l.forEach(function(x){ var v = parseFloat(String(x[1]).replace(',', '.')) || 0; if(v > 0) tot += Math.min(v / MAX[x[0]], 1.05) * (w[x[0]] != null ? w[x[0]] : .05); });
    var ideal = Object.keys(w).map(function(k){ return w[k]; }).sort(function(a, b){ return b - a; }).slice(0, 5).reduce(function(a, b){ return a + b; }, 0) || 1;
    return {n: Math.min(100, Math.round(tot / ideal * 100)), w: w};
  }
  function verdict(n){ return n >= 80 ? ['Excellent', 'top'] : n >= 60 ? ['Très bon', 'good'] : n >= 45 ? ['Bon', 'ok'] : n >= 30 ? ['Moyen', 'mid'] : ['À recycler', 'bad']; }

  function render(){
    var r = R.filter(function(x){ return x.s === st.s; })[0] || R[0];
    var x = note(r), v = verdict(x.n);
    box.innerHTML =
      '<label class="en-perso"><span class="lab">Perso</span><select data-e="s">' + R.map(function(o){ return '<option value="' + o.s + '"' + (o.s === r.s ? ' selected' : '') + '>' + esc(o.n) + '</option>'; }).join('') + '</select></label>' +
      '<div class="en-grid"><div class="en-subs">' + st.l.map(function(l, i){
        var util = x.w[l[0]] != null;
        return '<div class="en-row' + (util ? ' utile' : '') + '"><select data-e="k" data-i="' + i + '">' + SUBS.map(function(s){ return '<option value="' + s[0] + '"' + (s[0] === l[0] ? ' selected' : '') + '>' + esc(s[1]) + '</option>'; }).join('') + '</select>' +
          '<input type="text" inputmode="decimal" placeholder="0" data-e="v" data-i="' + i + '" value="' + esc(l[1]) + '" aria-label="Valeur"><span class="en-tag">' + (util ? 'Utile' : 'Peu utile') + '</span></div>';
      }).join('') + '</div>' +
      '<div class="en-res ' + v[1] + '"><b>' + x.n + '</b><small>/100</small><span>' + v[0] + '</span></div></div>' +
      '<p class="en-aide">Mets les 5 substats de ton écho (la stat principale ne compte pas). « Utile » = substat conseillée pour ' + esc(r.n) + ' : ' + esc((r.subs || []).join(' › ')) + '.</p>';
  }
  box.addEventListener('change', function(e){
    var t = e.target, k = t.dataset.e; if(!k) return;
    if(k === 's') st.s = t.value; else if(k === 'k') st.l[+t.dataset.i][0] = t.value; else return;
    save(); render();
  });
  box.addEventListener('input', function(e){
    var t = e.target; if(t.dataset.e !== 'v') return;
    st.l[+t.dataset.i][1] = t.value; save();
    var r = R.filter(function(x){ return x.s === st.s; })[0] || R[0], x = note(r), v = verdict(x.n), res = box.querySelector('.en-res');
    res.className = 'en-res ' + v[1]; res.innerHTML = '<b>' + x.n + '</b><small>/100</small><span>' + v[0] + '</span>';
  });
  render();
})();
