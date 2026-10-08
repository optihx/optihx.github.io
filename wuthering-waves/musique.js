/* ==========================================================
   Wuthering Waves — bouton MUSIQUE (lecteur officiel YouTube)
   Pour changer la musique : colle ci-dessous le lien d'une vidéo
   de la chaîne OFFICIELLE du jeu (ex. https://www.youtube.com/watch?v=XXXXXXXXXXX).
   Laisse vide "" pour cacher le bouton.
   ========================================================== */
window.MUSIQUE_WUWA = {
  lien: "https://youtu.be/qRURPk2NsPM",
  titre: "Musique de Wuthering Waves",
  credit: "Lecteur officiel YouTube · © Kuro Games"
};

(function(){
  var M = window.MUSIQUE_WUWA || {};
  var m = /(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/.exec(M.lien || '');
  var id = m && m[1];
  if(!id && !window.MUSIQUE_DEMO) return;

  var css = document.createElement('style');
  css.textContent =
  '.mus-btn{position:fixed;left:clamp(14px,2.5vw,28px);bottom:calc(22px + env(safe-area-inset-bottom));z-index:56;display:inline-flex;align-items:center;gap:8px;height:46px;padding:0 16px 0 13px;' +
    'border:1px solid var(--line);border-radius:999px;background:var(--glass);color:var(--ink);font:600 14px/1 var(--body);cursor:pointer;' +
    '-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 10px 26px -14px rgba(0,0,0,.45);transition:border-color .2s,transform .2s}' +
  '.mus-btn:hover{border-color:var(--gold);transform:translateY(-1px)}' +
  '.mus-btn:focus-visible{outline:2px solid var(--gold);outline-offset:3px}' +
  '.mus-btn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}' +
  '.mus-eq{display:none;align-items:flex-end;gap:2px;height:14px}' +
  '.mus-eq i{width:3px;height:100%;border-radius:2px;background:var(--gold);transform-origin:bottom;animation:mus-eq 1s ease-in-out infinite}' +
  '.mus-eq i:nth-child(2){animation-delay:-.35s}.mus-eq i:nth-child(3){animation-delay:-.7s}' +
  '@keyframes mus-eq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}' +
  '.mus-btn.joue .mus-eq{display:inline-flex}.mus-btn.joue .mus-note{display:none}' +
  '.mus-panneau{position:fixed;left:clamp(14px,2.5vw,28px);bottom:calc(80px + env(safe-area-inset-bottom));z-index:57;width:min(340px,calc(100% - 28px));padding:12px;border:1px solid var(--line);border-radius:16px;' +
    'background:var(--glass);color:var(--ink);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 22px 50px -20px rgba(0,0,0,.5);font-family:var(--body);' +
    'transition:opacity .25s,transform .3s cubic-bezier(.16,1,.3,1)}' +
  '.mus-panneau.cache{opacity:0;transform:translateY(10px);pointer-events:none}' +
  '.mus-tete{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}' +
  '.mus-tete b{font:700 14px/1.2 var(--title)}' +
  '.mus-tete div{display:flex;gap:6px}' +
  '.mus-tete button{display:grid;place-items:center;width:32px;height:32px;padding:0;border:1px solid var(--line);border-radius:50%;background:transparent;color:var(--soft);cursor:pointer;transition:color .2s,border-color .2s}' +
  '.mus-tete button:hover{color:var(--ink);border-color:var(--gold)}' +
  '.mus-tete svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
  '.mus-video{position:relative;aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:#0b0d10}' +
  '.mus-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}' +
  '.mus-video .mus-vide{position:absolute;inset:0;display:grid;place-items:center;color:#9aa3ae;font-size:13px;text-align:center;padding:12px}' +
  '.mus-credit{margin:8px 2px 0;color:var(--soft);font-size:12px}' +
  '@media (max-width:820px){.mus-btn{left:auto;right:14px;height:42px;padding:0 14px 0 11px}html.avec-onglets .mus-btn{bottom:calc(76px + env(safe-area-inset-bottom))}' +
    '.mus-panneau{left:14px;right:14px;width:auto;bottom:calc(130px + env(safe-area-inset-bottom))}html:not(.avec-onglets) .mus-panneau{bottom:calc(74px + env(safe-area-inset-bottom))}}' +
  '@media (prefers-reduced-motion:reduce){.mus-eq i{animation:none}}';
  document.head.appendChild(css);

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'mus-btn';
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'mus-panneau');
  btn.innerHTML = '<svg class="mus-note" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>' +
    '<span class="mus-eq" aria-hidden="true"><i></i><i></i><i></i></span><span>Musique</span>';

  var pan = document.createElement('div');
  pan.id = 'mus-panneau'; pan.className = 'mus-panneau cache'; pan.setAttribute('role', 'dialog'); pan.setAttribute('aria-label', M.titre || 'Musique');
  pan.innerHTML = '<div class="mus-tete"><b>' + (M.titre || 'Musique') + '</b><div>' +
    '<button type="button" data-act="reduire" title="Réduire (la musique continue)" aria-label="Réduire"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg></button>' +
    '<button type="button" data-act="stop" title="Arrêter la musique" aria-label="Arrêter"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
    '</div></div><div class="mus-video"></div><p class="mus-credit">' + (M.credit || '') + '</p>';

  document.body.appendChild(pan); document.body.appendChild(btn);
  var video = pan.querySelector('.mus-video'), ouvert = false;

  function ouvrir(o){
    ouvert = o; pan.classList.toggle('cache', !o); btn.setAttribute('aria-expanded', o);
  }
  function jouer(){
    if(!video.firstChild){
      if(id){
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&loop=1&playlist=' + id + '&rel=0&modestbranding=1';
        f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.title = M.titre || 'Musique';
        video.appendChild(f);
      } else {
        video.innerHTML = '<div class="mus-vide">Ici : le lecteur YouTube officiel (la vidéo choisie).</div>';
      }
      btn.classList.add('joue');
    }
  }
  btn.addEventListener('click', function(){ jouer(); ouvrir(!ouvert); });
  pan.addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return;
    if(b.dataset.act === 'reduire') ouvrir(false);
    if(b.dataset.act === 'stop'){ video.innerHTML = ''; btn.classList.remove('joue'); ouvrir(false); }
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && ouvert) ouvrir(false); });
})();
