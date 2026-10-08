(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToId = (id) => document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* ---------- Images manquantes : on les retire pour laisser l'icône ---------- */
  $$('.hc-media img, .avatar img').forEach((img) => {
    const remove = () => img.remove();
    if (img.complete && img.naturalWidth === 0) remove();
    else img.addEventListener('error', remove);
  });

  /* ---------- Catalogue : recherche + filtre par tag ---------- */
  const search = $('#hero-search');
  const tagBtns = $$('.tag-btn[data-tag]');
  const cards = $$('.hero-card');
  const countEl = $('#result-count');
  const grid = $('#catalog-grid');
  // Filtres cumulables : un rang (SS ou S) + un ou plusieurs rôles
  const RANKS = ['ss', 's'];
  const active = new Set();

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function applyFilter() {
    const q = norm(search.value.trim());
    let visible = 0;

    cards.forEach((card) => {
      const tags = (card.dataset.roles || '').split(' ');
      const ranks = [...active].filter((t) => RANKS.includes(t));
      const roles = [...active].filter((t) => !RANKS.includes(t));
      const roleOk = (!ranks.length || ranks.some((t) => tags.includes(t)))
        && (!roles.length || roles.some((t) => tags.includes(t)));
      const searchOk = norm(card.dataset.name || '').includes(q);
      const show = roleOk && searchOk;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    countEl.textContent = `${visible} héros`;

    const msg = $('#no-results-msg');
    if (visible === 0 && !msg) {
      const el = document.createElement('div');
      el.className = 'no-results';
      el.id = 'no-results-msg';
      el.textContent = 'Aucun héros ne correspond à cette recherche.';
      grid.appendChild(el);
    } else if (visible > 0 && msg) {
      msg.remove();
    }
  }

  search.addEventListener('input', applyFilter);
  tagBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      if (tag === 'tous') {
        active.clear();
      } else if (active.has(tag)) {
        active.delete(tag);
      } else {
        if (RANKS.includes(tag)) RANKS.forEach((r) => active.delete(r)); // SS et S s'excluent
        active.add(tag);
      }
      tagBtns.forEach((b) => b.classList.toggle('active',
        b.dataset.tag === 'tous' ? active.size === 0 : active.has(b.dataset.tag)));
      applyFilter();
    });
  });

  /* ---------- Fiches : une seule ouverte à la fois ---------- */
  const fiches = $$('.fiche[id]');
  const placeholder = $('#fiche-placeholder');

  function closeAllFiches() {
    fiches.forEach((f) => f.classList.remove('open'));
    placeholder?.classList.remove('hidden');
  }

  function openFiche(id) {
    const target = document.getElementById(id);
    if (!target?.classList.contains('fiche')) return;
    closeAllFiches();
    target.classList.add('open');
    placeholder?.classList.add('hidden');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Bouton « Fermer » ajouté dans l'en-tête de chaque fiche
  fiches.forEach((f) => {
    const head = f.querySelector('.fiche-head');
    if (!head) return;
    const btn = document.createElement('button');
    btn.className = 'fiche-close';
    btn.innerHTML = '<svg><use href="#i-close"/></svg>Fermer';
    btn.addEventListener('click', () => {
      f.classList.remove('open');
      placeholder?.classList.remove('hidden');
      scrollToId('detail-section');
    });
    head.appendChild(btn);
  });

  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      openFiche(card.getAttribute('href').slice(1));
    });
  });

  /* ---------- Menu mobile ---------- */
  const navToggle = $('#nav-toggle');
  const mainNav = $('#main-nav');

  if (navToggle && mainNav) {
    const setMenu = (open) => {
      mainNav.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    };
    navToggle.addEventListener('click', () => setMenu(!mainNav.classList.contains('open')));
    mainNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  }

  // Liens « bientôt » : inactifs
  $$('.main-nav a.soon').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

  /* ---------- Vues : accueil / guides / tier list ---------- */
  function setView(view) {
    ['guides', 'tierlist', 'bateaux', 'familiers'].forEach((v) => document.body.classList.toggle(`view-${v}`, view === v));
  }

  // Lien (href) -> vue à afficher + section vers laquelle défiler
  const routes = {
    '#top': { view: 'home' },
    '#catalog': { view: 'home', scrollTo: 'catalog' },
    '#up-heroes': { view: 'guides' },
    '#tier-list': { view: 'tierlist' },
    '#bateaux': { view: 'bateaux' },
    '#familiers': { view: 'familiers' },
  };

  $$('.main-nav a, .footer-col a').forEach((link) => {
    const route = routes[link.getAttribute('href')];
    if (!route) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setView(route.view);
      route.scrollTo ? scrollToId(route.scrollTo) : scrollTop();
    });
  });

  // Boutons « Fermer » des vues Guides / Tier List
  ['up-heroes-close', 'tier-list-close', 'bateaux-close', 'familiers-close'].forEach((id) => {
    document.getElementById(id)?.addEventListener('click', () => {
      setView('home');
      scrollTop();
    });
  });

  /* ---------- Page bateaux : filtre par rareté + liens vers les fiches ---------- */
  const shipFilters = $$('.ship-filter');
  shipFilters.forEach((btn) => {
    btn.addEventListener('click', () => {
      shipFilters.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const r = btn.dataset.rarity;
      $$('.ship-card').forEach((c) => { c.style.display = r === 'tous' || c.dataset.rarity === r ? '' : 'none'; });
    });
  });

  // Guide bateaux : recherche d'un héros
  const sgSearch = $('#ship-guide-search');
  [['#ship-guide-search', '#ship-guide'], ['#pet-guide-search', '#pet-guide-list']].forEach(([input, list]) => {
    const el = $(input);
    el?.addEventListener('input', () => {
      const q = norm(el.value.trim());
      $(list).querySelectorAll('.sg-row').forEach((r) => { r.style.display = norm(r.dataset.name).includes(q) ? '' : 'none'; });
    });
  });

  $$('.ship-hero').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      setView('home');
      openFiche(a.getAttribute('href').slice(1));
    });
  });
})();
