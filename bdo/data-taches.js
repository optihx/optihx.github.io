/* ==========================================================
   BDO — MES TÂCHES : la liste proposée au départ et les heures de reset.
   Chaque visiteur a SA liste, enregistrée sur son appareil : il peut cocher,
   ajouter ses propres tâches ou enlever celles qu'il ne fait pas.

   Heures en UTC (serveur EU) : 0 h UTC = 2 h en France l'été, 1 h l'hiver.
   Le site affiche toujours l'heure du visiteur.
   - quotidien : chaque jour à heureUTC
   - hebdo     : chaque semaine, le jour donné (0 = dimanche, 1 = lundi … 4 = jeudi)
   Pour une tâche hebdo qui ne se reset pas le même jour que les autres,
   ajoute  jour: X  dans sa ligne (ex. jour: 1 pour le lundi).
   ========================================================== */
window.TACHES_BDO = {
  reset: { heureUTC: 0, jourHebdo: 4 },
  quotidien: [
    { id: "q-journalieres", nom: "Quêtes journalières" },
    { id: "q-boss",         nom: "World boss du jour" },
    { id: "q-ouvriers",     nom: "Ouvriers et nœuds" },
    { id: "q-presence",     nom: "Récompense de présence" }
  ],
  hebdo: [
    { id: "h-shrine",       nom: "Black Shrine" },
    { id: "h-failles",      nom: "Failles obscures" },
    { id: "h-quetes",       nom: "Quêtes hebdomadaires" }
  ]
};
