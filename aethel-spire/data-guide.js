/* ==========================================================
   AETHEL SPIRE — GUIDE DU JOUEUR (d'après GUIDE-DU-JOUEUR.txt du jeu)
   Builds de runes, équipes conseillées, valeurs des runes, astuces, codes.
   ========================================================== */
window.GUIDE = {
  maj: "9 octobre 2026 (mise à jour « Ascension »)",

  /* 1. Les bases */
  bases: [
    ["Une équipe d'abord", "Monte d'abord <b>une</b> équipe de 4 héros au niveau 40 avant d'en préparer une deuxième."],
    ["Tank + Healer + DPS", "La synergie <b>Trinité</b> donne PV +8 % et DÉF +8 %."],
    ["L'élément compte", "Avantage = <b>+15 % de Taux Crit</b>. Désavantage = 1 coup sur 2 fait −30 %."],
    ["La position compte", "Les ennemis visent la ligne <b>avant</b> (Tanks) 3 fois plus que la ligne arrière (Healers)."],
    ["Éveil", "Chaque étoile d'Éveil (doublons) donne <b>+8 %</b> de PV / ATQ / DÉF : fusionne tes doublons dans l'écran Éveil."],
    ["Talents", "Dépense tes points de Talents (Académie) : <b>ATQ, PV et VIT</b> en premier."]
  ],
  cycle: ["fire", "wind", "water"],

  /* 2. Builds de runes par classe (clé = classe du jeu) */
  builds: {
    tank: { role: "Encaisse pour l'équipe : provocation et bonus de DÉF.",
      best: "Énergie + Garde + Endurance", alt: ["Garde ×2 + Énergie", "Énergie + Garde + Détermination"],
      e2: ["PV %", "DÉF %"], e4: ["DÉF %", "PV %"], e6: ["RÉS %", "DÉF %"], sous: ["PV %", "DÉF %", "RÉS %", "VIT"],
      pourquoi: "Sa RÉS réduit les dégâts qu'il subit (jusqu'à −35 %) et 40 % de sa DÉF s'ajoute à son ATQ. La réduction est au maximum à 83 de RÉS ; ensuite empile PV et DÉF." },
    healer: { role: "Soigne et renforce l'équipe.",
      best: "Rapidité + Énergie", alt: ["Rapidité + Volonté", "Énergie ×2 + Amélioration"],
      e2: ["VIT"], e4: ["PV %"], e6: ["PV %", "RÉS %"], sous: ["VIT", "PV %", "ATQ %", "RÉS %"],
      pourquoi: "Plus il est rapide, plus il soigne souvent. Les soins dépendent des PV max de la cible, +50 % de son ATQ. Volonté le protège des étourdissements au 1er tour." },
    dps_phys: { role: "Gros dégâts de mêlée.",
      best: "Rage + Lame", alt: ["Fatal + Lame", "Violent + Lame"],
      e2: ["ATQ %"], e4: ["Dég. Crit %", "Taux Crit %"], e6: ["ATQ %"], sous: ["Taux Crit %", "Dég. Crit %", "ATQ %", "VIT"],
      pourquoi: "Il a déjà +10 % de Taux Crit et +20 % de Dég. Crit. 90 % de Taux Crit affiché suffisent (les +10 % de classe ne sont pas affichés) ; ensuite Dég. Crit à l'emplacement 4." },
    dps_mag: { role: "Dégâts qui percent les défenses.",
      best: "Fatal + Focus", alt: ["Désespoir + Focus", "Rapidité + Focus"],
      e2: ["ATQ %"], e4: ["ATQ %"], e6: ["PRÉ %", "ATQ %"], sous: ["ATQ %", "PRÉ %", "VIT", "Taux Crit %"],
      pourquoi: "Il ignore 40 % de la DÉF : l'ATQ brute est sa meilleure stat. La PRÉ fait passer ses malus (DÉF ▼, ATQ ▼) sur les boss." },
    dps_range: { role: "Tire de loin sur plusieurs cibles.",
      best: "Fatal + Précision", alt: ["Fatal + Focus", "Rapidité + Focus"],
      e2: ["ATQ %"], e4: ["Taux Crit %", "ATQ %"], e6: ["PRÉ %"], sous: ["PRÉ %", "ATQ %", "VIT", "Taux Crit %"],
      pourquoi: "Chaque point de PRÉ lui donne +0,5 % de dégâts (100 de PRÉ = +50 %). PRÉ à l'emplacement 6 obligatoire." },
    assassin: { role: "Rapide et létal sur une cible.",
      best: "Rapidité + Lame", alt: ["Violent + Lame", "Rage + Lame"],
      e2: ["VIT"], e4: ["Taux Crit %", "Dég. Crit %"], e6: ["ATQ %"], sous: ["VIT", "Taux Crit %", "ATQ %", "Dég. Crit %"],
      pourquoi: "Chaque point de VIT au-dessus de 100 lui donne +0,5 % de dégâts et il joue en premier. VIT à l'emplacement 2 obligatoire." }
  },
  ordreClasses: ["tank", "healer", "dps_phys", "dps_mag", "dps_range", "assassin"],
  nomsClasses: { tank: "Tank", healer: "Healer", dps_phys: "DPS physique", dps_mag: "DPS magique", dps_range: "DPS longue portée", assassin: "Assassin" },

  /* 4. Équipes conseillées : le 1er héros est le chef */
  /* Farm des donjons : équipes trouvées par simulation */
  farmEquipes: [{"cat": "Étage 9 · sans UR", "g": "farm", "sous": "Vérifié par simulation (12 combats par étage et par donjon, moyenne des 4 donjons). Conditions : héros SR / SSR niveau 40, runes Rares ★4 +9, sans étoile d'Éveil.", "liste": [{"nom": "Étage 9 · sans UR · A", "m": ["jinbe", "marco", "luffy", "eugeo"], "txt": "Chef Jinbe : PV +20%. Tank : Jinbe, Eugeo · Healer : Marco.", "taux": [["Étage 9", 94]]}, {"nom": "Étage 9 · sans UR · B", "m": ["marco", "jinbe", "choi", "endorsi"], "txt": "Chef Marco : RÉS +20%. Tank : Jinbe · Healer : Marco, Endorsi Jahad. Plus dur à la Nécropole (83 %).", "taux": [["Étage 9", 88]]}, {"nom": "Étage 9 · sans UR · C", "m": ["limtaegyu", "bellion", "marco", "yuhansung"], "txt": "Chef Lim Tae-Gyu : PRÉ +20%. Tank : Bellion · Healer : Marco. Plus dur au Repaire des Géants (67 %).", "taux": [["Étage 9", 86]]}, {"nom": "Étage 9 · sans UR · D", "m": ["min", "agil", "rachel", "yoo"], "txt": "Chef Min Byung-Gu : RÉS +20%. Tank : Agil, Yoo Jinho · Healer : Min Byung-Gu. Plus dur au Sanctuaire Magique (50 %).", "taux": [["Étage 9", 81]]}]}, {"cat": "Étage 9 · avec UR", "g": "farm", "sous": "Vérifié par simulation (12 combats par étage et par donjon, moyenne des 4 donjons). Conditions : au moins 2 UR, niveau 40, runes Rares ★4 +9, sans étoile d'Éveil.", "liste": [{"nom": "Étage 9 · avec UR · A", "m": ["sillad", "yamato", "min", "jinwoo"], "txt": "Chef Sillad : DÉF +15% et VIT +13%. Tank : Yamato · Healer : Min Byung-Gu.", "taux": [["Étage 9", 100]]}, {"nom": "Étage 9 · avec UR · B", "m": ["yamato", "min", "antares", "chopper"], "txt": "Chef Yamato : PV +25% et RÉS +15%. Tank : Yamato · Healer : Min Byung-Gu, Tony Tony Chopper.", "taux": [["Étage 9", 100]]}, {"nom": "Étage 9 · avec UR · C", "m": ["yamato", "law", "khun", "uta"], "txt": "Chef Yamato : PV +25% et RÉS +15%. Tank : Yamato · Healer : Trafalgar Law, Uta.", "taux": [["Étage 9", 100]]}, {"nom": "Étage 9 · avec UR · D", "m": ["yuri", "alice", "kirito", "sillad"], "txt": "Chef Yuri Zahard : VIT +15% et Taux Crit +15%. Tank : Alice Zuberg · Healer : Yuri Zahard.", "taux": [["Étage 9", 100]]}]}, {"cat": "Légende 1-2-3 · sans UR", "g": "farm", "sous": "Vérifié par simulation (12 combats par étage et par donjon, moyenne des 4 donjons). Conditions : héros SR / SSR niveau 40 au rang max (Arc-en-ciel 5★), runes ★6 +15.", "liste": [{"nom": "Légende · sans UR · A", "m": ["nami", "hatz", "chopper", "lisbeth"], "txt": "Chef Nami : VIT +10%. Tank : Hatz, Lisbeth · Healer : Tony Tony Chopper.", "taux": [["L1", 100], ["L2", 100], ["L3", 96]]}, {"nom": "Légende · sans UR · B", "m": ["lisbeth", "jinbe", "leafa", "ace"], "txt": "Chef Lisbeth : DÉF +15%. Tank : Lisbeth, Jinbe · Healer : Leafa. Plus dur au Sanctuaire Magique (75 % en L3).", "taux": [["L1", 100], ["L2", 100], ["L3", 86]]}, {"nom": "Légende · sans UR · C", "m": ["bellion", "eugeo", "chopper", "gunhee"], "txt": "Chef Bellion : PV +15%. Tank : Bellion, Eugeo · Healer : Tony Tony Chopper. Plus dur à l'Antre du Dragon (67 % en L3).", "taux": [["L1", 100], ["L2", 100], ["L3", 84]]}, {"nom": "Légende · sans UR · D", "m": ["lisbeth", "yui", "sachi", "yoo"], "txt": "Chef Lisbeth : DÉF +15%. Tank : Lisbeth, Yoo Jinho · Healer : Yui. Plus dur au Repaire des Géants (75 % en L3).", "taux": [["L1", 100], ["L2", 100], ["L3", 84]]}]}, {"cat": "Légende 1-2-3 · avec UR", "g": "farm", "sous": "Vérifié par simulation (12 combats par étage et par donjon, moyenne des 4 donjons). Conditions : au moins 2 UR, niveau 40 au rang max (Arc-en-ciel 5★), runes ★6 +15.", "liste": [{"nom": "Légende · avec UR · A", "m": ["kirito", "agil", "yui", "uta"], "txt": "Chef Kirito : Taux Crit +20% et Dég. Crit +25%. Tank : Agil · Healer : Yui, Uta.", "taux": [["L1", 100], ["L2", 100], ["L3", 100]]}, {"nom": "Légende · avec UR · B", "m": ["antares", "igris", "uta", "thomas"], "txt": "Chef Antares : DÉF +25% et PV +15%. Tank : Igris · Healer : Uta.", "taux": [["L1", 100], ["L2", 100], ["L3", 100]]}, {"nom": "Légende · avec UR · C", "m": ["yamato", "uta", "sillad", "hatz"], "txt": "Chef Yamato : PV +25% et RÉS +15%. Tank : Yamato, Hatz · Healer : Uta.", "taux": [["L1", 100], ["L2", 100], ["L3", 100]]}, {"nom": "Légende · avec UR · D", "m": ["mihawk", "yoo", "yuri", "hatz"], "txt": "Chef Dracule Mihawk : ATQ +18% et Taux Crit +18%. Tank : Yoo Jinho, Hatz · Healer : Yuri Zahard.", "taux": [["L1", 100], ["L2", 100], ["L3", 100]]}]}, {"cat": "Arc-en-ciel 1-2-3 · avec UR", "g": "farm", "sous": "Vérifié par simulation (12 combats par étage et par donjon, moyenne des 4 donjons). Conditions : au moins 2 UR, toute l'équipe en Éveil forcé (niveau 60) au rang max, runes ★6 +15.", "liste": [{"nom": "Arc-en-ciel · avec UR · A", "m": ["yuri", "igris", "mihawk", "agil"], "txt": "Chef Yuri Zahard : VIT +15% et Taux Crit +15%. Tank : Igris, Agil · Healer : Yuri Zahard. Plus dur au Repaire des Géants (17 % en Arc 3).", "taux": [["Arc 1", 100], ["Arc 2", 92], ["Arc 3", 59]]}, {"nom": "Arc-en-ciel · avec UR · B", "m": ["yuri", "bellion", "sillad", "yoo"], "txt": "Chef Yuri Zahard : VIT +15% et Taux Crit +15%. Tank : Bellion, Yoo Jinho · Healer : Yuri Zahard. Plus dur au Repaire des Géants (17 % en Arc 3).", "taux": [["Arc 1", 100], ["Arc 2", 94], ["Arc 3", 46]]}, {"nom": "Arc-en-ciel · avec UR · C", "m": ["antares", "yamato", "min", "igris"], "txt": "Chef Antares : DÉF +25% et PV +15%. Tank : Yamato, Igris · Healer : Min Byung-Gu. Plus dur au Repaire des Géants (33 % en Arc 3).", "taux": [["Arc 1", 100], ["Arc 2", 94], ["Arc 3", 46]]}, {"nom": "Arc-en-ciel · avec UR · D", "m": ["yuri", "agil", "antares", "sillad"], "txt": "Chef Yuri Zahard : VIT +15% et Taux Crit +15%. Tank : Agil · Healer : Yuri Zahard. Plus dur au Repaire des Géants (17 % en Arc 3).", "taux": [["Arc 1", 100], ["Arc 2", 81], ["Arc 3", 46]]}]}],

  equipes: [
    { cat: "Donjons de runes — étage 10 sans UR", liste: [
      { nom: "Équipe universelle A", ou: "Les 4 donjons", m: ["alice", "min", "cha", "rachel"], txt: "Lumière et Ténèbres : aucun désavantage contre les boss Feu et Vent. Alice encaisse, Min soigne, Rachel et Cha font les dégâts." },
      { nom: "Équipe universelle B", ou: "Les 4 donjons", m: ["jinbe", "marco", "luffy", "rachel"], txt: "Jinbe en chef : PV +20 % pour les alliés One Piece. La plus stable pour un farm ×30." },
      { nom: "Équipe universelle C", ou: "Les 4 donjons", m: ["bellion", "min", "luffy", "yuuki"], txt: "Bellion (SR) tient la ligne avant, Yuuki exécute le boss." },
      { nom: "Repaire des Géants", ou: "Boss Feu", m: ["jinbe", "silica", "yuuki", "limtaegyu"], txt: "Tout en Eau : avantage d'élément (+15 % de Taux Crit, jamais de coup « faible »)." },
      { nom: "Antre du Dragon", ou: "Boss Vent", m: ["lisbeth", "marco", "luffy", "ace"], txt: "Tout en Feu. Lisbeth en chef : DÉF +15 % pour les alliés Feu." },
      { nom: "Nécropole", ou: "Boss Ténèbres", m: ["alice", "min", "cha", "gunhee"], txt: "Tout en Lumière. Min en chef si tu manques de RÉS contre les étourdissements." },
      { nom: "Sanctuaire Magique", ou: "Boss Lumière", m: ["bellion", "law", "rachel", "white"], txt: "Tout en Ténèbres. Rachel et White profitent de la DÉF ▼." }
    ]},
    { cat: "Début de partie", sous: "Histoire, donjons 1 à 5", liste: [
      { nom: "La Trinité", m: ["shanks", "nami", "zoro", "sanji"], txt: "Tank + DPS variés, tous faciles à obtenir. Ajoute un Healer (Silica, Leafa, Chopper, Yui) dès que tu en as un : la synergie Trinité donne PV +8 % et DÉF +8 %." },
      { nom: "Trinité classique", m: ["hatz", "silica", "klein", "yuuki"], txt: "Tank + Healer + 2 DPS : la base pour finir les 8 premiers chapitres." }
    ]},
    { cat: "Avec des UR", sous: "Histoire 9 à 12, Flèche, donjons 11 à 13", liste: [
      { nom: "Mur et exécution", m: ["yamato", "yuri", "jinwoo", "kirito"], txt: "Yamato en chef : PV +25 % et RÉS +15 % pour tous. Yuri soigne et donne ATQ ▲ / DÉF ▲." },
      { nom: "Burst critique", m: ["kirito", "uta", "mihawk", "bam"], txt: "Kirito en chef : Taux Crit +20 % et Dég. Crit +25 % pour tous. Runes Rage + Lame sur les DPS." },
      { nom: "Magie et contrôle", m: ["evankhell", "yuri", "antares", "sillad"], txt: "Trois DPS magiques : zones énormes et ATQ ▼ permanent sur les ennemis. Evankhell en chef pour ATQ +22 % et PRÉ +20." }
    ]},
    { cat: "Arène (PvP)", liste: [
      { nom: "Équipe de vitesse", m: ["asuna", "uta", "bam", "jinwoo"], txt: "Asuna en chef : ATQ +15 % et VIT +12 %. Trois Assassins qui jouent avant l'adversaire. Runes Rapidité partout." },
      { nom: "Vitesse sans UR", m: ["baek", "min", "yuuki", "cha"], txt: "Baek en chef : VIT +15 % pour ses alliés Solo Leveling. Vise les soigneurs adverses en premier." }
    ]},
    { cat: "Défis chronométrés", sous: "Arène d'entraînement, boss mondial, fragments", liste: [
      { nom: "Assaut", m: ["luffy", "law", "ace", "rachel"], txt: "3 DPS : synergie Assaut (ATQ +10 %). Le boss frappe fort : garde un Healer, et mets les bonus ATQ ▲ avant les grosses compétences." },
      { nom: "Assaut UR", m: ["jinwoo", "yuri", "kirito", "evankhell"], txt: "Jinwoo en chef : ATQ +25 % et Dég. Crit +30 % pour tous." }
    ]}
  ],
  farm10: {
    titre: "Farmer un donjon étage 10 sans UR",
    note: "Vérifié par simulation : ≈ 95 % de victoires.",
    points: [
      "4 héros niveau 40 ; 6 runes <b>Légendaires ★5 montées à +15</b> sur chacun, avec le build de sa classe.",
      "<b>2 étoiles d'Éveil</b> sur chaque héros (2 à 3 doublons : facile sur des SR / SSR).",
      "Avec des runes Rares ou seulement +9 / +12, compte <b>4 étoiles d'Éveil</b>."
    ],
    fin: "Au-dessus : Légende 1 à 3 (bien plus durs) puis les étages Arc-en-ciel 14 à 16 pour des UR niveau 60 — voir l'onglet Modes."
  },

  /* 5. Valeurs des runes */
  etoiles: ["★7", "★6", "★5", "★4", "★3", "★2"],
  categories: [["Normale", "★2", "#e6e8ef"], ["Basique", "★3", "#5fd38d"], ["Rare", "★4", "#a77bff"], ["Légendaire", "★5", "#f2a33d"], ["Légendaire ★6", "★6", "#ff6b8b"], ["Arc-en-ciel", "★7", "#5ae0ff"]],
  principale: [
    ["PV", 2815, 2448, 1860, 1544, 1228, 930], ["ATQ", 184, 160, 135, 112, 89, 68], ["DÉF", 184, 160, 135, 112, 89, 68],
    ["PV %", "72 %", "63 %", "51 %", "42 %", "34 %", "26 %"], ["ATQ %", "72 %", "63 %", "51 %", "42 %", "34 %", "26 %"], ["DÉF %", "72 %", "63 %", "51 %", "42 %", "34 %", "26 %"],
    ["VIT", 48, 42, 39, 32, 26, 20], ["Taux Crit %", "67 %", "58 %", "47 %", "39 %", "31 %", "24 %"], ["Dég. Crit %", "92 %", "80 %", "65 %", "54 %", "43 %", "33 %"],
    ["RÉS %", "74 %", "64 %", "51 %", "42 %", "34 %", "26 %"], ["PRÉ %", "74 %", "64 %", "51 %", "42 %", "34 %", "26 %"]
  ],
  emplacements: [
    [1, ["ATQ"]], [2, ["ATQ", "ATQ %", "DÉF", "DÉF %", "PV", "PV %", "VIT"]], [3, ["DÉF"]],
    [4, ["ATQ %", "DÉF %", "PV %", "Taux Crit %", "Dég. Crit %"]], [5, ["PV"]], [6, ["ATQ %", "DÉF %", "PV %", "RÉS %", "PRÉ %"]]
  ],
  sousStats: [
    ["PV", 503, 375, 300, 249, 198, 150], ["PV %", "11 %", "8 %", "6 %", "5 %", "4 %", "3 %"], ["ATQ", 27, 20, 16, 13, 11, 8], ["ATQ %", "11 %", "8 %", "6 %", "5 %", "4 %", "3 %"],
    ["DÉF", 27, 20, 16, 13, 11, 8], ["DÉF %", "11 %", "8 %", "6 %", "5 %", "4 %", "3 %"], ["VIT", 8, 6, 5, 4, 3, 2], ["Taux Crit %", "8 %", "6 %", "5 %", "4 %", "3 %", "2 %"],
    ["Dég. Crit %", "9 %", "7 %", "6 %", "5 %", "4 %", "3 %"], ["RÉS %", "11 %", "8 %", "6 %", "5 %", "4 %", "3 %"], ["PRÉ %", "11 %", "8 %", "6 %", "5 %", "4 %", "3 %"]
  ],
  jets: [
    ["Normale", 0, 4, 0, 1], ["Basique", 2, 2, 2, 3], ["Rare", 3, 1, 3, 4], ["Légendaire", 4, 0, 4, 5]
  ],
  maxTheorique: [
    ["PV", 1875, 1500], ["PV %", "40 %", "30 %"], ["ATQ", 100, 80], ["ATQ %", "40 %", "30 %"], ["DÉF", 100, 80], ["DÉF %", "40 %", "30 %"],
    ["VIT", 30, 25], ["Taux Crit %", "30 %", "25 %"], ["Dég. Crit %", "35 %", "30 %"], ["RÉS %", "40 %", "30 %"], ["PRÉ %", "40 %", "30 %"]
  ],
  plafonds: [
    "<b>Taux Crit</b> : 100 % · <b>RÉS</b> : 100 · <b>PRÉ</b> : 100 · VIT, ATQ, PV, DÉF et Dég. Crit : pas de plafond.",
    "Un malus a entre <b>15 % et 85 %</b> de chances de passer, quelle que soit la RÉS de la cible.",
    "Atelier 💠 : chaque sous-stat peut en plus être renforcée <b>5 fois</b> (+14 % à +30 % d'un jet à chaque fois), soit jusqu'à +1,5 jet de plus.",
    "<b>Runes ★6</b> : chaque jet de sous-stat vaut au minimum le meilleur jet d'une ★5 (VIT : 5 ou 6 ; PV % : 6 à 8), aussi à +3, +6, +9, +12 et à l'Atelier. Les ★6 déjà possédées ont été relevées.",
    "<b>Runes Arc-en-ciel ★7</b> : stat principale d'une ★6 <b>+15 %</b>. Un jet de sous-stat vaut au minimum le meilleur jet d'une ★5 et peut monter <b>un tiers au-dessus</b> du maximum d'une ★6 (VIT : 5 à 8 ; PV % : 6 à 11). Elles ne tombent qu'aux étages Arc-en-ciel."
  ],

  /* Où farmer chaque set (donjon → sets) */
  farmSets: [
    ["Repaire des Géants", "fire", ["energy", "guard", "swift", "blade", "focus"]],
    ["Antre du Dragon", "wind", ["fatal", "rage", "vampire", "violent", "endure"]],
    ["Nécropole", "dark", ["violent", "vampire", "despair", "shield", "revenge"]],
    ["Sanctuaire Magique", "light", ["will", "nemesis", "fight", "determination", "enhance", "accuracy", "tolerance"]]
  ],

  /* 6. Conseils runes */
  conseilsRunes: [
    "Les sets <b>4 pièces + 2 pièces</b> font le build. Les stats principales des emplacements <b>2, 4 et 6</b> comptent plus que tout le reste.",
    "Monte chaque rune à <b>+12 au minimum</b> : les sous-stats se débloquent ou grossissent à +3, +6, +9 et +12.",
    "Ne monte à +15 que les runes <b>Rares et Légendaires</b>. Vends les Normales (blanches) : elles n'ont aucune sous-stat.",
    "Dans le choix de rune d'un héros, utilise le tri par set <b>(★ Conseillés)</b> pour ne voir que les runes utiles.",
    "L'<b>Atelier 💠</b> permet de remplacer une mauvaise sous-stat ou de la renforcer (5 fois par sous-stat)."
  ],

  /* 7. Farm quotidien */
  farm: [
    ["Donjon du jour", "Pastille ×2 : mana doublé et 1 rune de plus par victoire. Tous les donjons sont en bonus le week-end."],
    ["Farm automatique", "×30 sur les donjons terminés et les étages d'Histoire à 3 étoiles ; ×20 dans un Sanctuaire dont tu as fini le niveau Légende."],
    ["Sanctuaires", "La meilleure source d'Essence d'EXP (2 éléments ouverts par jour)."]
  ],
  quotidien: ["Ration gratuite de la boutique ×2", "Roue du destin", "Coffre AFK", "Cadeaux d'amis", "5 combats d'arène (+5 ailes en boutique)"],
  hebdo: ["Labyrinthe (20 étapes, 30 à partir du niveau 50)", "Boss mondial", "Missions hebdomadaires"],
  mensuel: "Chaque 1er du mois : la Flèche d'Aethel repart de zéro.",

  /* 8. Invocations */
  invocations: [
    ["UR", "1 %", "#ff4d7a"], ["SSR", "3 %", "#ffd34a"], ["SR", "96 %", "#b88cff"]
  ],
  banniere: [
    ["Vedette", "Taux doublés pour le héros en vedette."],
    ["Univers", "Uniquement les héros de cet univers."],
    ["Pity", "Un SSR est garanti au 100ᵉ tirage sans SSR ni UR."],
    ["Rotation", "Les bannières changent chaque lundi."]
  ],
  astuceInvoc: "Garde tes tickets pour la bannière Vedette quand elle met en avant un héros qu'il te manque.",

  /* 9. Codes cadeaux : une ligne = un code. À saisir dans Réglages → Code cadeau (une fois chacun). */
  codes: [
    ["RENFORTS", "10 tickets + 600 cristaux", "Nouveau"],
    ["ULTRARARE", "60 fragments d'un UR au hasard"],
    ["BIENVENUE", "1 000 cristaux + 5 tickets"],
    ["STRAWHAT", "30 fragments d'un SSR au hasard + 50 000 mana"],
    ["TOWEROFGOD", "100 000 essence + 3 tickets"],
    ["KIRITO", "20 fragments d'un SSR au hasard + 500 cristaux"],
    ["SHADOWMONARCH", "10 tickets + 25 fragments d'un SSR au hasard"],
    ["LEGENDE", "40 fragments d'un SSR au hasard + 300 cristaux + 20 000 essence"]
  ],

  /* ===== Mise à jour « Ascension » ===== */
  nouveau: {
    nom: "Ascension",
    points: [
      ["modes", "Mode Difficile", "Les 12 chapitres de l'Histoire, en bien plus dur."],
      ["modes", "Tours d'univers", "4 tours de 40 étages, une par univers."],
      ["progres", "Esprits gardiens", "Un compagnon qui renforce toute l'équipe."],
      ["progres", "Liens de héros", "20 liens : bonus permanents si tu as tous les héros."],
      ["esprits", "Éveil forcé · niveau 60", "Deux exemplaires au rang max : le héros monte jusqu'au niveau 60."],
      ["modes", "Étages Arc-en-ciel", "Donjons 14 à 16 et runes ★7."],
      ["runes", "Outils de runes", "Vente auto, verrou, build sur mesure, ★6 à part."]
    ]
  },

  difficile: {
    acces: "Bouton « Mode Difficile » en haut de la liste des chapitres, ou Menu → Difficile.",
    regle: "Les 12 chapitres à refaire contre des ennemis <b>niveau 40</b>. Un chapitre s'ouvre quand il est fini en Normal <b>et</b> que le chapitre précédent est fini en Difficile.",
    gains: [
      ["Chaque victoire", "Poussière d'esprit (15 à 48, +25 sur le boss), mana, Essence d'EXP, et souvent une rune Rare ou Légendaire (2 sur le boss)."],
      ["1ʳᵉ victoire d'un étage", "40 cristaux (+15 avec 3 étoiles)."],
      ["Chapitre terminé", "5 fragments UR et 1 parchemin de compétence."]
    ],
    niveau: [["Chapitres 1 à 3", "Équipe niveau 40 bien runée."], ["Chapitres 9 à 12", "Héros UR très étoilés avec des runes ★6."]]
  },

  tours: {
    acces: "Menu Modes → Tours d'univers, ou Menu → Tours.",
    regle: "Seuls les héros de l'univers de la tour peuvent entrer. <b>Pas d'énergie</b> : tentatives illimitées. Un boss tous les 5 étages.",
    liste: [["Tour des Mers", "op"], ["Tour de Shinsu", "tog"], ["Tour d'Aincrad", "sao"], ["Tour des Ombres", "sl"]],
    paliers: [
      ["Tous les 5 étages", "5 fragments d'un héros SSR"],
      ["Étage 20", "10 fragments d'un héros UR"],
      ["Étage 30", "15 fragments d'un héros UR"],
      ["Étage 40", "25 fragments d'un héros UR"],
      ["Tous les 10 étages", "1 coffre légendaire"]
    ],
    note: "Récompenses de 1ʳᵉ victoire : cristaux, mana, Poussière d'esprit, et des fragments d'un héros <b>de cet univers</b>.",
    niveau: [["Étage 20", "Milieu de partie"], ["Étage 30", "Avec de bonnes runes"], ["Étage 40", "Fin de partie"]]
  },

  donjonsHaut: {
    legende: "Les étages <b>Légende 1, 2 et 3</b> sont nettement plus forts, avec une montée régulière. Légende 3 demande des <b>UR au rang maximum avec des runes ★6</b>.",
    arc: "3 étages au-dessus de Légende 3, avec des ennemis <b>niveau 60</b>. Prévus pour une équipe d'<b>UR en Éveil forcé (niveau 60)</b> avec de très bonnes runes ★6. Des UR niveau 40 ou des SSR niveau 60 n'y arrivent pas.",
    butin: "2 runes Légendaires à chaque victoire, <b>★6 au minimum</b>, avec une chance de rune <b>Arc-en-ciel ★7</b> par rune :",
    chances: [["Arc 1", "Étage 14", 20], ["Arc 2", "Étage 15", 32], ["Arc 3", "Étage 16", 45]]
  },

  eveil: {
    doublons: "Un doublon d'un héros déjà au rang maximum n'est plus changé en ticket ou en cristaux : il part dans le <b>Rangement</b> (carte « MAX ➜ Rangement »). Dans l'écran Éveil, quand ton héros principal est au rang max, ces doublons servent à monter un <b>2e exemplaire</b> du même héros.",
    etapes: [
      ["1", "Deux exemplaires", "Monte deux exemplaires du même héros au rang maximum (Arc-en-ciel 5★)."],
      ["2", "Éveil forcé", "Fiche du héros ou écran Éveil : bouton « Éveil forcé ». Tu choisis le héros gardé ; l'autre est sacrifié (ses runes reviennent dans ton inventaire)."],
      ["3", "Niveau 60", "Le héros gardé peut monter du niveau 40 au <b>niveau 60</b>. Sans Éveil forcé, le maximum reste 40."]
    ],
    exemple: "Exemple : une Uta UR au rang maximum gagne environ <b>+40 % d'ATQ</b> en passant du niveau 40 au niveau 60."
  },

  esprits: {
    acces: "Menu → Esprits",
    regle: "Un seul esprit accompagne l'équipe. Son bonus vaut pour <b>tous tes héros, dans tous les modes</b>.",
    cout: "Le 1er esprit est offert. Ensuite : <b>300</b> Poussière pour en invoquer un, <b>100 × niveau</b> pour l'améliorer (4 500 pour aller du niveau 1 au 10).",
    source: "Elle se gagne dans l'Histoire en mode Difficile et dans les Tours d'univers.",
    liste: [
      ["Braise", "Renard des flammes", "#ff6a3d", "ATQ +1 % par niveau", "Dég. Crit +10 %", "Vol de vie 8 %"],
      ["Ondine", "Esprit des marées", "#3fa7ff", "PV +1,2 % par niveau", "RÉS +10", "Bouclier d'équipe (10 % des PV)"],
      ["Zéphyr", "Aigle des tempêtes", "#e8c24a", "VIT +0,6 % par niveau", "Taux Crit +5 %", "8 % de chances de rejouer"],
      ["Lumen", "Cerf de lumière", "#fff3a8", "DÉF +1,2 % par niveau", "PRÉ +10", "Immunité au 1er tour"],
      ["Umbra", "Chat des ombres", "#b06cff", "Dég. Crit +2 % par niveau", "ATQ +4 %", "Contre-attaque 10 %"],
      ["Titan", "Tortue ancestrale", "#6ccf5a", "PV et DÉF +0,7 % par niveau", "RÉS +10", "Némésis"]
    ]
  },

  liens: {
    acces: "Menu → Liens (et bouton « Liens » sur la fiche d'un héros).",
    regle: "Posséder <b>tous</b> les héros d'un lien (même rangés) donne un bonus permanent à ces héros. Un héros peut cumuler plusieurs liens.",
    liste: [
      ["Les Chapeaux de Paille", ["luffy", "zoro", "sanji", "nami"], {atk: 6}],
      ["Médecins de bord", ["chopper", "law", "marco"], {hp: 8}],
      ["Frères de feu", ["luffy", "ace"], {cd: 12}],
      ["Grands corsaires", ["mihawk", "hancock", "jinbe"], {def: 8}],
      ["Les Empereurs", ["shanks", "yamato", "uta"], {hp: 6, res: 8}],
      ["Trio de la Tour", ["bam", "khun", "rak"], {atk: 6, spd: 2}],
      ["Princesses de Zahard", ["yuri", "endorsi", "anaak"], {cr: 6}],
      ["Rangs de haut niveau", ["evankhell", "yuhansung", "quant", "urek"], {atk: 7}],
      ["Ombres de la Tour", ["rachel", "white", "hatz"], {cd: 12}],
      ["Régulières", ["shibisu", "laure", "hatz"], {hp: 7}],
      ["Les Clearers", ["kirito", "asuna", "klein", "agil"], {atk: 6}],
      ["Chevaliers de l'Intégrité", ["alice", "eugeo", "quinella"], {def: 8, res: 6}],
      ["Amies d'Aincrad", ["silica", "lisbeth", "sachi", "argo"], {hp: 8}],
      ["Famille", ["kirito", "asuna", "yui"], {spd: 3}],
      ["Tireuses et fées", ["sinon", "leafa", "yuuki"], {cr: 6}],
      ["Armée des Ombres", ["jinwoo", "beru", "igris", "bellion"], {atk: 7}],
      ["Chasseurs de rang S", ["cha", "baek", "choi", "min", "limtaegyu"], {atk: 5, hp: 5}],
      ["Les Monarques", ["antares", "sillad", "jinwoo"], {cd: 15}],
      ["Piliers de l'Association", ["gunhee", "yoo", "thomas"], {def: 8}],
      ["Clan des démons", ["esil", "igris"], {cr: 5}]
    ]
  },

  outilsRunes: [
    ["Vente automatique", "Au lancement d'un farm : « Automatique » ou « Je choisis moi-même », et le bouton <b>Règles</b> (catégories à vendre, emplacements 2 / 4 / 6 à stat fixe — jamais une ★6 —, sets à toujours garder). Aussi dans l'inventaire : bouton « Vente auto ». Une rune équipée n'est jamais vendue."],
    ["Légendaires ★6 à part", "Étiquette rose « Légendaire ★6 », séparée des ★5 dans les filtres, le choix de rune, la vente rapide et les règles. Le tri « Rareté » met les ★6 en premier."],
    ["Verrou de runes", "Fiche du héros, onglet Runes : « Verrouiller ses runes ». Plus personne ne peut retirer, remplacer ou lui prendre une rune. Tu peux toujours les regarder et les améliorer."],
    ["Build sur mesure", "Fiche du héros, onglet Runes : indique des minimums de stats et les sets voulus, puis « Chercher ». Jusqu'à 5 builds trouvés dans ton inventaire, avec un bouton « Équiper ». Option pour utiliser aussi les runes des autres héros (jamais celles d'un héros verrouillé)."]
  ]
};
