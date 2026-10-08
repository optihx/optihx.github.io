/* Wuthering Waves — compteur de tirages (bannière de perso limité).
   Règles du jeu : 160 Astrite = 1 tirage, un 5★ garanti au plus tard au 80e tirage,
   50 / 50 pour avoir le perso mis en avant (sinon le suivant est garanti). */
(function(){
  var box = document.getElementById('tirages');
  if(!box) return;
  var KEY = 'optih-wuwa-tirages';
  var st;
  try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){ st = null; }
  st = st || {astrite: 0, tickets: 0, pity: 0, garanti: false};
  if(st.quoti == null){ st.quoti = true; st.lunite = false; st.abysse = true; st.autres = 0; st.cible = ''; }

  /* Prévoir : les dates possibles (débuts de phase à venir, version suivante) */
  var C = window.CALENDRIER || {}, RS = window.WUWA_RESETS, RES = window.RESONATEURS || [];
  var nomR = {}; RES.forEach(function(r){ nomR[r.s] = r.n || r.nom || r.s; });
  function loc(x){ var q = x.split('-'); return new Date(+q[0], +q[1] - 1, +q[2]).getTime(); }
  function court(t){ return new Date(t).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}).replace('.', ''); }
  var CIBLES = [];
  (C.phases || []).forEach(function(ph){
    if(loc(ph.debut) > Date.now()){
      var nv = (ph.persos || []).filter(function(x){ return x.nouveau; }).map(function(x){ return nomR[x.s]; });
      CIBLES.push({v: ph.debut, t: loc(ph.debut), n: ph.nom + (nv.length ? ' · ' + nv.join(', ') : '') + ' (' + court(loc(ph.debut)) + ')'});
    }
  });
  if(C.suivante && C.suivante.date && loc(C.suivante.date) > Date.now()) CIBLES.push({v: C.suivante.date, t: loc(C.suivante.date), n: 'Version ' + C.suivante.nom + ' (' + court(loc(C.suivante.date)) + ')'});
  if(st.cible && !CIBLES.some(function(c){ return c.v === st.cible; })) st.cible = '';
  function gains(){
    var c = CIBLES.filter(function(x){ return x.v === st.cible; })[0];
    if(!c || !RS) return null;
    var now = Date.now(), j = RS.combien('jour', now, c.t), R = C.resets || {}, g = {jours: j, total: 0, cible: c};
    if(st.quoti) g.total += j * 60;
    if(st.lunite) g.total += j * 90;
    if(st.abysse){ ['tour', 'wastes'].forEach(function(k){ if(R[k]) g.total += RS.combien(R[k], now, c.t) * (R[k].astrite || 0); }); }
    g.total += st.autres || 0;
    return g;
  }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(e){} }
  function fmt(n){ return Math.max(0, Math.round(n)).toLocaleString('fr-FR'); }

  box.innerHTML =
    '<div class="tr-form">' +
      '<label><span class="lab">Astrite</span><input type="number" min="0" step="10" data-k="astrite" value="' + st.astrite + '"></label>' +
      '<label><span class="lab">Marées radiantes (tickets)</span><input type="number" min="0" data-k="tickets" value="' + st.tickets + '"></label>' +
      '<label><span class="lab">Tirages depuis ton dernier 5★</span><input type="number" min="0" max="79" data-k="pity" value="' + st.pity + '"></label>' +
      '<label class="tr-check"><input type="checkbox" data-k="garanti"' + (st.garanti ? ' checked' : '') + '><span>Mon prochain 5★ est garanti<small>(j\'ai perdu le 50 / 50 la dernière fois)</small></span></label>' +
      (CIBLES.length ? '<fieldset class="tr-prevoir"><legend>Prévoir pour plus tard</legend>' +
        '<label class="tr-plein"><span class="lab">Combien j\'aurai…</span><select data-k="cible"><option value="">Maintenant</option>' +
          CIBLES.map(function(c){ return '<option value="' + c.v + '"' + (st.cible === c.v ? ' selected' : '') + '>Au début de : ' + c.n + '</option>'; }).join('') + '</select></label>' +
        '<label class="tr-check"><input type="checkbox" data-k="quoti"' + (st.quoti ? ' checked' : '') + '><span>Missions quotidiennes<small>60 Astrite par jour</small></span></label>' +
        '<label class="tr-check"><input type="checkbox" data-k="lunite"' + (st.lunite ? ' checked' : '') + '><span>Abonnement Lunite<small>90 Astrite par jour</small></span></label>' +
        '<label class="tr-check"><input type="checkbox" data-k="abysse"' + (st.abysse ? ' checked' : '') + '><span>Tour + Whimpering Wastes<small>800 Astrite à chaque reset (si tu fais tout)</small></span></label>' +
        '<label><span class="lab">Autres gains prévus (événements…)</span><input type="number" min="0" step="10" data-k="autres" value="' + (st.autres || 0) + '"></label>' +
      '</fieldset>' : '') +
    '</div><div class="tr-res" id="tr-res" aria-live="polite"></div>';
  var res = box.querySelector('#tr-res');

  /* Chance d'avoir le perso mis en avant avec N tirages.
     Modèle : 0,8 % par tirage jusqu'au 65e, puis +2 % à chaque tirage (« soft pity »), 5★ sûr au 80e,
     50 / 50 puis garanti. La courbe exacte n'est pas publiée : ce modèle redonne le taux moyen officiel (1,8 %). */
  function taux(k){ return k >= 80 ? 1 : k < 66 ? 0.008 : 0.008 + 0.02 * (k - 65); }
  function chance(n, pity, garanti){
    var etats = {}, ok = 0; etats[pity + '|' + (garanti ? 1 : 0)] = 1;
    for(var i = 0; i < n; i++){
      var suiv = {};
      Object.keys(etats).forEach(function(k){
        var m = etats[k], c = +k.split('|')[0], g = k.split('|')[1] === '1', p = taux(c + 1);
        if(g) ok += m * p; else { ok += m * p / 2; var kp = '0|1'; suiv[kp] = (suiv[kp] || 0) + m * p / 2; }
        var kr = (c + 1) + '|' + (g ? 1 : 0); if(p < 1) suiv[kr] = (suiv[kr] || 0) + m * (1 - p);
      });
      etats = suiv;
    }
    return Math.min(1, ok);
  }
  function render(){
    var g = gains(), ast = st.astrite + (g ? g.total : 0);
    var tir = Math.floor(ast / 160) + st.tickets;
    var pity = Math.min(79, Math.max(0, st.pity));
    var auPire = (st.garanti ? 80 : 160) - pity;     // tirages pour être SÛR d'avoir le perso
    var auMieux = 80 - pity;                          // 5★ garanti (perso ou pas, si 50/50)
    var manque = Math.max(0, auPire - tir);
    var pct = Math.min(100, tir / auPire * 100);
    res.innerHTML =
      '<div class="tr-big"><span class="lab">' + (g ? 'Le ' + court(g.cible.t) + ', tu auras environ' : 'Tu as') + '</span><b>' + fmt(tir) + '</b><span>tirage' + (tir > 1 ? 's' : '') + '</span></div>' +
      (g ? '<p class="tr-gain">+ ' + fmt(g.total) + ' Astrite gagnées d\'ici là (' + g.jours + ' jour' + (g.jours > 1 ? 's' : '') + ') · ' + fmt(ast) + ' Astrite au total</p>' : '') +
      '<p class="tr-chance"><b>' + Math.round(chance(tir, pity, st.garanti) * 100) + ' %</b> de chances d\'avoir le perso avec ' + (tir > 1 ? 'ces ' + fmt(tir) + ' tirages' : 'ce tirage') + ' <small>(estimation)</small></p>' +
      '<div class="tr-bar" role="img" aria-label="' + Math.round(pct) + ' % de l\'objectif"><i style="width:' + pct + '%"></i></div>' +
      '<ul class="tr-list">' +
        '<li><span>Prochain 5★ garanti dans</span><b>' + fmt(auMieux) + ' tirages</b></li>' +
        '<li><span>Perso de la bannière sûr à 100 % dans</span><b>' + fmt(auPire) + ' tirages</b></li>' +
        '<li class="' + (manque ? 'manque' : 'ok') + '"><span>' + (manque ? 'Il te manque' : 'Tu as assez pour être sûr') + '</span><b>' + (manque ? fmt(manque) + ' tirages · ' + fmt(manque * 160) + ' Astrite' : '✓') + '</b></li>' +
      '</ul>' +
      '<p class="tr-note">Dans les faits, le 5★ tombe souvent vers 65-75 tirages (« soft pity »). ' + (st.garanti ? 'Ton prochain 5★ sera le perso mis en avant.' : 'Au 50 / 50, tu as une chance sur deux d\'avoir le perso mis en avant.') + '</p>';
  }
  box.addEventListener('input', function(e){
    var t = e.target; if(!t.dataset.k) return;
    st[t.dataset.k] = t.type === 'checkbox' ? t.checked : t.tagName === 'SELECT' ? t.value : Math.max(0, parseInt(t.value, 10) || 0);
    save(); render();
  });
  box.addEventListener('change', function(e){ var t = e.target; if(t.type === 'checkbox' && t.dataset.k){ st[t.dataset.k] = t.checked; save(); render(); } });
  render();
})();
