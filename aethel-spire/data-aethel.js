/* ==========================================================
   AETHEL SPIRE — DONNÉES DU GUIDE (le seul fichier à modifier pour mettre le guide à jour)
   Les chiffres viennent des simulations (tools/sim.js du jeu) : héros niv. 40, IA en AUTO.
   « best » = runes ★6 légendaires +15 · « basic » = runes ★5 rares +9.

   Classes (cl) : tank, healer, phys, mage, portee, assassin
   Rareté (ra)  : UR, SSR, SR (vide si pas encore précisé)
   ========================================================== */
window.AETHEL = {
  maj: "8 octobre 2026",

  /* CODES CADEAUX : une ligne = un code. Pour en retirer un, supprime sa ligne. */
  codes: [
    ["BIENVENUE", "1 000 cristaux + 5 tickets"],
    ["STRAWHAT", "30 fragments d'un SSR au hasard + 50 000 mana"],
    ["TOWEROFGOD", "100 000 essence + 3 tickets"],
    ["KIRITO", "20 fragments d'un SSR au hasard + 500 cristaux"],
    ["SHADOWMONARCH", "10 tickets + 25 fragments d'un SSR au hasard"],
    ["LEGENDE", "40 fragments d'un SSR au hasard + 300 cristaux + 20 000 essence"],
    ["ULTRARARE", "60 fragments d'un UR"]
  ],

  classes: {
    tank:     { nom: "Tank",             ico: "bouclier", coul: "#4aa3ff",
                passif: "Dégâts subis −10 % (+0,3 % par point de RÉS, max −35 %). Ses coups ajoutent 40 % de sa DÉF à son ATQ.",
                stats: "PV %, DÉF %, RÉS", cle: "RÉS", objectif: "RÉS 70+ · PV 25 000+" },
    healer:   { nom: "Healer",           ico: "soin",     coul: "#4fd18b",
                passif: "Soins +20 %, l'ATQ ajoute 50 % de sa valeur aux soins.",
                stats: "VIT, PV %, ATQ %", cle: "VIT", objectif: "VIT 120+" },
    phys:     { nom: "DPS physique",     ico: "epee",     coul: "#ff6a5f",
                passif: "+10 % Taux Crit, +20 % Dég. Crit, ignore 15 % de DÉF.",
                stats: "Taux Crit, Dég. Crit, ATQ %", cle: "Taux Crit · Dég. Crit", objectif: "Crit 75–100 % · Dég. Crit 150+" },
    mage:     { nom: "DPS magique",      ico: "orbe",     coul: "#a77bff",
                passif: "Ignore 40 % de DÉF, debuffs +15 % de réussite.",
                stats: "ATQ %, PRÉ, VIT", cle: "PRÉ", objectif: "PRÉ 60+" },
    portee:   { nom: "DPS longue portée", ico: "arc",     coul: "#38c6e0",
                passif: "L'attaque de base touche 2 cibles ; +0,5 % de dégâts par point de PRÉ.",
                stats: "ATQ %, PRÉ, VIT", cle: "PRÉ", objectif: "PRÉ 80–100 (= +40–50 % de dégâts)" },
    assassin: { nom: "Assassin",         ico: "dague",    coul: "#f2b33d",
                passif: "+0,5 % de dégâts par point de VIT au-dessus de 100 ; +25 % sur un ennemi sous 40 % PV ; démarre avec de la jauge.",
                stats: "VIT, Taux Crit, ATQ %", cle: "VIT", objectif: "VIT 130–150" }
  },

  /* Tier list : t = tier, n = note */
  heros: [
    { id: "yuri",    nom: "Yuri Zahard",      cl: "healer",   ra: "UR",  t: "S", n: "100 % de réussite à l'étage 9, meilleur soutien du jeu." },
    { id: "uta",     nom: "Uta",              cl: "healer",   ra: "UR",  t: "S", n: "Comme Yuri ; son Lead donne VIT +15 % et RÉS +20 % à toute l'équipe." },
    { id: "bam",     nom: "Bam",              cl: "assassin", ra: "UR",  t: "S", n: "Meilleurs dégâts de l'Arène (~870k)." },
    { id: "jinwoo",  nom: "Sung Jinwoo",      cl: "assassin", ra: "UR",  t: "S", n: "~830k, fait chuter les boss très vite." },
    { id: "asuna",   nom: "Asuna",            cl: "assassin", ra: "UR",  t: "S", n: "~770k, VIT énorme." },
    { id: "kirito",  nom: "Kirito",           cl: "phys",     ra: "UR",  t: "S", n: "97 % à l'étage 9 : crit + survie." },
    { id: "antares", nom: "Antares",          cl: "mage",     ra: "UR",  t: "S", n: "98 % à l'étage 9, ignore la DÉF." },

    { id: "hatz",    nom: "Hatz",             cl: "tank",     ra: "SR",  t: "A", n: "Meilleur tank : debuff DÉF Ténèbres sur toute l'équipe." },
    { id: "agil",    nom: "Agil",             cl: "tank",     ra: "SR",  t: "A", n: "Comme Hatz." },
    { id: "yamato",  nom: "Yamato",           cl: "tank",     ra: "UR",  t: "A", n: "Plus grosses stats du jeu (PV 15 000 / DÉF 870 sans runes)." },
    { id: "law",     nom: "Trafalgar Law",    cl: "healer",   ra: "SSR", t: "A", n: "Très bon soutien SSR." },
    { id: "cha",     nom: "Cha Hae-In",       cl: "assassin", ra: "SSR", t: "A", n: "~685k." },
    { id: "yuuki",   nom: "Yuuki Konno",      cl: "assassin", ra: "SSR", t: "A", n: "~730k." },
    { id: "khun",    nom: "Khun Aguero Agnis", cl: "mage",    ra: "SSR", t: "A", n: "97 % à l'étage 9." },
    { id: "ace",     nom: "Portgas D. Ace",   cl: "mage",     ra: "SSR", t: "A", n: "Saignement de feu." },
    { id: "zoro",    nom: "Roronoa Zoro",     cl: "phys",     ra: "SSR", t: "A", n: "~690k, très gros dégâts." },
    { id: "sinon",   nom: "Sinon",            cl: "portee",   ra: "SSR", t: "A", n: "Meilleur archer." },
    { id: "luffy",   nom: "Luffy",            cl: "phys",     ra: "SSR", t: "A", n: "Solide, un peu moins explosif." },
    { id: "beru",    nom: "Beru",             cl: "phys",     ra: "SSR", t: "A", n: "Solide, un peu moins explosif." },
    { id: "baek",    nom: "Baek",             cl: "phys",     ra: "SSR", t: "A", n: "Solide, un peu moins explosif." },

    { id: "igris",   nom: "Igris",            cl: "tank",     ra: "", t: "B" },
    { id: "eugeo",   nom: "Eugeo",            cl: "tank",     ra: "", t: "B" },
    { id: "shanks",  nom: "Shanks",           cl: "tank",     ra: "", t: "B" },
    { id: "endorsi", nom: "Endorsi",          cl: "healer",   ra: "", t: "B" },
    { id: "leafa",   nom: "Leafa",            cl: "healer",   ra: "", t: "B" },
    { id: "nami",    nom: "Nami",             cl: "mage",     ra: "SR", t: "B" },
    { id: "choi",    nom: "Choi Jong-In",     cl: "mage",     ra: "", t: "B" },
    { id: "rachel",  nom: "Rachel",           cl: "mage",     ra: "", t: "B" },
    { id: "hancock",     nom: "Boa Hancock",      cl: "portee",   ra: "", t: "B" },
    { id: "anaak",   nom: "Anaak",            cl: "portee",   ra: "", t: "B" },
    { id: "rak",     nom: "Rak",              cl: "phys",     ra: "", t: "B" },
    { id: "klein",   nom: "Klein",            cl: "phys",     ra: "", t: "B" },

    { id: "silica",  nom: "Silica",           cl: "healer",   ra: "", t: "C" },
    { id: "shibisu", nom: "Shibisu",          cl: "portee",   ra: "", t: "C" },
    { id: "urek",    nom: "Urek",             cl: "phys",     ra: "", t: "C" },
    { id: "thomas",   nom: "Thomas André",     cl: "phys",     ra: "", t: "C" },
    { id: "gunhee",  nom: "Go Gunhee",        cl: "mage",     ra: "", t: "C" },
    { id: "yoo",   nom: "Yoo Jinho",        cl: "tank",     ra: "", t: "C" },
    { id: "sanji",   nom: "Sanji",            cl: "assassin", ra: "SR", t: "C" },
    { id: "alice",   nom: "Alice",            cl: "tank",     ra: "SSR", t: "C" }
  ],
  tiers: {
    S: "Les meilleurs du jeu : à monter en priorité.",
    A: "Très bons, souvent indispensables pour compléter l'équipe.",
    B: "Corrects : de bons remplaçants en attendant mieux.",
    C: "Utiles en début de jeu, remplacés ensuite."
  },

  /* Équipes : m = membres (le 1er est le chef), arene en milliers, d9/d10 = [best, basic] en % */
  equipes: [
    { l: "H", m: ["uta", "yamato", "antares", "kirito"], arene: 575,  d9: [100, 92], d10: [88, 0], role: "Meilleure équipe donjon : Trinité + variée, ultra stable.", top: "donjon" },
    { l: "K", m: ["yuri", "yamato", "antares", "bam"],   arene: 820,  d9: [100, 78], d10: [85, 0], role: "Très polyvalente (dégâts + survie)." },
    { l: "B", m: ["uta", "yamato", "kirito", "bam"],     arene: 851,  d9: [98, 42],  d10: [82, 0], role: "Tout UR, dégâts élevés." },
    { l: "F", m: ["yuri", "agil", "antares", "anaak"],   arene: 524,  d9: [100, 62], d10: [68, 0], role: "Peu de dégâts mais sûre." },
    { l: "L", m: ["uta", "agil", "bam", "kirito"],       arene: 892,  d9: [100, 22], d10: [53, 0], role: "Tank SR + 2 gros DPS." },
    { l: "D", m: ["yuri", "bam", "jinwoo", "asuna"],     arene: 1342, d9: [92, 0],   d10: [0, 0],  role: "Meilleure Arène sûre (soin + 3 assassins).", top: "arene" },
    { l: "C", m: ["bam", "jinwoo", "asuna", "kirito"],   arene: 1417, d9: [7, 0],    d10: [0, 0],  role: "Dégâts maximum, mais fragile (pas de soin)." },
    { l: "G", m: ["law", "hatz", "zoro", "yuuki"],       arene: 612,  d9: [90, 2],   d10: [5, 0],  role: "Équipe sans UR." },
    { l: "M", m: ["endorsi", "igris", "rachel", "cha"],  arene: 605,  d9: [90, 0],   d10: [7, 0],  role: "Équipe « budget » SR/SSR." },
    { l: "E", m: ["leafa", "igris", "yuuki", "cha"],     arene: 781,  d9: [67, 0],   d10: [0, 0],  role: "Insuffisante pour les derniers étages." }
  ],
  conseils: [
    ["Farm de runes (donjons)", "Équipe <b>H</b> (ou K). Un Tank + un Healer + 2 DPS de classes différentes déclenche <i>Trinité</i> + <i>Équipe variée</i>."],
    ["Arène d'entraînement (Essence)", "Équipe <b>D</b> (assassins + soin). Le colosse riposte : sans healer on perd des héros."],
    ["Donjon des fragments", "Même équipe que l'Arène ; le Gardien frappe 35 % plus fort."],
    ["Début de jeu", "Équipe <b>M</b>, puis remplace au fil des invocations (Hatz, Agil, Law restent des valeurs sûres)."],
    ["Le chef", "Mets en 1ᵉʳ un héros dont le Lead profite à l'équipe (VIT pour tout le monde avec Sanji, Nami ou Baek en SR)."]
  ],

  synergies: [
    ["Trinité", "Tank + Healer + DPS", "PV / DÉF +8 %"],
    ["Assaut", "3 DPS ou plus", "ATQ +10 %"],
    ["Équipe variée", "4 classes différentes", "VIT +8 %"]
  ],
  elements: [
    ["Ténèbres", "#9b7bff", "−DÉF ennemie"],
    ["Feu", "#ff6a4d", "Saignement"],
    ["Eau", "#3fa9ff", "Ralentissement"],
    ["Vent / Lumière", "#9be35a", "Bonus personnels"]
  ],

  /* Runes par classe : emplacements 1, 3, 5 fixes (ATQ, DÉF, PV plats) */
  runes: {
    tank:     { sets: ["Garde", "Énergie", "Endurance (ou Bouclier)"], e2: "PV %", e4: "DÉF %", e6: "RÉS", sous: ["RÉS", "PV %", "DÉF %", "VIT"] },
    healer:   { sets: ["Rapidité (4)", "Énergie ou Volonté"], e2: "VIT", e4: "PV %", e6: "PV %", sous: ["VIT", "PV %", "ATQ %", "RÉS"] },
    phys:     { sets: ["Lame, Rage ou Fatal (4)", "Violent"], e2: "ATQ %", e4: "Dég. Crit", e6: "ATQ %", sous: ["Taux Crit", "Dég. Crit", "ATQ %", "VIT"] },
    mage:     { sets: ["Fatal (4)", "Focus ou Désespoir"], e2: "ATQ %", e4: "ATQ %", e6: "PRÉ", sous: ["ATQ %", "PRÉ", "VIT", "Dég. Crit"] },
    portee:   { sets: ["Fatal (4)", "Précision ou Focus"], e2: "ATQ %", e4: "Taux Crit", e6: "PRÉ", sous: ["PRÉ", "ATQ %", "VIT"] },
    assassin: { sets: ["Rapidité (4) ou Lame", "Violent"], e2: "VIT", e4: "Taux Crit", e6: "ATQ %", sous: ["VIT", "Taux Crit", "Dég. Crit"] }
  },
  setsEquipe: [["Combat", "ATQ +7 %"], ["Détermination", "DÉF +7 %"], ["Amélioration", "PV +7 %"]],
  setsEffet: [
    ["Violent", "22 % de chances de tour bonus, redoutable sur les assassins."],
    ["Vampire", "Vol de vie, bon sur les DPS qui encaissent."],
    ["Volonté", "Immunité au 1ᵉʳ tour, utile sur le healer."],
    ["Bouclier", "Bouclier pour toute l'équipe."],
    ["Désespoir", "Chance d'étourdir."],
    ["Némésis", "Gagne de la jauge en subissant des coups."]
  ],
  priorites: [
    "Prends d'abord les <b>4 pièces du set</b> (Rapidité, Fatal, Rage…), puis complète avec un set de 2 pièces.",
    "Les <b>runes ★6 +15 légendaires</b> viennent des étages 8 à 10 des donjons : c'est ce qui rend l'étage 10 possible.",
    "Améliore (+3 / +6 / +9 / +12) : à chaque palier, une sous-stat est ajoutée ou renforcée.",
    "Dans la fiche du héros, le panneau <b>« Runes conseillées »</b> s'allume en vert quand tu portes un bon set."
  ],

  /* Donjons de runes */
  etages: [
    [6, 26, "Équipe correcte, quelques runes."],
    [7, 30, "Runes ★5 +9 sur une équipe de classes variées."],
    [8, 34, "Healer indispensable."],
    [9, 38, "Runes ★6 / sets complets (4 pièces)."],
    [10, 40, "Héros niveau 40 + équipe forte + runes ★6 +15 bien choisies."]
  ],
  resultats10: [
    [85, "avec les meilleures runes", true],
    [0, "avec des runes ★5 +9", false],
    [0, "avec une équipe sans UR, même bien équipée", false]
  ]
};
