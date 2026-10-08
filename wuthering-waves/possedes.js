/* Wuthering Waves — « Mes persos » : les résonateurs que tu possèdes.
   Enregistré dans le navigateur, utilisé par Résonateurs, Ma team et Dégâts.
   Quand la liste change, l'événement « possedes » est envoyé sur document. */
(function(){
  var KEY = 'optih-wuwa-possedes', l = [];
  try { l = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e){ l = []; }
  if(!Array.isArray(l)) l = [];
  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(l)); } catch(e){}
    document.dispatchEvent(new CustomEvent('possedes', {detail: l.slice()}));
  }
  window.POSSEDES = {
    liste: function(){ return l.slice(); },
    a: function(s){ return l.indexOf(s) > -1; },
    vide: function(){ return !l.length; },
    basculer: function(s){ var i = l.indexOf(s); if(i > -1) l.splice(i, 1); else l.push(s); save(); return i < 0; },
    tout: function(slugs){ l = slugs.slice(); save(); },
    rien: function(){ l = []; save(); }
  };
})();
