/* ==========================================================
   opti'H ✗ — SYNCHRO ENTRE APPAREILS (code secret, sans compte)
   Les données du site (comptes Clash, Paldeck, tâches BDO, teams, listes de farm…)
   sont rangées en ligne sous un code du type OPTIH-XXXX-XXXX-XXXX-XXXX.
   Le même code sur un autre appareil = les mêmes données. La plus récente gagne.
   Chargé sur toutes les pages par app.js. Le bouton « Synchro » est sur l'accueil.
   ========================================================== */
(function(){
  if(window.__optihSync) return; window.__optihSync = true;
  var CLES = ['optih-coc', 'optih-pal', 'optih-bdo-taches', 'optih-tog-equipes', 'optih-tog-mes-persos', 'optih-codes-utilises',
    'optih-wuwa-team', 'optih-wuwa-possedes', 'optih-wuwa-degats', 'optih-wuwa-mat', 'optih-wuwa-tirages', 'optih-wuwa-echo',
    'optih-resume-wuwa', 'optih-resume-tog', 'optih-resume-coc', 'optih-resume-pal', 'optih-aethel-codes', 'optih-aethel-equipes'];
  var KEY = 'optih-sync', ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var S = window.Storage && Storage.prototype, setO = S.setItem, remO = S.removeItem, getO = S.getItem;
  function lireEtat(){ try { return JSON.parse(getO.call(localStorage, KEY) || 'null') || {}; } catch(e){ return {}; } }
  function ecrireEtat(e){ try { setO.call(localStorage, KEY, JSON.stringify(e)); } catch(x){} }
  var etat = lireEtat(); etat.meta = etat.meta || {};

  /* ---------- On repère les modifications des données à synchroniser ---------- */
  var envoi = null;
  function note(k){ if(!etat.code) return; etat.meta[k] = Date.now(); ecrireEtat(etat); clearTimeout(envoi); envoi = setTimeout(function(){ synchro(false); }, 1500); }
  try {
    S.setItem = function(k, v){
      var suivi = this === window.localStorage && CLES.indexOf(k) > -1, avant = suivi ? getO.call(this, k) : null;
      setO.call(this, k, v);
      if(suivi && avant !== String(v)) note(k);
    };
    S.removeItem = function(k){
      var suivi = this === window.localStorage && CLES.indexOf(k) > -1 && getO.call(this, k) != null;
      remO.call(this, k);
      if(suivi) note(k);
    };
  } catch(e){}

  /* ---------- Échange avec le serveur ---------- */
  var enCours = null;
  function synchro(premiere){
    if(!etat.code || !window.fetch) return Promise.resolve(false);
    if(enCours) return enCours;
    var donnees = {};
    CLES.forEach(function(k){ var v = getO.call(localStorage, k); if(v != null && etat.meta[k]) donnees[k] = {v: v, t: etat.meta[k]}; });
    enCours = fetch((/netlify\.app$/.test(location.hostname) ? '' : 'https://optihx.netlify.app') + '/api/sync', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({code: etat.code, donnees: donnees}), keepalive: !premiere})
      .then(function(r){ return r.json(); })
      .then(function(rep){
        enCours = null;
        if(!rep || !rep.ok){ etat.erreur = rep && rep.erreur || 'erreur'; ecrireEtat(etat); return false; }
        var change = false;
        Object.keys(rep.donnees || {}).forEach(function(k){
          if(CLES.indexOf(k) < 0) return;
          var x = rep.donnees[k];
          if(+x.t > (etat.meta[k] || 0)){
            if(getO.call(localStorage, k) !== x.v){ setO.call(localStorage, k, x.v); change = true; }
            etat.meta[k] = +x.t;
          }
        });
        etat.dernier = Date.now(); delete etat.erreur; ecrireEtat(etat);
        document.dispatchEvent(new Event('optih-sync'));
        if(change && premiere){
          // Des données plus récentes sont arrivées : on recharge une fois la page pour les afficher
          var cle = 'optih-sync-recharge';
          if(!sessionStorage.getItem(cle)){ sessionStorage.setItem(cle, '1'); location.reload(); }
          else sessionStorage.removeItem(cle);
        }
        return change;
      })
      .catch(function(){ enCours = null; return false; });
    return enCours;
  }
  function nouveauCode(){
    var a = new Uint8Array(16); crypto.getRandomValues(a);
    var s = Array.prototype.map.call(a, function(n){ return ALPHA[n % 32]; }).join('');
    return 'OPTIH-' + s.slice(0, 4) + '-' + s.slice(4, 8) + '-' + s.slice(8, 12) + '-' + s.slice(12, 16);
  }
  function propre(c){
    c = String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^OPTIH/, '');
    if(c.length !== 16) return null;
    c = 'OPTIH-' + c.slice(0, 4) + '-' + c.slice(4, 8) + '-' + c.slice(8, 12) + '-' + c.slice(12, 16);
    return /^OPTIH(-[A-HJ-NP-Z2-9]{4}){4}$/.test(c) ? c : null;
  }
  function activer(){
    etat = {code: nouveauCode(), meta: {}};
    var t = Date.now(); CLES.forEach(function(k){ if(getO.call(localStorage, k) != null) etat.meta[k] = t; });
    ecrireEtat(etat); return synchro(false);
  }
  function relier(code){
    // Les données déjà rangées sous ce code passent avant celles de cet appareil ;
    // ce que cet appareil a en plus est ajouté.
    etat = {code: code, meta: {}};
    CLES.forEach(function(k){ if(getO.call(localStorage, k) != null) etat.meta[k] = 1; });
    ecrireEtat(etat); return synchro(false);
  }
  function oublier(){ etat = {meta: {}}; ecrireEtat(etat); }
  document.addEventListener('visibilitychange', function(){ if(etat.code && !document.hidden) synchro(false); });
  if(etat.code) synchro(true);

  /* ---------- Fenêtre « Synchro » (accueil) ---------- */
  var btn = document.querySelector('[data-synchro]');
  window.OptihSync = {etat: function(){ return etat; }, synchro: synchro};
  if(!btn) return;
  var css = document.createElement('style');
  css.textContent =
    '.sync-pan{position:fixed;z-index:130;top:76px;right:clamp(16px,4vw,56px);width:min(420px,calc(100% - 32px));max-height:calc(100dvh - 96px);overflow:auto;padding:18px;border-radius:16px;background:#141a26;color:#f1efe6;border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 60px -20px rgba(0,0,0,.75);font:15px/1.45 "Figtree",system-ui,sans-serif}' +
    '.sync-pan[hidden]{display:none}' +
    '.sync-pan h2{margin:0 0 4px;font:800 20px/1.1 "Big Shoulders Display",system-ui;letter-spacing:.04em;text-transform:uppercase}' +
    '.sync-pan p{margin:0 0 12px;color:#aab3c5;font-size:13.5px}' +
    '.sync-pan b{color:#f1efe6}' +
    '.sync-code{display:block;margin:6px 0 10px;padding:12px;border-radius:12px;background:#0c111c;border:1px dashed rgba(255,207,138,.5);font:700 17px/1.2 "Martian Mono",ui-monospace,monospace;letter-spacing:.04em;text-align:center;color:#ffcf8a;word-break:break-all;user-select:all}' +
    '.sync-qr{display:grid;place-items:center;margin:4px auto 12px;padding:10px;width:max-content;border-radius:12px;background:#fff}' +
    '.sync-qr svg,.sync-qr img{display:block;width:170px;height:170px}' +
    '.sync-act{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 10px}' +
    '.sync-act button{padding:10px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#f1efe6;font:inherit;font-weight:600;cursor:pointer}' +
    '.sync-act button.prim{background:#ffcf8a;border-color:#ffcf8a;color:#1a1206;font-weight:700}' +
    '.sync-act button.danger{color:#ff9a8a;border-color:rgba(255,154,138,.4)}' +
    '.sync-sep{display:flex;align-items:center;gap:10px;margin:14px 0 10px;color:#aab3c5;font-size:12.5px;text-transform:uppercase;letter-spacing:.1em}' +
    '.sync-sep::before,.sync-sep::after{content:"";flex:1;height:1px;background:rgba(255,255,255,.12)}' +
    '.sync-pan input{width:100%;padding:11px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.15);background:#0c111c;color:#f1efe6;font:600 15px "Martian Mono",ui-monospace,monospace;text-transform:uppercase}' +
    '.sync-msg{min-height:1.4em;margin:8px 0 0!important;font-weight:600}' +
    '.sync-msg.ok{color:#7fd6a0!important}.sync-msg.err{color:#ff9a8a!important}' +
    '.sync-x{position:absolute;top:10px;right:10px;width:32px;height:32px;border:0;border-radius:50%;background:transparent;color:#aab3c5;font-size:20px;cursor:pointer}' +
    '@media (max-width:820px){.sync-code{font-size:14.5px}.sync-pan{top:auto;bottom:calc(76px + env(safe-area-inset-bottom));right:16px;left:16px;width:auto;max-height:calc(100dvh - 120px)}}';
  document.head.appendChild(css);
  var pan = document.createElement('div');
  pan.className = 'sync-pan'; pan.hidden = true; pan.setAttribute('role', 'dialog'); pan.setAttribute('aria-labelledby', 'sync-titre');
  document.body.appendChild(pan);
  btn.setAttribute('aria-expanded', 'false');
  var aRelier = null;

  function ilya(t){ if(!t) return 'jamais'; var m = Math.round((Date.now() - t) / 6e4); return m < 1 ? "à l'instant" : m < 60 ? 'il y a ' + m + ' min' : m < 1440 ? 'il y a ' + Math.round(m / 60) + ' h' : 'il y a ' + Math.round(m / 1440) + ' j'; }
  function lien(){ return location.origin + location.pathname.replace(/[^/]*$/, '') + '#sync=' + etat.code; }
  function qr(){
    if(!window.qrcode) return '';
    try { var q = qrcode(0, 'M'); q.addData(lien()); q.make(); return q.createSvgTag({cellSize: 4, margin: 0, scalable: true}); } catch(e){ return ''; }
  }
  function chargerQR(){
    if(window.qrcode) return Promise.resolve();
    return new Promise(function(ok){ var s = document.createElement('script'); s.src = 'assets/js/qrcode.js'; s.onload = ok; s.onerror = ok; document.head.appendChild(s); });
  }
  function majBouton(){ btn.classList.toggle('on', !!etat.code); btn.querySelector('span').textContent = etat.code ? 'Synchro activée' : 'Synchro'; }
  function rendu(msg, cl){
    var h = '<button type="button" class="sync-x" aria-label="Fermer">×</button><h2 id="sync-titre">Synchro</h2>';
    if(aRelier){
      h += '<p>Relier cet appareil au code :</p><span class="sync-code">' + aRelier + '</span>' +
        '<p>Tes comptes Clash, ton Paldeck, tes tâches, tes teams… seront les mêmes que sur ton autre appareil. Ce qui est déjà rangé sous ce code passe avant les données de cet appareil.</p>' +
        '<div class="sync-act"><button type="button" class="prim" data-s="relier-ok">Relier cet appareil</button><button type="button" data-s="annuler">Annuler</button></div>';
    } else if(!etat.code){
      h += '<p>Retrouve tes données sur tous tes appareils : <b>comptes Clash, Paldeck, tâches BDO, teams WuWa et ToG, listes de farm</b>. Pas de compte ni d\'e-mail : juste un code secret.</p>' +
        '<div class="sync-act"><button type="button" class="prim" data-s="activer">Activer la synchro</button></div>' +
        '<div class="sync-sep">J\'ai déjà un code</div>' +
        '<input type="text" id="sync-in" placeholder="OPTIH-XXXX-XXXX-XXXX-XXXX" autocomplete="off" spellcheck="false" aria-label="Ton code de synchro">' +
        '<div class="sync-act"><button type="button" data-s="relier">Relier cet appareil</button></div>';
    } else {
      h += '<p>Ton code (garde-le pour toi : il donne accès à tes données) :</p><span class="sync-code">' + etat.code + '</span>' +
        '<div class="sync-act"><button type="button" data-s="copier">Copier le code</button><button type="button" data-s="maintenant">Synchroniser maintenant</button></div>' +
        '<p>Sur ton autre appareil : scanne ce QR code avec l\'appareil photo, ou tape le code dans « Synchro ».</p><div class="sync-qr">' + qr() + '</div>' +
        '<p>Dernière synchro : <b>' + ilya(etat.dernier) + '</b>' + (etat.erreur ? ' · problème : ' + etat.erreur : '') + '</p>' +
        '<div class="sync-act"><button type="button" class="danger" data-s="oublier">Déconnecter cet appareil</button></div>';
    }
    h += '<p class="sync-msg' + (cl ? ' ' + cl : '') + '" aria-live="polite">' + (msg || '') + '</p>';
    pan.innerHTML = h;
  }
  function ouvrir(o){ pan.hidden = !o; btn.setAttribute('aria-expanded', o); if(o) chargerQR().then(function(){ rendu(); var f = pan.querySelector('[data-s],input'); if(f) f.focus(); }); }
  btn.addEventListener('click', function(){ ouvrir(pan.hidden); });
  pan.addEventListener('click', function(e){
    if(e.target.closest('.sync-x')) return ouvrir(false);
    var b = e.target.closest('[data-s]'); if(!b) return;
    var a = b.dataset.s;
    if(a === 'activer'){ b.disabled = true; activer().then(function(){ majBouton(); rendu(etat.dernier ? 'Synchro activée ! Note ton code quelque part.' : 'Code créé, mais le serveur n\'a pas répondu : réessaie plus tard.', etat.dernier ? 'ok' : 'err'); }); }
    if(a === 'relier'){ var c = propre(pan.querySelector('#sync-in').value); if(!c) return rendu('Ce code n\'a pas le bon format (OPTIH-XXXX-XXXX-XXXX-XXXX).', 'err'); aRelier = c; rendu(); }
    if(a === 'relier-ok'){ var code = aRelier; aRelier = null; history.replaceState(null, '', location.pathname); b.disabled = true; relier(code).then(function(ch){ majBouton(); rendu(etat.dernier ? 'Appareil relié !' + (ch ? ' Tes données sont arrivées.' : '') : 'Le serveur n\'a pas répondu : réessaie.', etat.dernier ? 'ok' : 'err'); }); }
    if(a === 'annuler'){ aRelier = null; history.replaceState(null, '', location.pathname); rendu(); }
    if(a === 'copier'){ (navigator.clipboard ? navigator.clipboard.writeText(etat.code) : Promise.reject()).then(function(){ rendu('Code copié.', 'ok'); }, function(){ rendu('Sélectionne le code et copie-le.', ''); }); }
    if(a === 'maintenant'){ synchro(false).then(function(ch){ rendu(etat.erreur ? 'Problème : ' + etat.erreur : ch ? 'À jour : de nouvelles données sont arrivées.' : 'Tout est à jour.', etat.erreur ? 'err' : 'ok'); }); }
    if(a === 'oublier'){
      if(!b.dataset.sur){ b.dataset.sur = '1'; b.textContent = 'Sûr ? Re-clique'; return; }
      oublier(); majBouton(); rendu('Cet appareil n\'est plus relié. Tes données restent ici, et en ligne sous ton code.', '');
    }
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !pan.hidden) ouvrir(false); });
  document.addEventListener('click', function(e){ if(!pan.hidden && !pan.contains(e.target) && !btn.contains(e.target)) ouvrir(false); });
  // Lien du QR code : …/#sync=OPTIH-…
  function depuisAdresse(){ var m = /#sync=([A-Za-z0-9-]+)/.exec(location.hash); if(!m) return; var c = propre(m[1]); if(c && c !== etat.code){ aRelier = c; ouvrir(true); } }
  majBouton(); depuisAdresse(); addEventListener('hashchange', depuisAdresse);
})();
