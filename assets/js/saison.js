/* ==========================================================
   opti'H ✗ — DÉCOR DE SAISON (accueil)
   Le décor s'allume tout seul selon la date. Pour changer les dates,
   modifie « du » et « au » (format MM-JJ). Pour voir un décor tout de suite :
   ajoute ?saison=halloween ou ?saison=noel à l'adresse de l'accueil.
   ========================================================== */
window.SAISONS = [
  { id: "halloween", du: "10-20", au: "11-02" },
  { id: "noel",      du: "12-01", au: "01-06" }
];

(function(){
  var shelf = document.getElementById('shelf');
  if(!shelf) return;
  var q = new URLSearchParams(location.search).get('saison');
  var d = new Date(), md = ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  function dedans(s){ return s.du <= s.au ? (md >= s.du && md <= s.au) : (md >= s.du || md <= s.au); }
  var S = (window.SAISONS || []).filter(function(s){ return q ? s.id === q : dedans(s); })[0];
  if(!S) return;
  var calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('saison-' + S.id);

  var css = document.createElement('style');
  css.textContent =
    /* --- Halloween --- */
    '.saison-halloween{--led:#ff9a3c}' +
    '.saison-halloween .room{background:radial-gradient(60% 45% at 50% 38%,rgba(255,140,50,.18),transparent 70%),repeating-linear-gradient(90deg,rgba(0,0,0,.08) 0 1px,transparent 1px 120px),linear-gradient(180deg,#1a1626,#0d0b14)!important}' +
    '.deco{flex:none;align-self:flex-end;position:relative;pointer-events:none}' +
    '.deco svg{display:block;overflow:visible}' +
    '.deco-citrouille{width:86px;margin-left:6px}' +
    '.deco-citrouille .lueur{animation:flamme 3.2s ease-in-out infinite}' +
    '@keyframes flamme{0%,100%{opacity:.85}45%{opacity:1}55%{opacity:.7}}' +
    '.chauves{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden}' +
    '.chauves svg{position:absolute;width:46px;fill:#4a3d66;opacity:.85;animation:vol 14s ease-in-out infinite}' +
    '@keyframes vol{0%,100%{transform:translate(0,0) rotate(-4deg)}50%{transform:translate(24px,-14px) rotate(5deg)}}' +
    /* --- Noël --- */
    '.saison-noel{--led:#ffe2b0}' +
    '.guirlande{position:absolute;left:4%;right:4%;top:-34px;height:20px;display:flex;justify-content:space-between;pointer-events:none}' +
    '.guirlande::before{content:"";position:absolute;left:0;right:0;top:0;height:12px;border-bottom:1.5px solid rgba(255,255,255,.25);border-radius:0 0 50% 50%/0 0 100% 100%}' +
    '.guirlande i{position:relative;top:9px;width:9px;height:13px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:var(--b);box-shadow:0 0 12px 3px var(--b);animation:clign 2.4s ease-in-out infinite;animation-delay:var(--t)}' +
    '@keyframes clign{0%,100%{opacity:1}50%{opacity:.45}}' +
    '.saison-noel .shelf::before{display:none}' +
    '.deco-cadeau{width:78px;margin-left:6px}' +
    '.neige{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden}' +
    '.neige i{position:absolute;top:-10px;width:var(--s);height:var(--s);border-radius:50%;background:#fff;opacity:var(--o);animation:tombe var(--d) linear infinite;animation-delay:var(--t)}' +
    '@keyframes tombe{to{transform:translate(var(--x),105vh)}}' +
    '@media (max-width:820px){.guirlande{display:none}.deco-citrouille,.deco-cadeau{width:70px}}' +
    '@media (prefers-reduced-motion:reduce){.deco *,.chauves svg,.guirlande i{animation:none!important}}';
  document.head.appendChild(css);

  var deco = document.createElement('div');
  deco.className = 'deco'; deco.setAttribute('aria-hidden', 'true');

  if(S.id === 'halloween'){
    deco.classList.add('deco-citrouille');
    deco.innerHTML = '<svg viewBox="0 0 100 92">' +
      '<defs><radialGradient id="cg" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#ffab45"/><stop offset="1" stop-color="#c9531a"/></radialGradient>' +
      '<radialGradient id="cl" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff2a8"/><stop offset="1" stop-color="#ffb02e"/></radialGradient></defs>' +
      '<ellipse cx="50" cy="90" rx="40" ry="3" fill="rgba(0,0,0,.45)"/>' +
      '<path d="M48 18c-1-7 2-12 8-14l2 4c-4 2-5 5-4 10z" fill="#5c7a2e"/>' +
      '<ellipse cx="30" cy="56" rx="22" ry="31" fill="url(#cg)"/><ellipse cx="70" cy="56" rx="22" ry="31" fill="url(#cg)"/>' +
      '<ellipse cx="50" cy="56" rx="24" ry="34" fill="url(#cg)"/>' +
      '<path d="M50 23v66M33 26c-6 18-6 44 0 62M67 26c6 18 6 44 0 62" stroke="rgba(120,40,10,.35)" stroke-width="2" fill="none"/>' +
      '<g class="lueur" fill="url(#cl)"><path d="M30 48l9-9 6 11z"/><path d="M70 48l-9-9-6 11z"/><path d="M47 58l3-7 3 7z"/>' +
      '<path d="M28 66c8 9 36 9 44 0l-4 9-5-4-5 6-4-6-4 6-5-6-5 4z"/></g></svg>';
    var ch = document.createElement('div');
    ch.className = 'chauves'; ch.setAttribute('aria-hidden', 'true');
    var bat = '<path d="M47 16l1-5 2 4 2-4 1 5c2 1 3 3 3 5 6-6 14-9 22-8-3 3-4 6-3 10 6-3 13-3 19 1-6 1-11 5-13 10-4-3-9-3-12 0-3-4-8-5-12-2-1 3-3 5-6 5s-5-2-6-5c-4-3-9-2-12 2-3-3-8-3-12 0-2-5-7-9-13-10 6-4 13-4 19-1 1-4 0-7-3-10 8-1 16 2 22 8 0-2 1-4 3-5z"/>';
    ch.innerHTML = [[7, 16, 0], [88, 12, -5], [80, 24, -9]].map(function(b){
      return '<svg viewBox="0 0 100 50" style="left:' + b[0] + '%;top:' + b[1] + '%;animation-delay:' + b[2] + 's">' + bat + '</svg>';
    }).join('');
    document.body.appendChild(ch);
  }

  if(S.id === 'noel'){
    deco.classList.add('deco-cadeau');
    deco.innerHTML = '<svg viewBox="0 0 100 86">' +
      '<ellipse cx="50" cy="84" rx="40" ry="3" fill="rgba(0,0,0,.45)"/>' +
      '<rect x="14" y="36" width="72" height="48" rx="3" fill="#b8323a"/><rect x="10" y="26" width="80" height="14" rx="3" fill="#cf3d46"/>' +
      '<rect x="44" y="26" width="12" height="58" fill="#f1d38a"/>' +
      '<path d="M50 26c-10-14-26-12-20-2 3 5 12 4 20 2zM50 26c10-14 26-12 20-2-3 5-12 4-20 2z" fill="#f1d38a"/></svg>';
    var g = document.createElement('div');
    g.className = 'guirlande';
    var C = ['#ff5a5a', '#ffd25a', '#5ad1ff', '#7dff9a', '#ff8ad8'];
    g.innerHTML = Array.apply(null, Array(16)).map(function(_, i){ return '<i style="--b:' + C[i % C.length] + ';--t:-' + (i * 0.37 % 2.4).toFixed(2) + 's"></i>'; }).join('');
    shelf.appendChild(g);
    if(!calme){
      var n = document.createElement('div');
      n.className = 'neige'; n.setAttribute('aria-hidden', 'true');
      var h = '';
      for(var i = 0; i < 38; i++){
        var s = (2 + Math.random() * 3).toFixed(1);
        h += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;--s:' + s + 'px;--o:' + (0.25 + Math.random() * 0.45).toFixed(2) +
          ';--d:' + (9 + Math.random() * 10).toFixed(1) + 's;--t:-' + (Math.random() * 18).toFixed(1) + 's;--x:' + ((Math.random() - 0.5) * 80).toFixed(0) + 'px"></i>';
      }
      n.innerHTML = h;
      document.body.appendChild(n);
    }
  }
  shelf.appendChild(deco);
})();
