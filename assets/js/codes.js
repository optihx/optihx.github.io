/* ==========================================================
   opti'H ✗ — CODES CADEAUX
   Pour ajouter un code : copie une ligne { c: ..., r: ... } dans le bon jeu.
   - c    : le code (exactement comme dans le jeu)
   - r    : ce qu'il donne
   - etat : "actif" (vérifié) ou "tester" (pas sûr qu'il marche encore)
   - fin  : (facultatif) date de fin, en texte
   - lien : (facultatif) lien qui active le code directement
   Pour retirer un code expiré : supprime sa ligne.
   Pense à changer la date « verif » quand tu mets la liste à jour.
   ========================================================== */
window.CODES = {
  verif: "5 octobre 2026",
  jeux: {
    "wuthering-waves": {
      ou: "Menu (Échap) → Paramètres → Autres → Code d'échange. Les récompenses arrivent dans la boîte aux lettres.",
      info: "Les nouveaux codes sortent pendant les lives de chaque version et ne durent souvent que 1 à 2 jours.",
      codes: [
        { c: "WUTHERINGGIFT", r: "50 Astrite, 2 potions de résonance premium, 2 inhalateurs, 2 sacs d'énergie, 15 000 crédits", etat: "actif", fin: "Permanent" }
      ]
    },
    "tower-of-god": {
      ou: "En jeu : icône de profil (en haut à gauche) → onglet Divers → Saisir un code, puis récupère la récompense dans la boîte aux lettres.",
      info: "Codes de l'anniversaire : pas sûr qu'ils marchent encore, essaie-les.",
      codes: [
        { c: "TOG3RDANNIVERSARY1", r: "Carte guide du destin, 20 coffres de tickets d'invocation, 200 clés de la Tour d'épreuves", etat: "tester" },
        { c: "TOG3RDANNIVERSARY2", r: "Carte forgeron du destin, 20 coffres de pierres de percée, 200 clés de la Tour d'épreuves", etat: "tester" },
        { c: "TOG3RDANNIVERSARY3", r: "10 tickets d'invocation du destin, 20 boîtes cadeaux épiques, 30 lumières d'étoile", etat: "tester" }
      ]
    }
  }
};
