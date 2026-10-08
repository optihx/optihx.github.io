/* Wuthering Waves — la page est rangée en onglets : un seul bloc visible à la fois.
   Les liens du type #tier, #codes… ouvrent l'onglet correspondant. */
(function(){
  var bar = document.getElementById('onglets');
  if(!bar) return;
  var tabs = [].slice.call(bar.querySelectorAll('[role="tab"]'));
  var ids = tabs.map(function(t){ return t.getAttribute('aria-controls'); });
  var DEF = ids[0], pret = false;

  function show(id, defiler){
    if(ids.indexOf(id) < 0) return;
    ids.forEach(function(x){ var p = document.getElementById(x); if(p) p.hidden = x !== id; });
    tabs.forEach(function(t){
      var on = t.getAttribute('aria-controls') === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      if(on && bar.scrollWidth > bar.clientWidth) bar.scrollTo({left: t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2, behavior: 'smooth'});
    });
    if(pret && location.hash !== '#' + id && !/^#fiche-/.test(location.hash)) history.replaceState(null, '', '#' + id);
    if(defiler){
      var y = bar.getBoundingClientRect().top + scrollY - 0;
      if(scrollY > y || defiler === 'force') scrollTo({top: y, behavior: 'smooth'});
    }
    var p = document.getElementById(id);
    if(p) [].forEach.call(p.querySelectorAll('.rv:not(.vu)'), function(e){ e.classList.add('vu'); });
  }
  window.ongletWuwa = show;

  bar.addEventListener('click', function(e){
    var t = e.target.closest('[role="tab"]'); if(!t) return;
    e.preventDefault(); show(t.getAttribute('aria-controls'), 'force');
  });
  bar.addEventListener('keydown', function(e){
    var i = tabs.indexOf(document.activeElement); if(i < 0) return;
    var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
    if(n === null) return;
    e.preventDefault(); n = (n + tabs.length) % tabs.length; tabs[n].focus(); show(ids[n]);
  });
  // tout lien interne vers un onglet (bouton du haut, fiches, etc.)
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]'); if(!a || bar.contains(a)) return;
    var id = a.getAttribute('href').slice(1);
    if(ids.indexOf(id) > -1){ e.preventDefault(); show(id, 'force'); }
  });
  addEventListener('hashchange', function(){ var h = location.hash.slice(1); if(ids.indexOf(h) > -1) show(h); });

  var h = location.hash.slice(1);
  show(ids.indexOf(h) > -1 ? h : DEF);
  pret = true;
  if(ids.indexOf(h) > -1) setTimeout(function(){ show(h, 'force'); }, 60);
})();
