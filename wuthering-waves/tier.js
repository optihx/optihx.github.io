/* Wuthering Waves — affichage de la tier list (données : data-tier.js) */
(function(){
  var T = window.TIER, R = window.RESONATEURS || [];
  var box = document.getElementById('tier-list');
  if(!T || !box) return;
  var EL = {Aero:'#2f9e80',Fusion:'#d9573f',Glacio:'#3a93cf',Electro:'#8d5ccf',Spectro:'#b8932a',Havoc:'#a8436f'};
  var by = {}; R.forEach(function(r){ by[r.s] = r; });
  var COLS = [['dps','DPS'],['hyb','Hybride'],['sup','Support']];
  var role = 'tous';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function pers(s){
    var r = by[s]; if(!r) return '';
    return '<a class="tl-p" href="#fiche-' + s + '" style="--c:' + EL[r.el] + '" title="' + esc(r.n) + ' · ' + esc(r.el) + '"><img src="img/res/' + r.img + '.webp" alt="" loading="lazy" width="300" height="412"><span>' + esc(r.n) + '</span></a>';
  }
  function render(){
    box.innerHTML = T.rangs.map(function(g, i){
      var cols = COLS.filter(function(c){ return role === 'tous' || role === c[0]; });
      var n = cols.reduce(function(a, c){ return a + g[c[0]].length; }, 0);
      if(!n) return '';
      return '<div class="tl-row" style="--k:' + i + '"><div class="tl-rank"><b>' + g.t + '</b><span>' + esc(g.nom) + '</span></div>' +
        '<div class="tl-cols' + (role === 'tous' ? '' : ' one') + '">' + cols.map(function(c){
          return '<div class="tl-col' + (g[c[0]].length ? '' : ' vide') + '"><span class="tl-ct">' + c[1] + '</span><div class="tl-ps">' + (g[c[0]].map(pers).join('') || '<span class="tl-none">—</span>') + '</div></div>';
        }).join('') + '</div></div>';
    }).join('') +
    (T.bientot && T.bientot.length ? '<p class="tl-soon">Pas encore classé (sortie à venir) : ' + T.bientot.map(function(s){ return by[s] ? '<a href="#fiche-' + s + '">' + esc(by[s].n) + '</a>' : ''; }).join(', ') + '.</p>' : '');
  }
  var tabs = document.getElementById('tier-roles');
  if(tabs) tabs.addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return;
    role = b.dataset.r;
    [].forEach.call(tabs.children, function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    render();
  });
  var maj = document.getElementById('tier-maj'); if(maj) maj.textContent = T.maj;
  render();
})();
