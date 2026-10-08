/* ==========================================================
   opti'H ✗ — LISTE DES JEUX
   C'est le SEUL fichier à modifier pour ajouter un jeu sur l'étagère.

   Pour ajouter un jeu :
   1. Copie le dossier « _modele » et renomme-le (ex. « genshin »).
   2. Ajoute un bloc { ... } ci-dessous (copie-colle un bloc existant).
   3. C'est tout : l'étagère et la liste « Autres jeux » en bas
      de chaque page se mettent à jour toutes seules.
   L'ordre des blocs = l'ordre des boîtes sur l'étagère.

   Champs :
   - nom      : le nom affiché
   - court    : (facultatif) nom court pour la barre d'onglets sur téléphone
   - lien     : la page du jeu (dossier/index.html)
   - image    : la jaquette de la boîte (idéalement 900 px de large)
   - couleur  : la couleur du jeu (trait sur la tranche, bouton)
   - texte    : une phrase courte
   - type     : petit texte (ex. « PC », « Mobile »)
   - action   : (facultatif) texte du bouton, sinon « Jouer »
   - police   : (facultatif) la police du nom sur la tranche, ex. "Cinzel"
                (polices dispo : voir assets/fonts/fonts.css)
   - fond     : (facultatif) la couleur de la tranche
   - encre    : (facultatif) la couleur du texte sur la tranche
   ========================================================== */
window.JEUX = [
  {
    nom: "Black Desert Online",
    court: "BDO",
    police: "Cinzel",
    fond: "#0e0b09",
    encre: "#efe3cc",
    lien: "bdo/index.html",
    image: "assets/img/card-bdo.webp",
    couleur: "#ff5a47",
    texte: "Maegu, Mystic, Scholar, le timer des world boss et mes screens.",
    type: "PC"
  },
  {
    nom: "Wuthering Waves",
    court: "WuWa",
    police: "Chakra Petch",
    fond: "#eceef1",
    encre: "#101317",
    lien: "wuthering-waves/index.html",
    image: "assets/img/card-wuwa.webp",
    couleur: "#f4c64f",
    texte: "Le meilleur build et les meilleures équipes des 60 résonateurs, ma team Changli · Lupa · Shorekeeper et des artworks.",
    type: "PC · Mobile"
  },
  {
    nom: "Tower of God",
    court: "ToG",
    police: "Unbounded",
    fond: "#0c0a1b",
    encre: "#eeeaff",
    lien: "tower-of-god/index.html",
    image: "assets/img/card-tog.webp",
    couleur: "#b596ff",
    texte: "Bases, guide débutant, méta.",
    type: "Mobile · PC"
  },
  {
    nom: "OP France",
    court: "OP",
    police: "Big Shoulders Display",
    fond: "#1a0f08",
    encre: "#fff3e8",
    lien: "op/index.html",
    image: "assets/img/card-op.webp",
    couleur: "#ff8a3d",
    texte: "Guide des héros de Pirate Quest : Dream Line : builds, tier list, bateaux, familiers.",
    type: "Guide",
    action: "Ouvrir le guide"
  },
  {
    nom: "Clash of Clans",
    court: "CoC",
    police: "Lilita One",
    fond: "#2a1d0c",
    encre: "#ffd27a",
    lien: "clash-of-clans/index.html",
    image: "assets/img/card-coc.webp",
    couleur: "#f2b33d",
    texte: "Mes comptes : améliorations en cours des ouvriers et du labo, progression par HDV, notifications.",
    type: "Mobile"
  },
  {
    nom: "Palworld",
    court: "Pal",
    police: "Lilita One",
    fond: "#0d2e29",
    encre: "#7ff0d8",
    lien: "palworld/index.html",
    image: "assets/img/card-pal.webp",
    couleur: "#3fd0b4",
    texte: "Mon Paldeck (Pals capturés) et le calcul de reproduction.",
    type: "PC"
  },
  {
    nom: "Aethel Spire",
    court: "Aethel",
    police: "Cinzel",
    fond: "#0a1230",
    encre: "#eef3ff",
    lien: "aethel-spire/index.html",
    image: "assets/img/card-aethel.webp",
    couleur: "#5ec8ff",
    texte: "Mon propre jeu, en bêta (pas fini, il s'améliore petit à petit) ! Le lien pour le tester et le guide : tier list, équipes, runes.",
    type: "Mon jeu",
    action: "Ouvrir le guide"
  }
];
