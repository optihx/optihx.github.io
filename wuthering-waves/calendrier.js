/* Wuthering Waves — onglet Calendrier (données : data-calendrier.js) */
(function(){
  var C = window.CALENDRIER, R = window.RESONATEURS || [];
  var box = document.getElementById('cal');
  if(!C || !box) return;
  var EL = {Aero:'#2f9e80',Fusion:'#d9573f',Glacio:'#3a93cf',Electro:'#8d5ccf',Spectro:'#b8932a',Havoc:'#a8436f'};
  var by = {}; R.forEach(function(r){ by[r.s] = r; });
  var MOIS = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function d(s){ var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function jour(s){ var x = d(s); return x.getDate() + (x.getDate() === 1 ? 'er' : '') + ' ' + MOIS[x.getMonth()]; }
  function jours(ms){ return Math.ceil(ms / 864e5); }
  function dans(n){ return n <= 0 ? "aujourd'hui" : n === 1 ? 'demain' : 'dans ' + n + ' jours'; }

  function render(){
    var now = new Date(), v = C.version;
    var t0 = d(v.debut), t1 = d(v.fin), pct = Math.max(0, Math.min(100, (now - t0) / (t1 - t0) * 100));
    var reste = jours(t1 - now);
    var html = '<div class="cal-version"><div><span class="lab">Version en cours</span><strong>' + esc(v.nom) + '</strong>' +
      '<span class="cal-dates">' + jour(v.debut) + ' → ' + jour(v.fin) + '</span></div>' +
      '<div class="cal-prog"><div class="cal-bar"><i style="width:' + pct + '%"></i></div><span>' + (reste > 0 ? 'Fin ' + dans(reste) : 'Terminée') + '</span></div></div>';
    html += '<div class="cal-phases">' + C.phases.map(function(p){
      var a = d(p.debut), b = d(p.fin), etat, txt;
      if(now < a){ etat = 'avenir'; txt = 'Commence ' + dans(jours(a - now)); }
      else if(now < b){ etat = 'encours'; txt = 'Se termine ' + dans(jours(b - now)); }
      else { etat = 'fini'; txt = 'Terminée'; }
      return '<article class="cal-phase ' + etat + '"><header><span class="cal-etat">' + (etat === 'encours' ? 'En cours' : etat === 'avenir' ? 'À venir' : 'Terminée') + '</span>' +
        '<h3>' + esc(p.nom) + '</h3><span class="cal-dates">' + jour(p.debut) + ' → ' + jour(p.fin) + '</span><b class="cal-cd">' + txt + '</b></header>' +
        '<ul class="cal-persos">' + p.persos.map(function(x){
          var r = by[x.s]; if(!r) return '';
          return '<li><a href="#fiche-' + r.s + '" style="--c:' + EL[r.el] + '"><img src="img/res/' + r.img + '.webp" alt="" loading="lazy" width="300" height="412">' +
            '<span><strong>' + esc(r.n) + '</strong><em>' + esc(r.el) + ' · ' + esc(r.w) + '</em>' + (x.nouveau ? '<i class="cal-new">Nouveau</i>' : '<i class="cal-re">Rerun</i>') + '</span></a></li>';
        }).join('') + '</ul>' +
        '<div class="cal-sub"><span class="lab">Armes</span><p>' + p.armes.map(esc).join(' · ') + '</p></div>' +
        '<div class="cal-sub"><span class="lab">4 ★ mis en avant</span><p class="cal-4">' + p.quatre.map(function(s){
          var r = by[s]; return r ? '<a href="#fiche-' + s + '" title="' + esc(r.n) + '" style="--c:' + EL[r.el] + '"><img src="img/res/' + r.img + '.webp" alt="" loading="lazy">' + esc(r.n) + '</a>' : '';
        }).join('') + '</p></div>' +
        (p.note ? '<p class="cal-note">' + esc(p.note) + '</p>' : '') + '</article>';
    }).join('') + '</div>';
    if(C.suivante){
      var n = jours(d(C.suivante.date) - now);
      html += '<div class="cal-next"><span class="lab">Prochaine version</span><strong>' + esc(C.suivante.nom) + '</strong><span>vers le ' + jour(C.suivante.date) + ' · ' + dans(n) + '</span><p>' + esc(C.suivante.note || '') + '</p></div>';
    }
    box.innerHTML = html;
  }
  render();
  setInterval(render, 60 * 60 * 1000);
})();
