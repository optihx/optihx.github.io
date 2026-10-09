/* ==========================================================
   AETHEL SPIRE — « Mon compte » : lecture du .json exporté par le jeu
   (Réglages → Exporter mon compte), meilleur build de runes, meilleures équipes.
   Tout se passe dans le navigateur : le fichier n'est envoyé nulle part.
   ========================================================== */
(function(){
  var A = window.AS; if(!A) return;
  var J = A.J, G = A.G, H = A.H, CL = A.CL, esc = A.esc, nb = A.nb;
  var KC = 'optih-aethel-compte', KP = 'optih-aethel-plan';

  /* sets : pièces, bonus de stat, effet en combat, bonus d'équipe */
  var SETS = {
    energy: {n: 2, st: {hpP: 15}}, guard: {n: 2, st: {defP: 15}}, swift: {n: 4, st: {spdP: 25}}, blade: {n: 2, st: {cr: 12}},
    rage: {n: 4, st: {cd: 40}}, fatal: {n: 4, st: {atkP: 35}}, focus: {n: 2, st: {acc: 20}}, endure: {n: 2, st: {res: 20}},
    violent: {n: 4, pr: 'violent'}, will: {n: 2, pr: 'will'}, nemesis: {n: 2, pr: 'nemesis'}, shield: {n: 2, pr: 'shield'},
    revenge: {n: 2, pr: 'revenge'}, despair: {n: 4, pr: 'despair'}, vampire: {n: 4, pr: 'vampire'},
    fight: {n: 2, al: 'atk'}, determination: {n: 2, al: 'def'}, enhance: {n: 2, al: 'hp'},
    accuracy: {n: 2, st: {acc: 10}}, tolerance: {n: 2, st: {res: 10}}
  };
  var SINFO = {}; J.sets.forEach(function(s){ SINFO[s.id] = s; });
  var LAB = {hp: 'PV', atk: 'ATQ', def: 'DÉF', spd: 'VIT', hpP: 'PV %', atkP: 'ATQ %', defP: 'DÉF %', cr: 'Taux Crit', cd: 'Dég. Crit', res: 'RÉS', acc: 'PRÉ'};
  var PCTS = {hpP: 1, atkP: 1, defP: 1, cr: 1, cd: 1, res: 1, acc: 1};
  function vtxt(stat, v){ return '+' + v + (PCTS[stat] ? ' %' : ''); }
  var DPS = {dps_phys: 1, dps_mag: 1, dps_range: 1, assassin: 1};

  /* ---------- état ---------- */
  var RESG = '', C = null, RB = {}, MOD = {}, PLAN = null, RES = null, ERR = '', CALC = false, palier = 'd9';
  try { C = JSON.parse(localStorage.getItem(KC) || 'null'); } catch(e){ C = null; }
  try { PLAN = JSON.parse(localStorage.getItem(KP) || 'null'); } catch(e){ PLAN = null; }
  function sauverC(){ try { localStorage.setItem(KC, JSON.stringify(C)); } catch(e){} }
  function sauverP(){ try { localStorage.setItem(KP, JSON.stringify(PLAN)); } catch(e){} }

  /* ne garde que ce qui sert au site */
  function alleger(d){
    if(!d || d.format !== 'aethel-spire-export' || !Array.isArray(d.heroes) || !Array.isArray(d.runes)) throw new Error('Ce fichier n\'est pas un export d\'Aethel Spire.');
    return {
      nom: (d.account && d.account.name) || 'Joueur', niv: (d.account && d.account.level) || 0, date: d.exportedAt || '',
      heros: d.heroes.filter(function(h){ return H[h.charId]; }).map(function(h){ return {id: h.id, c: h.charId, lv: h.level, rk: h.rank, rn: h.rankName || '', et: h.stars, fa: !!h.forcedAwakening, ra: h.rarity,
        rg: !!h.stored, rl: !!h.runesLocked, p: h.power, st: h.stats, bs: h.baseStats, r: (h.runes || []).slice(0, 6)}; }),
      runes: d.runes.map(function(r){ return {id: r.id, set: r.set, sl: r.slot, et: r.stars, lv: r.level, m: [r.main.stat, r.main.value], s: (r.subs || []).map(function(x){ return [x.stat, x.value]; }), by: r.equippedBy}; })
    };
  }
  function indexer(){
    RB = {}; MOD = {};
    if(!C) return;
    C.runes.forEach(function(r){ RB[r.id] = r; });
    /* un seul exemplaire par héros : le plus puissant */
    C.heros.forEach(function(h){ if(!MOD[h.c] || h.p > MOD[h.c].src.p) MOD[h.c] = modele(h); });
  }

  /* ---------- calcul des stats ---------- */
  function apports(list){
    var flat = {hp: 0, atk: 0, def: 0, spd: 0, cr: 0, cd: 0, res: 0, acc: 0}, pct = {hp: 0, atk: 0, def: 0, spd: 0}, cnt = {};
    list.forEach(function(r){ if(!r) return;
      [r.m].concat(r.s).forEach(function(x){ var k = x[0], v = x[1]; if(k === 'hpP' || k === 'atkP' || k === 'defP') pct[k.slice(0, -1)] += v; else if(k in flat) flat[k] += v; });
      cnt[r.set] = (cnt[r.set] || 0) + 1; });
    var sets = {};
    Object.keys(cnt).forEach(function(s){ var S = SETS[s]; if(!S) return; var n = Math.floor(cnt[s] / S.n); if(!n) return; sets[s] = n;
      if(S.st) Object.keys(S.st).forEach(function(k){ var v = S.st[k] * n; if(k === 'hpP' || k === 'atkP' || k === 'defP' || k === 'spdP') pct[k.slice(0, -1)] += v; else flat[k] += v; }); });
    return {flat: flat, pct: pct, sets: sets};
  }
  /* bonus permanents (liens, esprit, talents…) retrouvés à partir des stats du jeu */
  function modele(h){
    var b = h.bs, t = h.st, a = apports((h.r || []).map(function(id){ return RB[id]; })), perm = {pct: {}, flat: {}};
    ['hp', 'atk', 'def', 'spd'].forEach(function(k){ perm.pct[k] = b[k] ? Math.max(0, ((t[k] - a.flat[k]) / b[k] - 1) * 100 - a.pct[k]) : 0; });
    ['cr', 'cd', 'res', 'acc'].forEach(function(k){ perm.flat[k] = Math.max(0, t[k] - b[k] - a.flat[k]); });
    return {c: h.c, j: H[h.c], cl: H[h.c].cl, src: h, b: b, perm: perm};
  }
  function calc(M, list){
    var a = apports(list), b = M.b, P = M.perm;
    return {
      hp: Math.round(b.hp * (1 + (a.pct.hp + P.pct.hp) / 100) + a.flat.hp), atk: Math.round(b.atk * (1 + (a.pct.atk + P.pct.atk) / 100) + a.flat.atk),
      def: Math.round(b.def * (1 + (a.pct.def + P.pct.def) / 100) + a.flat.def), spd: Math.round(b.spd * (1 + (a.pct.spd + P.pct.spd) / 100) + a.flat.spd),
      cr: Math.min(100, b.cr + a.flat.cr + P.flat.cr), cd: b.cd + a.flat.cd + P.flat.cd, res: Math.min(100, b.res + a.flat.res + P.flat.res), acc: Math.min(100, b.acc + a.flat.acc + P.flat.acc),
      sets: a.sets
    };
  }
  function puissance(t){ return Math.round(t.hp / 10 + t.atk * 1.2 + t.def + t.spd * 2 + t.cr * 2 + t.cd * 0.6); }

  /* note d'un héros selon sa classe (plus c'est haut, mieux c'est) */
  var PROC = {
    violent: {dps: .15, x: .1}, vampire: {dps: .07, tank: .06, x: .03}, despair: {dps: .07, x: .05}, will: {healer: .06, x: .02},
    nemesis: {tank: .05, x: .01}, revenge: {tank: .05, x: .02}, shield: {healer: .05, tank: .05, x: .02}
  };
  function note(cl, t, mode){
    var L = Math.log, ehp = t.hp * (1 + t.def / 800), crit = 1 + Math.min(t.cr, 100) / 100 * t.cd / 100, dmg = t.atk * crit, s = 0;
    if(cl === 'dps_phys') s = L(dmg) + .45 * L(t.spd) + .25 * L(ehp);
    else if(cl === 'dps_mag') s = L(t.atk) + .3 * L(crit) + .5 * L(t.spd) + .25 * L(30 + t.acc) + .25 * L(ehp);
    else if(cl === 'dps_range') s = L(dmg * (1 + t.acc / 200)) + .5 * L(t.spd) + .25 * L(ehp);
    else if(cl === 'assassin') s = L(dmg) + .9 * L(t.spd) + .2 * L(ehp);
    else if(cl === 'tank') s = L(ehp) + .5 * L(40 + Math.min(t.res, 83)) + .3 * L(t.spd) + .15 * L(t.atk + .4 * t.def);
    else s = .9 * L(t.spd) + .6 * L(t.hp) + .3 * L(t.atk) + .3 * L(ehp) + .2 * L(40 + t.res);
    if(mode === 'pvp') s += .35 * L(t.spd);
    if(mode === 'leg' || mode === 'arc') s += .2 * L(ehp);
    var role = DPS[cl] ? 'dps' : cl;
    Object.keys(t.sets).forEach(function(k){ var S = SETS[k];
      if(S.pr && PROC[S.pr]) s += (PROC[S.pr][role] != null ? PROC[S.pr][role] : PROC[S.pr].x) * t.sets[k];
      if(S.al) s += (cl === 'tank' || cl === 'healer' ? .05 : .02) * t.sets[k]; });
    return s;
  }

  /* ---------- meilleur build pour un héros (runes disponibles) ---------- */
  /* stat principale conseillée par emplacement (2, 4, 6) */
  var CODE = {'PV %': 'hpP', 'DÉF %': 'defP', 'ATQ %': 'atkP', 'VIT': 'spd', 'RÉS %': 'res', 'PRÉ %': 'acc', 'Taux Crit %': 'cr', 'Dég. Crit %': 'cd'};
  function mainsConseil(cl){
    var b = G.builds && G.builds[cl], o = {};
    if(b) [[2, b.e2], [4, b.e4], [6, b.e6]].forEach(function(x){ o[x[0]] = (x[1] || []).map(function(l){ return CODE[l]; }).filter(Boolean); });
    return o;
  }
  /* toutes les façons de placer les sets conseillés de la classe : 4 + 2 pièces, ou 2 + 2 + 2 */
  var PAIRES = [[[0,1],[2,3],[4,5]],[[0,1],[2,4],[3,5]],[[0,1],[2,5],[3,4]],[[0,2],[1,3],[4,5]],[[0,2],[1,4],[3,5]],[[0,2],[1,5],[3,4]],[[0,3],[1,2],[4,5]],[[0,3],[1,4],[2,5]],[[0,3],[1,5],[2,4]],[[0,4],[1,2],[3,5]],[[0,4],[1,3],[2,5]],[[0,4],[1,5],[2,3]],[[0,5],[1,2],[3,4]],[[0,5],[1,3],[2,4]],[[0,5],[1,4],[2,3]]];
  function placements(cl){
    var rs = (J.classes[cl] && J.classes[cl].sets) || [], f4 = rs.filter(function(x){ return SETS[x] && SETS[x].n === 4; }), f2 = rs.filter(function(x){ return SETS[x] && SETS[x].n === 2; }), out = [];
    f4.forEach(function(a){ f2.forEach(function(b){
      for(var m = 0; m < 64; m++){ var bits = 0, sl = []; for(var k = 0; k < 6; k++) if(m & (1 << k)){ bits++; } if(bits !== 4) continue;
        for(var k2 = 0; k2 < 6; k2++) sl.push(m & (1 << k2) ? a : b); out.push(sl); }
    }); });
    for(var x = 0; x < f2.length; x++) for(var y = x; y < f2.length; y++) for(var z = y; z < f2.length; z++)
      PAIRES.forEach(function(P){ var sl = []; [f2[x], f2[y], f2[z]].forEach(function(st, k){ sl[P[k][0]] = st; sl[P[k][1]] = st; }); out.push(sl); });
    return out;
  }

  /* ---------- meilleur build pour un héros : toujours un build « utile » (sets conseillés de sa classe) ---------- */
  function optimiser(M, dispo, mode){
    var mains = mainsConseil(M.cl);
    function val(sel){
      var v = note(M.cl, calc(M, sel), mode);
      sel.forEach(function(r, i){ var m = mains[i + 1]; if(r && m && m.length){ if(r.m[0] === m[0]) v += .05; else if(m.indexOf(r.m[0]) > -1) v += .03; else v -= .02; } });
      return v;
    }
    var base = val([null, null, null, null, null, null]);
    function solo(r){ var sel = [null, null, null, null, null, null]; sel[r.sl - 1] = r; return val(sel) - base; }
    var parSet = {}, parSlot = [[], [], [], [], [], []];
    dispo.forEach(function(r){ if(!(r.sl >= 1 && r.sl <= 6)) return; var x = {r: r, v: solo(r)};
      parSlot[r.sl - 1].push(x); (parSet[r.set] = parSet[r.set] || [[], [], [], [], [], []])[r.sl - 1].push(x); });
    function tri(L){ return L.sort(function(a, b){ return b.v - a.v; }).slice(0, 6); }
    parSlot = parSlot.map(tri); Object.keys(parSet).forEach(function(s){ parSet[s] = parSet[s].map(tri); });
    function grimper(sel, opts){
      var cur = val(sel), mieux = true, tours = 0;
      while(mieux && tours++ < 4){
        mieux = false;
        for(var i = 0; i < 6; i++){
          var L = opts[i];
          for(var k = 0; k < L.length; k++){
            var r = L[k].r; if(r === sel[i]) continue;
            var old = sel[i]; sel[i] = r; var v = val(sel);
            if(v > cur + 1e-9){ cur = v; mieux = true; } else sel[i] = old;
          }
        }
      }
      return {sel: sel, v: cur};
    }
    /* 1) les placements de sets conseillés ; on garde les complets, sinon les plus remplis */
    var cands = placements(M.cl).map(function(pl){
      var opts = pl.map(function(st, i){ return parSet[st] ? parSet[st][i] : []; }), plein = 0;
      /* pièces appartenant à un set qu'on peut vraiment compléter */
      var sets = {}; pl.forEach(function(st, i){ (sets[st] = sets[st] || []).push(i); });
      Object.keys(sets).forEach(function(st){ var sl = sets[st], ok = sl.filter(function(i){ return opts[i].length; }).length, n = SETS[st].n; plein += Math.floor(ok / n) * n; });
      var sel = opts.map(function(o){ return o.length ? o[0].r : null; });
      return {pl: pl, opts: opts, plein: plein, v0: val(sel), sel: sel};
    });
    var complets = cands.filter(function(c){ return c.plein === 6; }), best = null;
    var choix = (complets.length ? complets : cands.sort(function(a, b){ return b.plein - a.plein || b.v0 - a.v0; }).filter(function(c, k, A){ return c.plein === A[0].plein; }))
      .sort(function(a, b){ return b.v0 - a.v0; }).slice(0, 8);
    choix.forEach(function(c){
      /* emplacement sans rune du bon set : la meilleure rune disponible */
      var opts = c.opts.map(function(o, i){ return o.length ? o : parSlot[i]; });
      var g = grimper(opts.map(function(o){ return o.length ? o[0].r : null; }), opts);
      if(!best || g.v > best.v) best = g;
    });
    /* 2) aucun set conseillé possible : les meilleures runes libres */
    if(!best) best = grimper(parSlot.map(function(o){ return o.length ? o[0].r : null; }), parSlot);
    return {ids: best.sel.map(function(r){ return r ? r.id : null; }), v: best.v, st: calc(M, best.sel)};
  }

  /* runes utilisables : toutes, sauf celles d'un héros hors équipe aux runes verrouillées */
  function poolPour(ids){
    var bloque = {};
    C.heros.forEach(function(h){ if(h.rl && ids.indexOf(h.c) < 0) (h.r || []).forEach(function(id){ if(id) bloque[id] = 1; }); });
    return C.runes.filter(function(r){ return !bloque[r.id]; });
  }
  var ORDRE = {dps_phys: 0, assassin: 0, dps_range: 1, dps_mag: 1, healer: 2, tank: 3};
  /* runes pour 4 héros : chaque rune ne va que sur un seul héros */
  function repartir(ids, mode){
    var Ms = ids.map(function(c){ return MOD[c]; }).filter(Boolean), pool = poolPour(ids), best = null;
    var ordres = Ms.map(function(m0){ return [m0].concat(Ms.filter(function(m){ return m !== m0; }).sort(function(a, b){ return ORDRE[a.cl] - ORDRE[b.cl]; })); });
    ordres.slice(0, 2).forEach(function(o){
      var pris = {}, res = {}, tot = 0;
      o.forEach(function(M){
        var r = optimiser(M, pool.filter(function(x){ return !pris[x.id]; }), mode);
        r.ids.forEach(function(id){ if(id) pris[id] = 1; }); res[M.c] = r;
      });
      /* 2 tours d'ajustement : chaque héros revoit ses runes en laissant celles des autres */
      for(var tour = 0; tour < 1; tour++) o.forEach(function(M){
        var autres = {}; o.forEach(function(X){ if(X !== M) res[X.c].ids.forEach(function(id){ if(id) autres[id] = 1; }); });
        var r = optimiser(M, pool.filter(function(x){ return !autres[x.id]; }), mode);
        if(r.v >= res[M.c].v) res[M.c] = r;
      });
      o.forEach(function(M){ tot += res[M.c].v; });
      if(!best || tot > best.tot) best = {tot: tot, res: res};
    });
    var out = {}; if(best) Object.keys(best.res).forEach(function(c){ out[c] = best.res[c].ids; });
    return out;
  }

  /* ---------- meilleure équipe ---------- */
  var LST = {atkP: 'atk', defP: 'def', hpP: 'hp', spdP: 'spd'};
  function valeurEquipe(ids, pot, mode){
    var chef = A.meilleurChef(ids), ord = chef ? [chef.id].concat(ids.filter(function(x){ return x !== chef.id; })) : ids.slice();
    var L = H[ord[0]].lead, syn = A.synergies(ord).filter(function(s){ return s.ok; }), v = 0, nb2 = {};
    ord.forEach(function(c){
      var t = pot[c].st, pct = {hp: 0, atk: 0, def: 0, spd: 0}, fl = {cr: 0, cd: 0, res: 0};
      if(A.touche(L, H[c])) L.p.forEach(function(p){ if(LST[p[0]]) pct[LST[p[0]]] += p[1]; else if(p[0] in fl) fl[p[0]] += p[1]; });
      syn.forEach(function(s){ Object.keys(s.b).forEach(function(k){ var kk = {pv: 'hp', atq: 'atk', def: 'def', vit: 'spd'}[k]; if(kk) pct[kk] += s.b[k]; }); });
      var u = {hp: t.hp * (1 + pct.hp / 100), atk: t.atk * (1 + pct.atk / 100), def: t.def * (1 + pct.def / 100), spd: t.spd * (1 + pct.spd / 100), cr: Math.min(100, t.cr + fl.cr), cd: t.cd + fl.cd};
      var p = puissance(u);
      if(mode === 'pvp') p += u.spd * 6 + (DPS[H[c].cl] ? u.atk * .4 : 0);
      if(mode === 'leg' || mode === 'arc') p += (u.hp / 10 + u.def) * .3;
      v += p; nb2[H[c].cl] = (nb2[H[c].cl] || 0) + 1;
    });
    var dps = ord.filter(function(c){ return DPS[H[c].cl]; }).length;
    if(mode === 'pvp'){ if(dps < 2) v *= .85; if((nb2.tank || 0) > 1) v *= .9; }
    else { if(!nb2.tank) v *= .82; if(!nb2.healer) v *= .78; if(!dps) v *= .7; if((nb2.healer || 0) > 1) v *= .93; if((nb2.tank || 0) > 1) v *= .85; }
    return {v: v, ord: ord};
  }
  function meilleureEquipe(mode){
    var cands = Object.keys(MOD).filter(function(c){ return MOD[c].src.lv > 1 || Object.keys(MOD).length <= 8; });
    if(cands.length < 4) cands = Object.keys(MOD);
    if(cands.length < 1) return null;
    var pool = poolPour([]), pot = {};
    cands.forEach(function(c){ var r = optimiser(MOD[c], pool, mode); pot[c] = r; });
    var tri = cands.slice().sort(function(a, b){ return puissance(pot[b].st) - puissance(pot[a].st); });
    var garde = tri.slice(0, 11);
    ['tank', 'healer'].forEach(function(cl){ tri.filter(function(c){ return H[c].cl === cl; }).slice(0, 2).forEach(function(c){ if(garde.indexOf(c) < 0) garde.push(c); }); });
    var tous = [], n = garde.length;
    if(n <= 4) tous.push(valeurEquipe(garde, pot, mode));
    else for(var a = 0; a < n; a++) for(var b = a + 1; b < n; b++) for(var c = b + 1; c < n; c++) for(var d = c + 1; d < n; d++)
      tous.push(valeurEquipe([garde[a], garde[b], garde[c], garde[d]], pot, mode));
    tous.sort(function(x, y){ return y.v - x.v; });
    /* 5 teams variées : chacune change au moins 2 héros par rapport aux précédentes (sinon 1) */
    var choix = [];
    [2, 1].forEach(function(diff){
      tous.forEach(function(t){
        if(choix.length >= 5 || choix.indexOf(t) > -1) return;
        if(choix.every(function(x){ return t.ord.filter(function(c){ return x.ord.indexOf(c) < 0; }).length >= diff; })) choix.push(t);
      });
    });
    var vMax = choix[0].v;
    return choix.map(function(t){ return {ord: t.ord, runes: repartir(t.ord, mode), mode: mode, note: noteSur10(t, vMax, mode)}; }).sort(function(x, y){ return y.note - x.note; });
  }

  /* note sur 10 : force de l'équipe + composition (tank, healer, DPS, buffs, debuffs, chef) */
  var BUFF = /▲|Soigne|Provocation/, DEBUFF = /▼|Saignement|Étourdi/;
  function noteSur10(t, vMax, mode){
    var ids = t.ord, cl = {}, dps = 0, nbB = 0, nbD = 0;
    ids.forEach(function(c){ var h = H[c]; cl[h.cl] = (cl[h.cl] || 0) + 1; if(DPS[h.cl]) dps++;
      h.comp.forEach(function(k){ if(BUFF.test(k.d)) nbB++; if(DEBUFF.test(k.d)) nbD++; }); });
    var L = H[ids[0]].lead, nL = L ? ids.filter(function(c){ return A.touche(L, H[c]); }).length : 0;
    var lead = nL >= 3 ? 1 : nL === 2 ? .55 : nL ? .25 : 0, buf = Math.min(1, nbB / 3), deb = Math.min(1, nbD / 3), varie = Object.keys(cl).length >= 4 ? 1 : Object.keys(cl).length === 3 ? .6 : .2;
    var compo = mode === 'pvp'
      ? .25 * (dps >= 2 ? 1 : dps ? .5 : 0) + .15 * (cl.healer ? 1 : 0) + .1 * (cl.tank ? 1 : 0) + .1 * buf + .15 * deb + .15 * lead + .1 * varie
      : .2 * (cl.tank ? 1 : 0) + .2 * (cl.healer ? 1 : 0) + .15 * (dps >= 2 ? 1 : dps ? .5 : 0) + .1 * buf + .1 * deb + .15 * lead + .1 * varie;
    var r = Math.max(0, Math.min(1, t.v / vMax)), note = 10 * (.55 * r * r + .45 * compo);
    var hs = ids.map(function(c){ return MOD[c].src; });
    if(mode === 'leg') note *= .6 + .4 * hs.filter(function(h){ return h.ra === 'UR' && h.rk >= 16; }).length / 4;
    if(mode === 'arc') note *= .5 + .5 * hs.filter(function(h){ return h.ra === 'UR' && h.fa; }).length / 4;
    return Math.max(1, Math.min(10, Math.round(note * 10) / 10));
  }

  /* conseils selon le palier */
  function conseils(res){
    var out = [], ids = res.ord, hs = ids.map(function(c){ return MOD[c].src; });
    var urs = Object.keys(MOD).filter(function(c){ return H[c].ra === 'UR'; });
    var bas = hs.filter(function(h){ return h.lv < 40; });
    if(bas.length) out.push(['warn', 'Monte au niveau 40 : ' + bas.map(function(h){ return A.court(H[h.c]); }).join(', ') + '.']);
    if(res.mode === 'leg'){
      /* héros pas assez up : on propose un remplaçant de la box (UR au rang max, même rôle) */
      var pris = {}, grp = function(c){ return DPS[H[c].cl] ? 'dps' : H[c].cl; };
      hs.filter(function(h){ return !(h.ra === 'UR' && h.rk >= 16); }).forEach(function(h){
        var rep = Object.keys(MOD).filter(function(c){ var x = MOD[c].src; return ids.indexOf(c) < 0 && !pris[c] && x.ra === 'UR' && x.rk >= 16 && grp(c) === grp(h.c); })
          .sort(function(a, b){ return MOD[b].src.p - MOD[a].src.p; })[0];
        if(rep){ pris[rep] = 1; out.push(['warn', A.court(H[h.c]) + ' n\'est pas assez up pour Légende 3 : tu peux mettre ' + A.court(H[rep]) + ' (' + rangNom(MOD[rep].src) + ') à sa place.']); }
      });
    }
    if(res.mode === 'arc'){
      if(!urs.length || !hs.some(function(h){ return h.ra === 'UR'; })){
        out.push(['up', 'Up des UR']);
      } else {
        var non60 = hs.filter(function(h){ return !(h.ra === 'UR' && h.fa); });
        if(non60.length) out.push(['warn', 'Les étages Arc-en-ciel demandent des UR en Éveil forcé (niveau 60). Pas encore prêts : ' + non60.map(function(h){ return A.court(H[h.c]); }).join(', ') + '.']);
      }
    }
    var r6 = 0, tot = 0;
    ids.forEach(function(c){ (res.runes[c] || []).forEach(function(id){ if(id){ tot++; if(RB[id].et >= 6) r6++; } }); });
    if((res.mode === 'leg' || res.mode === 'arc') && r6 < tot) out.push(['info', r6 + ' rune(s) ★6 ou mieux sur ' + tot + ' : farme les étages hauts pour en avoir plus.']);
    return out;
  }
  /* les 4 UR les plus utiles à monter */
  function ursAUp(){
    var poss = Object.keys(MOD).filter(function(c){ return H[c].ra === 'UR'; }).sort(function(a, b){ return MOD[b].src.p - MOD[a].src.p; });
    var choix = [], cls = {};
    function prendre(c, a){ if(choix.length < 4 && !choix.some(function(x){ return x.c === c; })){ choix.push({c: c, a: a}); cls[H[c].cl] = 1; } }
    ['tank', 'healer'].forEach(function(cl){ var c = poss.filter(function(x){ return H[x].cl === cl; })[0]; if(c) prendre(c, 1); });
    poss.forEach(function(c){ prendre(c, 1); });
    var autres = J.heros.filter(function(h){ return h.ra === 'UR' && !MOD[h.id]; }).sort(function(x, y){ return (y.st.pv / 10 + y.st.atq * 1.2 + y.st.def + y.st.vit * 2) - (x.st.pv / 10 + x.st.atq * 1.2 + x.st.def + x.st.vit * 2); });
    ['tank', 'healer'].forEach(function(cl){ if(!cls[cl]){ var h = autres.filter(function(x){ return x.cl === cl; })[0]; if(h) prendre(h.id, 0); } });
    autres.forEach(function(h){ if(DPS[h.cl]) prendre(h.id, 0); });
    autres.forEach(function(h){ prendre(h.id, 0); });
    return choix;
  }

  /* rang du héros, ex. « Arc-en-ciel 5★ » (16 = maximum) */
  function rangNom(h){
    var k = h.rk || 0;
    if(h.rn) return h.rn;
    if(k <= 0) return 'Violet'; if(k === 1) return 'Orange';
    if(k <= 6) return 'Jaune ' + (k - 1) + '★'; if(k <= 11) return 'Rouge ' + (k - 6) + '★'; return 'Arc-en-ciel ' + Math.min(5, k - 11) + '★';
  }
  function rangHtml(h, court){ var mx = h.rk >= 16; return '<span class="rang' + (mx ? ' max' : '') + '" title="' + esc(rangNom(h)) + '">' + (court && mx ? '★ max' : esc(rangNom(h)) + (mx ? ' · max' : '')) + '</span>'; }

  function nomBuild(sets){
    var k = Object.keys(sets || {}).sort(function(a, b){ return SETS[b].n - SETS[a].n; });
    return k.length ? k.map(function(x){ var S = SINFO[x] || {nom: x, e: ''}; return S.e + ' ' + esc(S.nom) + ' ×' + (SETS[x].n * sets[x]); }).join(' + ') : 'aucun set complet';
  }

  /* ---------- affichage ---------- */
  function runeTuile(r, porteur, ici){
    var S = SINFO[r.set] || {e: '', nom: r.set, c: '#888'}, ail = porteur && porteur !== ici ? MOD[porteur] ? A.court(H[porteur]) : null : null;
    return '<div class="rt" style="--s:' + S.c + '"><div class="rt-h"><span class="rt-sl">' + r.sl + '</span><span class="rt-set"><i>' + S.e + '</i>' + esc(S.nom) + '</span><span class="rt-et et' + r.et + '">' + r.et + '★ +' + r.lv + '</span></div>' +
      '<b class="rt-m">' + LAB[r.m[0]] + ' ' + vtxt(r.m[0], r.m[1]) + '</b><span class="rt-s">' + r.s.map(function(x){ return LAB[x[0]] + ' ' + vtxt(x[0], x[1]); }).join(' · ') + '</span>' +
      (ail ? '<span class="rt-de">était sur ' + esc(ail) + '</span>' : '') + '</div>';
  }
  var STL = [['hp', 'PV'], ['atk', 'ATQ'], ['def', 'DÉF'], ['spd', 'VIT'], ['cr', 'Taux Crit'], ['cd', 'Dég. Crit'], ['res', 'RÉS'], ['acc', 'PRÉ']];
  function statsCmp(a, b){
    return '<dl class="cmp">' + STL.map(function(k){ var d = b[k[0]] - a[k[0]];
      return '<div><dt>' + k[1] + '</dt><dd>' + nb(b[k[0]]) + (/cr|cd|res|acc/.test(k[0]) ? ' %' : '') + (d ? '<small class="' + (d > 0 ? 'plus' : 'moins') + '">' + (d > 0 ? '+' : '') + nb(d) + '</small>' : '') + '</dd></div>'; }).join('') + '</dl>';
  }
  function carteResultat(res, titre, i){
    var w = conseils(res), up = i === 0 && w.some(function(x){ return x[0] === 'up'; });
    var P = res.ord.reduce(function(s, c){ return s + puissance(calc(MOD[c], (res.runes[c] || []).map(function(id){ return RB[id]; }))); }, 0);
    return '<article class="res-eq carte" data-asc-charger="' + i + '" tabindex="0"><div class="res-h"><span class="note10" style="--n:' + (res.note * 10) + '%"><b>' + String(res.note).replace('.', ',') + '</b><small>/10</small></span><b>' + titre + '</b><span class="res-p">' + nb(P) + ' <small>puissance</small></span></div>' +
      '<div class="res-m">' + res.ord.map(function(c, k){ var h = MOD[c].src; return '<span>' + A.tete(H[c], 52, k === 0) + '<small>' + esc(A.court(H[c])) + '</small><em>niv. ' + h.lv + (h.rg ? ' · rangé' : '') + '</em>' + rangHtml(h, 1) + '</span>'; }).join('') + '</div>' +
      (w.length ? '<ul class="res-w">' + w.filter(function(x){ return x[0] !== 'up'; }).map(function(x){ return '<li class="' + x[0] + '">' + esc(x[1]) + '</li>'; }).join('') + '</ul>' : '') +
      (up ? '<div class="up-ur"><b>Up des UR</b><p>Les étages Arc-en-ciel demandent des UR niveau 60. Voici les 4 plus utiles à monter :</p><div class="res-m">' +
        ursAUp().map(function(x){ return '<span>' + A.tete(H[x.c], 44) + '<small>' + esc(A.court(H[x.c])) + '</small><em>' + (x.a ? 'à monter' : 'à invoquer') + '</em></span>'; }).join('') + '</div></div>' : '') +
      '<span class="res-go">Charger cette team et ses runes →</span></article>';
  }

  function panneau(){
    if(!C) return '<div class="compte carte vide"><div class="cpt-txt"><b>Importe ton compte</b><p>Dans le jeu : <b>Réglages → Exporter mon compte (.json)</b>, puis dépose le fichier ici. Le site te montre tes héros, tes runes, et calcule tes meilleures équipes et tes meilleurs builds.</p><small>Le fichier reste sur ton appareil : rien n\'est envoyé.</small></div>' +
      '<label class="depot" data-asc-depot><input type="file" accept=".json,application/json" data-asc-fichier hidden><span>Déposer le .json</span><small>ou toucher pour choisir</small></label>' + (ERR ? '<p class="cpt-err">' + esc(ERR) + '</p>' : '') + '</div>';
    var d = C.date ? new Date(C.date) : null, nH = Object.keys(MOD).length;
    var t = A.eq(), mesT = t.filter(function(c){ return MOD[c]; }).length;
    return '<div class="compte carte"><div class="cpt-tete"><div><b>' + esc(C.nom) + '</b><span>niveau ' + C.niv + ' · ' + nH + ' héros · ' + C.runes.length + ' runes' + (d && !isNaN(d) ? ' · export du ' + d.toLocaleDateString('fr-FR') : '') + '</span></div>' +
      '<div class="cpt-act"><label class="b-sec2"><input type="file" accept=".json,application/json" data-asc-fichier hidden>Changer de fichier</label><button type="button" class="b-sec2" data-asc-oublier>Oublier</button></div></div>' +
      '<div class="outils">' +
        '<div class="outil"><b>Meilleur build</b><p>Les meilleures runes pour les 4 héros de ton équipe, chaque rune sur un seul héros.</p><button type="button" class="b-charger" data-asc-build' + (mesT ? '' : ' disabled') + '>' + (mesT ? '⚙ Mettre les runes' : 'Mets tes héros dans l\'équipe') + '</button></div>' +
        '<div class="outil"><b>Meilleure team PvE</b><p>Choisis le palier :</p><div class="paliers-s">' + [['d9', 'Étage 9'], ['leg', 'Légende'], ['arc', 'Arc-en-ciel']].map(function(p){ return '<button type="button" data-asc-palier="' + p[0] + '" aria-pressed="' + (palier === p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div><button type="button" class="b-charger" data-asc-pve>Trouver</button></div>' +
        '<div class="outil"><b>Meilleure team PvP</b><p>Vitesse et dégâts pour l\'Arène.</p><button type="button" class="b-charger" data-asc-pvp>Trouver</button></div>' +
      '</div>' +
      (CALC ? '<p class="cpt-calc">Calcul en cours…</p>' : '') + (ERR ? '<p class="cpt-err">' + esc(ERR) + '</p>' : '') +
      (RES ? '<h3 class="res-titre">' + esc(RESG) + '</h3><p class="cpt-note">Classées sur 10 : 10 = la meilleure (force, tank, healer, DPS, buffs, debuffs, chef). Un même héros peut revenir dans plusieurs teams. Touche une team pour la charger avec ses runes.</p><div class="resultats">' + RES.map(function(x, i){ return carteResultat(x.res, x.titre, i); }).join('') + '</div>' : '') +
      '<p class="cpt-note">Calculs estimés à partir de ton fichier (stats sans chef ni synergies, comme dans le jeu). Pense à réexporter après tes changements.</p></div>';
  }

  function runesEquipe(t){
    if(!C) return '';
    var mes = t.filter(function(c){ return MOD[c]; });
    if(!mes.length) return '';
    var plan = PLAN && PLAN.cle === t.join(',') ? PLAN : null;
    var h = '<section class="mes-runes" id="mes-runes"><div class="mr-titre"><h2>' + (plan ? 'Runes conseillées' : 'Mes runes actuelles') + ' <small>' + (plan ? 'chaque rune sur un seul héros' : 'd\'après ton fichier') + '</small></h2>' +
      (plan ? '<button type="button" class="b-sec2" data-asc-actuelles>Revoir mes runes actuelles</button>' : '<button type="button" class="b-charger gros" data-asc-build>⚙ Mettre les runes</button>') + '</div>';
    if(!plan) h += '<p class="intro">Touche « Mettre les runes » : le site choisit le meilleur set de runes pour chacun de ces héros, parmi toutes tes runes (une rune ne va que sur un seul héros).</p>';
    if(plan) h += '<p class="intro">Équipe ces runes dans le jeu (fiche du héros → onglet Runes). Les chiffres en vert ou rouge comparent avec tes runes actuelles.</p>';
    h += mes.map(function(c){
      var M = MOD[c], act = (M.src.r || []).map(function(id){ return RB[id] || null; }), nv = plan ? (plan.runes[c] || []).map(function(id){ return id ? RB[id] : null; }) : act;
      var stA = M.src.st, stN = plan ? calc(M, nv) : stA;
      return '<div class="mr carte"><div class="mr-h">' + A.tete(H[c], 44) + '<div><b>' + esc(H[c].nom) + '</b><span>niv. ' + M.src.lv + ' · ' + rangHtml(M.src) + (M.src.fa ? ' · Éveil forcé' : '') + (M.src.rg ? ' · au Rangement' : '') + ' · puissance ' + nb(puissance(stN)) + '</span></div></div>' +
        '<p class="mr-build">Build : <b>' + nomBuild(stN.sets) + '</b>' + (plan ? '' : '') + '</p>' + statsCmp(stA, stN) +
        '<div class="rts">' + [0, 1, 2, 3, 4, 5].map(function(i){ var r = nv[i]; return r ? runeTuile(r, plan ? r.by && MOD[byChar(r.by)] ? byChar(r.by) : null : null, c) : '<div class="rt vide"><span class="rt-sl">' + (i + 1) + '</span>Aucune rune</div>'; }).join('') + '</div></div>';
    }).join('');
    if(t.length > mes.length) h += '<p class="cpt-note">Pas dans ton compte : ' + t.filter(function(c){ return !MOD[c]; }).map(function(c){ return esc(A.court(H[c])); }).join(', ') + '.</p>';
    return h + '</section>';
  }
  var HC = {}; function byChar(heroId){ if(!HC._ok){ HC = {_ok: 1}; C.heros.forEach(function(h){ HC[h.id] = h.c; }); } return HC[heroId]; }

  /* ---------- actions ---------- */
  function lire(file){
    if(!file) return;
    var fr = new FileReader();
    fr.onload = function(){
      try { C = alleger(JSON.parse(fr.result)); ERR = ''; HC = {}; indexer(); sauverC(); RES = null; PLAN = null; sauverP(); A.pf.mine = true; }
      catch(e){ ERR = e.message && /export/.test(e.message) ? e.message : 'Fichier illisible : choisis le .json exporté par le jeu.'; }
      A.rendreEquipe();
    };
    fr.readAsText(file);
  }
  function lancer(fn){ CALC = true; ERR = ''; A.rendreEquipe(); setTimeout(function(){ try { fn(); } catch(e){ ERR = 'Calcul impossible : ' + e.message; } CALC = false; A.rendreEquipe(); }, 30); }
  function chargerRes(i){
    var x = RES && RES[i]; if(!x) return;
    A.ME.t[A.ME.cur] = x.res.ord.slice(); A.sauver();
    PLAN = {cle: x.res.ord.join(','), runes: x.res.runes}; sauverP();
    A.rendreEquipe(); var m = document.getElementById('mes-runes'); if(m) m.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
  var ve = document.getElementById('v-equipe');
  ve.addEventListener('change', function(e){
    if(e.target.matches('[data-asc-fichier]')) lire(e.target.files[0]);
    if(e.target.matches('[data-pf-mine]')){ A.pf.mine = e.target.checked; A.rendreEquipe(); }
  });
  ve.addEventListener('dragover', function(e){ var z = e.target.closest('[data-asc-depot]'); if(z){ e.preventDefault(); z.classList.add('sur'); } });
  ve.addEventListener('dragleave', function(e){ var z = e.target.closest('[data-asc-depot]'); if(z) z.classList.remove('sur'); });
  ve.addEventListener('drop', function(e){ var z = e.target.closest('[data-asc-depot]'); if(z){ e.preventDefault(); lire(e.dataTransfer.files[0]); } });
  ve.addEventListener('keydown', function(e){ var c = e.target.closest('[data-asc-charger]'); if(c && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); chargerRes(+c.dataset.ascCharger); } });
  ve.addEventListener('click', function(e){
    var b;
    if((b = e.target.closest('[data-asc-oublier]'))){ C = null; RB = {}; MOD = {}; RES = null; PLAN = null; HC = {}; A.pf.mine = false; try { localStorage.removeItem(KC); localStorage.removeItem(KP); } catch(er){} return A.rendreEquipe(); }
    if((b = e.target.closest('[data-asc-actuelles]'))){ PLAN = null; sauverP(); return A.rendreEquipe(); }
    if((b = e.target.closest('[data-asc-palier]'))){ palier = b.dataset.ascPalier; return A.rendreEquipe(); }
    if((b = e.target.closest('[data-asc-charger]'))) return chargerRes(+b.dataset.ascCharger);
    if((b = e.target.closest('[data-asc-build]'))){
      var t = A.eq().filter(function(c){ return MOD[c]; });
      return lancer(function(){ RES = null; PLAN = {cle: A.eq().join(','), runes: repartir(t, 'd9')}; sauverP(); setTimeout(function(){ var m = document.getElementById('mes-runes'); if(m) m.scrollIntoView({behavior: 'smooth', block: 'start'}); }, 60); });
    }
    if((b = e.target.closest('[data-asc-pve]'))){
      var nomP = {d9: 'Étage 9', leg: 'Légende 1 à 3', arc: 'Arc-en-ciel 14 à 16'}[palier];
      return lancer(function(){ var r = meilleureEquipe(palier); RESG = 'Teams PvE · ' + nomP; RES = r ? r.map(function(x, k){ return {res: x, titre: 'Team ' + (k + 1)}; }) : null; if(!r) ERR = 'Pas assez de héros dans ton fichier.'; });
    }
    if((b = e.target.closest('[data-asc-pvp]'))) return lancer(function(){ var r = meilleureEquipe('pvp'); RESG = 'Teams PvP · Arène'; RES = r ? r.map(function(x, k){ return {res: x, titre: 'Team ' + (k + 1)}; }) : null; if(!r) ERR = 'Pas assez de héros dans ton fichier.'; });
  });

  window.ASC = {
    charge: function(){ return !!C; },
    possede: function(id){ return !!MOD[id]; },
    badge: function(id){ if(!C) return ''; var m = MOD[id]; return m ? '<span class="hc-mine' + (m.src.rk >= 16 ? ' max' : '') + '" title="' + esc(rangNom(m.src)) + '">niv. ' + m.src.lv + (m.src.rk >= 16 ? ' · ★max' : '') + '</span>' : '<span class="hc-pas">pas à toi</span>'; },
    panneau: panneau, runesEquipe: runesEquipe
  };
  indexer();
  if(C) A.pf.mine = true;
  A.rendreEquipe();
})();
