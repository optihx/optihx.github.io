/* BDO — « Mes tâches » : liste à cocher, propre à chaque visiteur (gardée sur son appareil).
   Les cases se décochent toutes seules après le reset (quotidien ou hebdo). Données : data-taches.js */
(function(){
  var D = window.TACHES_BDO, box = document.getElementById('taches-list');
  if(!D || !box) return;
  var KEY = 'optih-bdo-taches', H = D.reset.heureUTC || 0, JH = D.reset.jourHebdo, JOUR = 864e5;
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var st; try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){ st = null; }
  if(!st || typeof st !== 'object') st = {};
  st.perso = st.perso || []; st.cache = st.cache || {}; st.fait = st.fait || {};
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(e){} }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  // Dernier reset passé (en ms) pour une tâche
  function dernier(type, jour, now){
    var d = new Date(now); d.setUTCHours(H, 0, 0, 0);
    if(d.getTime() > now) d = new Date(d.getTime() - JOUR);
    if(type === 'hebdo'){ var j = jour == null ? JH : jour; while(d.getUTCDay() !== j) d = new Date(d.getTime() - JOUR); }
    return d.getTime();
  }
  function prochain(type, jour, now){ return dernier(type, jour, now) + (type === 'hebdo' ? 7 : 1) * JOUR; }
  function duree(ms){
    var m = Math.max(0, Math.ceil(ms / 6e4)), j = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mn = m % 60;
    return j ? j + ' j ' + h + ' h' : h ? h + ' h ' + (mn < 10 ? '0' : '') + mn : mn + ' min';
  }
  function heure(ms){ return new Date(ms).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}).replace(':', ' h '); }
  function liste(type){
    return D[type === 'hebdo' ? 'hebdo' : 'quotidien'].filter(function(t){ return !st.cache[t.id]; })
      .map(function(t){ return {id: t.id, nom: t.nom, jour: t.jour, base: true}; })
      .concat(st.perso.filter(function(t){ return t.type === type; }));
  }
  function fait(t, type, now){ return (st.fait[t.id] || 0) >= dernier(type, t.jour, now); }

  function colonne(type, now){
    var L = liste(type), n = L.filter(function(t){ return fait(t, type, now); }).length;
    var nx = prochain(type, null, now);
    var titre = type === 'hebdo' ? 'Hebdomadaires' : 'Quotidiennes';
    var quand = type === 'hebdo' ? JOURS[new Date(nx).getDay()] + ' à ' + heure(nx) : 'chaque jour à ' + heure(nx);
    return '<article class="tk-col" data-type="' + type + '">' +
      '<header><div><span class="g-lab">' + (type === 'hebdo' ? 'Chaque semaine' : 'Chaque jour') + '</span><h3>' + titre + '</h3></div>' +
      '<div class="tk-cd"><small>Reset dans</small><b data-cd="' + type + '">' + duree(nx - now) + '</b><small>' + quand + '</small></div></header>' +
      '<div class="g-bar"><i style="width:' + (L.length ? n / L.length * 100 : 0) + '%"></i></div>' +
      '<p class="tk-compte">' + (L.length && n === L.length ? 'Tout est fait ✓' : n + ' / ' + L.length + ' faite' + (n > 1 ? 's' : '')) + '</p>' +
      '<ul class="tk-list">' + (L.map(function(t){
        var ok = fait(t, type, now), jour = type === 'hebdo' && t.jour != null && t.jour !== JH;
        return '<li class="' + (ok ? 'ok' : '') + '"><label><input type="checkbox" data-id="' + esc(t.id) + '"' + (ok ? ' checked' : '') + '><span class="tk-box" aria-hidden="true"></span>' +
          '<span class="tk-nom">' + esc(t.nom) + (jour ? '<small>reset le ' + JOURS[t.jour] + '</small>' : '') + '</span></label>' +
          '<button type="button" class="tk-x" data-suppr="' + esc(t.id) + '" title="Enlever « ' + esc(t.nom) + ' »" aria-label="Enlever ' + esc(t.nom) + '">×</button></li>';
      }).join('') || '<li class="tk-vide">Aucune tâche : ajoute la tienne en dessous.</li>') + '</ul></article>';
  }

  var cle = '';
  function render(){
    var now = Date.now(), f = document.activeElement, fid = f && f.dataset ? f.dataset.id : null;
    cle = dernier('quotidien', null, now) + '|' + dernier('hebdo', null, now);
    box.querySelector('#tk-cols').innerHTML = colonne('quotidien', now) + colonne('hebdo', now);
    if(fid){ var r = box.querySelector('input[data-id="' + fid + '"]'); if(r) r.focus(); }
  }
  // Toutes les 30 s : le compte à rebours bouge ; après un reset, la liste se décoche
  function tic(){
    var now = Date.now();
    if(dernier('quotidien', null, now) + '|' + dernier('hebdo', null, now) !== cle) return render();
    [].forEach.call(box.querySelectorAll('[data-cd]'), function(b){ b.textContent = duree(prochain(b.dataset.cd, null, now) - now); });
  }
  box.innerHTML = '<div class="tk-cols" id="tk-cols"></div>' +
    '<form class="tk-add" id="tk-add" autocomplete="off">' +
      '<label class="tk-champ"><span class="sr-only">Nouvelle tâche</span><input type="text" id="tk-nom" maxlength="60" placeholder="Ajouter une tâche… (ex. Marni, Atoraxxion)"></label>' +
      '<label><span class="sr-only">Reset</span><select id="tk-type"><option value="quotidien">Chaque jour</option>' +
        JOURS.map(function(j, i){ return '<option value="h' + i + '"' + (i === JH ? ' selected' : '') + '>Chaque ' + j + '</option>'; }).slice(1).concat('<option value="h0">Chaque dimanche</option>').join('') +
      '</select></label><button type="submit">Ajouter</button></form>' +
    '<p class="tk-pied">Ta liste est enregistrée sur ton appareil, rien que pour toi. Les cases se décochent toutes seules au reset. ' +
      '<button type="button" class="tk-lien" id="tk-defaut">Remettre la liste de départ</button></p>';
  // l'option « Chaque jour » d'abord, puis les jours de la semaine
  var sel = box.querySelector('#tk-type'); sel.value = 'quotidien';

  box.addEventListener('change', function(e){
    var c = e.target; if(!c.dataset || !c.dataset.id) return;
    if(c.checked) st.fait[c.dataset.id] = Date.now(); else delete st.fait[c.dataset.id];
    save(); render();
  });
  box.addEventListener('click', function(e){
    var b = e.target.closest('[data-suppr]');
    if(b){
      var id = b.dataset.suppr;
      if(/^perso-/.test(id)) st.perso = st.perso.filter(function(t){ return t.id !== id; }); else st.cache[id] = 1;
      delete st.fait[id]; save(); render(); return;
    }
    if(e.target.id === 'tk-defaut'){ st.perso = []; st.cache = {}; save(); render(); }
  });
  box.querySelector('#tk-add').addEventListener('submit', function(e){
    e.preventDefault();
    var nom = box.querySelector('#tk-nom').value.trim(); if(!nom) return;
    var v = sel.value, t = {id: 'perso-' + Date.now().toString(36), nom: nom.slice(0, 60)};
    if(v === 'quotidien') t.type = 'quotidien'; else { t.type = 'hebdo'; t.jour = +v.slice(1); }
    st.perso.push(t); save(); render();
    box.querySelector('#tk-nom').value = '';
  });
  // Si le visiteur a activé les notifications « Tâches BDO » : on envoie au serveur combien il en reste
  var envoi = null;
  function synchro(){
    var n; try { n = JSON.parse(localStorage.getItem('optih-notifs') || 'null'); } catch(e){ n = null; }
    if(!n || !n.endpoint || (n.sujets || []).indexOf('taches') < 0 || !window.fetch) return;
    clearTimeout(envoi);
    envoi = setTimeout(function(){
      var now = Date.now(), reste = liste('quotidien').filter(function(t){ return !fait(t, 'quotidien', now); }).length;
      fetch((/netlify\.app$/.test(location.hostname) ? '' : 'https://optihx.netlify.app') + '/api/taches', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({endpoint: n.endpoint, restantes: reste, reset: Math.floor(now / JOUR) * JOUR})}).catch(function(){});
    }, 1500);
  }
  var save0 = save; save = function(){ save0(); synchro(); };
  render(); synchro();
  setInterval(tic, 30000);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) tic(); });
})();
