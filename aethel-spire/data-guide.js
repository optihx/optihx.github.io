/* ==========================================================
   AETHEL SPIRE — GUIDE DU JOUEUR (d'après GUIDE-DU-JOUEUR.txt du jeu)
   Builds de runes, équipes conseillées, valeurs des runes, astuces, codes.
   ========================================================== */
window.GUIDE = {
  maj: "9 octobre 2026",

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
    fin: "Les étages 11 à 13 (légendaires) restent prévus pour des héros très étoilés ou des UR."
  },

  /* 5. Valeurs des runes */
  etoiles: ["★6", "★5", "★4", "★3", "★2"],
  categories: [["Normale", "★2", "#e6e8ef"], ["Basique", "★3", "#5fd38d"], ["Rare", "★4", "#a77bff"], ["Légendaire", "★5", "#f2a33d"], ["Légendaire d'élite", "★6", "#ff6b8b"]],
  principale: [
    ["PV", 2448, 1860, 1544, 1228, 930], ["ATQ", 160, 135, 112, 89, 68], ["DÉF", 160, 135, 112, 89, 68],
    ["PV %", "63 %", "51 %", "42 %", "34 %", "26 %"], ["ATQ %", "63 %", "51 %", "42 %", "34 %", "26 %"], ["DÉF %", "63 %", "51 %", "42 %", "34 %", "26 %"],
    ["VIT", 42, 39, 32, 26, 20], ["Taux Crit %", "58 %", "47 %", "39 %", "31 %", "24 %"], ["Dég. Crit %", "80 %", "65 %", "54 %", "43 %", "33 %"],
    ["RÉS %", "64 %", "51 %", "42 %", "34 %", "26 %"], ["PRÉ %", "64 %", "51 %", "42 %", "34 %", "26 %"]
  ],
  emplacements: [
    [1, ["ATQ"]], [2, ["ATQ", "ATQ %", "DÉF", "DÉF %", "PV", "PV %", "VIT"]], [3, ["DÉF"]],
    [4, ["ATQ %", "DÉF %", "PV %", "Taux Crit %", "Dég. Crit %"]], [5, ["PV"]], [6, ["ATQ %", "DÉF %", "PV %", "RÉS %", "PRÉ %"]]
  ],
  sousStats: [
    ["PV", 375, 300, 249, 198, 150], ["PV %", "8 %", "6 %", "5 %", "4 %", "3 %"], ["ATQ", 20, 16, 13, 11, 8], ["ATQ %", "8 %", "6 %", "5 %", "4 %", "3 %"],
    ["DÉF", 20, 16, 13, 11, 8], ["DÉF %", "8 %", "6 %", "5 %", "4 %", "3 %"], ["VIT", 6, 5, 4, 3, 2], ["Taux Crit %", "6 %", "5 %", "4 %", "3 %", "2 %"],
    ["Dég. Crit %", "7 %", "6 %", "5 %", "4 %", "3 %"], ["RÉS %", "8 %", "6 %", "5 %", "4 %", "3 %"], ["PRÉ %", "8 %", "6 %", "5 %", "4 %", "3 %"]
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
    "Atelier 💠 : chaque sous-stat peut en plus être renforcée <b>5 fois</b> (+14 % à +30 % d'un jet à chaque fois), soit jusqu'à +1,5 jet de plus."
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
  ]
};
