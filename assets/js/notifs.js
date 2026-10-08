/* ==========================================================
   opti'H ✗ — NOTIFICATIONS (bouton « Notifications » de l'accueil)
   Chaque visiteur choisit ce qu'il veut recevoir. Les notifications arrivent
   même site fermé (envoyées par Netlify toutes les 5 minutes).
   ========================================================== */
window.VAPID_PUBLIQUE = "BN-GvepNZkpl0VcrdPu9XuyGK3IiQIzQuq8Y8jmkpfD_sSdI7qzSMSBhDdPvqaH89_N3wqneNbsf-Rs16KFSXlg";

(function(){
  var btn = document.querySelector('[data-notifs]');
  if(!btn) return;
  var KEY = 'optih-notifs';
  var SUJETS = [
    ['banniere', 'Bannières WuWa', 'Quand une nouvelle bannière sort, et la veille de sa fin.'],
    ['resets', 'Resets WuWa', 'La veille du reset de la Tour d\'adversité et de Whimpering Wastes.'],
    ['boss', 'World boss BDO', '10 minutes avant chaque world boss (serveur EU).'],
    ['taches', 'Tâches BDO', 'À 21 h, s\'il te reste des quotidiennes à cocher.'],
    ['coc', 'Clash of Clans', 'Quand une amélioration est finie (comptes ajoutés sur la page Clash of Clans).']
  ];
  function lire(){ try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){ return null; } }
  function ecrire(v){ try { if(v) localStorage.setItem(KEY, JSON.stringify(v)); else localStorage.removeItem(KEY); } catch(e){} }
  function b64(s){ var p = '='.repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }

  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var appli = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var possible = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && window.VAPID_PUBLIQUE.indexOf('%') < 0;

  var css = document.createElement('style');
  css.textContent =
    '.notif-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:transparent;color:var(--soft);font:inherit;font-size:13px;cursor:pointer;transition:color .2s,border-color .2s}' +
    '.notif-btn:hover,.notif-btn[aria-expanded="true"]{color:var(--ink);border-color:var(--led)}' +
    '.notif-btn.on{color:var(--led);border-color:var(--led)}' +
    '.notif-btn svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}' +
    '.notif-pan{position:fixed;z-index:130;top:76px;right:clamp(16px,4vw,56px);width:min(400px,calc(100% - 32px));max-height:calc(100dvh - 96px);overflow:auto;padding:18px;border-radius:16px;' +
      'background:#141a26;color:#f1efe6;border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 60px -20px rgba(0,0,0,.75);font:15px/1.45 "Figtree",system-ui,sans-serif}' +
    '.notif-pan[hidden]{display:none}' +
    '.notif-pan h2{margin:0 0 4px;font:800 20px/1.1 "Big Shoulders Display",system-ui;letter-spacing:.04em;text-transform:uppercase}' +
    '.notif-pan>p{margin:0 0 12px;color:#aab3c5;font-size:13.5px}' +
    '.notif-pan ul{list-style:none;margin:0 0 10px;padding:0;display:grid;gap:6px}' +
    '.notif-pan label{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1px solid rgba(255,255,255,.1);border-radius:10px;cursor:pointer;transition:border-color .2s,background .2s}' +
    '.notif-pan label:has(input:checked){border-color:rgba(255,207,138,.55);background:rgba(255,207,138,.06)}' +
    '.notif-pan input{flex:none;width:18px;height:18px;margin:2px 0 0;accent-color:#ffcf8a}' +
    '.notif-pan b{display:block;font-size:14.5px}' +
    '.notif-pan small{display:block;color:#aab3c5;font-size:12.5px}' +
    '.notif-calme{border-style:dashed!important}' +
    '.notif-act{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}' +
    '.notif-act button{padding:10px 16px;border-radius:999px;border:1px solid #ffcf8a;background:#ffcf8a;color:#1a1206;font:inherit;font-weight:700;cursor:pointer}' +
    '.notif-act button.sec{background:transparent;color:#f1efe6;border-color:rgba(255,255,255,.2);font-weight:600}' +
    '.notif-act button:disabled{opacity:.5;cursor:default}' +
    '.notif-etat{margin:10px 0 0;font-size:13.5px;color:#aab3c5}' +
    '.notif-etat.ok{color:#7fd6a0}.notif-etat.err{color:#ff9a8a}' +
    '.notif-x{position:absolute;top:10px;right:10px;width:32px;height:32px;border:0;border-radius:50%;background:transparent;color:#aab3c5;font-size:20px;cursor:pointer}' +
    '.notif-x:hover{color:#fff;background:rgba(255,255,255,.08)}' +
    '@media (max-width:820px){.notif-pan{top:auto;bottom:calc(76px + env(safe-area-inset-bottom));right:16px;left:16px;width:auto;max-height:calc(100dvh - 120px)}}';
  document.head.appendChild(css);

  var pan = document.createElement('div');
  pan.className = 'notif-pan'; pan.id = 'notif-pan'; pan.hidden = true;
  pan.setAttribute('role', 'dialog'); pan.setAttribute('aria-labelledby', 'notif-titre');
  document.body.appendChild(pan);
  btn.setAttribute('aria-controls', 'notif-pan'); btn.setAttribute('aria-expanded', 'false');

  function etat(txt, cl){ var p = pan.querySelector('.notif-etat'); if(p){ p.textContent = txt; p.className = 'notif-etat' + (cl ? ' ' + cl : ''); } }
  function majBouton(){ var a = lire(); btn.classList.toggle('on', !!(a && a.endpoint)); btn.querySelector('span').textContent = a && a.endpoint ? 'Notifs activées' : 'Notifications'; }

  function rendu(){
    var a = lire(), choix = a ? a.sujets : ['banniere', 'resets', 'boss', 'taches', 'coc'], calme = a ? a.calme !== false : true;
    var h = '<button type="button" class="notif-x" aria-label="Fermer">×</button><h2 id="notif-titre">Notifications</h2>';
    if(!possible){
      h += '<p>' + (window.VAPID_PUBLIQUE.indexOf('%') > -1 ? 'Les notifications ne sont pas encore branchées.' : 'Ton navigateur ne gère pas les notifications. Essaie avec Chrome, Edge ou Firefox.') + '</p>';
    } else if(ios && !appli){
      h += '<p>Sur iPhone et iPad, les notifications marchent seulement avec l\'appli installée : touche <b>Partager</b> puis <b>Sur l\'écran d\'accueil</b>, ouvre l\'appli, et reviens ici.</p>';
    } else {
      h += '<p>Choisis ce que tu veux recevoir. Ça marche même quand le site est fermé.</p><ul>' +
        SUJETS.map(function(s){ return '<li><label><input type="checkbox" value="' + s[0] + '"' + (choix.indexOf(s[0]) > -1 ? ' checked' : '') + '><span><b>' + s[1] + '</b><small>' + s[2] + '</small></span></label></li>'; }).join('') +
        '<li><label class="notif-calme"><input type="checkbox" id="notif-calme"' + (calme ? ' checked' : '') + '><span><b>Pas la nuit</b><small>Entre minuit et 8 h : pas de world boss, et les améliorations Clash of Clans arrivent à 8 h.</small></span></label></li></ul>' +
        '<div class="notif-act"><button type="button" data-n="ok">' + (a ? 'Enregistrer' : 'Activer les notifications') + '</button>' +
        (a ? '<button type="button" class="sec" data-n="test">M\'envoyer un test</button><button type="button" class="sec" data-n="off">Tout désactiver</button>' : '') + '</div>' +
        '<p class="notif-etat">' + (a ? 'Activées sur cet appareil.' : 'Ton navigateur va te demander l\'autorisation.') + '</p>';
    }
    pan.innerHTML = h;
  }
  function ouvrir(o){ pan.hidden = !o; btn.setAttribute('aria-expanded', o); if(o){ rendu(); var f = pan.querySelector('input,button[data-n]'); if(f) f.focus(); } }

  async function abonner(){
    var sujets = [].map.call(pan.querySelectorAll('ul input[value]:checked'), function(i){ return i.value; });
    var calme = pan.querySelector('#notif-calme').checked;
    if(!sujets.length){ etat('Coche au moins une case.', 'err'); return; }
    var b = pan.querySelector('[data-n="ok"]'); b.disabled = true; etat('Un instant…');
    try {
      var perm = await Notification.requestPermission();
      if(perm !== 'granted'){ etat('Tu as refusé les notifications. Pour changer d\'avis : cadenas à gauche de l\'adresse → Notifications → Autoriser.', 'err'); b.disabled = false; return; }
      var reg = await navigator.serviceWorker.ready;
      var sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(window.VAPID_PUBLIQUE) });
      var r = await fetch((/netlify\.app$/.test(location.hostname) ? '' : 'https://optihx.netlify.app') + '/api/abonnement', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sub: sub.toJSON(), sujets: sujets, calme: calme }) });
      if(!r.ok) throw new Error('serveur ' + r.status);
      ecrire({ endpoint: sub.endpoint, sujets: sujets, calme: calme });
      majBouton(); rendu(); etat('C\'est bon ! Tu recevras tes notifications sur cet appareil.', 'ok');
      document.dispatchEvent(new Event('optih-notifs'));
    } catch(e){ etat('Ça n\'a pas marché (' + (e && e.message || 'erreur') + '). Réessaie dans un moment.', 'err'); b.disabled = false; }
  }
  async function desabonner(){
    try {
      var reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription(), a = lire();
      var ep = (sub && sub.endpoint) || (a && a.endpoint);
      if(ep) await fetch((/netlify\.app$/.test(location.hostname) ? '' : 'https://optihx.netlify.app') + '/api/abonnement', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ endpoint: ep }) });
      if(sub) await sub.unsubscribe();
    } catch(e){}
    ecrire(null); majBouton(); rendu(); etat('Notifications désactivées sur cet appareil.');
  }
  async function test(){
    var reg = await navigator.serviceWorker.ready;
    reg.showNotification('opti\'H ✗', { body: 'Les notifications marchent sur cet appareil 👍', icon: 'assets/app/icon-192.png', tag: 'test' });
    etat('Notification de test envoyée.', 'ok');
  }

  btn.addEventListener('click', function(){ ouvrir(pan.hidden); });
  pan.addEventListener('click', function(e){
    if(e.target.closest('.notif-x')) return ouvrir(false);
    var b = e.target.closest('[data-n]'); if(!b) return;
    if(b.dataset.n === 'ok') abonner();
    if(b.dataset.n === 'off') desabonner();
    if(b.dataset.n === 'test') test();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !pan.hidden){ ouvrir(false); btn.focus(); } });
  document.addEventListener('click', function(e){ if(!pan.hidden && !pan.contains(e.target) && !btn.contains(e.target)) ouvrir(false); });
  majBouton();
  if(location.hash === '#notifications') ouvrir(true);
  addEventListener('hashchange', function(){ if(location.hash === '#notifications') ouvrir(true); });
})();
