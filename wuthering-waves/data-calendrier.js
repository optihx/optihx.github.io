/* Calendrier Wuthering Waves — à mettre à jour à chaque version.
   Dates au format AAAA-MM-JJ. « s » = identifiant de la fiche du perso (voir data-resonateurs.js).
   Sources : Game8 / allthings.how (vérifié le 5 octobre 2026). */
window.CALENDRIER = {
  version: { nom: "3.7", debut: "2026-09-30", fin: "2026-11-11" },
  phases: [
    {
      nom: "Phase 1", debut: "2026-09-30", fin: "2026-10-22",
      persos: [ { s: "hsin", nouveau: true }, { s: "chisa" }, { s: "iuno" } ],
      armes: ["Havre de jade florissant (Hsin)", "Kumokiri (Chisa)", "Sceau de veilleuse lunaire (Iuno)"],
      quatre: ["buling", "taoqi", "youhu"]
    },
    {
      nom: "Phase 2", debut: "2026-10-22", fin: "2026-11-11",
      persos: [ { s: "suoming", nouveau: true }, { s: "lynae" }, { s: "lucilla" } ],
      armes: ["Unspoken Rue (Suoming)", "Éclateur spectral (Lynae)", "Instant figé (Lucilla)"],
      quatre: ["lumi", "danjin", "chixia"],
      note: "Certains sites annoncent le 20 octobre : la date exacte sera confirmée en jeu."
    }
  ],
  /* RESETS (serveur Europe) — heure en UTC : 3 h UTC = 5 h en France l'été, 4 h l'hiver.
     Tour et Whimpering Wastes : une date de reset connue + la durée du cycle en jours
     (le site calcule tout seul les suivants). */
  resets: {
    heureUTC: 3, jourHebdo: 1,
    tour:   { nom: "Tour d'adversité",  ref: "2026-09-14", cycle: 28, astrite: 800 },
    wastes: { nom: "Whimpering Wastes", ref: "2026-09-28", cycle: 28, astrite: 800 }
  },
  suivante: { nom: "3.8", date: "2026-11-11", note: "Date estimée (fin de la 3.7). Les persos seront annoncés au live de la version." }
};
