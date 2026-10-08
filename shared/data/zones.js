// Les trois zones du Lot 8, à l'est du Marais du Lag (x ≥ 80) : Parking → Supermarché → Pôle Emploi, reliés par la route de la porte sud.
// Les monstres sont dans mobs.js, les quêtes dans quests.js, les donjons dans dungeons.js.
export const NEW_ZONES={
  parking:{n:"Le Parking du Lycée",s:"Niveaux 15–25 · Les places réservées le sont toujours pour quelqu'un d'autre"},
  supermarche:{n:"Le Supermarché à 21 h 58",s:"Niveaux 25–40 · Fermeture dans deux minutes. Depuis 2011."},
  pole:{n:"Le Pôle Emploi Mystique",s:"Niveaux 40–55 · Votre conseiller est absent. Votre avenir aussi."}
};
// [type, nombre, x0, x1, y0, y1] : mêmes rectangles que SPAWNS, à l'intérieur de chaque zone.
export const NEW_SPAWNS=[
  ['delegue',8,84,116,2,17],['scooter',7,84,116,2,17],['souvenir',6,84,116,2,17],
  ['caddie',8,84,115,24,35],['vigile',6,84,115,24,35],['promo',7,84,115,24,35],
  ['cerfa',8,84,115,44,55],['file',6,84,115,44,55],['conseillerabs',7,84,115,44,55],
];
const npc=(id,n,tag,ti,x,y,greet,extra={})=>({id,kind:'npc',n,tag,ti,x,y,hgt:1.2,greet,lines:[],...extra});
export const NEW_NPCS=[
  npc('panneau_parking',"Panneau du Parking",'Bienvenue','Parking du Lycée · Niveaux 15–25',82.6,10.2,"PARKING DU LYCÉE. Stationnement interdit aux élèves, aux profs, et à tous ceux qui ont un avis sur le stationnement. Danger : ex-délégués de classe, scooters débridés, souvenirs gênants.",{look:'sign'}),
  npc('cpe',"Le CPE Éternel","Vie scolaire",'Vie scolaire · Il est là depuis la 6e',87.5,10.2,"Ah, un élève. Tu n'es pas inscrit ? Tu es inscrit depuis 2008, ça se voit à ton carnet. Je suis le CPE. Je l'ai toujours été. Je serai CPE quand le lycée sera une ruine, et il l'est déjà."),
  npc('porte_bac',"Salle d'Examen 2012","Donjon : Le Bac de 2012",'Donjon · Le Bac de 2012 · 4 difficultés',110.5,10.2,"La porte de la salle d'examen. De l'autre côté : le Bac de 2012, éternellement en cours. Posez vos stylos. Non, ne les posez pas, vous en aurez besoin.",{look:'door',dungeon:'bac'}),
  npc('panneau_supermarche',"Panneau du Supermarché","Horaires",'Supermarché · Niveaux 25–40',97.5,24.6,"SUPERMARCHÉ. Ouvert de 8 h à 21 h 58. Fermeture à 22 h 00 précises, sauf si vous avez un caddie dans les mains, auquel cas jamais. Pas d'animaux, pas de panique.",{look:'sign'}),
  npc('caissiere',"La Caissière de la Caisse 12","Caisse 12",'Caisse 12 · La seule ouverte',92.5,35.4,"Caisse 12. C'est la seule d'ouverte. Il y a vingt-trois caisses. Je ne sais pas non plus. Vous avez la carte ? Vous voulez un sac ? Vous voulez que je vous parle de ma vie ? Non ? Très bien."),
  npc('porte_reserve',"Porte « Réservé au Personnel »","Donjon : La Réserve",'Donjon · La Réserve · 4 difficultés',114.6,29.4,"« RÉSERVÉ AU PERSONNEL ». Elle est entrouverte. Derrière, des palettes, des cartons, et un gérant qui regarde l'horloge. Il est 21 h 58. Il sera toujours 21 h 58.",{look:'door',dungeon:'reserve'}),
  npc('panneau_pole',"Panneau du Pôle Emploi","Accueil",'Pôle Emploi Mystique · Niveaux 40–55',97.5,44.8,"VEUILLEZ PRENDRE UN TICKET. Votre numéro : 4 812. Numéro en cours : 3. Temps d'attente estimé : le destin. Les formulaires Cerfa sont vivants : ne leur tournez pas le dos.",{look:'sign'}),
  npc('mystique',"Le Conseiller Mystique","Avenir professionnel",'Voyant · Prédit votre avenir professionnel',99.2,52.2,"Je vois... je vois... un bureau. Des écrans. Un ticket. Oui, c'est bien ça : votre avenir professionnel est une file d'attente. Je ne me trompe jamais. Je ne me suis jamais trompé. Je n'ai jamais rien prédit qui se soit réalisé, mais je ne me trompe jamais."),
  npc('porte_labyrinthe',"Guichet d'Accueil","Donjon : Le Labyrinthe Administratif",'Donjon · Le Labyrinthe Administratif · 4 difficultés',112.6,51.4,"Guichet d'Accueil. Derrière : un labyrinthe de couloirs, de cases à cocher et de pièces justificatives. On y entre facilement. On en ressort avec un formulaire, un jour.",{look:'door',dungeon:'labyrinthe'}),
];
