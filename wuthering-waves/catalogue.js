/* ==========================================================
   Wuthering Waves — catalogue des résonateurs
   Les données sont dans data-resonateurs.js (window.RESONATEURS).
   Une fiche s'ouvre au clic, ou directement avec un lien
   du type  index.html#fiche-lupa
   ========================================================== */
(function(){
  var R = window.RESONATEURS || [];
  var grid = document.getElementById('res-grid');
  if(!grid || !R.length) return;

  var EL = {Aero:'#2f9e80',Fusion:'#d9573f',Glacio:'#3a93cf',Electro:'#8d5ccf',Spectro:'#b8932a',Havoc:'#a8436f'};
  var MA_TEAM = ['changli','lupa','shorekeeper'];
  var bySlug = {}; R.forEach(function(r){ bySlug[r.s] = r; });
  /* rang dans la tier list (data-tier.js) */
  var TIER = {};
  if(window.TIER) window.TIER.rangs.forEach(function(g){ ['dps','hyb','sup'].forEach(function(k){ g[k].forEach(function(s){ if(!TIER[s]) TIER[s] = g.t; }); }); });
  var state = {q:'', el:'', w:'', ro:'', r:'', own:''};
  var PO = window.POSSEDES || {a:function(){return false;}, basculer:function(){}, liste:function(){return [];}, tout:function(){}, rien:function(){}};
  var shown = R.slice();

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function img(r){ return 'img/res/' + r.img + '.webp'; }
  function norm(s){ return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''); }
  function roleGroup(ro){ return ro === 'Buffeur' || ro === 'Bouclier' ? 'Support' : ro; }

  /* ---------- Filtres ---------- */
  var bar = document.getElementById('res-filtres');
  var groups = [
    {k:'el', t:'Élément', v:['Aero','Electro','Fusion','Glacio','Havoc','Spectro']},
    {k:'w',  t:'Arme',    v:['Sabre','Épée','Pistolets','Gantelets','Amplificateur']},
    {k:'ro', t:'Rôle',    v:['DPS principal','Sous-DPS','Support','Soigneur']},
    {k:'r',  t:'Rareté',  v:['5','4']},
    {k:'own', t:'Mes persos', v:['oui','non']}
  ];
  bar.innerHTML = groups.map(function(g){
    return '<div class="f-group" role="group" aria-label="' + g.t + '"><span class="f-title">' + g.t + '</span>' +
      g.v.map(function(v){
        var lab = g.k === 'r' ? v + ' ★' : g.k === 'own' ? (v === 'oui' ? 'Je les ai' : 'Pas encore') : v;
        var dot = g.k === 'el' ? '<i style="--c:' + EL[v] + '"></i>' : '';
        return '<button type="button" class="f-chip" data-k="' + g.k + '" data-v="' + esc(v) + '" aria-pressed="false">' + dot + esc(lab) + '</button>';
      }).join('') + '</div>';
  }).join('');
  bar.addEventListener('click', function(e){
    var b = e.target.closest('.f-chip'); if(!b) return;
    var k = b.dataset.k, v = b.dataset.v;
    state[k] = state[k] === v ? '' : v;
    [].forEach.call(bar.querySelectorAll('.f-chip[data-k="' + k + '"]'), function(x){ x.setAttribute('aria-pressed', x.dataset.v === state[k] ? 'true' : 'false'); });
    render();
  });
  var search = document.getElementById('res-search');
  search.addEventListener('input', function(){ state.q = norm(search.value.trim()); render(); });
  var reset = document.getElementById('res-reset');
  reset.addEventListener('click', function(){
    state = {q:'', el:'', w:'', ro:'', r:'', own:''}; search.value = '';
    [].forEach.call(bar.querySelectorAll('.f-chip'), function(x){ x.setAttribute('aria-pressed','false'); });
    render();
  });
  var count = document.getElementById('res-count');

  function match(r){
    if(state.el && r.el !== state.el) return false;
    if(state.w && r.w !== state.w) return false;
    if(state.r && String(r.r) !== state.r) return false;
    if(state.own && PO.a(r.s) !== (state.own === 'oui')) return false;
    if(state.ro && !r.ro.some(function(x){ return roleGroup(x) === state.ro; })) return false;
    if(state.q){
      var hay = norm([r.n, r.el, r.w, r.set, r.setEn, r.echo, r.echoEn].concat(r.ro, r.wp.map(function(w){ return w[0] + ' ' + (w[2] || ''); })).join(' '));
      if(hay.indexOf(state.q) < 0) return false;
    }
    return true;
  }

  function avatar(m, cls){
    var r = m.s && bySlug[m.s];
    if(r) return '<img class="' + cls + '" src="' + img(r) + '" alt="' + esc(r.n) + '" title="' + esc(r.n) + '" loading="lazy" width="300" height="412">';
    return '<span class="' + cls + ' none" title="' + esc(m.n) + '">' + esc(m.n.charAt(0)) + '</span>';
  }

  function card(r){
    var team = r.t[0] ? r.t[0].m.filter(function(m){ return m.s !== r.s; }).slice(0,2) : [];
    var mine = MA_TEAM.indexOf(r.s) > -1;
    return '<li><a class="r-card" href="#fiche-' + r.s + '" data-s="' + r.s + '" style="--c:' + EL[r.el] + '">' +
      '<span class="r-pic"><img src="' + img(r) + '" alt="" loading="lazy" width="300" height="412">' +
        '<span class="r-el"><i></i>' + esc(r.el) + '</span>' +
        (mine ? '<span class="r-mine">Ma team</span>' : '') +
        '<span class="r-rar" aria-label="' + r.r + ' étoiles">' + r.r + '★</span>' +
        (TIER[r.s] ? '<span class="r-tier" title="Rang dans la tier list">' + TIER[r.s] + '</span>' : '') + '</span>' +
      '<span class="r-body"><strong>' + esc(r.n) + '</strong>' +
        '<span class="r-meta">' + esc(r.w) + ' · ' + esc(r.ro[0] || '') + '</span>' +
        '<span class="r-set">' + esc(r.set || '—') + '</span>' +
        (team.length ? '<span class="r-team"><em>avec</em>' + team.map(function(m){ return avatar(m,'mini'); }).join('') + '</span>' : '') +
      '</span></a>' + boutonOwn(r, 'r-own') + '</li>';
  }
  function boutonOwn(r, cls){
    var o = PO.a(r.s);
    return '<button type="button" class="' + cls + (o ? ' oui' : '') + '" data-own="' + r.s + '" aria-pressed="' + o + '" aria-label="' + (o ? 'Je l\'ai : retirer ' : 'Je l\'ai : ajouter ') + esc(r.n) + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true">' + (o ? '<path d="M5 12.5l4.5 4.5L19 7.5"/>' : '<path d="M12 5v14M5 12h14"/>') + '</svg><span>' + (o ? 'Je l\'ai' : 'Je l\'ai ?') + '</span></button>';
  }

  function render(){
    shown = R.filter(match);
    grid.innerHTML = shown.map(card).join('');
    var n = shown.length;
    count.textContent = n + (n > 1 ? ' résonateurs' : ' résonateur');
    var nb = PO.liste().length;
    var ownInfo = document.getElementById('res-own');
    if(ownInfo) ownInfo.textContent = nb ? nb + ' perso' + (nb > 1 ? 's' : '') + ' coché' + (nb > 1 ? 's' : '') : 'Coche les persos que tu as';
    var active = state.q || state.el || state.w || state.ro || state.r || state.own;
    reset.hidden = !active;
    document.getElementById('res-vide').hidden = n > 0;
  }
  render();

  /* « Je l'ai » : clic sur le bouton d'une carte ou de la fiche */
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-own]'); if(!b) return;
    e.preventDefault(); e.stopPropagation();
    PO.basculer(b.dataset.own);
  }, true);
  document.addEventListener('possedes', function(){
    render();
    var fb = document.querySelector('.fiche .f-own'); if(fb && current) fb.outerHTML = boutonOwn(current, 'f-own');
  });
  var tout = document.getElementById('res-own-tout'), rien = document.getElementById('res-own-rien');
  if(tout) tout.addEventListener('click', function(){ PO.tout(R.map(function(r){ return r.s; })); });
  if(rien) rien.addEventListener('click', function(){ PO.rien(); });

  /* ---------- Fiche ---------- */
  var dlg = document.getElementById('fiche');
  var body = dlg.querySelector('.f-body');
  var current = null, lastFocus = null;

  function en(enName, frName){ return enName && enName !== frName ? '<span class="en">EN : ' + esc(enName) + '</span>' : ''; }
  function list(arr){ return arr.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join(''); }

  function fiche(r){
    var c = EL[r.el];
    var max = r.wp.reduce(function(m,w){ return Math.max(m, w[1]); }, 0) || 100;
    var html = '';
    html += '<header class="f-head" style="--c:' + c + '">' +
      '<div class="f-splash"><img src="img/res/' + r.img + '-splash.webp" alt=""></div>' +
      '<img class="f-portrait" src="' + img(r) + '" alt="" width="300" height="412">' +
      '<div class="f-id"><span class="f-kicker"><i></i>' + esc(r.el) + ' · ' + esc(r.w) + ' · ' + r.r + '★' + (TIER[r.s] ? ' · <a class="f-tier" href="#tier">Tier ' + TIER[r.s] + '</a>' : '') + '</span>' +
      '<h3 id="fiche-titre">' + esc(r.n) + '</h3>' +
      '<p class="f-roles">' + r.ro.map(function(x){ return '<span>' + esc(x) + '</span>'; }).join('') +
      (MA_TEAM.indexOf(r.s) > -1 ? '<span class="mine">Dans ma team</span>' : '') + '</p>' + boutonOwn(r, 'f-own') + '</div></header>';

    html += '<div class="f-content" style="--c:' + c + '">';

    /* Échos */
    html += '<section class="f-sec"><h4>Échos</h4><div class="f-echos">' +
      '<div class="f-box"><span class="lab">Set conseillé</span><strong>' + esc(r.set || '—') + '</strong>' + en(r.setEn, r.set) +
        (r.setAlt.length ? '<span class="alt">Alternative : ' + r.setAlt.map(esc).join(' · ') + '</span>' : '') + '</div>' +
      '<div class="f-box"><span class="lab">Écho principal</span><strong>' + esc(r.echo || 'Au choix (selon le set)') + '</strong>' + en(r.echoEn, r.echo) + '</div>' +
      '</div>';
    if(r.cost.length){
      html += '<span class="lab">Stat principale par écho</span><ol class="f-costs">' + r.cost.map(function(x){
        return '<li><b>' + x[0] + '</b><span>' + esc(x[1]) + '</span></li>';
      }).join('') + '</ol>';
    }
    html += '</section>';

    /* Substats + stats visées */
    html += '<section class="f-sec f-two">';
    html += '<div><h4>Substats</h4><p class="hint">Par ordre de priorité.</p><ol class="f-subs">' + list(r.subs) + '</ol></div>';
    if(r.end.length){
      html += '<div><h4>Stats visées</h4><p class="hint">En fin de jeu, buffs non compris.</p><dl class="f-end">' + r.end.map(function(e){
        return '<div><dt>' + esc(e[0]) + '</dt><dd>' + esc(e[1]) + '</dd></div>';
      }).join('') + '</dl></div>';
    }
    html += '</section>';

    /* Armes */
    if(r.wp.length){
      html += '<section class="f-sec"><h4>Armes</h4><p class="hint">Performance relative, la meilleure = 100 %.</p><ul class="f-weap">' + r.wp.map(function(w, i){
        var p = Math.round(w[1] / max * 1000) / 10;
        return '<li' + (i === 0 ? ' class="best"' : '') + '><span class="nm"' + (w[2] && w[2] !== w[0] ? ' title="En anglais : ' + esc(w[2]) + '"' : '') + '>' + esc(w[0]) + (w[2] && w[2] !== w[0] ? '<small>' + esc(w[2]) + '</small>' : '') + '</span><span class="bar"><i style="width:' + p + '%"></i></span><span class="pc">' + String(p).replace('.', ',') + ' %</span></li>';
      }).join('') + '</ul>' +
      (r.f2p ? '<p class="f-f2p"><span>Option gratuite</span>' + esc(r.f2p) + '</p>' : '') + '</section>';
    }

    /* Équipes */
    if(r.t.length){
      html += '<section class="f-sec"><h4>Meilleures équipes</h4><div class="f-teams">' + r.t.map(function(t, i){
        return '<div class="f-team"><span class="lab">' + (i === 0 ? '<b>1er choix</b> · ' : '') + esc(t.l) + '</span><ul>' + t.m.map(function(m){
          var o = m.s && bySlug[m.s];
          var inner = avatar(m, 'av') + '<span>' + esc(o ? o.n : m.n) + '</span>';
          if(o && m.s !== r.s) return '<li><button type="button" class="f-mem" data-s="' + m.s + '" style="--c:' + EL[o.el] + '">' + inner + '</button></li>';
          return '<li><span class="f-mem' + (m.s === r.s ? ' self' : '') + '" style="--c:' + (o ? EL[o.el] : '#999') + '">' + inner + '</span></li>';
        }).join('') + '</ul></div>';
      }).join('') + '</div></section>';
    }

    /* Compétences */
    if(r.sk.length){
      html += '<section class="f-sec"><h4>Priorité des compétences</h4><ol class="f-skill">' + list(r.sk) + '</ol></section>';
    }

    html += '<p class="f-src">Données : wuwabuild.com (d\'après prydwen.gg), mises à jour le 1er octobre 2026. Noms des échos, sets et armes : version française du jeu (nom anglais en petit, pour lire les guides en anglais).</p>';
    html += '</div>';
    return html;
  }

  function open(slug, push){
    var r = bySlug[slug]; if(!r) return;
    current = r;
    body.innerHTML = fiche(r);
    body.scrollTop = 0;
    updateNav();
    if(!dlg.open){
      lastFocus = document.activeElement;
      dlg.showModal();
      document.documentElement.classList.add('fiche-ouverte');
    }
    dlg.querySelector('.f-close').focus({preventScroll:true});
    if(push !== false && location.hash !== '#fiche-' + slug) history.replaceState(null, '', '#fiche-' + slug);
  }
  function close(){
    if(!dlg.open) return;
    dlg.classList.add('sortie');
    setTimeout(function(){
      dlg.classList.remove('sortie'); dlg.close();
    }, 220);
  }
  dlg.addEventListener('close', function(){
    document.documentElement.classList.remove('fiche-ouverte');
    if(/^#fiche-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    if(lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true});
  });
  dlg.addEventListener('cancel', function(e){ e.preventDefault(); close(); });
  dlg.addEventListener('click', function(e){
    if(e.target === dlg) return close();
    var tl = e.target.closest('a.f-tier');
    if(tl){ e.preventDefault(); close(); setTimeout(function(){ if(window.ongletWuwa) window.ongletWuwa('tier', 'force'); }, 260); return; }
    var m = e.target.closest('.f-mem[data-s]'); if(m) return open(m.dataset.s);
  });
  dlg.querySelector('.f-close').addEventListener('click', close);

  /* Précédent / suivant dans la liste filtrée */
  var prev = dlg.querySelector('.f-prev'), next = dlg.querySelector('.f-next');
  function neighbours(){
    var l = shown.indexOf(current) > -1 ? shown : R, i = l.indexOf(current);
    return {l:l, i:i};
  }
  function updateNav(){
    var o = neighbours();
    var p = o.l[(o.i - 1 + o.l.length) % o.l.length], n = o.l[(o.i + 1) % o.l.length];
    prev.querySelector('span').textContent = p.n; next.querySelector('span').textContent = n.n;
    prev.dataset.s = p.s; next.dataset.s = n.s;
  }
  prev.addEventListener('click', function(){ open(prev.dataset.s); });
  next.addEventListener('click', function(){ open(next.dataset.s); });
  dlg.addEventListener('keydown', function(e){
    if(e.target.matches('input,textarea')) return;
    if(e.key === 'ArrowLeft'){ e.preventDefault(); open(prev.dataset.s); }
    if(e.key === 'ArrowRight'){ e.preventDefault(); open(next.dataset.s); }
  });

  /* Ouverture depuis la grille, la team ou un lien #fiche-... */
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#fiche-"]'); if(!a) return;
    e.preventDefault(); open(a.getAttribute('href').slice(7));
  });
  function fromHash(){ var m = location.hash.match(/^#fiche-([a-z0-9-]+)$/); if(m && bySlug[m[1]]) open(m[1], false); }
  addEventListener('hashchange', fromHash);
  fromHash();
})();
