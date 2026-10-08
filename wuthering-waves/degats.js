/* ==========================================================
   Wuthering Waves — simulateur de dégâts d'une team de 3.
   Données : data-degats.js (stats niveau 90, compétences niveau 10, armes)
             + data-resonateurs.js (build conseillé de chaque perso).
   Modèle simplifié et transparent :
   dégâts = stat de base × multiplicateur × (1 + bonus) × (1 + amplification)
            × espérance de critique × défense ennemie × résistance ennemie.
   ========================================================== */
(function(){
  var D = window.DEGATS, R = window.RESONATEURS || [];
  var root = document.getElementById('degats');
  if(!D || !root || !R.length) return;

  var EL = {Aero:'#2f9e80',Fusion:'#d9573f',Glacio:'#3a93cf',Electro:'#8d5ccf',Spectro:'#b8932a',Havoc:'#a8436f'};
  var TYPES = {na:'Attaques normales', comp:'Compétence résonatrice', lib:'Libération résonatrice', forte:'Circuit Forte', intro:"Compétence d'Intro", outro:"Compétence d'Outro"};
  var ORDRE = ['intro','na','comp','forte','lib','outro'];
  var QUAL = {
    correcte:   {nom:'Correcte',   tc:25, dc:50, pct:20, flat:60},
    bonne:      {nom:'Bonne',      tc:35, dc:70, pct:25, flat:80},
    excellente: {nom:'Excellente', tc:45, dc:90, pct:30, flat:100}
  };
  var KEY = 'optih-wuwa-degats';
  var by = {}; R.forEach(function(r){ by[r.s] = r; });
  var ARMES = D.armes, P = D.persos;
  var armeParEn = {}; Object.keys(ARMES).forEach(function(id){ armeParEn[norm(ARMES[id].en)] = id; });

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function norm(s){ return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function fmt(n){ return Math.round(n).toLocaleString('fr-FR'); }
  function court(n){ return n >= 1e6 ? (n / 1e6).toLocaleString('fr-FR', {maximumFractionDigits: 2}) + ' M' : n >= 1e3 ? Math.round(n / 1e3).toLocaleString('fr-FR') + ' k' : fmt(n); }
  function img(r){ return 'img/res/' + r.img + '.webp'; }
  function dispo(s){ return !!(P[s] && by[s]); }

  /* ---------- Membre par défaut ---------- */
  function armeConseillee(s){
    var r = by[s], p = P[s];
    for(var i = 0; r && i < r.wp.length; i++){ var id = armeParEn[norm(r.wp[i][2] || r.wp[i][0])]; if(id && ARMES[id].t === p.arme) return id; }
    var l = Object.keys(ARMES).filter(function(id){ return ARMES[id].t === p.arme; }).sort(function(a, b){ return ARMES[b].r - ARMES[a].r || ARMES[b].atk - ARMES[a].atk; });
    return l[0];
  }
  function rotationDefaut(s){
    var rot = {};
    var na = false;
    P[s].sk.forEach(function(k, i){ k.a.forEach(function(a, j){ rot[i + '.' + j] = a[2]; if(k.t === 'na' && a[2]) na = true; }); });
    if(!na){ // pas de combo de base repérée : on prend les 4 premières attaques normales simples
      var n = 0;
      P[s].sk.forEach(function(k, i){ if(k.t !== 'na') return; k.a.forEach(function(a, j){ if(n < 4 && !/a[ée]rienne|plongeante|lourde|esquive|Appui|Contre/i.test(a[0])){ rot[i + '.' + j] = 1; n++; } }); });
    }
    return rot;
  }
  function membre(s){ return s && dispo(s) ? {s:s, arme:armeConseillee(s), qual:'bonne', rot:rotationDefaut(s)} : null; }

  /* ---------- État (enregistré dans le navigateur) ---------- */
  var st;
  try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){ st = null; }
  if(!st || !Array.isArray(st.m)){
    var t = null; try { t = JSON.parse(localStorage.getItem('optih-wuwa-team') || 'null'); } catch(e){}
    st = {m: (Array.isArray(t) && t.length === 3 ? t : ['changli','lupa','shorekeeper']).map(membre), niv:90, res:10, bonus:0, ampli:0, atq:0};
  }
  var lien = new URLSearchParams(location.search).get('team');
  if(lien){ var tl = lien.split(',').slice(0, 3); while(tl.length < 3) tl.push(''); st.m = tl.map(function(x){ return membre(x); }); }
  st.m = st.m.map(function(m){ return m && dispo(m.s) && ARMES[m.arme] ? m : (m && dispo(m.s) ? membre(m.s) : null); });
  if(st.soin === undefined) st.soin = true;
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(e){} }

  /* ---------- Calcul ---------- */
  function mainStat3(r){
    var c = (r.cost || []).filter(function(x){ return x[0] === 3; })[0];
    var t = c ? c[1] : 'Bonus dgt';
    return /^Bonus dgt/.test(t) ? 'el' : /^ATQ/.test(t) ? 'atq' : /^PV/.test(t) ? 'pv' : /^DÉF/.test(t) ? 'def' : 'rec';
  }
  function stats(m){
    var r = by[m.s], p = P[m.s], w = ARMES[m.arme], q = QUAL[m.qual] || QUAL.bonne;
    var base = p.base;                    // stat qui fait les dégâts : atq, pv ou def
    var tc = 5 + 8, dc = 150, el = 10 + st.bonus;             // base + arbre de compétences (≈ +8 % taux CRIT) + set 2 pièces (+10 %)
    var bonusPct = {atq: 12 + st.atq, pv: 0, def: 0};          // arbre de compétences (≈ +12 % ATQ) + buffs d'équipe
    if(w.s === 'tc') tc += w.v; else if(w.s === 'dc') dc += w.v; else if(w.s === 'atq' || w.s === 'pv' || w.s === 'def') bonusPct[w.s] += w.v;
    var m3 = mainStat3(r);
    if(m3 === 'el') el += 60; else if(m3 === base) bonusPct[base] += 60;
    bonusPct[base] += base === 'pv' ? 45.6 : 36;     // 2 échos coût 1
    bonusPct[base] += q.pct;
    tc += q.tc; dc += q.dc;
    // écho coût 4 : Taux CRIT (22 %) ou Dgt CRIT (44 %), on garde le meilleur
    var a = 1 + Math.min(tc + 22, 100) / 100 * (dc / 100 - 1), b = 1 + Math.min(tc, 100) / 100 * ((dc + 44) / 100 - 1);
    if(a >= b) tc += 22; else dc += 44;
    var flatAtq = 150 + 200 + q.flat;
    var atq = (p.atk + w.atk) * (1 + bonusPct.atq / 100) + flatAtq;
    var pv = p.pv * (1 + bonusPct.pv / 100) + 2280 * 2;
    var def = p.def * (1 + bonusPct.def / 100);
    if(m.vrai){   // stats lues sur l'écran du perso dans le jeu
      var v = m.vrai;
      if(v.base > 0){ if(base === 'pv') pv = v.base; else if(base === 'def') def = v.base; else atq = v.base * (1 + st.atq / 100); }
      if(v.tc >= 0) tc = v.tc; if(v.dc > 0) dc = v.dc; if(v.el >= 0) el = v.el + st.bonus;
    }
    var src = base === 'pv' ? pv : base === 'def' ? def : atq;
    var crit = 1 + Math.min(tc, 100) / 100 * (dc / 100 - 1);
    var defMult = (800 + 8 * 90) / (800 + 8 * 90 + 8 * st.niv + 792);
    var resMult = 1 - st.res / 100;
    var k = src * (1 + el / 100) * (1 + st.ampli / 100) * crit * defMult * resMult / 100;
    return {atq:atq, pv:pv, def:def, base:base, tc:tc, dc:dc, el:el, k:k};
  }
  function calc(m){
    var s = stats(m), p = P[m.s], tot = 0, parType = {}, top = {n:'', v:0}, lignes = [];
    p.sk.forEach(function(k, i){
      k.a.forEach(function(a, j){
        var n = +(m.rot[i + '.' + j] || 0), v = a[1] * s.k;
        if(v > top.v) top = {n:a[0], v:v};
        tot += v * n; parType[k.t] = (parType[k.t] || 0) + v * n;
        lignes.push({i:i, j:j, v:v, n:n});
      });
    });
    return {s:s, tot:tot, parType:parType, top:top, lignes:lignes};
  }

  /* ---------- Affichage ---------- */
  var $ = function(sel){ return root.querySelector(sel); };
  var slots = $('#dg-slots'), res = $('#dg-res'), det = $('#dg-details');
  var ouverts = {};
  var PO = window.POSSEDES || {a:function(){return true;}, vide:function(){return true;}};
  function estSoin(s){ var r = by[s]; return r && r.ro.indexOf('Soigneur') > -1; }

  function optionsPersos(sel){
    var l = R.filter(function(r){ return dispo(r.s); });
    function opt(r){ return '<option value="' + r.s + '"' + (r.s === sel ? ' selected' : '') + '>' + esc(r.n) + '</option>'; }
    if(PO.vide()) return '<option value="">— Choisir —</option>' + l.map(opt).join('');
    return '<option value="">— Choisir —</option><optgroup label="Mes persos">' + l.filter(function(r){ return PO.a(r.s); }).map(opt).join('') +
      '</optgroup><optgroup label="Les autres">' + l.filter(function(r){ return !PO.a(r.s); }).map(opt).join('') + '</optgroup>';
  }

  /* ---------- « Change ça par ça » : chercher les échanges qui montent les dégâts ---------- */
  function totalTeam(m){ return m.reduce(function(a, x){ return a + (x ? calc(x).tot : 0); }, 0); }
  function idees(){
    var base = totalTeam(st.m), out = [];
    var dans = st.m.map(function(m){ return m && m.s; });
    var cands = R.filter(function(r){ return dispo(r.s) && dans.indexOf(r.s) < 0 && (PO.vide() || PO.a(r.s)); });
    var nbSoin = dans.filter(function(s){ return s && estSoin(s); }).length;
    st.m.forEach(function(m, i){
      var parSlot = [];
      cands.forEach(function(r){
        if(st.soin && m && estSoin(m.s) && nbSoin === 1 && !estSoin(r.s)) return;   // on garde un soigneur
        var t = st.m.slice(); t[i] = membre(r.s);
        var g = totalTeam(t) - base;
        if(g > Math.max(1, base * 0.005)) parSlot.push({i:i, type:'perso', de:m && m.s, vers:r.s, g:g});
      });
      if(m){ // autres armes conseillées pour ce perso
        var wl = (by[m.s].wp || []).map(function(w){ return armeParEn[norm(w[2] || w[0])]; });
        var rang = wl.indexOf(m.arme); if(rang < 0) rang = wl.length;
        wl.slice(0, rang).forEach(function(id){   // seulement les armes mieux classées que l'actuelle
          if(!id || id === m.arme || ARMES[id].t !== P[m.s].arme) return;
          var t = st.m.slice(); t[i] = JSON.parse(JSON.stringify(m)); t[i].arme = id;
          var g = totalTeam(t) - base;
          if(g > Math.max(1, base * 0.005)) parSlot.push({i:i, type:'arme', de:m.s, arme:id, g:g});
        });
      }
      parSlot.sort(function(a, b){ return b.g - a.g; });
      out = out.concat(parSlot.slice(0, 2));
    });
    out.sort(function(a, b){ return b.g - a.g; });
    return {base:base, l:out.slice(0, 4)};
  }
  function renderIdees(){
    var box = $('#dg-idees'); if(!box) return;
    var x = idees();
    var h = '<div class="dg-id-head"><span class="lab">Pour plus de dégâts</span>' +
      '<label class="dg-soin"><input type="checkbox" data-g="soin"' + (st.soin ? ' checked' : '') + '> Garder un soigneur</label></div>';
    if(!x.l.length) h += '<p class="dg-id-vide">' + (st.m.some(function(m){ return !m; }) ? 'Choisis tes 3 persos pour voir les idées.' : 'Rien de mieux trouvé' + (PO.vide() ? '' : ' parmi tes persos') + ' : ta team est déjà au top pour ce calcul.') + '</p>';
    else h += '<ul class="dg-id">' + x.l.map(function(o, k){
      var pc = Math.round(o.g / x.base * 1000) / 10;
      var gauche, droite;
      if(o.type === 'perso'){
        var a = o.de && by[o.de], b = by[o.vers];
        gauche = a ? '<img src="' + img(a) + '" alt="">' + esc(a.n) : 'Place ' + (o.i + 1);
        droite = '<img src="' + img(b) + '" alt="">' + esc(b.n);
      } else {
        var r = by[o.de];
        gauche = '<img src="' + img(r) + '" alt="">' + esc(ARMES[st.m[o.i].arme].n);
        droite = esc(ARMES[o.arme].n);
      }
      return '<li><div class="dg-swap"><span class="de">' + gauche + '</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg><span class="vers">' + droite + '</span></div>' +
        '<div class="dg-gain"><b>+' + court(o.g) + '</b><span>+' + String(pc).replace('.', ',') + ' %</span><button type="button" data-idee="' + k + '">Essayer</button></div></li>';
    }).join('') + '</ul>';
    h += '<p class="dg-id-note">' + (PO.vide() ? 'Coche « Je l\'ai » dans l\'onglet Résonateurs pour n\'avoir que des idées avec tes persos. ' : '') + 'Calcul sur les dégâts seulement : les soins et les buffs ne sont pas comptés.</p>';
    box.innerHTML = h;
    box._idees = x.l;
  }
  function optionsArmes(m){
    var p = P[m.s], conseil = (by[m.s].wp || []).map(function(w){ return armeParEn[norm(w[2] || w[0])]; });
    var l = Object.keys(ARMES).filter(function(id){ return ARMES[id].t === p.arme; }).sort(function(a, b){
      var ca = conseil.indexOf(a), cb = conseil.indexOf(b);
      if(ca > -1 || cb > -1) return (ca < 0 ? 99 : ca) - (cb < 0 ? 99 : cb);
      return ARMES[b].r - ARMES[a].r || ARMES[a].n.localeCompare(ARMES[b].n);
    });
    return l.map(function(id){
      var w = ARMES[id];
      return '<option value="' + id + '"' + (id === m.arme ? ' selected' : '') + '>' + esc(w.n) + ' · ' + w.r + '★' + (conseil.indexOf(id) > -1 ? ' · conseillée' : '') + '</option>';
    }).join('');
  }

  function renderSlots(){
    slots.innerHTML = st.m.map(function(m, i){
      if(!m) return '<div class="dg-slot vide"><span class="dg-num">0' + (i + 1) + '</span><label><span class="lab">Perso</span><select data-i="' + i + '" data-f="s">' + optionsPersos('') + '</select></label></div>';
      var r = by[m.s];
      return '<div class="dg-slot" style="--c:' + EL[r.el] + '"><span class="dg-num">0' + (i + 1) + '</span>' +
        '<img src="' + img(r) + '" alt="" width="300" height="412">' +
        '<div class="dg-champs">' +
          '<label><span class="lab">Perso</span><select data-i="' + i + '" data-f="s">' + optionsPersos(m.s) + '</select></label>' +
          '<label><span class="lab">Arme</span><select data-i="' + i + '" data-f="arme">' + optionsArmes(m) + '</select></label>' +
          '<label><span class="lab">Échos</span><select data-i="' + i + '" data-f="qual">' + Object.keys(QUAL).map(function(k){ return '<option value="' + k + '"' + (k === m.qual ? ' selected' : '') + '>' + QUAL[k].nom + '</option>'; }).join('') + '</select></label>' +
        '</div></div>';
    }).join('');
  }

  function renderRes(){
    var rs = st.m.map(function(m){ return m ? calc(m) : null; });
    var total = rs.reduce(function(a, x){ return a + (x ? x.tot : 0); }, 0);
    var bar = rs.map(function(x, i){
      if(!x || !total) return '';
      var r = by[st.m[i].s];
      return '<i style="width:' + (x.tot / total * 100) + '%;--c:' + EL[r.el] + '" title="' + esc(r.n) + ' : ' + Math.round(x.tot / total * 100) + ' %"></i>';
    }).join('');
    res.innerHTML =
      '<div class="dg-total"><span class="lab">Dégâts d\'une rotation de la team</span><b>' + (total ? fmt(total) : '—') + '</b>' +
      '<span class="dg-note">Contre un ennemi niveau ' + st.niv + ', ' + st.res + ' % de résistance</span></div>' +
      '<div class="dg-bar" role="img" aria-label="Part de chaque perso">' + bar + '</div>' +
      '<ul class="dg-parts">' + rs.map(function(x, i){
        if(!x) return '<li class="vide">Place ' + (i + 1) + ' libre</li>';
        var r = by[st.m[i].s], part = total ? x.tot / total * 100 : 0;
        return '<li style="--c:' + EL[r.el] + '"><img src="' + img(r) + '" alt=""><div><strong>' + esc(r.n) + '</strong>' +
          '<span>' + fmt(x.tot) + ' · ' + Math.round(part) + ' %</span>' +
          '<span class="dg-top">Coup le plus fort : ' + court(x.top.v) + '</span></div></li>';
      }).join('') + '</ul>';
    renderDetails(rs);
    renderIdees();
  }

  function renderDetails(rs){
    det.innerHTML = st.m.map(function(m, i){
      if(!m) return '';
      var x = rs[i], r = by[m.s], p = P[m.s], s = x.s;
      var baseNom = s.base === 'pv' ? 'PV' : s.base === 'def' ? 'DÉF' : 'ATQ';
      var groupes = ORDRE.map(function(t){
        var ks = p.sk.map(function(k, idx){ return {k:k, idx:idx}; }).filter(function(o){ return o.k.t === t; });
        if(!ks.length) return '';
        var sous = Math.round(x.parType[t] || 0);
        return '<details class="dg-grp"' + (ouverts[i + t] ? ' open' : '') + ' data-k="' + i + t + '"><summary><span>' + TYPES[t] + '</span><b>' + (sous ? court(sous) : '—') + '</b></summary>' +
          ks.map(function(o){
            return '<p class="dg-sk">' + esc(o.k.n) + '</p><ul>' + o.k.a.map(function(a, j){
              var key = o.idx + '.' + j, n = +(m.rot[key] || 0), v = a[1] * s.k;
              return '<li class="' + (n ? 'on' : '') + '"><span class="nm">' + esc(a[0]) + '<small>' + String(a[1]).replace('.', ',') + ' % · ' + court(v) + ' par coup</small></span>' +
                '<span class="dg-step"><button type="button" data-i="' + i + '" data-k="' + key + '" data-d="-1" aria-label="Moins">−</button><output>' + n + '</output><button type="button" data-i="' + i + '" data-k="' + key + '" data-d="1" aria-label="Plus">+</button></span></li>';
            }).join('') + '</ul>';
          }).join('') + '</details>';
      }).join('');
      return '<details class="dg-perso" style="--c:' + EL[r.el] + '"' + (ouverts['p' + i] ? ' open' : '') + ' data-k="p' + i + '">' +
        '<summary><img src="' + img(r) + '" alt=""><span><strong>' + esc(r.n) + '</strong><small>Stats et rotation</small></span><b>' + court(x.tot) + '</b></summary>' +
        '<div class="dg-stats"><div><dt>' + baseNom + '</dt><dd>' + fmt(s.base === 'pv' ? s.pv : s.base === 'def' ? s.def : s.atq) + '</dd></div>' +
          '<div><dt>Taux CRIT</dt><dd>' + Math.round(Math.min(s.tc, 100)) + ' %</dd></div><div><dt>Dgt CRIT</dt><dd>' + Math.round(s.dc) + ' %</dd></div>' +
          '<div><dt>Bonus ' + esc(r.el) + '</dt><dd>' + Math.round(s.el) + ' %</dd></div></div>' +
        '<div class="dg-vrai"><label class="dg-soin"><input type="checkbox" data-vrai="' + i + '"' + (m.vrai ? ' checked' : '') + '> Utiliser mes vraies stats (écran du perso en jeu)</label>' +
          (m.vrai ? '<div class="dg-vrai-in">' + [['base', baseNom], ['tc', 'Taux CRIT %'], ['dc', 'Dgt CRIT %'], ['el', 'Bonus ' + r.el + ' %']].map(function(f){
            return '<label><span class="lab">' + esc(f[1]) + '</span><input type="number" min="0" step="0.1" data-vi="' + i + '" data-vk="' + f[0] + '" value="' + (m.vrai[f[0]] != null ? m.vrai[f[0]] : '') + '"></label>';
          }).join('') + '</div>' : '') + '</div>' +
        '<div class="dg-rot-head"><span>Rotation : nombre d\'utilisations</span><button type="button" class="dg-reset" data-i="' + i + '">Rotation de base</button></div>' +
        groupes + '</details>';
    }).join('');
  }

  function renderReglages(){
    var g = $('#dg-reglages');
    g.innerHTML =
      '<label><span class="lab">Niveau de l\'ennemi</span><select data-g="niv">' + [80, 90, 100, 110, 120].map(function(n){ return '<option' + (n === st.niv ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label>' +
      '<label><span class="lab">Résistance de l\'ennemi</span><select data-g="res">' + [0, 10, 20, 40].map(function(n){ return '<option value="' + n + '"' + (n === st.res ? ' selected' : '') + '>' + n + ' %</option>'; }).join('') + '</select></label>' +
      '<label><span class="lab">Buffs d\'équipe : bonus de dégâts</span><span class="dg-in"><input type="number" min="0" max="300" step="5" data-g="bonus" value="' + st.bonus + '"> %</span></label>' +
      '<label><span class="lab">Buffs d\'équipe : amplification</span><span class="dg-in"><input type="number" min="0" max="300" step="5" data-g="ampli" value="' + st.ampli + '"> %</span></label>' +
      '<label><span class="lab">Buffs d\'équipe : ATQ</span><span class="dg-in"><input type="number" min="0" max="300" step="5" data-g="atq" value="' + st.atq + '"> %</span></label>';
  }

  function tout(){ save(); renderSlots(); renderRes(); }

  /* ---------- Événements ---------- */
  root.addEventListener('change', function(e){
    var t = e.target;
    if(t.dataset.f){
      var i = +t.dataset.i, f = t.dataset.f;
      if(f === 's') st.m[i] = t.value ? membre(t.value) : null;
      else st.m[i][f] = t.value;
      return tout();
    }
    if(t.dataset.vrai){
      var mv = st.m[+t.dataset.vrai];
      if(t.checked){ var cs = stats(mv); mv.vrai = {base: Math.round(cs.base === 'pv' ? cs.pv : cs.base === 'def' ? cs.def : cs.atq), tc: Math.round(Math.min(cs.tc, 100) * 10) / 10, dc: Math.round(cs.dc * 10) / 10, el: Math.round((cs.el - st.bonus) * 10) / 10}; }
      else delete mv.vrai;
      save(); return renderRes();
    }
    if(t.dataset.vi){ var m2 = st.m[+t.dataset.vi]; m2.vrai[t.dataset.vk] = Math.max(0, parseFloat(t.value) || 0); save(); return renderRes(); }
    if(t.dataset.g === 'soin'){ st.soin = t.checked; save(); return renderIdees(); }
    if(t.dataset.g){ st[t.dataset.g] = Math.max(0, +t.value || 0); save(); renderRes(); }
  });
  root.addEventListener('input', function(e){
    var t = e.target; if(t.dataset.g && t.dataset.g !== 'soin' && t.type === 'number'){ st[t.dataset.g] = Math.max(0, +t.value || 0); save(); renderRes(); }
  });
  root.addEventListener('click', function(e){
    var b = e.target.closest('.dg-step button');
    if(b){ var m = st.m[+b.dataset.i]; m.rot[b.dataset.k] = Math.max(0, Math.min(20, (+m.rot[b.dataset.k] || 0) + (+b.dataset.d))); save(); renderRes(); return; }
    var r = e.target.closest('.dg-reset');
    if(r){ var mm = st.m[+r.dataset.i]; mm.rot = rotationDefaut(mm.s); save(); renderRes(); return; }
    var ie = e.target.closest('[data-idee]');
    if(ie){
      var o = $('#dg-idees')._idees[+ie.dataset.idee];
      if(o.type === 'perso') st.m[o.i] = membre(o.vers); else st.m[o.i].arme = o.arme;
      return tout();
    }
    var a = e.target.closest('[data-action]');
    if(a){
      if(a.dataset.action === 'ma-team'){ var t = null; try { t = JSON.parse(localStorage.getItem('optih-wuwa-team') || 'null'); } catch(e2){} st.m = (Array.isArray(t) && t.length === 3 ? t : ['changli','lupa','shorekeeper']).map(membre); }
      if(a.dataset.action === 'vider'){ st.m = [null, null, null]; }
      tout();
    }
  });
  root.addEventListener('toggle', function(e){ var d = e.target; if(d.dataset && d.dataset.k) ouverts[d.dataset.k] = d.open; }, true);

  document.addEventListener('possedes', function(){ renderSlots(); renderIdees(); });
  renderReglages();
  tout();
})();
