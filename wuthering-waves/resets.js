/* Wuthering Waves — comptes à rebours des resets (onglet Calendrier).
   Réglages dans data-calendrier.js → « resets ». Aussi utilisé par le calculateur d'Astrite. */
(function(){
  var C = window.CALENDRIER || {}, R = C.resets;
  if(!R) return;
  var J = 864e5, H = R.heureUTC || 0;
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  function ref(s){ var p = s.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2], H); }
  function dernierJour(now){ var d = new Date(now); d.setUTCHours(H, 0, 0, 0); var t = d.getTime(); return t > now ? t - J : t; }
  var W = {
    jour: function(now){ return dernierJour(now) + J; },
    semaine: function(now){ var t = dernierJour(now); while(new Date(t).getUTCDay() !== R.jourHebdo) t -= J; return t + 7 * J; },
    cycle: function(c, now){ var r = ref(c.ref), p = c.cycle * J, n = Math.floor((now - r) / p) + 1; return r + n * p; },
    // nombre de resets entre maintenant et une date (pour le calcul d'Astrite)
    combien: function(quoi, now, fin){
      var n = 0, t = quoi === 'jour' ? W.jour(now) : W.cycle(quoi, now), pas = quoi === 'jour' ? J : quoi.cycle * J;
      for(; t <= fin; t += pas) n++;
      return n;
    }
  };
  window.WUWA_RESETS = W;

  var box = document.getElementById('resets');
  if(!box) return;
  function duree(ms){
    var m = Math.max(0, Math.ceil(ms / 6e4)), j = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mn = m % 60;
    return j ? j + ' j ' + h + ' h' : h ? h + ' h ' + (mn < 10 ? '0' : '') + mn : mn + ' min';
  }
  function heure(t){ return new Date(t).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}).replace(':', ' h '); }
  function date(t){ return new Date(t).toLocaleDateString('fr-FR', {weekday: 'short', day: 'numeric', month: 'short'}).replace(/\./g, ''); }
  function loc(s){ var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).getTime(); }

  function tuiles(now){
    var L = [
      {k: 'jour', lab: 'Reset du jour', t: W.jour(now), sous: 'chaque jour à ' + heure(W.jour(now))},
      {k: 'semaine', lab: 'Reset de la semaine', t: W.semaine(now), sous: JOURS[new Date(W.semaine(now)).getDay()] + ' à ' + heure(W.semaine(now))}
    ];
    if(R.tour) L.push({k: 'tour', lab: R.tour.nom, t: W.cycle(R.tour, now), sous: date(W.cycle(R.tour, now)) + ' · tous les ' + R.tour.cycle + ' jours'});
    if(R.wastes) L.push({k: 'wastes', lab: R.wastes.nom, t: W.cycle(R.wastes, now), sous: date(W.cycle(R.wastes, now)) + ' · tous les ' + R.wastes.cycle + ' jours'});
    var ph = (C.phases || []).filter(function(p){ return now >= loc(p.debut) && now < loc(p.fin); })[0];
    if(ph) L.push({k: 'banniere', lab: 'Fin de la bannière', t: loc(ph.fin), sous: ph.nom + ' · ' + date(loc(ph.fin)), fort: true});
    return L;
  }
  function render(){
    var now = Date.now();
    box.innerHTML = tuiles(now).map(function(x){
      var urgent = x.t - now < 864e5 * (x.k === 'jour' ? 0.125 : 2);
      return '<div class="rs' + (x.fort ? ' fort' : '') + (urgent ? ' urgent' : '') + '"><span class="lab">' + x.lab + '</span><b>' + duree(x.t - now) + '</b><small>' + x.sous + '</small></div>';
    }).join('');
  }
  render();
  setInterval(render, 30000);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) render(); });
})();
