// Les classes ne sont que des données : modificateurs de stats, liste de 5 compétences (la 4e est toujours Canette Tiède) et détail de sprite.
// Le comportement d'une compétence est dans shared/sim.js, indexé par son id ; ici, seulement ce que l'interface et les règles doivent lire.
// self : se lance sans cible ; ally : cible un joueur ; sinon cible un ennemi. r : rayon d'effet. rg : portée.
export const SKILL_DEFS={
  tip:{n:"Tip du Fedora",l:1,cd:1.4,c:0,rg:1.6,d:"Soulève le fedora avec une courtoisie offensive. Inflige 100 % de l'Attaque. Coûte 1 point de Dignité. Se lance automatiquement au contact."},
  enfait:{n:"« En fait... »",l:2,cd:7,c:15,rg:4.5,d:"Entame un monologue non sollicité de 14 paragraphes. Inflige 150 % de l'Attaque et étourdit la cible 2,5 s."},
  copypasta:{n:"Copypasta",l:3,cd:10,c:22,rg:5,d:"Colle un pavé de 4 000 caractères sur la cible et tout ce qui se trouve à 2 cases. 55 % de l'Attaque par seconde pendant 5 s."},
  canette:{n:"Canette Tiède",l:1,cd:18,c:0,self:1,d:"Boit une boisson énergisante ouverte depuis mardi. Rend 35 % des PV et 30 Caféine."},
  ragequit:{n:"Rage Quit",l:5,cd:40,c:0,self:1,d:"Alt+F4 émotionnel. Après 1,5 s d'incantation, vous ramène au Sous-Sol de Maman (ou à l'entrée du donjon)."},

  d20:{n:"Lancer de d20",l:1,cd:1.6,c:0,rg:5,d:"Jette un dé sur l'ennemi. Dégâts aléatoires de 60 à 140 % de l'Attaque. Sur un 20 naturel (5 %), dégâts doublés et cris de joie."},
  relance:{n:"Relance de dés",l:2,cd:6,c:20,rg:6,ally:1,d:"« Je relance ! » Soigne l'allié ciblé (ou vous-même) de 220 % de l'Attaque."},
  fiche:{n:"Fiche de Perso",l:3,cd:14,c:30,r:4,self:1,d:"Distribue des fiches de perso fraîchement équilibrées : soin sur la durée (25 % de l'Attaque par seconde, 6 s) pour tous les alliés à 4 cases."},
  joker:{n:"Joker MJ",l:5,cd:120,c:40,rg:5,ally:1,d:"Le MJ est d'humeur clémente. Ressuscite un allié mort à portée avec 40 % de ses PV."},

  frame:{n:"Frame Perfect",l:1,cd:.8,c:0,rg:1.6,d:"Une entrée au pixel près. Inflige 70 % de l'Attaque. Se lance automatiquement au contact."},
  skipcine:{n:"Skip de Cinématique",l:2,cd:8,c:15,rg:6,d:"Appuie sur Échap pendant la cinématique de l'ennemi : vous apparaissez derrière lui. Votre prochain coup est critique."},
  anypct:{n:"Any%",l:3,cd:25,c:25,self:1,d:"Plus rien ne compte sauf la vitesse. +40 % de vitesse d'attaque pendant 6 s."},
  glitch:{n:"Glitch de Collision",l:5,cd:45,c:0,self:1,d:"Vous traversez le décor, et les coups aussi. Invulnérable 2 s."},

  avertissement:{n:"Avertissement",l:1,cd:1.6,c:0,rg:1.8,d:"« Dernier avertissement. » Inflige 100 % de l'Attaque et génère une forte menace."},
  ban:{n:"Ban Temporaire",l:2,cd:12,c:20,r:3,self:1,d:"Étourdit tous les ennemis à 3 cases pendant 3 s. Les boss, eux, sont seulement ralentis (ils ont fait appel)."},
  lock:{n:"Verrouiller le Topic",l:3,cd:20,c:25,r:8,self:1,d:"Tous les ennemis à 8 cases ne pensent plus qu'à vous pendant 6 s. Le débat est clos."},
  reglement:{n:"Règlement Épinglé",l:5,cd:45,c:0,self:1,d:"Article 1 : vous ne subissez pas de dégâts. Enfin, 50 % de moins, pendant 5 s."}
};

export const CLASSES={
  chouffin:{nom:"Chouffin",desc:"Tank verbal, DPS de monologue. La classe de départ de ceux qui n'ont jamais lu l'écran de choix.",mods:{hp:1,atk:1,arm:1,spd:1},skills:['tip','enfait','copypasta','canette','ragequit']},
  roliste:{nom:"Rôliste",desc:"Soigne par jets de dés, quand les dés veulent bien. Cape de série, esprit d'équipe optionnel.",mods:{hp:1,atk:1,arm:1,spd:1},skills:['d20','relance','fiche','canette','joker']},
  speedrunner:{nom:"Speedrunner",desc:"Finit le jeu avant que vous ayez fini le tutoriel. Courir plus vite, c'est aussi fuir ses responsabilités.",mods:{hp:1,atk:1,arm:1,spd:1.25},skills:['frame','skipcine','anypct','canette','glitch']},
  modo:{nom:"Modo Repenti",desc:"A banni 4 000 membres, puis s'est calmé. Encaisse tout, sauf les critiques.",mods:{hp:1.3,atk:1,arm:1.2,spd:1},skills:['avertissement','ban','lock','canette','reglement']}
};
export const DEFAULT_CLASS='chouffin';
export const CLASS_COST=50; // po par niveau, au Conseiller d'Orientation
