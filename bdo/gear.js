/* BDO — affichage du suivi du gear (données : data-gear.js) */
(function(){
  var G = window.GEAR, box = document.getElementById('gear-list');
  if(!G || !box) return;
  var ROM = {I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9, X:10};
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function gs(o){ return Math.max(o.ap, o.aap) + o.dp; }   // comme en jeu : meilleure AP + DP
  function stat(nom, v){ return '<li><span>' + nom + '</span><b>' + (v || '<em class="g-vide">à remplir</em>') + '</b></li>'; }

  var html = '<div class="gear-cards">' + G.persos.map(function(p){
    var vide = !(p.ap || p.aap || p.dp);
    return '<article class="g-card"><header><img src="' + esc(p.img) + '" alt="" width="64" height="64"><div><h3>' + esc(p.nom) + '</h3>' +
      '<span class="g-gs">' + (vide ? 'GS à remplir' : 'GS <b>' + gs(p) + '</b>') + '</span></div></header>' +
      '<ul class="g-stats">' + stat('AP', p.ap) + stat('AP éveil', p.aap) + stat('DP', p.dp) + '</ul>' +
      (p.note ? '<p class="g-note">' + esc(p.note) + '</p>' : '') + '</article>';
  }).join('') + '</div>';

  // Courbe du GS (historique dans data-gear.js)
  var Hh = (G.historique || []).filter(function(h){ return h && h.date && h.gs; }).sort(function(a, b){ return a.date < b.date ? -1 : 1; });
  if(Hh.length){
    function jour(d){ return new Date(d + 'T12:00:00').getTime(); }
    function court(d){ return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}).replace('.', '').replace(/^1 /, '1er '); }
    var W = 800, Ht = 210, px = 40, pt = 30, pb = 34;
    var t0 = jour(Hh[0].date), t1 = jour(Hh[Hh.length - 1].date);
    var gmin = Math.min.apply(null, Hh.map(function(h){ return h.gs; })), gmax = Math.max.apply(null, Hh.map(function(h){ return h.gs; }));
    var bas = Math.floor((gmin - 5) / 5) * 5, haut = Math.ceil((gmax + 5) / 5) * 5;
    function X(h){ return Hh.length < 2 ? W / 2 : px + (jour(h.date) - t0) / Math.max(1, t1 - t0) * (W - 2 * px); }
    function Y(h){ return pt + (1 - (h.gs - bas) / Math.max(1, haut - bas)) * (Ht - pt - pb); }
    var pts = Hh.map(function(h){ return X(h).toFixed(1) + ',' + Y(h).toFixed(1); });
    var peu = Hh.length <= 8, svg = '<svg viewBox="0 0 ' + W + ' ' + Ht + '" role="img" aria-label="Courbe du GS : de ' + Hh[0].gs + ' à ' + Hh[Hh.length - 1].gs + '">' +
      '<defs><linearGradient id="g-degrade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#caa25a" stop-opacity=".28"/><stop offset="1" stop-color="#caa25a" stop-opacity="0"/></linearGradient></defs>' +
      [0, .5, 1].map(function(k){ var y = pt + k * (Ht - pt - pb); return '<line class="grille" x1="0" x2="' + W + '" y1="' + y + '" y2="' + y + '"/>'; }).join('');
    if(Hh.length > 1) svg += '<path class="aire" d="M' + pts[0].split(',')[0] + ',' + (Ht - pb) + ' L' + pts.join(' L') + ' L' + pts[pts.length - 1].split(',')[0] + ',' + (Ht - pb) + 'Z"/><polyline class="ligne" points="' + pts.join(' ') + '"/>';
    svg += Hh.map(function(h, i){
      var der = i === Hh.length - 1, x = X(h), y = Y(h), ancre = Hh.length < 2 ? 'middle' : i === 0 ? 'start' : der ? 'end' : 'middle';
      var tx = ancre === 'start' ? x - 6 : ancre === 'end' ? x + 6 : x;
      return '<circle class="' + (der ? 'der' : '') + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (der ? 6 : 4.5) + '"><title>' + court(h.date) + ' : ' + h.gs + ' GS</title></circle>' +
        ((peu || i === 0 || der) ? '<text class="v" x="' + tx + '" y="' + (y - 12) + '" text-anchor="' + ancre + '">' + h.gs + '</text><text x="' + tx + '" y="' + (Ht - 10) + '" text-anchor="' + ancre + '">' + court(h.date) + '</text>' : '');
    }).join('') + '</svg>';
    var gain = Hh[Hh.length - 1].gs - Hh[0].gs;
    html += '<article class="g-courbe"><header><div><span class="g-lab">Progression</span><h3>Courbe du GS</h3></div>' +
      '<div class="g-gain">' + (Hh.length > 1 ? '<b>+' + gain + ' GS</b>depuis le ' + court(Hh[0].date) : '<b>' + Hh[0].gs + ' GS</b>premier relevé') + '</div></header>' + svg +
      (Hh.length < 2 ? '<p class="g-leg">C\'est le premier point : la courbe se dessinera au fil des montées de GS.</p>' : '') + '</article>';
  }

  if(G.accessoires && G.accessoires.length){
    // Parcours d'une pièce : Kharazad I → X (DEC), puis échange contre une Ekleta au niveau visé = 11 étapes
    var A = G.accessoires, cible = ROM[G.niveauEkleta || 'IV'] || 4, ETAPES = 11, max = A.length * ETAPES;
    function ek(a){ return a.type === 'ekleta'; }
    function fini(a){ return ek(a) && (ROM[a.niv] || 0) >= cible; }
    function pts(a){ return ek(a) ? (fini(a) ? ETAPES : 10) : (ROM[a.niv] || 0); }
    var total = A.reduce(function(s, a){ return s + pts(a); }, 0);
    var nbFini = A.filter(fini).length;
    var aMonter = A.filter(function(a){ return !ek(a); });
    var nivRest = aMonter.reduce(function(s, a){ return s + (10 - (ROM[a.niv] || 0)); }, 0);
    var echanges = A.filter(function(a){ return !fini(a); }).length;
    var pct = Math.round(total / max * 100);
    var resume = nbFini + ' / ' + A.length + ' en Ekleta ' + esc(G.niveauEkleta || 'IV');
    if(nbFini < A.length) resume += ' · reste ' + (nivRest ? nivRest + ' niveau' + (nivRest > 1 ? 'x' : '') + ' de Kharazad, puis ' : '') + echanges + ' échange' + (echanges > 1 ? 's' : '');
    else resume += ' · objectif atteint !';
    html += '<article class="g-obj"><header><div><span class="g-lab">Objectif</span><h3>' + esc(G.objectif || '') + '</h3>' +
      (G.etapes ? '<p class="g-etapes">' + esc(G.etapes) + '</p>' : '') + '</div><span class="g-pct">' + pct + ' %</span></header>' +
      '<div class="g-bar g-bar-big"><i style="width:' + pct + '%"></i></div>' +
      '<p class="g-resume">' + resume + '</p>' +
      '<ul class="g-acc">' + A.map(function(a){
        var n = ek(a) ? 10 : (ROM[a.niv] || 0), f = fini(a);
        var etat = f ? 'Terminé' : ek(a) ? 'Ekleta à monter' : (a.niv === 'X' ? 'Prêt à échanger' : 'Kharazad → DEC');
        return '<li class="' + (f ? 'ekleta' : ek(a) ? 'k' : (a.niv === 'X' ? 'fini' : 'k')) + '"><span class="g-place">' + esc(a.place) + '</span>' +
          '<span class="g-nom">' + (a.niv ? '<b>' + esc(a.niv) + '</b> ' : '') + esc(a.nom) + '<small class="g-tag">' + etat + '</small></span>' +
          '<span class="g-pips" aria-label="' + etat + '">' +
          new Array(11).join('.').split('').map(function(_, i){ return '<i class="' + (i < n ? 'on' : '') + '"></i>'; }).join('') +
          '<span class="g-swap' + (f ? ' on' : '') + '" title="' + (f ? 'Échangée contre une Ekleta ' : 'À échanger contre une Ekleta ') + esc(G.niveauEkleta || 'IV') + '">' +
            (f ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>') +
            'Ekleta ' + esc(G.niveauEkleta || 'IV') + '</span></span></li>';
      }).join('') + '</ul>' +
      '<p class="g-leg">Losanges : niveaux de la Kharazad jusqu\'au DEC · case dorée « Ekleta ' + esc(G.niveauEkleta || 'IV') + ' » : pièce échangée.</p></article>';
  }
  if(G.stuff && G.stuff.length){
    html += '<details class="g-stuff"><summary>Le reste du stuff</summary><ul>' + G.stuff.map(function(s){
      return '<li><span class="g-place">' + esc(s.place) + '</span><span>' + (s.niv ? '<b>' + esc(s.niv) + '</b> ' : '') + esc(s.nom) + '</span></li>';
    }).join('') + '</ul></details>';
  }
  box.innerHTML = html;
  var m = document.getElementById('gear-maj'); if(m) m.textContent = G.maj;
})();
