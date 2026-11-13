/* ==========================================================
   BDO — SUIVI DU GEAR (le seul fichier à modifier pour le mettre à jour)
   Pour chaque perso : ap, aap (AP d'éveil), dp, et une note.
   Le GS se calcule tout seul, comme en jeu : la meilleure AP (AP ou AP d'éveil) + DP.
   Mystic, Scholar et Kunoichi sont en gear tag : même stuff que Maegu.
   tag: true = perso en gear tag : il n'a pas sa propre carte dans « Suivi du gear ».

   OBJECTIF : la liste « accessoires » ci-dessous.
   - type "kharazad" : change son niveau quand tu la montes (I à X, X = DEC).
   - type "ekleta"   : pièce Ekleta (obtenue en échangeant une Kharazad DEC).
                       Au niveau « niveauEkleta » (IV) ou plus, la pièce est terminée.
   Quand tu transfères une Kharazad DEC en Ekleta, change son type en "ekleta",
   son nom et son niveau.
   ========================================================== */
window.GEAR = {
  maj: "13 novembre 2026",
  persos: [
    { nom: "Maegu",   img: "img/maegu1-mini.webp",   ap: 385, aap: 387, dp: 459, note: "Mon perso principal. Ma Mystic, ma Scholar et ma Kunoichi utilisent ce même stuff (gear tag)." },
    { nom: "Mystic",  img: "img/mystic1-mini.webp",  ap: 385, aap: 387, dp: 459, note: "Gear tag : même stuff que Maegu.", tag: true },
    { nom: "Scholar", img: "img/scholar1-mini.webp", ap: 385, aap: 387, dp: 459, note: "Gear tag : même stuff que Maegu.", tag: true },
    { nom: "Kunoichi", img: "img/kunoichi1-mini.webp", ap: 385, aap: 387, dp: 459, note: "Gear tag : même stuff que Maegu.", tag: true }
  ],
  // COURBE DU GS : ajoute une ligne à chaque fois que ton GS monte (date AAAA-MM-JJ).
  historique: [
    { date: "2026-10-05", gs: 841 },
    { date: "2026-11-13", gs: 846 }
  ],
  objectif: "6 accessoires Ekleta IV",
  etapes: "Monter les Kharazad au DEC, puis les échanger contre des Ekleta IV.",
  niveauEkleta: "IV",
  accessoires: [
    { place: "Anneau",           nom: "Ekleta du soleil",            niv: "IV",   type: "ekleta" },
    { place: "Anneau",           nom: "Ekleta du soleil",            niv: "IV",   type: "ekleta" },
    { place: "Boucle d'oreille", nom: "Kharazad de la lueur nocturne", niv: "VIII", type: "kharazad" },
    { place: "Boucle d'oreille", nom: "Kharazad de la lueur nocturne", niv: "VIII", type: "kharazad" },
    { place: "Collier",          nom: "Ekleta de l'aube",            niv: "IV",   type: "ekleta" },
    { place: "Ceinture",         nom: "Ekleta de la nuit tombante", niv: "IV",   type: "ekleta" }
  ],
  stuff: [
    { place: "Arme principale",  nom: "Amulette renard Souveraine ardente", niv: "VII" },
    { place: "Arme d'éveil",     nom: "Éventails vulpins Souverains ardents", niv: "VIII" },
    { place: "Arme secondaire",  nom: "Couteau Binyeo Souverain ardent", niv: "VI" },
    { place: "Armure",           nom: "Edana (casque, armure, gants, bottes)", niv: "II" },
    { place: "Artefacts",        nom: "Héraut de Kabua ×2", niv: "" },
    { place: "Cœur",             nom: "Cœur de Vell resplendissant exalté", niv: "" }
  ]
};
