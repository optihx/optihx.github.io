/* ==========================================================
   opti'H ✗ — BOÎTE À OUTILS (onglet « Boîte à outils » de l'accueil)
   C'est le SEUL fichier à modifier pour ajouter ou enlever un lien.

   Chaque groupe = un jeu (ou « Divers »). Dans « liens », une ligne = un outil :
     { nom: "Le nom", lien: "https://...", texte: "À quoi ça sert" },
   - lien qui commence par https:// = site externe (s'ouvre dans un nouvel onglet)
   - lien du type "bdo/index.html#world-boss" = une page de TON site
   - mien: true = petit badge « Mon site »
   L'ordre ici = l'ordre affiché.
   ========================================================== */
window.OUTILS = [
  {
    groupe: "Black Desert Online",
    couleur: "#ff5a47",
    liens: [
      { nom: "Timer des world boss", lien: "bdo/index.html#world-boss", texte: "Le prochain boss, en direct.", mien: true },
      { nom: "Suivi de mon gear", lien: "bdo/index.html#gear", texte: "Objectif Ekleta IV.", mien: true },
      { nom: "Garmoth", lien: "https://garmoth.com/", texte: "Boss, calculateurs, simulateur de gear." },
      { nom: "BDO Codex", lien: "https://bdocodex.com/fr/", texte: "Base de données : objets, quêtes, recettes." },
      { nom: "BDOLytics", lien: "https://bdolytics.com/fr/EU", texte: "Prix du marché et carte des nœuds." }
    ]
  },
  {
    groupe: "Wuthering Waves",
    couleur: "#f4c64f",
    liens: [
      { nom: "Simulateur de dégâts", lien: "wuthering-waves/index.html#degats", texte: "Teste une team de 3.", mien: true },
      { nom: "Calendrier", lien: "wuthering-waves/index.html#calendrier", texte: "Bannières et version en cours.", mien: true },
      { nom: "Matériaux", lien: "wuthering-waves/index.html#materiaux", texte: "Ce qu'il faut pour monter un perso.", mien: true },
      { nom: "WuWa Tracker", lien: "https://wuwatracker.com/fr", texte: "Importe ton historique de tirages (pity, 50/50)." },
      { nom: "Carte interactive", lien: "https://interactivemap.app/wuthering-waves/", texte: "Coffres, échos, matériaux." }
    ]
  },
  {
    groupe: "Tower of God",
    couleur: "#b596ff",
    liens: [
      { nom: "Créateur d'équipe", lien: "tower-of-god/index.html#equipes", texte: "Aventure, Arène, Boss.", mien: true },
      { nom: "Codes cadeaux", lien: "tower-of-god/index.html#codes", texte: "À copier en un clic.", mien: true },
      { nom: "Guide Millenium", lien: "https://www.millenium.org/guide/405317.html", texte: "Guides en français." }
    ]
  },
  {
    groupe: "Divers",
    couleur: "#ffcf8a",
    liens: [
      { nom: "Ma carte de joueur", lien: "index.html#carte", texte: "Une image qui résume tous mes jeux, à partager.", mien: true },
      { nom: "Notifications", lien: "index.html#notifications", texte: "Bannières, resets, world boss, tâches.", mien: true },
      { nom: "Synchro", lien: "index.html", texte: "Mes données sur tous mes appareils (bouton en haut de l'accueil).", mien: true },
      { nom: "OP France", lien: "op/index.html", texte: "Mon guide Pirate Quest.", mien: true },
      { nom: "Ma chaîne Twitch", lien: "https://www.twitch.tv/optihx", texte: "Les lives." }
    ]
  }
];
